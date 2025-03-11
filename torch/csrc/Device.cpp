#include <torch/csrc/Device.h>

#include <torch/csrc/Exceptions.h>
#include <torch/csrc/utils/object_ptr.h>
#include <torch/csrc/utils/pybind.h>
#include <torch/csrc/utils/python_arg_parser.h>
#include <torch/csrc/utils/python_numbers.h>
#include <torch/csrc/utils/python_strings.h>

#include <ATen/Device.h>
#include <c10/util/Exception.h>

#include <structmember.h>
#include <limits>
#include <sstream>

// NOLINTNEXTLINE(cppcoreguidelines-avoid-non-const-global-variables)
static PyObject* THPUpperModuleOfDevice = nullptr;

PyObject* THPDevice_New(const at::Device& device) {
  auto type = (PyTypeObject*)&THPDeviceType;
  auto self = THPObjectPtr{type->tp_alloc(type, 0)};
  if (!self)
    throw python_error();
  auto self_ = reinterpret_cast<THPDevice*>(self.get());
  self_->device = device;
  self_->context = nullptr;
  return self.release();
}

static PyObject* THPDevice_repr(THPDevice* self) {
  std::ostringstream oss;
  oss << "device(type=\'" << self->device.type() << "\'";
  if (self->device.has_index()) {
    // `self->device.index()` returns uint8_t which is treated as ascii while
    // printing, hence casting it to uint16_t.
    // https://stackoverflow.com/questions/19562103/uint8-t-cant-be-printed-with-cout
    oss << ", index=" << static_cast<uint16_t>(self->device.index());
  }
  oss << ")";
  return THPUtils_packString(oss.str().c_str());
}

static PyObject* THPDevice_str(THPDevice* self) {
  std::ostringstream oss;
  oss << self->device;
  return THPUtils_packString(oss.str().c_str());
}

static PyObject* THPDevice_pynew(
    PyTypeObject* type,
    PyObject* args,
    PyObject* kwargs) {
  HANDLE_TH_ERRORS
  static torch::PythonArgParser parser(
      {"device(Device device)",
       "device(std::string_view type, int64_t? index=-1)"});
  torch::ParsedArgs<2> parsed_args;
  auto r = parser.parse(args, kwargs, parsed_args);
  if (r.has_torch_function()) {
    return handle_torch_function(
        r, nullptr, args, kwargs, THPUpperModuleOfDevice, "torch");
  }
  if (r.idx == 0) {
    auto device = r.device(0);
    return THPDevice_New(device);
  } else if (r.idx == 1) {
    auto as_device = r.device(0); // this works, because device can take strings
    if (as_device.has_index()) {
      auto device_type = r.string(0);
      throw std::runtime_error(
          "type (string) must not include an index because index "
          "was passed explicitly: " +
          device_type);
    }
    int64_t device_index = -1;
    if (!r.isNone(1)) {
      device_index = r.toInt64(1);
      // -1 is allowed in ATen/C++, to mean the default device, but not in
      // Python.
      TORCH_CHECK(device_index >= 0, "Device index must not be negative");
    }
    at::Device device(
        as_device.type(), static_cast<c10::DeviceIndex>(device_index));
    return THPDevice_New(device);
  }
  Py_RETURN_NONE;
  END_HANDLE_TH_ERRORS
}

static PyObject* THPDevice_type(THPDevice* self, PyObject* noargs) {
  HANDLE_TH_ERRORS
  std::ostringstream oss;
  oss << self->device.type();
  return THPUtils_packString(oss.str().c_str());
  Py_RETURN_NONE;
  END_HANDLE_TH_ERRORS
}

static PyObject* THPDevice_index(THPDevice* self, PyObject* noargs) {
  HANDLE_TH_ERRORS
  if (self->device.has_index()) {
    return THPUtils_packInt64(self->device.index());
  } else {
    Py_RETURN_NONE;
  }
  END_HANDLE_TH_ERRORS
}

static Py_ssize_t THPDevice_hash(THPDevice* self) {
  HANDLE_TH_ERRORS
  return static_cast<Py_ssize_t>(
      std::hash<at::Device>{}(self->device) %
      std::numeric_limits<Py_ssize_t>::max());
  END_HANDLE_TH_ERRORS_RET(-1)
}

static PyObject* THPDevice_rc(PyObject* a, PyObject* b, int op) {
  HANDLE_TH_ERRORS
  if (!THPDevice_Check(a) || !THPDevice_Check(b)) {
    // Py_RETURN_NOTIMPLEMENTED not in python 2.
    Py_INCREF(Py_NotImplemented);
    return Py_NotImplemented;
  }
  THPDevice* da = reinterpret_cast<THPDevice*>(a);
  THPDevice* db = reinterpret_cast<THPDevice*>(b);

  switch (op) {
    case Py_EQ:
      if (da->device == db->device) {
        Py_RETURN_TRUE;
      } else {
        Py_RETURN_FALSE;
      }
    case Py_NE:
      if (da->device == db->device) {
        Py_RETURN_FALSE;
      } else {
        Py_RETURN_TRUE;
      }
    case Py_LT:
    case Py_LE:
    case Py_GT:
    case Py_GE:
      throw torch::TypeError("comparison not implemented");
    default:
      throw torch::TypeError("unexpected comparison op");
  }
  END_HANDLE_TH_ERRORS
}

static PyObject* THPDevice_reduce(PyObject* _self, PyObject* noargs) {
  HANDLE_TH_ERRORS
  auto self = (THPDevice*)_self;
  auto ret = THPObjectPtr{PyTuple_New(2)};
  if (!ret)
    throw python_error();

  py::object torch_module = py::module::import("torch");
  py::object torch_device = torch_module.attr("device");
  PyTuple_SET_ITEM(ret.get(), 0, torch_device.release().ptr());

  THPObjectPtr args;
  std::ostringstream oss;
  oss << self->device.type();
  if (self->device.has_index()) {
    args = THPObjectPtr{Py_BuildValue(
        "(si)", oss.str().c_str(), static_cast<int>(self->device.index()))};
  } else {
    args = THPObjectPtr{Py_BuildValue("(s)", oss.str().c_str())};
  }
  if (!args)
    throw python_error();
  PyTuple_SET_ITEM(ret.get(), 1, args.release());

  return ret.release();
  END_HANDLE_TH_ERRORS
}

static PyObject* THPDevice_enter(PyObject* _self, PyObject* noargs) {
  HANDLE_TH_ERRORS
  py::object mode = py::module::import("torch.utils._device")
                        .attr("DeviceContext")(py::handle(_self));
  at::impl::PythonTorchFunctionTLS::push_onto_stack(
      std::make_shared<c10::SafePyObject>(
          mode.release().ptr(), getPyInterpreter()));
  auto self = (THPDevice*)_self;
  if (at::accelerator::isAccelerator(self->device.type()) &&
      self->device.has_index()) {
    c10::DeviceIndex cur_device_idx = at::accelerator::getDeviceIndex();
    at::accelerator::setDeviceIndex(self->device.index());
    auto ctx_device_index =
        THPObjectPtr(THPUtils_packDeviceIndex(cur_device_idx));
    TORCH_CHECK(
        !(self->context), "Device's context should not be initialized.");
    auto dict = THPObjectPtr(PyDict_New());
    if (!dict) {
      throw python_error();
    }
    self->context = dict.release();
    if (PyDict_SetItemString(
            self->context, "_ctx_device_index", ctx_device_index.get()) < 0) {
      throw python_error();
    }
  }
  // So that with torch.device('cuda') as dev: works
  Py_INCREF(_self);
  return _self;
  END_HANDLE_TH_ERRORS
}

static PyObject* THPDevice_exit(PyObject* _self, PyObject* unused) {
  HANDLE_TH_ERRORS
  at::impl::PythonTorchFunctionTLS::pop_stack();
  auto self = (THPDevice*)_self;
  if (at::accelerator::isAccelerator(self->device.type()) &&
      self->device.has_index()) {
    PyObject* py_device_index = nullptr;
    if (PyDict_GetItemStringRef(
            self->context, "_ctx_device_index", &py_device_index) < 0) {
      throw python_error();
    }
    auto ctx_device_index = THPObjectPtr(py_device_index);
    TORCH_INTERNAL_ASSERT(
        ctx_device_index.get(),
        "ctx_device_index should be present on the context dict.");
    auto prev_device_index = THPUtils_unpackDeviceIndex(ctx_device_index.get());
    at::accelerator::setDeviceIndex(prev_device_index);
    Py_CLEAR(self->context);
  }
  Py_RETURN_NONE;
  END_HANDLE_TH_ERRORS
}

/*
// TODO: We're not sure if this is a good idea or not, because making
// torch.device callable means that it will start returning true
// for callable() queries, and that is unexpected.  We can always add
// this later, so for now, don't actually implement this.
static PyObject* THPDevice_call(
    PyObject* self,
    PyObject* args,
    PyObject* kwargs) {
  HANDLE_TH_ERRORS
  py::object deco =
      py::module::import("torch.utils._device").attr("device_decorator");
  return deco(py::handle(self), *py::handle(args), **py::handle(kwargs))
      .release()
      .ptr();
  END_HANDLE_TH_ERRORS
}
*/

typedef PyObject* (*getter)(PyObject*, void*);

// NB: If you edit these properties/methods, update torch/_C/__init__.pyi.in

static const std::initializer_list<PyGetSetDef> THPDevice_properties = {
    {"type", (getter)THPDevice_type, nullptr, nullptr, nullptr},
    {"index", (getter)THPDevice_index, nullptr, nullptr, nullptr},
    {nullptr}};

static const std::initializer_list<PyMethodDef> THPDevice_methods = {
    {"__reduce__", THPDevice_reduce, METH_NOARGS, nullptr},
    {"__enter__", THPDevice_enter, METH_NOARGS, nullptr},
    {"__exit__", THPDevice_exit, METH_VARARGS, nullptr},
    {nullptr} /* Sentinel */
};

PyTypeObject THPDeviceType = {
    PyVarObject_HEAD_INIT(nullptr, 0)
    "torch.device", /* tp_name */
    sizeof(THPDevice), /* tp_basicsize */
    0, /* tp_itemsize */
    nullptr, /* tp_dealloc */
    0, /* tp_vectorcall_offset */
    nullptr, /* tp_getattr */
    nullptr, /* tp_setattr */
    nullptr, /* tp_reserved */
    (reprfunc)THPDevice_repr, /* tp_repr */
    nullptr, /* tp_as_number */
    nullptr, /* tp_as_sequence */
    nullptr, /* tp_as_mapping */
    (hashfunc)THPDevice_hash, /* tp_hash  */
    // TODO: We're not sure if this is a good idea or not, because making
    // torch.device callable means that it will start returning true
    // for callable() queries, and that is unexpected.  We can always add
    // this later, so for now, don't actually implement this
    // THPDevice_call, /* tp_call */
    nullptr, /* tp_call */
    (reprfunc)THPDevice_str, /* tp_str */
    nullptr, /* tp_getattro */
    nullptr, /* tp_setattro */
    nullptr, /* tp_as_buffer */
    Py_TPFLAGS_DEFAULT, /* tp_flags */
    nullptr, /* tp_doc */
    nullptr, /* tp_traverse */
    nullptr, /* tp_clear */
    (richcmpfunc)THPDevice_rc, /* tp_richcompare */
    0, /* tp_weaklistoffset */
    nullptr, /* tp_iter */
    nullptr, /* tp_iternext */
    // NOLINTNEXTLINE(*const-cast)
    const_cast<PyMethodDef*>(std::data(THPDevice_methods)), /* tp_methods */
    nullptr, /* tp_members */
    // NOLINTNEXTLINE(*const-cast)
    const_cast<PyGetSetDef*>(std::data(THPDevice_properties)), /* tp_getset */
    nullptr, /* tp_base */
    nullptr, /* tp_dict */
    nullptr, /* tp_descr_get */
    nullptr, /* tp_descr_set */
    0, /* tp_dictoffset */
    nullptr, /* tp_init */
    nullptr, /* tp_alloc */
    THPDevice_pynew, /* tp_new */
};

void THPDevice_init(PyObject* module) {
  if (PyType_Ready(&THPDeviceType) < 0) {
    throw python_error();
  }
  Py_INCREF(&THPDeviceType);
  THPUpperModuleOfDevice = module;
  if (PyModule_AddObject(module, "device", (PyObject*)&THPDeviceType) != 0) {
    throw python_error();
  }
}
