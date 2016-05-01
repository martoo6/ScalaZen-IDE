(function(){
'use strict';
/* Scala.js runtime support
 * Copyright 2013 LAMP/EPFL
 * Author: Sébastien Doeraene
 */

/* ---------------------------------- *
 * The top-level Scala.js environment *
 * ---------------------------------- */





// Get the environment info
var $env = (typeof __ScalaJSEnv === "object" && __ScalaJSEnv) ? __ScalaJSEnv : {};

// Global scope
var $g =
  (typeof $env["global"] === "object" && $env["global"])
    ? $env["global"]
    : ((typeof global === "object" && global && global["Object"] === Object) ? global : this);
$env["global"] = $g;

// Where to send exports
var $e =
  (typeof $env["exportsNamespace"] === "object" && $env["exportsNamespace"])
    ? $env["exportsNamespace"] : $g;
$env["exportsNamespace"] = $e;

// Freeze the environment info
$g["Object"]["freeze"]($env);

// Linking info - must be in sync with scala.scalajs.runtime.LinkingInfo
var $linkingInfo = {
  "semantics": {




    "asInstanceOfs": 1,










    "moduleInit": 2,





    "strictFloats": false,




    "productionMode": false

  },



  "assumingES6": false

};
$g["Object"]["freeze"]($linkingInfo);
$g["Object"]["freeze"]($linkingInfo["semantics"]);

// Snapshots of builtins and polyfills






var $imul = $g["Math"]["imul"] || (function(a, b) {
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
  var ah = (a >>> 16) & 0xffff;
  var al = a & 0xffff;
  var bh = (b >>> 16) & 0xffff;
  var bl = b & 0xffff;
  // the shift by 0 fixes the sign on the high part
  // the final |0 converts the unsigned value into a signed value
  return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
});

var $fround = $g["Math"]["fround"] ||









  (function(v) {
    return +v;
  });


var $clz32 = $g["Math"]["clz32"] || (function(i) {
  // See Hacker's Delight, Section 5-3
  if (i === 0) return 32;
  var r = 1;
  if ((i & 0xffff0000) === 0) { i <<= 16; r += 16; };
  if ((i & 0xff000000) === 0) { i <<= 8; r += 8; };
  if ((i & 0xf0000000) === 0) { i <<= 4; r += 4; };
  if ((i & 0xc0000000) === 0) { i <<= 2; r += 2; };
  return r + (i >> 31);
});


// Other fields

















var $lastIDHash = 0; // last value attributed to an id hash code



var $idHashCodeMap = $g["WeakMap"] ? new $g["WeakMap"]() : null;



// Core mechanism

var $makeIsArrayOfPrimitive = function(primitiveData) {
  return function(obj, depth) {
    return !!(obj && obj.$classData &&
      (obj.$classData.arrayDepth === depth) &&
      (obj.$classData.arrayBase === primitiveData));
  }
};


var $makeAsArrayOfPrimitive = function(isInstanceOfFunction, arrayEncodedName) {
  return function(obj, depth) {
    if (isInstanceOfFunction(obj, depth) || (obj === null))
      return obj;
    else
      $throwArrayCastException(obj, arrayEncodedName, depth);
  }
};


/** Encode a property name for runtime manipulation
  *  Usage:
  *    env.propertyName({someProp:0})
  *  Returns:
  *    "someProp"
  *  Useful when the property is renamed by a global optimizer (like Closure)
  *  but we must still get hold of a string of that name for runtime
  * reflection.
  */
var $propertyName = function(obj) {
  for (var prop in obj)
    return prop;
};

// Runtime functions

var $isScalaJSObject = function(obj) {
  return !!(obj && obj.$classData);
};


var $throwClassCastException = function(instance, classFullName) {




  throw new $c_sjsr_UndefinedBehaviorError().init___jl_Throwable(
    new $c_jl_ClassCastException().init___T(
      instance + " is not an instance of " + classFullName));

};

var $throwArrayCastException = function(instance, classArrayEncodedName, depth) {
  for (; depth; --depth)
    classArrayEncodedName = "[" + classArrayEncodedName;
  $throwClassCastException(instance, classArrayEncodedName);
};


var $noIsInstance = function(instance) {
  throw new $g["TypeError"](
    "Cannot call isInstance() on a Class representing a raw JS trait/object");
};

var $makeNativeArrayWrapper = function(arrayClassData, nativeArray) {
  return new arrayClassData.constr(nativeArray);
};

var $newArrayObject = function(arrayClassData, lengths) {
  return $newArrayObjectInternal(arrayClassData, lengths, 0);
};

var $newArrayObjectInternal = function(arrayClassData, lengths, lengthIndex) {
  var result = new arrayClassData.constr(lengths[lengthIndex]);

  if (lengthIndex < lengths.length-1) {
    var subArrayClassData = arrayClassData.componentData;
    var subLengthIndex = lengthIndex+1;
    var underlying = result.u;
    for (var i = 0; i < underlying.length; i++) {
      underlying[i] = $newArrayObjectInternal(
        subArrayClassData, lengths, subLengthIndex);
    }
  }

  return result;
};

var $objectToString = function(instance) {
  if (instance === void 0)
    return "undefined";
  else
    return instance.toString();
};

var $objectGetClass = function(instance) {
  switch (typeof instance) {
    case "string":
      return $d_T.getClassOf();
    case "number": {
      var v = instance | 0;
      if (v === instance) { // is the value integral?
        if ($isByte(v))
          return $d_jl_Byte.getClassOf();
        else if ($isShort(v))
          return $d_jl_Short.getClassOf();
        else
          return $d_jl_Integer.getClassOf();
      } else {
        if ($isFloat(instance))
          return $d_jl_Float.getClassOf();
        else
          return $d_jl_Double.getClassOf();
      }
    }
    case "boolean":
      return $d_jl_Boolean.getClassOf();
    case "undefined":
      return $d_sr_BoxedUnit.getClassOf();
    default:
      if (instance === null)
        return instance.getClass__jl_Class();
      else if ($is_sjsr_RuntimeLong(instance))
        return $d_jl_Long.getClassOf();
      else if ($isScalaJSObject(instance))
        return instance.$classData.getClassOf();
      else
        return null; // Exception?
  }
};

var $objectClone = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.clone__O();
  else
    throw new $c_jl_CloneNotSupportedException().init___();
};

var $objectNotify = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notify__V();
};

var $objectNotifyAll = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notifyAll__V();
};

var $objectFinalize = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    instance.finalize__V();
  // else no-op
};

var $objectEquals = function(instance, rhs) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.equals__O__Z(rhs);
  else if (typeof instance === "number")
    return typeof rhs === "number" && $numberEquals(instance, rhs);
  else
    return instance === rhs;
};

var $numberEquals = function(lhs, rhs) {
  return (lhs === rhs) ? (
    // 0.0.equals(-0.0) must be false
    lhs !== 0 || 1/lhs === 1/rhs
  ) : (
    // are they both NaN?
    (lhs !== lhs) && (rhs !== rhs)
  );
};

var $objectHashCode = function(instance) {
  switch (typeof instance) {
    case "string":
      return $m_sjsr_RuntimeString$().hashCode__T__I(instance);
    case "number":
      return $m_sjsr_Bits$().numberHashCode__D__I(instance);
    case "boolean":
      return instance ? 1231 : 1237;
    case "undefined":
      return 0;
    default:
      if ($isScalaJSObject(instance) || instance === null)
        return instance.hashCode__I();

      else if ($idHashCodeMap === null)
        return 42;

      else
        return $systemIdentityHashCode(instance);
  }
};

var $comparableCompareTo = function(instance, rhs) {
  switch (typeof instance) {
    case "string":

      $as_T(rhs);

      return instance === rhs ? 0 : (instance < rhs ? -1 : 1);
    case "number":

      $as_jl_Number(rhs);

      return $m_jl_Double$().compare__D__D__I(instance, rhs);
    case "boolean":

      $asBoolean(rhs);

      return instance - rhs; // yes, this gives the right result
    default:
      return instance.compareTo__O__I(rhs);
  }
};

var $charSequenceLength = function(instance) {
  if (typeof(instance) === "string")

    return $uI(instance["length"]);



  else
    return instance.length__I();
};

var $charSequenceCharAt = function(instance, index) {
  if (typeof(instance) === "string")

    return $uI(instance["charCodeAt"](index)) & 0xffff;



  else
    return instance.charAt__I__C(index);
};

var $charSequenceSubSequence = function(instance, start, end) {
  if (typeof(instance) === "string")

    return $as_T(instance["substring"](start, end));



  else
    return instance.subSequence__I__I__jl_CharSequence(start, end);
};

var $booleanBooleanValue = function(instance) {
  if (typeof instance === "boolean") return instance;
  else                               return instance.booleanValue__Z();
};

var $numberByteValue = function(instance) {
  if (typeof instance === "number") return (instance << 24) >> 24;
  else                              return instance.byteValue__B();
};
var $numberShortValue = function(instance) {
  if (typeof instance === "number") return (instance << 16) >> 16;
  else                              return instance.shortValue__S();
};
var $numberIntValue = function(instance) {
  if (typeof instance === "number") return instance | 0;
  else                              return instance.intValue__I();
};
var $numberLongValue = function(instance) {
  if (typeof instance === "number")
    return $m_sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong(instance);
  else
    return instance.longValue__J();
};
var $numberFloatValue = function(instance) {
  if (typeof instance === "number") return $fround(instance);
  else                              return instance.floatValue__F();
};
var $numberDoubleValue = function(instance) {
  if (typeof instance === "number") return instance;
  else                              return instance.doubleValue__D();
};

var $isNaN = function(instance) {
  return instance !== instance;
};

var $isInfinite = function(instance) {
  return !$g["isFinite"](instance) && !$isNaN(instance);
};

var $doubleToInt = function(x) {
  return (x > 2147483647) ? (2147483647) : ((x < -2147483648) ? -2147483648 : (x | 0));
};

/** Instantiates a JS object with variadic arguments to the constructor. */
var $newJSObjectWithVarargs = function(ctor, args) {
  // This basically emulates the ECMAScript specification for 'new'.
  var instance = $g["Object"]["create"](ctor.prototype);
  var result = ctor["apply"](instance, args);
  switch (typeof result) {
    case "string": case "number": case "boolean": case "undefined": case "symbol":
      return instance;
    default:
      return result === null ? instance : result;
  }
};

var $resolveSuperRef = function(initialProto, propName) {
  var getPrototypeOf = $g["Object"]["getPrototypeOf"];
  var getOwnPropertyDescriptor = $g["Object"]["getOwnPropertyDescriptor"];

  var superProto = getPrototypeOf(initialProto);
  while (superProto !== null) {
    var desc = getOwnPropertyDescriptor(superProto, propName);
    if (desc !== void 0)
      return desc;
    superProto = getPrototypeOf(superProto);
  }

  return void 0;
};

var $superGet = function(initialProto, self, propName) {
  var desc = $resolveSuperRef(initialProto, propName);
  if (desc !== void 0) {
    var getter = desc["get"];
    if (getter !== void 0)
      return getter["call"](self);
    else
      return desc["value"];
  }
  return void 0;
};

var $superSet = function(initialProto, self, propName, value) {
  var desc = $resolveSuperRef(initialProto, propName);
  if (desc !== void 0) {
    var setter = desc["set"];
    if (setter !== void 0) {
      setter["call"](self, value);
      return void 0;
    }
  }
  throw new $g["TypeError"]("super has no setter '" + propName + "'.");
};

var $propertiesOf = function(obj) {
  var result = [];
  for (var prop in obj)
    result["push"](prop);
  return result;
};

var $systemArraycopy = function(src, srcPos, dest, destPos, length) {
  var srcu = src.u;
  var destu = dest.u;
  if (srcu !== destu || destPos < srcPos || srcPos + length < destPos) {
    for (var i = 0; i < length; i++)
      destu[destPos+i] = srcu[srcPos+i];
  } else {
    for (var i = length-1; i >= 0; i--)
      destu[destPos+i] = srcu[srcPos+i];
  }
};

var $systemIdentityHashCode =

  ($idHashCodeMap !== null) ?

  (function(obj) {
    switch (typeof obj) {
      case "string": case "number": case "boolean": case "undefined":
        return $objectHashCode(obj);
      default:
        if (obj === null) {
          return 0;
        } else {
          var hash = $idHashCodeMap["get"](obj);
          if (hash === void 0) {
            hash = ($lastIDHash + 1) | 0;
            $lastIDHash = hash;
            $idHashCodeMap["set"](obj, hash);
          }
          return hash;
        }
    }

  }) :
  (function(obj) {
    if ($isScalaJSObject(obj)) {
      var hash = obj["$idHashCode$0"];
      if (hash !== void 0) {
        return hash;
      } else if (!$g["Object"]["isSealed"](obj)) {
        hash = ($lastIDHash + 1) | 0;
        $lastIDHash = hash;
        obj["$idHashCode$0"] = hash;
        return hash;
      } else {
        return 42;
      }
    } else if (obj === null) {
      return 0;
    } else {
      return $objectHashCode(obj);
    }

  });

// is/as for hijacked boxed classes (the non-trivial ones)

var $isByte = function(v) {
  return (v << 24 >> 24) === v && 1/v !== 1/-0;
};

var $isShort = function(v) {
  return (v << 16 >> 16) === v && 1/v !== 1/-0;
};

var $isInt = function(v) {
  return (v | 0) === v && 1/v !== 1/-0;
};

var $isFloat = function(v) {



  return typeof v === "number";

};


var $asUnit = function(v) {
  if (v === void 0 || v === null)
    return v;
  else
    $throwClassCastException(v, "scala.runtime.BoxedUnit");
};

var $asBoolean = function(v) {
  if (typeof v === "boolean" || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Boolean");
};

var $asByte = function(v) {
  if ($isByte(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Byte");
};

var $asShort = function(v) {
  if ($isShort(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Short");
};

var $asInt = function(v) {
  if ($isInt(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Integer");
};

var $asFloat = function(v) {
  if ($isFloat(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Float");
};

var $asDouble = function(v) {
  if (typeof v === "number" || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Double");
};


// Unboxes


var $uZ = function(value) {
  return !!$asBoolean(value);
};
var $uB = function(value) {
  return $asByte(value) | 0;
};
var $uS = function(value) {
  return $asShort(value) | 0;
};
var $uI = function(value) {
  return $asInt(value) | 0;
};
var $uJ = function(value) {
  return null === value ? $m_sjsr_RuntimeLong$().Zero$1
                        : $as_sjsr_RuntimeLong(value);
};
var $uF = function(value) {
  /* Here, it is fine to use + instead of fround, because asFloat already
   * ensures that the result is either null or a float.
   */
  return +$asFloat(value);
};
var $uD = function(value) {
  return +$asDouble(value);
};






// TypeArray conversions

var $byteArray2TypedArray = function(value) { return new $g["Int8Array"](value.u); };
var $shortArray2TypedArray = function(value) { return new $g["Int16Array"](value.u); };
var $charArray2TypedArray = function(value) { return new $g["Uint16Array"](value.u); };
var $intArray2TypedArray = function(value) { return new $g["Int32Array"](value.u); };
var $floatArray2TypedArray = function(value) { return new $g["Float32Array"](value.u); };
var $doubleArray2TypedArray = function(value) { return new $g["Float64Array"](value.u); };

var $typedArray2ByteArray = function(value) {
  var arrayClassData = $d_B.getArrayOf();
  return new arrayClassData.constr(new $g["Int8Array"](value));
};
var $typedArray2ShortArray = function(value) {
  var arrayClassData = $d_S.getArrayOf();
  return new arrayClassData.constr(new $g["Int16Array"](value));
};
var $typedArray2CharArray = function(value) {
  var arrayClassData = $d_C.getArrayOf();
  return new arrayClassData.constr(new $g["Uint16Array"](value));
};
var $typedArray2IntArray = function(value) {
  var arrayClassData = $d_I.getArrayOf();
  return new arrayClassData.constr(new $g["Int32Array"](value));
};
var $typedArray2FloatArray = function(value) {
  var arrayClassData = $d_F.getArrayOf();
  return new arrayClassData.constr(new $g["Float32Array"](value));
};
var $typedArray2DoubleArray = function(value) {
  var arrayClassData = $d_D.getArrayOf();
  return new arrayClassData.constr(new $g["Float64Array"](value));
};

/* We have to force a non-elidable *read* of $e, otherwise Closure will
 * eliminate it altogether, along with all the exports, which is ... er ...
 * plain wrong.
 */
this["__ScalaJSExportsNamespace"] = $e;

// TypeData class


/** @constructor */
var $TypeData = function() {




  // Runtime support
  this.constr = void 0;
  this.parentData = void 0;
  this.ancestors = null;
  this.componentData = null;
  this.arrayBase = null;
  this.arrayDepth = 0;
  this.zero = null;
  this.arrayEncodedName = "";
  this._classOf = void 0;
  this._arrayOf = void 0;
  this.isArrayOf = void 0;

  // java.lang.Class support
  this["name"] = "";
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = false;
  this["isRawJSType"] = false;
  this["isInstance"] = void 0;
};


$TypeData.prototype.initPrim = function(



    zero, arrayEncodedName, displayName) {
  // Runtime support
  this.ancestors = {};
  this.componentData = null;
  this.zero = zero;
  this.arrayEncodedName = arrayEncodedName;
  this.isArrayOf = function(obj, depth) { return false; };

  // java.lang.Class support
  this["name"] = displayName;
  this["isPrimitive"] = true;
  this["isInstance"] = function(obj) { return false; };

  return this;
};


$TypeData.prototype.initClass = function(



    internalNameObj, isInterface, fullName,
    ancestors, isRawJSType, parentData, isInstance, isArrayOf) {
  var internalName = $propertyName(internalNameObj);

  isInstance = isInstance || function(obj) {
    return !!(obj && obj.$classData && obj.$classData.ancestors[internalName]);
  };

  isArrayOf = isArrayOf || function(obj, depth) {
    return !!(obj && obj.$classData && (obj.$classData.arrayDepth === depth)
      && obj.$classData.arrayBase.ancestors[internalName])
  };

  // Runtime support
  this.parentData = parentData;
  this.ancestors = ancestors;
  this.arrayEncodedName = "L"+fullName+";";
  this.isArrayOf = isArrayOf;

  // java.lang.Class support
  this["name"] = fullName;
  this["isInterface"] = isInterface;
  this["isRawJSType"] = !!isRawJSType;
  this["isInstance"] = isInstance;

  return this;
};


$TypeData.prototype.initArray = function(



    componentData) {
  // The constructor

  var componentZero0 = componentData.zero;

  // The zero for the Long runtime representation
  // is a special case here, since the class has not
  // been defined yet, when this file is read
  var componentZero = (componentZero0 == "longZero")
    ? $m_sjsr_RuntimeLong$().Zero$1
    : componentZero0;


  /** @constructor */
  var ArrayClass = function(arg) {
    if (typeof(arg) === "number") {
      // arg is the length of the array
      this.u = new Array(arg);
      for (var i = 0; i < arg; i++)
        this.u[i] = componentZero;
    } else {
      // arg is a native array that we wrap
      this.u = arg;
    }
  }
  ArrayClass.prototype = new $h_O;
  ArrayClass.prototype.constructor = ArrayClass;

  ArrayClass.prototype.clone__O = function() {
    if (this.u instanceof Array)
      return new ArrayClass(this.u["slice"](0));
    else
      // The underlying Array is a TypedArray
      return new ArrayClass(new this.u.constructor(this.u));
  };

























  ArrayClass.prototype.$classData = this;

  // Don't generate reflective call proxies. The compiler special cases
  // reflective calls to methods on scala.Array

  // The data

  var encodedName = "[" + componentData.arrayEncodedName;
  var componentBase = componentData.arrayBase || componentData;
  var arrayDepth = componentData.arrayDepth + 1;

  var isInstance = function(obj) {
    return componentBase.isArrayOf(obj, arrayDepth);
  }

  // Runtime support
  this.constr = ArrayClass;
  this.parentData = $d_O;
  this.ancestors = {O: 1, jl_Cloneable: 1, Ljava_io_Serializable: 1};
  this.componentData = componentData;
  this.arrayBase = componentBase;
  this.arrayDepth = arrayDepth;
  this.zero = null;
  this.arrayEncodedName = encodedName;
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = undefined;

  // java.lang.Class support
  this["name"] = encodedName;
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = true;
  this["isInstance"] = isInstance;

  return this;
};


$TypeData.prototype.getClassOf = function() {



  if (!this._classOf)
    this._classOf = new $c_jl_Class().init___jl_ScalaJSClassData(this);
  return this._classOf;
};


$TypeData.prototype.getArrayOf = function() {



  if (!this._arrayOf)
    this._arrayOf = new $TypeData().initArray(this);
  return this._arrayOf;
};

// java.lang.Class support


$TypeData.prototype["getFakeInstance"] = function() {



  if (this === $d_T)
    return "some string";
  else if (this === $d_jl_Boolean)
    return false;
  else if (this === $d_jl_Byte ||
           this === $d_jl_Short ||
           this === $d_jl_Integer ||
           this === $d_jl_Float ||
           this === $d_jl_Double)
    return 0;
  else if (this === $d_jl_Long)
    return $m_sjsr_RuntimeLong$().Zero$1;
  else if (this === $d_sr_BoxedUnit)
    return void 0;
  else
    return {$classData: this};
};


$TypeData.prototype["getSuperclass"] = function() {



  return this.parentData ? this.parentData.getClassOf() : null;
};


$TypeData.prototype["getComponentType"] = function() {



  return this.componentData ? this.componentData.getClassOf() : null;
};


$TypeData.prototype["newArrayOfThisClass"] = function(lengths) {



  var arrayClassData = this;
  for (var i = 0; i < lengths.length; i++)
    arrayClassData = arrayClassData.getArrayOf();
  return $newArrayObject(arrayClassData, lengths);
};




// Create primitive types

var $d_V = new $TypeData().initPrim(undefined, "V", "void");
var $d_Z = new $TypeData().initPrim(false, "Z", "boolean");
var $d_C = new $TypeData().initPrim(0, "C", "char");
var $d_B = new $TypeData().initPrim(0, "B", "byte");
var $d_S = new $TypeData().initPrim(0, "S", "short");
var $d_I = new $TypeData().initPrim(0, "I", "int");
var $d_J = new $TypeData().initPrim("longZero", "J", "long");
var $d_F = new $TypeData().initPrim(0.0, "F", "float");
var $d_D = new $TypeData().initPrim(0.0, "D", "double");

// Instance tests for array of primitives

var $isArrayOf_Z = $makeIsArrayOfPrimitive($d_Z);
$d_Z.isArrayOf = $isArrayOf_Z;

var $isArrayOf_C = $makeIsArrayOfPrimitive($d_C);
$d_C.isArrayOf = $isArrayOf_C;

var $isArrayOf_B = $makeIsArrayOfPrimitive($d_B);
$d_B.isArrayOf = $isArrayOf_B;

var $isArrayOf_S = $makeIsArrayOfPrimitive($d_S);
$d_S.isArrayOf = $isArrayOf_S;

var $isArrayOf_I = $makeIsArrayOfPrimitive($d_I);
$d_I.isArrayOf = $isArrayOf_I;

var $isArrayOf_J = $makeIsArrayOfPrimitive($d_J);
$d_J.isArrayOf = $isArrayOf_J;

var $isArrayOf_F = $makeIsArrayOfPrimitive($d_F);
$d_F.isArrayOf = $isArrayOf_F;

var $isArrayOf_D = $makeIsArrayOfPrimitive($d_D);
$d_D.isArrayOf = $isArrayOf_D;


// asInstanceOfs for array of primitives
var $asArrayOf_Z = $makeAsArrayOfPrimitive($isArrayOf_Z, "Z");
var $asArrayOf_C = $makeAsArrayOfPrimitive($isArrayOf_C, "C");
var $asArrayOf_B = $makeAsArrayOfPrimitive($isArrayOf_B, "B");
var $asArrayOf_S = $makeAsArrayOfPrimitive($isArrayOf_S, "S");
var $asArrayOf_I = $makeAsArrayOfPrimitive($isArrayOf_I, "I");
var $asArrayOf_J = $makeAsArrayOfPrimitive($isArrayOf_J, "J");
var $asArrayOf_F = $makeAsArrayOfPrimitive($isArrayOf_F, "F");
var $asArrayOf_D = $makeAsArrayOfPrimitive($isArrayOf_D, "D");

/** @constructor */
function $c_O() {
  /*<skip>*/
}
/** @constructor */
function $h_O() {
  /*<skip>*/
}
$h_O.prototype = $c_O.prototype;
$c_O.prototype.init___ = (function() {
  return this
});
$c_O.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_O.prototype.toString__T = (function() {
  var jsx$2 = $objectGetClass(this).getName__T();
  var i = this.hashCode__I();
  var x = $uD((i >>> 0));
  var jsx$1 = x.toString(16);
  return ((jsx$2 + "@") + $as_T(jsx$1))
});
$c_O.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
$c_O.prototype.toString = (function() {
  return this.toString__T()
});
function $is_O(obj) {
  return (obj !== null)
}
function $as_O(obj) {
  return obj
}
function $isArrayOf_O(obj, depth) {
  var data = (obj && obj.$classData);
  if ((!data)) {
    return false
  } else {
    var arrayDepth = (data.arrayDepth || 0);
    return ((!(arrayDepth < depth)) && ((arrayDepth > depth) || (!data.arrayBase.isPrimitive)))
  }
}
function $asArrayOf_O(obj, depth) {
  return (($isArrayOf_O(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Object;", depth))
}
var $d_O = new $TypeData().initClass({
  O: 0
}, false, "java.lang.Object", {
  O: 1
}, (void 0), (void 0), $is_O, $isArrayOf_O);
$c_O.prototype.$classData = $d_O;
function $is_sc_GenTraversableOnce(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenTraversableOnce)))
}
function $as_sc_GenTraversableOnce(obj) {
  return (($is_sc_GenTraversableOnce(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenTraversableOnce"))
}
function $isArrayOf_sc_GenTraversableOnce(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenTraversableOnce)))
}
function $asArrayOf_sc_GenTraversableOnce(obj, depth) {
  return (($isArrayOf_sc_GenTraversableOnce(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenTraversableOnce;", depth))
}
function $s_Lmain_lib_BasicCanvas$class__$$init$__Lmain_lib_BasicCanvas__V($$this) {
  $$this.canvasData$1 = $m_Lmain_lib_DefaultCanvas$().canvasData$1;
  $$this.meshMaterial$1 = $$this.canvasData$1.meshMaterial$1;
  $$this.scene$1 = $$this.canvasData$1.scene$1;
  $$this.camera$1 = $$this.canvasData$1.camera$1;
  $$this.renderer$1 = $$this.canvasData$1.renderer$1;
  $$this.clock$1 = $$this.canvasData$1.clock$1;
  $$this.body$1 = $$this.canvasData$1.body$1;
  $$this.composer$1 = new $g.THREE.EffectComposer($$this.renderer$1)
}
function $is_Lmain_lib_Canvas(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lmain_lib_Canvas)))
}
function $as_Lmain_lib_Canvas(obj) {
  return (($is_Lmain_lib_Canvas(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "main.lib.Canvas"))
}
function $isArrayOf_Lmain_lib_Canvas(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lmain_lib_Canvas)))
}
function $asArrayOf_Lmain_lib_Canvas(obj, depth) {
  return (($isArrayOf_Lmain_lib_Canvas(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lmain.lib.Canvas;", depth))
}
/** @constructor */
function $c_Lmain_lib_Canvas$Setup$() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_Lmain_lib_Canvas$Setup$.prototype = new $h_O();
$c_Lmain_lib_Canvas$Setup$.prototype.constructor = $c_Lmain_lib_Canvas$Setup$;
/** @constructor */
function $h_Lmain_lib_Canvas$Setup$() {
  /*<skip>*/
}
$h_Lmain_lib_Canvas$Setup$.prototype = $c_Lmain_lib_Canvas$Setup$.prototype;
$c_Lmain_lib_Canvas$Setup$.prototype.init___Lmain_lib_Canvas = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
$c_Lmain_lib_Canvas$Setup$.prototype.noClear__Lmain_lib_Canvas$Setup$ = (function() {
  this.$$outer$1.clearObjectsAction$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$4$2) {
    $asUnit(x$4$2)
  }));
  return this
});
$c_Lmain_lib_Canvas$Setup$.prototype.antialiasing__Lmain_lib_Canvas$Setup$ = (function() {
  this.$$outer$1.composer$1.addPass(new $g.THREE.RenderPass(this.$$outer$1.scene$1, this.$$outer$1.camera$1));
  var effect = new $g.THREE.ShaderPass($g.THREE.FXAAShader);
  var jsx$2 = effect.uniforms.resolution.value;
  var this$1 = this.$$outer$1;
  var jsx$1 = $s_Lmain_lib_WorldCoordinates$class__width__Lmain_lib_WorldCoordinates__I(this$1);
  var this$2 = this.$$outer$1;
  jsx$2.set((1.0 / jsx$1), (1.0 / $s_Lmain_lib_WorldCoordinates$class__height__Lmain_lib_WorldCoordinates__I(this$2)));
  effect.renderToScreen = true;
  this.$$outer$1.composer$1.addPass(effect);
  this.$$outer$1.renderAction$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(arg$outer) {
    return (function(x$5$2) {
      $asUnit(x$5$2);
      arg$outer.$$outer$1.composer$1.render(1.0)
    })
  })(this));
  return this
});
$c_Lmain_lib_Canvas$Setup$.prototype.asCanvas__Lmain_lib_Canvas$Setup$ = (function() {
  this.$$outer$1.canvasStyle$1 = true;
  this.$$outer$1.renderer$1.autoClear = false;
  this.$$outer$1.renderer$1.autoClearColor = false;
  return this
});
$c_Lmain_lib_Canvas$Setup$.prototype.$$und2D__Lmain_lib_Canvas$Setup$ = (function() {
  this.$$outer$1.renderer$1.sortObjects = false;
  var jsx$6 = this.$$outer$1;
  var jsx$5 = $g.THREE.OrthographicCamera;
  var this$1 = this.$$outer$1;
  var jsx$4 = $s_Lmain_lib_WorldCoordinates$class__width__Lmain_lib_WorldCoordinates__I(this$1);
  var this$2 = this.$$outer$1;
  var jsx$3 = $s_Lmain_lib_WorldCoordinates$class__width__Lmain_lib_WorldCoordinates__I(this$2);
  var this$3 = this.$$outer$1;
  var jsx$2 = $s_Lmain_lib_WorldCoordinates$class__height__Lmain_lib_WorldCoordinates__I(this$3);
  var this$4 = this.$$outer$1;
  var jsx$1 = new jsx$5(((jsx$4 / (-2)) | 0), ((jsx$3 / 2) | 0), ((jsx$2 / 2) | 0), (($s_Lmain_lib_WorldCoordinates$class__height__Lmain_lib_WorldCoordinates__I(this$4) / (-2)) | 0), (-1000.0), 1000.0);
  jsx$6.camera$1 = jsx$1;
  this.$$outer$1.faceSide$1 = $g.THREE.FrontSide;
  this.resetPosition__p1__Lmain_lib_Vector3();
  return this
});
$c_Lmain_lib_Canvas$Setup$.prototype.LeftBottom__Lmain_lib_Canvas$Setup$ = (function() {
  this.$$outer$1.position$1 = this.$$outer$1.leftBottomPosition$1;
  this.$$outer$1.worldCoordinates$1 = this.$$outer$1.LeftBottomCoordiantes__Lmain_lib_WorldCoordinates$LeftBottomCoordiantes$();
  this.resetPosition__p1__Lmain_lib_Vector3();
  return this
});
$c_Lmain_lib_Canvas$Setup$.prototype.resetPosition__p1__Lmain_lib_Vector3 = (function() {
  return this.$$outer$1.camera$1.position.set($uD(this.$$outer$1.position$1.x), $uD(this.$$outer$1.position$1.y), $uD(this.$$outer$1.position$1.z))
});
$c_Lmain_lib_Canvas$Setup$.prototype.withStats__Lmain_lib_Canvas$Setup$ = (function() {
  this.$$outer$1.withStatsRender$1 = true;
  this.$$outer$1.stats$1.domElement.style.position = "absolute";
  this.$$outer$1.stats$1.domElement.style.top = "0px";
  this.$$outer$1.body$1.appendChild(this.$$outer$1.stats$1.domElement);
  return this
});
var $d_Lmain_lib_Canvas$Setup$ = new $TypeData().initClass({
  Lmain_lib_Canvas$Setup$: 0
}, false, "main.lib.Canvas$Setup$", {
  Lmain_lib_Canvas$Setup$: 1,
  O: 1
});
$c_Lmain_lib_Canvas$Setup$.prototype.$classData = $d_Lmain_lib_Canvas$Setup$;
function $s_Lmain_lib_Canvas$class__run__Lmain_lib_Canvas__V($$this) {
  var timestamp = $m_jl_System$().currentTimeMillis__J().toDouble__D();
  $s_Lmain_lib_Canvas$class__renderLoop__Lmain_lib_Canvas__D__V($$this, timestamp)
}
function $s_Lmain_lib_Canvas$class__$$init$__Lmain_lib_Canvas__V($$this) {
  $$this.faceSide$1 = $g.THREE.FrontSide;
  $$this.$$undcenter$1 = new $g.THREE.Vector3(0.0, 0.0, 500.0);
  $$this.leftBottomPosition$1 = new $g.THREE.Vector3((($s_Lmain_lib_WorldCoordinates$class__width__Lmain_lib_WorldCoordinates__I($$this) / 2) | 0), (($s_Lmain_lib_WorldCoordinates$class__height__Lmain_lib_WorldCoordinates__I($$this) / 2) | 0), 1000.0);
  $$this.position$1 = $$this.$$undcenter$1;
  $$this.renderAction$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(arg$outer) {
    return (function(x$1$2) {
      $asUnit(x$1$2);
      var qual$1 = arg$outer.renderer$1;
      var x$6 = arg$outer.scene$1;
      var x$7 = arg$outer.camera$1;
      var x$8 = (!arg$outer.canvasStyle$1);
      qual$1.render(x$6, x$7, (void 0), x$8)
    })
  })($$this));
  $$this.clearObjectsAction$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$2$2) {
    $asUnit(x$2$2)
  }));
  $$this.canvasStyle$1 = false;
  $$this.withStatsRender$1 = false;
  $$this.withControlsRender$1 = false;
  $$this.stats$1 = new $g.Stats();
  $$this.controls$1 = null;
  $$this.delta$1 = 0.0;
  $$this.frameCount$1 = $m_sjsr_RuntimeLong$().Zero__sjsr_RuntimeLong();
  $$this.mouseX$1 = 0.0;
  $$this.mouseY$1 = 0.0;
  $m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().onmousemove = (function(arg$outer$1) {
    return (function(event$2) {
      arg$outer$1.mouseX$1 = $uD(event$2.clientX);
      arg$outer$1.mouseY$1 = ($uI($m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().innerHeight) - $uD(event$2.clientY))
    })
  })($$this);
  $$this.minFrameRate$1 = 1;
  $$this.times$1 = 0;
  $$this.capturer$1 = new $g.CCapture({
    "format": "webm",
    "verbose": true
  });
  $$this.aaa$1 = false;
  $m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().onkeypress = (function(f) {
    return (function(arg1) {
      return f.apply__O__O(arg1)
    })
  })(new $c_Lmain_lib_Canvas$$anonfun$4().init___Lmain_lib_Canvas($$this))
}
function $s_Lmain_lib_Canvas$class__renderLoop__Lmain_lib_Canvas__D__V($$this, timestamp) {
  $$this.delta$1 = $uD($$this.clock$1.getDelta());
  $$this.frameCount$1 = new $c_sjsr_RuntimeLong().init___I__I(1, 0).$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong($$this.frameCount$1);
  if ($$this.withControlsRender$1) {
    $$this.controls$1.update()
  };
  if ($$this.withStatsRender$1) {
    $$this.stats$1.update()
  };
  if ((($$this.delta$1 > ((1 / $$this.minFrameRate$1) | 0)) && $$this.frameCount$1.$$greater__sjsr_RuntimeLong__Z(new $c_sjsr_RuntimeLong().init___I__I(60, 0)))) {
    $$this.times$1 = ((1 + $$this.times$1) | 0);
    if (($$this.times$1 > 15)) {
      throw new $c_jl_Error().init___T(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Im preventing your machine from exploding, optimize your code! Last delta was: ", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([$$this.delta$1])))
    }
  } else {
    $$this.times$1 = 0
  };
  $$this.clearObjectsAction$1.apply__O__O((void 0));
  $m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().requestAnimationFrame((function(arg$outer) {
    return (function(timestamp$2) {
      var timestamp$1 = $uD(timestamp$2);
      $s_Lmain_lib_Canvas$class__renderLoop__Lmain_lib_Canvas__D__V(arg$outer, timestamp$1)
    })
  })($$this));
  $$this.render__V();
  if ($$this.aaa$1) {
    $$this.capturer$1.capture($$this.renderer$1.domElement)
  };
  $$this.renderAction$1.apply__O__O((void 0));
  $$this.camera$1.updateMatrix()
}
function $s_Lmain_lib_Converters$class__IntToColor__Lmain_lib_Converters__I__Lmain_lib_Color($$this, value) {
  return new $g.THREE.Color(value)
}
function $s_Lmain_lib_Converters$class__SeqIntToColor__Lmain_lib_Converters__sc_Seq__sc_Seq($$this, lst) {
  var jsx$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(x$1$2) {
    var x$1 = $uI(x$1$2);
    return new $g.THREE.Color(x$1)
  }));
  var this$1 = $m_sc_Seq$();
  return $as_sc_Seq(lst.map__F1__scg_CanBuildFrom__O(jsx$1, this$1.ReusableCBFInstance$2))
}
/** @constructor */
function $c_Lmain_lib_DefaultCanvas$() {
  $c_O.call(this);
  this.renderer$1 = null;
  this.e$1 = null;
  this.body$1 = null;
  this.canvasData$1 = null
}
$c_Lmain_lib_DefaultCanvas$.prototype = new $h_O();
$c_Lmain_lib_DefaultCanvas$.prototype.constructor = $c_Lmain_lib_DefaultCanvas$;
/** @constructor */
function $h_Lmain_lib_DefaultCanvas$() {
  /*<skip>*/
}
$h_Lmain_lib_DefaultCanvas$.prototype = $c_Lmain_lib_DefaultCanvas$.prototype;
$c_Lmain_lib_DefaultCanvas$.prototype.init___ = (function() {
  $n_Lmain_lib_DefaultCanvas$ = this;
  this.renderer$1 = new $g.THREE.WebGLRenderer({
    "preserveDrawingBuffer": true
  });
  this.renderer$1.setSize(this.width__I(), this.height__I());
  this.e$1 = this.renderer$1.domElement;
  this.body$1 = $m_Lorg_scalajs_dom_package$().document__Lorg_scalajs_dom_raw_HTMLDocument().body;
  this.body$1.appendChild(this.e$1);
  this.canvasData$1 = new $c_Lmain_lib_CanvasData().init___Lmain_lib_LineBasicMaterial__Lmain_lib_MeshBasicMaterial__Lmain_lib_Scene__Lmain_lib_Camera__Lmain_lib_WebGLRenderer__Lmain_lib_Clock__Lorg_scalajs_dom_raw_Node(new $g.THREE.LineBasicMaterial({
    "color": 16777215,
    "side": $g.THREE.DoubleSide
  }), new $g.THREE.MeshBasicMaterial({
    "color": 16777215,
    "side": $g.THREE.DoubleSide
  }), new $g.THREE.Scene(), new $g.THREE.OrthographicCamera(((this.width__I() / (-2)) | 0), ((this.width__I() / 2) | 0), ((this.height__I() / 2) | 0), ((this.height__I() / (-2)) | 0), (-1000.0), 1000.0), this.renderer$1, new $g.THREE.Clock(), this.body$1);
  return this
});
$c_Lmain_lib_DefaultCanvas$.prototype.width__I = (function() {
  return $uI($m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().innerWidth)
});
$c_Lmain_lib_DefaultCanvas$.prototype.height__I = (function() {
  return $uI($m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().innerHeight)
});
var $d_Lmain_lib_DefaultCanvas$ = new $TypeData().initClass({
  Lmain_lib_DefaultCanvas$: 0
}, false, "main.lib.DefaultCanvas$", {
  Lmain_lib_DefaultCanvas$: 1,
  O: 1
});
$c_Lmain_lib_DefaultCanvas$.prototype.$classData = $d_Lmain_lib_DefaultCanvas$;
var $n_Lmain_lib_DefaultCanvas$ = (void 0);
function $m_Lmain_lib_DefaultCanvas$() {
  if ((!$n_Lmain_lib_DefaultCanvas$)) {
    $n_Lmain_lib_DefaultCanvas$ = new $c_Lmain_lib_DefaultCanvas$().init___()
  };
  return $n_Lmain_lib_DefaultCanvas$
}
/** @constructor */
function $c_Lmain_lib_DrawingUtils$RectMode$() {
  $c_O.call(this);
  this.main$lib$DrawingUtils$RectMode$$half$1 = null;
  this.$$undcenterMode$1 = null;
  this.$$undleftBottomMode$1 = null;
  this.rectMode$1 = null
}
$c_Lmain_lib_DrawingUtils$RectMode$.prototype = new $h_O();
$c_Lmain_lib_DrawingUtils$RectMode$.prototype.constructor = $c_Lmain_lib_DrawingUtils$RectMode$;
/** @constructor */
function $h_Lmain_lib_DrawingUtils$RectMode$() {
  /*<skip>*/
}
$h_Lmain_lib_DrawingUtils$RectMode$.prototype = $c_Lmain_lib_DrawingUtils$RectMode$.prototype;
$c_Lmain_lib_DrawingUtils$RectMode$.prototype.init___Lmain_lib_DrawingUtils = (function($$outer) {
  this.main$lib$DrawingUtils$RectMode$$half$1 = new $g.THREE.Vector3(2.0, 2.0, 2.0);
  this.$$undcenterMode$1 = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function(v$2, volume$2) {
    return v$2
  }));
  this.$$undleftBottomMode$1 = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function(arg$outer) {
    return (function(v$2$1, volume$2$1) {
      return v$2$1.add(volume$2$1.divide(arg$outer.main$lib$DrawingUtils$RectMode$$half$1))
    })
  })(this));
  this.rectMode$1 = this.$$undcenterMode$1;
  return this
});
var $d_Lmain_lib_DrawingUtils$RectMode$ = new $TypeData().initClass({
  Lmain_lib_DrawingUtils$RectMode$: 0
}, false, "main.lib.DrawingUtils$RectMode$", {
  Lmain_lib_DrawingUtils$RectMode$: 1,
  O: 1
});
$c_Lmain_lib_DrawingUtils$RectMode$.prototype.$classData = $d_Lmain_lib_DrawingUtils$RectMode$;
function $s_Lmain_lib_DrawingUtils$class__circle__Lmain_lib_DrawingUtils__Lmain_lib_Vector3__D__O__Lmain_lib_DrawingUtils$MeshMaterialTypeClass__Lmain_lib_Mesh($$this, pos, radius, material, meshMaterialTypeClass) {
  var s = $doubleToInt(new $c_Lmain_lib_MathUtils$RichDouble().init___Lmain_lib_MathUtils__D($$this, radius).mapContrain__D__D__D__D__D(0.0, 1920.0, 4.0, $$this.circleGeometries$1.u.length));
  var geometry = $$this.circleGeometries$1.u[s];
  var material$1 = meshMaterialTypeClass.toMeshMaterial__Lmain_lib_Color__Lmain_lib_MeshBasicMaterial(material);
  var mm = $s_Lmain_lib_DrawingUtils$class__addMeshInPlace__Lmain_lib_DrawingUtils__Lmain_lib_Geometry__Lmain_lib_Vector3__Lmain_lib_Material__Lmain_lib_Mesh($$this, geometry, pos, material$1);
  mm.scale.set(radius, radius, radius);
  return mm
}
function $s_Lmain_lib_DrawingUtils$class__$$init$__Lmain_lib_DrawingUtils__V($$this) {
  $$this.defaultLineMaterial$1 = new $g.THREE.LineBasicMaterial({
    "color": $s_Lmain_lib_Converters$class__IntToColor__Lmain_lib_Converters__I__Lmain_lib_Color($$this, 16777215),
    "side": $as_Lmain_lib_Canvas($$this).faceSide$1
  });
  $$this.defaultMeshMaterial$1 = new $g.THREE.MeshBasicMaterial({
    "color": $s_Lmain_lib_Converters$class__IntToColor__Lmain_lib_Converters__I__Lmain_lib_Color($$this, 16777215),
    "side": $as_Lmain_lib_Canvas($$this).faceSide$1
  });
  $$this.planeGeometry$1 = new $g.THREE.PlaneGeometry(1.0, 1.0);
  $m_sci_IndexedSeq$();
  $m_sc_IndexedSeq$();
  $m_sci_IndexedSeq$();
  $m_sci_Vector$();
  var b$1 = new $c_sci_VectorBuilder().init___();
  var i = 1;
  var count = 0;
  while ((i !== 9)) {
    var arg1 = i;
    var elem = new $g.THREE.CircleGeometry(1.0, $uD($g.Math.pow(2.0, arg1)));
    b$1.$$plus$eq__O__sci_VectorBuilder(elem);
    count = ((1 + count) | 0);
    i = ((1 + i) | 0)
  };
  var this$9 = b$1.result__sci_Vector();
  var len = this$9.length__I();
  var result = $newArrayObject($d_Lmain_lib_CircleGeometry.getArrayOf(), [len]);
  $s_sc_TraversableOnce$class__copyToArray__sc_TraversableOnce__O__I__V(this$9, result, 0);
  $$this.circleGeometries$1 = result;
  $$this.boxGeometry$1 = new $g.THREE.BoxGeometry(1.0, 1.0, 1.0);
  $m_sci_IndexedSeq$();
  $m_sc_IndexedSeq$();
  $m_sci_IndexedSeq$();
  $m_sci_Vector$();
  var b$3 = new $c_sci_VectorBuilder().init___();
  var i$1 = 1;
  var count$1 = 0;
  while ((i$1 !== 9)) {
    var arg1$1 = i$1;
    var elem$1 = new $g.THREE.SphereGeometry(1.0, $uD($g.Math.pow(2.0, arg1$1)), $uD($g.Math.pow(2.0, arg1$1)));
    b$3.$$plus$eq__O__sci_VectorBuilder(elem$1);
    count$1 = ((1 + count$1) | 0);
    i$1 = ((1 + i$1) | 0)
  };
  var this$19 = b$3.result__sci_Vector();
  var len$1 = this$19.length__I();
  var result$1 = $newArrayObject($d_Lmain_lib_SphereGeometry.getArrayOf(), [len$1]);
  $s_sc_TraversableOnce$class__copyToArray__sc_TraversableOnce__O__I__V(this$19, result$1, 0);
  $$this.sphereGeometries$1 = result$1;
  $$this.pMaterial$1 = new $g.THREE.PointsMaterial({
    "size": 1.0,
    "vertexColors": $g.THREE.VertexColors,
    "depthTest": false,
    "opacity": $s_Lmain_lib_Converters$class__IntToColor__Lmain_lib_Converters__I__Lmain_lib_Color($$this, 1),
    "sizeAttenuation": false,
    "transparent": false
  })
}
function $s_Lmain_lib_DrawingUtils$class__addMeshInPlace__Lmain_lib_DrawingUtils__Lmain_lib_Geometry__Lmain_lib_Vector3__Lmain_lib_Material__Lmain_lib_Mesh($$this, geometry, pos, material) {
  var mesh = new $g.THREE.Mesh(geometry, material);
  mesh.position.add(pos);
  $as_Lmain_lib_Canvas($$this).scene$1.add(mesh);
  return mesh
}
function $s_Lmain_lib_DrawingUtils$class__random2D__Lmain_lib_DrawingUtils__Lmain_lib_Vector3($$this) {
  var jsx$2 = $g.THREE.Vector3;
  var ceil = $s_Lmain_lib_WorldCoordinates$class__width__Lmain_lib_WorldCoordinates__I($$this);
  var jsx$1 = $s_Lmain_lib_MathUtils$class__rand__Lmain_lib_MathUtils__D__D($$this, ceil);
  var ceil$1 = $s_Lmain_lib_WorldCoordinates$class__height__Lmain_lib_WorldCoordinates__I($$this);
  return new jsx$2(jsx$1, $s_Lmain_lib_MathUtils$class__rand__Lmain_lib_MathUtils__D__D($$this, ceil$1), 0.0)
}
function $s_Lmain_lib_MathUtils$class__rand__Lmain_lib_MathUtils__D__D__D($$this, low, high) {
  if ((low >= high)) {
    return low
  } else {
    var ceil = (high - low);
    return ($s_Lmain_lib_MathUtils$class__rand__Lmain_lib_MathUtils__D__D($$this, ceil) + low)
  }
}
function $s_Lmain_lib_MathUtils$class__rand__Lmain_lib_MathUtils__D__D($$this, ceil) {
  var this$1 = $$this.main$lib$MathUtils$$randomGen__s_util_Random();
  return (this$1.self$1.nextDouble__D() * ceil)
}
function $s_Lmain_lib_MathUtils$class__$$init$__Lmain_lib_MathUtils__V($$this) {
  $$this.main$lib$MathUtils$$undsetter$und$PI$und$eq__D__V(3.141592653589793);
  $$this.main$lib$MathUtils$$undsetter$und$TWO$undPI$und$eq__D__V((2 * $$this.PI__D()));
  $$this.main$lib$MathUtils$$undsetter$und$HALF$undPI$und$eq__D__V(($$this.PI__D() / 2));
  $$this.main$lib$MathUtils$$undsetter$und$QUARTER$undPI$und$eq__D__V(($$this.PI__D() / 4));
  $$this.main$lib$MathUtils$$undsetter$und$main$lib$MathUtils$$randomGen$und$eq__s_util_Random__V(new $c_s_util_Random().init___());
  $$this.main$lib$MathUtils$$undsetter$und$precision$und$eq__I__V(720)
}
function $s_Lmain_lib_MathUtils$class__map__Lmain_lib_MathUtils__D__D__D__D__D__D($$this, value, in_min, in_max, out_min, out_max) {
  return ((((value - in_min) / (in_max - in_min)) * (out_max - out_min)) + out_min)
}
function $s_Lmain_lib_MathUtils$class__constrain__Lmain_lib_MathUtils__D__D__D__D($$this, value, min, max) {
  return ((value < min) ? min : ((value > max) ? max : value))
}
function $s_Lmain_lib_MathUtils$class__mapContrain__Lmain_lib_MathUtils__D__D__D__D__D__D($$this, value, in_min, in_max, out_min, out_max) {
  var value$1 = $s_Lmain_lib_MathUtils$class__map__Lmain_lib_MathUtils__D__D__D__D__D__D($$this, value, in_min, in_max, out_min, out_max);
  return $s_Lmain_lib_MathUtils$class__constrain__Lmain_lib_MathUtils__D__D__D__D($$this, value$1, out_min, out_max)
}
function $s_Lmain_lib_PaletteT$class__$$init$__Lmain_lib_PaletteT__V($$this) {
  $$this.white$1 = 16777215;
  $$this.black$1 = 0;
  $$this.red$1 = 16711680;
  $$this.green$1 = 65280;
  $$this.blue$1 = 255;
  var this$1 = $m_sci_Nil$();
  var this$2 = new $c_sci_$colon$colon().init___O__sci_List(1586754, this$1);
  var this$3 = new $c_sci_$colon$colon().init___O__sci_List(3226970, this$2);
  var this$4 = new $c_sci_$colon$colon().init___O__sci_List(7561866, this$3);
  var this$5 = new $c_sci_$colon$colon().init___O__sci_List(13354474, this$4);
  var lst = new $c_sci_$colon$colon().init___O__sci_List(15395562, this$5);
  $$this.blueSaddness$1 = new $c_Lmain_lib_Palette().init___sc_Seq($s_Lmain_lib_Converters$class__SeqIntToColor__Lmain_lib_Converters__sc_Seq__sc_Seq($$this, lst));
  var this$6 = $m_sci_Nil$();
  var this$7 = new $c_sci_$colon$colon().init___O__sci_List(16442310, this$6);
  var this$8 = new $c_sci_$colon$colon().init___O__sci_List(16426173, this$7);
  var this$9 = new $c_sci_$colon$colon().init___O__sci_List(16082089, this$8);
  var this$10 = new $c_sci_$colon$colon().init___O__sci_List(5454669, this$9);
  var lst$1 = new $c_sci_$colon$colon().init___O__sci_List(12692390, this$10);
  $$this.pop$1 = new $c_Lmain_lib_Palette().init___sc_Seq($s_Lmain_lib_Converters$class__SeqIntToColor__Lmain_lib_Converters__sc_Seq__sc_Seq($$this, lst$1));
  var this$11 = $m_sci_Nil$();
  var this$12 = new $c_sci_$colon$colon().init___O__sci_List(16410880, this$11);
  var this$13 = new $c_sci_$colon$colon().init___O__sci_List(15959600, this$12);
  var this$14 = new $c_sci_$colon$colon().init___O__sci_List(14738636, this$13);
  var this$15 = new $c_sci_$colon$colon().init___O__sci_List(11000792, this$14);
  var lst$2 = new $c_sci_$colon$colon().init___O__sci_List(6935271, this$15);
  $$this.giantGoldfish$1 = new $c_Lmain_lib_Palette().init___sc_Seq($s_Lmain_lib_Converters$class__SeqIntToColor__Lmain_lib_Converters__sc_Seq__sc_Seq($$this, lst$2));
  var this$16 = $m_sci_Nil$();
  var this$17 = new $c_sci_$colon$colon().init___O__sci_List(8630171, this$16);
  var this$18 = new $c_sci_$colon$colon().init___O__sci_List(13158569, this$17);
  var this$19 = new $c_sci_$colon$colon().init___O__sci_List(16371117, this$18);
  var this$20 = new $c_sci_$colon$colon().init___O__sci_List(16555418, this$19);
  var lst$3 = new $c_sci_$colon$colon().init___O__sci_List(16663397, this$20);
  $$this.sugar01$1 = new $c_Lmain_lib_Palette().init___sc_Seq($s_Lmain_lib_Converters$class__SeqIntToColor__Lmain_lib_Converters__sc_Seq__sc_Seq($$this, lst$3));
  var this$21 = $m_sci_Nil$();
  var this$22 = new $c_sci_$colon$colon().init___O__sci_List(5470074, this$21);
  var this$23 = new $c_sci_$colon$colon().init___O__sci_List(5514295, this$22);
  var this$24 = new $c_sci_$colon$colon().init___O__sci_List(12593474, this$23);
  var this$25 = new $c_sci_$colon$colon().init___O__sci_List(14244675, this$24);
  var lst$4 = new $c_sci_$colon$colon().init___O__sci_List(15519864, this$25);
  $$this.thoughtProvoking$1 = new $c_Lmain_lib_Palette().init___sc_Seq($s_Lmain_lib_Converters$class__SeqIntToColor__Lmain_lib_Converters__sc_Seq__sc_Seq($$this, lst$4));
  var this$26 = $m_sci_Nil$();
  var this$27 = new $c_sci_$colon$colon().init___O__sci_List(739435, this$26);
  var this$28 = new $c_sci_$colon$colon().init___O__sci_List(3901062, this$27);
  var this$29 = new $c_sci_$colon$colon().init___O__sci_List(7978394, this$28);
  var this$30 = new $c_sci_$colon$colon().init___O__sci_List(11066280, this$29);
  var lst$5 = new $c_sci_$colon$colon().init___O__sci_List(13627550, this$30);
  $$this.adriftInDreams$1 = new $c_Lmain_lib_Palette().init___sc_Seq($s_Lmain_lib_Converters$class__SeqIntToColor__Lmain_lib_Converters__sc_Seq__sc_Seq($$this, lst$5));
  var this$31 = $m_sci_Nil$();
  var this$32 = new $c_sci_$colon$colon().init___O__sci_List(12864856, this$31);
  var this$33 = new $c_sci_$colon$colon().init___O__sci_List(16739179, this$32);
  var this$34 = new $c_sci_$colon$colon().init___O__sci_List(13104228, this$33);
  var this$35 = new $c_sci_$colon$colon().init___O__sci_List(5164484, this$34);
  var lst$6 = new $c_sci_$colon$colon().init___O__sci_List(5595760, this$35);
  $$this.cheerUpEmoKid$1 = new $c_Lmain_lib_Palette().init___sc_Seq($s_Lmain_lib_Converters$class__SeqIntToColor__Lmain_lib_Converters__sc_Seq__sc_Seq($$this, lst$6));
  var this$36 = $m_sci_Nil$();
  var this$37 = new $c_sci_$colon$colon().init___O__sci_List(12968156, this$36);
  var this$38 = new $c_sci_$colon$colon().init___O__sci_List(15525326, this$37);
  var this$39 = new $c_sci_$colon$colon().init___O__sci_List(15848623, this$38);
  var this$40 = new $c_sci_$colon$colon().init___O__sci_List(14716537, this$39);
  var lst$7 = new $c_sci_$colon$colon().init___O__sci_List(7819064, this$40);
  $$this.letThemEatCake$1 = new $c_Lmain_lib_Palette().init___sc_Seq($s_Lmain_lib_Converters$class__SeqIntToColor__Lmain_lib_Converters__sc_Seq__sc_Seq($$this, lst$7));
  var this$41 = $m_sci_Nil$();
  var this$42 = new $c_sci_$colon$colon().init___O__sci_List(16083345, this$41);
  var this$43 = new $c_sci_$colon$colon().init___O__sci_List(16752512, this$42);
  var this$44 = new $c_sci_$colon$colon().init___O__sci_List(16761996, this$43);
  var this$45 = new $c_sci_$colon$colon().init___O__sci_List(15727284, this$44);
  var lst$8 = new $c_sci_$colon$colon().init___O__sci_List(13759141, this$45);
  $$this.mellonBallSurprise$1 = new $c_Lmain_lib_Palette().init___sc_Seq($s_Lmain_lib_Converters$class__SeqIntToColor__Lmain_lib_Converters__sc_Seq__sc_Seq($$this, lst$8));
  var this$46 = $m_sci_Nil$();
  var this$47 = new $c_sci_$colon$colon().init___O__sci_List(15583569, this$46);
  var this$48 = new $c_sci_$colon$colon().init___O__sci_List(15427649, this$47);
  var this$49 = new $c_sci_$colon$colon().init___O__sci_List(13382463, this$48);
  var this$50 = new $c_sci_$colon$colon().init___O__sci_List(6965820, this$49);
  var lst$9 = new $c_sci_$colon$colon().init___O__sci_List(41136, this$50);
  $$this.oceanFive$1 = new $c_Lmain_lib_Palette().init___sc_Seq($s_Lmain_lib_Converters$class__SeqIntToColor__Lmain_lib_Converters__sc_Seq__sc_Seq($$this, lst$9));
  var this$51 = $m_sci_Nil$();
  var this$52 = new $c_sci_$colon$colon().init___O__sci_List(15072450, this$51);
  var this$53 = new $c_sci_$colon$colon().init___O__sci_List(10346669, this$52);
  var this$54 = new $c_sci_$colon$colon().init___O__sci_List(4566440, this$53);
  var this$55 = new $c_sci_$colon$colon().init___O__sci_List(5536128, this$54);
  var lst$10 = new $c_sci_$colon$colon().init___O__sci_List(5853007, this$55);
  $$this.iDemandPancake$1 = new $c_Lmain_lib_Palette().init___sc_Seq($s_Lmain_lib_Converters$class__SeqIntToColor__Lmain_lib_Converters__sc_Seq__sc_Seq($$this, lst$10))
}
function $s_Lmain_lib_PerlinNoise$class__noise__Lmain_lib_PerlinNoise__D__D__D__D($$this, x, y, z) {
  var roundedX = $doubleToInt(x);
  var roundedY = $doubleToInt(y);
  var roundedZ = $doubleToInt(z);
  var X = (255 & roundedX);
  var Y = (255 & roundedY);
  var Z = (255 & roundedZ);
  var x_ = (x - roundedX);
  var y_ = (y - roundedY);
  var z_ = (z - roundedZ);
  var u = $s_Lmain_lib_PerlinNoise$class__fade$1__p0__Lmain_lib_PerlinNoise__D__D($$this, x_);
  var v = $s_Lmain_lib_PerlinNoise$class__fade$1__p0__Lmain_lib_PerlinNoise__D__D($$this, y_);
  var w = $s_Lmain_lib_PerlinNoise$class__fade$1__p0__Lmain_lib_PerlinNoise__D__D($$this, z_);
  var A = (($uI($$this.p$1.apply__I__O(X)) + Y) | 0);
  var AA = (($uI($$this.p$1.apply__I__O(A)) + Z) | 0);
  var AB = (($uI($$this.p$1.apply__I__O(((1 + A) | 0))) + Z) | 0);
  var B = (($uI($$this.p$1.apply__I__O(((1 + X) | 0))) + Y) | 0);
  var BA = (($uI($$this.p$1.apply__I__O(B)) + Z) | 0);
  var BB = (($uI($$this.p$1.apply__I__O(((1 + B) | 0))) + Z) | 0);
  return $s_Lmain_lib_PerlinNoise$class__interpolate$1__p0__Lmain_lib_PerlinNoise__D__D__D__D($$this, w, $s_Lmain_lib_PerlinNoise$class__interpolate$1__p0__Lmain_lib_PerlinNoise__D__D__D__D($$this, v, $s_Lmain_lib_PerlinNoise$class__interpolate$1__p0__Lmain_lib_PerlinNoise__D__D__D__D($$this, u, $s_Lmain_lib_PerlinNoise$class__grad$1__p0__Lmain_lib_PerlinNoise__I__D__D__D__D($$this, $uI($$this.p$1.apply__I__O(AA)), x_, y_, z_), $s_Lmain_lib_PerlinNoise$class__grad$1__p0__Lmain_lib_PerlinNoise__I__D__D__D__D($$this, $uI($$this.p$1.apply__I__O(BA)), ((-1.0) + x_), y_, z_)), $s_Lmain_lib_PerlinNoise$class__interpolate$1__p0__Lmain_lib_PerlinNoise__D__D__D__D($$this, u, $s_Lmain_lib_PerlinNoise$class__grad$1__p0__Lmain_lib_PerlinNoise__I__D__D__D__D($$this, $uI($$this.p$1.apply__I__O(AB)), x_, ((-1.0) + y_), z_), $s_Lmain_lib_PerlinNoise$class__grad$1__p0__Lmain_lib_PerlinNoise__I__D__D__D__D($$this, $uI($$this.p$1.apply__I__O(BB)), ((-1.0) + x_), ((-1.0) + y_), z_))), $s_Lmain_lib_PerlinNoise$class__interpolate$1__p0__Lmain_lib_PerlinNoise__D__D__D__D($$this, v, $s_Lmain_lib_PerlinNoise$class__interpolate$1__p0__Lmain_lib_PerlinNoise__D__D__D__D($$this, u, $s_Lmain_lib_PerlinNoise$class__grad$1__p0__Lmain_lib_PerlinNoise__I__D__D__D__D($$this, $uI($$this.p$1.apply__I__O(((1 + AA) | 0))), x_, y_, ((-1.0) + z_)), $s_Lmain_lib_PerlinNoise$class__grad$1__p0__Lmain_lib_PerlinNoise__I__D__D__D__D($$this, $uI($$this.p$1.apply__I__O(((1 + BA) | 0))), ((-1.0) + x_), y_, ((-1.0) + z_))), $s_Lmain_lib_PerlinNoise$class__interpolate$1__p0__Lmain_lib_PerlinNoise__D__D__D__D($$this, u, $s_Lmain_lib_PerlinNoise$class__grad$1__p0__Lmain_lib_PerlinNoise__I__D__D__D__D($$this, $uI($$this.p$1.apply__I__O(((1 + AB) | 0))), x_, ((-1.0) + y_), ((-1.0) + z_)), $s_Lmain_lib_PerlinNoise$class__grad$1__p0__Lmain_lib_PerlinNoise__I__D__D__D__D($$this, $uI($$this.p$1.apply__I__O(((1 + BB) | 0))), ((-1.0) + x_), ((-1.0) + y_), ((-1.0) + z_)))))
}
function $s_Lmain_lib_PerlinNoise$class__grad$1__p0__Lmain_lib_PerlinNoise__I__D__D__D__D($$this, hash, x, y, z) {
  var lowBits = (15 & hash);
  var u = ((lowBits < 8) ? x : y);
  var v = ((lowBits < 4) ? y : (((lowBits === 12) || (lowBits === 14)) ? x : z));
  return ((((1 & lowBits) === 0) ? u : (-u)) + (((2 & lowBits) === 0) ? v : (-v)))
}
function $s_Lmain_lib_PerlinNoise$class__interpolate$1__p0__Lmain_lib_PerlinNoise__D__D__D__D($$this, t, a, b) {
  return (a + (t * (b - a)))
}
function $s_Lmain_lib_PerlinNoise$class__$$init$__Lmain_lib_PerlinNoise__V($$this) {
  $m_sci_IndexedSeq$();
  $m_sc_IndexedSeq$();
  $m_sci_IndexedSeq$();
  $m_sci_Vector$();
  var b$1 = new $c_sci_VectorBuilder().init___();
  var i = 1;
  var count = 0;
  while ((i !== 301)) {
    var arg1 = i;
    var elem = $doubleToInt($s_Lmain_lib_MathUtils$class__rand__Lmain_lib_MathUtils__D__D($$this, 255.0));
    b$1.$$plus$eq__O__sci_VectorBuilder(elem);
    count = ((1 + count) | 0);
    i = ((1 + i) | 0)
  };
  $$this.permutation$1 = b$1.result__sci_Vector();
  $$this.p$1 = $as_sci_IndexedSeq($$this.permutation$1.$$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O($$this.permutation$1, ($m_sci_IndexedSeq$(), $m_sc_IndexedSeq$().ReusableCBF$6)))
}
function $s_Lmain_lib_PerlinNoise$class__fade$1__p0__Lmain_lib_PerlinNoise__D__D($$this, t) {
  return (((t * t) * t) * (10 + (t * ((-15.0) + (6 * t)))))
}
function $s_Lmain_lib_WorldCoordinates$class__$$init$__Lmain_lib_WorldCoordinates__V($$this) {
  $$this.xAxis$1 = new $g.THREE.Vector3(1.0, 0.0, 0.0);
  $$this.yAxis$1 = new $g.THREE.Vector3(0.0, 1.0, 0.0);
  $$this.zAxis$1 = new $g.THREE.Vector3(0.0, 0.0, 1.0);
  $$this.worldCoordinates$1 = $$this.CenterCoordiantes__Lmain_lib_WorldCoordinates$CenterCoordiantes$()
}
function $s_Lmain_lib_WorldCoordinates$class__width__Lmain_lib_WorldCoordinates__I($$this) {
  return $uI($m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().innerWidth)
}
function $s_Lmain_lib_WorldCoordinates$class__height__Lmain_lib_WorldCoordinates__I($$this) {
  return $uI($m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().innerHeight)
}
/** @constructor */
function $c_Lorg_scalajs_dom_package$() {
  $c_O.call(this);
  this.ApplicationCache$1 = null;
  this.Blob$1 = null;
  this.BlobPropertyBag$1 = null;
  this.ClipboardEventInit$1 = null;
  this.DOMException$1 = null;
  this.Event$1 = null;
  this.EventException$1 = null;
  this.EventSource$1 = null;
  this.FileReader$1 = null;
  this.FormData$1 = null;
  this.KeyboardEvent$1 = null;
  this.MediaError$1 = null;
  this.MutationEvent$1 = null;
  this.MutationObserverInit$1 = null;
  this.Node$1 = null;
  this.NodeFilter$1 = null;
  this.PerformanceNavigation$1 = null;
  this.PositionError$1 = null;
  this.Range$1 = null;
  this.TextEvent$1 = null;
  this.TextTrack$1 = null;
  this.VisibilityState$1 = null;
  this.WebSocket$1 = null;
  this.WheelEvent$1 = null;
  this.XMLHttpRequest$1 = null;
  this.XPathResult$1 = null;
  this.window$1 = null;
  this.document$1 = null;
  this.console$1 = null;
  this.bitmap$0$1 = 0
}
$c_Lorg_scalajs_dom_package$.prototype = new $h_O();
$c_Lorg_scalajs_dom_package$.prototype.constructor = $c_Lorg_scalajs_dom_package$;
/** @constructor */
function $h_Lorg_scalajs_dom_package$() {
  /*<skip>*/
}
$h_Lorg_scalajs_dom_package$.prototype = $c_Lorg_scalajs_dom_package$.prototype;
$c_Lorg_scalajs_dom_package$.prototype.init___ = (function() {
  return this
});
$c_Lorg_scalajs_dom_package$.prototype.document__Lorg_scalajs_dom_raw_HTMLDocument = (function() {
  return (((134217728 & this.bitmap$0$1) === 0) ? this.document$lzycompute__p1__Lorg_scalajs_dom_raw_HTMLDocument() : this.document$1)
});
$c_Lorg_scalajs_dom_package$.prototype.window__Lorg_scalajs_dom_raw_Window = (function() {
  return (((67108864 & this.bitmap$0$1) === 0) ? this.window$lzycompute__p1__Lorg_scalajs_dom_raw_Window() : this.window$1)
});
$c_Lorg_scalajs_dom_package$.prototype.window$lzycompute__p1__Lorg_scalajs_dom_raw_Window = (function() {
  if (((67108864 & this.bitmap$0$1) === 0)) {
    this.window$1 = $g;
    this.bitmap$0$1 = (67108864 | this.bitmap$0$1)
  };
  return this.window$1
});
$c_Lorg_scalajs_dom_package$.prototype.document$lzycompute__p1__Lorg_scalajs_dom_raw_HTMLDocument = (function() {
  if (((134217728 & this.bitmap$0$1) === 0)) {
    this.document$1 = this.window__Lorg_scalajs_dom_raw_Window().document;
    this.bitmap$0$1 = (134217728 | this.bitmap$0$1)
  };
  return this.document$1
});
var $d_Lorg_scalajs_dom_package$ = new $TypeData().initClass({
  Lorg_scalajs_dom_package$: 0
}, false, "org.scalajs.dom.package$", {
  Lorg_scalajs_dom_package$: 1,
  O: 1
});
$c_Lorg_scalajs_dom_package$.prototype.$classData = $d_Lorg_scalajs_dom_package$;
var $n_Lorg_scalajs_dom_package$ = (void 0);
function $m_Lorg_scalajs_dom_package$() {
  if ((!$n_Lorg_scalajs_dom_package$)) {
    $n_Lorg_scalajs_dom_package$ = new $c_Lorg_scalajs_dom_package$().init___()
  };
  return $n_Lorg_scalajs_dom_package$
}
/** @constructor */
function $c_jl_Class() {
  $c_O.call(this);
  this.data$1 = null
}
$c_jl_Class.prototype = new $h_O();
$c_jl_Class.prototype.constructor = $c_jl_Class;
/** @constructor */
function $h_jl_Class() {
  /*<skip>*/
}
$h_jl_Class.prototype = $c_jl_Class.prototype;
$c_jl_Class.prototype.getName__T = (function() {
  return $as_T(this.data$1.name)
});
$c_jl_Class.prototype.isPrimitive__Z = (function() {
  return $uZ(this.data$1.isPrimitive)
});
$c_jl_Class.prototype.toString__T = (function() {
  return ((this.isInterface__Z() ? "interface " : (this.isPrimitive__Z() ? "" : "class ")) + this.getName__T())
});
$c_jl_Class.prototype.isAssignableFrom__jl_Class__Z = (function(that) {
  return ((this.isPrimitive__Z() || that.isPrimitive__Z()) ? ((this === that) || ((this === $d_S.getClassOf()) ? (that === $d_B.getClassOf()) : ((this === $d_I.getClassOf()) ? ((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) : ((this === $d_F.getClassOf()) ? (((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) || (that === $d_I.getClassOf())) : ((this === $d_D.getClassOf()) && ((((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) || (that === $d_I.getClassOf())) || (that === $d_F.getClassOf()))))))) : this.isInstance__O__Z(that.getFakeInstance__p1__O()))
});
$c_jl_Class.prototype.isInstance__O__Z = (function(obj) {
  return $uZ(this.data$1.isInstance(obj))
});
$c_jl_Class.prototype.init___jl_ScalaJSClassData = (function(data) {
  this.data$1 = data;
  return this
});
$c_jl_Class.prototype.getFakeInstance__p1__O = (function() {
  return this.data$1.getFakeInstance()
});
$c_jl_Class.prototype.isArray__Z = (function() {
  return $uZ(this.data$1.isArrayClass)
});
$c_jl_Class.prototype.isInterface__Z = (function() {
  return $uZ(this.data$1.isInterface)
});
var $d_jl_Class = new $TypeData().initClass({
  jl_Class: 0
}, false, "java.lang.Class", {
  jl_Class: 1,
  O: 1
});
$c_jl_Class.prototype.$classData = $d_jl_Class;
/** @constructor */
function $c_jl_Double$() {
  $c_O.call(this);
  this.TYPE$1 = null;
  this.POSITIVE$undINFINITY$1 = 0.0;
  this.NEGATIVE$undINFINITY$1 = 0.0;
  this.NaN$1 = 0.0;
  this.MAX$undVALUE$1 = 0.0;
  this.MIN$undVALUE$1 = 0.0;
  this.MAX$undEXPONENT$1 = 0;
  this.MIN$undEXPONENT$1 = 0;
  this.SIZE$1 = 0;
  this.doubleStrPat$1 = null;
  this.bitmap$0$1 = false
}
$c_jl_Double$.prototype = new $h_O();
$c_jl_Double$.prototype.constructor = $c_jl_Double$;
/** @constructor */
function $h_jl_Double$() {
  /*<skip>*/
}
$h_jl_Double$.prototype = $c_jl_Double$.prototype;
$c_jl_Double$.prototype.init___ = (function() {
  return this
});
$c_jl_Double$.prototype.compare__D__D__I = (function(a, b) {
  if ((a !== a)) {
    return ((b !== b) ? 0 : 1)
  } else if ((b !== b)) {
    return (-1)
  } else if ((a === b)) {
    if ((a === 0.0)) {
      var ainf = (1.0 / a);
      return ((ainf === (1.0 / b)) ? 0 : ((ainf < 0) ? (-1) : 1))
    } else {
      return 0
    }
  } else {
    return ((a < b) ? (-1) : 1)
  }
});
var $d_jl_Double$ = new $TypeData().initClass({
  jl_Double$: 0
}, false, "java.lang.Double$", {
  jl_Double$: 1,
  O: 1
});
$c_jl_Double$.prototype.$classData = $d_jl_Double$;
var $n_jl_Double$ = (void 0);
function $m_jl_Double$() {
  if ((!$n_jl_Double$)) {
    $n_jl_Double$ = new $c_jl_Double$().init___()
  };
  return $n_jl_Double$
}
/** @constructor */
function $c_jl_Integer$() {
  $c_O.call(this);
  this.TYPE$1 = null;
  this.MIN$undVALUE$1 = 0;
  this.MAX$undVALUE$1 = 0;
  this.SIZE$1 = 0;
  this.BYTES$1 = 0
}
$c_jl_Integer$.prototype = new $h_O();
$c_jl_Integer$.prototype.constructor = $c_jl_Integer$;
/** @constructor */
function $h_jl_Integer$() {
  /*<skip>*/
}
$h_jl_Integer$.prototype = $c_jl_Integer$.prototype;
$c_jl_Integer$.prototype.init___ = (function() {
  return this
});
$c_jl_Integer$.prototype.reverseBytes__I__I = (function(i) {
  var byte3 = ((i >>> 24) | 0);
  var byte2 = (65280 & ((i >>> 8) | 0));
  var byte1 = (16711680 & (i << 8));
  var byte0 = (i << 24);
  return (((byte0 | byte1) | byte2) | byte3)
});
$c_jl_Integer$.prototype.bitCount__I__I = (function(i) {
  var t1 = ((i - (1431655765 & (i >> 1))) | 0);
  var t2 = (((858993459 & t1) + (858993459 & (t1 >> 2))) | 0);
  return ($imul(16843009, (252645135 & ((t2 + (t2 >> 4)) | 0))) >> 24)
});
var $d_jl_Integer$ = new $TypeData().initClass({
  jl_Integer$: 0
}, false, "java.lang.Integer$", {
  jl_Integer$: 1,
  O: 1
});
$c_jl_Integer$.prototype.$classData = $d_jl_Integer$;
var $n_jl_Integer$ = (void 0);
function $m_jl_Integer$() {
  if ((!$n_jl_Integer$)) {
    $n_jl_Integer$ = new $c_jl_Integer$().init___()
  };
  return $n_jl_Integer$
}
/** @constructor */
function $c_jl_Number() {
  $c_O.call(this)
}
$c_jl_Number.prototype = new $h_O();
$c_jl_Number.prototype.constructor = $c_jl_Number;
/** @constructor */
function $h_jl_Number() {
  /*<skip>*/
}
$h_jl_Number.prototype = $c_jl_Number.prototype;
function $is_jl_Number(obj) {
  return (!(!(((obj && obj.$classData) && obj.$classData.ancestors.jl_Number) || ((typeof obj) === "number"))))
}
function $as_jl_Number(obj) {
  return (($is_jl_Number(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Number"))
}
function $isArrayOf_jl_Number(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Number)))
}
function $asArrayOf_jl_Number(obj, depth) {
  return (($isArrayOf_jl_Number(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Number;", depth))
}
/** @constructor */
function $c_jl_System$() {
  $c_O.call(this);
  this.out$1 = null;
  this.err$1 = null;
  this.in$1 = null;
  this.getHighPrecisionTime$1 = null
}
$c_jl_System$.prototype = new $h_O();
$c_jl_System$.prototype.constructor = $c_jl_System$;
/** @constructor */
function $h_jl_System$() {
  /*<skip>*/
}
$h_jl_System$.prototype = $c_jl_System$.prototype;
$c_jl_System$.prototype.init___ = (function() {
  $n_jl_System$ = this;
  this.out$1 = new $c_jl_JSConsoleBasedPrintStream().init___jl_Boolean(false);
  this.err$1 = new $c_jl_JSConsoleBasedPrintStream().init___jl_Boolean(true);
  this.in$1 = null;
  var x = $g.performance;
  if ($uZ((!(!x)))) {
    var x$1 = $g.performance.now;
    if ($uZ((!(!x$1)))) {
      var jsx$1 = (function() {
        return $uD($g.performance.now())
      })
    } else {
      var x$2 = $g.performance.webkitNow;
      if ($uZ((!(!x$2)))) {
        var jsx$1 = (function() {
          return $uD($g.performance.webkitNow())
        })
      } else {
        var jsx$1 = (function() {
          return $uD(new $g.Date().getTime())
        })
      }
    }
  } else {
    var jsx$1 = (function() {
      return $uD(new $g.Date().getTime())
    })
  };
  this.getHighPrecisionTime$1 = jsx$1;
  return this
});
$c_jl_System$.prototype.currentTimeMillis__J = (function() {
  return $m_sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong($uD(new $g.Date().getTime()))
});
var $d_jl_System$ = new $TypeData().initClass({
  jl_System$: 0
}, false, "java.lang.System$", {
  jl_System$: 1,
  O: 1
});
$c_jl_System$.prototype.$classData = $d_jl_System$;
var $n_jl_System$ = (void 0);
function $m_jl_System$() {
  if ((!$n_jl_System$)) {
    $n_jl_System$ = new $c_jl_System$().init___()
  };
  return $n_jl_System$
}
/** @constructor */
function $c_ju_Arrays$() {
  $c_O.call(this);
  this.qSortThreshold$1 = 0
}
$c_ju_Arrays$.prototype = new $h_O();
$c_ju_Arrays$.prototype.constructor = $c_ju_Arrays$;
/** @constructor */
function $h_ju_Arrays$() {
  /*<skip>*/
}
$h_ju_Arrays$.prototype = $c_ju_Arrays$.prototype;
$c_ju_Arrays$.prototype.init___ = (function() {
  return this
});
$c_ju_Arrays$.prototype.fill__AI__I__V = (function(a, value) {
  var toIndex = a.u.length;
  var i = 0;
  while ((i !== toIndex)) {
    a.u[i] = value;
    i = ((1 + i) | 0)
  }
});
var $d_ju_Arrays$ = new $TypeData().initClass({
  ju_Arrays$: 0
}, false, "java.util.Arrays$", {
  ju_Arrays$: 1,
  O: 1
});
$c_ju_Arrays$.prototype.$classData = $d_ju_Arrays$;
var $n_ju_Arrays$ = (void 0);
function $m_ju_Arrays$() {
  if ((!$n_ju_Arrays$)) {
    $n_ju_Arrays$ = new $c_ju_Arrays$().init___()
  };
  return $n_ju_Arrays$
}
/** @constructor */
function $c_s_DeprecatedConsole() {
  $c_O.call(this)
}
$c_s_DeprecatedConsole.prototype = new $h_O();
$c_s_DeprecatedConsole.prototype.constructor = $c_s_DeprecatedConsole;
/** @constructor */
function $h_s_DeprecatedConsole() {
  /*<skip>*/
}
$h_s_DeprecatedConsole.prototype = $c_s_DeprecatedConsole.prototype;
/** @constructor */
function $c_s_FallbackArrayBuilding() {
  $c_O.call(this)
}
$c_s_FallbackArrayBuilding.prototype = new $h_O();
$c_s_FallbackArrayBuilding.prototype.constructor = $c_s_FallbackArrayBuilding;
/** @constructor */
function $h_s_FallbackArrayBuilding() {
  /*<skip>*/
}
$h_s_FallbackArrayBuilding.prototype = $c_s_FallbackArrayBuilding.prototype;
/** @constructor */
function $c_s_LowPriorityImplicits() {
  $c_O.call(this)
}
$c_s_LowPriorityImplicits.prototype = new $h_O();
$c_s_LowPriorityImplicits.prototype.constructor = $c_s_LowPriorityImplicits;
/** @constructor */
function $h_s_LowPriorityImplicits() {
  /*<skip>*/
}
$h_s_LowPriorityImplicits.prototype = $c_s_LowPriorityImplicits.prototype;
/** @constructor */
function $c_s_math_Ordered$() {
  $c_O.call(this)
}
$c_s_math_Ordered$.prototype = new $h_O();
$c_s_math_Ordered$.prototype.constructor = $c_s_math_Ordered$;
/** @constructor */
function $h_s_math_Ordered$() {
  /*<skip>*/
}
$h_s_math_Ordered$.prototype = $c_s_math_Ordered$.prototype;
$c_s_math_Ordered$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Ordered$ = new $TypeData().initClass({
  s_math_Ordered$: 0
}, false, "scala.math.Ordered$", {
  s_math_Ordered$: 1,
  O: 1
});
$c_s_math_Ordered$.prototype.$classData = $d_s_math_Ordered$;
var $n_s_math_Ordered$ = (void 0);
function $m_s_math_Ordered$() {
  if ((!$n_s_math_Ordered$)) {
    $n_s_math_Ordered$ = new $c_s_math_Ordered$().init___()
  };
  return $n_s_math_Ordered$
}
/** @constructor */
function $c_s_package$() {
  $c_O.call(this);
  this.AnyRef$1 = null;
  this.Traversable$1 = null;
  this.Iterable$1 = null;
  this.Seq$1 = null;
  this.IndexedSeq$1 = null;
  this.Iterator$1 = null;
  this.List$1 = null;
  this.Nil$1 = null;
  this.$$colon$colon$1 = null;
  this.$$plus$colon$1 = null;
  this.$$colon$plus$1 = null;
  this.Stream$1 = null;
  this.$$hash$colon$colon$1 = null;
  this.Vector$1 = null;
  this.StringBuilder$1 = null;
  this.Range$1 = null;
  this.BigDecimal$1 = null;
  this.BigInt$1 = null;
  this.Equiv$1 = null;
  this.Fractional$1 = null;
  this.Integral$1 = null;
  this.Numeric$1 = null;
  this.Ordered$1 = null;
  this.Ordering$1 = null;
  this.Either$1 = null;
  this.Left$1 = null;
  this.Right$1 = null;
  this.bitmap$0$1 = 0
}
$c_s_package$.prototype = new $h_O();
$c_s_package$.prototype.constructor = $c_s_package$;
/** @constructor */
function $h_s_package$() {
  /*<skip>*/
}
$h_s_package$.prototype = $c_s_package$.prototype;
$c_s_package$.prototype.init___ = (function() {
  $n_s_package$ = this;
  this.AnyRef$1 = new $c_s_package$$anon$1().init___();
  this.Traversable$1 = $m_sc_Traversable$();
  this.Iterable$1 = $m_sc_Iterable$();
  this.Seq$1 = $m_sc_Seq$();
  this.IndexedSeq$1 = $m_sc_IndexedSeq$();
  this.Iterator$1 = $m_sc_Iterator$();
  this.List$1 = $m_sci_List$();
  this.Nil$1 = $m_sci_Nil$();
  this.$$colon$colon$1 = $m_sci_$colon$colon$();
  this.$$plus$colon$1 = $m_sc_$plus$colon$();
  this.$$colon$plus$1 = $m_sc_$colon$plus$();
  this.Stream$1 = $m_sci_Stream$();
  this.$$hash$colon$colon$1 = $m_sci_Stream$$hash$colon$colon$();
  this.Vector$1 = $m_sci_Vector$();
  this.StringBuilder$1 = $m_scm_StringBuilder$();
  this.Range$1 = $m_sci_Range$();
  this.Equiv$1 = $m_s_math_Equiv$();
  this.Fractional$1 = $m_s_math_Fractional$();
  this.Integral$1 = $m_s_math_Integral$();
  this.Numeric$1 = $m_s_math_Numeric$();
  this.Ordered$1 = $m_s_math_Ordered$();
  this.Ordering$1 = $m_s_math_Ordering$();
  this.Either$1 = $m_s_util_Either$();
  this.Left$1 = $m_s_util_Left$();
  this.Right$1 = $m_s_util_Right$();
  return this
});
var $d_s_package$ = new $TypeData().initClass({
  s_package$: 0
}, false, "scala.package$", {
  s_package$: 1,
  O: 1
});
$c_s_package$.prototype.$classData = $d_s_package$;
var $n_s_package$ = (void 0);
function $m_s_package$() {
  if ((!$n_s_package$)) {
    $n_s_package$ = new $c_s_package$().init___()
  };
  return $n_s_package$
}
/** @constructor */
function $c_s_reflect_ClassManifestFactory$() {
  $c_O.call(this);
  this.Byte$1 = null;
  this.Short$1 = null;
  this.Char$1 = null;
  this.Int$1 = null;
  this.Long$1 = null;
  this.Float$1 = null;
  this.Double$1 = null;
  this.Boolean$1 = null;
  this.Unit$1 = null;
  this.Any$1 = null;
  this.Object$1 = null;
  this.AnyVal$1 = null;
  this.Nothing$1 = null;
  this.Null$1 = null
}
$c_s_reflect_ClassManifestFactory$.prototype = new $h_O();
$c_s_reflect_ClassManifestFactory$.prototype.constructor = $c_s_reflect_ClassManifestFactory$;
/** @constructor */
function $h_s_reflect_ClassManifestFactory$() {
  /*<skip>*/
}
$h_s_reflect_ClassManifestFactory$.prototype = $c_s_reflect_ClassManifestFactory$.prototype;
$c_s_reflect_ClassManifestFactory$.prototype.init___ = (function() {
  $n_s_reflect_ClassManifestFactory$ = this;
  this.Byte$1 = $m_s_reflect_ManifestFactory$ByteManifest$();
  this.Short$1 = $m_s_reflect_ManifestFactory$ShortManifest$();
  this.Char$1 = $m_s_reflect_ManifestFactory$CharManifest$();
  this.Int$1 = $m_s_reflect_ManifestFactory$IntManifest$();
  this.Long$1 = $m_s_reflect_ManifestFactory$LongManifest$();
  this.Float$1 = $m_s_reflect_ManifestFactory$FloatManifest$();
  this.Double$1 = $m_s_reflect_ManifestFactory$DoubleManifest$();
  this.Boolean$1 = $m_s_reflect_ManifestFactory$BooleanManifest$();
  this.Unit$1 = $m_s_reflect_ManifestFactory$UnitManifest$();
  this.Any$1 = $m_s_reflect_ManifestFactory$AnyManifest$();
  this.Object$1 = $m_s_reflect_ManifestFactory$ObjectManifest$();
  this.AnyVal$1 = $m_s_reflect_ManifestFactory$AnyValManifest$();
  this.Nothing$1 = $m_s_reflect_ManifestFactory$NothingManifest$();
  this.Null$1 = $m_s_reflect_ManifestFactory$NullManifest$();
  return this
});
var $d_s_reflect_ClassManifestFactory$ = new $TypeData().initClass({
  s_reflect_ClassManifestFactory$: 0
}, false, "scala.reflect.ClassManifestFactory$", {
  s_reflect_ClassManifestFactory$: 1,
  O: 1
});
$c_s_reflect_ClassManifestFactory$.prototype.$classData = $d_s_reflect_ClassManifestFactory$;
var $n_s_reflect_ClassManifestFactory$ = (void 0);
function $m_s_reflect_ClassManifestFactory$() {
  if ((!$n_s_reflect_ClassManifestFactory$)) {
    $n_s_reflect_ClassManifestFactory$ = new $c_s_reflect_ClassManifestFactory$().init___()
  };
  return $n_s_reflect_ClassManifestFactory$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$() {
  $c_O.call(this)
}
$c_s_reflect_ManifestFactory$.prototype = new $h_O();
$c_s_reflect_ManifestFactory$.prototype.constructor = $c_s_reflect_ManifestFactory$;
/** @constructor */
function $h_s_reflect_ManifestFactory$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$.prototype = $c_s_reflect_ManifestFactory$.prototype;
$c_s_reflect_ManifestFactory$.prototype.init___ = (function() {
  return this
});
var $d_s_reflect_ManifestFactory$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$: 0
}, false, "scala.reflect.ManifestFactory$", {
  s_reflect_ManifestFactory$: 1,
  O: 1
});
$c_s_reflect_ManifestFactory$.prototype.$classData = $d_s_reflect_ManifestFactory$;
var $n_s_reflect_ManifestFactory$ = (void 0);
function $m_s_reflect_ManifestFactory$() {
  if ((!$n_s_reflect_ManifestFactory$)) {
    $n_s_reflect_ManifestFactory$ = new $c_s_reflect_ManifestFactory$().init___()
  };
  return $n_s_reflect_ManifestFactory$
}
/** @constructor */
function $c_s_reflect_package$() {
  $c_O.call(this);
  this.ClassManifest$1 = null;
  this.Manifest$1 = null
}
$c_s_reflect_package$.prototype = new $h_O();
$c_s_reflect_package$.prototype.constructor = $c_s_reflect_package$;
/** @constructor */
function $h_s_reflect_package$() {
  /*<skip>*/
}
$h_s_reflect_package$.prototype = $c_s_reflect_package$.prototype;
$c_s_reflect_package$.prototype.init___ = (function() {
  $n_s_reflect_package$ = this;
  this.ClassManifest$1 = $m_s_reflect_ClassManifestFactory$();
  this.Manifest$1 = $m_s_reflect_ManifestFactory$();
  return this
});
var $d_s_reflect_package$ = new $TypeData().initClass({
  s_reflect_package$: 0
}, false, "scala.reflect.package$", {
  s_reflect_package$: 1,
  O: 1
});
$c_s_reflect_package$.prototype.$classData = $d_s_reflect_package$;
var $n_s_reflect_package$ = (void 0);
function $m_s_reflect_package$() {
  if ((!$n_s_reflect_package$)) {
    $n_s_reflect_package$ = new $c_s_reflect_package$().init___()
  };
  return $n_s_reflect_package$
}
/** @constructor */
function $c_s_util_DynamicVariable() {
  $c_O.call(this);
  this.v$1 = null
}
$c_s_util_DynamicVariable.prototype = new $h_O();
$c_s_util_DynamicVariable.prototype.constructor = $c_s_util_DynamicVariable;
/** @constructor */
function $h_s_util_DynamicVariable() {
  /*<skip>*/
}
$h_s_util_DynamicVariable.prototype = $c_s_util_DynamicVariable.prototype;
$c_s_util_DynamicVariable.prototype.toString__T = (function() {
  return (("DynamicVariable(" + this.v$1) + ")")
});
$c_s_util_DynamicVariable.prototype.init___O = (function(init) {
  this.v$1 = init;
  return this
});
var $d_s_util_DynamicVariable = new $TypeData().initClass({
  s_util_DynamicVariable: 0
}, false, "scala.util.DynamicVariable", {
  s_util_DynamicVariable: 1,
  O: 1
});
$c_s_util_DynamicVariable.prototype.$classData = $d_s_util_DynamicVariable;
/** @constructor */
function $c_s_util_Either$() {
  $c_O.call(this)
}
$c_s_util_Either$.prototype = new $h_O();
$c_s_util_Either$.prototype.constructor = $c_s_util_Either$;
/** @constructor */
function $h_s_util_Either$() {
  /*<skip>*/
}
$h_s_util_Either$.prototype = $c_s_util_Either$.prototype;
$c_s_util_Either$.prototype.init___ = (function() {
  return this
});
var $d_s_util_Either$ = new $TypeData().initClass({
  s_util_Either$: 0
}, false, "scala.util.Either$", {
  s_util_Either$: 1,
  O: 1
});
$c_s_util_Either$.prototype.$classData = $d_s_util_Either$;
var $n_s_util_Either$ = (void 0);
function $m_s_util_Either$() {
  if ((!$n_s_util_Either$)) {
    $n_s_util_Either$ = new $c_s_util_Either$().init___()
  };
  return $n_s_util_Either$
}
/** @constructor */
function $c_s_util_control_Breaks() {
  $c_O.call(this);
  this.scala$util$control$Breaks$$breakException$1 = null
}
$c_s_util_control_Breaks.prototype = new $h_O();
$c_s_util_control_Breaks.prototype.constructor = $c_s_util_control_Breaks;
/** @constructor */
function $h_s_util_control_Breaks() {
  /*<skip>*/
}
$h_s_util_control_Breaks.prototype = $c_s_util_control_Breaks.prototype;
$c_s_util_control_Breaks.prototype.init___ = (function() {
  this.scala$util$control$Breaks$$breakException$1 = new $c_s_util_control_BreakControl().init___();
  return this
});
var $d_s_util_control_Breaks = new $TypeData().initClass({
  s_util_control_Breaks: 0
}, false, "scala.util.control.Breaks", {
  s_util_control_Breaks: 1,
  O: 1
});
$c_s_util_control_Breaks.prototype.$classData = $d_s_util_control_Breaks;
function $s_s_util_control_NoStackTrace$class__fillInStackTrace__s_util_control_NoStackTrace__jl_Throwable($$this) {
  var this$1 = $m_s_util_control_NoStackTrace$();
  if (this$1.$$undnoSuppression$1) {
    return $$this.scala$util$control$NoStackTrace$$super$fillInStackTrace__jl_Throwable()
  } else {
    return $as_jl_Throwable($$this)
  }
}
/** @constructor */
function $c_s_util_hashing_MurmurHash3() {
  $c_O.call(this)
}
$c_s_util_hashing_MurmurHash3.prototype = new $h_O();
$c_s_util_hashing_MurmurHash3.prototype.constructor = $c_s_util_hashing_MurmurHash3;
/** @constructor */
function $h_s_util_hashing_MurmurHash3() {
  /*<skip>*/
}
$h_s_util_hashing_MurmurHash3.prototype = $c_s_util_hashing_MurmurHash3.prototype;
$c_s_util_hashing_MurmurHash3.prototype.mixLast__I__I__I = (function(hash, data) {
  var k = data;
  k = $imul((-862048943), k);
  var i = k;
  k = ((i << 15) | ((i >>> (-15)) | 0));
  k = $imul(461845907, k);
  return (hash ^ k)
});
$c_s_util_hashing_MurmurHash3.prototype.mix__I__I__I = (function(hash, data) {
  var h = this.mixLast__I__I__I(hash, data);
  var i = h;
  h = ((i << 13) | ((i >>> (-13)) | 0));
  return (((-430675100) + $imul(5, h)) | 0)
});
$c_s_util_hashing_MurmurHash3.prototype.avalanche__p1__I__I = (function(hash) {
  var h = hash;
  h = (h ^ ((h >>> 16) | 0));
  h = $imul((-2048144789), h);
  h = (h ^ ((h >>> 13) | 0));
  h = $imul((-1028477387), h);
  h = (h ^ ((h >>> 16) | 0));
  return h
});
$c_s_util_hashing_MurmurHash3.prototype.unorderedHash__sc_TraversableOnce__I__I = (function(xs, seed) {
  var a = new $c_sr_IntRef().init___I(0);
  var b = new $c_sr_IntRef().init___I(0);
  var n = new $c_sr_IntRef().init___I(0);
  var c = new $c_sr_IntRef().init___I(1);
  xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, a$1, b$1, n$1, c$1) {
    return (function(x$2) {
      var h = $m_sr_ScalaRunTime$().hash__O__I(x$2);
      a$1.elem$1 = ((a$1.elem$1 + h) | 0);
      b$1.elem$1 = (b$1.elem$1 ^ h);
      if ((h !== 0)) {
        c$1.elem$1 = $imul(c$1.elem$1, h)
      };
      n$1.elem$1 = ((1 + n$1.elem$1) | 0)
    })
  })(this, a, b, n, c)));
  var h$1 = seed;
  h$1 = this.mix__I__I__I(h$1, a.elem$1);
  h$1 = this.mix__I__I__I(h$1, b.elem$1);
  h$1 = this.mixLast__I__I__I(h$1, c.elem$1);
  return this.finalizeHash__I__I__I(h$1, n.elem$1)
});
$c_s_util_hashing_MurmurHash3.prototype.productHash__s_Product__I__I = (function(x, seed) {
  var arr = x.productArity__I();
  if ((arr === 0)) {
    var this$1 = x.productPrefix__T();
    return $m_sjsr_RuntimeString$().hashCode__T__I(this$1)
  } else {
    var h = seed;
    var i = 0;
    while ((i < arr)) {
      h = this.mix__I__I__I(h, $m_sr_ScalaRunTime$().hash__O__I(x.productElement__I__O(i)));
      i = ((1 + i) | 0)
    };
    return this.finalizeHash__I__I__I(h, arr)
  }
});
$c_s_util_hashing_MurmurHash3.prototype.finalizeHash__I__I__I = (function(hash, length) {
  return this.avalanche__p1__I__I((hash ^ length))
});
$c_s_util_hashing_MurmurHash3.prototype.orderedHash__sc_TraversableOnce__I__I = (function(xs, seed) {
  var n = new $c_sr_IntRef().init___I(0);
  var h = new $c_sr_IntRef().init___I(seed);
  xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, n$1, h$1) {
    return (function(x$2) {
      h$1.elem$1 = $this.mix__I__I__I(h$1.elem$1, $m_sr_ScalaRunTime$().hash__O__I(x$2));
      n$1.elem$1 = ((1 + n$1.elem$1) | 0)
    })
  })(this, n, h)));
  return this.finalizeHash__I__I__I(h.elem$1, n.elem$1)
});
$c_s_util_hashing_MurmurHash3.prototype.listHash__sci_List__I__I = (function(xs, seed) {
  var n = 0;
  var h = seed;
  var elems = xs;
  while ((!elems.isEmpty__Z())) {
    var head = elems.head__O();
    var this$1 = elems;
    var tail = this$1.tail__sci_List();
    h = this.mix__I__I__I(h, $m_sr_ScalaRunTime$().hash__O__I(head));
    n = ((1 + n) | 0);
    elems = tail
  };
  return this.finalizeHash__I__I__I(h, n)
});
/** @constructor */
function $c_s_util_hashing_package$() {
  $c_O.call(this)
}
$c_s_util_hashing_package$.prototype = new $h_O();
$c_s_util_hashing_package$.prototype.constructor = $c_s_util_hashing_package$;
/** @constructor */
function $h_s_util_hashing_package$() {
  /*<skip>*/
}
$h_s_util_hashing_package$.prototype = $c_s_util_hashing_package$.prototype;
$c_s_util_hashing_package$.prototype.init___ = (function() {
  return this
});
$c_s_util_hashing_package$.prototype.byteswap32__I__I = (function(v) {
  var hc = $imul((-1640532531), v);
  hc = $m_jl_Integer$().reverseBytes__I__I(hc);
  return $imul((-1640532531), hc)
});
var $d_s_util_hashing_package$ = new $TypeData().initClass({
  s_util_hashing_package$: 0
}, false, "scala.util.hashing.package$", {
  s_util_hashing_package$: 1,
  O: 1
});
$c_s_util_hashing_package$.prototype.$classData = $d_s_util_hashing_package$;
var $n_s_util_hashing_package$ = (void 0);
function $m_s_util_hashing_package$() {
  if ((!$n_s_util_hashing_package$)) {
    $n_s_util_hashing_package$ = new $c_s_util_hashing_package$().init___()
  };
  return $n_s_util_hashing_package$
}
/** @constructor */
function $c_sc_$colon$plus$() {
  $c_O.call(this)
}
$c_sc_$colon$plus$.prototype = new $h_O();
$c_sc_$colon$plus$.prototype.constructor = $c_sc_$colon$plus$;
/** @constructor */
function $h_sc_$colon$plus$() {
  /*<skip>*/
}
$h_sc_$colon$plus$.prototype = $c_sc_$colon$plus$.prototype;
$c_sc_$colon$plus$.prototype.init___ = (function() {
  return this
});
var $d_sc_$colon$plus$ = new $TypeData().initClass({
  sc_$colon$plus$: 0
}, false, "scala.collection.$colon$plus$", {
  sc_$colon$plus$: 1,
  O: 1
});
$c_sc_$colon$plus$.prototype.$classData = $d_sc_$colon$plus$;
var $n_sc_$colon$plus$ = (void 0);
function $m_sc_$colon$plus$() {
  if ((!$n_sc_$colon$plus$)) {
    $n_sc_$colon$plus$ = new $c_sc_$colon$plus$().init___()
  };
  return $n_sc_$colon$plus$
}
/** @constructor */
function $c_sc_$plus$colon$() {
  $c_O.call(this)
}
$c_sc_$plus$colon$.prototype = new $h_O();
$c_sc_$plus$colon$.prototype.constructor = $c_sc_$plus$colon$;
/** @constructor */
function $h_sc_$plus$colon$() {
  /*<skip>*/
}
$h_sc_$plus$colon$.prototype = $c_sc_$plus$colon$.prototype;
$c_sc_$plus$colon$.prototype.init___ = (function() {
  return this
});
var $d_sc_$plus$colon$ = new $TypeData().initClass({
  sc_$plus$colon$: 0
}, false, "scala.collection.$plus$colon$", {
  sc_$plus$colon$: 1,
  O: 1
});
$c_sc_$plus$colon$.prototype.$classData = $d_sc_$plus$colon$;
var $n_sc_$plus$colon$ = (void 0);
function $m_sc_$plus$colon$() {
  if ((!$n_sc_$plus$colon$)) {
    $n_sc_$plus$colon$ = new $c_sc_$plus$colon$().init___()
  };
  return $n_sc_$plus$colon$
}
function $s_sc_GenSeqLike$class__equals__sc_GenSeqLike__O__Z($$this, that) {
  if ($is_sc_GenSeq(that)) {
    var x2 = $as_sc_GenSeq(that);
    return $$this.sameElements__sc_GenIterable__Z(x2)
  } else {
    return false
  }
}
function $s_sc_GenSetLike$class__liftedTree1$1__p0__sc_GenSetLike__sc_GenSet__Z($$this, x2$1) {
  try {
    return $$this.subsetOf__sc_GenSet__Z(x2$1)
  } catch (e) {
    if ($is_jl_ClassCastException(e)) {
      $as_jl_ClassCastException(e);
      return false
    } else {
      throw e
    }
  }
}
function $s_sc_GenSetLike$class__equals__sc_GenSetLike__O__Z($$this, that) {
  if ($is_sc_GenSet(that)) {
    var x2 = $as_sc_GenSet(that);
    return (($$this === x2) || (($$this.size__I() === x2.size__I()) && $s_sc_GenSetLike$class__liftedTree1$1__p0__sc_GenSetLike__sc_GenSet__Z($$this, x2)))
  } else {
    return false
  }
}
function $s_sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I($$this, len) {
  return (($$this.length__I() - len) | 0)
}
function $s_sc_IndexedSeqOptimized$class__copyToArray__sc_IndexedSeqOptimized__O__I__I__V($$this, xs, start, len) {
  var i = 0;
  var j = start;
  var $$this$1 = $$this.length__I();
  var $$this$2 = (($$this$1 < len) ? $$this$1 : len);
  var that = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var end = (($$this$2 < that) ? $$this$2 : that);
  while ((i < end)) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, j, $$this.apply__I__O(i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  }
}
function $s_sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z($$this, that) {
  if ($is_sc_IndexedSeq(that)) {
    var x2 = $as_sc_IndexedSeq(that);
    var len = $$this.length__I();
    if ((len === x2.length__I())) {
      var i = 0;
      while (((i < len) && $m_sr_BoxesRunTime$().equals__O__O__Z($$this.apply__I__O(i), x2.apply__I__O(i)))) {
        i = ((1 + i) | 0)
      };
      return (i === len)
    } else {
      return false
    }
  } else {
    return $s_sc_IterableLike$class__sameElements__sc_IterableLike__sc_GenIterable__Z($$this, that)
  }
}
function $s_sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V($$this, f) {
  var i = 0;
  var len = $$this.length__I();
  while ((i < len)) {
    f.apply__O__O($$this.apply__I__O(i));
    i = ((1 + i) | 0)
  }
}
function $s_sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z($$this) {
  return ($$this.length__I() === 0)
}
function $s_sc_IterableLike$class__copyToArray__sc_IterableLike__O__I__I__V($$this, xs, start, len) {
  var i = start;
  var $$this$1 = ((start + len) | 0);
  var that = $m_sr_ScalaRunTime$().array$undlength__O__I(xs);
  var end = (($$this$1 < that) ? $$this$1 : that);
  var it = $$this.iterator__sc_Iterator();
  while (((i < end) && it.hasNext__Z())) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, i, it.next__O());
    i = ((1 + i) | 0)
  }
}
function $s_sc_IterableLike$class__take__sc_IterableLike__I__O($$this, n) {
  var b = $$this.newBuilder__scm_Builder();
  if ((n <= 0)) {
    return b.result__O()
  } else {
    $s_scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(b, n, $$this);
    var i = 0;
    var it = $$this.iterator__sc_Iterator();
    while (((i < n) && it.hasNext__Z())) {
      b.$$plus$eq__O__scm_Builder(it.next__O());
      i = ((1 + i) | 0)
    };
    return b.result__O()
  }
}
function $s_sc_IterableLike$class__sameElements__sc_IterableLike__sc_GenIterable__Z($$this, that) {
  var these = $$this.iterator__sc_Iterator();
  var those = that.iterator__sc_Iterator();
  while ((these.hasNext__Z() && those.hasNext__Z())) {
    if ((!$m_sr_BoxesRunTime$().equals__O__O__Z(these.next__O(), those.next__O()))) {
      return false
    }
  };
  return ((!these.hasNext__Z()) && (!those.hasNext__Z()))
}
/** @constructor */
function $c_sc_Iterator$() {
  $c_O.call(this);
  this.empty$1 = null
}
$c_sc_Iterator$.prototype = new $h_O();
$c_sc_Iterator$.prototype.constructor = $c_sc_Iterator$;
/** @constructor */
function $h_sc_Iterator$() {
  /*<skip>*/
}
$h_sc_Iterator$.prototype = $c_sc_Iterator$.prototype;
$c_sc_Iterator$.prototype.init___ = (function() {
  $n_sc_Iterator$ = this;
  this.empty$1 = new $c_sc_Iterator$$anon$2().init___();
  return this
});
var $d_sc_Iterator$ = new $TypeData().initClass({
  sc_Iterator$: 0
}, false, "scala.collection.Iterator$", {
  sc_Iterator$: 1,
  O: 1
});
$c_sc_Iterator$.prototype.$classData = $d_sc_Iterator$;
var $n_sc_Iterator$ = (void 0);
function $m_sc_Iterator$() {
  if ((!$n_sc_Iterator$)) {
    $n_sc_Iterator$ = new $c_sc_Iterator$().init___()
  };
  return $n_sc_Iterator$
}
function $s_sc_Iterator$class__toStream__sc_Iterator__sci_Stream($$this) {
  if ($$this.hasNext__Z()) {
    var hd = $$this.next__O();
    var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($$this$1) {
      return (function() {
        return $$this$1.toStream__sci_Stream()
      })
    })($$this));
    return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
  } else {
    $m_sci_Stream$();
    return $m_sci_Stream$Empty$()
  }
}
function $s_sc_Iterator$class__isEmpty__sc_Iterator__Z($$this) {
  return (!$$this.hasNext__Z())
}
function $s_sc_Iterator$class__toString__sc_Iterator__T($$this) {
  return (($$this.hasNext__Z() ? "non-empty" : "empty") + " iterator")
}
function $s_sc_Iterator$class__copyToArray__sc_Iterator__O__I__I__V($$this, xs, start, len) {
  var requirement = ((start >= 0) && ((start < $m_sr_ScalaRunTime$().array$undlength__O__I(xs)) || ($m_sr_ScalaRunTime$().array$undlength__O__I(xs) === 0)));
  if ((!requirement)) {
    throw new $c_jl_IllegalArgumentException().init___T(("requirement failed: " + new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["start ", " out of range ", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([start, $m_sr_ScalaRunTime$().array$undlength__O__I(xs)]))))
  };
  var i = start;
  var y = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var end = ((start + ((len < y) ? len : y)) | 0);
  while (((i < end) && $$this.hasNext__Z())) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, i, $$this.next__O());
    i = ((1 + i) | 0)
  }
}
function $s_sc_Iterator$class__foreach__sc_Iterator__F1__V($$this, f) {
  while ($$this.hasNext__Z()) {
    f.apply__O__O($$this.next__O())
  }
}
function $s_sc_Iterator$class__forall__sc_Iterator__F1__Z($$this, p) {
  var res = true;
  while ((res && $$this.hasNext__Z())) {
    res = $uZ(p.apply__O__O($$this.next__O()))
  };
  return res
}
function $s_sc_LinearSeqOptimized$class__lengthCompare__sc_LinearSeqOptimized__I__I($$this, len) {
  return ((len < 0) ? 1 : $s_sc_LinearSeqOptimized$class__loop$1__p0__sc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I($$this, 0, $$this, len))
}
function $s_sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O($$this, n) {
  var rest = $$this.drop__I__sc_LinearSeqOptimized(n);
  if (((n < 0) || rest.isEmpty__Z())) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
  };
  return rest.head__O()
}
function $s_sc_LinearSeqOptimized$class__loop$1__p0__sc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I($$this, i, xs, len$1) {
  _loop: while (true) {
    if ((i === len$1)) {
      return (xs.isEmpty__Z() ? 0 : 1)
    } else if (xs.isEmpty__Z()) {
      return (-1)
    } else {
      var temp$i = ((1 + i) | 0);
      var temp$xs = $as_sc_LinearSeqOptimized(xs.tail__O());
      i = temp$i;
      xs = temp$xs;
      continue _loop
    }
  }
}
function $s_sc_LinearSeqOptimized$class__length__sc_LinearSeqOptimized__I($$this) {
  var these = $$this;
  var len = 0;
  while ((!these.isEmpty__Z())) {
    len = ((1 + len) | 0);
    these = $as_sc_LinearSeqOptimized(these.tail__O())
  };
  return len
}
function $s_sc_LinearSeqOptimized$class__sameElements__sc_LinearSeqOptimized__sc_GenIterable__Z($$this, that) {
  if ($is_sc_LinearSeq(that)) {
    var x2 = $as_sc_LinearSeq(that);
    if (($$this === x2)) {
      return true
    } else {
      var these = $$this;
      var those = x2;
      while ((((!these.isEmpty__Z()) && (!those.isEmpty__Z())) && $m_sr_BoxesRunTime$().equals__O__O__Z(these.head__O(), those.head__O()))) {
        these = $as_sc_LinearSeqOptimized(these.tail__O());
        those = $as_sc_LinearSeq(those.tail__O())
      };
      return (these.isEmpty__Z() && those.isEmpty__Z())
    }
  } else {
    return $s_sc_IterableLike$class__sameElements__sc_IterableLike__sc_GenIterable__Z($$this, that)
  }
}
function $s_sc_SeqLike$class__isEmpty__sc_SeqLike__Z($$this) {
  return ($$this.lengthCompare__I__I(0) === 0)
}
function $s_sc_SeqLike$class__$$plus$colon__sc_SeqLike__O__scg_CanBuildFrom__O($$this, elem, bf) {
  var b = bf.apply__O__scm_Builder($$this.repr__O());
  b.$$plus$eq__O__scm_Builder(elem);
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($$this.thisCollection__sc_Seq());
  return b.result__O()
}
function $s_sc_SeqLike$class__reverse__sc_SeqLike__O($$this) {
  var elem = $m_sci_Nil$();
  var xs = new $c_sr_ObjectRef().init___O(elem);
  $$this.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, xs$1) {
    return (function(x$2) {
      var this$2 = $as_sci_List(xs$1.elem$1);
      xs$1.elem$1 = new $c_sci_$colon$colon().init___O__sci_List(x$2, this$2)
    })
  })($$this, xs)));
  var b = $$this.newBuilder__scm_Builder();
  $s_scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__V(b, $$this);
  var this$3 = $as_sci_List(xs.elem$1);
  var these = this$3;
  while ((!these.isEmpty__Z())) {
    var arg1 = these.head__O();
    b.$$plus$eq__O__scm_Builder(arg1);
    var this$4 = these;
    these = this$4.tail__sci_List()
  };
  return b.result__O()
}
function $s_sc_SeqLike$class__$$colon$plus__sc_SeqLike__O__scg_CanBuildFrom__O($$this, elem, bf) {
  var b = bf.apply__O__scm_Builder($$this.repr__O());
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($$this.thisCollection__sc_Seq());
  b.$$plus$eq__O__scm_Builder(elem);
  return b.result__O()
}
function $s_sc_SetLike$class__isEmpty__sc_SetLike__Z($$this) {
  return ($$this.size__I() === 0)
}
function $s_sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O($$this, cbf) {
  var b = cbf.apply__scm_Builder();
  $s_scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__V(b, $$this);
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($$this.thisCollection__sc_Traversable());
  return b.result__O()
}
function $s_sc_TraversableLike$class__toString__sc_TraversableLike__T($$this) {
  return $$this.mkString__T__T__T__T(($$this.stringPrefix__T() + "("), ", ", ")")
}
function $s_sc_TraversableLike$class__flatMap__sc_TraversableLike__F1__scg_CanBuildFrom__O($$this, f, bf) {
  var b = bf.apply__O__scm_Builder($$this.repr__O());
  $$this.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, b$1, f$1) {
    return (function(x$2) {
      return $as_scm_Builder(b$1.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($as_sc_GenTraversableOnce(f$1.apply__O__O(x$2)).seq__sc_TraversableOnce()))
    })
  })($$this, b, f)));
  return b.result__O()
}
function $s_sc_TraversableLike$class__map__sc_TraversableLike__F1__scg_CanBuildFrom__O($$this, f, bf) {
  var b = $s_sc_TraversableLike$class__builder$1__p0__sc_TraversableLike__scg_CanBuildFrom__scm_Builder($$this, bf);
  $$this.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, b$1, f$1) {
    return (function(x$2) {
      return b$1.$$plus$eq__O__scm_Builder(f$1.apply__O__O(x$2))
    })
  })($$this, b, f)));
  return b.result__O()
}
function $s_sc_TraversableLike$class__$$plus$plus__sc_TraversableLike__sc_GenTraversableOnce__scg_CanBuildFrom__O($$this, that, bf) {
  var b = bf.apply__O__scm_Builder($$this.repr__O());
  if ($is_sc_IndexedSeqLike(that)) {
    var delta = that.seq__sc_TraversableOnce().size__I();
    $s_scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__I__V(b, $$this, delta)
  };
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($$this.thisCollection__sc_Traversable());
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(that.seq__sc_TraversableOnce());
  return b.result__O()
}
function $s_sc_TraversableLike$class__builder$1__p0__sc_TraversableLike__scg_CanBuildFrom__scm_Builder($$this, bf$1) {
  var b = bf$1.apply__O__scm_Builder($$this.repr__O());
  $s_scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__V(b, $$this);
  return b
}
function $s_sc_TraversableLike$class__stringPrefix__sc_TraversableLike__T($$this) {
  var string = $objectGetClass($$this.repr__O()).getName__T();
  var idx1 = $m_sjsr_RuntimeString$().lastIndexOf__T__I__I(string, 46);
  if ((idx1 !== (-1))) {
    var thiz = string;
    var beginIndex = ((1 + idx1) | 0);
    string = $as_T(thiz.substring(beginIndex))
  };
  var idx2 = $m_sjsr_RuntimeString$().indexOf__T__I__I(string, 36);
  if ((idx2 !== (-1))) {
    var thiz$1 = string;
    string = $as_T(thiz$1.substring(0, idx2))
  };
  return string
}
function $is_sc_TraversableOnce(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_TraversableOnce)))
}
function $as_sc_TraversableOnce(obj) {
  return (($is_sc_TraversableOnce(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.TraversableOnce"))
}
function $isArrayOf_sc_TraversableOnce(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_TraversableOnce)))
}
function $asArrayOf_sc_TraversableOnce(obj, depth) {
  return (($isArrayOf_sc_TraversableOnce(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.TraversableOnce;", depth))
}
function $s_sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder($$this, b, start, sep, end) {
  var first = new $c_sr_BooleanRef().init___Z(true);
  b.append__T__scm_StringBuilder(start);
  $$this.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, first$1, b$1, sep$1) {
    return (function(x$2) {
      if (first$1.elem$1) {
        b$1.append__O__scm_StringBuilder(x$2);
        first$1.elem$1 = false;
        return (void 0)
      } else {
        b$1.append__T__scm_StringBuilder(sep$1);
        return b$1.append__O__scm_StringBuilder(x$2)
      }
    })
  })($$this, first, b, sep)));
  b.append__T__scm_StringBuilder(end);
  return b
}
function $s_sc_TraversableOnce$class__to__sc_TraversableOnce__scg_CanBuildFrom__O($$this, cbf) {
  var b = cbf.apply__scm_Builder();
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($$this.seq__sc_TraversableOnce());
  return b.result__O()
}
function $s_sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T($$this, start, sep, end) {
  var this$1 = $$this.addString__scm_StringBuilder__T__T__T__scm_StringBuilder(new $c_scm_StringBuilder().init___(), start, sep, end);
  var this$2 = this$1.underlying$5;
  return this$2.content$1
}
function $s_sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z($$this) {
  return (!$$this.isEmpty__Z())
}
function $s_sc_TraversableOnce$class__size__sc_TraversableOnce__I($$this) {
  var result = new $c_sr_IntRef().init___I(0);
  $$this.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, result$1) {
    return (function(x$2) {
      result$1.elem$1 = ((1 + result$1.elem$1) | 0)
    })
  })($$this, result)));
  return result.elem$1
}
function $s_sc_TraversableOnce$class__copyToArray__sc_TraversableOnce__O__I__V($$this, xs, start) {
  $$this.copyToArray__O__I__I__V(xs, start, (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0))
}
/** @constructor */
function $c_scg_GenMapFactory() {
  $c_O.call(this)
}
$c_scg_GenMapFactory.prototype = new $h_O();
$c_scg_GenMapFactory.prototype.constructor = $c_scg_GenMapFactory;
/** @constructor */
function $h_scg_GenMapFactory() {
  /*<skip>*/
}
$h_scg_GenMapFactory.prototype = $c_scg_GenMapFactory.prototype;
/** @constructor */
function $c_scg_GenericCompanion() {
  $c_O.call(this)
}
$c_scg_GenericCompanion.prototype = new $h_O();
$c_scg_GenericCompanion.prototype.constructor = $c_scg_GenericCompanion;
/** @constructor */
function $h_scg_GenericCompanion() {
  /*<skip>*/
}
$h_scg_GenericCompanion.prototype = $c_scg_GenericCompanion.prototype;
function $is_scg_Growable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scg_Growable)))
}
function $as_scg_Growable(obj) {
  return (($is_scg_Growable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.generic.Growable"))
}
function $isArrayOf_scg_Growable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scg_Growable)))
}
function $asArrayOf_scg_Growable(obj, depth) {
  return (($isArrayOf_scg_Growable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.generic.Growable;", depth))
}
function $s_scg_Growable$class__loop$1__p0__scg_Growable__sc_LinearSeq__V($$this, xs) {
  x: {
    _loop: while (true) {
      var this$1 = xs;
      if ($s_sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)) {
        $$this.$$plus$eq__O__scg_Growable(xs.head__O());
        xs = $as_sc_LinearSeq(xs.tail__O());
        continue _loop
      };
      break x
    }
  }
}
function $s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable($$this, xs) {
  if ($is_sc_LinearSeq(xs)) {
    var x2 = $as_sc_LinearSeq(xs);
    $s_scg_Growable$class__loop$1__p0__scg_Growable__sc_LinearSeq__V($$this, x2)
  } else {
    xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1) {
      return (function(elem$2) {
        return $$this$1.$$plus$eq__O__scg_Growable(elem$2)
      })
    })($$this)))
  };
  return $$this
}
/** @constructor */
function $c_sci_Stream$$hash$colon$colon$() {
  $c_O.call(this)
}
$c_sci_Stream$$hash$colon$colon$.prototype = new $h_O();
$c_sci_Stream$$hash$colon$colon$.prototype.constructor = $c_sci_Stream$$hash$colon$colon$;
/** @constructor */
function $h_sci_Stream$$hash$colon$colon$() {
  /*<skip>*/
}
$h_sci_Stream$$hash$colon$colon$.prototype = $c_sci_Stream$$hash$colon$colon$.prototype;
$c_sci_Stream$$hash$colon$colon$.prototype.init___ = (function() {
  return this
});
var $d_sci_Stream$$hash$colon$colon$ = new $TypeData().initClass({
  sci_Stream$$hash$colon$colon$: 0
}, false, "scala.collection.immutable.Stream$$hash$colon$colon$", {
  sci_Stream$$hash$colon$colon$: 1,
  O: 1
});
$c_sci_Stream$$hash$colon$colon$.prototype.$classData = $d_sci_Stream$$hash$colon$colon$;
var $n_sci_Stream$$hash$colon$colon$ = (void 0);
function $m_sci_Stream$$hash$colon$colon$() {
  if ((!$n_sci_Stream$$hash$colon$colon$)) {
    $n_sci_Stream$$hash$colon$colon$ = new $c_sci_Stream$$hash$colon$colon$().init___()
  };
  return $n_sci_Stream$$hash$colon$colon$
}
/** @constructor */
function $c_sci_StreamIterator$LazyCell() {
  $c_O.call(this);
  this.st$1 = null;
  this.v$1 = null;
  this.$$outer$f = null;
  this.bitmap$0$1 = false
}
$c_sci_StreamIterator$LazyCell.prototype = new $h_O();
$c_sci_StreamIterator$LazyCell.prototype.constructor = $c_sci_StreamIterator$LazyCell;
/** @constructor */
function $h_sci_StreamIterator$LazyCell() {
  /*<skip>*/
}
$h_sci_StreamIterator$LazyCell.prototype = $c_sci_StreamIterator$LazyCell.prototype;
$c_sci_StreamIterator$LazyCell.prototype.init___sci_StreamIterator__F0 = (function($$outer, st) {
  this.st$1 = st;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  return this
});
$c_sci_StreamIterator$LazyCell.prototype.v$lzycompute__p1__sci_Stream = (function() {
  if ((!this.bitmap$0$1)) {
    this.v$1 = $as_sci_Stream(this.st$1.apply__O());
    this.bitmap$0$1 = true
  };
  this.st$1 = null;
  return this.v$1
});
$c_sci_StreamIterator$LazyCell.prototype.v__sci_Stream = (function() {
  return ((!this.bitmap$0$1) ? this.v$lzycompute__p1__sci_Stream() : this.v$1)
});
var $d_sci_StreamIterator$LazyCell = new $TypeData().initClass({
  sci_StreamIterator$LazyCell: 0
}, false, "scala.collection.immutable.StreamIterator$LazyCell", {
  sci_StreamIterator$LazyCell: 1,
  O: 1
});
$c_sci_StreamIterator$LazyCell.prototype.$classData = $d_sci_StreamIterator$LazyCell;
function $s_sci_VectorPointer$class__gotoFreshPosWritable1__sci_VectorPointer__I__I__I__V($$this, oldIndex, newIndex, xor) {
  $s_sci_VectorPointer$class__stabilize__sci_VectorPointer__I__V($$this, oldIndex);
  $s_sci_VectorPointer$class__gotoFreshPosWritable0__sci_VectorPointer__I__I__I__V($$this, oldIndex, newIndex, xor)
}
function $s_sci_VectorPointer$class__getElem__sci_VectorPointer__I__I__O($$this, index, xor) {
  if ((xor < 32)) {
    return $$this.display0__AO().u[(31 & index)]
  } else if ((xor < 1024)) {
    return $asArrayOf_O($$this.display1__AO().u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 32768)) {
    return $asArrayOf_O($asArrayOf_O($$this.display2__AO().u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 1048576)) {
    return $asArrayOf_O($asArrayOf_O($asArrayOf_O($$this.display3__AO().u[(31 & (index >> 15))], 1).u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 33554432)) {
    return $asArrayOf_O($asArrayOf_O($asArrayOf_O($asArrayOf_O($$this.display4__AO().u[(31 & (index >> 20))], 1).u[(31 & (index >> 15))], 1).u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 1073741824)) {
    return $asArrayOf_O($asArrayOf_O($asArrayOf_O($asArrayOf_O($asArrayOf_O($$this.display5__AO().u[(31 & (index >> 25))], 1).u[(31 & (index >> 20))], 1).u[(31 & (index >> 15))], 1).u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
}
function $s_sci_VectorPointer$class__gotoNextBlockStartWritable__sci_VectorPointer__I__I__V($$this, index, xor) {
  if ((xor < 1024)) {
    if (($$this.depth__I() === 1)) {
      $$this.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $$this.display1__AO().u[0] = $$this.display0__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO()
  } else if ((xor < 32768)) {
    if (($$this.depth__I() === 2)) {
      $$this.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $$this.display2__AO().u[0] = $$this.display1__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO()
  } else if ((xor < 1048576)) {
    if (($$this.depth__I() === 3)) {
      $$this.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $$this.display3__AO().u[0] = $$this.display2__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
    $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO()
  } else if ((xor < 33554432)) {
    if (($$this.depth__I() === 4)) {
      $$this.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $$this.display4__AO().u[0] = $$this.display3__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
    $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
    $$this.display4__AO().u[(31 & (index >> 20))] = $$this.display3__AO()
  } else if ((xor < 1073741824)) {
    if (($$this.depth__I() === 5)) {
      $$this.display5$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $$this.display5__AO().u[0] = $$this.display4__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
    $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
    $$this.display4__AO().u[(31 & (index >> 20))] = $$this.display3__AO();
    $$this.display5__AO().u[(31 & (index >> 25))] = $$this.display4__AO()
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
}
function $s_sci_VectorPointer$class__gotoPosWritable0__sci_VectorPointer__I__I__V($$this, newIndex, xor) {
  var x1 = (((-1) + $$this.depth__I()) | 0);
  switch (x1) {
    case 5: {
      var a = $$this.display5__AO();
      $$this.display5$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a));
      var array = $$this.display5__AO();
      var index = (31 & (newIndex >> 25));
      $$this.display4$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array, index));
      var array$1 = $$this.display4__AO();
      var index$1 = (31 & (newIndex >> 20));
      $$this.display3$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$1, index$1));
      var array$2 = $$this.display3__AO();
      var index$2 = (31 & (newIndex >> 15));
      $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$2, index$2));
      var array$3 = $$this.display2__AO();
      var index$3 = (31 & (newIndex >> 10));
      $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$3, index$3));
      var array$4 = $$this.display1__AO();
      var index$4 = (31 & (newIndex >> 5));
      $$this.display0$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$4, index$4));
      break
    }
    case 4: {
      var a$1 = $$this.display4__AO();
      $$this.display4$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$1));
      var array$5 = $$this.display4__AO();
      var index$5 = (31 & (newIndex >> 20));
      $$this.display3$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$5, index$5));
      var array$6 = $$this.display3__AO();
      var index$6 = (31 & (newIndex >> 15));
      $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$6, index$6));
      var array$7 = $$this.display2__AO();
      var index$7 = (31 & (newIndex >> 10));
      $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$7, index$7));
      var array$8 = $$this.display1__AO();
      var index$8 = (31 & (newIndex >> 5));
      $$this.display0$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$8, index$8));
      break
    }
    case 3: {
      var a$2 = $$this.display3__AO();
      $$this.display3$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$2));
      var array$9 = $$this.display3__AO();
      var index$9 = (31 & (newIndex >> 15));
      $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$9, index$9));
      var array$10 = $$this.display2__AO();
      var index$10 = (31 & (newIndex >> 10));
      $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$10, index$10));
      var array$11 = $$this.display1__AO();
      var index$11 = (31 & (newIndex >> 5));
      $$this.display0$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$11, index$11));
      break
    }
    case 2: {
      var a$3 = $$this.display2__AO();
      $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$3));
      var array$12 = $$this.display2__AO();
      var index$12 = (31 & (newIndex >> 10));
      $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$12, index$12));
      var array$13 = $$this.display1__AO();
      var index$13 = (31 & (newIndex >> 5));
      $$this.display0$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$13, index$13));
      break
    }
    case 1: {
      var a$4 = $$this.display1__AO();
      $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$4));
      var array$14 = $$this.display1__AO();
      var index$14 = (31 & (newIndex >> 5));
      $$this.display0$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$14, index$14));
      break
    }
    case 0: {
      var a$5 = $$this.display0__AO();
      $$this.display0$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$5));
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
}
function $s_sci_VectorPointer$class__debug__sci_VectorPointer__V($$this) {
  return (void 0)
}
function $s_sci_VectorPointer$class__stabilize__sci_VectorPointer__I__V($$this, index) {
  var x1 = (((-1) + $$this.depth__I()) | 0);
  switch (x1) {
    case 5: {
      var a = $$this.display5__AO();
      $$this.display5$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a));
      var a$1 = $$this.display4__AO();
      $$this.display4$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$1));
      var a$2 = $$this.display3__AO();
      $$this.display3$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$2));
      var a$3 = $$this.display2__AO();
      $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$3));
      var a$4 = $$this.display1__AO();
      $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$4));
      $$this.display5__AO().u[(31 & (index >> 25))] = $$this.display4__AO();
      $$this.display4__AO().u[(31 & (index >> 20))] = $$this.display3__AO();
      $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
      $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
      $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
      break
    }
    case 4: {
      var a$5 = $$this.display4__AO();
      $$this.display4$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$5));
      var a$6 = $$this.display3__AO();
      $$this.display3$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$6));
      var a$7 = $$this.display2__AO();
      $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$7));
      var a$8 = $$this.display1__AO();
      $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$8));
      $$this.display4__AO().u[(31 & (index >> 20))] = $$this.display3__AO();
      $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
      $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
      $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
      break
    }
    case 3: {
      var a$9 = $$this.display3__AO();
      $$this.display3$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$9));
      var a$10 = $$this.display2__AO();
      $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$10));
      var a$11 = $$this.display1__AO();
      $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$11));
      $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
      $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
      $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
      break
    }
    case 2: {
      var a$12 = $$this.display2__AO();
      $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$12));
      var a$13 = $$this.display1__AO();
      $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$13));
      $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
      $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
      break
    }
    case 1: {
      var a$14 = $$this.display1__AO();
      $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$14));
      $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
      break
    }
    case 0: {
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
}
function $s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array, index) {
  var x = array.u[index];
  array.u[index] = null;
  var a = $asArrayOf_O(x, 1);
  return $s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a)
}
function $s_sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V($$this, that, depth) {
  $$this.depth$und$eq__I__V(depth);
  var x1 = (((-1) + depth) | 0);
  switch (x1) {
    case (-1): {
      break
    }
    case 0: {
      $$this.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 1: {
      $$this.display1$und$eq__AO__V(that.display1__AO());
      $$this.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 2: {
      $$this.display2$und$eq__AO__V(that.display2__AO());
      $$this.display1$und$eq__AO__V(that.display1__AO());
      $$this.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 3: {
      $$this.display3$und$eq__AO__V(that.display3__AO());
      $$this.display2$und$eq__AO__V(that.display2__AO());
      $$this.display1$und$eq__AO__V(that.display1__AO());
      $$this.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 4: {
      $$this.display4$und$eq__AO__V(that.display4__AO());
      $$this.display3$und$eq__AO__V(that.display3__AO());
      $$this.display2$und$eq__AO__V(that.display2__AO());
      $$this.display1$und$eq__AO__V(that.display1__AO());
      $$this.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 5: {
      $$this.display5$und$eq__AO__V(that.display5__AO());
      $$this.display4$und$eq__AO__V(that.display4__AO());
      $$this.display3$und$eq__AO__V(that.display3__AO());
      $$this.display2$und$eq__AO__V(that.display2__AO());
      $$this.display1$und$eq__AO__V(that.display1__AO());
      $$this.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
}
function $s_sci_VectorPointer$class__gotoNextBlockStart__sci_VectorPointer__I__I__V($$this, index, xor) {
  if ((xor < 1024)) {
    $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[(31 & (index >> 5))], 1))
  } else if ((xor < 32768)) {
    $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[(31 & (index >> 10))], 1));
    $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[0], 1))
  } else if ((xor < 1048576)) {
    $$this.display2$und$eq__AO__V($asArrayOf_O($$this.display3__AO().u[(31 & (index >> 15))], 1));
    $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[0], 1));
    $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[0], 1))
  } else if ((xor < 33554432)) {
    $$this.display3$und$eq__AO__V($asArrayOf_O($$this.display4__AO().u[(31 & (index >> 20))], 1));
    $$this.display2$und$eq__AO__V($asArrayOf_O($$this.display3__AO().u[0], 1));
    $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[0], 1));
    $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[0], 1))
  } else if ((xor < 1073741824)) {
    $$this.display4$und$eq__AO__V($asArrayOf_O($$this.display5__AO().u[(31 & (index >> 25))], 1));
    $$this.display3$und$eq__AO__V($asArrayOf_O($$this.display4__AO().u[0], 1));
    $$this.display2$und$eq__AO__V($asArrayOf_O($$this.display3__AO().u[0], 1));
    $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[0], 1));
    $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[0], 1))
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
}
function $s_sci_VectorPointer$class__gotoPos__sci_VectorPointer__I__I__V($$this, index, xor) {
  if ((xor >= 32)) {
    if ((xor < 1024)) {
      $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 32768)) {
      $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[(31 & (index >> 10))], 1));
      $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 1048576)) {
      $$this.display2$und$eq__AO__V($asArrayOf_O($$this.display3__AO().u[(31 & (index >> 15))], 1));
      $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[(31 & (index >> 10))], 1));
      $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 33554432)) {
      $$this.display3$und$eq__AO__V($asArrayOf_O($$this.display4__AO().u[(31 & (index >> 20))], 1));
      $$this.display2$und$eq__AO__V($asArrayOf_O($$this.display3__AO().u[(31 & (index >> 15))], 1));
      $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[(31 & (index >> 10))], 1));
      $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 1073741824)) {
      $$this.display4$und$eq__AO__V($asArrayOf_O($$this.display5__AO().u[(31 & (index >> 25))], 1));
      $$this.display3$und$eq__AO__V($asArrayOf_O($$this.display4__AO().u[(31 & (index >> 20))], 1));
      $$this.display2$und$eq__AO__V($asArrayOf_O($$this.display3__AO().u[(31 & (index >> 15))], 1));
      $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[(31 & (index >> 10))], 1));
      $$this.display0$und$eq__AO__V($asArrayOf_O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else {
      throw new $c_jl_IllegalArgumentException().init___()
    }
  }
}
function $s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a) {
  if ((a === null)) {
    var this$2 = $m_s_Console$();
    var this$3 = $as_Ljava_io_PrintStream(this$2.outVar$2.v$1);
    this$3.java$lang$JSConsoleBasedPrintStream$$printString__T__V("NULL\n")
  };
  var b = $newArrayObject($d_O.getArrayOf(), [a.u.length]);
  var length = a.u.length;
  $systemArraycopy(a, 0, b, 0, length);
  return b
}
function $s_sci_VectorPointer$class__gotoPosWritable1__sci_VectorPointer__I__I__I__V($$this, oldIndex, newIndex, xor) {
  if ((xor < 32)) {
    var a = $$this.display0__AO();
    $$this.display0$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a))
  } else if ((xor < 1024)) {
    var a$1 = $$this.display1__AO();
    $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$1));
    $$this.display1__AO().u[(31 & (oldIndex >> 5))] = $$this.display0__AO();
    var array = $$this.display1__AO();
    var index = (31 & (newIndex >> 5));
    $$this.display0$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array, index))
  } else if ((xor < 32768)) {
    var a$2 = $$this.display1__AO();
    $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$2));
    var a$3 = $$this.display2__AO();
    $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$3));
    $$this.display1__AO().u[(31 & (oldIndex >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (oldIndex >> 10))] = $$this.display1__AO();
    var array$1 = $$this.display2__AO();
    var index$1 = (31 & (newIndex >> 10));
    $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$1, index$1));
    var array$2 = $$this.display1__AO();
    var index$2 = (31 & (newIndex >> 5));
    $$this.display0$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$2, index$2))
  } else if ((xor < 1048576)) {
    var a$4 = $$this.display1__AO();
    $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$4));
    var a$5 = $$this.display2__AO();
    $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$5));
    var a$6 = $$this.display3__AO();
    $$this.display3$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$6));
    $$this.display1__AO().u[(31 & (oldIndex >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (oldIndex >> 10))] = $$this.display1__AO();
    $$this.display3__AO().u[(31 & (oldIndex >> 15))] = $$this.display2__AO();
    var array$3 = $$this.display3__AO();
    var index$3 = (31 & (newIndex >> 15));
    $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$3, index$3));
    var array$4 = $$this.display2__AO();
    var index$4 = (31 & (newIndex >> 10));
    $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$4, index$4));
    var array$5 = $$this.display1__AO();
    var index$5 = (31 & (newIndex >> 5));
    $$this.display0$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$5, index$5))
  } else if ((xor < 33554432)) {
    var a$7 = $$this.display1__AO();
    $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$7));
    var a$8 = $$this.display2__AO();
    $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$8));
    var a$9 = $$this.display3__AO();
    $$this.display3$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$9));
    var a$10 = $$this.display4__AO();
    $$this.display4$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$10));
    $$this.display1__AO().u[(31 & (oldIndex >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (oldIndex >> 10))] = $$this.display1__AO();
    $$this.display3__AO().u[(31 & (oldIndex >> 15))] = $$this.display2__AO();
    $$this.display4__AO().u[(31 & (oldIndex >> 20))] = $$this.display3__AO();
    var array$6 = $$this.display4__AO();
    var index$6 = (31 & (newIndex >> 20));
    $$this.display3$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$6, index$6));
    var array$7 = $$this.display3__AO();
    var index$7 = (31 & (newIndex >> 15));
    $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$7, index$7));
    var array$8 = $$this.display2__AO();
    var index$8 = (31 & (newIndex >> 10));
    $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$8, index$8));
    var array$9 = $$this.display1__AO();
    var index$9 = (31 & (newIndex >> 5));
    $$this.display0$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$9, index$9))
  } else if ((xor < 1073741824)) {
    var a$11 = $$this.display1__AO();
    $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$11));
    var a$12 = $$this.display2__AO();
    $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$12));
    var a$13 = $$this.display3__AO();
    $$this.display3$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$13));
    var a$14 = $$this.display4__AO();
    $$this.display4$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$14));
    var a$15 = $$this.display5__AO();
    $$this.display5$und$eq__AO__V($s_sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$15));
    $$this.display1__AO().u[(31 & (oldIndex >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (oldIndex >> 10))] = $$this.display1__AO();
    $$this.display3__AO().u[(31 & (oldIndex >> 15))] = $$this.display2__AO();
    $$this.display4__AO().u[(31 & (oldIndex >> 20))] = $$this.display3__AO();
    $$this.display5__AO().u[(31 & (oldIndex >> 25))] = $$this.display4__AO();
    var array$10 = $$this.display5__AO();
    var index$10 = (31 & (newIndex >> 25));
    $$this.display4$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$10, index$10));
    var array$11 = $$this.display4__AO();
    var index$11 = (31 & (newIndex >> 20));
    $$this.display3$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$11, index$11));
    var array$12 = $$this.display3__AO();
    var index$12 = (31 & (newIndex >> 15));
    $$this.display2$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$12, index$12));
    var array$13 = $$this.display2__AO();
    var index$13 = (31 & (newIndex >> 10));
    $$this.display1$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$13, index$13));
    var array$14 = $$this.display1__AO();
    var index$14 = (31 & (newIndex >> 5));
    $$this.display0$und$eq__AO__V($s_sci_VectorPointer$class__nullSlotAndCopy__sci_VectorPointer__AO__I__AO($$this, array$14, index$14))
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
}
function $s_sci_VectorPointer$class__copyRange__sci_VectorPointer__AO__I__I__AO($$this, array, oldLeft, newLeft) {
  var elems = $newArrayObject($d_O.getArrayOf(), [32]);
  var length = ((32 - ((newLeft > oldLeft) ? newLeft : oldLeft)) | 0);
  $systemArraycopy(array, oldLeft, elems, newLeft, length);
  return elems
}
function $s_sci_VectorPointer$class__gotoFreshPosWritable0__sci_VectorPointer__I__I__I__V($$this, oldIndex, newIndex, xor) {
  if ((xor >= 32)) {
    if ((xor < 1024)) {
      if (($$this.depth__I() === 1)) {
        $$this.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $$this.display1__AO().u[(31 & (oldIndex >> 5))] = $$this.display0__AO();
        $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
      };
      $$this.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else if ((xor < 32768)) {
      if (($$this.depth__I() === 2)) {
        $$this.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $$this.display2__AO().u[(31 & (oldIndex >> 10))] = $$this.display1__AO();
        $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
      };
      $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[(31 & (newIndex >> 10))], 1));
      if (($$this.display1__AO() === null)) {
        $$this.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $$this.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else if ((xor < 1048576)) {
      if (($$this.depth__I() === 3)) {
        $$this.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $$this.display3__AO().u[(31 & (oldIndex >> 15))] = $$this.display2__AO();
        $$this.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $$this.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
      };
      $$this.display2$und$eq__AO__V($asArrayOf_O($$this.display3__AO().u[(31 & (newIndex >> 15))], 1));
      if (($$this.display2__AO() === null)) {
        $$this.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[(31 & (newIndex >> 10))], 1));
      if (($$this.display1__AO() === null)) {
        $$this.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $$this.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else if ((xor < 33554432)) {
      if (($$this.depth__I() === 4)) {
        $$this.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $$this.display4__AO().u[(31 & (oldIndex >> 20))] = $$this.display3__AO();
        $$this.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $$this.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $$this.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
      };
      $$this.display3$und$eq__AO__V($asArrayOf_O($$this.display4__AO().u[(31 & (newIndex >> 20))], 1));
      if (($$this.display3__AO() === null)) {
        $$this.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $$this.display2$und$eq__AO__V($asArrayOf_O($$this.display3__AO().u[(31 & (newIndex >> 15))], 1));
      if (($$this.display2__AO() === null)) {
        $$this.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[(31 & (newIndex >> 10))], 1));
      if (($$this.display1__AO() === null)) {
        $$this.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $$this.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else if ((xor < 1073741824)) {
      if (($$this.depth__I() === 5)) {
        $$this.display5$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $$this.display5__AO().u[(31 & (oldIndex >> 25))] = $$this.display4__AO();
        $$this.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $$this.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $$this.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $$this.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
      };
      $$this.display4$und$eq__AO__V($asArrayOf_O($$this.display5__AO().u[(31 & (newIndex >> 20))], 1));
      if (($$this.display4__AO() === null)) {
        $$this.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $$this.display3$und$eq__AO__V($asArrayOf_O($$this.display4__AO().u[(31 & (newIndex >> 20))], 1));
      if (($$this.display3__AO() === null)) {
        $$this.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $$this.display2$und$eq__AO__V($asArrayOf_O($$this.display3__AO().u[(31 & (newIndex >> 15))], 1));
      if (($$this.display2__AO() === null)) {
        $$this.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $$this.display1$und$eq__AO__V($asArrayOf_O($$this.display2__AO().u[(31 & (newIndex >> 10))], 1));
      if (($$this.display1__AO() === null)) {
        $$this.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $$this.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else {
      throw new $c_jl_IllegalArgumentException().init___()
    }
  }
}
function $s_scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__V($$this, coll) {
  if ($is_sc_IndexedSeqLike(coll)) {
    $$this.sizeHint__I__V(coll.size__I())
  }
}
function $s_scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__I__V($$this, coll, delta) {
  if ($is_sc_IndexedSeqLike(coll)) {
    $$this.sizeHint__I__V(((coll.size__I() + delta) | 0))
  }
}
function $s_scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V($$this, size, boundingColl) {
  if ($is_sc_IndexedSeqLike(boundingColl)) {
    var that = boundingColl.size__I();
    $$this.sizeHint__I__V(((size < that) ? size : that))
  }
}
/** @constructor */
function $c_scm_FlatHashTable$() {
  $c_O.call(this)
}
$c_scm_FlatHashTable$.prototype = new $h_O();
$c_scm_FlatHashTable$.prototype.constructor = $c_scm_FlatHashTable$;
/** @constructor */
function $h_scm_FlatHashTable$() {
  /*<skip>*/
}
$h_scm_FlatHashTable$.prototype = $c_scm_FlatHashTable$.prototype;
$c_scm_FlatHashTable$.prototype.init___ = (function() {
  return this
});
$c_scm_FlatHashTable$.prototype.newThreshold__I__I__I = (function(_loadFactor, size) {
  var assertion = (_loadFactor < 500);
  if ((!assertion)) {
    throw new $c_jl_AssertionError().init___O("assertion failed: loadFactor too large; must be < 0.5")
  };
  return new $c_sjsr_RuntimeLong().init___I(size).$$times__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I(_loadFactor)).$$div__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I__I(1000, 0)).lo$2
});
var $d_scm_FlatHashTable$ = new $TypeData().initClass({
  scm_FlatHashTable$: 0
}, false, "scala.collection.mutable.FlatHashTable$", {
  scm_FlatHashTable$: 1,
  O: 1
});
$c_scm_FlatHashTable$.prototype.$classData = $d_scm_FlatHashTable$;
var $n_scm_FlatHashTable$ = (void 0);
function $m_scm_FlatHashTable$() {
  if ((!$n_scm_FlatHashTable$)) {
    $n_scm_FlatHashTable$ = new $c_scm_FlatHashTable$().init___()
  };
  return $n_scm_FlatHashTable$
}
function $s_scm_FlatHashTable$HashUtils$class__improve__scm_FlatHashTable$HashUtils__I__I__I($$this, hcode, seed) {
  var improved = $m_s_util_hashing_package$().byteswap32__I__I(hcode);
  var rotation = ((seed % 32) | 0);
  var rotated = (((improved >>> rotation) | 0) | (improved << ((32 - rotation) | 0)));
  return rotated
}
function $s_scm_FlatHashTable$HashUtils$class__entryToElem__scm_FlatHashTable$HashUtils__O__O($$this, entry) {
  return ((entry === $m_scm_FlatHashTable$NullSentinel$()) ? null : entry)
}
function $s_scm_FlatHashTable$HashUtils$class__elemToEntry__scm_FlatHashTable$HashUtils__O__O($$this, elem) {
  return ((elem === null) ? $m_scm_FlatHashTable$NullSentinel$() : elem)
}
/** @constructor */
function $c_scm_FlatHashTable$NullSentinel$() {
  $c_O.call(this)
}
$c_scm_FlatHashTable$NullSentinel$.prototype = new $h_O();
$c_scm_FlatHashTable$NullSentinel$.prototype.constructor = $c_scm_FlatHashTable$NullSentinel$;
/** @constructor */
function $h_scm_FlatHashTable$NullSentinel$() {
  /*<skip>*/
}
$h_scm_FlatHashTable$NullSentinel$.prototype = $c_scm_FlatHashTable$NullSentinel$.prototype;
$c_scm_FlatHashTable$NullSentinel$.prototype.init___ = (function() {
  return this
});
$c_scm_FlatHashTable$NullSentinel$.prototype.toString__T = (function() {
  return "NullSentinel"
});
$c_scm_FlatHashTable$NullSentinel$.prototype.hashCode__I = (function() {
  return 0
});
var $d_scm_FlatHashTable$NullSentinel$ = new $TypeData().initClass({
  scm_FlatHashTable$NullSentinel$: 0
}, false, "scala.collection.mutable.FlatHashTable$NullSentinel$", {
  scm_FlatHashTable$NullSentinel$: 1,
  O: 1
});
$c_scm_FlatHashTable$NullSentinel$.prototype.$classData = $d_scm_FlatHashTable$NullSentinel$;
var $n_scm_FlatHashTable$NullSentinel$ = (void 0);
function $m_scm_FlatHashTable$NullSentinel$() {
  if ((!$n_scm_FlatHashTable$NullSentinel$)) {
    $n_scm_FlatHashTable$NullSentinel$ = new $c_scm_FlatHashTable$NullSentinel$().init___()
  };
  return $n_scm_FlatHashTable$NullSentinel$
}
function $s_scm_FlatHashTable$class__growTable__p0__scm_FlatHashTable__V($$this) {
  var oldtable = $$this.table$5;
  $$this.table$5 = $newArrayObject($d_O.getArrayOf(), [$imul(2, $$this.table$5.u.length)]);
  $$this.tableSize$5 = 0;
  var tableLength = $$this.table$5.u.length;
  $s_scm_FlatHashTable$class__nnSizeMapReset__scm_FlatHashTable__I__V($$this, tableLength);
  $$this.seedvalue$5 = $s_scm_FlatHashTable$class__tableSizeSeed__scm_FlatHashTable__I($$this);
  $$this.threshold$5 = $m_scm_FlatHashTable$().newThreshold__I__I__I($$this.$$undloadFactor$5, $$this.table$5.u.length);
  var i = 0;
  while ((i < oldtable.u.length)) {
    var entry = oldtable.u[i];
    if ((entry !== null)) {
      $s_scm_FlatHashTable$class__addEntry__scm_FlatHashTable__O__Z($$this, entry)
    };
    i = ((1 + i) | 0)
  }
}
function $s_scm_FlatHashTable$class__calcSizeMapSize__scm_FlatHashTable__I__I($$this, tableLength) {
  return ((1 + (tableLength >> 5)) | 0)
}
function $s_scm_FlatHashTable$class__nnSizeMapAdd__scm_FlatHashTable__I__V($$this, h) {
  if (($$this.sizemap$5 !== null)) {
    var p = (h >> 5);
    var ev$1 = $$this.sizemap$5;
    ev$1.u[p] = ((1 + ev$1.u[p]) | 0)
  }
}
function $s_scm_FlatHashTable$class__$$init$__scm_FlatHashTable__V($$this) {
  $$this.$$undloadFactor$5 = 450;
  $$this.table$5 = $newArrayObject($d_O.getArrayOf(), [$s_scm_FlatHashTable$class__capacity__scm_FlatHashTable__I__I($$this, 32)]);
  $$this.tableSize$5 = 0;
  $$this.threshold$5 = $m_scm_FlatHashTable$().newThreshold__I__I__I($$this.$$undloadFactor$5, $s_scm_FlatHashTable$class__capacity__scm_FlatHashTable__I__I($$this, 32));
  $$this.sizemap$5 = null;
  $$this.seedvalue$5 = $s_scm_FlatHashTable$class__tableSizeSeed__scm_FlatHashTable__I($$this)
}
function $s_scm_FlatHashTable$class__findElemImpl__p0__scm_FlatHashTable__O__O($$this, elem) {
  var searchEntry = $s_scm_FlatHashTable$HashUtils$class__elemToEntry__scm_FlatHashTable$HashUtils__O__O($$this, elem);
  var hcode = $objectHashCode(searchEntry);
  var h = $s_scm_FlatHashTable$class__index__scm_FlatHashTable__I__I($$this, hcode);
  var curEntry = $$this.table$5.u[h];
  while (((curEntry !== null) && (!$m_sr_BoxesRunTime$().equals__O__O__Z(curEntry, searchEntry)))) {
    h = ((((1 + h) | 0) % $$this.table$5.u.length) | 0);
    curEntry = $$this.table$5.u[h]
  };
  return curEntry
}
function $s_scm_FlatHashTable$class__addEntry__scm_FlatHashTable__O__Z($$this, newEntry) {
  var hcode = $objectHashCode(newEntry);
  var h = $s_scm_FlatHashTable$class__index__scm_FlatHashTable__I__I($$this, hcode);
  var curEntry = $$this.table$5.u[h];
  while ((curEntry !== null)) {
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(curEntry, newEntry)) {
      return false
    };
    h = ((((1 + h) | 0) % $$this.table$5.u.length) | 0);
    curEntry = $$this.table$5.u[h]
  };
  $$this.table$5.u[h] = newEntry;
  $$this.tableSize$5 = ((1 + $$this.tableSize$5) | 0);
  var h$1 = h;
  $s_scm_FlatHashTable$class__nnSizeMapAdd__scm_FlatHashTable__I__V($$this, h$1);
  if (($$this.tableSize$5 >= $$this.threshold$5)) {
    $s_scm_FlatHashTable$class__growTable__p0__scm_FlatHashTable__V($$this)
  };
  return true
}
function $s_scm_FlatHashTable$class__addElem__scm_FlatHashTable__O__Z($$this, elem) {
  var newEntry = $s_scm_FlatHashTable$HashUtils$class__elemToEntry__scm_FlatHashTable$HashUtils__O__O($$this, elem);
  return $s_scm_FlatHashTable$class__addEntry__scm_FlatHashTable__O__Z($$this, newEntry)
}
function $s_scm_FlatHashTable$class__index__scm_FlatHashTable__I__I($$this, hcode) {
  var seed = $$this.seedvalue$5;
  var improved = $s_scm_FlatHashTable$HashUtils$class__improve__scm_FlatHashTable$HashUtils__I__I__I($$this, hcode, seed);
  var ones = (((-1) + $$this.table$5.u.length) | 0);
  return (((improved >>> ((32 - $m_jl_Integer$().bitCount__I__I(ones)) | 0)) | 0) & ones)
}
function $s_scm_FlatHashTable$class__capacity__scm_FlatHashTable__I__I($$this, expectedSize) {
  return ((expectedSize === 0) ? 1 : $m_scm_HashTable$().powerOfTwo__I__I(expectedSize))
}
function $s_scm_FlatHashTable$class__tableSizeSeed__scm_FlatHashTable__I($$this) {
  return $m_jl_Integer$().bitCount__I__I((((-1) + $$this.table$5.u.length) | 0))
}
function $s_scm_FlatHashTable$class__nnSizeMapReset__scm_FlatHashTable__I__V($$this, tableLength) {
  if (($$this.sizemap$5 !== null)) {
    var nsize = $s_scm_FlatHashTable$class__calcSizeMapSize__scm_FlatHashTable__I__I($$this, tableLength);
    if (($$this.sizemap$5.u.length !== nsize)) {
      $$this.sizemap$5 = $newArrayObject($d_I.getArrayOf(), [nsize])
    } else {
      $m_ju_Arrays$().fill__AI__I__V($$this.sizemap$5, 0)
    }
  }
}
function $s_scm_FlatHashTable$class__initWithContents__scm_FlatHashTable__scm_FlatHashTable$Contents__V($$this, c) {
  if ((c !== null)) {
    $$this.$$undloadFactor$5 = c.loadFactor__I();
    $$this.table$5 = c.table__AO();
    $$this.tableSize$5 = c.tableSize__I();
    $$this.threshold$5 = c.threshold__I();
    $$this.seedvalue$5 = c.seedvalue__I();
    $$this.sizemap$5 = c.sizemap__AI()
  }
}
function $s_scm_FlatHashTable$class__containsElem__scm_FlatHashTable__O__Z($$this, elem) {
  return ($s_scm_FlatHashTable$class__findElemImpl__p0__scm_FlatHashTable__O__O($$this, elem) !== null)
}
/** @constructor */
function $c_scm_HashTable$() {
  $c_O.call(this)
}
$c_scm_HashTable$.prototype = new $h_O();
$c_scm_HashTable$.prototype.constructor = $c_scm_HashTable$;
/** @constructor */
function $h_scm_HashTable$() {
  /*<skip>*/
}
$h_scm_HashTable$.prototype = $c_scm_HashTable$.prototype;
$c_scm_HashTable$.prototype.init___ = (function() {
  return this
});
$c_scm_HashTable$.prototype.powerOfTwo__I__I = (function(target) {
  var c = (((-1) + target) | 0);
  c = (c | ((c >>> 1) | 0));
  c = (c | ((c >>> 2) | 0));
  c = (c | ((c >>> 4) | 0));
  c = (c | ((c >>> 8) | 0));
  c = (c | ((c >>> 16) | 0));
  return ((1 + c) | 0)
});
var $d_scm_HashTable$ = new $TypeData().initClass({
  scm_HashTable$: 0
}, false, "scala.collection.mutable.HashTable$", {
  scm_HashTable$: 1,
  O: 1
});
$c_scm_HashTable$.prototype.$classData = $d_scm_HashTable$;
var $n_scm_HashTable$ = (void 0);
function $m_scm_HashTable$() {
  if ((!$n_scm_HashTable$)) {
    $n_scm_HashTable$ = new $c_scm_HashTable$().init___()
  };
  return $n_scm_HashTable$
}
function $s_scm_ResizableArray$class__copyToArray__scm_ResizableArray__O__I__I__V($$this, xs, start, len) {
  var that = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var $$this$1 = ((len < that) ? len : that);
  var that$1 = $$this.size0$6;
  var len1 = (($$this$1 < that$1) ? $$this$1 : that$1);
  $m_s_Array$().copy__O__I__O__I__I__V($$this.array$6, 0, xs, start, len1)
}
function $s_scm_ResizableArray$class__ensureSize__scm_ResizableArray__I__V($$this, n) {
  var x = $$this.array$6.u.length;
  var arrayLength = new $c_sjsr_RuntimeLong().init___I(x);
  if (new $c_sjsr_RuntimeLong().init___I(n).$$greater__sjsr_RuntimeLong__Z(arrayLength)) {
    var newSize = new $c_sjsr_RuntimeLong().init___I__I(2, 0).$$times__sjsr_RuntimeLong__sjsr_RuntimeLong(arrayLength);
    while (new $c_sjsr_RuntimeLong().init___I(n).$$greater__sjsr_RuntimeLong__Z(newSize)) {
      newSize = new $c_sjsr_RuntimeLong().init___I__I(2, 0).$$times__sjsr_RuntimeLong__sjsr_RuntimeLong(newSize)
    };
    if (newSize.$$greater__sjsr_RuntimeLong__Z(new $c_sjsr_RuntimeLong().init___I__I(2147483647, 0))) {
      newSize = new $c_sjsr_RuntimeLong().init___I__I(2147483647, 0)
    };
    var newArray = $newArrayObject($d_O.getArrayOf(), [newSize.lo$2]);
    var src = $$this.array$6;
    var length = $$this.size0$6;
    $systemArraycopy(src, 0, newArray, 0, length);
    $$this.array$6 = newArray
  }
}
function $s_scm_ResizableArray$class__foreach__scm_ResizableArray__F1__V($$this, f) {
  var i = 0;
  var top = $$this.size0$6;
  while ((i < top)) {
    f.apply__O__O($$this.array$6.u[i]);
    i = ((1 + i) | 0)
  }
}
function $s_scm_ResizableArray$class__apply__scm_ResizableArray__I__O($$this, idx) {
  if ((idx >= $$this.size0$6)) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + idx))
  };
  return $$this.array$6.u[idx]
}
function $s_scm_ResizableArray$class__$$init$__scm_ResizableArray__V($$this) {
  var x = $$this.initialSize$6;
  $$this.array$6 = $newArrayObject($d_O.getArrayOf(), [((x > 1) ? x : 1)]);
  $$this.size0$6 = 0
}
/** @constructor */
function $c_sjsr_Bits$() {
  $c_O.call(this);
  this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = false;
  this.arrayBuffer$1 = null;
  this.int32Array$1 = null;
  this.float32Array$1 = null;
  this.float64Array$1 = null;
  this.areTypedArraysBigEndian$1 = false;
  this.highOffset$1 = 0;
  this.lowOffset$1 = 0
}
$c_sjsr_Bits$.prototype = new $h_O();
$c_sjsr_Bits$.prototype.constructor = $c_sjsr_Bits$;
/** @constructor */
function $h_sjsr_Bits$() {
  /*<skip>*/
}
$h_sjsr_Bits$.prototype = $c_sjsr_Bits$.prototype;
$c_sjsr_Bits$.prototype.init___ = (function() {
  $n_sjsr_Bits$ = this;
  var x = ((($g.ArrayBuffer && $g.Int32Array) && $g.Float32Array) && $g.Float64Array);
  this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = $uZ((!(!x)));
  this.arrayBuffer$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.ArrayBuffer(8) : null);
  this.int32Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Int32Array(this.arrayBuffer$1, 0, 2) : null);
  this.float32Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Float32Array(this.arrayBuffer$1, 0, 2) : null);
  this.float64Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Float64Array(this.arrayBuffer$1, 0, 1) : null);
  if ((!this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f)) {
    var jsx$1 = true
  } else {
    this.int32Array$1[0] = 16909060;
    var jsx$1 = ($uB(new $g.Int8Array(this.arrayBuffer$1, 0, 8)[0]) === 1)
  };
  this.areTypedArraysBigEndian$1 = jsx$1;
  this.highOffset$1 = (this.areTypedArraysBigEndian$1 ? 0 : 1);
  this.lowOffset$1 = (this.areTypedArraysBigEndian$1 ? 1 : 0);
  return this
});
$c_sjsr_Bits$.prototype.numberHashCode__D__I = (function(value) {
  var iv = $uI((value | 0));
  if (((iv === value) && ((1.0 / value) !== (-Infinity)))) {
    return iv
  } else {
    var this$1 = this.doubleToLongBits__D__J(value);
    return (this$1.lo$2 ^ this$1.hi$2)
  }
});
$c_sjsr_Bits$.prototype.doubleToLongBitsPolyfill__p1__D__J = (function(value) {
  if ((value !== value)) {
    var _3 = $uD($g.Math.pow(2.0, 51));
    var x1_$_$$und1$1 = false;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = _3
  } else if (((value === Infinity) || (value === (-Infinity)))) {
    var _1 = (value < 0);
    var x1_$_$$und1$1 = _1;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = 0.0
  } else if ((value === 0.0)) {
    var _1$1 = ((1 / value) === (-Infinity));
    var x1_$_$$und1$1 = _1$1;
    var x1_$_$$und2$1 = 0;
    var x1_$_$$und3$1 = 0.0
  } else {
    var s = (value < 0);
    var av = (s ? (-value) : value);
    if ((av >= $uD($g.Math.pow(2.0, (-1022))))) {
      var twoPowFbits = $uD($g.Math.pow(2.0, 52));
      var a = ($uD($g.Math.log(av)) / 0.6931471805599453);
      var x = $uD($g.Math.floor(a));
      var a$1 = $uI((x | 0));
      var e = ((a$1 < 1023) ? a$1 : 1023);
      var b = e;
      var n = ((av / $uD($g.Math.pow(2.0, b))) * twoPowFbits);
      var w = $uD($g.Math.floor(n));
      var f = (n - w);
      var f$1 = ((f < 0.5) ? w : ((f > 0.5) ? (1 + w) : (((w % 2) !== 0) ? (1 + w) : w)));
      if (((f$1 / twoPowFbits) >= 2)) {
        e = ((1 + e) | 0);
        f$1 = 1.0
      };
      if ((e > 1023)) {
        e = 2047;
        f$1 = 0.0
      } else {
        e = ((1023 + e) | 0);
        f$1 = (f$1 - twoPowFbits)
      };
      var _2 = e;
      var _3$1 = f$1;
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = _2;
      var x1_$_$$und3$1 = _3$1
    } else {
      var n$1 = (av / $uD($g.Math.pow(2.0, (-1074))));
      var w$1 = $uD($g.Math.floor(n$1));
      var f$2 = (n$1 - w$1);
      var _3$2 = ((f$2 < 0.5) ? w$1 : ((f$2 > 0.5) ? (1 + w$1) : (((w$1 % 2) !== 0) ? (1 + w$1) : w$1)));
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = 0;
      var x1_$_$$und3$1 = _3$2
    }
  };
  var s$1 = $uZ(x1_$_$$und1$1);
  var e$1 = $uI(x1_$_$$und2$1);
  var f$3 = $uD(x1_$_$$und3$1);
  var x$1 = (f$3 / 4.294967296E9);
  var hif = $uI((x$1 | 0));
  var hi = (((s$1 ? (-2147483648) : 0) | (e$1 << 20)) | hif);
  var lo = $uI((f$3 | 0));
  return new $c_sjsr_RuntimeLong().init___I(hi).$$less$less__I__sjsr_RuntimeLong(32).$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I__I((-1), 0).$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I(lo)))
});
$c_sjsr_Bits$.prototype.doubleToLongBits__D__J = (function(value) {
  if (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f) {
    this.float64Array$1[0] = value;
    return new $c_sjsr_RuntimeLong().init___I($uI(this.int32Array$1[this.highOffset$1])).$$less$less__I__sjsr_RuntimeLong(32).$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I__I((-1), 0).$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I($uI(this.int32Array$1[this.lowOffset$1]))))
  } else {
    return this.doubleToLongBitsPolyfill__p1__D__J(value)
  }
});
var $d_sjsr_Bits$ = new $TypeData().initClass({
  sjsr_Bits$: 0
}, false, "scala.scalajs.runtime.Bits$", {
  sjsr_Bits$: 1,
  O: 1
});
$c_sjsr_Bits$.prototype.$classData = $d_sjsr_Bits$;
var $n_sjsr_Bits$ = (void 0);
function $m_sjsr_Bits$() {
  if ((!$n_sjsr_Bits$)) {
    $n_sjsr_Bits$ = new $c_sjsr_Bits$().init___()
  };
  return $n_sjsr_Bits$
}
/** @constructor */
function $c_sjsr_RuntimeString$() {
  $c_O.call(this);
  this.CASE$undINSENSITIVE$undORDER$1 = null;
  this.bitmap$0$1 = false
}
$c_sjsr_RuntimeString$.prototype = new $h_O();
$c_sjsr_RuntimeString$.prototype.constructor = $c_sjsr_RuntimeString$;
/** @constructor */
function $h_sjsr_RuntimeString$() {
  /*<skip>*/
}
$h_sjsr_RuntimeString$.prototype = $c_sjsr_RuntimeString$.prototype;
$c_sjsr_RuntimeString$.prototype.init___ = (function() {
  return this
});
$c_sjsr_RuntimeString$.prototype.indexOf__T__I__I__I = (function(thiz, ch, fromIndex) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return $uI(thiz.indexOf(str, fromIndex))
});
$c_sjsr_RuntimeString$.prototype.valueOf__O__T = (function(value) {
  return ((value === null) ? "null" : $objectToString(value))
});
$c_sjsr_RuntimeString$.prototype.lastIndexOf__T__I__I = (function(thiz, ch) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return $uI(thiz.lastIndexOf(str))
});
$c_sjsr_RuntimeString$.prototype.indexOf__T__I__I = (function(thiz, ch) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return $uI(thiz.indexOf(str))
});
$c_sjsr_RuntimeString$.prototype.fromCodePoint__p1__I__T = (function(codePoint) {
  if ((((-65536) & codePoint) === 0)) {
    var array = [codePoint];
    var jsx$2 = $g.String;
    var jsx$1 = jsx$2.fromCharCode.apply(jsx$2, array);
    return $as_T(jsx$1)
  } else if (((codePoint < 0) || (codePoint > 1114111))) {
    throw new $c_jl_IllegalArgumentException().init___()
  } else {
    var offsetCp = (((-65536) + codePoint) | 0);
    var array$1 = [(55296 | (offsetCp >> 10)), (56320 | (1023 & offsetCp))];
    var jsx$4 = $g.String;
    var jsx$3 = jsx$4.fromCharCode.apply(jsx$4, array$1);
    return $as_T(jsx$3)
  }
});
$c_sjsr_RuntimeString$.prototype.hashCode__T__I = (function(thiz) {
  var res = 0;
  var mul = 1;
  var i = (((-1) + $uI(thiz.length)) | 0);
  while ((i >= 0)) {
    var jsx$1 = res;
    var index = i;
    res = ((jsx$1 + $imul((65535 & $uI(thiz.charCodeAt(index))), mul)) | 0);
    mul = $imul(31, mul);
    i = (((-1) + i) | 0)
  };
  return res
});
var $d_sjsr_RuntimeString$ = new $TypeData().initClass({
  sjsr_RuntimeString$: 0
}, false, "scala.scalajs.runtime.RuntimeString$", {
  sjsr_RuntimeString$: 1,
  O: 1
});
$c_sjsr_RuntimeString$.prototype.$classData = $d_sjsr_RuntimeString$;
var $n_sjsr_RuntimeString$ = (void 0);
function $m_sjsr_RuntimeString$() {
  if ((!$n_sjsr_RuntimeString$)) {
    $n_sjsr_RuntimeString$ = new $c_sjsr_RuntimeString$().init___()
  };
  return $n_sjsr_RuntimeString$
}
/** @constructor */
function $c_sjsr_package$() {
  $c_O.call(this)
}
$c_sjsr_package$.prototype = new $h_O();
$c_sjsr_package$.prototype.constructor = $c_sjsr_package$;
/** @constructor */
function $h_sjsr_package$() {
  /*<skip>*/
}
$h_sjsr_package$.prototype = $c_sjsr_package$.prototype;
$c_sjsr_package$.prototype.init___ = (function() {
  return this
});
$c_sjsr_package$.prototype.unwrapJavaScriptException__jl_Throwable__O = (function(th) {
  if ($is_sjs_js_JavaScriptException(th)) {
    var x2 = $as_sjs_js_JavaScriptException(th);
    var e = x2.exception$4;
    return e
  } else {
    return th
  }
});
$c_sjsr_package$.prototype.wrapJavaScriptException__O__jl_Throwable = (function(e) {
  if ($is_jl_Throwable(e)) {
    var x2 = $as_jl_Throwable(e);
    return x2
  } else {
    return new $c_sjs_js_JavaScriptException().init___O(e)
  }
});
var $d_sjsr_package$ = new $TypeData().initClass({
  sjsr_package$: 0
}, false, "scala.scalajs.runtime.package$", {
  sjsr_package$: 1,
  O: 1
});
$c_sjsr_package$.prototype.$classData = $d_sjsr_package$;
var $n_sjsr_package$ = (void 0);
function $m_sjsr_package$() {
  if ((!$n_sjsr_package$)) {
    $n_sjsr_package$ = new $c_sjsr_package$().init___()
  };
  return $n_sjsr_package$
}
function $isArrayOf_sr_BoxedUnit(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_BoxedUnit)))
}
function $asArrayOf_sr_BoxedUnit(obj, depth) {
  return (($isArrayOf_sr_BoxedUnit(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.runtime.BoxedUnit;", depth))
}
var $d_sr_BoxedUnit = new $TypeData().initClass({
  sr_BoxedUnit: 0
}, false, "scala.runtime.BoxedUnit", {
  sr_BoxedUnit: 1,
  O: 1
}, (void 0), (void 0), (function(x) {
  return (x === (void 0))
}));
/** @constructor */
function $c_sr_BoxesRunTime$() {
  $c_O.call(this)
}
$c_sr_BoxesRunTime$.prototype = new $h_O();
$c_sr_BoxesRunTime$.prototype.constructor = $c_sr_BoxesRunTime$;
/** @constructor */
function $h_sr_BoxesRunTime$() {
  /*<skip>*/
}
$h_sr_BoxesRunTime$.prototype = $c_sr_BoxesRunTime$.prototype;
$c_sr_BoxesRunTime$.prototype.init___ = (function() {
  return this
});
$c_sr_BoxesRunTime$.prototype.equalsCharObject__jl_Character__O__Z = (function(xc, y) {
  if ($is_jl_Character(y)) {
    var x2 = $as_jl_Character(y);
    return (xc.value$1 === x2.value$1)
  } else if ($is_jl_Number(y)) {
    var x3 = $as_jl_Number(y);
    if (((typeof x3) === "number")) {
      var x2$1 = $uD(x3);
      return (x2$1 === xc.value$1)
    } else if ($is_sjsr_RuntimeLong(x3)) {
      var x3$1 = $uJ(x3);
      return x3$1.equals__sjsr_RuntimeLong__Z(new $c_sjsr_RuntimeLong().init___I(xc.value$1))
    } else {
      return ((x3 === null) ? (xc === null) : $objectEquals(x3, xc))
    }
  } else {
    return ((xc === null) && (y === null))
  }
});
$c_sr_BoxesRunTime$.prototype.equalsNumObject__jl_Number__O__Z = (function(xn, y) {
  if ($is_jl_Number(y)) {
    var x2 = $as_jl_Number(y);
    return this.equalsNumNum__jl_Number__jl_Number__Z(xn, x2)
  } else if ($is_jl_Character(y)) {
    var x3 = $as_jl_Character(y);
    if (((typeof xn) === "number")) {
      var x2$1 = $uD(xn);
      return (x2$1 === x3.value$1)
    } else if ($is_sjsr_RuntimeLong(xn)) {
      var x3$1 = $uJ(xn);
      return x3$1.equals__sjsr_RuntimeLong__Z(new $c_sjsr_RuntimeLong().init___I(x3.value$1))
    } else {
      return ((xn === null) ? (x3 === null) : $objectEquals(xn, x3))
    }
  } else {
    return ((xn === null) ? (y === null) : $objectEquals(xn, y))
  }
});
$c_sr_BoxesRunTime$.prototype.equals__O__O__Z = (function(x, y) {
  if ((x === y)) {
    return true
  } else if ($is_jl_Number(x)) {
    var x2 = $as_jl_Number(x);
    return this.equalsNumObject__jl_Number__O__Z(x2, y)
  } else if ($is_jl_Character(x)) {
    var x3 = $as_jl_Character(x);
    return this.equalsCharObject__jl_Character__O__Z(x3, y)
  } else {
    return ((x === null) ? (y === null) : $objectEquals(x, y))
  }
});
$c_sr_BoxesRunTime$.prototype.hashFromLong__jl_Long__I = (function(n) {
  var iv = $uJ(n).lo$2;
  if (new $c_sjsr_RuntimeLong().init___I(iv).equals__sjsr_RuntimeLong__Z($uJ(n))) {
    return iv
  } else {
    var value = $uJ(n);
    return (value.lo$2 ^ value.hi$2)
  }
});
$c_sr_BoxesRunTime$.prototype.hashFromNumber__jl_Number__I = (function(n) {
  if ($isInt(n)) {
    var x2 = $uI(n);
    return x2
  } else if ($is_sjsr_RuntimeLong(n)) {
    var x3 = $as_sjsr_RuntimeLong(n);
    return this.hashFromLong__jl_Long__I(x3)
  } else if (((typeof n) === "number")) {
    var x4 = $asDouble(n);
    return this.hashFromDouble__jl_Double__I(x4)
  } else {
    return $objectHashCode(n)
  }
});
$c_sr_BoxesRunTime$.prototype.equalsNumNum__jl_Number__jl_Number__Z = (function(xn, yn) {
  if (((typeof xn) === "number")) {
    var x2 = $uD(xn);
    if (((typeof yn) === "number")) {
      var x2$2 = $uD(yn);
      return (x2 === x2$2)
    } else if ($is_sjsr_RuntimeLong(yn)) {
      var x3 = $uJ(yn);
      return (x2 === x3.toDouble__D())
    } else if ($is_s_math_ScalaNumber(yn)) {
      var x4 = $as_s_math_ScalaNumber(yn);
      return x4.equals__O__Z(x2)
    } else {
      return false
    }
  } else if ($is_sjsr_RuntimeLong(xn)) {
    var x3$2 = $uJ(xn);
    if ($is_sjsr_RuntimeLong(yn)) {
      var x2$3 = $uJ(yn);
      return x3$2.equals__sjsr_RuntimeLong__Z(x2$3)
    } else if (((typeof yn) === "number")) {
      var x3$3 = $uD(yn);
      return (x3$2.toDouble__D() === x3$3)
    } else if ($is_s_math_ScalaNumber(yn)) {
      var x4$2 = $as_s_math_ScalaNumber(yn);
      return x4$2.equals__O__Z(x3$2)
    } else {
      return false
    }
  } else {
    return ((xn === null) ? (yn === null) : $objectEquals(xn, yn))
  }
});
$c_sr_BoxesRunTime$.prototype.hashFromDouble__jl_Double__I = (function(n) {
  var iv = $doubleToInt($uD(n));
  var dv = $uD(n);
  if ((iv === dv)) {
    return iv
  } else {
    var lv = $m_sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong($uD(n));
    return ((lv.toDouble__D() === dv) ? (lv.lo$2 ^ lv.hi$2) : $m_sjsr_Bits$().numberHashCode__D__I($uD(n)))
  }
});
var $d_sr_BoxesRunTime$ = new $TypeData().initClass({
  sr_BoxesRunTime$: 0
}, false, "scala.runtime.BoxesRunTime$", {
  sr_BoxesRunTime$: 1,
  O: 1
});
$c_sr_BoxesRunTime$.prototype.$classData = $d_sr_BoxesRunTime$;
var $n_sr_BoxesRunTime$ = (void 0);
function $m_sr_BoxesRunTime$() {
  if ((!$n_sr_BoxesRunTime$)) {
    $n_sr_BoxesRunTime$ = new $c_sr_BoxesRunTime$().init___()
  };
  return $n_sr_BoxesRunTime$
}
var $d_sr_Null$ = new $TypeData().initClass({
  sr_Null$: 0
}, false, "scala.runtime.Null$", {
  sr_Null$: 1,
  O: 1
});
/** @constructor */
function $c_sr_ScalaRunTime$() {
  $c_O.call(this)
}
$c_sr_ScalaRunTime$.prototype = new $h_O();
$c_sr_ScalaRunTime$.prototype.constructor = $c_sr_ScalaRunTime$;
/** @constructor */
function $h_sr_ScalaRunTime$() {
  /*<skip>*/
}
$h_sr_ScalaRunTime$.prototype = $c_sr_ScalaRunTime$.prototype;
$c_sr_ScalaRunTime$.prototype.init___ = (function() {
  return this
});
$c_sr_ScalaRunTime$.prototype.array$undlength__O__I = (function(xs) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    return x2.u.length
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    return x3.u.length
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    return x4.u.length
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    return x5.u.length
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    return x6.u.length
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    return x7.u.length
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    return x8.u.length
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    return x9.u.length
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    return x10.u.length
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    return x11.u.length
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
$c_sr_ScalaRunTime$.prototype.hash__O__I = (function(x) {
  return ((x === null) ? 0 : ($is_jl_Number(x) ? $m_sr_BoxesRunTime$().hashFromNumber__jl_Number__I($as_jl_Number(x)) : $objectHashCode(x)))
});
$c_sr_ScalaRunTime$.prototype.array$undupdate__O__I__O__V = (function(xs, idx, value) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    x2.u[idx] = value
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    x3.u[idx] = $uI(value)
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    x4.u[idx] = $uD(value)
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    x5.u[idx] = $uJ(value)
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    x6.u[idx] = $uF(value)
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    if ((value === null)) {
      var jsx$1 = 0
    } else {
      var this$2 = $as_jl_Character(value);
      var jsx$1 = this$2.value$1
    };
    x7.u[idx] = jsx$1
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    x8.u[idx] = $uB(value)
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    x9.u[idx] = $uS(value)
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    x10.u[idx] = $uZ(value)
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    x11.u[idx] = $asUnit(value)
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
$c_sr_ScalaRunTime$.prototype.$$undtoString__s_Product__T = (function(x) {
  var this$1 = x.productIterator__sc_Iterator();
  var start = (x.productPrefix__T() + "(");
  return $s_sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this$1, start, ",", ")")
});
$c_sr_ScalaRunTime$.prototype.array$undapply__O__I__O = (function(xs, idx) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    return x2.u[idx]
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    return x3.u[idx]
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    return x4.u[idx]
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    return x5.u[idx]
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    return x6.u[idx]
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    var c = x7.u[idx];
    return new $c_jl_Character().init___C(c)
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    return x8.u[idx]
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    return x9.u[idx]
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    return x10.u[idx]
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    return x11.u[idx]
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
var $d_sr_ScalaRunTime$ = new $TypeData().initClass({
  sr_ScalaRunTime$: 0
}, false, "scala.runtime.ScalaRunTime$", {
  sr_ScalaRunTime$: 1,
  O: 1
});
$c_sr_ScalaRunTime$.prototype.$classData = $d_sr_ScalaRunTime$;
var $n_sr_ScalaRunTime$ = (void 0);
function $m_sr_ScalaRunTime$() {
  if ((!$n_sr_ScalaRunTime$)) {
    $n_sr_ScalaRunTime$ = new $c_sr_ScalaRunTime$().init___()
  };
  return $n_sr_ScalaRunTime$
}
/** @constructor */
function $c_LApp$() {
  $c_O.call(this)
}
$c_LApp$.prototype = new $h_O();
$c_LApp$.prototype.constructor = $c_LApp$;
/** @constructor */
function $h_LApp$() {
  /*<skip>*/
}
$h_LApp$.prototype = $c_LApp$.prototype;
$c_LApp$.prototype.init___ = (function() {
  return this
});
$c_LApp$.prototype.$$js$exported$meth$run__Lmain_lib_Canvas__O = (function(c) {
  $s_Lmain_lib_Canvas$class__run__Lmain_lib_Canvas__V(c)
});
$c_LApp$.prototype.$$js$exported$meth$main__O = (function() {
  return (void 0)
});
$c_LApp$.prototype.main = (function() {
  return this.$$js$exported$meth$main__O()
});
$c_LApp$.prototype.run = (function(arg$1) {
  var prep0 = $as_Lmain_lib_Canvas(arg$1);
  return this.$$js$exported$meth$run__Lmain_lib_Canvas__O(prep0)
});
var $d_LApp$ = new $TypeData().initClass({
  LApp$: 0
}, false, "App$", {
  LApp$: 1,
  O: 1,
  sjs_js_JSApp: 1
});
$c_LApp$.prototype.$classData = $d_LApp$;
var $n_LApp$ = (void 0);
function $m_LApp$() {
  if ((!$n_LApp$)) {
    $n_LApp$ = new $c_LApp$().init___()
  };
  return $n_LApp$
}
$e.App = $m_LApp$;
/** @constructor */
function $c_Lmain_lib_DrawingUtils$ColorToMeshMaterial$() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_Lmain_lib_DrawingUtils$ColorToMeshMaterial$.prototype = new $h_O();
$c_Lmain_lib_DrawingUtils$ColorToMeshMaterial$.prototype.constructor = $c_Lmain_lib_DrawingUtils$ColorToMeshMaterial$;
/** @constructor */
function $h_Lmain_lib_DrawingUtils$ColorToMeshMaterial$() {
  /*<skip>*/
}
$h_Lmain_lib_DrawingUtils$ColorToMeshMaterial$.prototype = $c_Lmain_lib_DrawingUtils$ColorToMeshMaterial$.prototype;
$c_Lmain_lib_DrawingUtils$ColorToMeshMaterial$.prototype.toMeshMaterial__Lmain_lib_Color__Lmain_lib_MeshBasicMaterial = (function(t) {
  return new $g.THREE.MeshBasicMaterial({
    "color": t,
    "side": $as_Lmain_lib_Canvas(this.$$outer$1).faceSide$1
  })
});
$c_Lmain_lib_DrawingUtils$ColorToMeshMaterial$.prototype.init___Lmain_lib_DrawingUtils = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
var $d_Lmain_lib_DrawingUtils$ColorToMeshMaterial$ = new $TypeData().initClass({
  Lmain_lib_DrawingUtils$ColorToMeshMaterial$: 0
}, false, "main.lib.DrawingUtils$ColorToMeshMaterial$", {
  Lmain_lib_DrawingUtils$ColorToMeshMaterial$: 1,
  O: 1,
  Lmain_lib_DrawingUtils$MeshMaterialTypeClass: 1
});
$c_Lmain_lib_DrawingUtils$ColorToMeshMaterial$.prototype.$classData = $d_Lmain_lib_DrawingUtils$ColorToMeshMaterial$;
/** @constructor */
function $c_Lmain_lib_MathUtils$RichDouble() {
  $c_O.call(this);
  this.value$1 = 0.0;
  this.$$outer$f = null;
  this.PI$1 = 0.0;
  this.TWO$undPI$1 = 0.0;
  this.HALF$undPI$1 = 0.0;
  this.QUARTER$undPI$1 = 0.0;
  this.main$lib$MathUtils$$randomGen$1 = null;
  this.precision$1 = 0;
  this.fSinArr$1 = null;
  this.fCosArr$1 = null;
  this.fTanArr$1 = null;
  this.fASinArr$1 = null;
  this.fACosArr$1 = null;
  this.fATanArr$1 = null;
  this.fpSinArr$1 = null;
  this.fpCosArr$1 = null;
  this.bitmap$0$1 = 0
}
$c_Lmain_lib_MathUtils$RichDouble.prototype = new $h_O();
$c_Lmain_lib_MathUtils$RichDouble.prototype.constructor = $c_Lmain_lib_MathUtils$RichDouble;
/** @constructor */
function $h_Lmain_lib_MathUtils$RichDouble() {
  /*<skip>*/
}
$h_Lmain_lib_MathUtils$RichDouble.prototype = $c_Lmain_lib_MathUtils$RichDouble.prototype;
$c_Lmain_lib_MathUtils$RichDouble.prototype.main$lib$MathUtils$$undsetter$und$main$lib$MathUtils$$randomGen$und$eq__s_util_Random__V = (function(x$1) {
  this.main$lib$MathUtils$$randomGen$1 = x$1
});
$c_Lmain_lib_MathUtils$RichDouble.prototype.main$lib$MathUtils$$undsetter$und$PI$und$eq__D__V = (function(x$1) {
  this.PI$1 = x$1
});
$c_Lmain_lib_MathUtils$RichDouble.prototype.main$lib$MathUtils$$undsetter$und$TWO$undPI$und$eq__D__V = (function(x$1) {
  this.TWO$undPI$1 = x$1
});
$c_Lmain_lib_MathUtils$RichDouble.prototype.main$lib$MathUtils$$undsetter$und$precision$und$eq__I__V = (function(x$1) {
  this.precision$1 = x$1
});
$c_Lmain_lib_MathUtils$RichDouble.prototype.init___Lmain_lib_MathUtils__D = (function($$outer, value) {
  this.value$1 = value;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  $s_Lmain_lib_MathUtils$class__$$init$__Lmain_lib_MathUtils__V(this);
  return this
});
$c_Lmain_lib_MathUtils$RichDouble.prototype.PI__D = (function() {
  return this.PI$1
});
$c_Lmain_lib_MathUtils$RichDouble.prototype.main$lib$MathUtils$$undsetter$und$QUARTER$undPI$und$eq__D__V = (function(x$1) {
  this.QUARTER$undPI$1 = x$1
});
$c_Lmain_lib_MathUtils$RichDouble.prototype.main$lib$MathUtils$$randomGen__s_util_Random = (function() {
  return this.main$lib$MathUtils$$randomGen$1
});
$c_Lmain_lib_MathUtils$RichDouble.prototype.mapContrain__D__D__D__D__D = (function(in_min, in_max, out_min, out_max) {
  var value = this.value$1;
  return $s_Lmain_lib_MathUtils$class__mapContrain__Lmain_lib_MathUtils__D__D__D__D__D__D(this, value, in_min, in_max, out_min, out_max)
});
$c_Lmain_lib_MathUtils$RichDouble.prototype.main$lib$MathUtils$$undsetter$und$HALF$undPI$und$eq__D__V = (function(x$1) {
  this.HALF$undPI$1 = x$1
});
var $d_Lmain_lib_MathUtils$RichDouble = new $TypeData().initClass({
  Lmain_lib_MathUtils$RichDouble: 0
}, false, "main.lib.MathUtils$RichDouble", {
  Lmain_lib_MathUtils$RichDouble: 1,
  O: 1,
  Lmain_lib_MathUtils: 1
});
$c_Lmain_lib_MathUtils$RichDouble.prototype.$classData = $d_Lmain_lib_MathUtils$RichDouble;
/** @constructor */
function $c_Lmain_lib_WorldCoordinates$CenterCoordiantes$() {
  $c_O.call(this);
  this.center$1 = null;
  this.leftTop$1 = null;
  this.rightTop$1 = null;
  this.leftBottom$1 = null;
  this.rightBottom$1 = null
}
$c_Lmain_lib_WorldCoordinates$CenterCoordiantes$.prototype = new $h_O();
$c_Lmain_lib_WorldCoordinates$CenterCoordiantes$.prototype.constructor = $c_Lmain_lib_WorldCoordinates$CenterCoordiantes$;
/** @constructor */
function $h_Lmain_lib_WorldCoordinates$CenterCoordiantes$() {
  /*<skip>*/
}
$h_Lmain_lib_WorldCoordinates$CenterCoordiantes$.prototype = $c_Lmain_lib_WorldCoordinates$CenterCoordiantes$.prototype;
$c_Lmain_lib_WorldCoordinates$CenterCoordiantes$.prototype.init___Lmain_lib_WorldCoordinates = (function($$outer) {
  this.center$1 = new $g.THREE.Vector3(0.0, 0.0, 0.0);
  this.leftTop$1 = new $g.THREE.Vector3(((((-$s_Lmain_lib_WorldCoordinates$class__width__Lmain_lib_WorldCoordinates__I($$outer)) | 0) / 2) | 0), (($s_Lmain_lib_WorldCoordinates$class__height__Lmain_lib_WorldCoordinates__I($$outer) / 2) | 0), 0.0);
  this.rightTop$1 = new $g.THREE.Vector3((($s_Lmain_lib_WorldCoordinates$class__width__Lmain_lib_WorldCoordinates__I($$outer) / 2) | 0), (($s_Lmain_lib_WorldCoordinates$class__height__Lmain_lib_WorldCoordinates__I($$outer) / 2) | 0), 0.0);
  this.leftBottom$1 = new $g.THREE.Vector3(((((-$s_Lmain_lib_WorldCoordinates$class__width__Lmain_lib_WorldCoordinates__I($$outer)) | 0) / 2) | 0), ((((-$s_Lmain_lib_WorldCoordinates$class__height__Lmain_lib_WorldCoordinates__I($$outer)) | 0) / 2) | 0), 0.0);
  this.rightBottom$1 = new $g.THREE.Vector3((($s_Lmain_lib_WorldCoordinates$class__width__Lmain_lib_WorldCoordinates__I($$outer) / 2) | 0), ((((-$s_Lmain_lib_WorldCoordinates$class__height__Lmain_lib_WorldCoordinates__I($$outer)) | 0) / 2) | 0), 0.0);
  return this
});
var $d_Lmain_lib_WorldCoordinates$CenterCoordiantes$ = new $TypeData().initClass({
  Lmain_lib_WorldCoordinates$CenterCoordiantes$: 0
}, false, "main.lib.WorldCoordinates$CenterCoordiantes$", {
  Lmain_lib_WorldCoordinates$CenterCoordiantes$: 1,
  O: 1,
  Lmain_lib_WorldCoordinates$Coordinates: 1
});
$c_Lmain_lib_WorldCoordinates$CenterCoordiantes$.prototype.$classData = $d_Lmain_lib_WorldCoordinates$CenterCoordiantes$;
/** @constructor */
function $c_Lmain_lib_WorldCoordinates$LeftBottomCoordiantes$() {
  $c_O.call(this);
  this.center$1 = null;
  this.leftTop$1 = null;
  this.rightTop$1 = null;
  this.leftBottom$1 = null;
  this.rightBottom$1 = null
}
$c_Lmain_lib_WorldCoordinates$LeftBottomCoordiantes$.prototype = new $h_O();
$c_Lmain_lib_WorldCoordinates$LeftBottomCoordiantes$.prototype.constructor = $c_Lmain_lib_WorldCoordinates$LeftBottomCoordiantes$;
/** @constructor */
function $h_Lmain_lib_WorldCoordinates$LeftBottomCoordiantes$() {
  /*<skip>*/
}
$h_Lmain_lib_WorldCoordinates$LeftBottomCoordiantes$.prototype = $c_Lmain_lib_WorldCoordinates$LeftBottomCoordiantes$.prototype;
$c_Lmain_lib_WorldCoordinates$LeftBottomCoordiantes$.prototype.init___Lmain_lib_WorldCoordinates = (function($$outer) {
  this.center$1 = new $g.THREE.Vector3((($s_Lmain_lib_WorldCoordinates$class__width__Lmain_lib_WorldCoordinates__I($$outer) / 2) | 0), (($s_Lmain_lib_WorldCoordinates$class__height__Lmain_lib_WorldCoordinates__I($$outer) / 2) | 0), 0.0);
  this.leftTop$1 = new $g.THREE.Vector3(0.0, $s_Lmain_lib_WorldCoordinates$class__height__Lmain_lib_WorldCoordinates__I($$outer), 0.0);
  this.rightTop$1 = new $g.THREE.Vector3($s_Lmain_lib_WorldCoordinates$class__width__Lmain_lib_WorldCoordinates__I($$outer), $s_Lmain_lib_WorldCoordinates$class__height__Lmain_lib_WorldCoordinates__I($$outer), 0.0);
  this.leftBottom$1 = new $g.THREE.Vector3(0.0, 0.0, 0.0);
  this.rightBottom$1 = new $g.THREE.Vector3($s_Lmain_lib_WorldCoordinates$class__width__Lmain_lib_WorldCoordinates__I($$outer), 0.0, 0.0);
  return this
});
var $d_Lmain_lib_WorldCoordinates$LeftBottomCoordiantes$ = new $TypeData().initClass({
  Lmain_lib_WorldCoordinates$LeftBottomCoordiantes$: 0
}, false, "main.lib.WorldCoordinates$LeftBottomCoordiantes$", {
  Lmain_lib_WorldCoordinates$LeftBottomCoordiantes$: 1,
  O: 1,
  Lmain_lib_WorldCoordinates$Coordinates: 1
});
$c_Lmain_lib_WorldCoordinates$LeftBottomCoordiantes$.prototype.$classData = $d_Lmain_lib_WorldCoordinates$LeftBottomCoordiantes$;
var $d_jl_Boolean = new $TypeData().initClass({
  jl_Boolean: 0
}, false, "java.lang.Boolean", {
  jl_Boolean: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return ((typeof x) === "boolean")
}));
/** @constructor */
function $c_jl_Character() {
  $c_O.call(this);
  this.value$1 = 0
}
$c_jl_Character.prototype = new $h_O();
$c_jl_Character.prototype.constructor = $c_jl_Character;
/** @constructor */
function $h_jl_Character() {
  /*<skip>*/
}
$h_jl_Character.prototype = $c_jl_Character.prototype;
$c_jl_Character.prototype.equals__O__Z = (function(that) {
  if ($is_jl_Character(that)) {
    var jsx$1 = this.value$1;
    var this$1 = $as_jl_Character(that);
    return (jsx$1 === this$1.value$1)
  } else {
    return false
  }
});
$c_jl_Character.prototype.toString__T = (function() {
  var c = this.value$1;
  return $as_T($g.String.fromCharCode(c))
});
$c_jl_Character.prototype.init___C = (function(value) {
  this.value$1 = value;
  return this
});
$c_jl_Character.prototype.hashCode__I = (function() {
  return this.value$1
});
function $is_jl_Character(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Character)))
}
function $as_jl_Character(obj) {
  return (($is_jl_Character(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Character"))
}
function $isArrayOf_jl_Character(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Character)))
}
function $asArrayOf_jl_Character(obj, depth) {
  return (($isArrayOf_jl_Character(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Character;", depth))
}
var $d_jl_Character = new $TypeData().initClass({
  jl_Character: 0
}, false, "java.lang.Character", {
  jl_Character: 1,
  O: 1,
  jl_Comparable: 1
});
$c_jl_Character.prototype.$classData = $d_jl_Character;
/** @constructor */
function $c_jl_Throwable() {
  $c_O.call(this);
  this.s$1 = null;
  this.e$1 = null;
  this.stackTrace$1 = null
}
$c_jl_Throwable.prototype = new $h_O();
$c_jl_Throwable.prototype.constructor = $c_jl_Throwable;
/** @constructor */
function $h_jl_Throwable() {
  /*<skip>*/
}
$h_jl_Throwable.prototype = $c_jl_Throwable.prototype;
$c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable = (function() {
  var v = $g.Error.captureStackTrace;
  if ((v === (void 0))) {
    try {
      var e$1 = {}.undef()
    } catch (e) {
      var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
      if ((e$2 !== null)) {
        if ($is_sjs_js_JavaScriptException(e$2)) {
          var x5 = $as_sjs_js_JavaScriptException(e$2);
          var e$3 = x5.exception$4;
          var e$1 = e$3
        } else {
          var e$1;
          throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
        }
      } else {
        var e$1;
        throw e
      }
    };
    this.stackdata = e$1
  } else {
    $g.Error.captureStackTrace(this);
    this.stackdata = this
  };
  return this
});
$c_jl_Throwable.prototype.getMessage__T = (function() {
  return this.s$1
});
$c_jl_Throwable.prototype.toString__T = (function() {
  var className = $objectGetClass(this).getName__T();
  var message = this.getMessage__T();
  return ((message === null) ? className : ((className + ": ") + message))
});
$c_jl_Throwable.prototype.init___T__jl_Throwable = (function(s, e) {
  this.s$1 = s;
  this.e$1 = e;
  this.fillInStackTrace__jl_Throwable();
  return this
});
function $is_jl_Throwable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Throwable)))
}
function $as_jl_Throwable(obj) {
  return (($is_jl_Throwable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Throwable"))
}
function $isArrayOf_jl_Throwable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Throwable)))
}
function $asArrayOf_jl_Throwable(obj, depth) {
  return (($isArrayOf_jl_Throwable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Throwable;", depth))
}
/** @constructor */
function $c_ju_Random() {
  $c_O.call(this);
  this.seedHi$1 = 0;
  this.seedLo$1 = 0;
  this.nextNextGaussian$1 = 0.0;
  this.haveNextNextGaussian$1 = false
}
$c_ju_Random.prototype = new $h_O();
$c_ju_Random.prototype.constructor = $c_ju_Random;
/** @constructor */
function $h_ju_Random() {
  /*<skip>*/
}
$h_ju_Random.prototype = $c_ju_Random.prototype;
$c_ju_Random.prototype.init___ = (function() {
  $c_ju_Random.prototype.init___J.call(this, $m_ju_Random$().java$util$Random$$randomSeed__J());
  return this
});
$c_ju_Random.prototype.init___J = (function(seed_in) {
  this.haveNextNextGaussian$1 = false;
  this.setSeed__J__V(seed_in);
  return this
});
$c_ju_Random.prototype.nextInt__I__I = (function(n) {
  if ((n <= 0)) {
    throw new $c_jl_IllegalArgumentException().init___T("n must be positive")
  } else {
    return (((n & ((-n) | 0)) === n) ? (this.next__I__I(31) >> $clz32(n)) : this.loop$1__p1__I__I(n))
  }
});
$c_ju_Random.prototype.next__I__I = (function(bits) {
  var oldSeedHi = this.seedHi$1;
  var oldSeedLo = this.seedLo$1;
  var loProd = (11 + (15525485 * oldSeedLo));
  var hiProd = ((1502 * oldSeedLo) + (15525485 * oldSeedHi));
  var x = (loProd / 16777216);
  var newSeedHi = (16777215 & (($uI((x | 0)) + (16777215 & $uI((hiProd | 0)))) | 0));
  var newSeedLo = (16777215 & $uI((loProd | 0)));
  this.seedHi$1 = newSeedHi;
  this.seedLo$1 = newSeedLo;
  var result32 = ((newSeedHi << 8) | (newSeedLo >> 16));
  return ((result32 >>> ((32 - bits) | 0)) | 0)
});
$c_ju_Random.prototype.loop$1__p1__I__I = (function(n$1) {
  _loop: while (true) {
    var bits = this.next__I__I(31);
    var value = ((bits % n$1) | 0);
    if ((((((bits - value) | 0) + (((-1) + n$1) | 0)) | 0) < 0)) {
      continue _loop
    } else {
      return value
    }
  }
});
$c_ju_Random.prototype.nextDouble__D = (function() {
  return (((1.34217728E8 * this.next__I__I(26)) + this.next__I__I(27)) / 9.007199254740992E15)
});
$c_ju_Random.prototype.setSeed__J__V = (function(seed_in) {
  var seed = new $c_sjsr_RuntimeLong().init___I__I((-1), 65535).$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I__I((-554899859), 5).$$up__sjsr_RuntimeLong__sjsr_RuntimeLong(seed_in));
  this.seedHi$1 = seed.$$greater$greater$greater__I__sjsr_RuntimeLong(24).lo$2;
  this.seedLo$1 = (16777215 & seed.lo$2);
  this.haveNextNextGaussian$1 = false
});
var $d_ju_Random = new $TypeData().initClass({
  ju_Random: 0
}, false, "java.util.Random", {
  ju_Random: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_ju_Random.prototype.$classData = $d_ju_Random;
/** @constructor */
function $c_s_Predef$$anon$3() {
  $c_O.call(this)
}
$c_s_Predef$$anon$3.prototype = new $h_O();
$c_s_Predef$$anon$3.prototype.constructor = $c_s_Predef$$anon$3;
/** @constructor */
function $h_s_Predef$$anon$3() {
  /*<skip>*/
}
$h_s_Predef$$anon$3.prototype = $c_s_Predef$$anon$3.prototype;
$c_s_Predef$$anon$3.prototype.init___ = (function() {
  return this
});
$c_s_Predef$$anon$3.prototype.apply__scm_Builder = (function() {
  return new $c_scm_StringBuilder().init___()
});
$c_s_Predef$$anon$3.prototype.apply__O__scm_Builder = (function(from) {
  $as_T(from);
  return new $c_scm_StringBuilder().init___()
});
var $d_s_Predef$$anon$3 = new $TypeData().initClass({
  s_Predef$$anon$3: 0
}, false, "scala.Predef$$anon$3", {
  s_Predef$$anon$3: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_s_Predef$$anon$3.prototype.$classData = $d_s_Predef$$anon$3;
function $is_s_math_ScalaNumber(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_math_ScalaNumber)))
}
function $as_s_math_ScalaNumber(obj) {
  return (($is_s_math_ScalaNumber(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.math.ScalaNumber"))
}
function $isArrayOf_s_math_ScalaNumber(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_math_ScalaNumber)))
}
function $asArrayOf_s_math_ScalaNumber(obj, depth) {
  return (($isArrayOf_s_math_ScalaNumber(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.math.ScalaNumber;", depth))
}
/** @constructor */
function $c_s_package$$anon$1() {
  $c_O.call(this)
}
$c_s_package$$anon$1.prototype = new $h_O();
$c_s_package$$anon$1.prototype.constructor = $c_s_package$$anon$1;
/** @constructor */
function $h_s_package$$anon$1() {
  /*<skip>*/
}
$h_s_package$$anon$1.prototype = $c_s_package$$anon$1.prototype;
$c_s_package$$anon$1.prototype.init___ = (function() {
  return this
});
$c_s_package$$anon$1.prototype.toString__T = (function() {
  return "object AnyRef"
});
var $d_s_package$$anon$1 = new $TypeData().initClass({
  s_package$$anon$1: 0
}, false, "scala.package$$anon$1", {
  s_package$$anon$1: 1,
  O: 1,
  s_Specializable: 1
});
$c_s_package$$anon$1.prototype.$classData = $d_s_package$$anon$1;
/** @constructor */
function $c_s_util_hashing_MurmurHash3$() {
  $c_s_util_hashing_MurmurHash3.call(this);
  this.arraySeed$2 = 0;
  this.stringSeed$2 = 0;
  this.productSeed$2 = 0;
  this.symmetricSeed$2 = 0;
  this.traversableSeed$2 = 0;
  this.seqSeed$2 = 0;
  this.mapSeed$2 = 0;
  this.setSeed$2 = 0
}
$c_s_util_hashing_MurmurHash3$.prototype = new $h_s_util_hashing_MurmurHash3();
$c_s_util_hashing_MurmurHash3$.prototype.constructor = $c_s_util_hashing_MurmurHash3$;
/** @constructor */
function $h_s_util_hashing_MurmurHash3$() {
  /*<skip>*/
}
$h_s_util_hashing_MurmurHash3$.prototype = $c_s_util_hashing_MurmurHash3$.prototype;
$c_s_util_hashing_MurmurHash3$.prototype.init___ = (function() {
  $n_s_util_hashing_MurmurHash3$ = this;
  this.seqSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Seq");
  this.mapSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Map");
  this.setSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Set");
  return this
});
$c_s_util_hashing_MurmurHash3$.prototype.seqHash__sc_Seq__I = (function(xs) {
  if ($is_sci_List(xs)) {
    var x2 = $as_sci_List(xs);
    return this.listHash__sci_List__I__I(x2, this.seqSeed$2)
  } else {
    return this.orderedHash__sc_TraversableOnce__I__I(xs, this.seqSeed$2)
  }
});
var $d_s_util_hashing_MurmurHash3$ = new $TypeData().initClass({
  s_util_hashing_MurmurHash3$: 0
}, false, "scala.util.hashing.MurmurHash3$", {
  s_util_hashing_MurmurHash3$: 1,
  s_util_hashing_MurmurHash3: 1,
  O: 1
});
$c_s_util_hashing_MurmurHash3$.prototype.$classData = $d_s_util_hashing_MurmurHash3$;
var $n_s_util_hashing_MurmurHash3$ = (void 0);
function $m_s_util_hashing_MurmurHash3$() {
  if ((!$n_s_util_hashing_MurmurHash3$)) {
    $n_s_util_hashing_MurmurHash3$ = new $c_s_util_hashing_MurmurHash3$().init___()
  };
  return $n_s_util_hashing_MurmurHash3$
}
/** @constructor */
function $c_scg_GenSetFactory() {
  $c_scg_GenericCompanion.call(this)
}
$c_scg_GenSetFactory.prototype = new $h_scg_GenericCompanion();
$c_scg_GenSetFactory.prototype.constructor = $c_scg_GenSetFactory;
/** @constructor */
function $h_scg_GenSetFactory() {
  /*<skip>*/
}
$h_scg_GenSetFactory.prototype = $c_scg_GenSetFactory.prototype;
/** @constructor */
function $c_scg_GenTraversableFactory() {
  $c_scg_GenericCompanion.call(this);
  this.ReusableCBFInstance$2 = null
}
$c_scg_GenTraversableFactory.prototype = new $h_scg_GenericCompanion();
$c_scg_GenTraversableFactory.prototype.constructor = $c_scg_GenTraversableFactory;
/** @constructor */
function $h_scg_GenTraversableFactory() {
  /*<skip>*/
}
$h_scg_GenTraversableFactory.prototype = $c_scg_GenTraversableFactory.prototype;
$c_scg_GenTraversableFactory.prototype.init___ = (function() {
  this.ReusableCBFInstance$2 = new $c_scg_GenTraversableFactory$$anon$1().init___scg_GenTraversableFactory(this);
  return this
});
/** @constructor */
function $c_scg_GenTraversableFactory$GenericCanBuildFrom() {
  $c_O.call(this);
  this.$$outer$f = null
}
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype = new $h_O();
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.constructor = $c_scg_GenTraversableFactory$GenericCanBuildFrom;
/** @constructor */
function $h_scg_GenTraversableFactory$GenericCanBuildFrom() {
  /*<skip>*/
}
$h_scg_GenTraversableFactory$GenericCanBuildFrom.prototype = $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype;
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.apply__scm_Builder = (function() {
  return this.$$outer$f.newBuilder__scm_Builder()
});
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.apply__O__scm_Builder = (function(from) {
  var from$1 = $as_sc_GenTraversable(from);
  return from$1.companion__scg_GenericCompanion().newBuilder__scm_Builder()
});
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  return this
});
/** @constructor */
function $c_scg_MapFactory() {
  $c_scg_GenMapFactory.call(this)
}
$c_scg_MapFactory.prototype = new $h_scg_GenMapFactory();
$c_scg_MapFactory.prototype.constructor = $c_scg_MapFactory;
/** @constructor */
function $h_scg_MapFactory() {
  /*<skip>*/
}
$h_scg_MapFactory.prototype = $c_scg_MapFactory.prototype;
/** @constructor */
function $c_sci_List$$anon$1() {
  $c_O.call(this)
}
$c_sci_List$$anon$1.prototype = new $h_O();
$c_sci_List$$anon$1.prototype.constructor = $c_sci_List$$anon$1;
/** @constructor */
function $h_sci_List$$anon$1() {
  /*<skip>*/
}
$h_sci_List$$anon$1.prototype = $c_sci_List$$anon$1.prototype;
$c_sci_List$$anon$1.prototype.init___ = (function() {
  return this
});
$c_sci_List$$anon$1.prototype.apply__O__O = (function(x) {
  return this
});
$c_sci_List$$anon$1.prototype.toString__T = (function() {
  return "<function1>"
});
var $d_sci_List$$anon$1 = new $TypeData().initClass({
  sci_List$$anon$1: 0
}, false, "scala.collection.immutable.List$$anon$1", {
  sci_List$$anon$1: 1,
  O: 1,
  F1: 1
});
$c_sci_List$$anon$1.prototype.$classData = $d_sci_List$$anon$1;
function $is_scm_Builder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_Builder)))
}
function $as_scm_Builder(obj) {
  return (($is_scm_Builder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.Builder"))
}
function $isArrayOf_scm_Builder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_Builder)))
}
function $asArrayOf_scm_Builder(obj, depth) {
  return (($isArrayOf_scm_Builder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.Builder;", depth))
}
/** @constructor */
function $c_sr_AbstractFunction0() {
  $c_O.call(this)
}
$c_sr_AbstractFunction0.prototype = new $h_O();
$c_sr_AbstractFunction0.prototype.constructor = $c_sr_AbstractFunction0;
/** @constructor */
function $h_sr_AbstractFunction0() {
  /*<skip>*/
}
$h_sr_AbstractFunction0.prototype = $c_sr_AbstractFunction0.prototype;
$c_sr_AbstractFunction0.prototype.toString__T = (function() {
  return "<function0>"
});
/** @constructor */
function $c_sr_AbstractFunction1() {
  $c_O.call(this)
}
$c_sr_AbstractFunction1.prototype = new $h_O();
$c_sr_AbstractFunction1.prototype.constructor = $c_sr_AbstractFunction1;
/** @constructor */
function $h_sr_AbstractFunction1() {
  /*<skip>*/
}
$h_sr_AbstractFunction1.prototype = $c_sr_AbstractFunction1.prototype;
$c_sr_AbstractFunction1.prototype.toString__T = (function() {
  return "<function1>"
});
/** @constructor */
function $c_sr_AbstractFunction2() {
  $c_O.call(this)
}
$c_sr_AbstractFunction2.prototype = new $h_O();
$c_sr_AbstractFunction2.prototype.constructor = $c_sr_AbstractFunction2;
/** @constructor */
function $h_sr_AbstractFunction2() {
  /*<skip>*/
}
$h_sr_AbstractFunction2.prototype = $c_sr_AbstractFunction2.prototype;
$c_sr_AbstractFunction2.prototype.toString__T = (function() {
  return "<function2>"
});
/** @constructor */
function $c_sr_BooleanRef() {
  $c_O.call(this);
  this.elem$1 = false
}
$c_sr_BooleanRef.prototype = new $h_O();
$c_sr_BooleanRef.prototype.constructor = $c_sr_BooleanRef;
/** @constructor */
function $h_sr_BooleanRef() {
  /*<skip>*/
}
$h_sr_BooleanRef.prototype = $c_sr_BooleanRef.prototype;
$c_sr_BooleanRef.prototype.toString__T = (function() {
  var value = this.elem$1;
  return ("" + value)
});
$c_sr_BooleanRef.prototype.init___Z = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_BooleanRef = new $TypeData().initClass({
  sr_BooleanRef: 0
}, false, "scala.runtime.BooleanRef", {
  sr_BooleanRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_BooleanRef.prototype.$classData = $d_sr_BooleanRef;
/** @constructor */
function $c_sr_IntRef() {
  $c_O.call(this);
  this.elem$1 = 0
}
$c_sr_IntRef.prototype = new $h_O();
$c_sr_IntRef.prototype.constructor = $c_sr_IntRef;
/** @constructor */
function $h_sr_IntRef() {
  /*<skip>*/
}
$h_sr_IntRef.prototype = $c_sr_IntRef.prototype;
$c_sr_IntRef.prototype.toString__T = (function() {
  var value = this.elem$1;
  return ("" + value)
});
$c_sr_IntRef.prototype.init___I = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_IntRef = new $TypeData().initClass({
  sr_IntRef: 0
}, false, "scala.runtime.IntRef", {
  sr_IntRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_IntRef.prototype.$classData = $d_sr_IntRef;
/** @constructor */
function $c_sr_ObjectRef() {
  $c_O.call(this);
  this.elem$1 = null
}
$c_sr_ObjectRef.prototype = new $h_O();
$c_sr_ObjectRef.prototype.constructor = $c_sr_ObjectRef;
/** @constructor */
function $h_sr_ObjectRef() {
  /*<skip>*/
}
$h_sr_ObjectRef.prototype = $c_sr_ObjectRef.prototype;
$c_sr_ObjectRef.prototype.toString__T = (function() {
  return $m_sjsr_RuntimeString$().valueOf__O__T(this.elem$1)
});
$c_sr_ObjectRef.prototype.init___O = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_ObjectRef = new $TypeData().initClass({
  sr_ObjectRef: 0
}, false, "scala.runtime.ObjectRef", {
  sr_ObjectRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_ObjectRef.prototype.$classData = $d_sr_ObjectRef;
/** @constructor */
function $c_Ljava_io_OutputStream() {
  $c_O.call(this)
}
$c_Ljava_io_OutputStream.prototype = new $h_O();
$c_Ljava_io_OutputStream.prototype.constructor = $c_Ljava_io_OutputStream;
/** @constructor */
function $h_Ljava_io_OutputStream() {
  /*<skip>*/
}
$h_Ljava_io_OutputStream.prototype = $c_Ljava_io_OutputStream.prototype;
var $d_jl_Byte = new $TypeData().initClass({
  jl_Byte: 0
}, false, "java.lang.Byte", {
  jl_Byte: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isByte(x)
}));
function $isArrayOf_jl_Double(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Double)))
}
function $asArrayOf_jl_Double(obj, depth) {
  return (($isArrayOf_jl_Double(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Double;", depth))
}
var $d_jl_Double = new $TypeData().initClass({
  jl_Double: 0
}, false, "java.lang.Double", {
  jl_Double: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return ((typeof x) === "number")
}));
/** @constructor */
function $c_jl_Error() {
  $c_jl_Throwable.call(this)
}
$c_jl_Error.prototype = new $h_jl_Throwable();
$c_jl_Error.prototype.constructor = $c_jl_Error;
/** @constructor */
function $h_jl_Error() {
  /*<skip>*/
}
$h_jl_Error.prototype = $c_jl_Error.prototype;
$c_jl_Error.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_Error = new $TypeData().initClass({
  jl_Error: 0
}, false, "java.lang.Error", {
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Error.prototype.$classData = $d_jl_Error;
/** @constructor */
function $c_jl_Exception() {
  $c_jl_Throwable.call(this)
}
$c_jl_Exception.prototype = new $h_jl_Throwable();
$c_jl_Exception.prototype.constructor = $c_jl_Exception;
/** @constructor */
function $h_jl_Exception() {
  /*<skip>*/
}
$h_jl_Exception.prototype = $c_jl_Exception.prototype;
var $d_jl_Float = new $TypeData().initClass({
  jl_Float: 0
}, false, "java.lang.Float", {
  jl_Float: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isFloat(x)
}));
function $isArrayOf_jl_Integer(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Integer)))
}
function $asArrayOf_jl_Integer(obj, depth) {
  return (($isArrayOf_jl_Integer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Integer;", depth))
}
var $d_jl_Integer = new $TypeData().initClass({
  jl_Integer: 0
}, false, "java.lang.Integer", {
  jl_Integer: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isInt(x)
}));
function $isArrayOf_jl_Long(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Long)))
}
function $asArrayOf_jl_Long(obj, depth) {
  return (($isArrayOf_jl_Long(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Long;", depth))
}
var $d_jl_Long = new $TypeData().initClass({
  jl_Long: 0
}, false, "java.lang.Long", {
  jl_Long: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $is_sjsr_RuntimeLong(x)
}));
var $d_jl_Short = new $TypeData().initClass({
  jl_Short: 0
}, false, "java.lang.Short", {
  jl_Short: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isShort(x)
}));
/** @constructor */
function $c_ju_Random$() {
  $c_O.call(this)
}
$c_ju_Random$.prototype = new $h_O();
$c_ju_Random$.prototype.constructor = $c_ju_Random$;
/** @constructor */
function $h_ju_Random$() {
  /*<skip>*/
}
$h_ju_Random$.prototype = $c_ju_Random$.prototype;
$c_ju_Random$.prototype.init___ = (function() {
  return this
});
$c_ju_Random$.prototype.java$util$Random$$randomSeed__J = (function() {
  return new $c_sjsr_RuntimeLong().init___I(this.randomInt__p1__I()).$$less$less__I__sjsr_RuntimeLong(32).$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I__I((-1), 0).$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong(new $c_sjsr_RuntimeLong().init___I(this.randomInt__p1__I())))
});
$c_ju_Random$.prototype.randomInt__p1__I = (function() {
  var a = (4.294967296E9 * $uD($g.Math.random()));
  return $doubleToInt(((-2.147483648E9) + $uD($g.Math.floor(a))))
});
var $d_ju_Random$ = new $TypeData().initClass({
  ju_Random$: 0
}, false, "java.util.Random$", {
  ju_Random$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_ju_Random$.prototype.$classData = $d_ju_Random$;
var $n_ju_Random$ = (void 0);
function $m_ju_Random$() {
  if ((!$n_ju_Random$)) {
    $n_ju_Random$ = new $c_ju_Random$().init___()
  };
  return $n_ju_Random$
}
/** @constructor */
function $c_s_Console$() {
  $c_s_DeprecatedConsole.call(this);
  this.outVar$2 = null;
  this.errVar$2 = null;
  this.inVar$2 = null
}
$c_s_Console$.prototype = new $h_s_DeprecatedConsole();
$c_s_Console$.prototype.constructor = $c_s_Console$;
/** @constructor */
function $h_s_Console$() {
  /*<skip>*/
}
$h_s_Console$.prototype = $c_s_Console$.prototype;
$c_s_Console$.prototype.init___ = (function() {
  $n_s_Console$ = this;
  this.outVar$2 = new $c_s_util_DynamicVariable().init___O($m_jl_System$().out$1);
  this.errVar$2 = new $c_s_util_DynamicVariable().init___O($m_jl_System$().err$1);
  this.inVar$2 = new $c_s_util_DynamicVariable().init___O(null);
  return this
});
var $d_s_Console$ = new $TypeData().initClass({
  s_Console$: 0
}, false, "scala.Console$", {
  s_Console$: 1,
  s_DeprecatedConsole: 1,
  O: 1,
  s_io_AnsiColor: 1
});
$c_s_Console$.prototype.$classData = $d_s_Console$;
var $n_s_Console$ = (void 0);
function $m_s_Console$() {
  if ((!$n_s_Console$)) {
    $n_s_Console$ = new $c_s_Console$().init___()
  };
  return $n_s_Console$
}
/** @constructor */
function $c_s_Predef$() {
  $c_s_LowPriorityImplicits.call(this);
  this.Map$2 = null;
  this.Set$2 = null;
  this.ClassManifest$2 = null;
  this.Manifest$2 = null;
  this.NoManifest$2 = null;
  this.StringCanBuildFrom$2 = null;
  this.singleton$und$less$colon$less$2 = null;
  this.scala$Predef$$singleton$und$eq$colon$eq$f = null
}
$c_s_Predef$.prototype = new $h_s_LowPriorityImplicits();
$c_s_Predef$.prototype.constructor = $c_s_Predef$;
/** @constructor */
function $h_s_Predef$() {
  /*<skip>*/
}
$h_s_Predef$.prototype = $c_s_Predef$.prototype;
$c_s_Predef$.prototype.init___ = (function() {
  $n_s_Predef$ = this;
  $m_s_package$();
  $m_sci_List$();
  this.Map$2 = $m_sci_Map$();
  this.Set$2 = $m_sci_Set$();
  this.ClassManifest$2 = $m_s_reflect_package$().ClassManifest$1;
  this.Manifest$2 = $m_s_reflect_package$().Manifest$1;
  this.NoManifest$2 = $m_s_reflect_NoManifest$();
  this.StringCanBuildFrom$2 = new $c_s_Predef$$anon$3().init___();
  this.singleton$und$less$colon$less$2 = new $c_s_Predef$$anon$1().init___();
  this.scala$Predef$$singleton$und$eq$colon$eq$f = new $c_s_Predef$$anon$2().init___();
  return this
});
$c_s_Predef$.prototype.assert__Z__V = (function(assertion) {
  if ((!assertion)) {
    throw new $c_jl_AssertionError().init___O("assertion failed")
  }
});
$c_s_Predef$.prototype.require__Z__V = (function(requirement) {
  if ((!requirement)) {
    throw new $c_jl_IllegalArgumentException().init___T("requirement failed")
  }
});
var $d_s_Predef$ = new $TypeData().initClass({
  s_Predef$: 0
}, false, "scala.Predef$", {
  s_Predef$: 1,
  s_LowPriorityImplicits: 1,
  O: 1,
  s_DeprecatedPredef: 1
});
$c_s_Predef$.prototype.$classData = $d_s_Predef$;
var $n_s_Predef$ = (void 0);
function $m_s_Predef$() {
  if ((!$n_s_Predef$)) {
    $n_s_Predef$ = new $c_s_Predef$().init___()
  };
  return $n_s_Predef$
}
/** @constructor */
function $c_s_StringContext$() {
  $c_O.call(this)
}
$c_s_StringContext$.prototype = new $h_O();
$c_s_StringContext$.prototype.constructor = $c_s_StringContext$;
/** @constructor */
function $h_s_StringContext$() {
  /*<skip>*/
}
$h_s_StringContext$.prototype = $c_s_StringContext$.prototype;
$c_s_StringContext$.prototype.init___ = (function() {
  return this
});
$c_s_StringContext$.prototype.treatEscapes0__p1__T__Z__T = (function(str, strict) {
  var len = $uI(str.length);
  var x1 = $m_sjsr_RuntimeString$().indexOf__T__I__I(str, 92);
  switch (x1) {
    case (-1): {
      return str;
      break
    }
    default: {
      return this.replace$1__p1__I__T__Z__I__T(x1, str, strict, len)
    }
  }
});
$c_s_StringContext$.prototype.loop$1__p1__I__I__T__Z__I__jl_StringBuilder__T = (function(i, next, str$1, strict$1, len$1, b$1) {
  _loop: while (true) {
    if ((next >= 0)) {
      if ((next > i)) {
        b$1.append__jl_CharSequence__I__I__jl_StringBuilder(str$1, i, next)
      };
      var idx = ((1 + next) | 0);
      if ((idx >= len$1)) {
        throw new $c_s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
      };
      var index = idx;
      var x1 = (65535 & $uI(str$1.charCodeAt(index)));
      switch (x1) {
        case 98: {
          var c = 8;
          break
        }
        case 116: {
          var c = 9;
          break
        }
        case 110: {
          var c = 10;
          break
        }
        case 102: {
          var c = 12;
          break
        }
        case 114: {
          var c = 13;
          break
        }
        case 34: {
          var c = 34;
          break
        }
        case 39: {
          var c = 39;
          break
        }
        case 92: {
          var c = 92;
          break
        }
        default: {
          if (((x1 >= 48) && (x1 <= 55))) {
            if (strict$1) {
              throw new $c_s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
            };
            var index$1 = idx;
            var leadch = (65535 & $uI(str$1.charCodeAt(index$1)));
            var oct = (((-48) + leadch) | 0);
            idx = ((1 + idx) | 0);
            if ((idx < len$1)) {
              var index$2 = idx;
              var jsx$2 = ((65535 & $uI(str$1.charCodeAt(index$2))) >= 48)
            } else {
              var jsx$2 = false
            };
            if (jsx$2) {
              var index$3 = idx;
              var jsx$1 = ((65535 & $uI(str$1.charCodeAt(index$3))) <= 55)
            } else {
              var jsx$1 = false
            };
            if (jsx$1) {
              var jsx$3 = oct;
              var index$4 = idx;
              oct = (((-48) + (($imul(8, jsx$3) + (65535 & $uI(str$1.charCodeAt(index$4)))) | 0)) | 0);
              idx = ((1 + idx) | 0);
              if (((idx < len$1) && (leadch <= 51))) {
                var index$5 = idx;
                var jsx$5 = ((65535 & $uI(str$1.charCodeAt(index$5))) >= 48)
              } else {
                var jsx$5 = false
              };
              if (jsx$5) {
                var index$6 = idx;
                var jsx$4 = ((65535 & $uI(str$1.charCodeAt(index$6))) <= 55)
              } else {
                var jsx$4 = false
              };
              if (jsx$4) {
                var jsx$6 = oct;
                var index$7 = idx;
                oct = (((-48) + (($imul(8, jsx$6) + (65535 & $uI(str$1.charCodeAt(index$7)))) | 0)) | 0);
                idx = ((1 + idx) | 0)
              }
            };
            idx = (((-1) + idx) | 0);
            var c = (65535 & oct)
          } else {
            var c;
            throw new $c_s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
          }
        }
      };
      idx = ((1 + idx) | 0);
      b$1.append__C__jl_StringBuilder(c);
      var temp$i = idx;
      var temp$next = $m_sjsr_RuntimeString$().indexOf__T__I__I__I(str$1, 92, idx);
      i = temp$i;
      next = temp$next;
      continue _loop
    } else {
      if ((i < len$1)) {
        b$1.append__jl_CharSequence__I__I__jl_StringBuilder(str$1, i, len$1)
      };
      return b$1.content$1
    }
  }
});
$c_s_StringContext$.prototype.replace$1__p1__I__T__Z__I__T = (function(first, str$1, strict$1, len$1) {
  var b = new $c_jl_StringBuilder().init___();
  return this.loop$1__p1__I__I__T__Z__I__jl_StringBuilder__T(0, first, str$1, strict$1, len$1, b)
});
var $d_s_StringContext$ = new $TypeData().initClass({
  s_StringContext$: 0
}, false, "scala.StringContext$", {
  s_StringContext$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_StringContext$.prototype.$classData = $d_s_StringContext$;
var $n_s_StringContext$ = (void 0);
function $m_s_StringContext$() {
  if ((!$n_s_StringContext$)) {
    $n_s_StringContext$ = new $c_s_StringContext$().init___()
  };
  return $n_s_StringContext$
}
/** @constructor */
function $c_s_math_Fractional$() {
  $c_O.call(this)
}
$c_s_math_Fractional$.prototype = new $h_O();
$c_s_math_Fractional$.prototype.constructor = $c_s_math_Fractional$;
/** @constructor */
function $h_s_math_Fractional$() {
  /*<skip>*/
}
$h_s_math_Fractional$.prototype = $c_s_math_Fractional$.prototype;
$c_s_math_Fractional$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Fractional$ = new $TypeData().initClass({
  s_math_Fractional$: 0
}, false, "scala.math.Fractional$", {
  s_math_Fractional$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Fractional$.prototype.$classData = $d_s_math_Fractional$;
var $n_s_math_Fractional$ = (void 0);
function $m_s_math_Fractional$() {
  if ((!$n_s_math_Fractional$)) {
    $n_s_math_Fractional$ = new $c_s_math_Fractional$().init___()
  };
  return $n_s_math_Fractional$
}
/** @constructor */
function $c_s_math_Integral$() {
  $c_O.call(this)
}
$c_s_math_Integral$.prototype = new $h_O();
$c_s_math_Integral$.prototype.constructor = $c_s_math_Integral$;
/** @constructor */
function $h_s_math_Integral$() {
  /*<skip>*/
}
$h_s_math_Integral$.prototype = $c_s_math_Integral$.prototype;
$c_s_math_Integral$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Integral$ = new $TypeData().initClass({
  s_math_Integral$: 0
}, false, "scala.math.Integral$", {
  s_math_Integral$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Integral$.prototype.$classData = $d_s_math_Integral$;
var $n_s_math_Integral$ = (void 0);
function $m_s_math_Integral$() {
  if ((!$n_s_math_Integral$)) {
    $n_s_math_Integral$ = new $c_s_math_Integral$().init___()
  };
  return $n_s_math_Integral$
}
/** @constructor */
function $c_s_math_Numeric$() {
  $c_O.call(this)
}
$c_s_math_Numeric$.prototype = new $h_O();
$c_s_math_Numeric$.prototype.constructor = $c_s_math_Numeric$;
/** @constructor */
function $h_s_math_Numeric$() {
  /*<skip>*/
}
$h_s_math_Numeric$.prototype = $c_s_math_Numeric$.prototype;
$c_s_math_Numeric$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Numeric$ = new $TypeData().initClass({
  s_math_Numeric$: 0
}, false, "scala.math.Numeric$", {
  s_math_Numeric$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Numeric$.prototype.$classData = $d_s_math_Numeric$;
var $n_s_math_Numeric$ = (void 0);
function $m_s_math_Numeric$() {
  if ((!$n_s_math_Numeric$)) {
    $n_s_math_Numeric$ = new $c_s_math_Numeric$().init___()
  };
  return $n_s_math_Numeric$
}
/** @constructor */
function $c_s_util_Left$() {
  $c_O.call(this)
}
$c_s_util_Left$.prototype = new $h_O();
$c_s_util_Left$.prototype.constructor = $c_s_util_Left$;
/** @constructor */
function $h_s_util_Left$() {
  /*<skip>*/
}
$h_s_util_Left$.prototype = $c_s_util_Left$.prototype;
$c_s_util_Left$.prototype.init___ = (function() {
  return this
});
$c_s_util_Left$.prototype.toString__T = (function() {
  return "Left"
});
var $d_s_util_Left$ = new $TypeData().initClass({
  s_util_Left$: 0
}, false, "scala.util.Left$", {
  s_util_Left$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Left$.prototype.$classData = $d_s_util_Left$;
var $n_s_util_Left$ = (void 0);
function $m_s_util_Left$() {
  if ((!$n_s_util_Left$)) {
    $n_s_util_Left$ = new $c_s_util_Left$().init___()
  };
  return $n_s_util_Left$
}
/** @constructor */
function $c_s_util_Random() {
  $c_O.call(this);
  this.self$1 = null
}
$c_s_util_Random.prototype = new $h_O();
$c_s_util_Random.prototype.constructor = $c_s_util_Random;
/** @constructor */
function $h_s_util_Random() {
  /*<skip>*/
}
$h_s_util_Random.prototype = $c_s_util_Random.prototype;
$c_s_util_Random.prototype.init___ = (function() {
  $c_s_util_Random.prototype.init___ju_Random.call(this, new $c_ju_Random().init___());
  return this
});
$c_s_util_Random.prototype.init___ju_Random = (function(self) {
  this.self$1 = self;
  return this
});
var $d_s_util_Random = new $TypeData().initClass({
  s_util_Random: 0
}, false, "scala.util.Random", {
  s_util_Random: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Random.prototype.$classData = $d_s_util_Random;
/** @constructor */
function $c_s_util_Right$() {
  $c_O.call(this)
}
$c_s_util_Right$.prototype = new $h_O();
$c_s_util_Right$.prototype.constructor = $c_s_util_Right$;
/** @constructor */
function $h_s_util_Right$() {
  /*<skip>*/
}
$h_s_util_Right$.prototype = $c_s_util_Right$.prototype;
$c_s_util_Right$.prototype.init___ = (function() {
  return this
});
$c_s_util_Right$.prototype.toString__T = (function() {
  return "Right"
});
var $d_s_util_Right$ = new $TypeData().initClass({
  s_util_Right$: 0
}, false, "scala.util.Right$", {
  s_util_Right$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Right$.prototype.$classData = $d_s_util_Right$;
var $n_s_util_Right$ = (void 0);
function $m_s_util_Right$() {
  if ((!$n_s_util_Right$)) {
    $n_s_util_Right$ = new $c_s_util_Right$().init___()
  };
  return $n_s_util_Right$
}
/** @constructor */
function $c_s_util_control_NoStackTrace$() {
  $c_O.call(this);
  this.$$undnoSuppression$1 = false
}
$c_s_util_control_NoStackTrace$.prototype = new $h_O();
$c_s_util_control_NoStackTrace$.prototype.constructor = $c_s_util_control_NoStackTrace$;
/** @constructor */
function $h_s_util_control_NoStackTrace$() {
  /*<skip>*/
}
$h_s_util_control_NoStackTrace$.prototype = $c_s_util_control_NoStackTrace$.prototype;
$c_s_util_control_NoStackTrace$.prototype.init___ = (function() {
  this.$$undnoSuppression$1 = false;
  return this
});
var $d_s_util_control_NoStackTrace$ = new $TypeData().initClass({
  s_util_control_NoStackTrace$: 0
}, false, "scala.util.control.NoStackTrace$", {
  s_util_control_NoStackTrace$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_control_NoStackTrace$.prototype.$classData = $d_s_util_control_NoStackTrace$;
var $n_s_util_control_NoStackTrace$ = (void 0);
function $m_s_util_control_NoStackTrace$() {
  if ((!$n_s_util_control_NoStackTrace$)) {
    $n_s_util_control_NoStackTrace$ = new $c_s_util_control_NoStackTrace$().init___()
  };
  return $n_s_util_control_NoStackTrace$
}
/** @constructor */
function $c_sc_IndexedSeq$$anon$1() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.call(this)
}
$c_sc_IndexedSeq$$anon$1.prototype = new $h_scg_GenTraversableFactory$GenericCanBuildFrom();
$c_sc_IndexedSeq$$anon$1.prototype.constructor = $c_sc_IndexedSeq$$anon$1;
/** @constructor */
function $h_sc_IndexedSeq$$anon$1() {
  /*<skip>*/
}
$h_sc_IndexedSeq$$anon$1.prototype = $c_sc_IndexedSeq$$anon$1.prototype;
$c_sc_IndexedSeq$$anon$1.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $m_sc_IndexedSeq$());
  return this
});
$c_sc_IndexedSeq$$anon$1.prototype.apply__scm_Builder = (function() {
  $m_sc_IndexedSeq$();
  $m_sci_IndexedSeq$();
  $m_sci_Vector$();
  return new $c_sci_VectorBuilder().init___()
});
var $d_sc_IndexedSeq$$anon$1 = new $TypeData().initClass({
  sc_IndexedSeq$$anon$1: 0
}, false, "scala.collection.IndexedSeq$$anon$1", {
  sc_IndexedSeq$$anon$1: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_sc_IndexedSeq$$anon$1.prototype.$classData = $d_sc_IndexedSeq$$anon$1;
/** @constructor */
function $c_scg_GenSeqFactory() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_scg_GenSeqFactory.prototype = new $h_scg_GenTraversableFactory();
$c_scg_GenSeqFactory.prototype.constructor = $c_scg_GenSeqFactory;
/** @constructor */
function $h_scg_GenSeqFactory() {
  /*<skip>*/
}
$h_scg_GenSeqFactory.prototype = $c_scg_GenSeqFactory.prototype;
/** @constructor */
function $c_scg_GenTraversableFactory$$anon$1() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.call(this);
  this.$$outer$2 = null
}
$c_scg_GenTraversableFactory$$anon$1.prototype = new $h_scg_GenTraversableFactory$GenericCanBuildFrom();
$c_scg_GenTraversableFactory$$anon$1.prototype.constructor = $c_scg_GenTraversableFactory$$anon$1;
/** @constructor */
function $h_scg_GenTraversableFactory$$anon$1() {
  /*<skip>*/
}
$h_scg_GenTraversableFactory$$anon$1.prototype = $c_scg_GenTraversableFactory$$anon$1.prototype;
$c_scg_GenTraversableFactory$$anon$1.prototype.apply__scm_Builder = (function() {
  return this.$$outer$2.newBuilder__scm_Builder()
});
$c_scg_GenTraversableFactory$$anon$1.prototype.init___scg_GenTraversableFactory = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $$outer);
  return this
});
var $d_scg_GenTraversableFactory$$anon$1 = new $TypeData().initClass({
  scg_GenTraversableFactory$$anon$1: 0
}, false, "scala.collection.generic.GenTraversableFactory$$anon$1", {
  scg_GenTraversableFactory$$anon$1: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_scg_GenTraversableFactory$$anon$1.prototype.$classData = $d_scg_GenTraversableFactory$$anon$1;
/** @constructor */
function $c_scg_ImmutableMapFactory() {
  $c_scg_MapFactory.call(this)
}
$c_scg_ImmutableMapFactory.prototype = new $h_scg_MapFactory();
$c_scg_ImmutableMapFactory.prototype.constructor = $c_scg_ImmutableMapFactory;
/** @constructor */
function $h_scg_ImmutableMapFactory() {
  /*<skip>*/
}
$h_scg_ImmutableMapFactory.prototype = $c_scg_ImmutableMapFactory.prototype;
/** @constructor */
function $c_sci_$colon$colon$() {
  $c_O.call(this)
}
$c_sci_$colon$colon$.prototype = new $h_O();
$c_sci_$colon$colon$.prototype.constructor = $c_sci_$colon$colon$;
/** @constructor */
function $h_sci_$colon$colon$() {
  /*<skip>*/
}
$h_sci_$colon$colon$.prototype = $c_sci_$colon$colon$.prototype;
$c_sci_$colon$colon$.prototype.init___ = (function() {
  return this
});
$c_sci_$colon$colon$.prototype.toString__T = (function() {
  return "::"
});
var $d_sci_$colon$colon$ = new $TypeData().initClass({
  sci_$colon$colon$: 0
}, false, "scala.collection.immutable.$colon$colon$", {
  sci_$colon$colon$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_$colon$colon$.prototype.$classData = $d_sci_$colon$colon$;
var $n_sci_$colon$colon$ = (void 0);
function $m_sci_$colon$colon$() {
  if ((!$n_sci_$colon$colon$)) {
    $n_sci_$colon$colon$ = new $c_sci_$colon$colon$().init___()
  };
  return $n_sci_$colon$colon$
}
/** @constructor */
function $c_sci_Range$() {
  $c_O.call(this);
  this.MAX$undPRINT$1 = 0
}
$c_sci_Range$.prototype = new $h_O();
$c_sci_Range$.prototype.constructor = $c_sci_Range$;
/** @constructor */
function $h_sci_Range$() {
  /*<skip>*/
}
$h_sci_Range$.prototype = $c_sci_Range$.prototype;
$c_sci_Range$.prototype.init___ = (function() {
  this.MAX$undPRINT$1 = 512;
  return this
});
var $d_sci_Range$ = new $TypeData().initClass({
  sci_Range$: 0
}, false, "scala.collection.immutable.Range$", {
  sci_Range$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Range$.prototype.$classData = $d_sci_Range$;
var $n_sci_Range$ = (void 0);
function $m_sci_Range$() {
  if ((!$n_sci_Range$)) {
    $n_sci_Range$ = new $c_sci_Range$().init___()
  };
  return $n_sci_Range$
}
/** @constructor */
function $c_sci_Stream$StreamCanBuildFrom() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.call(this)
}
$c_sci_Stream$StreamCanBuildFrom.prototype = new $h_scg_GenTraversableFactory$GenericCanBuildFrom();
$c_sci_Stream$StreamCanBuildFrom.prototype.constructor = $c_sci_Stream$StreamCanBuildFrom;
/** @constructor */
function $h_sci_Stream$StreamCanBuildFrom() {
  /*<skip>*/
}
$h_sci_Stream$StreamCanBuildFrom.prototype = $c_sci_Stream$StreamCanBuildFrom.prototype;
$c_sci_Stream$StreamCanBuildFrom.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $m_sci_Stream$());
  return this
});
var $d_sci_Stream$StreamCanBuildFrom = new $TypeData().initClass({
  sci_Stream$StreamCanBuildFrom: 0
}, false, "scala.collection.immutable.Stream$StreamCanBuildFrom", {
  sci_Stream$StreamCanBuildFrom: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_sci_Stream$StreamCanBuildFrom.prototype.$classData = $d_sci_Stream$StreamCanBuildFrom;
/** @constructor */
function $c_scm_StringBuilder$() {
  $c_O.call(this)
}
$c_scm_StringBuilder$.prototype = new $h_O();
$c_scm_StringBuilder$.prototype.constructor = $c_scm_StringBuilder$;
/** @constructor */
function $h_scm_StringBuilder$() {
  /*<skip>*/
}
$h_scm_StringBuilder$.prototype = $c_scm_StringBuilder$.prototype;
$c_scm_StringBuilder$.prototype.init___ = (function() {
  return this
});
var $d_scm_StringBuilder$ = new $TypeData().initClass({
  scm_StringBuilder$: 0
}, false, "scala.collection.mutable.StringBuilder$", {
  scm_StringBuilder$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_StringBuilder$.prototype.$classData = $d_scm_StringBuilder$;
var $n_scm_StringBuilder$ = (void 0);
function $m_scm_StringBuilder$() {
  if ((!$n_scm_StringBuilder$)) {
    $n_scm_StringBuilder$ = new $c_scm_StringBuilder$().init___()
  };
  return $n_scm_StringBuilder$
}
/** @constructor */
function $c_sjsr_AnonFunction0() {
  $c_sr_AbstractFunction0.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction0.prototype = new $h_sr_AbstractFunction0();
$c_sjsr_AnonFunction0.prototype.constructor = $c_sjsr_AnonFunction0;
/** @constructor */
function $h_sjsr_AnonFunction0() {
  /*<skip>*/
}
$h_sjsr_AnonFunction0.prototype = $c_sjsr_AnonFunction0.prototype;
$c_sjsr_AnonFunction0.prototype.apply__O = (function() {
  return (0, this.f$2)()
});
$c_sjsr_AnonFunction0.prototype.init___sjs_js_Function0 = (function(f) {
  this.f$2 = f;
  return this
});
var $d_sjsr_AnonFunction0 = new $TypeData().initClass({
  sjsr_AnonFunction0: 0
}, false, "scala.scalajs.runtime.AnonFunction0", {
  sjsr_AnonFunction0: 1,
  sr_AbstractFunction0: 1,
  O: 1,
  F0: 1
});
$c_sjsr_AnonFunction0.prototype.$classData = $d_sjsr_AnonFunction0;
/** @constructor */
function $c_sjsr_AnonFunction1() {
  $c_sr_AbstractFunction1.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction1.prototype = new $h_sr_AbstractFunction1();
$c_sjsr_AnonFunction1.prototype.constructor = $c_sjsr_AnonFunction1;
/** @constructor */
function $h_sjsr_AnonFunction1() {
  /*<skip>*/
}
$h_sjsr_AnonFunction1.prototype = $c_sjsr_AnonFunction1.prototype;
$c_sjsr_AnonFunction1.prototype.apply__O__O = (function(arg1) {
  return (0, this.f$2)(arg1)
});
$c_sjsr_AnonFunction1.prototype.init___sjs_js_Function1 = (function(f) {
  this.f$2 = f;
  return this
});
var $d_sjsr_AnonFunction1 = new $TypeData().initClass({
  sjsr_AnonFunction1: 0
}, false, "scala.scalajs.runtime.AnonFunction1", {
  sjsr_AnonFunction1: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1
});
$c_sjsr_AnonFunction1.prototype.$classData = $d_sjsr_AnonFunction1;
/** @constructor */
function $c_sjsr_AnonFunction2() {
  $c_sr_AbstractFunction2.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction2.prototype = new $h_sr_AbstractFunction2();
$c_sjsr_AnonFunction2.prototype.constructor = $c_sjsr_AnonFunction2;
/** @constructor */
function $h_sjsr_AnonFunction2() {
  /*<skip>*/
}
$h_sjsr_AnonFunction2.prototype = $c_sjsr_AnonFunction2.prototype;
$c_sjsr_AnonFunction2.prototype.init___sjs_js_Function2 = (function(f) {
  this.f$2 = f;
  return this
});
var $d_sjsr_AnonFunction2 = new $TypeData().initClass({
  sjsr_AnonFunction2: 0
}, false, "scala.scalajs.runtime.AnonFunction2", {
  sjsr_AnonFunction2: 1,
  sr_AbstractFunction2: 1,
  O: 1,
  F2: 1
});
$c_sjsr_AnonFunction2.prototype.$classData = $d_sjsr_AnonFunction2;
/** @constructor */
function $c_sjsr_RuntimeLong$() {
  $c_O.call(this);
  this.TwoPow32$1 = 0.0;
  this.TwoPow53$1 = 0.0;
  this.UnsignedSafeDoubleHiMask$1 = 0;
  this.AskQuotient$1 = 0;
  this.AskRemainder$1 = 0;
  this.AskBoth$1 = 0;
  this.Zero$1 = null;
  this.One$1 = null;
  this.MinusOne$1 = null;
  this.MinValue$1 = null;
  this.MaxValue$1 = null
}
$c_sjsr_RuntimeLong$.prototype = new $h_O();
$c_sjsr_RuntimeLong$.prototype.constructor = $c_sjsr_RuntimeLong$;
/** @constructor */
function $h_sjsr_RuntimeLong$() {
  /*<skip>*/
}
$h_sjsr_RuntimeLong$.prototype = $c_sjsr_RuntimeLong$.prototype;
$c_sjsr_RuntimeLong$.prototype.init___ = (function() {
  $n_sjsr_RuntimeLong$ = this;
  this.Zero$1 = new $c_sjsr_RuntimeLong().init___I__I(0, 0);
  this.One$1 = new $c_sjsr_RuntimeLong().init___I__I(1, 0);
  this.MinusOne$1 = new $c_sjsr_RuntimeLong().init___I__I((-1), (-1));
  this.MinValue$1 = new $c_sjsr_RuntimeLong().init___I__I(0, (-2147483648));
  this.MaxValue$1 = new $c_sjsr_RuntimeLong().init___I__I((-1), 2147483647);
  return this
});
$c_sjsr_RuntimeLong$.prototype.Zero__sjsr_RuntimeLong = (function() {
  return this.Zero$1
});
$c_sjsr_RuntimeLong$.prototype.fromDouble__D__sjsr_RuntimeLong = (function(value) {
  if ((value !== value)) {
    return this.Zero$1
  } else if ((value < (-9.223372036854776E18))) {
    return this.MinValue$1
  } else if ((value >= 9.223372036854776E18)) {
    return this.MaxValue$1
  } else {
    var neg = (value < 0);
    var absValue = (neg ? (-value) : value);
    var lo = $uI((absValue | 0));
    var x = (absValue / 4.294967296E9);
    var hi = $uI((x | 0));
    return (neg ? new $c_sjsr_RuntimeLong().init___I__I(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0))) : new $c_sjsr_RuntimeLong().init___I__I(lo, hi))
  }
});
var $d_sjsr_RuntimeLong$ = new $TypeData().initClass({
  sjsr_RuntimeLong$: 0
}, false, "scala.scalajs.runtime.RuntimeLong$", {
  sjsr_RuntimeLong$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sjsr_RuntimeLong$.prototype.$classData = $d_sjsr_RuntimeLong$;
var $n_sjsr_RuntimeLong$ = (void 0);
function $m_sjsr_RuntimeLong$() {
  if ((!$n_sjsr_RuntimeLong$)) {
    $n_sjsr_RuntimeLong$ = new $c_sjsr_RuntimeLong$().init___()
  };
  return $n_sjsr_RuntimeLong$
}
var $d_sr_Nothing$ = new $TypeData().initClass({
  sr_Nothing$: 0
}, false, "scala.runtime.Nothing$", {
  sr_Nothing$: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
/** @constructor */
function $c_Ljava_io_FilterOutputStream() {
  $c_Ljava_io_OutputStream.call(this);
  this.out$2 = null
}
$c_Ljava_io_FilterOutputStream.prototype = new $h_Ljava_io_OutputStream();
$c_Ljava_io_FilterOutputStream.prototype.constructor = $c_Ljava_io_FilterOutputStream;
/** @constructor */
function $h_Ljava_io_FilterOutputStream() {
  /*<skip>*/
}
$h_Ljava_io_FilterOutputStream.prototype = $c_Ljava_io_FilterOutputStream.prototype;
$c_Ljava_io_FilterOutputStream.prototype.init___Ljava_io_OutputStream = (function(out) {
  this.out$2 = out;
  return this
});
function $is_T(obj) {
  return ((typeof obj) === "string")
}
function $as_T(obj) {
  return (($is_T(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.String"))
}
function $isArrayOf_T(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T)))
}
function $asArrayOf_T(obj, depth) {
  return (($isArrayOf_T(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.String;", depth))
}
var $d_T = new $TypeData().initClass({
  T: 0
}, false, "java.lang.String", {
  T: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_CharSequence: 1,
  jl_Comparable: 1
}, (void 0), (void 0), $is_T);
/** @constructor */
function $c_jl_AssertionError() {
  $c_jl_Error.call(this)
}
$c_jl_AssertionError.prototype = new $h_jl_Error();
$c_jl_AssertionError.prototype.constructor = $c_jl_AssertionError;
/** @constructor */
function $h_jl_AssertionError() {
  /*<skip>*/
}
$h_jl_AssertionError.prototype = $c_jl_AssertionError.prototype;
$c_jl_AssertionError.prototype.init___O = (function(o) {
  var s = $objectToString(o);
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_AssertionError = new $TypeData().initClass({
  jl_AssertionError: 0
}, false, "java.lang.AssertionError", {
  jl_AssertionError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_AssertionError.prototype.$classData = $d_jl_AssertionError;
/** @constructor */
function $c_jl_CloneNotSupportedException() {
  $c_jl_Exception.call(this)
}
$c_jl_CloneNotSupportedException.prototype = new $h_jl_Exception();
$c_jl_CloneNotSupportedException.prototype.constructor = $c_jl_CloneNotSupportedException;
/** @constructor */
function $h_jl_CloneNotSupportedException() {
  /*<skip>*/
}
$h_jl_CloneNotSupportedException.prototype = $c_jl_CloneNotSupportedException.prototype;
$c_jl_CloneNotSupportedException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
var $d_jl_CloneNotSupportedException = new $TypeData().initClass({
  jl_CloneNotSupportedException: 0
}, false, "java.lang.CloneNotSupportedException", {
  jl_CloneNotSupportedException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_CloneNotSupportedException.prototype.$classData = $d_jl_CloneNotSupportedException;
/** @constructor */
function $c_jl_JSConsoleBasedPrintStream$DummyOutputStream() {
  $c_Ljava_io_OutputStream.call(this)
}
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype = new $h_Ljava_io_OutputStream();
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.constructor = $c_jl_JSConsoleBasedPrintStream$DummyOutputStream;
/** @constructor */
function $h_jl_JSConsoleBasedPrintStream$DummyOutputStream() {
  /*<skip>*/
}
$h_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype = $c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype;
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.init___ = (function() {
  return this
});
var $d_jl_JSConsoleBasedPrintStream$DummyOutputStream = new $TypeData().initClass({
  jl_JSConsoleBasedPrintStream$DummyOutputStream: 0
}, false, "java.lang.JSConsoleBasedPrintStream$DummyOutputStream", {
  jl_JSConsoleBasedPrintStream$DummyOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  Ljava_io_Flushable: 1
});
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.$classData = $d_jl_JSConsoleBasedPrintStream$DummyOutputStream;
/** @constructor */
function $c_jl_RuntimeException() {
  $c_jl_Exception.call(this)
}
$c_jl_RuntimeException.prototype = new $h_jl_Exception();
$c_jl_RuntimeException.prototype.constructor = $c_jl_RuntimeException;
/** @constructor */
function $h_jl_RuntimeException() {
  /*<skip>*/
}
$h_jl_RuntimeException.prototype = $c_jl_RuntimeException.prototype;
/** @constructor */
function $c_jl_StringBuilder() {
  $c_O.call(this);
  this.content$1 = null
}
$c_jl_StringBuilder.prototype = new $h_O();
$c_jl_StringBuilder.prototype.constructor = $c_jl_StringBuilder;
/** @constructor */
function $h_jl_StringBuilder() {
  /*<skip>*/
}
$h_jl_StringBuilder.prototype = $c_jl_StringBuilder.prototype;
$c_jl_StringBuilder.prototype.init___ = (function() {
  $c_jl_StringBuilder.prototype.init___T.call(this, "");
  return this
});
$c_jl_StringBuilder.prototype.append__T__jl_StringBuilder = (function(s) {
  this.content$1 = (("" + this.content$1) + ((s === null) ? "null" : s));
  return this
});
$c_jl_StringBuilder.prototype.subSequence__I__I__jl_CharSequence = (function(start, end) {
  var thiz = this.content$1;
  return $as_T(thiz.substring(start, end))
});
$c_jl_StringBuilder.prototype.toString__T = (function() {
  return this.content$1
});
$c_jl_StringBuilder.prototype.append__O__jl_StringBuilder = (function(obj) {
  return ((obj === null) ? this.append__T__jl_StringBuilder(null) : this.append__T__jl_StringBuilder($objectToString(obj)))
});
$c_jl_StringBuilder.prototype.init___I = (function(initialCapacity) {
  $c_jl_StringBuilder.prototype.init___T.call(this, "");
  return this
});
$c_jl_StringBuilder.prototype.append__jl_CharSequence__I__I__jl_StringBuilder = (function(csq, start, end) {
  return ((csq === null) ? this.append__jl_CharSequence__I__I__jl_StringBuilder("null", start, end) : this.append__T__jl_StringBuilder($objectToString($charSequenceSubSequence(csq, start, end))))
});
$c_jl_StringBuilder.prototype.append__C__jl_StringBuilder = (function(c) {
  return this.append__T__jl_StringBuilder($as_T($g.String.fromCharCode(c)))
});
$c_jl_StringBuilder.prototype.init___T = (function(content) {
  this.content$1 = content;
  return this
});
var $d_jl_StringBuilder = new $TypeData().initClass({
  jl_StringBuilder: 0
}, false, "java.lang.StringBuilder", {
  jl_StringBuilder: 1,
  O: 1,
  jl_CharSequence: 1,
  jl_Appendable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_StringBuilder.prototype.$classData = $d_jl_StringBuilder;
/** @constructor */
function $c_s_Array$() {
  $c_s_FallbackArrayBuilding.call(this)
}
$c_s_Array$.prototype = new $h_s_FallbackArrayBuilding();
$c_s_Array$.prototype.constructor = $c_s_Array$;
/** @constructor */
function $h_s_Array$() {
  /*<skip>*/
}
$h_s_Array$.prototype = $c_s_Array$.prototype;
$c_s_Array$.prototype.init___ = (function() {
  return this
});
$c_s_Array$.prototype.slowcopy__p2__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var i = srcPos;
  var j = destPos;
  var srcUntil = ((srcPos + length) | 0);
  while ((i < srcUntil)) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(dest, j, $m_sr_ScalaRunTime$().array$undapply__O__I__O(src, i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  }
});
$c_s_Array$.prototype.copy__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var srcClass = $objectGetClass(src);
  if ((srcClass.isArray__Z() && $objectGetClass(dest).isAssignableFrom__jl_Class__Z(srcClass))) {
    $systemArraycopy(src, srcPos, dest, destPos, length)
  } else {
    this.slowcopy__p2__O__I__O__I__I__V(src, srcPos, dest, destPos, length)
  }
});
var $d_s_Array$ = new $TypeData().initClass({
  s_Array$: 0
}, false, "scala.Array$", {
  s_Array$: 1,
  s_FallbackArrayBuilding: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Array$.prototype.$classData = $d_s_Array$;
var $n_s_Array$ = (void 0);
function $m_s_Array$() {
  if ((!$n_s_Array$)) {
    $n_s_Array$ = new $c_s_Array$().init___()
  };
  return $n_s_Array$
}
/** @constructor */
function $c_s_Predef$$eq$colon$eq() {
  $c_O.call(this)
}
$c_s_Predef$$eq$colon$eq.prototype = new $h_O();
$c_s_Predef$$eq$colon$eq.prototype.constructor = $c_s_Predef$$eq$colon$eq;
/** @constructor */
function $h_s_Predef$$eq$colon$eq() {
  /*<skip>*/
}
$h_s_Predef$$eq$colon$eq.prototype = $c_s_Predef$$eq$colon$eq.prototype;
$c_s_Predef$$eq$colon$eq.prototype.toString__T = (function() {
  return "<function1>"
});
/** @constructor */
function $c_s_Predef$$less$colon$less() {
  $c_O.call(this)
}
$c_s_Predef$$less$colon$less.prototype = new $h_O();
$c_s_Predef$$less$colon$less.prototype.constructor = $c_s_Predef$$less$colon$less;
/** @constructor */
function $h_s_Predef$$less$colon$less() {
  /*<skip>*/
}
$h_s_Predef$$less$colon$less.prototype = $c_s_Predef$$less$colon$less.prototype;
$c_s_Predef$$less$colon$less.prototype.toString__T = (function() {
  return "<function1>"
});
/** @constructor */
function $c_s_math_Equiv$() {
  $c_O.call(this)
}
$c_s_math_Equiv$.prototype = new $h_O();
$c_s_math_Equiv$.prototype.constructor = $c_s_math_Equiv$;
/** @constructor */
function $h_s_math_Equiv$() {
  /*<skip>*/
}
$h_s_math_Equiv$.prototype = $c_s_math_Equiv$.prototype;
$c_s_math_Equiv$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Equiv$ = new $TypeData().initClass({
  s_math_Equiv$: 0
}, false, "scala.math.Equiv$", {
  s_math_Equiv$: 1,
  O: 1,
  s_math_LowPriorityEquiv: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Equiv$.prototype.$classData = $d_s_math_Equiv$;
var $n_s_math_Equiv$ = (void 0);
function $m_s_math_Equiv$() {
  if ((!$n_s_math_Equiv$)) {
    $n_s_math_Equiv$ = new $c_s_math_Equiv$().init___()
  };
  return $n_s_math_Equiv$
}
/** @constructor */
function $c_s_math_Ordering$() {
  $c_O.call(this)
}
$c_s_math_Ordering$.prototype = new $h_O();
$c_s_math_Ordering$.prototype.constructor = $c_s_math_Ordering$;
/** @constructor */
function $h_s_math_Ordering$() {
  /*<skip>*/
}
$h_s_math_Ordering$.prototype = $c_s_math_Ordering$.prototype;
$c_s_math_Ordering$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Ordering$ = new $TypeData().initClass({
  s_math_Ordering$: 0
}, false, "scala.math.Ordering$", {
  s_math_Ordering$: 1,
  O: 1,
  s_math_LowPriorityOrderingImplicits: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Ordering$.prototype.$classData = $d_s_math_Ordering$;
var $n_s_math_Ordering$ = (void 0);
function $m_s_math_Ordering$() {
  if ((!$n_s_math_Ordering$)) {
    $n_s_math_Ordering$ = new $c_s_math_Ordering$().init___()
  };
  return $n_s_math_Ordering$
}
/** @constructor */
function $c_s_reflect_NoManifest$() {
  $c_O.call(this)
}
$c_s_reflect_NoManifest$.prototype = new $h_O();
$c_s_reflect_NoManifest$.prototype.constructor = $c_s_reflect_NoManifest$;
/** @constructor */
function $h_s_reflect_NoManifest$() {
  /*<skip>*/
}
$h_s_reflect_NoManifest$.prototype = $c_s_reflect_NoManifest$.prototype;
$c_s_reflect_NoManifest$.prototype.init___ = (function() {
  return this
});
$c_s_reflect_NoManifest$.prototype.toString__T = (function() {
  return "<?>"
});
var $d_s_reflect_NoManifest$ = new $TypeData().initClass({
  s_reflect_NoManifest$: 0
}, false, "scala.reflect.NoManifest$", {
  s_reflect_NoManifest$: 1,
  O: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_reflect_NoManifest$.prototype.$classData = $d_s_reflect_NoManifest$;
var $n_s_reflect_NoManifest$ = (void 0);
function $m_s_reflect_NoManifest$() {
  if ((!$n_s_reflect_NoManifest$)) {
    $n_s_reflect_NoManifest$ = new $c_s_reflect_NoManifest$().init___()
  };
  return $n_s_reflect_NoManifest$
}
/** @constructor */
function $c_s_util_Random$() {
  $c_s_util_Random.call(this)
}
$c_s_util_Random$.prototype = new $h_s_util_Random();
$c_s_util_Random$.prototype.constructor = $c_s_util_Random$;
/** @constructor */
function $h_s_util_Random$() {
  /*<skip>*/
}
$h_s_util_Random$.prototype = $c_s_util_Random$.prototype;
$c_s_util_Random$.prototype.init___ = (function() {
  $c_s_util_Random.prototype.init___ju_Random.call(this, new $c_ju_Random().init___());
  return this
});
var $d_s_util_Random$ = new $TypeData().initClass({
  s_util_Random$: 0
}, false, "scala.util.Random$", {
  s_util_Random$: 1,
  s_util_Random: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Random$.prototype.$classData = $d_s_util_Random$;
var $n_s_util_Random$ = (void 0);
function $m_s_util_Random$() {
  if ((!$n_s_util_Random$)) {
    $n_s_util_Random$ = new $c_s_util_Random$().init___()
  };
  return $n_s_util_Random$
}
/** @constructor */
function $c_sc_AbstractIterator() {
  $c_O.call(this)
}
$c_sc_AbstractIterator.prototype = new $h_O();
$c_sc_AbstractIterator.prototype.constructor = $c_sc_AbstractIterator;
/** @constructor */
function $h_sc_AbstractIterator() {
  /*<skip>*/
}
$h_sc_AbstractIterator.prototype = $c_sc_AbstractIterator.prototype;
$c_sc_AbstractIterator.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sc_AbstractIterator.prototype.isEmpty__Z = (function() {
  return $s_sc_Iterator$class__isEmpty__sc_Iterator__Z(this)
});
$c_sc_AbstractIterator.prototype.toString__T = (function() {
  return $s_sc_Iterator$class__toString__sc_Iterator__T(this)
});
$c_sc_AbstractIterator.prototype.foreach__F1__V = (function(f) {
  $s_sc_Iterator$class__foreach__sc_Iterator__F1__V(this, f)
});
$c_sc_AbstractIterator.prototype.toVector__sci_Vector = (function() {
  $m_sci_Vector$();
  var cbf = $m_sc_IndexedSeq$().ReusableCBF$6;
  return $as_sci_Vector($s_sc_TraversableOnce$class__to__sc_TraversableOnce__scg_CanBuildFrom__O(this, cbf))
});
$c_sc_AbstractIterator.prototype.size__I = (function() {
  return $s_sc_TraversableOnce$class__size__sc_TraversableOnce__I(this)
});
$c_sc_AbstractIterator.prototype.toStream__sci_Stream = (function() {
  return $s_sc_Iterator$class__toStream__sc_Iterator__sci_Stream(this)
});
$c_sc_AbstractIterator.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $s_sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sc_AbstractIterator.prototype.isTraversableAgain__Z = (function() {
  return false
});
$c_sc_AbstractIterator.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $s_sc_Iterator$class__copyToArray__sc_Iterator__O__I__I__V(this, xs, start, len)
});
/** @constructor */
function $c_scg_SetFactory() {
  $c_scg_GenSetFactory.call(this)
}
$c_scg_SetFactory.prototype = new $h_scg_GenSetFactory();
$c_scg_SetFactory.prototype.constructor = $c_scg_SetFactory;
/** @constructor */
function $h_scg_SetFactory() {
  /*<skip>*/
}
$h_scg_SetFactory.prototype = $c_scg_SetFactory.prototype;
/** @constructor */
function $c_sci_ListSet$ListSetBuilder() {
  $c_O.call(this);
  this.elems$1 = null;
  this.seen$1 = null
}
$c_sci_ListSet$ListSetBuilder.prototype = new $h_O();
$c_sci_ListSet$ListSetBuilder.prototype.constructor = $c_sci_ListSet$ListSetBuilder;
/** @constructor */
function $h_sci_ListSet$ListSetBuilder() {
  /*<skip>*/
}
$h_sci_ListSet$ListSetBuilder.prototype = $c_sci_ListSet$ListSetBuilder.prototype;
$c_sci_ListSet$ListSetBuilder.prototype.result__sci_ListSet = (function() {
  var this$2 = this.elems$1;
  var z = $m_sci_ListSet$EmptyListSet$();
  var this$3 = this$2.scala$collection$mutable$ListBuffer$$start$6;
  var acc = z;
  var these = this$3;
  while ((!these.isEmpty__Z())) {
    var arg1 = acc;
    var arg2 = these.head__O();
    var x$1 = $as_sci_ListSet(arg1);
    acc = new $c_sci_ListSet$Node().init___sci_ListSet__O(x$1, arg2);
    these = $as_sc_LinearSeqOptimized(these.tail__O())
  };
  return $as_sci_ListSet(acc)
});
$c_sci_ListSet$ListSetBuilder.prototype.init___ = (function() {
  $c_sci_ListSet$ListSetBuilder.prototype.init___sci_ListSet.call(this, $m_sci_ListSet$EmptyListSet$());
  return this
});
$c_sci_ListSet$ListSetBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__sci_ListSet$ListSetBuilder(elem)
});
$c_sci_ListSet$ListSetBuilder.prototype.init___sci_ListSet = (function(initial) {
  var this$1 = new $c_scm_ListBuffer().init___().$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(initial);
  this.elems$1 = $as_scm_ListBuffer($s_sc_SeqLike$class__reverse__sc_SeqLike__O(this$1));
  var this$2 = new $c_scm_HashSet().init___();
  this.seen$1 = $as_scm_HashSet($s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this$2, initial));
  return this
});
$c_sci_ListSet$ListSetBuilder.prototype.result__O = (function() {
  return this.result__sci_ListSet()
});
$c_sci_ListSet$ListSetBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__sci_ListSet$ListSetBuilder(elem)
});
$c_sci_ListSet$ListSetBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_sci_ListSet$ListSetBuilder.prototype.$$plus$eq__O__sci_ListSet$ListSetBuilder = (function(x) {
  var this$1 = this.seen$1;
  if ((!$s_scm_FlatHashTable$class__containsElem__scm_FlatHashTable__O__Z(this$1, x))) {
    this.elems$1.$$plus$eq__O__scm_ListBuffer(x);
    this.seen$1.$$plus$eq__O__scm_HashSet(x)
  };
  return this
});
$c_sci_ListSet$ListSetBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_sci_ListSet$ListSetBuilder = new $TypeData().initClass({
  sci_ListSet$ListSetBuilder: 0
}, false, "scala.collection.immutable.ListSet$ListSetBuilder", {
  sci_ListSet$ListSetBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_sci_ListSet$ListSetBuilder.prototype.$classData = $d_sci_ListSet$ListSetBuilder;
/** @constructor */
function $c_sci_Map$() {
  $c_scg_ImmutableMapFactory.call(this)
}
$c_sci_Map$.prototype = new $h_scg_ImmutableMapFactory();
$c_sci_Map$.prototype.constructor = $c_sci_Map$;
/** @constructor */
function $h_sci_Map$() {
  /*<skip>*/
}
$h_sci_Map$.prototype = $c_sci_Map$.prototype;
$c_sci_Map$.prototype.init___ = (function() {
  return this
});
var $d_sci_Map$ = new $TypeData().initClass({
  sci_Map$: 0
}, false, "scala.collection.immutable.Map$", {
  sci_Map$: 1,
  scg_ImmutableMapFactory: 1,
  scg_MapFactory: 1,
  scg_GenMapFactory: 1,
  O: 1
});
$c_sci_Map$.prototype.$classData = $d_sci_Map$;
var $n_sci_Map$ = (void 0);
function $m_sci_Map$() {
  if ((!$n_sci_Map$)) {
    $n_sci_Map$ = new $c_sci_Map$().init___()
  };
  return $n_sci_Map$
}
/** @constructor */
function $c_scm_GrowingBuilder() {
  $c_O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
}
$c_scm_GrowingBuilder.prototype = new $h_O();
$c_scm_GrowingBuilder.prototype.constructor = $c_scm_GrowingBuilder;
/** @constructor */
function $h_scm_GrowingBuilder() {
  /*<skip>*/
}
$h_scm_GrowingBuilder.prototype = $c_scm_GrowingBuilder.prototype;
$c_scm_GrowingBuilder.prototype.init___scg_Growable = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
$c_scm_GrowingBuilder.prototype.$$plus$eq__O__scm_GrowingBuilder = (function(x) {
  this.elems$1.$$plus$eq__O__scg_Growable(x);
  return this
});
$c_scm_GrowingBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_GrowingBuilder(elem)
});
$c_scm_GrowingBuilder.prototype.result__O = (function() {
  return this.elems$1
});
$c_scm_GrowingBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_GrowingBuilder(elem)
});
$c_scm_GrowingBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_GrowingBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_GrowingBuilder = new $TypeData().initClass({
  scm_GrowingBuilder: 0
}, false, "scala.collection.mutable.GrowingBuilder", {
  scm_GrowingBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_GrowingBuilder.prototype.$classData = $d_scm_GrowingBuilder;
/** @constructor */
function $c_scm_LazyBuilder() {
  $c_O.call(this);
  this.parts$1 = null
}
$c_scm_LazyBuilder.prototype = new $h_O();
$c_scm_LazyBuilder.prototype.constructor = $c_scm_LazyBuilder;
/** @constructor */
function $h_scm_LazyBuilder() {
  /*<skip>*/
}
$h_scm_LazyBuilder.prototype = $c_scm_LazyBuilder.prototype;
$c_scm_LazyBuilder.prototype.init___ = (function() {
  this.parts$1 = new $c_scm_ListBuffer().init___();
  return this
});
$c_scm_LazyBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_LazyBuilder = (function(xs) {
  this.parts$1.$$plus$eq__O__scm_ListBuffer(xs);
  return this
});
$c_scm_LazyBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_LazyBuilder(elem)
});
$c_scm_LazyBuilder.prototype.$$plus$eq__O__scm_LazyBuilder = (function(x) {
  var jsx$1 = this.parts$1;
  $m_sci_List$();
  var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array([x]);
  var this$2 = $m_sci_List$();
  var cbf = this$2.ReusableCBFInstance$2;
  jsx$1.$$plus$eq__O__scm_ListBuffer($as_sci_List($s_sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs, cbf)));
  return this
});
$c_scm_LazyBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_LazyBuilder(elem)
});
$c_scm_LazyBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_LazyBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_LazyBuilder(xs)
});
/** @constructor */
function $c_scm_SetBuilder() {
  $c_O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
}
$c_scm_SetBuilder.prototype = new $h_O();
$c_scm_SetBuilder.prototype.constructor = $c_scm_SetBuilder;
/** @constructor */
function $h_scm_SetBuilder() {
  /*<skip>*/
}
$h_scm_SetBuilder.prototype = $c_scm_SetBuilder.prototype;
$c_scm_SetBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_SetBuilder(elem)
});
$c_scm_SetBuilder.prototype.result__O = (function() {
  return this.elems$1
});
$c_scm_SetBuilder.prototype.$$plus$eq__O__scm_SetBuilder = (function(x) {
  this.elems$1 = this.elems$1.$$plus__O__sc_Set(x);
  return this
});
$c_scm_SetBuilder.prototype.init___sc_Set = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
$c_scm_SetBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_SetBuilder(elem)
});
$c_scm_SetBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_SetBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_SetBuilder = new $TypeData().initClass({
  scm_SetBuilder: 0
}, false, "scala.collection.mutable.SetBuilder", {
  scm_SetBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_SetBuilder.prototype.$classData = $d_scm_SetBuilder;
/** @constructor */
function $c_sjsr_RuntimeLong() {
  $c_jl_Number.call(this);
  this.lo$2 = 0;
  this.hi$2 = 0
}
$c_sjsr_RuntimeLong.prototype = new $h_jl_Number();
$c_sjsr_RuntimeLong.prototype.constructor = $c_sjsr_RuntimeLong;
/** @constructor */
function $h_sjsr_RuntimeLong() {
  /*<skip>*/
}
$h_sjsr_RuntimeLong.prototype = $c_sjsr_RuntimeLong.prototype;
$c_sjsr_RuntimeLong.prototype.longValue__J = (function() {
  return $uJ(this)
});
$c_sjsr_RuntimeLong.prototype.$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 | b.lo$2), (this.hi$2 | b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$greater$eq__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  if ((ahi === bhi)) {
    var a = this.lo$2;
    var b$1 = b.lo$2;
    return (((-2147483648) ^ a) >= ((-2147483648) ^ b$1))
  } else {
    return (bhi < ahi)
  }
});
$c_sjsr_RuntimeLong.prototype.unsigned$und$percent__p2__I__I__I__I__sjsr_RuntimeLong = (function(alo, ahi, blo, bhi) {
  if ((((-2097152) & ahi) === 0)) {
    if ((((-2097152) & bhi) === 0)) {
      var aDouble = ((4.294967296E9 * ahi) + $uD((alo >>> 0)));
      var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
      var rDouble = (aDouble % bDouble);
      var jsx$1 = $uI((rDouble | 0));
      var x = (rDouble / 4.294967296E9);
      return new $c_sjsr_RuntimeLong().init___I__I(jsx$1, $uI((x | 0)))
    } else {
      return new $c_sjsr_RuntimeLong().init___I__I(alo, ahi)
    }
  } else {
    return (((bhi === 0) && ((blo & (((-1) + blo) | 0)) === 0)) ? new $c_sjsr_RuntimeLong().init___I__I((alo & (((-1) + blo) | 0)), 0) : (((blo === 0) && ((bhi & (((-1) + bhi) | 0)) === 0)) ? new $c_sjsr_RuntimeLong().init___I__I(alo, (ahi & (((-1) + bhi) | 0))) : $as_sjsr_RuntimeLong(this.unsignedDivModHelper__p2__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, 1))))
  }
});
$c_sjsr_RuntimeLong.prototype.byteValue__B = (function() {
  return this.toByte__B()
});
$c_sjsr_RuntimeLong.prototype.toShort__S = (function() {
  return ((this.lo$2 << 16) >> 16)
});
$c_sjsr_RuntimeLong.prototype.equals__O__Z = (function(that) {
  if ($is_sjsr_RuntimeLong(that)) {
    var x2 = $as_sjsr_RuntimeLong(that);
    return ((this.lo$2 === x2.lo$2) && (this.hi$2 === x2.hi$2))
  } else {
    return false
  }
});
$c_sjsr_RuntimeLong.prototype.$$less__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  if ((ahi === bhi)) {
    var a = this.lo$2;
    var b$1 = b.lo$2;
    return (((-2147483648) ^ a) < ((-2147483648) ^ b$1))
  } else {
    return (ahi < bhi)
  }
});
$c_sjsr_RuntimeLong.prototype.$$times__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var blo = b.lo$2;
  var bhi = b.hi$2;
  var a0 = (65535 & alo);
  var a1 = ((alo >>> 16) | 0);
  var a2 = (65535 & ahi);
  var a3 = ((ahi >>> 16) | 0);
  var b0 = (65535 & blo);
  var b1 = ((blo >>> 16) | 0);
  var b2 = (65535 & bhi);
  var b3 = ((bhi >>> 16) | 0);
  var c0 = $imul(a0, b0);
  var c1 = ((c0 >>> 16) | 0);
  c1 = ((c1 + $imul(a1, b0)) | 0);
  var c2 = ((c1 >>> 16) | 0);
  c1 = (((65535 & c1) + $imul(a0, b1)) | 0);
  c2 = ((c2 + ((c1 >>> 16) | 0)) | 0);
  var c3 = ((c2 >>> 16) | 0);
  c2 = (((65535 & c2) + $imul(a2, b0)) | 0);
  c3 = ((c3 + ((c2 >>> 16) | 0)) | 0);
  c2 = (((65535 & c2) + $imul(a1, b1)) | 0);
  c3 = ((c3 + ((c2 >>> 16) | 0)) | 0);
  c2 = (((65535 & c2) + $imul(a0, b2)) | 0);
  c3 = ((c3 + ((c2 >>> 16) | 0)) | 0);
  c3 = ((((((((c3 + $imul(a3, b0)) | 0) + $imul(a2, b1)) | 0) + $imul(a1, b2)) | 0) + $imul(a0, b3)) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(((65535 & c0) | (c1 << 16)), ((65535 & c2) | (c3 << 16)))
});
$c_sjsr_RuntimeLong.prototype.init___I__I__I = (function(l, m, h) {
  $c_sjsr_RuntimeLong.prototype.init___I__I.call(this, (l | (m << 22)), ((m >> 10) | (h << 12)));
  return this
});
$c_sjsr_RuntimeLong.prototype.$$percent__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var blo = b.lo$2;
  var bhi = b.hi$2;
  if (((blo | bhi) === 0)) {
    throw new $c_jl_ArithmeticException().init___T("/ by zero")
  };
  if ((ahi === (alo >> 31))) {
    return ((bhi === (blo >> 31)) ? ((blo !== (-1)) ? new $c_sjsr_RuntimeLong().init___I(((alo % blo) | 0)) : $m_sjsr_RuntimeLong$().Zero$1) : (((alo === (-2147483648)) && ((blo === (-2147483648)) && (bhi === 0))) ? $m_sjsr_RuntimeLong$().Zero$1 : this))
  } else {
    var neg = (ahi < 0);
    var absLo = alo;
    var absHi = ahi;
    if (neg) {
      absLo = ((-alo) | 0);
      absHi = ((alo !== 0) ? (~ahi) : ((-ahi) | 0))
    };
    var _2 = absLo;
    var _3 = absHi;
    var neg$1 = (bhi < 0);
    var absLo$1 = blo;
    var absHi$1 = bhi;
    if (neg$1) {
      absLo$1 = ((-blo) | 0);
      absHi$1 = ((blo !== 0) ? (~bhi) : ((-bhi) | 0))
    };
    var _2$1 = absLo$1;
    var _3$1 = absHi$1;
    var absR = this.unsigned$und$percent__p2__I__I__I__I__sjsr_RuntimeLong(_2, _3, _2$1, _3$1);
    if (neg) {
      var lo = absR.lo$2;
      var hi = absR.hi$2;
      return new $c_sjsr_RuntimeLong().init___I__I(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))
    } else {
      return absR
    }
  }
});
$c_sjsr_RuntimeLong.prototype.unsignedDivModHelper__p2__I__I__I__I__I__sjs_js_$bar = (function(alo, ahi, blo, bhi, ask) {
  var shift = ((((bhi !== 0) ? $clz32(bhi) : ((32 + $clz32(blo)) | 0)) - ((ahi !== 0) ? $clz32(ahi) : ((32 + $clz32(alo)) | 0))) | 0);
  var n = shift;
  if ((n === 0)) {
    var initialBShift_$_$$und1$f = null;
    var initialBShift_$_$$und2$f = null;
    var initialBShift_$_$$und1$mcI$sp$f = blo;
    var initialBShift_$_$$und2$mcI$sp$f = bhi
  } else if ((n < 32)) {
    var _1$mcI$sp = (blo << n);
    var _2$mcI$sp = (((blo >>> ((-n) | 0)) | 0) | (bhi << n));
    var initialBShift_$_$$und1$f = null;
    var initialBShift_$_$$und2$f = null;
    var initialBShift_$_$$und1$mcI$sp$f = _1$mcI$sp;
    var initialBShift_$_$$und2$mcI$sp$f = _2$mcI$sp
  } else {
    var _2$mcI$sp$1 = (blo << n);
    var initialBShift_$_$$und1$f = null;
    var initialBShift_$_$$und2$f = null;
    var initialBShift_$_$$und1$mcI$sp$f = 0;
    var initialBShift_$_$$und2$mcI$sp$f = _2$mcI$sp$1
  };
  var bShiftLo = initialBShift_$_$$und1$mcI$sp$f;
  var bShiftHi = initialBShift_$_$$und2$mcI$sp$f;
  var remLo = alo;
  var remHi = ahi;
  var quotLo = 0;
  var quotHi = 0;
  while (((shift >= 0) && (((-2097152) & remHi) !== 0))) {
    var alo$1 = remLo;
    var ahi$1 = remHi;
    var blo$1 = bShiftLo;
    var bhi$1 = bShiftHi;
    if (((ahi$1 === bhi$1) ? (((-2147483648) ^ alo$1) >= ((-2147483648) ^ blo$1)) : (((-2147483648) ^ ahi$1) >= ((-2147483648) ^ bhi$1)))) {
      var alo$2 = remLo;
      var ahi$2 = remHi;
      var blo$2 = bShiftLo;
      var bhi$2 = bShiftHi;
      var lo = ((alo$2 - blo$2) | 0);
      var _2$mcI$sp$2 = ((((ahi$2 - bhi$2) | 0) + ((((-2147483648) ^ alo$2) < ((-2147483648) ^ lo)) ? (-1) : 0)) | 0);
      remLo = lo;
      remHi = _2$mcI$sp$2;
      if ((shift < 32)) {
        quotLo = (quotLo | (1 << shift))
      } else {
        quotHi = (quotHi | (1 << shift))
      }
    };
    shift = (((-1) + shift) | 0);
    var lo$1 = bShiftLo;
    var hi = bShiftHi;
    var _1$mcI$sp$1 = (((lo$1 >>> 1) | 0) | (hi << (-1)));
    var _2$mcI$sp$3 = ((hi >>> 1) | 0);
    bShiftLo = _1$mcI$sp$1;
    bShiftHi = _2$mcI$sp$3
  };
  var alo$3 = remLo;
  var ahi$3 = remHi;
  if (((ahi$3 === bhi) ? (((-2147483648) ^ alo$3) >= ((-2147483648) ^ blo)) : (((-2147483648) ^ ahi$3) >= ((-2147483648) ^ bhi)))) {
    var lo$2 = remLo;
    var hi$1 = remHi;
    var remDouble = ((4.294967296E9 * hi$1) + $uD((lo$2 >>> 0)));
    var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
    if ((ask !== 1)) {
      var rem_div_bDouble = (remDouble / bDouble);
      var alo$4 = quotLo;
      var ahi$4 = quotHi;
      var blo$3 = $uI((rem_div_bDouble | 0));
      var x = (rem_div_bDouble / 4.294967296E9);
      var bhi$3 = $uI((x | 0));
      var lo$3 = ((alo$4 + blo$3) | 0);
      var _2$mcI$sp$4 = ((((ahi$4 + bhi$3) | 0) + ((((-2147483648) ^ lo$3) < ((-2147483648) ^ alo$4)) ? 1 : 0)) | 0);
      quotLo = lo$3;
      quotHi = _2$mcI$sp$4
    };
    if ((ask !== 0)) {
      var rem_mod_bDouble = (remDouble % bDouble);
      remLo = $uI((rem_mod_bDouble | 0));
      var x$1 = (rem_mod_bDouble / 4.294967296E9);
      remHi = $uI((x$1 | 0))
    }
  };
  if ((ask === 0)) {
    var a = new $c_sjsr_RuntimeLong().init___I__I(quotLo, quotHi);
    return a
  } else if ((ask === 1)) {
    var a$1 = new $c_sjsr_RuntimeLong().init___I__I(remLo, remHi);
    return a$1
  } else {
    var _1 = quotLo;
    var _2 = quotHi;
    var _3 = remLo;
    var _4 = remHi;
    var a$2 = [_1, _2, _3, _4];
    return a$2
  }
});
$c_sjsr_RuntimeLong.prototype.toString__T = (function() {
  var lo = this.lo$2;
  var hi = this.hi$2;
  if ((hi === (lo >> 31))) {
    return ("" + lo)
  } else if ((hi < 0)) {
    var _1$mcI$sp = ((-lo) | 0);
    var _2$mcI$sp = ((lo !== 0) ? (~hi) : ((-hi) | 0));
    return ("-" + this.toUnsignedString__p2__I__I__T(_1$mcI$sp, _2$mcI$sp))
  } else {
    return this.toUnsignedString__p2__I__I__T(lo, hi)
  }
});
$c_sjsr_RuntimeLong.prototype.$$less$eq__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  if ((ahi === bhi)) {
    var a = this.lo$2;
    var b$1 = b.lo$2;
    return (((-2147483648) ^ b$1) >= ((-2147483648) ^ a))
  } else {
    return (ahi < bhi)
  }
});
$c_sjsr_RuntimeLong.prototype.init___I__I = (function(lo, hi) {
  this.lo$2 = lo;
  this.hi$2 = hi;
  return this
});
$c_sjsr_RuntimeLong.prototype.compareTo__O__I = (function(x$1) {
  var that = $as_sjsr_RuntimeLong(x$1);
  return this.compareTo__sjsr_RuntimeLong__I($as_sjsr_RuntimeLong(that))
});
$c_sjsr_RuntimeLong.prototype.$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 & b.lo$2), (this.hi$2 & b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.compareTo__sjsr_RuntimeLong__I = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  if ((ahi === bhi)) {
    var alo = this.lo$2;
    var blo = b.lo$2;
    return ((alo === blo) ? 0 : ((((-2147483648) ^ alo) < ((-2147483648) ^ blo)) ? (-1) : 1))
  } else {
    return ((ahi < bhi) ? (-1) : 1)
  }
});
$c_sjsr_RuntimeLong.prototype.$$greater$greater$greater__I__sjsr_RuntimeLong = (function(n0) {
  var n = (63 & n0);
  var hi = this.hi$2;
  return ((n === 0) ? this : ((n < 32) ? new $c_sjsr_RuntimeLong().init___I__I((((this.lo$2 >>> n) | 0) | (hi << ((-n) | 0))), ((hi >>> n) | 0)) : new $c_sjsr_RuntimeLong().init___I__I(((hi >>> n) | 0), 0)))
});
$c_sjsr_RuntimeLong.prototype.$$greater__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  if ((ahi === bhi)) {
    var a = this.lo$2;
    var b$1 = b.lo$2;
    return (((-2147483648) ^ b$1) < ((-2147483648) ^ a))
  } else {
    return (bhi < ahi)
  }
});
$c_sjsr_RuntimeLong.prototype.$$less$less__I__sjsr_RuntimeLong = (function(n0) {
  var n = (63 & n0);
  var lo = this.lo$2;
  return ((n === 0) ? this : ((n < 32) ? new $c_sjsr_RuntimeLong().init___I__I((lo << n), (((lo >>> ((-n) | 0)) | 0) | (this.hi$2 << n))) : new $c_sjsr_RuntimeLong().init___I__I(0, (lo << n))))
});
$c_sjsr_RuntimeLong.prototype.toInt__I = (function() {
  return this.lo$2
});
$c_sjsr_RuntimeLong.prototype.init___I = (function(value) {
  $c_sjsr_RuntimeLong.prototype.init___I__I.call(this, value, (value >> 31));
  return this
});
$c_sjsr_RuntimeLong.prototype.notEquals__sjsr_RuntimeLong__Z = (function(b) {
  return (!((this.lo$2 === b.lo$2) && (this.hi$2 === b.hi$2)))
});
$c_sjsr_RuntimeLong.prototype.unary$und$minus__sjsr_RuntimeLong = (function() {
  var lo = this.lo$2;
  var hi = this.hi$2;
  return new $c_sjsr_RuntimeLong().init___I__I(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.shortValue__S = (function() {
  return this.toShort__S()
});
$c_sjsr_RuntimeLong.prototype.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var blo = b.lo$2;
  var bhi = b.hi$2;
  var lo = ((alo + blo) | 0);
  var _2$mcI$sp = ((((ahi + bhi) | 0) + ((((-2147483648) ^ lo) < ((-2147483648) ^ alo)) ? 1 : 0)) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, _2$mcI$sp)
});
$c_sjsr_RuntimeLong.prototype.toDouble__D = (function() {
  var lo = this.lo$2;
  var hi = this.hi$2;
  if ((hi < 0)) {
    var _1$mcI$sp = ((-lo) | 0);
    var _2$mcI$sp = ((lo !== 0) ? (~hi) : ((-hi) | 0));
    return (-((4.294967296E9 * $uD((_2$mcI$sp >>> 0))) + $uD((_1$mcI$sp >>> 0))))
  } else {
    return ((4.294967296E9 * hi) + $uD((lo >>> 0)))
  }
});
$c_sjsr_RuntimeLong.prototype.$$greater$greater__I__sjsr_RuntimeLong = (function(n0) {
  var n = (63 & n0);
  var hi = this.hi$2;
  return ((n === 0) ? this : ((n < 32) ? new $c_sjsr_RuntimeLong().init___I__I((((this.lo$2 >>> n) | 0) | (hi << ((-n) | 0))), (hi >> n)) : new $c_sjsr_RuntimeLong().init___I__I((hi >> n), (hi >> 31))))
});
$c_sjsr_RuntimeLong.prototype.unsigned$und$div__p2__I__I__I__I__sjsr_RuntimeLong = (function(alo, ahi, blo, bhi) {
  if ((((-2097152) & ahi) === 0)) {
    if ((((-2097152) & bhi) === 0)) {
      var aDouble = ((4.294967296E9 * ahi) + $uD((alo >>> 0)));
      var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
      var rDouble = (aDouble / bDouble);
      var jsx$1 = $uI((rDouble | 0));
      var x = (rDouble / 4.294967296E9);
      return new $c_sjsr_RuntimeLong().init___I__I(jsx$1, $uI((x | 0)))
    } else {
      return $m_sjsr_RuntimeLong$().Zero$1
    }
  } else if (((bhi === 0) && ((blo & (((-1) + blo) | 0)) === 0))) {
    var pow = ((31 - $clz32(blo)) | 0);
    return ((pow === 0) ? new $c_sjsr_RuntimeLong().init___I__I(alo, ahi) : new $c_sjsr_RuntimeLong().init___I__I((((alo >>> pow) | 0) | (ahi << ((-pow) | 0))), ((ahi >>> pow) | 0)))
  } else if (((blo === 0) && ((bhi & (((-1) + bhi) | 0)) === 0))) {
    var pow$2 = ((31 - $clz32(bhi)) | 0);
    return new $c_sjsr_RuntimeLong().init___I__I(((ahi >>> pow$2) | 0), 0)
  } else {
    return $as_sjsr_RuntimeLong(this.unsignedDivModHelper__p2__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, 0))
  }
});
$c_sjsr_RuntimeLong.prototype.$$div__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var blo = b.lo$2;
  var bhi = b.hi$2;
  if (((blo | bhi) === 0)) {
    throw new $c_jl_ArithmeticException().init___T("/ by zero")
  };
  if ((ahi === (alo >> 31))) {
    return ((bhi === (blo >> 31)) ? (((alo === (-2147483648)) && (blo === (-1))) ? new $c_sjsr_RuntimeLong().init___I__I((-2147483648), 0) : new $c_sjsr_RuntimeLong().init___I(((alo / blo) | 0))) : (((alo === (-2147483648)) && ((blo === (-2147483648)) && (bhi === 0))) ? $m_sjsr_RuntimeLong$().MinusOne$1 : $m_sjsr_RuntimeLong$().Zero$1))
  } else {
    var neg = (ahi < 0);
    var absLo = alo;
    var absHi = ahi;
    if (neg) {
      absLo = ((-alo) | 0);
      absHi = ((alo !== 0) ? (~ahi) : ((-ahi) | 0))
    };
    var _2 = absLo;
    var _3 = absHi;
    var neg$1 = (bhi < 0);
    var absLo$1 = blo;
    var absHi$1 = bhi;
    if (neg$1) {
      absLo$1 = ((-blo) | 0);
      absHi$1 = ((blo !== 0) ? (~bhi) : ((-bhi) | 0))
    };
    var _2$1 = absLo$1;
    var _3$1 = absHi$1;
    var absR = this.unsigned$und$div__p2__I__I__I__I__sjsr_RuntimeLong(_2, _3, _2$1, _3$1);
    if ((neg === neg$1)) {
      return absR
    } else {
      var lo = absR.lo$2;
      var hi = absR.hi$2;
      return new $c_sjsr_RuntimeLong().init___I__I(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))
    }
  }
});
$c_sjsr_RuntimeLong.prototype.toByte__B = (function() {
  return ((this.lo$2 << 24) >> 24)
});
$c_sjsr_RuntimeLong.prototype.doubleValue__D = (function() {
  return this.toDouble__D()
});
$c_sjsr_RuntimeLong.prototype.hashCode__I = (function() {
  return (this.lo$2 ^ this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.intValue__I = (function() {
  return this.lo$2
});
$c_sjsr_RuntimeLong.prototype.toUnsignedString__p2__I__I__T = (function(lo, hi) {
  if ((((-2097152) & hi) === 0)) {
    var this$5 = ((4.294967296E9 * hi) + $uD((lo >>> 0)));
    return ("" + this$5)
  } else {
    var quotRem = this.unsignedDivModHelper__p2__I__I__I__I__I__sjs_js_$bar(lo, hi, 1000000000, 0, 2);
    var quotLo = $uI(quotRem["0"]);
    var quotHi = $uI(quotRem["1"]);
    var rem = $uI(quotRem["2"]);
    var quot = ((4.294967296E9 * quotHi) + $uD((quotLo >>> 0)));
    var remStr = ("" + rem);
    return ((("" + quot) + $as_T("000000000".substring($uI(remStr.length)))) + remStr)
  }
});
$c_sjsr_RuntimeLong.prototype.compareTo__jl_Long__I = (function(that) {
  return this.compareTo__sjsr_RuntimeLong__I($as_sjsr_RuntimeLong(that))
});
$c_sjsr_RuntimeLong.prototype.unary$und$tilde__sjsr_RuntimeLong = (function() {
  return new $c_sjsr_RuntimeLong().init___I__I((~this.lo$2), (~this.hi$2))
});
$c_sjsr_RuntimeLong.prototype.floatValue__F = (function() {
  return this.toFloat__F()
});
$c_sjsr_RuntimeLong.prototype.$$minus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var blo = b.lo$2;
  var bhi = b.hi$2;
  var lo = ((alo - blo) | 0);
  var _2$mcI$sp = ((((ahi - bhi) | 0) + ((((-2147483648) ^ alo) < ((-2147483648) ^ lo)) ? (-1) : 0)) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, _2$mcI$sp)
});
$c_sjsr_RuntimeLong.prototype.toFloat__F = (function() {
  return $fround(this.toDouble__D())
});
$c_sjsr_RuntimeLong.prototype.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 ^ b.lo$2), (this.hi$2 ^ b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.equals__sjsr_RuntimeLong__Z = (function(b) {
  return ((this.lo$2 === b.lo$2) && (this.hi$2 === b.hi$2))
});
function $is_sjsr_RuntimeLong(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_RuntimeLong)))
}
function $as_sjsr_RuntimeLong(obj) {
  return (($is_sjsr_RuntimeLong(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.runtime.RuntimeLong"))
}
function $isArrayOf_sjsr_RuntimeLong(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_RuntimeLong)))
}
function $asArrayOf_sjsr_RuntimeLong(obj, depth) {
  return (($isArrayOf_sjsr_RuntimeLong(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.runtime.RuntimeLong;", depth))
}
var $d_sjsr_RuntimeLong = new $TypeData().initClass({
  sjsr_RuntimeLong: 0
}, false, "scala.scalajs.runtime.RuntimeLong", {
  sjsr_RuntimeLong: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
});
$c_sjsr_RuntimeLong.prototype.$classData = $d_sjsr_RuntimeLong;
/** @constructor */
function $c_Lmain_lib_Canvas$$anonfun$4() {
  $c_sr_AbstractFunction1.call(this);
  this.$$outer$2 = null
}
$c_Lmain_lib_Canvas$$anonfun$4.prototype = new $h_sr_AbstractFunction1();
$c_Lmain_lib_Canvas$$anonfun$4.prototype.constructor = $c_Lmain_lib_Canvas$$anonfun$4;
/** @constructor */
function $h_Lmain_lib_Canvas$$anonfun$4() {
  /*<skip>*/
}
$h_Lmain_lib_Canvas$$anonfun$4.prototype = $c_Lmain_lib_Canvas$$anonfun$4.prototype;
$c_Lmain_lib_Canvas$$anonfun$4.prototype.init___Lmain_lib_Canvas = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  return this
});
$c_Lmain_lib_Canvas$$anonfun$4.prototype.apply__O__O = (function(v1) {
  this.apply__Lorg_scalajs_dom_raw_KeyboardEvent__V(v1)
});
$c_Lmain_lib_Canvas$$anonfun$4.prototype.apply__Lorg_scalajs_dom_raw_KeyboardEvent__V = (function(e) {
  this.$$outer$2.aaa$1 = (!this.$$outer$2.aaa$1);
  if (this.$$outer$2.aaa$1) {
    this.$$outer$2.capturer$1.start()
  } else {
    this.$$outer$2.capturer$1.stop();
    this.$$outer$2.capturer$1.save((function(blob$2) {
      $m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().location = blob$2
    }))
  }
});
var $d_Lmain_lib_Canvas$$anonfun$4 = new $TypeData().initClass({
  Lmain_lib_Canvas$$anonfun$4: 0
}, false, "main.lib.Canvas$$anonfun$4", {
  Lmain_lib_Canvas$$anonfun$4: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lmain_lib_Canvas$$anonfun$4.prototype.$classData = $d_Lmain_lib_Canvas$$anonfun$4;
/** @constructor */
function $c_Lmain_lib_CanvasData() {
  $c_O.call(this);
  this.lineMaterial$1 = null;
  this.meshMaterial$1 = null;
  this.scene$1 = null;
  this.camera$1 = null;
  this.renderer$1 = null;
  this.clock$1 = null;
  this.body$1 = null
}
$c_Lmain_lib_CanvasData.prototype = new $h_O();
$c_Lmain_lib_CanvasData.prototype.constructor = $c_Lmain_lib_CanvasData;
/** @constructor */
function $h_Lmain_lib_CanvasData() {
  /*<skip>*/
}
$h_Lmain_lib_CanvasData.prototype = $c_Lmain_lib_CanvasData.prototype;
$c_Lmain_lib_CanvasData.prototype.productPrefix__T = (function() {
  return "CanvasData"
});
$c_Lmain_lib_CanvasData.prototype.productArity__I = (function() {
  return 7
});
$c_Lmain_lib_CanvasData.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lmain_lib_CanvasData(x$1)) {
    var CanvasData$1 = $as_Lmain_lib_CanvasData(x$1);
    return (((((($m_sr_BoxesRunTime$().equals__O__O__Z(this.lineMaterial$1, CanvasData$1.lineMaterial$1) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.meshMaterial$1, CanvasData$1.meshMaterial$1)) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.scene$1, CanvasData$1.scene$1)) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.camera$1, CanvasData$1.camera$1)) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.renderer$1, CanvasData$1.renderer$1)) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.clock$1, CanvasData$1.clock$1)) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.body$1, CanvasData$1.body$1))
  } else {
    return false
  }
});
$c_Lmain_lib_CanvasData.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.lineMaterial$1;
      break
    }
    case 1: {
      return this.meshMaterial$1;
      break
    }
    case 2: {
      return this.scene$1;
      break
    }
    case 3: {
      return this.camera$1;
      break
    }
    case 4: {
      return this.renderer$1;
      break
    }
    case 5: {
      return this.clock$1;
      break
    }
    case 6: {
      return this.body$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lmain_lib_CanvasData.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lmain_lib_CanvasData.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lmain_lib_CanvasData.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Lmain_lib_CanvasData.prototype.init___Lmain_lib_LineBasicMaterial__Lmain_lib_MeshBasicMaterial__Lmain_lib_Scene__Lmain_lib_Camera__Lmain_lib_WebGLRenderer__Lmain_lib_Clock__Lorg_scalajs_dom_raw_Node = (function(lineMaterial, meshMaterial, scene, camera, renderer, clock, body) {
  this.lineMaterial$1 = lineMaterial;
  this.meshMaterial$1 = meshMaterial;
  this.scene$1 = scene;
  this.camera$1 = camera;
  this.renderer$1 = renderer;
  this.clock$1 = clock;
  this.body$1 = body;
  return this
});
function $is_Lmain_lib_CanvasData(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lmain_lib_CanvasData)))
}
function $as_Lmain_lib_CanvasData(obj) {
  return (($is_Lmain_lib_CanvasData(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "main.lib.CanvasData"))
}
function $isArrayOf_Lmain_lib_CanvasData(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lmain_lib_CanvasData)))
}
function $asArrayOf_Lmain_lib_CanvasData(obj, depth) {
  return (($isArrayOf_Lmain_lib_CanvasData(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lmain.lib.CanvasData;", depth))
}
var $d_Lmain_lib_CanvasData = new $TypeData().initClass({
  Lmain_lib_CanvasData: 0
}, false, "main.lib.CanvasData", {
  Lmain_lib_CanvasData: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lmain_lib_CanvasData.prototype.$classData = $d_Lmain_lib_CanvasData;
var $d_Lmain_lib_CircleGeometry = new $TypeData().initClass({
  Lmain_lib_CircleGeometry: 0
}, false, "main.lib.CircleGeometry", {
  Lmain_lib_CircleGeometry: 1,
  Lmain_lib_Geometry: 1,
  Lmain_lib_Object3D: 1,
  sjs_js_Object: 1,
  O: 1,
  sjs_js_Any: 1
}, true, (void 0), (function(x) {
  return (x instanceof $g.THREE.CircleGeometry)
}));
/** @constructor */
function $c_Lmain_lib_Palette() {
  $c_O.call(this);
  this.colors$1 = null
}
$c_Lmain_lib_Palette.prototype = new $h_O();
$c_Lmain_lib_Palette.prototype.constructor = $c_Lmain_lib_Palette;
/** @constructor */
function $h_Lmain_lib_Palette() {
  /*<skip>*/
}
$h_Lmain_lib_Palette.prototype = $c_Lmain_lib_Palette.prototype;
$c_Lmain_lib_Palette.prototype.productPrefix__T = (function() {
  return "Palette"
});
$c_Lmain_lib_Palette.prototype.productArity__I = (function() {
  return 1
});
$c_Lmain_lib_Palette.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Lmain_lib_Palette(x$1)) {
    var Palette$1 = $as_Lmain_lib_Palette(x$1);
    var x = this.colors$1;
    var x$2 = Palette$1.colors$1;
    return ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
  } else {
    return false
  }
});
$c_Lmain_lib_Palette.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.colors$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Lmain_lib_Palette.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Lmain_lib_Palette.prototype.getRandom__Lmain_lib_Color = (function() {
  var jsx$1 = this.colors$1;
  var this$1 = $m_s_util_Random$();
  var n = this.colors$1.size__I();
  return jsx$1.apply__I__O(this$1.self$1.nextInt__I__I(n))
});
$c_Lmain_lib_Palette.prototype.init___sc_Seq = (function(colors) {
  this.colors$1 = colors;
  return this
});
$c_Lmain_lib_Palette.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Lmain_lib_Palette.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Lmain_lib_Palette(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lmain_lib_Palette)))
}
function $as_Lmain_lib_Palette(obj) {
  return (($is_Lmain_lib_Palette(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "main.lib.Palette"))
}
function $isArrayOf_Lmain_lib_Palette(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lmain_lib_Palette)))
}
function $asArrayOf_Lmain_lib_Palette(obj, depth) {
  return (($isArrayOf_Lmain_lib_Palette(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lmain.lib.Palette;", depth))
}
var $d_Lmain_lib_Palette = new $TypeData().initClass({
  Lmain_lib_Palette: 0
}, false, "main.lib.Palette", {
  Lmain_lib_Palette: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lmain_lib_Palette.prototype.$classData = $d_Lmain_lib_Palette;
var $d_Lmain_lib_SphereGeometry = new $TypeData().initClass({
  Lmain_lib_SphereGeometry: 0
}, false, "main.lib.SphereGeometry", {
  Lmain_lib_SphereGeometry: 1,
  Lmain_lib_Geometry: 1,
  Lmain_lib_Object3D: 1,
  sjs_js_Object: 1,
  O: 1,
  sjs_js_Any: 1
}, true, (void 0), (function(x) {
  return (x instanceof $g.THREE.SphereGeometry)
}));
/** @constructor */
function $c_jl_ArithmeticException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_ArithmeticException.prototype = new $h_jl_RuntimeException();
$c_jl_ArithmeticException.prototype.constructor = $c_jl_ArithmeticException;
/** @constructor */
function $h_jl_ArithmeticException() {
  /*<skip>*/
}
$h_jl_ArithmeticException.prototype = $c_jl_ArithmeticException.prototype;
$c_jl_ArithmeticException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_ArithmeticException = new $TypeData().initClass({
  jl_ArithmeticException: 0
}, false, "java.lang.ArithmeticException", {
  jl_ArithmeticException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ArithmeticException.prototype.$classData = $d_jl_ArithmeticException;
/** @constructor */
function $c_jl_ClassCastException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_ClassCastException.prototype = new $h_jl_RuntimeException();
$c_jl_ClassCastException.prototype.constructor = $c_jl_ClassCastException;
/** @constructor */
function $h_jl_ClassCastException() {
  /*<skip>*/
}
$h_jl_ClassCastException.prototype = $c_jl_ClassCastException.prototype;
$c_jl_ClassCastException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
function $is_jl_ClassCastException(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_ClassCastException)))
}
function $as_jl_ClassCastException(obj) {
  return (($is_jl_ClassCastException(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.ClassCastException"))
}
function $isArrayOf_jl_ClassCastException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_ClassCastException)))
}
function $asArrayOf_jl_ClassCastException(obj, depth) {
  return (($isArrayOf_jl_ClassCastException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.ClassCastException;", depth))
}
var $d_jl_ClassCastException = new $TypeData().initClass({
  jl_ClassCastException: 0
}, false, "java.lang.ClassCastException", {
  jl_ClassCastException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ClassCastException.prototype.$classData = $d_jl_ClassCastException;
/** @constructor */
function $c_jl_IllegalArgumentException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IllegalArgumentException.prototype = new $h_jl_RuntimeException();
$c_jl_IllegalArgumentException.prototype.constructor = $c_jl_IllegalArgumentException;
/** @constructor */
function $h_jl_IllegalArgumentException() {
  /*<skip>*/
}
$h_jl_IllegalArgumentException.prototype = $c_jl_IllegalArgumentException.prototype;
$c_jl_IllegalArgumentException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_jl_IllegalArgumentException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_IllegalArgumentException = new $TypeData().initClass({
  jl_IllegalArgumentException: 0
}, false, "java.lang.IllegalArgumentException", {
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IllegalArgumentException.prototype.$classData = $d_jl_IllegalArgumentException;
/** @constructor */
function $c_jl_IndexOutOfBoundsException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IndexOutOfBoundsException.prototype = new $h_jl_RuntimeException();
$c_jl_IndexOutOfBoundsException.prototype.constructor = $c_jl_IndexOutOfBoundsException;
/** @constructor */
function $h_jl_IndexOutOfBoundsException() {
  /*<skip>*/
}
$h_jl_IndexOutOfBoundsException.prototype = $c_jl_IndexOutOfBoundsException.prototype;
$c_jl_IndexOutOfBoundsException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_IndexOutOfBoundsException = new $TypeData().initClass({
  jl_IndexOutOfBoundsException: 0
}, false, "java.lang.IndexOutOfBoundsException", {
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IndexOutOfBoundsException.prototype.$classData = $d_jl_IndexOutOfBoundsException;
/** @constructor */
function $c_jl_NullPointerException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_NullPointerException.prototype = new $h_jl_RuntimeException();
$c_jl_NullPointerException.prototype.constructor = $c_jl_NullPointerException;
/** @constructor */
function $h_jl_NullPointerException() {
  /*<skip>*/
}
$h_jl_NullPointerException.prototype = $c_jl_NullPointerException.prototype;
$c_jl_NullPointerException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
var $d_jl_NullPointerException = new $TypeData().initClass({
  jl_NullPointerException: 0
}, false, "java.lang.NullPointerException", {
  jl_NullPointerException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_NullPointerException.prototype.$classData = $d_jl_NullPointerException;
/** @constructor */
function $c_jl_UnsupportedOperationException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_UnsupportedOperationException.prototype = new $h_jl_RuntimeException();
$c_jl_UnsupportedOperationException.prototype.constructor = $c_jl_UnsupportedOperationException;
/** @constructor */
function $h_jl_UnsupportedOperationException() {
  /*<skip>*/
}
$h_jl_UnsupportedOperationException.prototype = $c_jl_UnsupportedOperationException.prototype;
$c_jl_UnsupportedOperationException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_UnsupportedOperationException = new $TypeData().initClass({
  jl_UnsupportedOperationException: 0
}, false, "java.lang.UnsupportedOperationException", {
  jl_UnsupportedOperationException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_UnsupportedOperationException.prototype.$classData = $d_jl_UnsupportedOperationException;
/** @constructor */
function $c_ju_NoSuchElementException() {
  $c_jl_RuntimeException.call(this)
}
$c_ju_NoSuchElementException.prototype = new $h_jl_RuntimeException();
$c_ju_NoSuchElementException.prototype.constructor = $c_ju_NoSuchElementException;
/** @constructor */
function $h_ju_NoSuchElementException() {
  /*<skip>*/
}
$h_ju_NoSuchElementException.prototype = $c_ju_NoSuchElementException.prototype;
$c_ju_NoSuchElementException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_ju_NoSuchElementException = new $TypeData().initClass({
  ju_NoSuchElementException: 0
}, false, "java.util.NoSuchElementException", {
  ju_NoSuchElementException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_ju_NoSuchElementException.prototype.$classData = $d_ju_NoSuchElementException;
/** @constructor */
function $c_s_MatchError() {
  $c_jl_RuntimeException.call(this);
  this.obj$4 = null;
  this.objString$4 = null;
  this.bitmap$0$4 = false
}
$c_s_MatchError.prototype = new $h_jl_RuntimeException();
$c_s_MatchError.prototype.constructor = $c_s_MatchError;
/** @constructor */
function $h_s_MatchError() {
  /*<skip>*/
}
$h_s_MatchError.prototype = $c_s_MatchError.prototype;
$c_s_MatchError.prototype.objString$lzycompute__p4__T = (function() {
  if ((!this.bitmap$0$4)) {
    this.objString$4 = ((this.obj$4 === null) ? "null" : this.liftedTree1$1__p4__T());
    this.bitmap$0$4 = true
  };
  return this.objString$4
});
$c_s_MatchError.prototype.ofClass$1__p4__T = (function() {
  return ("of class " + $objectGetClass(this.obj$4).getName__T())
});
$c_s_MatchError.prototype.liftedTree1$1__p4__T = (function() {
  try {
    return ((($objectToString(this.obj$4) + " (") + this.ofClass$1__p4__T()) + ")")
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      return ("an instance " + this.ofClass$1__p4__T())
    } else {
      throw e
    }
  }
});
$c_s_MatchError.prototype.getMessage__T = (function() {
  return this.objString__p4__T()
});
$c_s_MatchError.prototype.objString__p4__T = (function() {
  return ((!this.bitmap$0$4) ? this.objString$lzycompute__p4__T() : this.objString$4)
});
$c_s_MatchError.prototype.init___O = (function(obj) {
  this.obj$4 = obj;
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
var $d_s_MatchError = new $TypeData().initClass({
  s_MatchError: 0
}, false, "scala.MatchError", {
  s_MatchError: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_MatchError.prototype.$classData = $d_s_MatchError;
/** @constructor */
function $c_s_Option() {
  $c_O.call(this)
}
$c_s_Option.prototype = new $h_O();
$c_s_Option.prototype.constructor = $c_s_Option;
/** @constructor */
function $h_s_Option() {
  /*<skip>*/
}
$h_s_Option.prototype = $c_s_Option.prototype;
/** @constructor */
function $c_s_Predef$$anon$1() {
  $c_s_Predef$$less$colon$less.call(this)
}
$c_s_Predef$$anon$1.prototype = new $h_s_Predef$$less$colon$less();
$c_s_Predef$$anon$1.prototype.constructor = $c_s_Predef$$anon$1;
/** @constructor */
function $h_s_Predef$$anon$1() {
  /*<skip>*/
}
$h_s_Predef$$anon$1.prototype = $c_s_Predef$$anon$1.prototype;
$c_s_Predef$$anon$1.prototype.init___ = (function() {
  return this
});
$c_s_Predef$$anon$1.prototype.apply__O__O = (function(x) {
  return x
});
var $d_s_Predef$$anon$1 = new $TypeData().initClass({
  s_Predef$$anon$1: 0
}, false, "scala.Predef$$anon$1", {
  s_Predef$$anon$1: 1,
  s_Predef$$less$colon$less: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Predef$$anon$1.prototype.$classData = $d_s_Predef$$anon$1;
/** @constructor */
function $c_s_Predef$$anon$2() {
  $c_s_Predef$$eq$colon$eq.call(this)
}
$c_s_Predef$$anon$2.prototype = new $h_s_Predef$$eq$colon$eq();
$c_s_Predef$$anon$2.prototype.constructor = $c_s_Predef$$anon$2;
/** @constructor */
function $h_s_Predef$$anon$2() {
  /*<skip>*/
}
$h_s_Predef$$anon$2.prototype = $c_s_Predef$$anon$2.prototype;
$c_s_Predef$$anon$2.prototype.init___ = (function() {
  return this
});
$c_s_Predef$$anon$2.prototype.apply__O__O = (function(x) {
  return x
});
var $d_s_Predef$$anon$2 = new $TypeData().initClass({
  s_Predef$$anon$2: 0
}, false, "scala.Predef$$anon$2", {
  s_Predef$$anon$2: 1,
  s_Predef$$eq$colon$eq: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Predef$$anon$2.prototype.$classData = $d_s_Predef$$anon$2;
/** @constructor */
function $c_s_StringContext() {
  $c_O.call(this);
  this.parts$1 = null
}
$c_s_StringContext.prototype = new $h_O();
$c_s_StringContext.prototype.constructor = $c_s_StringContext;
/** @constructor */
function $h_s_StringContext() {
  /*<skip>*/
}
$h_s_StringContext.prototype = $c_s_StringContext.prototype;
$c_s_StringContext.prototype.productPrefix__T = (function() {
  return "StringContext"
});
$c_s_StringContext.prototype.productArity__I = (function() {
  return 1
});
$c_s_StringContext.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_s_StringContext(x$1)) {
    var StringContext$1 = $as_s_StringContext(x$1);
    var x = this.parts$1;
    var x$2 = StringContext$1.parts$1;
    return ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
  } else {
    return false
  }
});
$c_s_StringContext.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.parts$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_s_StringContext.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_s_StringContext.prototype.checkLengths__sc_Seq__V = (function(args) {
  if ((this.parts$1.length__I() !== ((1 + args.length__I()) | 0))) {
    throw new $c_jl_IllegalArgumentException().init___T((((("wrong number of arguments (" + args.length__I()) + ") for interpolated string with ") + this.parts$1.length__I()) + " parts"))
  }
});
$c_s_StringContext.prototype.s__sc_Seq__T = (function(args) {
  var f = (function($this) {
    return (function(str$2) {
      var str = $as_T(str$2);
      var this$1 = $m_s_StringContext$();
      return this$1.treatEscapes0__p1__T__Z__T(str, false)
    })
  })(this);
  this.checkLengths__sc_Seq__V(args);
  var pi = this.parts$1.iterator__sc_Iterator();
  var ai = args.iterator__sc_Iterator();
  var arg1 = pi.next__O();
  var bldr = new $c_jl_StringBuilder().init___T($as_T(f(arg1)));
  while (ai.hasNext__Z()) {
    bldr.append__O__jl_StringBuilder(ai.next__O());
    var arg1$1 = pi.next__O();
    bldr.append__T__jl_StringBuilder($as_T(f(arg1$1)))
  };
  return bldr.content$1
});
$c_s_StringContext.prototype.init___sc_Seq = (function(parts) {
  this.parts$1 = parts;
  return this
});
$c_s_StringContext.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_s_StringContext.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_s_StringContext(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_StringContext)))
}
function $as_s_StringContext(obj) {
  return (($is_s_StringContext(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.StringContext"))
}
function $isArrayOf_s_StringContext(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_StringContext)))
}
function $asArrayOf_s_StringContext(obj, depth) {
  return (($isArrayOf_s_StringContext(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.StringContext;", depth))
}
var $d_s_StringContext = new $TypeData().initClass({
  s_StringContext: 0
}, false, "scala.StringContext", {
  s_StringContext: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_StringContext.prototype.$classData = $d_s_StringContext;
/** @constructor */
function $c_s_util_control_BreakControl() {
  $c_jl_Throwable.call(this)
}
$c_s_util_control_BreakControl.prototype = new $h_jl_Throwable();
$c_s_util_control_BreakControl.prototype.constructor = $c_s_util_control_BreakControl;
/** @constructor */
function $h_s_util_control_BreakControl() {
  /*<skip>*/
}
$h_s_util_control_BreakControl.prototype = $c_s_util_control_BreakControl.prototype;
$c_s_util_control_BreakControl.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_s_util_control_BreakControl.prototype.fillInStackTrace__jl_Throwable = (function() {
  return $s_s_util_control_NoStackTrace$class__fillInStackTrace__s_util_control_NoStackTrace__jl_Throwable(this)
});
$c_s_util_control_BreakControl.prototype.scala$util$control$NoStackTrace$$super$fillInStackTrace__jl_Throwable = (function() {
  return $c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
var $d_s_util_control_BreakControl = new $TypeData().initClass({
  s_util_control_BreakControl: 0
}, false, "scala.util.control.BreakControl", {
  s_util_control_BreakControl: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
$c_s_util_control_BreakControl.prototype.$classData = $d_s_util_control_BreakControl;
function $is_sc_GenTraversable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenTraversable)))
}
function $as_sc_GenTraversable(obj) {
  return (($is_sc_GenTraversable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenTraversable"))
}
function $isArrayOf_sc_GenTraversable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenTraversable)))
}
function $asArrayOf_sc_GenTraversable(obj, depth) {
  return (($isArrayOf_sc_GenTraversable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenTraversable;", depth))
}
/** @constructor */
function $c_sc_Iterable$() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_sc_Iterable$.prototype = new $h_scg_GenTraversableFactory();
$c_sc_Iterable$.prototype.constructor = $c_sc_Iterable$;
/** @constructor */
function $h_sc_Iterable$() {
  /*<skip>*/
}
$h_sc_Iterable$.prototype = $c_sc_Iterable$.prototype;
$c_sc_Iterable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sc_Iterable$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Iterable$();
  return new $c_scm_ListBuffer().init___()
});
var $d_sc_Iterable$ = new $TypeData().initClass({
  sc_Iterable$: 0
}, false, "scala.collection.Iterable$", {
  sc_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Iterable$.prototype.$classData = $d_sc_Iterable$;
var $n_sc_Iterable$ = (void 0);
function $m_sc_Iterable$() {
  if ((!$n_sc_Iterable$)) {
    $n_sc_Iterable$ = new $c_sc_Iterable$().init___()
  };
  return $n_sc_Iterable$
}
/** @constructor */
function $c_sc_Iterator$$anon$2() {
  $c_sc_AbstractIterator.call(this)
}
$c_sc_Iterator$$anon$2.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$$anon$2.prototype.constructor = $c_sc_Iterator$$anon$2;
/** @constructor */
function $h_sc_Iterator$$anon$2() {
  /*<skip>*/
}
$h_sc_Iterator$$anon$2.prototype = $c_sc_Iterator$$anon$2.prototype;
$c_sc_Iterator$$anon$2.prototype.init___ = (function() {
  return this
});
$c_sc_Iterator$$anon$2.prototype.next__O = (function() {
  this.next__sr_Nothing$()
});
$c_sc_Iterator$$anon$2.prototype.next__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("next on empty iterator")
});
$c_sc_Iterator$$anon$2.prototype.hasNext__Z = (function() {
  return false
});
var $d_sc_Iterator$$anon$2 = new $TypeData().initClass({
  sc_Iterator$$anon$2: 0
}, false, "scala.collection.Iterator$$anon$2", {
  sc_Iterator$$anon$2: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_Iterator$$anon$2.prototype.$classData = $d_sc_Iterator$$anon$2;
/** @constructor */
function $c_sc_LinearSeqLike$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.these$2 = null
}
$c_sc_LinearSeqLike$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sc_LinearSeqLike$$anon$1.prototype.constructor = $c_sc_LinearSeqLike$$anon$1;
/** @constructor */
function $h_sc_LinearSeqLike$$anon$1() {
  /*<skip>*/
}
$h_sc_LinearSeqLike$$anon$1.prototype = $c_sc_LinearSeqLike$$anon$1.prototype;
$c_sc_LinearSeqLike$$anon$1.prototype.init___sc_LinearSeqLike = (function($$outer) {
  this.these$2 = $$outer;
  return this
});
$c_sc_LinearSeqLike$$anon$1.prototype.next__O = (function() {
  if (this.hasNext__Z()) {
    var result = this.these$2.head__O();
    this.these$2 = $as_sc_LinearSeqLike(this.these$2.tail__O());
    return result
  } else {
    return $m_sc_Iterator$().empty$1.next__O()
  }
});
$c_sc_LinearSeqLike$$anon$1.prototype.hasNext__Z = (function() {
  return (!this.these$2.isEmpty__Z())
});
var $d_sc_LinearSeqLike$$anon$1 = new $TypeData().initClass({
  sc_LinearSeqLike$$anon$1: 0
}, false, "scala.collection.LinearSeqLike$$anon$1", {
  sc_LinearSeqLike$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_LinearSeqLike$$anon$1.prototype.$classData = $d_sc_LinearSeqLike$$anon$1;
/** @constructor */
function $c_sc_Traversable$() {
  $c_scg_GenTraversableFactory.call(this);
  this.breaks$3 = null
}
$c_sc_Traversable$.prototype = new $h_scg_GenTraversableFactory();
$c_sc_Traversable$.prototype.constructor = $c_sc_Traversable$;
/** @constructor */
function $h_sc_Traversable$() {
  /*<skip>*/
}
$h_sc_Traversable$.prototype = $c_sc_Traversable$.prototype;
$c_sc_Traversable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sc_Traversable$ = this;
  this.breaks$3 = new $c_s_util_control_Breaks().init___();
  return this
});
$c_sc_Traversable$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Traversable$();
  return new $c_scm_ListBuffer().init___()
});
var $d_sc_Traversable$ = new $TypeData().initClass({
  sc_Traversable$: 0
}, false, "scala.collection.Traversable$", {
  sc_Traversable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Traversable$.prototype.$classData = $d_sc_Traversable$;
var $n_sc_Traversable$ = (void 0);
function $m_sc_Traversable$() {
  if ((!$n_sc_Traversable$)) {
    $n_sc_Traversable$ = new $c_sc_Traversable$().init___()
  };
  return $n_sc_Traversable$
}
/** @constructor */
function $c_scg_ImmutableSetFactory() {
  $c_scg_SetFactory.call(this)
}
$c_scg_ImmutableSetFactory.prototype = new $h_scg_SetFactory();
$c_scg_ImmutableSetFactory.prototype.constructor = $c_scg_ImmutableSetFactory;
/** @constructor */
function $h_scg_ImmutableSetFactory() {
  /*<skip>*/
}
$h_scg_ImmutableSetFactory.prototype = $c_scg_ImmutableSetFactory.prototype;
$c_scg_ImmutableSetFactory.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_SetBuilder().init___sc_Set(this.emptyInstance__sci_Set())
});
/** @constructor */
function $c_scg_MutableSetFactory() {
  $c_scg_SetFactory.call(this)
}
$c_scg_MutableSetFactory.prototype = new $h_scg_SetFactory();
$c_scg_MutableSetFactory.prototype.constructor = $c_scg_MutableSetFactory;
/** @constructor */
function $h_scg_MutableSetFactory() {
  /*<skip>*/
}
$h_scg_MutableSetFactory.prototype = $c_scg_MutableSetFactory.prototype;
$c_scg_MutableSetFactory.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_GrowingBuilder().init___scg_Growable($as_scg_Growable(this.empty__sc_GenTraversable()))
});
/** @constructor */
function $c_sci_Iterable$() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_sci_Iterable$.prototype = new $h_scg_GenTraversableFactory();
$c_sci_Iterable$.prototype.constructor = $c_sci_Iterable$;
/** @constructor */
function $h_sci_Iterable$() {
  /*<skip>*/
}
$h_sci_Iterable$.prototype = $c_sci_Iterable$.prototype;
$c_sci_Iterable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Iterable$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_Iterable$ = new $TypeData().initClass({
  sci_Iterable$: 0
}, false, "scala.collection.immutable.Iterable$", {
  sci_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Iterable$.prototype.$classData = $d_sci_Iterable$;
var $n_sci_Iterable$ = (void 0);
function $m_sci_Iterable$() {
  if ((!$n_sci_Iterable$)) {
    $n_sci_Iterable$ = new $c_sci_Iterable$().init___()
  };
  return $n_sci_Iterable$
}
/** @constructor */
function $c_sci_ListSet$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.that$2 = null
}
$c_sci_ListSet$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sci_ListSet$$anon$1.prototype.constructor = $c_sci_ListSet$$anon$1;
/** @constructor */
function $h_sci_ListSet$$anon$1() {
  /*<skip>*/
}
$h_sci_ListSet$$anon$1.prototype = $c_sci_ListSet$$anon$1.prototype;
$c_sci_ListSet$$anon$1.prototype.next__O = (function() {
  var this$1 = this.that$2;
  if ($s_sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)) {
    var res = this.that$2.head__O();
    this.that$2 = this.that$2.tail__sci_ListSet();
    return res
  } else {
    return $m_sc_Iterator$().empty$1.next__O()
  }
});
$c_sci_ListSet$$anon$1.prototype.init___sci_ListSet = (function($$outer) {
  this.that$2 = $$outer;
  return this
});
$c_sci_ListSet$$anon$1.prototype.hasNext__Z = (function() {
  var this$1 = this.that$2;
  return $s_sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)
});
var $d_sci_ListSet$$anon$1 = new $TypeData().initClass({
  sci_ListSet$$anon$1: 0
}, false, "scala.collection.immutable.ListSet$$anon$1", {
  sci_ListSet$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_ListSet$$anon$1.prototype.$classData = $d_sci_ListSet$$anon$1;
/** @constructor */
function $c_sci_Stream$StreamBuilder() {
  $c_scm_LazyBuilder.call(this)
}
$c_sci_Stream$StreamBuilder.prototype = new $h_scm_LazyBuilder();
$c_sci_Stream$StreamBuilder.prototype.constructor = $c_sci_Stream$StreamBuilder;
/** @constructor */
function $h_sci_Stream$StreamBuilder() {
  /*<skip>*/
}
$h_sci_Stream$StreamBuilder.prototype = $c_sci_Stream$StreamBuilder.prototype;
$c_sci_Stream$StreamBuilder.prototype.init___ = (function() {
  $c_scm_LazyBuilder.prototype.init___.call(this);
  return this
});
$c_sci_Stream$StreamBuilder.prototype.result__O = (function() {
  return this.result__sci_Stream()
});
$c_sci_Stream$StreamBuilder.prototype.result__sci_Stream = (function() {
  var this$1 = this.parts$1;
  return $as_sci_Stream(this$1.scala$collection$mutable$ListBuffer$$start$6.toStream__sci_Stream().flatMap__F1__scg_CanBuildFrom__O(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$5$2) {
      var x$5 = $as_sc_TraversableOnce(x$5$2);
      return x$5.toStream__sci_Stream()
    })
  })(this)), ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___())))
});
function $is_sci_Stream$StreamBuilder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream$StreamBuilder)))
}
function $as_sci_Stream$StreamBuilder(obj) {
  return (($is_sci_Stream$StreamBuilder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Stream$StreamBuilder"))
}
function $isArrayOf_sci_Stream$StreamBuilder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream$StreamBuilder)))
}
function $asArrayOf_sci_Stream$StreamBuilder(obj, depth) {
  return (($isArrayOf_sci_Stream$StreamBuilder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Stream$StreamBuilder;", depth))
}
var $d_sci_Stream$StreamBuilder = new $TypeData().initClass({
  sci_Stream$StreamBuilder: 0
}, false, "scala.collection.immutable.Stream$StreamBuilder", {
  sci_Stream$StreamBuilder: 1,
  scm_LazyBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_sci_Stream$StreamBuilder.prototype.$classData = $d_sci_Stream$StreamBuilder;
/** @constructor */
function $c_sci_StreamIterator() {
  $c_sc_AbstractIterator.call(this);
  this.these$2 = null
}
$c_sci_StreamIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_StreamIterator.prototype.constructor = $c_sci_StreamIterator;
/** @constructor */
function $h_sci_StreamIterator() {
  /*<skip>*/
}
$h_sci_StreamIterator.prototype = $c_sci_StreamIterator.prototype;
$c_sci_StreamIterator.prototype.next__O = (function() {
  if ($s_sc_Iterator$class__isEmpty__sc_Iterator__Z(this)) {
    return $m_sc_Iterator$().empty$1.next__O()
  } else {
    var cur = this.these$2.v__sci_Stream();
    var result = cur.head__O();
    this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, cur$1) {
      return (function() {
        return $as_sci_Stream(cur$1.tail__O())
      })
    })(this, cur)));
    return result
  }
});
$c_sci_StreamIterator.prototype.init___sci_Stream = (function(self) {
  this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, self$1) {
    return (function() {
      return self$1
    })
  })(this, self)));
  return this
});
$c_sci_StreamIterator.prototype.hasNext__Z = (function() {
  var this$1 = this.these$2.v__sci_Stream();
  return $s_sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)
});
$c_sci_StreamIterator.prototype.toStream__sci_Stream = (function() {
  var result = this.these$2.v__sci_Stream();
  this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      $m_sci_Stream$();
      return $m_sci_Stream$Empty$()
    })
  })(this)));
  return result
});
var $d_sci_StreamIterator = new $TypeData().initClass({
  sci_StreamIterator: 0
}, false, "scala.collection.immutable.StreamIterator", {
  sci_StreamIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_StreamIterator.prototype.$classData = $d_sci_StreamIterator;
/** @constructor */
function $c_sci_Traversable$() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_sci_Traversable$.prototype = new $h_scg_GenTraversableFactory();
$c_sci_Traversable$.prototype.constructor = $c_sci_Traversable$;
/** @constructor */
function $h_sci_Traversable$() {
  /*<skip>*/
}
$h_sci_Traversable$.prototype = $c_sci_Traversable$.prototype;
$c_sci_Traversable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Traversable$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_Traversable$ = new $TypeData().initClass({
  sci_Traversable$: 0
}, false, "scala.collection.immutable.Traversable$", {
  sci_Traversable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Traversable$.prototype.$classData = $d_sci_Traversable$;
var $n_sci_Traversable$ = (void 0);
function $m_sci_Traversable$() {
  if ((!$n_sci_Traversable$)) {
    $n_sci_Traversable$ = new $c_sci_Traversable$().init___()
  };
  return $n_sci_Traversable$
}
/** @constructor */
function $c_sci_TrieIterator() {
  $c_sc_AbstractIterator.call(this);
  this.elems$2 = null;
  this.scala$collection$immutable$TrieIterator$$depth$f = 0;
  this.scala$collection$immutable$TrieIterator$$arrayStack$f = null;
  this.scala$collection$immutable$TrieIterator$$posStack$f = null;
  this.scala$collection$immutable$TrieIterator$$arrayD$f = null;
  this.scala$collection$immutable$TrieIterator$$posD$f = 0;
  this.scala$collection$immutable$TrieIterator$$subIter$f = null
}
$c_sci_TrieIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_TrieIterator.prototype.constructor = $c_sci_TrieIterator;
/** @constructor */
function $h_sci_TrieIterator() {
  /*<skip>*/
}
$h_sci_TrieIterator.prototype = $c_sci_TrieIterator.prototype;
$c_sci_TrieIterator.prototype.isContainer__p2__O__Z = (function(x) {
  return ($is_sci_HashMap$HashMap1(x) || $is_sci_HashSet$HashSet1(x))
});
$c_sci_TrieIterator.prototype.next__O = (function() {
  if ((this.scala$collection$immutable$TrieIterator$$subIter$f !== null)) {
    var el = this.scala$collection$immutable$TrieIterator$$subIter$f.next__O();
    if ((!this.scala$collection$immutable$TrieIterator$$subIter$f.hasNext__Z())) {
      this.scala$collection$immutable$TrieIterator$$subIter$f = null
    };
    return el
  } else {
    return this.next0__p2__Asci_Iterable__I__O(this.scala$collection$immutable$TrieIterator$$arrayD$f, this.scala$collection$immutable$TrieIterator$$posD$f)
  }
});
$c_sci_TrieIterator.prototype.initPosStack__AI = (function() {
  return $newArrayObject($d_I.getArrayOf(), [6])
});
$c_sci_TrieIterator.prototype.hasNext__Z = (function() {
  return ((this.scala$collection$immutable$TrieIterator$$subIter$f !== null) || (this.scala$collection$immutable$TrieIterator$$depth$f >= 0))
});
$c_sci_TrieIterator.prototype.next0__p2__Asci_Iterable__I__O = (function(elems, i) {
  _next0: while (true) {
    if ((i === (((-1) + elems.u.length) | 0))) {
      this.scala$collection$immutable$TrieIterator$$depth$f = (((-1) + this.scala$collection$immutable$TrieIterator$$depth$f) | 0);
      if ((this.scala$collection$immutable$TrieIterator$$depth$f >= 0)) {
        this.scala$collection$immutable$TrieIterator$$arrayD$f = this.scala$collection$immutable$TrieIterator$$arrayStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f];
        this.scala$collection$immutable$TrieIterator$$posD$f = this.scala$collection$immutable$TrieIterator$$posStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f];
        this.scala$collection$immutable$TrieIterator$$arrayStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f] = null
      } else {
        this.scala$collection$immutable$TrieIterator$$arrayD$f = null;
        this.scala$collection$immutable$TrieIterator$$posD$f = 0
      }
    } else {
      this.scala$collection$immutable$TrieIterator$$posD$f = ((1 + this.scala$collection$immutable$TrieIterator$$posD$f) | 0)
    };
    var m = elems.u[i];
    if (this.isContainer__p2__O__Z(m)) {
      return $as_sci_HashSet$HashSet1(m).key$6
    } else if (this.isTrie__p2__O__Z(m)) {
      if ((this.scala$collection$immutable$TrieIterator$$depth$f >= 0)) {
        this.scala$collection$immutable$TrieIterator$$arrayStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f] = this.scala$collection$immutable$TrieIterator$$arrayD$f;
        this.scala$collection$immutable$TrieIterator$$posStack$f.u[this.scala$collection$immutable$TrieIterator$$depth$f] = this.scala$collection$immutable$TrieIterator$$posD$f
      };
      this.scala$collection$immutable$TrieIterator$$depth$f = ((1 + this.scala$collection$immutable$TrieIterator$$depth$f) | 0);
      this.scala$collection$immutable$TrieIterator$$arrayD$f = this.getElems__p2__sci_Iterable__Asci_Iterable(m);
      this.scala$collection$immutable$TrieIterator$$posD$f = 0;
      var temp$elems = this.getElems__p2__sci_Iterable__Asci_Iterable(m);
      elems = temp$elems;
      i = 0;
      continue _next0
    } else {
      this.scala$collection$immutable$TrieIterator$$subIter$f = m.iterator__sc_Iterator();
      return this.next__O()
    }
  }
});
$c_sci_TrieIterator.prototype.getElems__p2__sci_Iterable__Asci_Iterable = (function(x) {
  if ($is_sci_HashMap$HashTrieMap(x)) {
    var x2 = $as_sci_HashMap$HashTrieMap(x);
    var jsx$1 = $asArrayOf_sc_AbstractIterable(x2.elems__Asci_HashMap(), 1)
  } else if ($is_sci_HashSet$HashTrieSet(x)) {
    var x3 = $as_sci_HashSet$HashTrieSet(x);
    var jsx$1 = x3.elems$5
  } else {
    var jsx$1;
    throw new $c_s_MatchError().init___O(x)
  };
  return $asArrayOf_sci_Iterable(jsx$1, 1)
});
$c_sci_TrieIterator.prototype.init___Asci_Iterable = (function(elems) {
  this.elems$2 = elems;
  this.scala$collection$immutable$TrieIterator$$depth$f = 0;
  this.scala$collection$immutable$TrieIterator$$arrayStack$f = this.initArrayStack__AAsci_Iterable();
  this.scala$collection$immutable$TrieIterator$$posStack$f = this.initPosStack__AI();
  this.scala$collection$immutable$TrieIterator$$arrayD$f = this.elems$2;
  this.scala$collection$immutable$TrieIterator$$posD$f = 0;
  this.scala$collection$immutable$TrieIterator$$subIter$f = null;
  return this
});
$c_sci_TrieIterator.prototype.isTrie__p2__O__Z = (function(x) {
  return ($is_sci_HashMap$HashTrieMap(x) || $is_sci_HashSet$HashTrieSet(x))
});
$c_sci_TrieIterator.prototype.initArrayStack__AAsci_Iterable = (function() {
  return $newArrayObject($d_sci_Iterable.getArrayOf().getArrayOf(), [6])
});
/** @constructor */
function $c_sci_Vector$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.i$2 = 0;
  this.$$outer$2 = null
}
$c_sci_Vector$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sci_Vector$$anon$1.prototype.constructor = $c_sci_Vector$$anon$1;
/** @constructor */
function $h_sci_Vector$$anon$1() {
  /*<skip>*/
}
$h_sci_Vector$$anon$1.prototype = $c_sci_Vector$$anon$1.prototype;
$c_sci_Vector$$anon$1.prototype.next__O = (function() {
  if ((this.i$2 > 0)) {
    this.i$2 = (((-1) + this.i$2) | 0);
    return this.$$outer$2.apply__I__O(this.i$2)
  } else {
    return $m_sc_Iterator$().empty$1.next__O()
  }
});
$c_sci_Vector$$anon$1.prototype.hasNext__Z = (function() {
  return (this.i$2 > 0)
});
$c_sci_Vector$$anon$1.prototype.init___sci_Vector = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.i$2 = $$outer.length__I();
  return this
});
var $d_sci_Vector$$anon$1 = new $TypeData().initClass({
  sci_Vector$$anon$1: 0
}, false, "scala.collection.immutable.Vector$$anon$1", {
  sci_Vector$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_Vector$$anon$1.prototype.$classData = $d_sci_Vector$$anon$1;
/** @constructor */
function $c_sci_VectorBuilder() {
  $c_O.call(this);
  this.blockIndex$1 = 0;
  this.lo$1 = 0;
  this.depth$1 = 0;
  this.display0$1 = null;
  this.display1$1 = null;
  this.display2$1 = null;
  this.display3$1 = null;
  this.display4$1 = null;
  this.display5$1 = null
}
$c_sci_VectorBuilder.prototype = new $h_O();
$c_sci_VectorBuilder.prototype.constructor = $c_sci_VectorBuilder;
/** @constructor */
function $h_sci_VectorBuilder() {
  /*<skip>*/
}
$h_sci_VectorBuilder.prototype = $c_sci_VectorBuilder.prototype;
$c_sci_VectorBuilder.prototype.display3__AO = (function() {
  return this.display3$1
});
$c_sci_VectorBuilder.prototype.init___ = (function() {
  this.display0$1 = $newArrayObject($d_O.getArrayOf(), [32]);
  this.depth$1 = 1;
  this.blockIndex$1 = 0;
  this.lo$1 = 0;
  return this
});
$c_sci_VectorBuilder.prototype.depth__I = (function() {
  return this.depth$1
});
$c_sci_VectorBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__sci_VectorBuilder(elem)
});
$c_sci_VectorBuilder.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$1 = x$1
});
$c_sci_VectorBuilder.prototype.display0__AO = (function() {
  return this.display0$1
});
$c_sci_VectorBuilder.prototype.display4__AO = (function() {
  return this.display4$1
});
$c_sci_VectorBuilder.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$1 = x$1
});
$c_sci_VectorBuilder.prototype.$$plus$eq__O__sci_VectorBuilder = (function(elem) {
  if ((this.lo$1 >= this.display0$1.u.length)) {
    var newBlockIndex = ((32 + this.blockIndex$1) | 0);
    var xor = (this.blockIndex$1 ^ newBlockIndex);
    $s_sci_VectorPointer$class__gotoNextBlockStartWritable__sci_VectorPointer__I__I__V(this, newBlockIndex, xor);
    this.blockIndex$1 = newBlockIndex;
    this.lo$1 = 0
  };
  this.display0$1.u[this.lo$1] = elem;
  this.lo$1 = ((1 + this.lo$1) | 0);
  return this
});
$c_sci_VectorBuilder.prototype.result__O = (function() {
  return this.result__sci_Vector()
});
$c_sci_VectorBuilder.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$1 = x$1
});
$c_sci_VectorBuilder.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$1 = x$1
});
$c_sci_VectorBuilder.prototype.display1__AO = (function() {
  return this.display1$1
});
$c_sci_VectorBuilder.prototype.display5__AO = (function() {
  return this.display5$1
});
$c_sci_VectorBuilder.prototype.result__sci_Vector = (function() {
  var size = ((this.blockIndex$1 + this.lo$1) | 0);
  if ((size === 0)) {
    var this$1 = $m_sci_Vector$();
    return this$1.NIL$6
  };
  var s = new $c_sci_Vector().init___I__I__I(0, size, 0);
  var depth = this.depth$1;
  $s_sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V(s, this, depth);
  if ((this.depth$1 > 1)) {
    var xor = (((-1) + size) | 0);
    $s_sci_VectorPointer$class__gotoPos__sci_VectorPointer__I__I__V(s, 0, xor)
  };
  return s
});
$c_sci_VectorBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__sci_VectorBuilder(elem)
});
$c_sci_VectorBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_sci_VectorBuilder.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$1 = x$1
});
$c_sci_VectorBuilder.prototype.display2__AO = (function() {
  return this.display2$1
});
$c_sci_VectorBuilder.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$1 = x$1
});
$c_sci_VectorBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $as_sci_VectorBuilder($s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs))
});
$c_sci_VectorBuilder.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$1 = x$1
});
function $is_sci_VectorBuilder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_VectorBuilder)))
}
function $as_sci_VectorBuilder(obj) {
  return (($is_sci_VectorBuilder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.VectorBuilder"))
}
function $isArrayOf_sci_VectorBuilder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_VectorBuilder)))
}
function $asArrayOf_sci_VectorBuilder(obj, depth) {
  return (($isArrayOf_sci_VectorBuilder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.VectorBuilder;", depth))
}
var $d_sci_VectorBuilder = new $TypeData().initClass({
  sci_VectorBuilder: 0
}, false, "scala.collection.immutable.VectorBuilder", {
  sci_VectorBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  sci_VectorPointer: 1
});
$c_sci_VectorBuilder.prototype.$classData = $d_sci_VectorBuilder;
/** @constructor */
function $c_scm_FlatHashTable$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.i$2 = 0;
  this.$$outer$2 = null
}
$c_scm_FlatHashTable$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_scm_FlatHashTable$$anon$1.prototype.constructor = $c_scm_FlatHashTable$$anon$1;
/** @constructor */
function $h_scm_FlatHashTable$$anon$1() {
  /*<skip>*/
}
$h_scm_FlatHashTable$$anon$1.prototype = $c_scm_FlatHashTable$$anon$1.prototype;
$c_scm_FlatHashTable$$anon$1.prototype.next__O = (function() {
  if (this.hasNext__Z()) {
    this.i$2 = ((1 + this.i$2) | 0);
    var this$1 = this.$$outer$2;
    var entry = this.$$outer$2.table$5.u[(((-1) + this.i$2) | 0)];
    return $s_scm_FlatHashTable$HashUtils$class__entryToElem__scm_FlatHashTable$HashUtils__O__O(this$1, entry)
  } else {
    return $m_sc_Iterator$().empty$1.next__O()
  }
});
$c_scm_FlatHashTable$$anon$1.prototype.init___scm_FlatHashTable = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.i$2 = 0;
  return this
});
$c_scm_FlatHashTable$$anon$1.prototype.hasNext__Z = (function() {
  while (((this.i$2 < this.$$outer$2.table$5.u.length) && (this.$$outer$2.table$5.u[this.i$2] === null))) {
    this.i$2 = ((1 + this.i$2) | 0)
  };
  return (this.i$2 < this.$$outer$2.table$5.u.length)
});
var $d_scm_FlatHashTable$$anon$1 = new $TypeData().initClass({
  scm_FlatHashTable$$anon$1: 0
}, false, "scala.collection.mutable.FlatHashTable$$anon$1", {
  scm_FlatHashTable$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_scm_FlatHashTable$$anon$1.prototype.$classData = $d_scm_FlatHashTable$$anon$1;
/** @constructor */
function $c_scm_ListBuffer$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.cursor$2 = null
}
$c_scm_ListBuffer$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_scm_ListBuffer$$anon$1.prototype.constructor = $c_scm_ListBuffer$$anon$1;
/** @constructor */
function $h_scm_ListBuffer$$anon$1() {
  /*<skip>*/
}
$h_scm_ListBuffer$$anon$1.prototype = $c_scm_ListBuffer$$anon$1.prototype;
$c_scm_ListBuffer$$anon$1.prototype.init___scm_ListBuffer = (function($$outer) {
  this.cursor$2 = ($$outer.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z() ? $m_sci_Nil$() : $$outer.scala$collection$mutable$ListBuffer$$start$6);
  return this
});
$c_scm_ListBuffer$$anon$1.prototype.next__O = (function() {
  if ((!this.hasNext__Z())) {
    throw new $c_ju_NoSuchElementException().init___T("next on empty Iterator")
  } else {
    var ans = this.cursor$2.head__O();
    var this$1 = this.cursor$2;
    this.cursor$2 = this$1.tail__sci_List();
    return ans
  }
});
$c_scm_ListBuffer$$anon$1.prototype.hasNext__Z = (function() {
  return (this.cursor$2 !== $m_sci_Nil$())
});
var $d_scm_ListBuffer$$anon$1 = new $TypeData().initClass({
  scm_ListBuffer$$anon$1: 0
}, false, "scala.collection.mutable.ListBuffer$$anon$1", {
  scm_ListBuffer$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_scm_ListBuffer$$anon$1.prototype.$classData = $d_scm_ListBuffer$$anon$1;
/** @constructor */
function $c_sr_ScalaRunTime$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.c$2 = 0;
  this.cmax$2 = 0;
  this.x$2$2 = null
}
$c_sr_ScalaRunTime$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sr_ScalaRunTime$$anon$1.prototype.constructor = $c_sr_ScalaRunTime$$anon$1;
/** @constructor */
function $h_sr_ScalaRunTime$$anon$1() {
  /*<skip>*/
}
$h_sr_ScalaRunTime$$anon$1.prototype = $c_sr_ScalaRunTime$$anon$1.prototype;
$c_sr_ScalaRunTime$$anon$1.prototype.next__O = (function() {
  var result = this.x$2$2.productElement__I__O(this.c$2);
  this.c$2 = ((1 + this.c$2) | 0);
  return result
});
$c_sr_ScalaRunTime$$anon$1.prototype.init___s_Product = (function(x$2) {
  this.x$2$2 = x$2;
  this.c$2 = 0;
  this.cmax$2 = x$2.productArity__I();
  return this
});
$c_sr_ScalaRunTime$$anon$1.prototype.hasNext__Z = (function() {
  return (this.c$2 < this.cmax$2)
});
var $d_sr_ScalaRunTime$$anon$1 = new $TypeData().initClass({
  sr_ScalaRunTime$$anon$1: 0
}, false, "scala.runtime.ScalaRunTime$$anon$1", {
  sr_ScalaRunTime$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sr_ScalaRunTime$$anon$1.prototype.$classData = $d_sr_ScalaRunTime$$anon$1;
/** @constructor */
function $c_Ljava_io_PrintStream() {
  $c_Ljava_io_FilterOutputStream.call(this);
  this.java$io$PrintStream$$autoFlush$f = false;
  this.charset$3 = null;
  this.java$io$PrintStream$$encoder$3 = null;
  this.java$io$PrintStream$$closing$3 = false;
  this.java$io$PrintStream$$closed$3 = false;
  this.errorFlag$3 = false;
  this.bitmap$0$3 = false
}
$c_Ljava_io_PrintStream.prototype = new $h_Ljava_io_FilterOutputStream();
$c_Ljava_io_PrintStream.prototype.constructor = $c_Ljava_io_PrintStream;
/** @constructor */
function $h_Ljava_io_PrintStream() {
  /*<skip>*/
}
$h_Ljava_io_PrintStream.prototype = $c_Ljava_io_PrintStream.prototype;
$c_Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream__Z__Ljava_nio_charset_Charset = (function(_out, autoFlush, charset) {
  this.java$io$PrintStream$$autoFlush$f = autoFlush;
  this.charset$3 = charset;
  $c_Ljava_io_FilterOutputStream.prototype.init___Ljava_io_OutputStream.call(this, _out);
  this.java$io$PrintStream$$closing$3 = false;
  this.java$io$PrintStream$$closed$3 = false;
  this.errorFlag$3 = false;
  return this
});
function $is_Ljava_io_PrintStream(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljava_io_PrintStream)))
}
function $as_Ljava_io_PrintStream(obj) {
  return (($is_Ljava_io_PrintStream(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.io.PrintStream"))
}
function $isArrayOf_Ljava_io_PrintStream(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljava_io_PrintStream)))
}
function $asArrayOf_Ljava_io_PrintStream(obj, depth) {
  return (($isArrayOf_Ljava_io_PrintStream(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.io.PrintStream;", depth))
}
/** @constructor */
function $c_s_None$() {
  $c_s_Option.call(this)
}
$c_s_None$.prototype = new $h_s_Option();
$c_s_None$.prototype.constructor = $c_s_None$;
/** @constructor */
function $h_s_None$() {
  /*<skip>*/
}
$h_s_None$.prototype = $c_s_None$.prototype;
$c_s_None$.prototype.init___ = (function() {
  return this
});
$c_s_None$.prototype.productPrefix__T = (function() {
  return "None"
});
$c_s_None$.prototype.productArity__I = (function() {
  return 0
});
$c_s_None$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_s_None$.prototype.toString__T = (function() {
  return "None"
});
$c_s_None$.prototype.hashCode__I = (function() {
  return 2433880
});
$c_s_None$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_s_None$ = new $TypeData().initClass({
  s_None$: 0
}, false, "scala.None$", {
  s_None$: 1,
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_None$.prototype.$classData = $d_s_None$;
var $n_s_None$ = (void 0);
function $m_s_None$() {
  if ((!$n_s_None$)) {
    $n_s_None$ = new $c_s_None$().init___()
  };
  return $n_s_None$
}
/** @constructor */
function $c_s_StringContext$InvalidEscapeException() {
  $c_jl_IllegalArgumentException.call(this);
  this.index$5 = 0
}
$c_s_StringContext$InvalidEscapeException.prototype = new $h_jl_IllegalArgumentException();
$c_s_StringContext$InvalidEscapeException.prototype.constructor = $c_s_StringContext$InvalidEscapeException;
/** @constructor */
function $h_s_StringContext$InvalidEscapeException() {
  /*<skip>*/
}
$h_s_StringContext$InvalidEscapeException.prototype = $c_s_StringContext$InvalidEscapeException.prototype;
$c_s_StringContext$InvalidEscapeException.prototype.init___T__I = (function(str, index) {
  this.index$5 = index;
  var jsx$3 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["invalid escape ", " index ", " in \"", "\". Use \\\\\\\\ for literal \\\\."]));
  $m_s_Predef$().require__Z__V(((index >= 0) && (index < $uI(str.length))));
  if ((index === (((-1) + $uI(str.length)) | 0))) {
    var jsx$1 = "at terminal"
  } else {
    var jsx$2 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["'\\\\", "' not one of ", " at"]));
    var index$1 = ((1 + index) | 0);
    var c = (65535 & $uI(str.charCodeAt(index$1)));
    var jsx$1 = jsx$2.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_jl_Character().init___C(c), "[\\b, \\t, \\n, \\f, \\r, \\\\, \\\", \\']"]))
  };
  var s = jsx$3.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$1, index, str]));
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_s_StringContext$InvalidEscapeException = new $TypeData().initClass({
  s_StringContext$InvalidEscapeException: 0
}, false, "scala.StringContext$InvalidEscapeException", {
  s_StringContext$InvalidEscapeException: 1,
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_StringContext$InvalidEscapeException.prototype.$classData = $d_s_StringContext$InvalidEscapeException;
/** @constructor */
function $c_scg_SeqFactory() {
  $c_scg_GenSeqFactory.call(this)
}
$c_scg_SeqFactory.prototype = new $h_scg_GenSeqFactory();
$c_scg_SeqFactory.prototype.constructor = $c_scg_SeqFactory;
/** @constructor */
function $h_scg_SeqFactory() {
  /*<skip>*/
}
$h_scg_SeqFactory.prototype = $c_scg_SeqFactory.prototype;
/** @constructor */
function $c_sci_HashSet$HashTrieSet$$anon$1() {
  $c_sci_TrieIterator.call(this)
}
$c_sci_HashSet$HashTrieSet$$anon$1.prototype = new $h_sci_TrieIterator();
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.constructor = $c_sci_HashSet$HashTrieSet$$anon$1;
/** @constructor */
function $h_sci_HashSet$HashTrieSet$$anon$1() {
  /*<skip>*/
}
$h_sci_HashSet$HashTrieSet$$anon$1.prototype = $c_sci_HashSet$HashTrieSet$$anon$1.prototype;
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.init___sci_HashSet$HashTrieSet = (function($$outer) {
  $c_sci_TrieIterator.prototype.init___Asci_Iterable.call(this, $$outer.elems$5);
  return this
});
var $d_sci_HashSet$HashTrieSet$$anon$1 = new $TypeData().initClass({
  sci_HashSet$HashTrieSet$$anon$1: 0
}, false, "scala.collection.immutable.HashSet$HashTrieSet$$anon$1", {
  sci_HashSet$HashTrieSet$$anon$1: 1,
  sci_TrieIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.$classData = $d_sci_HashSet$HashTrieSet$$anon$1;
/** @constructor */
function $c_sci_Set$() {
  $c_scg_ImmutableSetFactory.call(this)
}
$c_sci_Set$.prototype = new $h_scg_ImmutableSetFactory();
$c_sci_Set$.prototype.constructor = $c_sci_Set$;
/** @constructor */
function $h_sci_Set$() {
  /*<skip>*/
}
$h_sci_Set$.prototype = $c_sci_Set$.prototype;
$c_sci_Set$.prototype.init___ = (function() {
  return this
});
$c_sci_Set$.prototype.emptyInstance__sci_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
var $d_sci_Set$ = new $TypeData().initClass({
  sci_Set$: 0
}, false, "scala.collection.immutable.Set$", {
  sci_Set$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Set$.prototype.$classData = $d_sci_Set$;
var $n_sci_Set$ = (void 0);
function $m_sci_Set$() {
  if ((!$n_sci_Set$)) {
    $n_sci_Set$ = new $c_sci_Set$().init___()
  };
  return $n_sci_Set$
}
/** @constructor */
function $c_sci_VectorIterator() {
  $c_sc_AbstractIterator.call(this);
  this.endIndex$2 = 0;
  this.blockIndex$2 = 0;
  this.lo$2 = 0;
  this.endLo$2 = 0;
  this.$$undhasNext$2 = false;
  this.depth$2 = 0;
  this.display0$2 = null;
  this.display1$2 = null;
  this.display2$2 = null;
  this.display3$2 = null;
  this.display4$2 = null;
  this.display5$2 = null
}
$c_sci_VectorIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_VectorIterator.prototype.constructor = $c_sci_VectorIterator;
/** @constructor */
function $h_sci_VectorIterator() {
  /*<skip>*/
}
$h_sci_VectorIterator.prototype = $c_sci_VectorIterator.prototype;
$c_sci_VectorIterator.prototype.next__O = (function() {
  if ((!this.$$undhasNext$2)) {
    throw new $c_ju_NoSuchElementException().init___T("reached iterator end")
  };
  var res = this.display0$2.u[this.lo$2];
  this.lo$2 = ((1 + this.lo$2) | 0);
  if ((this.lo$2 === this.endLo$2)) {
    if ((((this.blockIndex$2 + this.lo$2) | 0) < this.endIndex$2)) {
      var newBlockIndex = ((32 + this.blockIndex$2) | 0);
      var xor = (this.blockIndex$2 ^ newBlockIndex);
      $s_sci_VectorPointer$class__gotoNextBlockStart__sci_VectorPointer__I__I__V(this, newBlockIndex, xor);
      this.blockIndex$2 = newBlockIndex;
      var x = ((this.endIndex$2 - this.blockIndex$2) | 0);
      this.endLo$2 = ((x < 32) ? x : 32);
      this.lo$2 = 0
    } else {
      this.$$undhasNext$2 = false
    }
  };
  return res
});
$c_sci_VectorIterator.prototype.display3__AO = (function() {
  return this.display3$2
});
$c_sci_VectorIterator.prototype.depth__I = (function() {
  return this.depth$2
});
$c_sci_VectorIterator.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$2 = x$1
});
$c_sci_VectorIterator.prototype.init___I__I = (function(_startIndex, endIndex) {
  this.endIndex$2 = endIndex;
  this.blockIndex$2 = ((-32) & _startIndex);
  this.lo$2 = (31 & _startIndex);
  var x = ((endIndex - this.blockIndex$2) | 0);
  this.endLo$2 = ((x < 32) ? x : 32);
  this.$$undhasNext$2 = (((this.blockIndex$2 + this.lo$2) | 0) < endIndex);
  return this
});
$c_sci_VectorIterator.prototype.display0__AO = (function() {
  return this.display0$2
});
$c_sci_VectorIterator.prototype.display4__AO = (function() {
  return this.display4$2
});
$c_sci_VectorIterator.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$2 = x$1
});
$c_sci_VectorIterator.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$2 = x$1
});
$c_sci_VectorIterator.prototype.hasNext__Z = (function() {
  return this.$$undhasNext$2
});
$c_sci_VectorIterator.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$2 = x$1
});
$c_sci_VectorIterator.prototype.display1__AO = (function() {
  return this.display1$2
});
$c_sci_VectorIterator.prototype.display5__AO = (function() {
  return this.display5$2
});
$c_sci_VectorIterator.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$2 = x$1
});
$c_sci_VectorIterator.prototype.display2__AO = (function() {
  return this.display2$2
});
$c_sci_VectorIterator.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$2 = x$1
});
$c_sci_VectorIterator.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$2 = x$1
});
var $d_sci_VectorIterator = new $TypeData().initClass({
  sci_VectorIterator: 0
}, false, "scala.collection.immutable.VectorIterator", {
  sci_VectorIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sci_VectorPointer: 1
});
$c_sci_VectorIterator.prototype.$classData = $d_sci_VectorIterator;
/** @constructor */
function $c_sjsr_UndefinedBehaviorError() {
  $c_jl_Error.call(this)
}
$c_sjsr_UndefinedBehaviorError.prototype = new $h_jl_Error();
$c_sjsr_UndefinedBehaviorError.prototype.constructor = $c_sjsr_UndefinedBehaviorError;
/** @constructor */
function $h_sjsr_UndefinedBehaviorError() {
  /*<skip>*/
}
$h_sjsr_UndefinedBehaviorError.prototype = $c_sjsr_UndefinedBehaviorError.prototype;
$c_sjsr_UndefinedBehaviorError.prototype.fillInStackTrace__jl_Throwable = (function() {
  return $c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
$c_sjsr_UndefinedBehaviorError.prototype.scala$util$control$NoStackTrace$$super$fillInStackTrace__jl_Throwable = (function() {
  return $c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
$c_sjsr_UndefinedBehaviorError.prototype.init___jl_Throwable = (function(cause) {
  $c_sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable.call(this, ("An undefined behavior was detected" + ((cause === null) ? "" : (": " + cause.getMessage__T()))), cause);
  return this
});
$c_sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable = (function(message, cause) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, message, cause);
  return this
});
var $d_sjsr_UndefinedBehaviorError = new $TypeData().initClass({
  sjsr_UndefinedBehaviorError: 0
}, false, "scala.scalajs.runtime.UndefinedBehaviorError", {
  sjsr_UndefinedBehaviorError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
$c_sjsr_UndefinedBehaviorError.prototype.$classData = $d_sjsr_UndefinedBehaviorError;
/** @constructor */
function $c_jl_JSConsoleBasedPrintStream() {
  $c_Ljava_io_PrintStream.call(this);
  this.isErr$4 = null;
  this.flushed$4 = false;
  this.buffer$4 = null
}
$c_jl_JSConsoleBasedPrintStream.prototype = new $h_Ljava_io_PrintStream();
$c_jl_JSConsoleBasedPrintStream.prototype.constructor = $c_jl_JSConsoleBasedPrintStream;
/** @constructor */
function $h_jl_JSConsoleBasedPrintStream() {
  /*<skip>*/
}
$h_jl_JSConsoleBasedPrintStream.prototype = $c_jl_JSConsoleBasedPrintStream.prototype;
$c_jl_JSConsoleBasedPrintStream.prototype.init___jl_Boolean = (function(isErr) {
  this.isErr$4 = isErr;
  var out = new $c_jl_JSConsoleBasedPrintStream$DummyOutputStream().init___();
  $c_Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream__Z__Ljava_nio_charset_Charset.call(this, out, false, null);
  this.flushed$4 = true;
  this.buffer$4 = "";
  return this
});
$c_jl_JSConsoleBasedPrintStream.prototype.java$lang$JSConsoleBasedPrintStream$$printString__T__V = (function(s) {
  var rest = s;
  while ((rest !== "")) {
    var thiz = rest;
    var nlPos = $uI(thiz.indexOf("\n"));
    if ((nlPos < 0)) {
      this.buffer$4 = (("" + this.buffer$4) + rest);
      this.flushed$4 = false;
      rest = ""
    } else {
      var jsx$1 = this.buffer$4;
      var thiz$1 = rest;
      this.doWriteLine__p4__T__V((("" + jsx$1) + $as_T(thiz$1.substring(0, nlPos))));
      this.buffer$4 = "";
      this.flushed$4 = true;
      var thiz$2 = rest;
      var beginIndex = ((1 + nlPos) | 0);
      rest = $as_T(thiz$2.substring(beginIndex))
    }
  }
});
$c_jl_JSConsoleBasedPrintStream.prototype.doWriteLine__p4__T__V = (function(line) {
  var x = $g.console;
  if ($uZ((!(!x)))) {
    var x$1 = this.isErr$4;
    if ($uZ(x$1)) {
      var x$2 = $g.console.error;
      var jsx$1 = $uZ((!(!x$2)))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      $g.console.error(line)
    } else {
      $g.console.log(line)
    }
  }
});
var $d_jl_JSConsoleBasedPrintStream = new $TypeData().initClass({
  jl_JSConsoleBasedPrintStream: 0
}, false, "java.lang.JSConsoleBasedPrintStream", {
  jl_JSConsoleBasedPrintStream: 1,
  Ljava_io_PrintStream: 1,
  Ljava_io_FilterOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  Ljava_io_Flushable: 1,
  jl_Appendable: 1
});
$c_jl_JSConsoleBasedPrintStream.prototype.$classData = $d_jl_JSConsoleBasedPrintStream;
/** @constructor */
function $c_sc_Seq$() {
  $c_scg_SeqFactory.call(this)
}
$c_sc_Seq$.prototype = new $h_scg_SeqFactory();
$c_sc_Seq$.prototype.constructor = $c_sc_Seq$;
/** @constructor */
function $h_sc_Seq$() {
  /*<skip>*/
}
$h_sc_Seq$.prototype = $c_sc_Seq$.prototype;
$c_sc_Seq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sc_Seq$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Seq$();
  return new $c_scm_ListBuffer().init___()
});
var $d_sc_Seq$ = new $TypeData().initClass({
  sc_Seq$: 0
}, false, "scala.collection.Seq$", {
  sc_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Seq$.prototype.$classData = $d_sc_Seq$;
var $n_sc_Seq$ = (void 0);
function $m_sc_Seq$() {
  if ((!$n_sc_Seq$)) {
    $n_sc_Seq$ = new $c_sc_Seq$().init___()
  };
  return $n_sc_Seq$
}
/** @constructor */
function $c_scg_IndexedSeqFactory() {
  $c_scg_SeqFactory.call(this)
}
$c_scg_IndexedSeqFactory.prototype = new $h_scg_SeqFactory();
$c_scg_IndexedSeqFactory.prototype.constructor = $c_scg_IndexedSeqFactory;
/** @constructor */
function $h_scg_IndexedSeqFactory() {
  /*<skip>*/
}
$h_scg_IndexedSeqFactory.prototype = $c_scg_IndexedSeqFactory.prototype;
/** @constructor */
function $c_sci_Seq$() {
  $c_scg_SeqFactory.call(this)
}
$c_sci_Seq$.prototype = new $h_scg_SeqFactory();
$c_sci_Seq$.prototype.constructor = $c_sci_Seq$;
/** @constructor */
function $h_sci_Seq$() {
  /*<skip>*/
}
$h_sci_Seq$.prototype = $c_sci_Seq$.prototype;
$c_sci_Seq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Seq$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_Seq$ = new $TypeData().initClass({
  sci_Seq$: 0
}, false, "scala.collection.immutable.Seq$", {
  sci_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Seq$.prototype.$classData = $d_sci_Seq$;
var $n_sci_Seq$ = (void 0);
function $m_sci_Seq$() {
  if ((!$n_sci_Seq$)) {
    $n_sci_Seq$ = new $c_sci_Seq$().init___()
  };
  return $n_sci_Seq$
}
/** @constructor */
function $c_scm_IndexedSeq$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_IndexedSeq$.prototype = new $h_scg_SeqFactory();
$c_scm_IndexedSeq$.prototype.constructor = $c_scm_IndexedSeq$;
/** @constructor */
function $h_scm_IndexedSeq$() {
  /*<skip>*/
}
$h_scm_IndexedSeq$.prototype = $c_scm_IndexedSeq$.prototype;
$c_scm_IndexedSeq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuffer().init___()
});
var $d_scm_IndexedSeq$ = new $TypeData().initClass({
  scm_IndexedSeq$: 0
}, false, "scala.collection.mutable.IndexedSeq$", {
  scm_IndexedSeq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_scm_IndexedSeq$.prototype.$classData = $d_scm_IndexedSeq$;
var $n_scm_IndexedSeq$ = (void 0);
function $m_scm_IndexedSeq$() {
  if ((!$n_scm_IndexedSeq$)) {
    $n_scm_IndexedSeq$ = new $c_scm_IndexedSeq$().init___()
  };
  return $n_scm_IndexedSeq$
}
/** @constructor */
function $c_sjs_js_WrappedArray$() {
  $c_scg_SeqFactory.call(this)
}
$c_sjs_js_WrappedArray$.prototype = new $h_scg_SeqFactory();
$c_sjs_js_WrappedArray$.prototype.constructor = $c_sjs_js_WrappedArray$;
/** @constructor */
function $h_sjs_js_WrappedArray$() {
  /*<skip>*/
}
$h_sjs_js_WrappedArray$.prototype = $c_sjs_js_WrappedArray$.prototype;
$c_sjs_js_WrappedArray$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sjs_js_WrappedArray$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sjs_js_WrappedArray().init___()
});
var $d_sjs_js_WrappedArray$ = new $TypeData().initClass({
  sjs_js_WrappedArray$: 0
}, false, "scala.scalajs.js.WrappedArray$", {
  sjs_js_WrappedArray$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sjs_js_WrappedArray$.prototype.$classData = $d_sjs_js_WrappedArray$;
var $n_sjs_js_WrappedArray$ = (void 0);
function $m_sjs_js_WrappedArray$() {
  if ((!$n_sjs_js_WrappedArray$)) {
    $n_sjs_js_WrappedArray$ = new $c_sjs_js_WrappedArray$().init___()
  };
  return $n_sjs_js_WrappedArray$
}
/** @constructor */
function $c_s_reflect_AnyValManifest() {
  $c_O.call(this);
  this.toString$1 = null
}
$c_s_reflect_AnyValManifest.prototype = new $h_O();
$c_s_reflect_AnyValManifest.prototype.constructor = $c_s_reflect_AnyValManifest;
/** @constructor */
function $h_s_reflect_AnyValManifest() {
  /*<skip>*/
}
$h_s_reflect_AnyValManifest.prototype = $c_s_reflect_AnyValManifest.prototype;
$c_s_reflect_AnyValManifest.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_s_reflect_AnyValManifest.prototype.toString__T = (function() {
  return this.toString$1
});
$c_s_reflect_AnyValManifest.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
/** @constructor */
function $c_s_reflect_ManifestFactory$ClassTypeManifest() {
  $c_O.call(this);
  this.prefix$1 = null;
  this.runtimeClass1$1 = null;
  this.typeArguments$1 = null
}
$c_s_reflect_ManifestFactory$ClassTypeManifest.prototype = new $h_O();
$c_s_reflect_ManifestFactory$ClassTypeManifest.prototype.constructor = $c_s_reflect_ManifestFactory$ClassTypeManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$ClassTypeManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ClassTypeManifest.prototype = $c_s_reflect_ManifestFactory$ClassTypeManifest.prototype;
/** @constructor */
function $c_sc_IndexedSeq$() {
  $c_scg_IndexedSeqFactory.call(this);
  this.ReusableCBF$6 = null
}
$c_sc_IndexedSeq$.prototype = new $h_scg_IndexedSeqFactory();
$c_sc_IndexedSeq$.prototype.constructor = $c_sc_IndexedSeq$;
/** @constructor */
function $h_sc_IndexedSeq$() {
  /*<skip>*/
}
$h_sc_IndexedSeq$.prototype = $c_sc_IndexedSeq$.prototype;
$c_sc_IndexedSeq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sc_IndexedSeq$ = this;
  this.ReusableCBF$6 = new $c_sc_IndexedSeq$$anon$1().init___();
  return this
});
$c_sc_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_IndexedSeq$();
  $m_sci_Vector$();
  return new $c_sci_VectorBuilder().init___()
});
var $d_sc_IndexedSeq$ = new $TypeData().initClass({
  sc_IndexedSeq$: 0
}, false, "scala.collection.IndexedSeq$", {
  sc_IndexedSeq$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_IndexedSeq$.prototype.$classData = $d_sc_IndexedSeq$;
var $n_sc_IndexedSeq$ = (void 0);
function $m_sc_IndexedSeq$() {
  if ((!$n_sc_IndexedSeq$)) {
    $n_sc_IndexedSeq$ = new $c_sc_IndexedSeq$().init___()
  };
  return $n_sc_IndexedSeq$
}
/** @constructor */
function $c_sc_IndexedSeqLike$Elements() {
  $c_sc_AbstractIterator.call(this);
  this.end$2 = 0;
  this.index$2 = 0;
  this.$$outer$f = null
}
$c_sc_IndexedSeqLike$Elements.prototype = new $h_sc_AbstractIterator();
$c_sc_IndexedSeqLike$Elements.prototype.constructor = $c_sc_IndexedSeqLike$Elements;
/** @constructor */
function $h_sc_IndexedSeqLike$Elements() {
  /*<skip>*/
}
$h_sc_IndexedSeqLike$Elements.prototype = $c_sc_IndexedSeqLike$Elements.prototype;
$c_sc_IndexedSeqLike$Elements.prototype.next__O = (function() {
  if ((this.index$2 >= this.end$2)) {
    $m_sc_Iterator$().empty$1.next__O()
  };
  var x = this.$$outer$f.apply__I__O(this.index$2);
  this.index$2 = ((1 + this.index$2) | 0);
  return x
});
$c_sc_IndexedSeqLike$Elements.prototype.init___sc_IndexedSeqLike__I__I = (function($$outer, start, end) {
  this.end$2 = end;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  this.index$2 = start;
  return this
});
$c_sc_IndexedSeqLike$Elements.prototype.hasNext__Z = (function() {
  return (this.index$2 < this.end$2)
});
var $d_sc_IndexedSeqLike$Elements = new $TypeData().initClass({
  sc_IndexedSeqLike$Elements: 0
}, false, "scala.collection.IndexedSeqLike$Elements", {
  sc_IndexedSeqLike$Elements: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_BufferedIterator: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sc_IndexedSeqLike$Elements.prototype.$classData = $d_sc_IndexedSeqLike$Elements;
/** @constructor */
function $c_sci_HashSet$() {
  $c_scg_ImmutableSetFactory.call(this)
}
$c_sci_HashSet$.prototype = new $h_scg_ImmutableSetFactory();
$c_sci_HashSet$.prototype.constructor = $c_sci_HashSet$;
/** @constructor */
function $h_sci_HashSet$() {
  /*<skip>*/
}
$h_sci_HashSet$.prototype = $c_sci_HashSet$.prototype;
$c_sci_HashSet$.prototype.init___ = (function() {
  return this
});
$c_sci_HashSet$.prototype.scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet = (function(hash0, elem0, hash1, elem1, level) {
  var index0 = (31 & ((hash0 >>> level) | 0));
  var index1 = (31 & ((hash1 >>> level) | 0));
  if ((index0 !== index1)) {
    var bitmap = ((1 << index0) | (1 << index1));
    var elems = $newArrayObject($d_sci_HashSet.getArrayOf(), [2]);
    if ((index0 < index1)) {
      elems.u[0] = elem0;
      elems.u[1] = elem1
    } else {
      elems.u[0] = elem1;
      elems.u[1] = elem0
    };
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmap, elems, ((elem0.size__I() + elem1.size__I()) | 0))
  } else {
    var elems$2 = $newArrayObject($d_sci_HashSet.getArrayOf(), [1]);
    var bitmap$2 = (1 << index0);
    var child = this.scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(hash0, elem0, hash1, elem1, ((5 + level) | 0));
    elems$2.u[0] = child;
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmap$2, elems$2, child.size0$5)
  }
});
$c_sci_HashSet$.prototype.emptyInstance__sci_Set = (function() {
  return $m_sci_HashSet$EmptyHashSet$()
});
var $d_sci_HashSet$ = new $TypeData().initClass({
  sci_HashSet$: 0
}, false, "scala.collection.immutable.HashSet$", {
  sci_HashSet$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$.prototype.$classData = $d_sci_HashSet$;
var $n_sci_HashSet$ = (void 0);
function $m_sci_HashSet$() {
  if ((!$n_sci_HashSet$)) {
    $n_sci_HashSet$ = new $c_sci_HashSet$().init___()
  };
  return $n_sci_HashSet$
}
/** @constructor */
function $c_sci_IndexedSeq$() {
  $c_scg_IndexedSeqFactory.call(this)
}
$c_sci_IndexedSeq$.prototype = new $h_scg_IndexedSeqFactory();
$c_sci_IndexedSeq$.prototype.constructor = $c_sci_IndexedSeq$;
/** @constructor */
function $h_sci_IndexedSeq$() {
  /*<skip>*/
}
$h_sci_IndexedSeq$.prototype = $c_sci_IndexedSeq$.prototype;
$c_sci_IndexedSeq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Vector$();
  return new $c_sci_VectorBuilder().init___()
});
var $d_sci_IndexedSeq$ = new $TypeData().initClass({
  sci_IndexedSeq$: 0
}, false, "scala.collection.immutable.IndexedSeq$", {
  sci_IndexedSeq$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_IndexedSeq$.prototype.$classData = $d_sci_IndexedSeq$;
var $n_sci_IndexedSeq$ = (void 0);
function $m_sci_IndexedSeq$() {
  if ((!$n_sci_IndexedSeq$)) {
    $n_sci_IndexedSeq$ = new $c_sci_IndexedSeq$().init___()
  };
  return $n_sci_IndexedSeq$
}
/** @constructor */
function $c_sci_ListSet$() {
  $c_scg_ImmutableSetFactory.call(this)
}
$c_sci_ListSet$.prototype = new $h_scg_ImmutableSetFactory();
$c_sci_ListSet$.prototype.constructor = $c_sci_ListSet$;
/** @constructor */
function $h_sci_ListSet$() {
  /*<skip>*/
}
$h_sci_ListSet$.prototype = $c_sci_ListSet$.prototype;
$c_sci_ListSet$.prototype.init___ = (function() {
  return this
});
$c_sci_ListSet$.prototype.emptyInstance__sci_Set = (function() {
  return $m_sci_ListSet$EmptyListSet$()
});
$c_sci_ListSet$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sci_ListSet$ListSetBuilder().init___()
});
var $d_sci_ListSet$ = new $TypeData().initClass({
  sci_ListSet$: 0
}, false, "scala.collection.immutable.ListSet$", {
  sci_ListSet$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$.prototype.$classData = $d_sci_ListSet$;
var $n_sci_ListSet$ = (void 0);
function $m_sci_ListSet$() {
  if ((!$n_sci_ListSet$)) {
    $n_sci_ListSet$ = new $c_sci_ListSet$().init___()
  };
  return $n_sci_ListSet$
}
/** @constructor */
function $c_scm_HashSet$() {
  $c_scg_MutableSetFactory.call(this)
}
$c_scm_HashSet$.prototype = new $h_scg_MutableSetFactory();
$c_scm_HashSet$.prototype.constructor = $c_scm_HashSet$;
/** @constructor */
function $h_scm_HashSet$() {
  /*<skip>*/
}
$h_scm_HashSet$.prototype = $c_scm_HashSet$.prototype;
$c_scm_HashSet$.prototype.init___ = (function() {
  return this
});
$c_scm_HashSet$.prototype.empty__sc_GenTraversable = (function() {
  return new $c_scm_HashSet().init___()
});
var $d_scm_HashSet$ = new $TypeData().initClass({
  scm_HashSet$: 0
}, false, "scala.collection.mutable.HashSet$", {
  scm_HashSet$: 1,
  scg_MutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_HashSet$.prototype.$classData = $d_scm_HashSet$;
var $n_scm_HashSet$ = (void 0);
function $m_scm_HashSet$() {
  if ((!$n_scm_HashSet$)) {
    $n_scm_HashSet$ = new $c_scm_HashSet$().init___()
  };
  return $n_scm_HashSet$
}
/** @constructor */
function $c_sjs_js_JavaScriptException() {
  $c_jl_RuntimeException.call(this);
  this.exception$4 = null
}
$c_sjs_js_JavaScriptException.prototype = new $h_jl_RuntimeException();
$c_sjs_js_JavaScriptException.prototype.constructor = $c_sjs_js_JavaScriptException;
/** @constructor */
function $h_sjs_js_JavaScriptException() {
  /*<skip>*/
}
$h_sjs_js_JavaScriptException.prototype = $c_sjs_js_JavaScriptException.prototype;
$c_sjs_js_JavaScriptException.prototype.productPrefix__T = (function() {
  return "JavaScriptException"
});
$c_sjs_js_JavaScriptException.prototype.productArity__I = (function() {
  return 1
});
$c_sjs_js_JavaScriptException.prototype.fillInStackTrace__jl_Throwable = (function() {
  var e = this.exception$4;
  this.stackdata = e;
  return this
});
$c_sjs_js_JavaScriptException.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_sjs_js_JavaScriptException(x$1)) {
    var JavaScriptException$1 = $as_sjs_js_JavaScriptException(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.exception$4, JavaScriptException$1.exception$4)
  } else {
    return false
  }
});
$c_sjs_js_JavaScriptException.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.exception$4;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_sjs_js_JavaScriptException.prototype.toString__T = (function() {
  return $objectToString(this.exception$4)
});
$c_sjs_js_JavaScriptException.prototype.init___O = (function(exception) {
  this.exception$4 = exception;
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_sjs_js_JavaScriptException.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_sjs_js_JavaScriptException.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_sjs_js_JavaScriptException(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_JavaScriptException)))
}
function $as_sjs_js_JavaScriptException(obj) {
  return (($is_sjs_js_JavaScriptException(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.js.JavaScriptException"))
}
function $isArrayOf_sjs_js_JavaScriptException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_JavaScriptException)))
}
function $asArrayOf_sjs_js_JavaScriptException(obj, depth) {
  return (($isArrayOf_sjs_js_JavaScriptException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.js.JavaScriptException;", depth))
}
var $d_sjs_js_JavaScriptException = new $TypeData().initClass({
  sjs_js_JavaScriptException: 0
}, false, "scala.scalajs.js.JavaScriptException", {
  sjs_js_JavaScriptException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1
});
$c_sjs_js_JavaScriptException.prototype.$classData = $d_sjs_js_JavaScriptException;
/** @constructor */
function $c_LThreeJSApp() {
  $c_O.call(this);
  this.circles$1 = null;
  this.permutation$1 = null;
  this.p$1 = null;
  this.defaultLineMaterial$1 = null;
  this.defaultMeshMaterial$1 = null;
  this.planeGeometry$1 = null;
  this.circleGeometries$1 = null;
  this.boxGeometry$1 = null;
  this.sphereGeometries$1 = null;
  this.pMaterial$1 = null;
  this.white$1 = 0;
  this.black$1 = 0;
  this.red$1 = 0;
  this.green$1 = 0;
  this.blue$1 = 0;
  this.blueSaddness$1 = null;
  this.pop$1 = null;
  this.giantGoldfish$1 = null;
  this.sugar01$1 = null;
  this.thoughtProvoking$1 = null;
  this.adriftInDreams$1 = null;
  this.cheerUpEmoKid$1 = null;
  this.letThemEatCake$1 = null;
  this.mellonBallSurprise$1 = null;
  this.oceanFive$1 = null;
  this.iDemandPancake$1 = null;
  this.PI$1 = 0.0;
  this.TWO$undPI$1 = 0.0;
  this.HALF$undPI$1 = 0.0;
  this.QUARTER$undPI$1 = 0.0;
  this.main$lib$MathUtils$$randomGen$1 = null;
  this.precision$1 = 0;
  this.fSinArr$1 = null;
  this.fCosArr$1 = null;
  this.fTanArr$1 = null;
  this.fASinArr$1 = null;
  this.fACosArr$1 = null;
  this.fATanArr$1 = null;
  this.fpSinArr$1 = null;
  this.fpCosArr$1 = null;
  this.canvasData$1 = null;
  this.meshMaterial$1 = null;
  this.scene$1 = null;
  this.camera$1 = null;
  this.renderer$1 = null;
  this.clock$1 = null;
  this.body$1 = null;
  this.composer$1 = null;
  this.faceSide$1 = null;
  this.$$undcenter$1 = null;
  this.leftBottomPosition$1 = null;
  this.position$1 = null;
  this.renderAction$1 = null;
  this.clearObjectsAction$1 = null;
  this.canvasStyle$1 = false;
  this.withStatsRender$1 = false;
  this.withControlsRender$1 = false;
  this.stats$1 = null;
  this.controls$1 = null;
  this.delta$1 = 0.0;
  this.frameCount$1 = $m_sjsr_RuntimeLong$().Zero__sjsr_RuntimeLong();
  this.mouseX$1 = 0.0;
  this.mouseY$1 = 0.0;
  this.minFrameRate$1 = 0;
  this.times$1 = 0;
  this.capturer$1 = null;
  this.aaa$1 = false;
  this.xAxis$1 = null;
  this.yAxis$1 = null;
  this.zAxis$1 = null;
  this.worldCoordinates$1 = null;
  this.ColorToLineMaterial$module$1 = null;
  this.LineBasicMaterialToLineMaterial$module$1 = null;
  this.LineDashedMaterialToLineMaterial$module$1 = null;
  this.ColorToMeshMaterial$module$1 = null;
  this.MeshBasicMaterialToLineMaterial$module$1 = null;
  this.MeshLambertMaterialToLineMaterial$module$1 = null;
  this.MeshPhongMaterialToLineMaterial$module$1 = null;
  this.RectMode$module$1 = null;
  this.bitmap$0$1 = 0;
  this.Setup$module$1 = null;
  this.CenterCoordiantes$module$1 = null;
  this.LeftBottomCoordiantes$module$1 = null
}
$c_LThreeJSApp.prototype = new $h_O();
$c_LThreeJSApp.prototype.constructor = $c_LThreeJSApp;
/** @constructor */
function $h_LThreeJSApp() {
  /*<skip>*/
}
$h_LThreeJSApp.prototype = $c_LThreeJSApp.prototype;
$c_LThreeJSApp.prototype.init___ = (function() {
  $s_Lmain_lib_WorldCoordinates$class__$$init$__Lmain_lib_WorldCoordinates__V(this);
  $s_Lmain_lib_Canvas$class__$$init$__Lmain_lib_Canvas__V(this);
  $s_Lmain_lib_BasicCanvas$class__$$init$__Lmain_lib_BasicCanvas__V(this);
  $s_Lmain_lib_MathUtils$class__$$init$__Lmain_lib_MathUtils__V(this);
  $s_Lmain_lib_PaletteT$class__$$init$__Lmain_lib_PaletteT__V(this);
  $s_Lmain_lib_DrawingUtils$class__$$init$__Lmain_lib_DrawingUtils__V(this);
  $s_Lmain_lib_PerlinNoise$class__$$init$__Lmain_lib_PerlinNoise__V(this);
  this.Setup__Lmain_lib_Canvas$Setup$().$$und2D__Lmain_lib_Canvas$Setup$().LeftBottom__Lmain_lib_Canvas$Setup$().asCanvas__Lmain_lib_Canvas$Setup$().noClear__Lmain_lib_Canvas$Setup$().withStats__Lmain_lib_Canvas$Setup$().antialiasing__Lmain_lib_Canvas$Setup$();
  var this$1 = this.RectMode__Lmain_lib_DrawingUtils$RectMode$();
  this$1.rectMode$1 = this$1.$$undleftBottomMode$1;
  $m_sci_IndexedSeq$();
  $m_sc_IndexedSeq$();
  $m_sci_IndexedSeq$();
  $m_sci_Vector$();
  var b$1 = new $c_sci_VectorBuilder().init___();
  var i = 0;
  var count = 0;
  while ((i !== 1001)) {
    var arg1 = i;
    var pos = $s_Lmain_lib_DrawingUtils$class__random2D__Lmain_lib_DrawingUtils__Lmain_lib_Vector3(this);
    var radius = $s_Lmain_lib_MathUtils$class__rand__Lmain_lib_MathUtils__D__D__D(this, 2.0, 6.0);
    var material = this.blueSaddness$1.getRandom__Lmain_lib_Color();
    var meshMaterialTypeClass = this.ColorToMeshMaterial__Lmain_lib_DrawingUtils$ColorToMeshMaterial$();
    var elem = $s_Lmain_lib_DrawingUtils$class__circle__Lmain_lib_DrawingUtils__Lmain_lib_Vector3__D__O__Lmain_lib_DrawingUtils$MeshMaterialTypeClass__Lmain_lib_Mesh(this, pos, radius, material, meshMaterialTypeClass);
    b$1.$$plus$eq__O__sci_VectorBuilder(elem);
    count = ((1 + count) | 0);
    i = ((1 + i) | 0)
  };
  this.circles$1 = b$1.result__sci_Vector();
  return this
});
$c_LThreeJSApp.prototype.main$lib$MathUtils$$undsetter$und$main$lib$MathUtils$$randomGen$und$eq__s_util_Random__V = (function(x$1) {
  this.main$lib$MathUtils$$randomGen$1 = x$1
});
$c_LThreeJSApp.prototype.main$lib$MathUtils$$undsetter$und$PI$und$eq__D__V = (function(x$1) {
  this.PI$1 = x$1
});
$c_LThreeJSApp.prototype.main$lib$MathUtils$$undsetter$und$TWO$undPI$und$eq__D__V = (function(x$1) {
  this.TWO$undPI$1 = x$1
});
$c_LThreeJSApp.prototype.CenterCoordiantes$lzycompute__p1__Lmain_lib_WorldCoordinates$CenterCoordiantes$ = (function() {
  if ((this.CenterCoordiantes$module$1 === null)) {
    this.CenterCoordiantes$module$1 = new $c_Lmain_lib_WorldCoordinates$CenterCoordiantes$().init___Lmain_lib_WorldCoordinates(this)
  };
  return this.CenterCoordiantes$module$1
});
$c_LThreeJSApp.prototype.LeftBottomCoordiantes$lzycompute__p1__Lmain_lib_WorldCoordinates$LeftBottomCoordiantes$ = (function() {
  if ((this.LeftBottomCoordiantes$module$1 === null)) {
    this.LeftBottomCoordiantes$module$1 = new $c_Lmain_lib_WorldCoordinates$LeftBottomCoordiantes$().init___Lmain_lib_WorldCoordinates(this)
  };
  return this.LeftBottomCoordiantes$module$1
});
$c_LThreeJSApp.prototype.RectMode__Lmain_lib_DrawingUtils$RectMode$ = (function() {
  return ((this.RectMode$module$1 === null) ? this.RectMode$lzycompute__p1__Lmain_lib_DrawingUtils$RectMode$() : this.RectMode$module$1)
});
$c_LThreeJSApp.prototype.main$lib$MathUtils$$undsetter$und$precision$und$eq__I__V = (function(x$1) {
  this.precision$1 = x$1
});
$c_LThreeJSApp.prototype.PI__D = (function() {
  return this.PI$1
});
$c_LThreeJSApp.prototype.ColorToMeshMaterial$lzycompute__p1__Lmain_lib_DrawingUtils$ColorToMeshMaterial$ = (function() {
  if ((this.ColorToMeshMaterial$module$1 === null)) {
    this.ColorToMeshMaterial$module$1 = new $c_Lmain_lib_DrawingUtils$ColorToMeshMaterial$().init___Lmain_lib_DrawingUtils(this)
  };
  return this.ColorToMeshMaterial$module$1
});
$c_LThreeJSApp.prototype.main$lib$MathUtils$$undsetter$und$QUARTER$undPI$und$eq__D__V = (function(x$1) {
  this.QUARTER$undPI$1 = x$1
});
$c_LThreeJSApp.prototype.main$lib$MathUtils$$randomGen__s_util_Random = (function() {
  return this.main$lib$MathUtils$$randomGen$1
});
$c_LThreeJSApp.prototype.CenterCoordiantes__Lmain_lib_WorldCoordinates$CenterCoordiantes$ = (function() {
  return ((this.CenterCoordiantes$module$1 === null) ? this.CenterCoordiantes$lzycompute__p1__Lmain_lib_WorldCoordinates$CenterCoordiantes$() : this.CenterCoordiantes$module$1)
});
$c_LThreeJSApp.prototype.Setup$lzycompute__p1__Lmain_lib_Canvas$Setup$ = (function() {
  if ((this.Setup$module$1 === null)) {
    this.Setup$module$1 = new $c_Lmain_lib_Canvas$Setup$().init___Lmain_lib_Canvas(this)
  };
  return this.Setup$module$1
});
$c_LThreeJSApp.prototype.LeftBottomCoordiantes__Lmain_lib_WorldCoordinates$LeftBottomCoordiantes$ = (function() {
  return ((this.LeftBottomCoordiantes$module$1 === null) ? this.LeftBottomCoordiantes$lzycompute__p1__Lmain_lib_WorldCoordinates$LeftBottomCoordiantes$() : this.LeftBottomCoordiantes$module$1)
});
$c_LThreeJSApp.prototype.render__V = (function() {
  var num = (0.01 * this.frameCount$1.toDouble__D());
  var value = $uD($g.Math.sin(num));
  var mult = $s_Lmain_lib_MathUtils$class__map__Lmain_lib_MathUtils__D__D__D__D__D__D(this, value, (-1.0), 1.0, 1.0E-5, 0.01);
  this.circles$1.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(arg$outer, mult$1) {
    return (function(c$2) {
      var pos = c$2.position;
      var x = ($uD(pos.x) * mult$1);
      var y = ($uD(pos.y) * mult$1);
      var z = (0.01 * arg$outer.frameCount$1.toDouble__D());
      var _1$mcD$sp = $s_Lmain_lib_PerlinNoise$class__noise__Lmain_lib_PerlinNoise__D__D__D__D(arg$outer, x, y, z);
      var _2$mcD$sp = (-$s_Lmain_lib_MathUtils$class__rand__Lmain_lib_MathUtils__D__D(arg$outer, 1.0));
      pos.add(new $g.THREE.Vector3(_1$mcD$sp, _2$mcD$sp, 0.0));
      if (($uD(pos.x) < 0)) {
        var _1 = $s_Lmain_lib_WorldCoordinates$class__width__Lmain_lib_WorldCoordinates__I(arg$outer);
        pos.add(new $g.THREE.Vector3(_1, 0, 0))
      };
      if (($uD(pos.x) > $s_Lmain_lib_WorldCoordinates$class__width__Lmain_lib_WorldCoordinates__I(arg$outer))) {
        var _1$1 = ((-$s_Lmain_lib_WorldCoordinates$class__width__Lmain_lib_WorldCoordinates__I(arg$outer)) | 0);
        pos.add(new $g.THREE.Vector3(_1$1, 0, 0))
      };
      if (($uD(pos.y) < 0)) {
        var _2 = $s_Lmain_lib_WorldCoordinates$class__height__Lmain_lib_WorldCoordinates__I(arg$outer);
        pos.add(new $g.THREE.Vector3(0, _2, 0))
      };
      if (($uD(pos.y) > $s_Lmain_lib_WorldCoordinates$class__height__Lmain_lib_WorldCoordinates__I(arg$outer))) {
        var _2$1 = ((-$s_Lmain_lib_WorldCoordinates$class__height__Lmain_lib_WorldCoordinates__I(arg$outer)) | 0);
        return pos.add(new $g.THREE.Vector3(0, _2$1, 0))
      } else {
        return (void 0)
      }
    })
  })(this, mult)))
});
$c_LThreeJSApp.prototype.ColorToMeshMaterial__Lmain_lib_DrawingUtils$ColorToMeshMaterial$ = (function() {
  return ((this.ColorToMeshMaterial$module$1 === null) ? this.ColorToMeshMaterial$lzycompute__p1__Lmain_lib_DrawingUtils$ColorToMeshMaterial$() : this.ColorToMeshMaterial$module$1)
});
$c_LThreeJSApp.prototype.main$lib$MathUtils$$undsetter$und$HALF$undPI$und$eq__D__V = (function(x$1) {
  this.HALF$undPI$1 = x$1
});
$c_LThreeJSApp.prototype.Setup__Lmain_lib_Canvas$Setup$ = (function() {
  return ((this.Setup$module$1 === null) ? this.Setup$lzycompute__p1__Lmain_lib_Canvas$Setup$() : this.Setup$module$1)
});
$c_LThreeJSApp.prototype.RectMode$lzycompute__p1__Lmain_lib_DrawingUtils$RectMode$ = (function() {
  if ((this.RectMode$module$1 === null)) {
    this.RectMode$module$1 = new $c_Lmain_lib_DrawingUtils$RectMode$().init___Lmain_lib_DrawingUtils(this)
  };
  return this.RectMode$module$1
});
var $d_LThreeJSApp = new $TypeData().initClass({
  LThreeJSApp: 0
}, false, "ThreeJSApp", {
  LThreeJSApp: 1,
  O: 1,
  Lmain_lib_BasicCanvas: 1,
  Lmain_lib_Canvas: 1,
  Lmain_lib_WorldCoordinates: 1,
  Lmain_lib_DrawingUtils: 1,
  Lmain_lib_MathUtils: 1,
  Lmain_lib_Converters: 1,
  Lmain_lib_PaletteT: 1,
  Lmain_lib_PerlinNoise: 1
});
$c_LThreeJSApp.prototype.$classData = $d_LThreeJSApp;
/** @constructor */
$e.ThreeJSApp = (function() {
  var $thiz = new $c_LThreeJSApp();
  $c_LThreeJSApp.prototype.init___.call($thiz);
  return $thiz
});
$e.ThreeJSApp.prototype = $c_LThreeJSApp.prototype;
/** @constructor */
function $c_s_reflect_ManifestFactory$BooleanManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$BooleanManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$BooleanManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$BooleanManifest$.prototype = $c_s_reflect_ManifestFactory$BooleanManifest$.prototype;
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.init___ = (function() {
  this.toString$1 = "Boolean";
  return this
});
var $d_s_reflect_ManifestFactory$BooleanManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$BooleanManifest$: 0
}, false, "scala.reflect.ManifestFactory$BooleanManifest$", {
  s_reflect_ManifestFactory$BooleanManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$BooleanManifest$;
var $n_s_reflect_ManifestFactory$BooleanManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$BooleanManifest$() {
  if ((!$n_s_reflect_ManifestFactory$BooleanManifest$)) {
    $n_s_reflect_ManifestFactory$BooleanManifest$ = new $c_s_reflect_ManifestFactory$BooleanManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$BooleanManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$ByteManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$ByteManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$ByteManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$ByteManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ByteManifest$.prototype = $c_s_reflect_ManifestFactory$ByteManifest$.prototype;
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.init___ = (function() {
  this.toString$1 = "Byte";
  return this
});
var $d_s_reflect_ManifestFactory$ByteManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ByteManifest$: 0
}, false, "scala.reflect.ManifestFactory$ByteManifest$", {
  s_reflect_ManifestFactory$ByteManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ByteManifest$;
var $n_s_reflect_ManifestFactory$ByteManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$ByteManifest$() {
  if ((!$n_s_reflect_ManifestFactory$ByteManifest$)) {
    $n_s_reflect_ManifestFactory$ByteManifest$ = new $c_s_reflect_ManifestFactory$ByteManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ByteManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$CharManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$CharManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$CharManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$CharManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$CharManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$CharManifest$.prototype = $c_s_reflect_ManifestFactory$CharManifest$.prototype;
$c_s_reflect_ManifestFactory$CharManifest$.prototype.init___ = (function() {
  this.toString$1 = "Char";
  return this
});
var $d_s_reflect_ManifestFactory$CharManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$CharManifest$: 0
}, false, "scala.reflect.ManifestFactory$CharManifest$", {
  s_reflect_ManifestFactory$CharManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$CharManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$CharManifest$;
var $n_s_reflect_ManifestFactory$CharManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$CharManifest$() {
  if ((!$n_s_reflect_ManifestFactory$CharManifest$)) {
    $n_s_reflect_ManifestFactory$CharManifest$ = new $c_s_reflect_ManifestFactory$CharManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$CharManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$DoubleManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$DoubleManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$DoubleManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$DoubleManifest$.prototype = $c_s_reflect_ManifestFactory$DoubleManifest$.prototype;
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.init___ = (function() {
  this.toString$1 = "Double";
  return this
});
var $d_s_reflect_ManifestFactory$DoubleManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$DoubleManifest$: 0
}, false, "scala.reflect.ManifestFactory$DoubleManifest$", {
  s_reflect_ManifestFactory$DoubleManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$DoubleManifest$;
var $n_s_reflect_ManifestFactory$DoubleManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$DoubleManifest$() {
  if ((!$n_s_reflect_ManifestFactory$DoubleManifest$)) {
    $n_s_reflect_ManifestFactory$DoubleManifest$ = new $c_s_reflect_ManifestFactory$DoubleManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$DoubleManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$FloatManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$FloatManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$FloatManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$FloatManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$FloatManifest$.prototype = $c_s_reflect_ManifestFactory$FloatManifest$.prototype;
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.init___ = (function() {
  this.toString$1 = "Float";
  return this
});
var $d_s_reflect_ManifestFactory$FloatManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$FloatManifest$: 0
}, false, "scala.reflect.ManifestFactory$FloatManifest$", {
  s_reflect_ManifestFactory$FloatManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$FloatManifest$;
var $n_s_reflect_ManifestFactory$FloatManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$FloatManifest$() {
  if ((!$n_s_reflect_ManifestFactory$FloatManifest$)) {
    $n_s_reflect_ManifestFactory$FloatManifest$ = new $c_s_reflect_ManifestFactory$FloatManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$FloatManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$IntManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$IntManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$IntManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$IntManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$IntManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$IntManifest$.prototype = $c_s_reflect_ManifestFactory$IntManifest$.prototype;
$c_s_reflect_ManifestFactory$IntManifest$.prototype.init___ = (function() {
  this.toString$1 = "Int";
  return this
});
var $d_s_reflect_ManifestFactory$IntManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$IntManifest$: 0
}, false, "scala.reflect.ManifestFactory$IntManifest$", {
  s_reflect_ManifestFactory$IntManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$IntManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$IntManifest$;
var $n_s_reflect_ManifestFactory$IntManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$IntManifest$() {
  if ((!$n_s_reflect_ManifestFactory$IntManifest$)) {
    $n_s_reflect_ManifestFactory$IntManifest$ = new $c_s_reflect_ManifestFactory$IntManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$IntManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$LongManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$LongManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$LongManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$LongManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$LongManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$LongManifest$.prototype = $c_s_reflect_ManifestFactory$LongManifest$.prototype;
$c_s_reflect_ManifestFactory$LongManifest$.prototype.init___ = (function() {
  this.toString$1 = "Long";
  return this
});
var $d_s_reflect_ManifestFactory$LongManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$LongManifest$: 0
}, false, "scala.reflect.ManifestFactory$LongManifest$", {
  s_reflect_ManifestFactory$LongManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$LongManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$LongManifest$;
var $n_s_reflect_ManifestFactory$LongManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$LongManifest$() {
  if ((!$n_s_reflect_ManifestFactory$LongManifest$)) {
    $n_s_reflect_ManifestFactory$LongManifest$ = new $c_s_reflect_ManifestFactory$LongManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$LongManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$PhantomManifest() {
  $c_s_reflect_ManifestFactory$ClassTypeManifest.call(this);
  this.toString$2 = null
}
$c_s_reflect_ManifestFactory$PhantomManifest.prototype = new $h_s_reflect_ManifestFactory$ClassTypeManifest();
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.constructor = $c_s_reflect_ManifestFactory$PhantomManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$PhantomManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$PhantomManifest.prototype = $c_s_reflect_ManifestFactory$PhantomManifest.prototype;
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.toString__T = (function() {
  return this.toString$2
});
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
/** @constructor */
function $c_s_reflect_ManifestFactory$ShortManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$ShortManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$ShortManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$ShortManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ShortManifest$.prototype = $c_s_reflect_ManifestFactory$ShortManifest$.prototype;
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.init___ = (function() {
  this.toString$1 = "Short";
  return this
});
var $d_s_reflect_ManifestFactory$ShortManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ShortManifest$: 0
}, false, "scala.reflect.ManifestFactory$ShortManifest$", {
  s_reflect_ManifestFactory$ShortManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ShortManifest$;
var $n_s_reflect_ManifestFactory$ShortManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$ShortManifest$() {
  if ((!$n_s_reflect_ManifestFactory$ShortManifest$)) {
    $n_s_reflect_ManifestFactory$ShortManifest$ = new $c_s_reflect_ManifestFactory$ShortManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ShortManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$UnitManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$UnitManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$UnitManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$UnitManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$UnitManifest$.prototype = $c_s_reflect_ManifestFactory$UnitManifest$.prototype;
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.init___ = (function() {
  this.toString$1 = "Unit";
  return this
});
var $d_s_reflect_ManifestFactory$UnitManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$UnitManifest$: 0
}, false, "scala.reflect.ManifestFactory$UnitManifest$", {
  s_reflect_ManifestFactory$UnitManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$UnitManifest$;
var $n_s_reflect_ManifestFactory$UnitManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$UnitManifest$() {
  if ((!$n_s_reflect_ManifestFactory$UnitManifest$)) {
    $n_s_reflect_ManifestFactory$UnitManifest$ = new $c_s_reflect_ManifestFactory$UnitManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$UnitManifest$
}
/** @constructor */
function $c_sci_List$() {
  $c_scg_SeqFactory.call(this);
  this.partialNotApplied$5 = null
}
$c_sci_List$.prototype = new $h_scg_SeqFactory();
$c_sci_List$.prototype.constructor = $c_sci_List$;
/** @constructor */
function $h_sci_List$() {
  /*<skip>*/
}
$h_sci_List$.prototype = $c_sci_List$.prototype;
$c_sci_List$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sci_List$ = this;
  this.partialNotApplied$5 = new $c_sci_List$$anon$1().init___();
  return this
});
$c_sci_List$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_List$ = new $TypeData().initClass({
  sci_List$: 0
}, false, "scala.collection.immutable.List$", {
  sci_List$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_List$.prototype.$classData = $d_sci_List$;
var $n_sci_List$ = (void 0);
function $m_sci_List$() {
  if ((!$n_sci_List$)) {
    $n_sci_List$ = new $c_sci_List$().init___()
  };
  return $n_sci_List$
}
/** @constructor */
function $c_sci_Stream$() {
  $c_scg_SeqFactory.call(this)
}
$c_sci_Stream$.prototype = new $h_scg_SeqFactory();
$c_sci_Stream$.prototype.constructor = $c_sci_Stream$;
/** @constructor */
function $h_sci_Stream$() {
  /*<skip>*/
}
$h_sci_Stream$.prototype = $c_sci_Stream$.prototype;
$c_sci_Stream$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Stream$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sci_Stream$StreamBuilder().init___()
});
var $d_sci_Stream$ = new $TypeData().initClass({
  sci_Stream$: 0
}, false, "scala.collection.immutable.Stream$", {
  sci_Stream$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$.prototype.$classData = $d_sci_Stream$;
var $n_sci_Stream$ = (void 0);
function $m_sci_Stream$() {
  if ((!$n_sci_Stream$)) {
    $n_sci_Stream$ = new $c_sci_Stream$().init___()
  };
  return $n_sci_Stream$
}
/** @constructor */
function $c_scm_ArrayBuffer$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_ArrayBuffer$.prototype = new $h_scg_SeqFactory();
$c_scm_ArrayBuffer$.prototype.constructor = $c_scm_ArrayBuffer$;
/** @constructor */
function $h_scm_ArrayBuffer$() {
  /*<skip>*/
}
$h_scm_ArrayBuffer$.prototype = $c_scm_ArrayBuffer$.prototype;
$c_scm_ArrayBuffer$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_ArrayBuffer$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuffer().init___()
});
var $d_scm_ArrayBuffer$ = new $TypeData().initClass({
  scm_ArrayBuffer$: 0
}, false, "scala.collection.mutable.ArrayBuffer$", {
  scm_ArrayBuffer$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuffer$.prototype.$classData = $d_scm_ArrayBuffer$;
var $n_scm_ArrayBuffer$ = (void 0);
function $m_scm_ArrayBuffer$() {
  if ((!$n_scm_ArrayBuffer$)) {
    $n_scm_ArrayBuffer$ = new $c_scm_ArrayBuffer$().init___()
  };
  return $n_scm_ArrayBuffer$
}
/** @constructor */
function $c_scm_ListBuffer$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_ListBuffer$.prototype = new $h_scg_SeqFactory();
$c_scm_ListBuffer$.prototype.constructor = $c_scm_ListBuffer$;
/** @constructor */
function $h_scm_ListBuffer$() {
  /*<skip>*/
}
$h_scm_ListBuffer$.prototype = $c_scm_ListBuffer$.prototype;
$c_scm_ListBuffer$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_ListBuffer$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_GrowingBuilder().init___scg_Growable(new $c_scm_ListBuffer().init___())
});
var $d_scm_ListBuffer$ = new $TypeData().initClass({
  scm_ListBuffer$: 0
}, false, "scala.collection.mutable.ListBuffer$", {
  scm_ListBuffer$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ListBuffer$.prototype.$classData = $d_scm_ListBuffer$;
var $n_scm_ListBuffer$ = (void 0);
function $m_scm_ListBuffer$() {
  if ((!$n_scm_ListBuffer$)) {
    $n_scm_ListBuffer$ = new $c_scm_ListBuffer$().init___()
  };
  return $n_scm_ListBuffer$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$AnyManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$AnyManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$AnyManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$AnyManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$AnyManifest$.prototype = $c_s_reflect_ManifestFactory$AnyManifest$.prototype;
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.init___ = (function() {
  this.toString$2 = "Any";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_O.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
var $d_s_reflect_ManifestFactory$AnyManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$AnyManifest$: 0
}, false, "scala.reflect.ManifestFactory$AnyManifest$", {
  s_reflect_ManifestFactory$AnyManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$AnyManifest$;
var $n_s_reflect_ManifestFactory$AnyManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$AnyManifest$() {
  if ((!$n_s_reflect_ManifestFactory$AnyManifest$)) {
    $n_s_reflect_ManifestFactory$AnyManifest$ = new $c_s_reflect_ManifestFactory$AnyManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$AnyManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$AnyValManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$AnyValManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$AnyValManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$AnyValManifest$.prototype = $c_s_reflect_ManifestFactory$AnyValManifest$.prototype;
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.init___ = (function() {
  this.toString$2 = "AnyVal";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_O.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
var $d_s_reflect_ManifestFactory$AnyValManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$AnyValManifest$: 0
}, false, "scala.reflect.ManifestFactory$AnyValManifest$", {
  s_reflect_ManifestFactory$AnyValManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$AnyValManifest$;
var $n_s_reflect_ManifestFactory$AnyValManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$AnyValManifest$() {
  if ((!$n_s_reflect_ManifestFactory$AnyValManifest$)) {
    $n_s_reflect_ManifestFactory$AnyValManifest$ = new $c_s_reflect_ManifestFactory$AnyValManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$AnyValManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$NothingManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$NothingManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$NothingManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$NothingManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$NothingManifest$.prototype = $c_s_reflect_ManifestFactory$NothingManifest$.prototype;
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.init___ = (function() {
  this.toString$2 = "Nothing";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_sr_Nothing$.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
var $d_s_reflect_ManifestFactory$NothingManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$NothingManifest$: 0
}, false, "scala.reflect.ManifestFactory$NothingManifest$", {
  s_reflect_ManifestFactory$NothingManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$NothingManifest$;
var $n_s_reflect_ManifestFactory$NothingManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$NothingManifest$() {
  if ((!$n_s_reflect_ManifestFactory$NothingManifest$)) {
    $n_s_reflect_ManifestFactory$NothingManifest$ = new $c_s_reflect_ManifestFactory$NothingManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$NothingManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$NullManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$NullManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$NullManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$NullManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$NullManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$NullManifest$.prototype = $c_s_reflect_ManifestFactory$NullManifest$.prototype;
$c_s_reflect_ManifestFactory$NullManifest$.prototype.init___ = (function() {
  this.toString$2 = "Null";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_sr_Null$.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
var $d_s_reflect_ManifestFactory$NullManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$NullManifest$: 0
}, false, "scala.reflect.ManifestFactory$NullManifest$", {
  s_reflect_ManifestFactory$NullManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$NullManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$NullManifest$;
var $n_s_reflect_ManifestFactory$NullManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$NullManifest$() {
  if ((!$n_s_reflect_ManifestFactory$NullManifest$)) {
    $n_s_reflect_ManifestFactory$NullManifest$ = new $c_s_reflect_ManifestFactory$NullManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$NullManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$ObjectManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$ObjectManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$ObjectManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ObjectManifest$.prototype = $c_s_reflect_ManifestFactory$ObjectManifest$.prototype;
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.init___ = (function() {
  this.toString$2 = "Object";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_O.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
var $d_s_reflect_ManifestFactory$ObjectManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ObjectManifest$: 0
}, false, "scala.reflect.ManifestFactory$ObjectManifest$", {
  s_reflect_ManifestFactory$ObjectManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ObjectManifest$;
var $n_s_reflect_ManifestFactory$ObjectManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$ObjectManifest$() {
  if ((!$n_s_reflect_ManifestFactory$ObjectManifest$)) {
    $n_s_reflect_ManifestFactory$ObjectManifest$ = new $c_s_reflect_ManifestFactory$ObjectManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ObjectManifest$
}
function $is_sc_GenSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenSeq)))
}
function $as_sc_GenSeq(obj) {
  return (($is_sc_GenSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenSeq"))
}
function $isArrayOf_sc_GenSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenSeq)))
}
function $asArrayOf_sc_GenSeq(obj, depth) {
  return (($isArrayOf_sc_GenSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenSeq;", depth))
}
/** @constructor */
function $c_sci_Vector$() {
  $c_scg_IndexedSeqFactory.call(this);
  this.NIL$6 = null;
  this.Log2ConcatFaster$6 = 0;
  this.TinyAppendFaster$6 = 0
}
$c_sci_Vector$.prototype = new $h_scg_IndexedSeqFactory();
$c_sci_Vector$.prototype.constructor = $c_sci_Vector$;
/** @constructor */
function $h_sci_Vector$() {
  /*<skip>*/
}
$h_sci_Vector$.prototype = $c_sci_Vector$.prototype;
$c_sci_Vector$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sci_Vector$ = this;
  this.NIL$6 = new $c_sci_Vector().init___I__I__I(0, 0, 0);
  return this
});
$c_sci_Vector$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sci_VectorBuilder().init___()
});
var $d_sci_Vector$ = new $TypeData().initClass({
  sci_Vector$: 0
}, false, "scala.collection.immutable.Vector$", {
  sci_Vector$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Vector$.prototype.$classData = $d_sci_Vector$;
var $n_sci_Vector$ = (void 0);
function $m_sci_Vector$() {
  if ((!$n_sci_Vector$)) {
    $n_sci_Vector$ = new $c_sci_Vector$().init___()
  };
  return $n_sci_Vector$
}
/** @constructor */
function $c_sc_AbstractTraversable() {
  $c_O.call(this)
}
$c_sc_AbstractTraversable.prototype = new $h_O();
$c_sc_AbstractTraversable.prototype.constructor = $c_sc_AbstractTraversable;
/** @constructor */
function $h_sc_AbstractTraversable() {
  /*<skip>*/
}
$h_sc_AbstractTraversable.prototype = $c_sc_AbstractTraversable.prototype;
$c_sc_AbstractTraversable.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $s_sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this, start, sep, end)
});
$c_sc_AbstractTraversable.prototype.toVector__sci_Vector = (function() {
  $m_sci_Vector$();
  var cbf = $m_sc_IndexedSeq$().ReusableCBF$6;
  return $as_sci_Vector($s_sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(this, cbf))
});
$c_sc_AbstractTraversable.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $s_sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sc_AbstractTraversable.prototype.repr__O = (function() {
  return this
});
$c_sc_AbstractTraversable.prototype.isTraversableAgain__Z = (function() {
  return true
});
$c_sc_AbstractTraversable.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  return $s_sc_TraversableLike$class__map__sc_TraversableLike__F1__scg_CanBuildFrom__O(this, f, bf)
});
$c_sc_AbstractTraversable.prototype.newBuilder__scm_Builder = (function() {
  return this.companion__scg_GenericCompanion().newBuilder__scm_Builder()
});
$c_sc_AbstractTraversable.prototype.stringPrefix__T = (function() {
  return $s_sc_TraversableLike$class__stringPrefix__sc_TraversableLike__T(this)
});
function $is_sc_GenSet(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenSet)))
}
function $as_sc_GenSet(obj) {
  return (($is_sc_GenSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenSet"))
}
function $isArrayOf_sc_GenSet(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenSet)))
}
function $asArrayOf_sc_GenSet(obj, depth) {
  return (($isArrayOf_sc_GenSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenSet;", depth))
}
function $is_sc_IndexedSeqLike(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeqLike)))
}
function $as_sc_IndexedSeqLike(obj) {
  return (($is_sc_IndexedSeqLike(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.IndexedSeqLike"))
}
function $isArrayOf_sc_IndexedSeqLike(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeqLike)))
}
function $asArrayOf_sc_IndexedSeqLike(obj, depth) {
  return (($isArrayOf_sc_IndexedSeqLike(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.IndexedSeqLike;", depth))
}
function $is_sc_LinearSeqLike(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqLike)))
}
function $as_sc_LinearSeqLike(obj) {
  return (($is_sc_LinearSeqLike(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeqLike"))
}
function $isArrayOf_sc_LinearSeqLike(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqLike)))
}
function $asArrayOf_sc_LinearSeqLike(obj, depth) {
  return (($isArrayOf_sc_LinearSeqLike(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeqLike;", depth))
}
function $is_sc_LinearSeqOptimized(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqOptimized)))
}
function $as_sc_LinearSeqOptimized(obj) {
  return (($is_sc_LinearSeqOptimized(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeqOptimized"))
}
function $isArrayOf_sc_LinearSeqOptimized(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqOptimized)))
}
function $asArrayOf_sc_LinearSeqOptimized(obj, depth) {
  return (($isArrayOf_sc_LinearSeqOptimized(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeqOptimized;", depth))
}
/** @constructor */
function $c_sc_AbstractIterable() {
  $c_sc_AbstractTraversable.call(this)
}
$c_sc_AbstractIterable.prototype = new $h_sc_AbstractTraversable();
$c_sc_AbstractIterable.prototype.constructor = $c_sc_AbstractIterable;
/** @constructor */
function $h_sc_AbstractIterable() {
  /*<skip>*/
}
$h_sc_AbstractIterable.prototype = $c_sc_AbstractIterable.prototype;
$c_sc_AbstractIterable.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $s_sc_IterableLike$class__sameElements__sc_IterableLike__sc_GenIterable__Z(this, that)
});
$c_sc_AbstractIterable.prototype.forall__F1__Z = (function(p) {
  var this$1 = this.iterator__sc_Iterator();
  return $s_sc_Iterator$class__forall__sc_Iterator__F1__Z(this$1, p)
});
$c_sc_AbstractIterable.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.iterator__sc_Iterator();
  $s_sc_Iterator$class__foreach__sc_Iterator__F1__V(this$1, f)
});
$c_sc_AbstractIterable.prototype.toStream__sci_Stream = (function() {
  return this.iterator__sc_Iterator().toStream__sci_Stream()
});
$c_sc_AbstractIterable.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $s_sc_IterableLike$class__copyToArray__sc_IterableLike__O__I__I__V(this, xs, start, len)
});
function $is_sc_AbstractIterable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_AbstractIterable)))
}
function $as_sc_AbstractIterable(obj) {
  return (($is_sc_AbstractIterable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.AbstractIterable"))
}
function $isArrayOf_sc_AbstractIterable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_AbstractIterable)))
}
function $asArrayOf_sc_AbstractIterable(obj, depth) {
  return (($isArrayOf_sc_AbstractIterable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.AbstractIterable;", depth))
}
function $is_sci_Iterable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Iterable)))
}
function $as_sci_Iterable(obj) {
  return (($is_sci_Iterable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Iterable"))
}
function $isArrayOf_sci_Iterable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Iterable)))
}
function $asArrayOf_sci_Iterable(obj, depth) {
  return (($isArrayOf_sci_Iterable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Iterable;", depth))
}
var $d_sci_Iterable = new $TypeData().initClass({
  sci_Iterable: 0
}, true, "scala.collection.immutable.Iterable", {
  sci_Iterable: 1,
  sci_Traversable: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  s_Immutable: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1
});
function $is_sc_Seq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Seq)))
}
function $as_sc_Seq(obj) {
  return (($is_sc_Seq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Seq"))
}
function $isArrayOf_sc_Seq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Seq)))
}
function $asArrayOf_sc_Seq(obj, depth) {
  return (($isArrayOf_sc_Seq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Seq;", depth))
}
function $is_sc_Set(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Set)))
}
function $as_sc_Set(obj) {
  return (($is_sc_Set(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Set"))
}
function $isArrayOf_sc_Set(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Set)))
}
function $asArrayOf_sc_Set(obj, depth) {
  return (($isArrayOf_sc_Set(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Set;", depth))
}
/** @constructor */
function $c_scm_AbstractIterable() {
  $c_sc_AbstractIterable.call(this)
}
$c_scm_AbstractIterable.prototype = new $h_sc_AbstractIterable();
$c_scm_AbstractIterable.prototype.constructor = $c_scm_AbstractIterable;
/** @constructor */
function $h_scm_AbstractIterable() {
  /*<skip>*/
}
$h_scm_AbstractIterable.prototype = $c_scm_AbstractIterable.prototype;
function $is_sc_IndexedSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeq)))
}
function $as_sc_IndexedSeq(obj) {
  return (($is_sc_IndexedSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.IndexedSeq"))
}
function $isArrayOf_sc_IndexedSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeq)))
}
function $asArrayOf_sc_IndexedSeq(obj, depth) {
  return (($isArrayOf_sc_IndexedSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.IndexedSeq;", depth))
}
function $is_sc_LinearSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeq)))
}
function $as_sc_LinearSeq(obj) {
  return (($is_sc_LinearSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeq"))
}
function $isArrayOf_sc_LinearSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeq)))
}
function $asArrayOf_sc_LinearSeq(obj, depth) {
  return (($isArrayOf_sc_LinearSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeq;", depth))
}
/** @constructor */
function $c_sc_AbstractSeq() {
  $c_sc_AbstractIterable.call(this)
}
$c_sc_AbstractSeq.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractSeq.prototype.constructor = $c_sc_AbstractSeq;
/** @constructor */
function $h_sc_AbstractSeq() {
  /*<skip>*/
}
$h_sc_AbstractSeq.prototype = $c_sc_AbstractSeq.prototype;
$c_sc_AbstractSeq.prototype.equals__O__Z = (function(that) {
  return $s_sc_GenSeqLike$class__equals__sc_GenSeqLike__O__Z(this, that)
});
$c_sc_AbstractSeq.prototype.isEmpty__Z = (function() {
  return $s_sc_SeqLike$class__isEmpty__sc_SeqLike__Z(this)
});
$c_sc_AbstractSeq.prototype.toString__T = (function() {
  return $s_sc_TraversableLike$class__toString__sc_TraversableLike__T(this)
});
$c_sc_AbstractSeq.prototype.size__I = (function() {
  return this.length__I()
});
$c_sc_AbstractSeq.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_sc_AbstractSeq.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this.seq__sc_Seq())
});
/** @constructor */
function $c_sc_AbstractSet() {
  $c_sc_AbstractIterable.call(this)
}
$c_sc_AbstractSet.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractSet.prototype.constructor = $c_sc_AbstractSet;
/** @constructor */
function $h_sc_AbstractSet() {
  /*<skip>*/
}
$h_sc_AbstractSet.prototype = $c_sc_AbstractSet.prototype;
$c_sc_AbstractSet.prototype.isEmpty__Z = (function() {
  return $s_sc_SetLike$class__isEmpty__sc_SetLike__Z(this)
});
$c_sc_AbstractSet.prototype.equals__O__Z = (function(that) {
  return $s_sc_GenSetLike$class__equals__sc_GenSetLike__O__Z(this, that)
});
$c_sc_AbstractSet.prototype.toString__T = (function() {
  return $s_sc_TraversableLike$class__toString__sc_TraversableLike__T(this)
});
$c_sc_AbstractSet.prototype.subsetOf__sc_GenSet__Z = (function(that) {
  return this.forall__F1__Z(that)
});
$c_sc_AbstractSet.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  return this$1.unorderedHash__sc_TraversableOnce__I__I(this, this$1.setSeed$2)
});
$c_sc_AbstractSet.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_SetBuilder().init___sc_Set(this.empty__sc_Set())
});
$c_sc_AbstractSet.prototype.stringPrefix__T = (function() {
  return "Set"
});
function $is_sci_IndexedSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_IndexedSeq)))
}
function $as_sci_IndexedSeq(obj) {
  return (($is_sci_IndexedSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.IndexedSeq"))
}
function $isArrayOf_sci_IndexedSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_IndexedSeq)))
}
function $asArrayOf_sci_IndexedSeq(obj, depth) {
  return (($isArrayOf_sci_IndexedSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.IndexedSeq;", depth))
}
/** @constructor */
function $c_sci_ListSet() {
  $c_sc_AbstractSet.call(this)
}
$c_sci_ListSet.prototype = new $h_sc_AbstractSet();
$c_sci_ListSet.prototype.constructor = $c_sci_ListSet;
/** @constructor */
function $h_sci_ListSet() {
  /*<skip>*/
}
$h_sci_ListSet.prototype = $c_sci_ListSet.prototype;
$c_sci_ListSet.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_ListSet.prototype.head__O = (function() {
  throw new $c_ju_NoSuchElementException().init___T("Set has no elements")
});
$c_sci_ListSet.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_ListSet.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_ListSet.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_ListSet.prototype.scala$collection$immutable$ListSet$$unchecked$undouter__sci_ListSet = (function() {
  throw new $c_ju_NoSuchElementException().init___T("Empty ListSet has no outer pointer")
});
$c_sci_ListSet.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_ListSet$()
});
$c_sci_ListSet.prototype.$$plus__O__sci_ListSet = (function(elem) {
  return new $c_sci_ListSet$Node().init___sci_ListSet__O(this, elem)
});
$c_sci_ListSet.prototype.size__I = (function() {
  return 0
});
$c_sci_ListSet.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_ListSet$$anon$1().init___sci_ListSet(this)
});
$c_sci_ListSet.prototype.empty__sc_Set = (function() {
  return $m_sci_ListSet$EmptyListSet$()
});
$c_sci_ListSet.prototype.contains__O__Z = (function(elem) {
  return false
});
$c_sci_ListSet.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_ListSet(elem)
});
$c_sci_ListSet.prototype.tail__sci_ListSet = (function() {
  throw new $c_ju_NoSuchElementException().init___T("Next of an empty set")
});
$c_sci_ListSet.prototype.stringPrefix__T = (function() {
  return "ListSet"
});
function $is_sci_ListSet(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_ListSet)))
}
function $as_sci_ListSet(obj) {
  return (($is_sci_ListSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.ListSet"))
}
function $isArrayOf_sci_ListSet(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_ListSet)))
}
function $asArrayOf_sci_ListSet(obj, depth) {
  return (($isArrayOf_sci_ListSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.ListSet;", depth))
}
/** @constructor */
function $c_sci_Set$EmptySet$() {
  $c_sc_AbstractSet.call(this)
}
$c_sci_Set$EmptySet$.prototype = new $h_sc_AbstractSet();
$c_sci_Set$EmptySet$.prototype.constructor = $c_sci_Set$EmptySet$;
/** @constructor */
function $h_sci_Set$EmptySet$() {
  /*<skip>*/
}
$h_sci_Set$EmptySet$.prototype = $c_sci_Set$EmptySet$.prototype;
$c_sci_Set$EmptySet$.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$EmptySet$.prototype.init___ = (function() {
  return this
});
$c_sci_Set$EmptySet$.prototype.apply__O__O = (function(v1) {
  return false
});
$c_sci_Set$EmptySet$.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$EmptySet$.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$EmptySet$.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
$c_sci_Set$EmptySet$.prototype.size__I = (function() {
  return 0
});
$c_sci_Set$EmptySet$.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().empty$1
});
$c_sci_Set$EmptySet$.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$EmptySet$.prototype.$$plus__O__sc_Set = (function(elem) {
  return new $c_sci_Set$Set1().init___O(elem)
});
var $d_sci_Set$EmptySet$ = new $TypeData().initClass({
  sci_Set$EmptySet$: 0
}, false, "scala.collection.immutable.Set$EmptySet$", {
  sci_Set$EmptySet$: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$EmptySet$.prototype.$classData = $d_sci_Set$EmptySet$;
var $n_sci_Set$EmptySet$ = (void 0);
function $m_sci_Set$EmptySet$() {
  if ((!$n_sci_Set$EmptySet$)) {
    $n_sci_Set$EmptySet$ = new $c_sci_Set$EmptySet$().init___()
  };
  return $n_sci_Set$EmptySet$
}
/** @constructor */
function $c_sci_Set$Set1() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null
}
$c_sci_Set$Set1.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set1.prototype.constructor = $c_sci_Set$Set1;
/** @constructor */
function $h_sci_Set$Set1() {
  /*<skip>*/
}
$h_sci_Set$Set1.prototype = $c_sci_Set$Set1.prototype;
$c_sci_Set$Set1.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set1.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set1.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set1.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set1.prototype.forall__F1__Z = (function(f) {
  return $uZ(f.apply__O__O(this.elem1$4))
});
$c_sci_Set$Set1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4)
});
$c_sci_Set$Set1.prototype.size__I = (function() {
  return 1
});
$c_sci_Set$Set1.prototype.init___O = (function(elem1) {
  this.elem1$4 = elem1;
  return this
});
$c_sci_Set$Set1.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set1.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set1.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set2().init___O__O(this.elem1$4, elem))
});
$c_sci_Set$Set1.prototype.contains__O__Z = (function(elem) {
  return $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4)
});
$c_sci_Set$Set1.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set1 = new $TypeData().initClass({
  sci_Set$Set1: 0
}, false, "scala.collection.immutable.Set$Set1", {
  sci_Set$Set1: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set1.prototype.$classData = $d_sci_Set$Set1;
/** @constructor */
function $c_sci_Set$Set2() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null
}
$c_sci_Set$Set2.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set2.prototype.constructor = $c_sci_Set$Set2;
/** @constructor */
function $h_sci_Set$Set2() {
  /*<skip>*/
}
$h_sci_Set$Set2.prototype = $c_sci_Set$Set2.prototype;
$c_sci_Set$Set2.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set2.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set2.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set2.prototype.init___O__O = (function(elem1, elem2) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  return this
});
$c_sci_Set$Set2.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set2.prototype.forall__F1__Z = (function(f) {
  return ($uZ(f.apply__O__O(this.elem1$4)) && $uZ(f.apply__O__O(this.elem2$4)))
});
$c_sci_Set$Set2.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4)
});
$c_sci_Set$Set2.prototype.size__I = (function() {
  return 2
});
$c_sci_Set$Set2.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set2.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set2.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set3().init___O__O__O(this.elem1$4, this.elem2$4, elem))
});
$c_sci_Set$Set2.prototype.contains__O__Z = (function(elem) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4))
});
$c_sci_Set$Set2.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set2 = new $TypeData().initClass({
  sci_Set$Set2: 0
}, false, "scala.collection.immutable.Set$Set2", {
  sci_Set$Set2: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set2.prototype.$classData = $d_sci_Set$Set2;
/** @constructor */
function $c_sci_Set$Set3() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null;
  this.elem3$4 = null
}
$c_sci_Set$Set3.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set3.prototype.constructor = $c_sci_Set$Set3;
/** @constructor */
function $h_sci_Set$Set3() {
  /*<skip>*/
}
$h_sci_Set$Set3.prototype = $c_sci_Set$Set3.prototype;
$c_sci_Set$Set3.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set3.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set3.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set3.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set3.prototype.forall__F1__Z = (function(f) {
  return (($uZ(f.apply__O__O(this.elem1$4)) && $uZ(f.apply__O__O(this.elem2$4))) && $uZ(f.apply__O__O(this.elem3$4)))
});
$c_sci_Set$Set3.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4);
  f.apply__O__O(this.elem3$4)
});
$c_sci_Set$Set3.prototype.init___O__O__O = (function(elem1, elem2, elem3) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  this.elem3$4 = elem3;
  return this
});
$c_sci_Set$Set3.prototype.size__I = (function() {
  return 3
});
$c_sci_Set$Set3.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4, this.elem3$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set3.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set3.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set4().init___O__O__O__O(this.elem1$4, this.elem2$4, this.elem3$4, elem))
});
$c_sci_Set$Set3.prototype.contains__O__Z = (function(elem) {
  return (($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem3$4))
});
$c_sci_Set$Set3.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set3 = new $TypeData().initClass({
  sci_Set$Set3: 0
}, false, "scala.collection.immutable.Set$Set3", {
  sci_Set$Set3: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set3.prototype.$classData = $d_sci_Set$Set3;
/** @constructor */
function $c_sci_Set$Set4() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null;
  this.elem3$4 = null;
  this.elem4$4 = null
}
$c_sci_Set$Set4.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set4.prototype.constructor = $c_sci_Set$Set4;
/** @constructor */
function $h_sci_Set$Set4() {
  /*<skip>*/
}
$h_sci_Set$Set4.prototype = $c_sci_Set$Set4.prototype;
$c_sci_Set$Set4.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set4.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set4.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set4.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set4.prototype.forall__F1__Z = (function(f) {
  return ((($uZ(f.apply__O__O(this.elem1$4)) && $uZ(f.apply__O__O(this.elem2$4))) && $uZ(f.apply__O__O(this.elem3$4))) && $uZ(f.apply__O__O(this.elem4$4)))
});
$c_sci_Set$Set4.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4);
  f.apply__O__O(this.elem3$4);
  f.apply__O__O(this.elem4$4)
});
$c_sci_Set$Set4.prototype.size__I = (function() {
  return 4
});
$c_sci_Set$Set4.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4, this.elem3$4, this.elem4$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set4.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set4.prototype.$$plus__O__sci_Set = (function(elem) {
  if (this.contains__O__Z(elem)) {
    return this
  } else {
    var this$1 = new $c_sci_HashSet().init___();
    var elem1 = this.elem1$4;
    var elem2 = this.elem2$4;
    var array = [this.elem3$4, this.elem4$4, elem];
    var this$2 = this$1.$$plus__O__sci_HashSet(elem1).$$plus__O__sci_HashSet(elem2);
    var start = 0;
    var end = $uI(array.length);
    var z = this$2;
    x: {
      var jsx$1;
      _foldl: while (true) {
        if ((start === end)) {
          var jsx$1 = z;
          break x
        } else {
          var temp$start = ((1 + start) | 0);
          var arg1 = z;
          var index = start;
          var arg2 = array[index];
          var x$2 = $as_sc_Set(arg1);
          var temp$z = x$2.$$plus__O__sc_Set(arg2);
          start = temp$start;
          z = temp$z;
          continue _foldl
        }
      }
    };
    return $as_sci_HashSet($as_sc_Set(jsx$1))
  }
});
$c_sci_Set$Set4.prototype.contains__O__Z = (function(elem) {
  return ((($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem3$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem4$4))
});
$c_sci_Set$Set4.prototype.init___O__O__O__O = (function(elem1, elem2, elem3, elem4) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  this.elem3$4 = elem3;
  this.elem4$4 = elem4;
  return this
});
$c_sci_Set$Set4.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set4 = new $TypeData().initClass({
  sci_Set$Set4: 0
}, false, "scala.collection.immutable.Set$Set4", {
  sci_Set$Set4: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set4.prototype.$classData = $d_sci_Set$Set4;
/** @constructor */
function $c_sci_HashSet() {
  $c_sc_AbstractSet.call(this)
}
$c_sci_HashSet.prototype = new $h_sc_AbstractSet();
$c_sci_HashSet.prototype.constructor = $c_sci_HashSet;
/** @constructor */
function $h_sci_HashSet() {
  /*<skip>*/
}
$h_sci_HashSet.prototype = $c_sci_HashSet.prototype;
$c_sci_HashSet.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_HashSet.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  return new $c_sci_HashSet$HashSet1().init___O__I(key, hash)
});
$c_sci_HashSet.prototype.computeHash__O__I = (function(key) {
  return this.improve__I__I($m_sr_ScalaRunTime$().hash__O__I(key))
});
$c_sci_HashSet.prototype.init___ = (function() {
  return this
});
$c_sci_HashSet.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_HashSet.prototype.$$plus__O__sci_HashSet = (function(e) {
  return this.updated0__O__I__I__sci_HashSet(e, this.computeHash__O__I(e), 0)
});
$c_sci_HashSet.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_HashSet.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_HashSet$()
});
$c_sci_HashSet.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
$c_sci_HashSet.prototype.subsetOf__sc_GenSet__Z = (function(that) {
  if ($is_sci_HashSet(that)) {
    var x2 = $as_sci_HashSet(that);
    return this.subsetOf0__sci_HashSet__I__Z(x2, 0)
  } else {
    var this$1 = this.iterator__sc_Iterator();
    return $s_sc_Iterator$class__forall__sc_Iterator__F1__Z(this$1, that)
  }
});
$c_sci_HashSet.prototype.size__I = (function() {
  return 0
});
$c_sci_HashSet.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().empty$1
});
$c_sci_HashSet.prototype.empty__sc_Set = (function() {
  return $m_sci_HashSet$EmptyHashSet$()
});
$c_sci_HashSet.prototype.improve__I__I = (function(hcode) {
  var h = ((hcode + (~(hcode << 9))) | 0);
  h = (h ^ ((h >>> 14) | 0));
  h = ((h + (h << 4)) | 0);
  return (h ^ ((h >>> 10) | 0))
});
$c_sci_HashSet.prototype.contains__O__Z = (function(e) {
  return this.get0__O__I__I__Z(e, this.computeHash__O__I(e), 0)
});
$c_sci_HashSet.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_HashSet(elem)
});
$c_sci_HashSet.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return false
});
$c_sci_HashSet.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  return true
});
function $is_sci_HashSet(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet)))
}
function $as_sci_HashSet(obj) {
  return (($is_sci_HashSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashSet"))
}
function $isArrayOf_sci_HashSet(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet)))
}
function $asArrayOf_sci_HashSet(obj, depth) {
  return (($isArrayOf_sci_HashSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashSet;", depth))
}
var $d_sci_HashSet = new $TypeData().initClass({
  sci_HashSet: 0
}, false, "scala.collection.immutable.HashSet", {
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet.prototype.$classData = $d_sci_HashSet;
/** @constructor */
function $c_sci_ListSet$EmptyListSet$() {
  $c_sci_ListSet.call(this)
}
$c_sci_ListSet$EmptyListSet$.prototype = new $h_sci_ListSet();
$c_sci_ListSet$EmptyListSet$.prototype.constructor = $c_sci_ListSet$EmptyListSet$;
/** @constructor */
function $h_sci_ListSet$EmptyListSet$() {
  /*<skip>*/
}
$h_sci_ListSet$EmptyListSet$.prototype = $c_sci_ListSet$EmptyListSet$.prototype;
$c_sci_ListSet$EmptyListSet$.prototype.init___ = (function() {
  return this
});
var $d_sci_ListSet$EmptyListSet$ = new $TypeData().initClass({
  sci_ListSet$EmptyListSet$: 0
}, false, "scala.collection.immutable.ListSet$EmptyListSet$", {
  sci_ListSet$EmptyListSet$: 1,
  sci_ListSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$EmptyListSet$.prototype.$classData = $d_sci_ListSet$EmptyListSet$;
var $n_sci_ListSet$EmptyListSet$ = (void 0);
function $m_sci_ListSet$EmptyListSet$() {
  if ((!$n_sci_ListSet$EmptyListSet$)) {
    $n_sci_ListSet$EmptyListSet$ = new $c_sci_ListSet$EmptyListSet$().init___()
  };
  return $n_sci_ListSet$EmptyListSet$
}
/** @constructor */
function $c_sci_ListSet$Node() {
  $c_sci_ListSet.call(this);
  this.head$5 = null;
  this.$$outer$f = null
}
$c_sci_ListSet$Node.prototype = new $h_sci_ListSet();
$c_sci_ListSet$Node.prototype.constructor = $c_sci_ListSet$Node;
/** @constructor */
function $h_sci_ListSet$Node() {
  /*<skip>*/
}
$h_sci_ListSet$Node.prototype = $c_sci_ListSet$Node.prototype;
$c_sci_ListSet$Node.prototype.head__O = (function() {
  return this.head$5
});
$c_sci_ListSet$Node.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_ListSet$Node.prototype.scala$collection$immutable$ListSet$$unchecked$undouter__sci_ListSet = (function() {
  return this.$$outer$f
});
$c_sci_ListSet$Node.prototype.$$plus__O__sci_ListSet = (function(e) {
  return (this.containsInternal__p5__sci_ListSet__O__Z(this, e) ? this : new $c_sci_ListSet$Node().init___sci_ListSet__O(this, e))
});
$c_sci_ListSet$Node.prototype.sizeInternal__p5__sci_ListSet__I__I = (function(n, acc) {
  _sizeInternal: while (true) {
    if (n.isEmpty__Z()) {
      return acc
    } else {
      var temp$n = n.scala$collection$immutable$ListSet$$unchecked$undouter__sci_ListSet();
      var temp$acc = ((1 + acc) | 0);
      n = temp$n;
      acc = temp$acc;
      continue _sizeInternal
    }
  }
});
$c_sci_ListSet$Node.prototype.size__I = (function() {
  return this.sizeInternal__p5__sci_ListSet__I__I(this, 0)
});
$c_sci_ListSet$Node.prototype.init___sci_ListSet__O = (function($$outer, head) {
  this.head$5 = head;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  return this
});
$c_sci_ListSet$Node.prototype.contains__O__Z = (function(e) {
  return this.containsInternal__p5__sci_ListSet__O__Z(this, e)
});
$c_sci_ListSet$Node.prototype.containsInternal__p5__sci_ListSet__O__Z = (function(n, e) {
  _containsInternal: while (true) {
    if ((!n.isEmpty__Z())) {
      if ($m_sr_BoxesRunTime$().equals__O__O__Z(n.head__O(), e)) {
        return true
      } else {
        n = n.scala$collection$immutable$ListSet$$unchecked$undouter__sci_ListSet();
        continue _containsInternal
      }
    } else {
      return false
    }
  }
});
$c_sci_ListSet$Node.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_ListSet(elem)
});
$c_sci_ListSet$Node.prototype.tail__sci_ListSet = (function() {
  return this.$$outer$f
});
var $d_sci_ListSet$Node = new $TypeData().initClass({
  sci_ListSet$Node: 0
}, false, "scala.collection.immutable.ListSet$Node", {
  sci_ListSet$Node: 1,
  sci_ListSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$Node.prototype.$classData = $d_sci_ListSet$Node;
/** @constructor */
function $c_scm_AbstractSeq() {
  $c_sc_AbstractSeq.call(this)
}
$c_scm_AbstractSeq.prototype = new $h_sc_AbstractSeq();
$c_scm_AbstractSeq.prototype.constructor = $c_scm_AbstractSeq;
/** @constructor */
function $h_scm_AbstractSeq() {
  /*<skip>*/
}
$h_scm_AbstractSeq.prototype = $c_scm_AbstractSeq.prototype;
$c_scm_AbstractSeq.prototype.seq__sc_TraversableOnce = (function() {
  return this.seq__scm_Seq()
});
$c_scm_AbstractSeq.prototype.seq__scm_Seq = (function() {
  return this
});
/** @constructor */
function $c_sci_HashSet$EmptyHashSet$() {
  $c_sci_HashSet.call(this)
}
$c_sci_HashSet$EmptyHashSet$.prototype = new $h_sci_HashSet();
$c_sci_HashSet$EmptyHashSet$.prototype.constructor = $c_sci_HashSet$EmptyHashSet$;
/** @constructor */
function $h_sci_HashSet$EmptyHashSet$() {
  /*<skip>*/
}
$h_sci_HashSet$EmptyHashSet$.prototype = $c_sci_HashSet$EmptyHashSet$.prototype;
$c_sci_HashSet$EmptyHashSet$.prototype.init___ = (function() {
  return this
});
var $d_sci_HashSet$EmptyHashSet$ = new $TypeData().initClass({
  sci_HashSet$EmptyHashSet$: 0
}, false, "scala.collection.immutable.HashSet$EmptyHashSet$", {
  sci_HashSet$EmptyHashSet$: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$EmptyHashSet$.prototype.$classData = $d_sci_HashSet$EmptyHashSet$;
var $n_sci_HashSet$EmptyHashSet$ = (void 0);
function $m_sci_HashSet$EmptyHashSet$() {
  if ((!$n_sci_HashSet$EmptyHashSet$)) {
    $n_sci_HashSet$EmptyHashSet$ = new $c_sci_HashSet$EmptyHashSet$().init___()
  };
  return $n_sci_HashSet$EmptyHashSet$
}
/** @constructor */
function $c_sci_HashSet$HashTrieSet() {
  $c_sci_HashSet.call(this);
  this.bitmap$5 = 0;
  this.elems$5 = null;
  this.size0$5 = 0
}
$c_sci_HashSet$HashTrieSet.prototype = new $h_sci_HashSet();
$c_sci_HashSet$HashTrieSet.prototype.constructor = $c_sci_HashSet$HashTrieSet;
/** @constructor */
function $h_sci_HashSet$HashTrieSet() {
  /*<skip>*/
}
$h_sci_HashSet$HashTrieSet.prototype = $c_sci_HashSet$HashTrieSet.prototype;
$c_sci_HashSet$HashTrieSet.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$5 & (((-1) + mask) | 0)));
  if (((this.bitmap$5 & mask) !== 0)) {
    var sub = this.elems$5.u[offset];
    var subNew = sub.updated0__O__I__I__sci_HashSet(key, hash, ((5 + level) | 0));
    if ((sub === subNew)) {
      return this
    } else {
      var elemsNew = $newArrayObject($d_sci_HashSet.getArrayOf(), [this.elems$5.u.length]);
      $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, 0, elemsNew, 0, this.elems$5.u.length);
      elemsNew.u[offset] = subNew;
      return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(this.bitmap$5, elemsNew, ((this.size0$5 + ((subNew.size__I() - sub.size__I()) | 0)) | 0))
    }
  } else {
    var elemsNew$2 = $newArrayObject($d_sci_HashSet.getArrayOf(), [((1 + this.elems$5.u.length) | 0)]);
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, 0, elemsNew$2, 0, offset);
    elemsNew$2.u[offset] = new $c_sci_HashSet$HashSet1().init___O__I(key, hash);
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, offset, elemsNew$2, ((1 + offset) | 0), ((this.elems$5.u.length - offset) | 0));
    var bitmapNew = (this.bitmap$5 | mask);
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmapNew, elemsNew$2, ((1 + this.size0$5) | 0))
  }
});
$c_sci_HashSet$HashTrieSet.prototype.foreach__F1__V = (function(f) {
  var i = 0;
  while ((i < this.elems$5.u.length)) {
    this.elems$5.u[i].foreach__F1__V(f);
    i = ((1 + i) | 0)
  }
});
$c_sci_HashSet$HashTrieSet.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_HashSet$HashTrieSet$$anon$1().init___sci_HashSet$HashTrieSet(this)
});
$c_sci_HashSet$HashTrieSet.prototype.size__I = (function() {
  return this.size0$5
});
$c_sci_HashSet$HashTrieSet.prototype.init___I__Asci_HashSet__I = (function(bitmap, elems, size0) {
  this.bitmap$5 = bitmap;
  this.elems$5 = elems;
  this.size0$5 = size0;
  $m_s_Predef$().assert__Z__V(($m_jl_Integer$().bitCount__I__I(bitmap) === elems.u.length));
  return this
});
$c_sci_HashSet$HashTrieSet.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  if ((this.bitmap$5 === (-1))) {
    return this.elems$5.u[(31 & index)].get0__O__I__I__Z(key, hash, ((5 + level) | 0))
  } else if (((this.bitmap$5 & mask) !== 0)) {
    var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$5 & (((-1) + mask) | 0)));
    return this.elems$5.u[offset].get0__O__I__I__Z(key, hash, ((5 + level) | 0))
  } else {
    return false
  }
});
$c_sci_HashSet$HashTrieSet.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  if ((that === this)) {
    return true
  } else {
    if ($is_sci_HashSet$HashTrieSet(that)) {
      var x2 = $as_sci_HashSet$HashTrieSet(that);
      if ((this.size0$5 <= x2.size0$5)) {
        var abm = this.bitmap$5;
        var a = this.elems$5;
        var ai = 0;
        var b = x2.elems$5;
        var bbm = x2.bitmap$5;
        var bi = 0;
        if (((abm & bbm) === abm)) {
          while ((abm !== 0)) {
            var alsb = (abm ^ (abm & (((-1) + abm) | 0)));
            var blsb = (bbm ^ (bbm & (((-1) + bbm) | 0)));
            if ((alsb === blsb)) {
              if ((!a.u[ai].subsetOf0__sci_HashSet__I__Z(b.u[bi], ((5 + level) | 0)))) {
                return false
              };
              abm = (abm & (~alsb));
              ai = ((1 + ai) | 0)
            };
            bbm = (bbm & (~blsb));
            bi = ((1 + bi) | 0)
          };
          return true
        } else {
          return false
        }
      }
    };
    return false
  }
});
function $is_sci_HashSet$HashTrieSet(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet$HashTrieSet)))
}
function $as_sci_HashSet$HashTrieSet(obj) {
  return (($is_sci_HashSet$HashTrieSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashSet$HashTrieSet"))
}
function $isArrayOf_sci_HashSet$HashTrieSet(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet$HashTrieSet)))
}
function $asArrayOf_sci_HashSet$HashTrieSet(obj, depth) {
  return (($isArrayOf_sci_HashSet$HashTrieSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashSet$HashTrieSet;", depth))
}
var $d_sci_HashSet$HashTrieSet = new $TypeData().initClass({
  sci_HashSet$HashTrieSet: 0
}, false, "scala.collection.immutable.HashSet$HashTrieSet", {
  sci_HashSet$HashTrieSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashTrieSet.prototype.$classData = $d_sci_HashSet$HashTrieSet;
/** @constructor */
function $c_sci_HashSet$LeafHashSet() {
  $c_sci_HashSet.call(this)
}
$c_sci_HashSet$LeafHashSet.prototype = new $h_sci_HashSet();
$c_sci_HashSet$LeafHashSet.prototype.constructor = $c_sci_HashSet$LeafHashSet;
/** @constructor */
function $h_sci_HashSet$LeafHashSet() {
  /*<skip>*/
}
$h_sci_HashSet$LeafHashSet.prototype = $c_sci_HashSet$LeafHashSet.prototype;
/** @constructor */
function $c_sci_HashSet$HashSet1() {
  $c_sci_HashSet$LeafHashSet.call(this);
  this.key$6 = null;
  this.hash$6 = 0
}
$c_sci_HashSet$HashSet1.prototype = new $h_sci_HashSet$LeafHashSet();
$c_sci_HashSet$HashSet1.prototype.constructor = $c_sci_HashSet$HashSet1;
/** @constructor */
function $h_sci_HashSet$HashSet1() {
  /*<skip>*/
}
$h_sci_HashSet$HashSet1.prototype = $c_sci_HashSet$HashSet1.prototype;
$c_sci_HashSet$HashSet1.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  if (((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))) {
    return this
  } else if ((hash !== this.hash$6)) {
    return $m_sci_HashSet$().scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(this.hash$6, this, hash, new $c_sci_HashSet$HashSet1().init___O__I(key, hash), level)
  } else {
    var this$2 = $m_sci_ListSet$EmptyListSet$();
    var elem = this.key$6;
    return new $c_sci_HashSet$HashSetCollision1().init___I__sci_ListSet(hash, new $c_sci_ListSet$Node().init___sci_ListSet__O(this$2, elem).$$plus__O__sci_ListSet(key))
  }
});
$c_sci_HashSet$HashSet1.prototype.init___O__I = (function(key, hash) {
  this.key$6 = key;
  this.hash$6 = hash;
  return this
});
$c_sci_HashSet$HashSet1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.key$6)
});
$c_sci_HashSet$HashSet1.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.key$6]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_HashSet$HashSet1.prototype.size__I = (function() {
  return 1
});
$c_sci_HashSet$HashSet1.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return ((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))
});
$c_sci_HashSet$HashSet1.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  return that.get0__O__I__I__Z(this.key$6, this.hash$6, level)
});
function $is_sci_HashSet$HashSet1(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet$HashSet1)))
}
function $as_sci_HashSet$HashSet1(obj) {
  return (($is_sci_HashSet$HashSet1(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashSet$HashSet1"))
}
function $isArrayOf_sci_HashSet$HashSet1(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet$HashSet1)))
}
function $asArrayOf_sci_HashSet$HashSet1(obj, depth) {
  return (($isArrayOf_sci_HashSet$HashSet1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashSet$HashSet1;", depth))
}
var $d_sci_HashSet$HashSet1 = new $TypeData().initClass({
  sci_HashSet$HashSet1: 0
}, false, "scala.collection.immutable.HashSet$HashSet1", {
  sci_HashSet$HashSet1: 1,
  sci_HashSet$LeafHashSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashSet1.prototype.$classData = $d_sci_HashSet$HashSet1;
/** @constructor */
function $c_sci_HashSet$HashSetCollision1() {
  $c_sci_HashSet$LeafHashSet.call(this);
  this.hash$6 = 0;
  this.ks$6 = null
}
$c_sci_HashSet$HashSetCollision1.prototype = new $h_sci_HashSet$LeafHashSet();
$c_sci_HashSet$HashSetCollision1.prototype.constructor = $c_sci_HashSet$HashSetCollision1;
/** @constructor */
function $h_sci_HashSet$HashSetCollision1() {
  /*<skip>*/
}
$h_sci_HashSet$HashSetCollision1.prototype = $c_sci_HashSet$HashSetCollision1.prototype;
$c_sci_HashSet$HashSetCollision1.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  return ((hash === this.hash$6) ? new $c_sci_HashSet$HashSetCollision1().init___I__sci_ListSet(hash, this.ks$6.$$plus__O__sci_ListSet(key)) : $m_sci_HashSet$().scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(this.hash$6, this, hash, new $c_sci_HashSet$HashSet1().init___O__I(key, hash), level))
});
$c_sci_HashSet$HashSetCollision1.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.ks$6;
  var this$2 = new $c_sci_ListSet$$anon$1().init___sci_ListSet(this$1);
  $s_sc_Iterator$class__foreach__sc_Iterator__F1__V(this$2, f)
});
$c_sci_HashSet$HashSetCollision1.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.ks$6;
  return new $c_sci_ListSet$$anon$1().init___sci_ListSet(this$1)
});
$c_sci_HashSet$HashSetCollision1.prototype.size__I = (function() {
  return this.ks$6.size__I()
});
$c_sci_HashSet$HashSetCollision1.prototype.init___I__sci_ListSet = (function(hash, ks) {
  this.hash$6 = hash;
  this.ks$6 = ks;
  return this
});
$c_sci_HashSet$HashSetCollision1.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return ((hash === this.hash$6) && this.ks$6.contains__O__Z(key))
});
$c_sci_HashSet$HashSetCollision1.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  var this$1 = this.ks$6;
  var this$2 = new $c_sci_ListSet$$anon$1().init___sci_ListSet(this$1);
  var res = true;
  while (true) {
    if (res) {
      var this$3 = this$2.that$2;
      var jsx$1 = $s_sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$3)
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var arg1 = this$2.next__O();
      res = that.get0__O__I__I__Z(arg1, this.hash$6, level)
    } else {
      break
    }
  };
  return res
});
var $d_sci_HashSet$HashSetCollision1 = new $TypeData().initClass({
  sci_HashSet$HashSetCollision1: 0
}, false, "scala.collection.immutable.HashSet$HashSetCollision1", {
  sci_HashSet$HashSetCollision1: 1,
  sci_HashSet$LeafHashSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashSetCollision1.prototype.$classData = $d_sci_HashSet$HashSetCollision1;
/** @constructor */
function $c_sci_List() {
  $c_sc_AbstractSeq.call(this)
}
$c_sci_List.prototype = new $h_sc_AbstractSeq();
$c_sci_List.prototype.constructor = $c_sci_List;
/** @constructor */
function $h_sci_List() {
  /*<skip>*/
}
$h_sci_List.prototype = $c_sci_List.prototype;
$c_sci_List.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_List.prototype.apply__I__O = (function(n) {
  return $s_sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O(this, n)
});
$c_sci_List.prototype.lengthCompare__I__I = (function(len) {
  return $s_sc_LinearSeqOptimized$class__lengthCompare__sc_LinearSeqOptimized__I__I(this, len)
});
$c_sci_List.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $s_sc_LinearSeqOptimized$class__sameElements__sc_LinearSeqOptimized__sc_GenIterable__Z(this, that)
});
$c_sci_List.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  return $s_sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O(this, n)
});
$c_sci_List.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_List.prototype.drop__I__sc_LinearSeqOptimized = (function(n) {
  return this.drop__I__sci_List(n)
});
$c_sci_List.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_List$()
});
$c_sci_List.prototype.foreach__F1__V = (function(f) {
  var these = this;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    var this$1 = these;
    these = this$1.tail__sci_List()
  }
});
$c_sci_List.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this)
});
$c_sci_List.prototype.drop__I__sci_List = (function(n) {
  var these = this;
  var count = n;
  while (((!these.isEmpty__Z()) && (count > 0))) {
    var this$1 = these;
    these = this$1.tail__sci_List();
    count = (((-1) + count) | 0)
  };
  return these
});
$c_sci_List.prototype.length__I = (function() {
  return $s_sc_LinearSeqOptimized$class__length__sc_LinearSeqOptimized__I(this)
});
$c_sci_List.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_List.prototype.toStream__sci_Stream = (function() {
  return (this.isEmpty__Z() ? $m_sci_Stream$Empty$() : new $c_sci_Stream$Cons().init___O__F0(this.head__O(), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      return $this.tail__sci_List().toStream__sci_Stream()
    })
  })(this))))
});
$c_sci_List.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_sci_List.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_List.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if ((bf === $m_sci_List$().ReusableCBFInstance$2)) {
    if ((this === $m_sci_Nil$())) {
      return $m_sci_Nil$()
    } else {
      var h = new $c_sci_$colon$colon().init___O__sci_List(f.apply__O__O(this.head__O()), $m_sci_Nil$());
      var t = h;
      var rest = this.tail__sci_List();
      while ((rest !== $m_sci_Nil$())) {
        var nx = new $c_sci_$colon$colon().init___O__sci_List(f.apply__O__O(rest.head__O()), $m_sci_Nil$());
        t.tl$5 = nx;
        t = nx;
        var this$1 = rest;
        rest = this$1.tail__sci_List()
      };
      return h
    }
  } else {
    return $s_sc_TraversableLike$class__map__sc_TraversableLike__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
$c_sci_List.prototype.stringPrefix__T = (function() {
  return "List"
});
function $is_sci_List(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_List)))
}
function $as_sci_List(obj) {
  return (($is_sci_List(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.List"))
}
function $isArrayOf_sci_List(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_List)))
}
function $asArrayOf_sci_List(obj, depth) {
  return (($isArrayOf_sci_List(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.List;", depth))
}
/** @constructor */
function $c_sci_Stream() {
  $c_sc_AbstractSeq.call(this)
}
$c_sci_Stream.prototype = new $h_sc_AbstractSeq();
$c_sci_Stream.prototype.constructor = $c_sci_Stream;
/** @constructor */
function $h_sci_Stream() {
  /*<skip>*/
}
$h_sci_Stream.prototype = $c_sci_Stream.prototype;
$c_sci_Stream.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Stream.prototype.apply__I__O = (function(n) {
  return $s_sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O(this, n)
});
$c_sci_Stream.prototype.lengthCompare__I__I = (function(len) {
  return $s_sc_LinearSeqOptimized$class__lengthCompare__sc_LinearSeqOptimized__I__I(this, len)
});
$c_sci_Stream.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  return $s_sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O(this, n)
});
$c_sci_Stream.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $s_sc_LinearSeqOptimized$class__sameElements__sc_LinearSeqOptimized__sc_GenIterable__Z(this, that)
});
$c_sci_Stream.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Stream.prototype.flatMap__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if ($is_sci_Stream$StreamBuilder(bf.apply__O__scm_Builder(this))) {
    if (this.isEmpty__Z()) {
      var x$1 = $m_sci_Stream$Empty$()
    } else {
      var nonEmptyPrefix = new $c_sr_ObjectRef().init___O(this);
      var prefix = $as_sc_GenTraversableOnce(f.apply__O__O($as_sci_Stream(nonEmptyPrefix.elem$1).head__O())).toStream__sci_Stream();
      while (((!$as_sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z()) && prefix.isEmpty__Z())) {
        nonEmptyPrefix.elem$1 = $as_sci_Stream($as_sci_Stream(nonEmptyPrefix.elem$1).tail__O());
        if ((!$as_sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z())) {
          prefix = $as_sc_GenTraversableOnce(f.apply__O__O($as_sci_Stream(nonEmptyPrefix.elem$1).head__O())).toStream__sci_Stream()
        }
      };
      var x$1 = ($as_sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z() ? ($m_sci_Stream$(), $m_sci_Stream$Empty$()) : prefix.append__F0__sci_Stream(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, f$1, nonEmptyPrefix$1) {
        return (function() {
          var x = $as_sci_Stream($as_sci_Stream(nonEmptyPrefix$1.elem$1).tail__O()).flatMap__F1__scg_CanBuildFrom__O(f$1, ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___()));
          return $as_sci_Stream(x)
        })
      })(this, f, nonEmptyPrefix))))
    };
    return x$1
  } else {
    return $s_sc_TraversableLike$class__flatMap__sc_TraversableLike__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
$c_sci_Stream.prototype.drop__I__sc_LinearSeqOptimized = (function(n) {
  return this.drop__I__sci_Stream(n)
});
$c_sci_Stream.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  this.force__sci_Stream();
  return $s_sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this, start, sep, end)
});
$c_sci_Stream.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Stream$()
});
$c_sci_Stream.prototype.toString__T = (function() {
  return $s_sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this, "Stream(", ", ", ")")
});
$c_sci_Stream.prototype.foreach__F1__V = (function(f) {
  var _$this = this;
  x: {
    _foreach: while (true) {
      if ((!_$this.isEmpty__Z())) {
        f.apply__O__O(_$this.head__O());
        _$this = $as_sci_Stream(_$this.tail__O());
        continue _foreach
      };
      break x
    }
  }
});
$c_sci_Stream.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_StreamIterator().init___sci_Stream(this)
});
$c_sci_Stream.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_Stream.prototype.length__I = (function() {
  var len = 0;
  var left = this;
  while ((!left.isEmpty__Z())) {
    len = ((1 + len) | 0);
    left = $as_sci_Stream(left.tail__O())
  };
  return len
});
$c_sci_Stream.prototype.toStream__sci_Stream = (function() {
  return this
});
$c_sci_Stream.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_sci_Stream.prototype.drop__I__sci_Stream = (function(n) {
  var _$this = this;
  _drop: while (true) {
    if (((n <= 0) || _$this.isEmpty__Z())) {
      return _$this
    } else {
      var temp$_$this = $as_sci_Stream(_$this.tail__O());
      var temp$n = (((-1) + n) | 0);
      _$this = temp$_$this;
      n = temp$n;
      continue _drop
    }
  }
});
$c_sci_Stream.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  b.append__T__scm_StringBuilder(start);
  if ((!this.isEmpty__Z())) {
    b.append__O__scm_StringBuilder(this.head__O());
    var cursor = this;
    var n = 1;
    if (cursor.tailDefined__Z()) {
      var scout = $as_sci_Stream(this.tail__O());
      if (scout.isEmpty__Z()) {
        b.append__T__scm_StringBuilder(end);
        return b
      };
      if ((cursor !== scout)) {
        cursor = scout;
        if (scout.tailDefined__Z()) {
          scout = $as_sci_Stream(scout.tail__O());
          while (((cursor !== scout) && scout.tailDefined__Z())) {
            b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
            n = ((1 + n) | 0);
            cursor = $as_sci_Stream(cursor.tail__O());
            scout = $as_sci_Stream(scout.tail__O());
            if (scout.tailDefined__Z()) {
              scout = $as_sci_Stream(scout.tail__O())
            }
          }
        }
      };
      if ((!scout.tailDefined__Z())) {
        while ((cursor !== scout)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O())
        };
        var this$1 = cursor;
        if ($s_sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O())
        }
      } else {
        var runner = this;
        var k = 0;
        while ((runner !== scout)) {
          runner = $as_sci_Stream(runner.tail__O());
          scout = $as_sci_Stream(scout.tail__O());
          k = ((1 + k) | 0)
        };
        if (((cursor === scout) && (k > 0))) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O())
        };
        while ((cursor !== scout)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O())
        };
        n = ((n - k) | 0)
      }
    };
    if ((!cursor.isEmpty__Z())) {
      if ((!cursor.tailDefined__Z())) {
        b.append__T__scm_StringBuilder(sep).append__T__scm_StringBuilder("?")
      } else {
        b.append__T__scm_StringBuilder(sep).append__T__scm_StringBuilder("...")
      }
    }
  };
  b.append__T__scm_StringBuilder(end);
  return b
});
$c_sci_Stream.prototype.force__sci_Stream = (function() {
  var these = this;
  var those = this;
  if ((!these.isEmpty__Z())) {
    these = $as_sci_Stream(these.tail__O())
  };
  while ((those !== these)) {
    if (these.isEmpty__Z()) {
      return this
    };
    these = $as_sci_Stream(these.tail__O());
    if (these.isEmpty__Z()) {
      return this
    };
    these = $as_sci_Stream(these.tail__O());
    if ((these === those)) {
      return this
    };
    those = $as_sci_Stream(those.tail__O())
  };
  return this
});
$c_sci_Stream.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_Stream.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if ($is_sci_Stream$StreamBuilder(bf.apply__O__scm_Builder(this))) {
    if (this.isEmpty__Z()) {
      var x$1 = $m_sci_Stream$Empty$()
    } else {
      var hd = f.apply__O__O(this.head__O());
      var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, f$1) {
        return (function() {
          var x = $as_sci_Stream($this.tail__O()).map__F1__scg_CanBuildFrom__O(f$1, ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___()));
          return $as_sci_Stream(x)
        })
      })(this, f));
      var x$1 = new $c_sci_Stream$Cons().init___O__F0(hd, tl)
    };
    return x$1
  } else {
    return $s_sc_TraversableLike$class__map__sc_TraversableLike__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
$c_sci_Stream.prototype.append__F0__sci_Stream = (function(rest) {
  if (this.isEmpty__Z()) {
    return $as_sc_GenTraversableOnce(rest.apply__O()).toStream__sci_Stream()
  } else {
    var hd = this.head__O();
    var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, rest$1) {
      return (function() {
        return $as_sci_Stream($this.tail__O()).append__F0__sci_Stream(rest$1)
      })
    })(this, rest));
    return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
  }
});
$c_sci_Stream.prototype.stringPrefix__T = (function() {
  return "Stream"
});
function $is_sci_Stream(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream)))
}
function $as_sci_Stream(obj) {
  return (($is_sci_Stream(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Stream"))
}
function $isArrayOf_sci_Stream(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream)))
}
function $asArrayOf_sci_Stream(obj, depth) {
  return (($isArrayOf_sci_Stream(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Stream;", depth))
}
function $is_sci_HashMap$HashMap1(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashMap$HashMap1)))
}
function $as_sci_HashMap$HashMap1(obj) {
  return (($is_sci_HashMap$HashMap1(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashMap$HashMap1"))
}
function $isArrayOf_sci_HashMap$HashMap1(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap$HashMap1)))
}
function $asArrayOf_sci_HashMap$HashMap1(obj, depth) {
  return (($isArrayOf_sci_HashMap$HashMap1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashMap$HashMap1;", depth))
}
function $is_sci_HashMap$HashTrieMap(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashMap$HashTrieMap)))
}
function $as_sci_HashMap$HashTrieMap(obj) {
  return (($is_sci_HashMap$HashTrieMap(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashMap$HashTrieMap"))
}
function $isArrayOf_sci_HashMap$HashTrieMap(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap$HashTrieMap)))
}
function $asArrayOf_sci_HashMap$HashTrieMap(obj, depth) {
  return (($isArrayOf_sci_HashMap$HashTrieMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashMap$HashTrieMap;", depth))
}
/** @constructor */
function $c_sci_Stream$Cons() {
  $c_sci_Stream.call(this);
  this.hd$5 = null;
  this.tlVal$5 = null;
  this.tlGen$5 = null
}
$c_sci_Stream$Cons.prototype = new $h_sci_Stream();
$c_sci_Stream$Cons.prototype.constructor = $c_sci_Stream$Cons;
/** @constructor */
function $h_sci_Stream$Cons() {
  /*<skip>*/
}
$h_sci_Stream$Cons.prototype = $c_sci_Stream$Cons.prototype;
$c_sci_Stream$Cons.prototype.head__O = (function() {
  return this.hd$5
});
$c_sci_Stream$Cons.prototype.tail__sci_Stream = (function() {
  if ((!this.tailDefined__Z())) {
    if ((!this.tailDefined__Z())) {
      this.tlVal$5 = $as_sci_Stream(this.tlGen$5.apply__O());
      this.tlGen$5 = null
    }
  };
  return this.tlVal$5
});
$c_sci_Stream$Cons.prototype.tailDefined__Z = (function() {
  return (this.tlGen$5 === null)
});
$c_sci_Stream$Cons.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_Stream$Cons.prototype.tail__O = (function() {
  return this.tail__sci_Stream()
});
$c_sci_Stream$Cons.prototype.init___O__F0 = (function(hd, tl) {
  this.hd$5 = hd;
  this.tlGen$5 = tl;
  return this
});
var $d_sci_Stream$Cons = new $TypeData().initClass({
  sci_Stream$Cons: 0
}, false, "scala.collection.immutable.Stream$Cons", {
  sci_Stream$Cons: 1,
  sci_Stream: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$Cons.prototype.$classData = $d_sci_Stream$Cons;
/** @constructor */
function $c_sci_Stream$Empty$() {
  $c_sci_Stream.call(this)
}
$c_sci_Stream$Empty$.prototype = new $h_sci_Stream();
$c_sci_Stream$Empty$.prototype.constructor = $c_sci_Stream$Empty$;
/** @constructor */
function $h_sci_Stream$Empty$() {
  /*<skip>*/
}
$h_sci_Stream$Empty$.prototype = $c_sci_Stream$Empty$.prototype;
$c_sci_Stream$Empty$.prototype.init___ = (function() {
  return this
});
$c_sci_Stream$Empty$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
$c_sci_Stream$Empty$.prototype.tailDefined__Z = (function() {
  return false
});
$c_sci_Stream$Empty$.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_Stream$Empty$.prototype.tail__sr_Nothing$ = (function() {
  throw new $c_jl_UnsupportedOperationException().init___T("tail of empty stream")
});
$c_sci_Stream$Empty$.prototype.head__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("head of empty stream")
});
$c_sci_Stream$Empty$.prototype.tail__O = (function() {
  this.tail__sr_Nothing$()
});
var $d_sci_Stream$Empty$ = new $TypeData().initClass({
  sci_Stream$Empty$: 0
}, false, "scala.collection.immutable.Stream$Empty$", {
  sci_Stream$Empty$: 1,
  sci_Stream: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$Empty$.prototype.$classData = $d_sci_Stream$Empty$;
var $n_sci_Stream$Empty$ = (void 0);
function $m_sci_Stream$Empty$() {
  if ((!$n_sci_Stream$Empty$)) {
    $n_sci_Stream$Empty$ = new $c_sci_Stream$Empty$().init___()
  };
  return $n_sci_Stream$Empty$
}
/** @constructor */
function $c_sci_Vector() {
  $c_sc_AbstractSeq.call(this);
  this.startIndex$4 = 0;
  this.endIndex$4 = 0;
  this.focus$4 = 0;
  this.dirty$4 = false;
  this.depth$4 = 0;
  this.display0$4 = null;
  this.display1$4 = null;
  this.display2$4 = null;
  this.display3$4 = null;
  this.display4$4 = null;
  this.display5$4 = null
}
$c_sci_Vector.prototype = new $h_sc_AbstractSeq();
$c_sci_Vector.prototype.constructor = $c_sci_Vector;
/** @constructor */
function $h_sci_Vector() {
  /*<skip>*/
}
$h_sci_Vector.prototype = $c_sci_Vector.prototype;
$c_sci_Vector.prototype.checkRangeConvert__p4__I__I = (function(index) {
  var idx = ((index + this.startIndex$4) | 0);
  if (((index >= 0) && (idx < this.endIndex$4))) {
    return idx
  } else {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + index))
  }
});
$c_sci_Vector.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Vector.prototype.display3__AO = (function() {
  return this.display3$4
});
$c_sci_Vector.prototype.gotoPosWritable__p4__I__I__I__V = (function(oldIndex, newIndex, xor) {
  if (this.dirty$4) {
    $s_sci_VectorPointer$class__gotoPosWritable1__sci_VectorPointer__I__I__I__V(this, oldIndex, newIndex, xor)
  } else {
    $s_sci_VectorPointer$class__gotoPosWritable0__sci_VectorPointer__I__I__V(this, newIndex, xor);
    this.dirty$4 = true
  }
});
$c_sci_Vector.prototype.apply__I__O = (function(index) {
  var idx = this.checkRangeConvert__p4__I__I(index);
  var xor = (idx ^ this.focus$4);
  return $s_sci_VectorPointer$class__getElem__sci_VectorPointer__I__I__O(this, idx, xor)
});
$c_sci_Vector.prototype.depth__I = (function() {
  return this.depth$4
});
$c_sci_Vector.prototype.lengthCompare__I__I = (function(len) {
  return ((this.length__I() - len) | 0)
});
$c_sci_Vector.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O($uI(v1))
});
$c_sci_Vector.prototype.initIterator__sci_VectorIterator__V = (function(s) {
  var depth = this.depth$4;
  $s_sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V(s, this, depth);
  if (this.dirty$4) {
    var index = this.focus$4;
    $s_sci_VectorPointer$class__stabilize__sci_VectorPointer__I__V(s, index)
  };
  if ((s.depth$2 > 1)) {
    var index$1 = this.startIndex$4;
    var xor = (this.startIndex$4 ^ this.focus$4);
    $s_sci_VectorPointer$class__gotoPos__sci_VectorPointer__I__I__V(s, index$1, xor)
  }
});
$c_sci_Vector.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Vector.prototype.init___I__I__I = (function(startIndex, endIndex, focus) {
  this.startIndex$4 = startIndex;
  this.endIndex$4 = endIndex;
  this.focus$4 = focus;
  this.dirty$4 = false;
  return this
});
$c_sci_Vector.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$4 = x$1
});
$c_sci_Vector.prototype.$$colon$plus__O__scg_CanBuildFrom__O = (function(elem, bf) {
  return ((((bf === ($m_sci_IndexedSeq$(), $m_sc_IndexedSeq$().ReusableCBF$6)) || (bf === $m_sci_Seq$().ReusableCBFInstance$2)) || (bf === $m_sc_Seq$().ReusableCBFInstance$2)) ? this.appendBack__O__sci_Vector(elem) : $s_sc_SeqLike$class__$$colon$plus__sc_SeqLike__O__scg_CanBuildFrom__O(this, elem, bf))
});
$c_sci_Vector.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Vector$()
});
$c_sci_Vector.prototype.display0__AO = (function() {
  return this.display0$4
});
$c_sci_Vector.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$4 = x$1
});
$c_sci_Vector.prototype.display4__AO = (function() {
  return this.display4$4
});
$c_sci_Vector.prototype.shiftTopLevel__p4__I__I__V = (function(oldLeft, newLeft) {
  var x1 = (((-1) + this.depth$4) | 0);
  switch (x1) {
    case 0: {
      var array = this.display0$4;
      this.display0$4 = $s_sci_VectorPointer$class__copyRange__sci_VectorPointer__AO__I__I__AO(this, array, oldLeft, newLeft);
      break
    }
    case 1: {
      var array$1 = this.display1$4;
      this.display1$4 = $s_sci_VectorPointer$class__copyRange__sci_VectorPointer__AO__I__I__AO(this, array$1, oldLeft, newLeft);
      break
    }
    case 2: {
      var array$2 = this.display2$4;
      this.display2$4 = $s_sci_VectorPointer$class__copyRange__sci_VectorPointer__AO__I__I__AO(this, array$2, oldLeft, newLeft);
      break
    }
    case 3: {
      var array$3 = this.display3$4;
      this.display3$4 = $s_sci_VectorPointer$class__copyRange__sci_VectorPointer__AO__I__I__AO(this, array$3, oldLeft, newLeft);
      break
    }
    case 4: {
      var array$4 = this.display4$4;
      this.display4$4 = $s_sci_VectorPointer$class__copyRange__sci_VectorPointer__AO__I__I__AO(this, array$4, oldLeft, newLeft);
      break
    }
    case 5: {
      var array$5 = this.display5$4;
      this.display5$4 = $s_sci_VectorPointer$class__copyRange__sci_VectorPointer__AO__I__I__AO(this, array$5, oldLeft, newLeft);
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
});
$c_sci_Vector.prototype.toVector__sci_Vector = (function() {
  return this
});
$c_sci_Vector.prototype.appendBack__O__sci_Vector = (function(value) {
  if ((this.endIndex$4 !== this.startIndex$4)) {
    var blockIndex = ((-32) & this.endIndex$4);
    var lo = (31 & this.endIndex$4);
    if ((this.endIndex$4 !== blockIndex)) {
      var s = new $c_sci_Vector().init___I__I__I(this.startIndex$4, ((1 + this.endIndex$4) | 0), blockIndex);
      var depth = this.depth$4;
      $s_sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V(s, this, depth);
      s.dirty$4 = this.dirty$4;
      s.gotoPosWritable__p4__I__I__I__V(this.focus$4, blockIndex, (this.focus$4 ^ blockIndex));
      s.display0$4.u[lo] = value;
      return s
    } else {
      var shift = (this.startIndex$4 & (~(((-1) + (1 << $imul(5, (((-1) + this.depth$4) | 0)))) | 0)));
      var shiftBlocks = ((this.startIndex$4 >>> $imul(5, (((-1) + this.depth$4) | 0))) | 0);
      if ((shift !== 0)) {
        $s_sci_VectorPointer$class__debug__sci_VectorPointer__V(this);
        if ((this.depth$4 > 1)) {
          var newBlockIndex = ((blockIndex - shift) | 0);
          var newFocus = ((this.focus$4 - shift) | 0);
          var s$2 = new $c_sci_Vector().init___I__I__I(((this.startIndex$4 - shift) | 0), ((((1 + this.endIndex$4) | 0) - shift) | 0), newBlockIndex);
          var depth$1 = this.depth$4;
          $s_sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V(s$2, this, depth$1);
          s$2.dirty$4 = this.dirty$4;
          s$2.shiftTopLevel__p4__I__I__V(shiftBlocks, 0);
          $s_sci_VectorPointer$class__debug__sci_VectorPointer__V(s$2);
          s$2.gotoFreshPosWritable__p4__I__I__I__V(newFocus, newBlockIndex, (newFocus ^ newBlockIndex));
          s$2.display0$4.u[lo] = value;
          $s_sci_VectorPointer$class__debug__sci_VectorPointer__V(s$2);
          return s$2
        } else {
          var newBlockIndex$2 = (((-32) + blockIndex) | 0);
          var newFocus$2 = this.focus$4;
          var s$3 = new $c_sci_Vector().init___I__I__I(((this.startIndex$4 - shift) | 0), ((((1 + this.endIndex$4) | 0) - shift) | 0), newBlockIndex$2);
          var depth$2 = this.depth$4;
          $s_sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V(s$3, this, depth$2);
          s$3.dirty$4 = this.dirty$4;
          s$3.shiftTopLevel__p4__I__I__V(shiftBlocks, 0);
          s$3.gotoPosWritable__p4__I__I__I__V(newFocus$2, newBlockIndex$2, (newFocus$2 ^ newBlockIndex$2));
          s$3.display0$4.u[((32 - shift) | 0)] = value;
          $s_sci_VectorPointer$class__debug__sci_VectorPointer__V(s$3);
          return s$3
        }
      } else {
        var newFocus$3 = this.focus$4;
        var s$4 = new $c_sci_Vector().init___I__I__I(this.startIndex$4, ((1 + this.endIndex$4) | 0), blockIndex);
        var depth$3 = this.depth$4;
        $s_sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V(s$4, this, depth$3);
        s$4.dirty$4 = this.dirty$4;
        s$4.gotoFreshPosWritable__p4__I__I__I__V(newFocus$3, blockIndex, (newFocus$3 ^ blockIndex));
        s$4.display0$4.u[lo] = value;
        if ((s$4.depth$4 === ((1 + this.depth$4) | 0))) {
          $s_sci_VectorPointer$class__debug__sci_VectorPointer__V(s$4)
        };
        return s$4
      }
    }
  } else {
    var elems = $newArrayObject($d_O.getArrayOf(), [32]);
    elems.u[0] = value;
    var s$5 = new $c_sci_Vector().init___I__I__I(0, 1, 0);
    s$5.depth$4 = 1;
    s$5.display0$4 = elems;
    return s$5
  }
});
$c_sci_Vector.prototype.$$plus$colon__O__scg_CanBuildFrom__O = (function(elem, bf) {
  return ((((bf === ($m_sci_IndexedSeq$(), $m_sc_IndexedSeq$().ReusableCBF$6)) || (bf === $m_sci_Seq$().ReusableCBFInstance$2)) || (bf === $m_sc_Seq$().ReusableCBFInstance$2)) ? this.appendFront__O__sci_Vector(elem) : $s_sc_SeqLike$class__$$plus$colon__sc_SeqLike__O__scg_CanBuildFrom__O(this, elem, bf))
});
$c_sci_Vector.prototype.iterator__sc_Iterator = (function() {
  return this.iterator__sci_VectorIterator()
});
$c_sci_Vector.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$4 = x$1
});
$c_sci_Vector.prototype.length__I = (function() {
  return ((this.endIndex$4 - this.startIndex$4) | 0)
});
$c_sci_Vector.prototype.$$plus$plus__sc_GenTraversableOnce__scg_CanBuildFrom__O = (function(that, bf) {
  if ((((bf === ($m_sci_IndexedSeq$(), $m_sc_IndexedSeq$().ReusableCBF$6)) || (bf === $m_sci_Seq$().ReusableCBFInstance$2)) || (bf === $m_sc_Seq$().ReusableCBFInstance$2))) {
    if (that.isEmpty__Z()) {
      return this
    } else {
      var again = ((!that.isTraversableAgain__Z()) ? that.toVector__sci_Vector() : that.seq__sc_TraversableOnce());
      var x1 = again.size__I();
      switch (x1) {
        default: {
          if (((x1 <= 2) || (x1 < (this.length__I() >> 5)))) {
            var v = new $c_sr_ObjectRef().init___O(this);
            again.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, v$1) {
              return (function(x$2) {
                v$1.elem$1 = $as_sci_Vector($as_sci_Vector(v$1.elem$1).$$colon$plus__O__scg_CanBuildFrom__O(x$2, ($m_sci_Vector$(), $m_sc_IndexedSeq$().ReusableCBF$6)))
              })
            })(this, v)));
            return $as_sci_Vector(v.elem$1)
          } else if (((this.length__I() < (x1 >> 5)) && $is_sci_Vector(again))) {
            var v$2 = $as_sci_Vector(again);
            var ri = new $c_sci_Vector$$anon$1().init___sci_Vector(this);
            while (ri.hasNext__Z()) {
              var x$1 = ri.next__O();
              v$2 = $as_sci_Vector(v$2.$$plus$colon__O__scg_CanBuildFrom__O(x$1, ($m_sci_Vector$(), $m_sc_IndexedSeq$().ReusableCBF$6)))
            };
            return v$2
          } else {
            return $s_sc_TraversableLike$class__$$plus$plus__sc_TraversableLike__sc_GenTraversableOnce__scg_CanBuildFrom__O(this, again, bf)
          }
        }
      }
    }
  } else {
    return $s_sc_TraversableLike$class__$$plus$plus__sc_TraversableLike__sc_GenTraversableOnce__scg_CanBuildFrom__O(this, that.seq__sc_TraversableOnce(), bf)
  }
});
$c_sci_Vector.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_Vector.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$4 = x$1
});
$c_sci_Vector.prototype.gotoFreshPosWritable__p4__I__I__I__V = (function(oldIndex, newIndex, xor) {
  if (this.dirty$4) {
    $s_sci_VectorPointer$class__gotoFreshPosWritable1__sci_VectorPointer__I__I__I__V(this, oldIndex, newIndex, xor)
  } else {
    $s_sci_VectorPointer$class__gotoFreshPosWritable0__sci_VectorPointer__I__I__I__V(this, oldIndex, newIndex, xor);
    this.dirty$4 = true
  }
});
$c_sci_Vector.prototype.display1__AO = (function() {
  return this.display1$4
});
$c_sci_Vector.prototype.display5__AO = (function() {
  return this.display5$4
});
$c_sci_Vector.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_sci_Vector.prototype.iterator__sci_VectorIterator = (function() {
  var s = new $c_sci_VectorIterator().init___I__I(this.startIndex$4, this.endIndex$4);
  this.initIterator__sci_VectorIterator__V(s);
  return s
});
$c_sci_Vector.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_Vector.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$4 = x$1
});
$c_sci_Vector.prototype.display2__AO = (function() {
  return this.display2$4
});
$c_sci_Vector.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$4 = x$1
});
$c_sci_Vector.prototype.appendFront__O__sci_Vector = (function(value) {
  if ((this.endIndex$4 !== this.startIndex$4)) {
    var blockIndex = ((-32) & (((-1) + this.startIndex$4) | 0));
    var lo = (31 & (((-1) + this.startIndex$4) | 0));
    if ((this.startIndex$4 !== ((32 + blockIndex) | 0))) {
      var s = new $c_sci_Vector().init___I__I__I((((-1) + this.startIndex$4) | 0), this.endIndex$4, blockIndex);
      var depth = this.depth$4;
      $s_sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V(s, this, depth);
      s.dirty$4 = this.dirty$4;
      s.gotoPosWritable__p4__I__I__I__V(this.focus$4, blockIndex, (this.focus$4 ^ blockIndex));
      s.display0$4.u[lo] = value;
      return s
    } else {
      var freeSpace = (((1 << $imul(5, this.depth$4)) - this.endIndex$4) | 0);
      var shift = (freeSpace & (~(((-1) + (1 << $imul(5, (((-1) + this.depth$4) | 0)))) | 0)));
      var shiftBlocks = ((freeSpace >>> $imul(5, (((-1) + this.depth$4) | 0))) | 0);
      if ((shift !== 0)) {
        $s_sci_VectorPointer$class__debug__sci_VectorPointer__V(this);
        if ((this.depth$4 > 1)) {
          var newBlockIndex = ((blockIndex + shift) | 0);
          var newFocus = ((this.focus$4 + shift) | 0);
          var s$2 = new $c_sci_Vector().init___I__I__I((((((-1) + this.startIndex$4) | 0) + shift) | 0), ((this.endIndex$4 + shift) | 0), newBlockIndex);
          var depth$1 = this.depth$4;
          $s_sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V(s$2, this, depth$1);
          s$2.dirty$4 = this.dirty$4;
          s$2.shiftTopLevel__p4__I__I__V(0, shiftBlocks);
          $s_sci_VectorPointer$class__debug__sci_VectorPointer__V(s$2);
          s$2.gotoFreshPosWritable__p4__I__I__I__V(newFocus, newBlockIndex, (newFocus ^ newBlockIndex));
          s$2.display0$4.u[lo] = value;
          return s$2
        } else {
          var newBlockIndex$2 = ((32 + blockIndex) | 0);
          var newFocus$2 = this.focus$4;
          var s$3 = new $c_sci_Vector().init___I__I__I((((((-1) + this.startIndex$4) | 0) + shift) | 0), ((this.endIndex$4 + shift) | 0), newBlockIndex$2);
          var depth$2 = this.depth$4;
          $s_sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V(s$3, this, depth$2);
          s$3.dirty$4 = this.dirty$4;
          s$3.shiftTopLevel__p4__I__I__V(0, shiftBlocks);
          s$3.gotoPosWritable__p4__I__I__I__V(newFocus$2, newBlockIndex$2, (newFocus$2 ^ newBlockIndex$2));
          s$3.display0$4.u[(((-1) + shift) | 0)] = value;
          $s_sci_VectorPointer$class__debug__sci_VectorPointer__V(s$3);
          return s$3
        }
      } else if ((blockIndex < 0)) {
        var move = (((1 << $imul(5, ((1 + this.depth$4) | 0))) - (1 << $imul(5, this.depth$4))) | 0);
        var newBlockIndex$3 = ((blockIndex + move) | 0);
        var newFocus$3 = ((this.focus$4 + move) | 0);
        var s$4 = new $c_sci_Vector().init___I__I__I((((((-1) + this.startIndex$4) | 0) + move) | 0), ((this.endIndex$4 + move) | 0), newBlockIndex$3);
        var depth$3 = this.depth$4;
        $s_sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V(s$4, this, depth$3);
        s$4.dirty$4 = this.dirty$4;
        $s_sci_VectorPointer$class__debug__sci_VectorPointer__V(s$4);
        s$4.gotoFreshPosWritable__p4__I__I__I__V(newFocus$3, newBlockIndex$3, (newFocus$3 ^ newBlockIndex$3));
        s$4.display0$4.u[lo] = value;
        $s_sci_VectorPointer$class__debug__sci_VectorPointer__V(s$4);
        return s$4
      } else {
        var newFocus$4 = this.focus$4;
        var s$5 = new $c_sci_Vector().init___I__I__I((((-1) + this.startIndex$4) | 0), this.endIndex$4, blockIndex);
        var depth$4 = this.depth$4;
        $s_sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V(s$5, this, depth$4);
        s$5.dirty$4 = this.dirty$4;
        s$5.gotoFreshPosWritable__p4__I__I__I__V(newFocus$4, blockIndex, (newFocus$4 ^ blockIndex));
        s$5.display0$4.u[lo] = value;
        return s$5
      }
    }
  } else {
    var elems = $newArrayObject($d_O.getArrayOf(), [32]);
    elems.u[31] = value;
    var s$6 = new $c_sci_Vector().init___I__I__I(31, 32, 0);
    s$6.depth$4 = 1;
    s$6.display0$4 = elems;
    return s$6
  }
});
$c_sci_Vector.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$4 = x$1
});
function $is_sci_Vector(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Vector)))
}
function $as_sci_Vector(obj) {
  return (($is_sci_Vector(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Vector"))
}
function $isArrayOf_sci_Vector(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Vector)))
}
function $asArrayOf_sci_Vector(obj, depth) {
  return (($isArrayOf_sci_Vector(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Vector;", depth))
}
var $d_sci_Vector = new $TypeData().initClass({
  sci_Vector: 0
}, false, "scala.collection.immutable.Vector", {
  sci_Vector: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_IndexedSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  sci_VectorPointer: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_Vector.prototype.$classData = $d_sci_Vector;
/** @constructor */
function $c_sci_$colon$colon() {
  $c_sci_List.call(this);
  this.head$5 = null;
  this.tl$5 = null
}
$c_sci_$colon$colon.prototype = new $h_sci_List();
$c_sci_$colon$colon.prototype.constructor = $c_sci_$colon$colon;
/** @constructor */
function $h_sci_$colon$colon() {
  /*<skip>*/
}
$h_sci_$colon$colon.prototype = $c_sci_$colon$colon.prototype;
$c_sci_$colon$colon.prototype.productPrefix__T = (function() {
  return "::"
});
$c_sci_$colon$colon.prototype.head__O = (function() {
  return this.head$5
});
$c_sci_$colon$colon.prototype.productArity__I = (function() {
  return 2
});
$c_sci_$colon$colon.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_$colon$colon.prototype.tail__sci_List = (function() {
  return this.tl$5
});
$c_sci_$colon$colon.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.head$5;
      break
    }
    case 1: {
      return this.tl$5;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_sci_$colon$colon.prototype.tail__O = (function() {
  return this.tl$5
});
$c_sci_$colon$colon.prototype.init___O__sci_List = (function(head, tl) {
  this.head$5 = head;
  this.tl$5 = tl;
  return this
});
$c_sci_$colon$colon.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_sci_$colon$colon = new $TypeData().initClass({
  sci_$colon$colon: 0
}, false, "scala.collection.immutable.$colon$colon", {
  sci_$colon$colon: 1,
  sci_List: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  s_Product: 1,
  sc_LinearSeqOptimized: 1,
  Ljava_io_Serializable: 1,
  s_Serializable: 1
});
$c_sci_$colon$colon.prototype.$classData = $d_sci_$colon$colon;
/** @constructor */
function $c_sci_Nil$() {
  $c_sci_List.call(this)
}
$c_sci_Nil$.prototype = new $h_sci_List();
$c_sci_Nil$.prototype.constructor = $c_sci_Nil$;
/** @constructor */
function $h_sci_Nil$() {
  /*<skip>*/
}
$h_sci_Nil$.prototype = $c_sci_Nil$.prototype;
$c_sci_Nil$.prototype.init___ = (function() {
  return this
});
$c_sci_Nil$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
$c_sci_Nil$.prototype.productPrefix__T = (function() {
  return "Nil"
});
$c_sci_Nil$.prototype.productArity__I = (function() {
  return 0
});
$c_sci_Nil$.prototype.equals__O__Z = (function(that) {
  if ($is_sc_GenSeq(that)) {
    var x2 = $as_sc_GenSeq(that);
    return x2.isEmpty__Z()
  } else {
    return false
  }
});
$c_sci_Nil$.prototype.tail__sci_List = (function() {
  throw new $c_jl_UnsupportedOperationException().init___T("tail of empty list")
});
$c_sci_Nil$.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_Nil$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_sci_Nil$.prototype.head__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("head of empty list")
});
$c_sci_Nil$.prototype.tail__O = (function() {
  return this.tail__sci_List()
});
$c_sci_Nil$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_sci_Nil$ = new $TypeData().initClass({
  sci_Nil$: 0
}, false, "scala.collection.immutable.Nil$", {
  sci_Nil$: 1,
  sci_List: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  s_Product: 1,
  sc_LinearSeqOptimized: 1,
  Ljava_io_Serializable: 1,
  s_Serializable: 1
});
$c_sci_Nil$.prototype.$classData = $d_sci_Nil$;
var $n_sci_Nil$ = (void 0);
function $m_sci_Nil$() {
  if ((!$n_sci_Nil$)) {
    $n_sci_Nil$ = new $c_sci_Nil$().init___()
  };
  return $n_sci_Nil$
}
/** @constructor */
function $c_scm_AbstractSet() {
  $c_scm_AbstractIterable.call(this)
}
$c_scm_AbstractSet.prototype = new $h_scm_AbstractIterable();
$c_scm_AbstractSet.prototype.constructor = $c_scm_AbstractSet;
/** @constructor */
function $h_scm_AbstractSet() {
  /*<skip>*/
}
$h_scm_AbstractSet.prototype = $c_scm_AbstractSet.prototype;
$c_scm_AbstractSet.prototype.isEmpty__Z = (function() {
  return $s_sc_SetLike$class__isEmpty__sc_SetLike__Z(this)
});
$c_scm_AbstractSet.prototype.equals__O__Z = (function(that) {
  return $s_sc_GenSetLike$class__equals__sc_GenSetLike__O__Z(this, that)
});
$c_scm_AbstractSet.prototype.toString__T = (function() {
  return $s_sc_TraversableLike$class__toString__sc_TraversableLike__T(this)
});
$c_scm_AbstractSet.prototype.subsetOf__sc_GenSet__Z = (function(that) {
  var this$1 = new $c_scm_FlatHashTable$$anon$1().init___scm_FlatHashTable(this);
  return $s_sc_Iterator$class__forall__sc_Iterator__F1__Z(this$1, that)
});
$c_scm_AbstractSet.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  return this$1.unorderedHash__sc_TraversableOnce__I__I(this, this$1.setSeed$2)
});
$c_scm_AbstractSet.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_AbstractSet.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_HashSet().init___()
});
$c_scm_AbstractSet.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
$c_scm_AbstractSet.prototype.stringPrefix__T = (function() {
  return "Set"
});
/** @constructor */
function $c_scm_AbstractBuffer() {
  $c_scm_AbstractSeq.call(this)
}
$c_scm_AbstractBuffer.prototype = new $h_scm_AbstractSeq();
$c_scm_AbstractBuffer.prototype.constructor = $c_scm_AbstractBuffer;
/** @constructor */
function $h_scm_AbstractBuffer() {
  /*<skip>*/
}
$h_scm_AbstractBuffer.prototype = $c_scm_AbstractBuffer.prototype;
$c_scm_AbstractBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
/** @constructor */
function $c_scm_HashSet() {
  $c_scm_AbstractSet.call(this);
  this.$$undloadFactor$5 = 0;
  this.table$5 = null;
  this.tableSize$5 = 0;
  this.threshold$5 = 0;
  this.sizemap$5 = null;
  this.seedvalue$5 = 0
}
$c_scm_HashSet.prototype = new $h_scm_AbstractSet();
$c_scm_HashSet.prototype.constructor = $c_scm_HashSet;
/** @constructor */
function $h_scm_HashSet() {
  /*<skip>*/
}
$h_scm_HashSet.prototype = $c_scm_HashSet.prototype;
$c_scm_HashSet.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_HashSet.prototype.init___ = (function() {
  $c_scm_HashSet.prototype.init___scm_FlatHashTable$Contents.call(this, null);
  return this
});
$c_scm_HashSet.prototype.apply__O__O = (function(v1) {
  return $s_scm_FlatHashTable$class__containsElem__scm_FlatHashTable__O__Z(this, v1)
});
$c_scm_HashSet.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_HashSet.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_HashSet(elem)
});
$c_scm_HashSet.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_HashSet$()
});
$c_scm_HashSet.prototype.foreach__F1__V = (function(f) {
  var i = 0;
  var len = this.table$5.u.length;
  while ((i < len)) {
    var curEntry = this.table$5.u[i];
    if ((curEntry !== null)) {
      f.apply__O__O($s_scm_FlatHashTable$HashUtils$class__entryToElem__scm_FlatHashTable$HashUtils__O__O(this, curEntry))
    };
    i = ((1 + i) | 0)
  }
});
$c_scm_HashSet.prototype.size__I = (function() {
  return this.tableSize$5
});
$c_scm_HashSet.prototype.result__O = (function() {
  return this
});
$c_scm_HashSet.prototype.iterator__sc_Iterator = (function() {
  return new $c_scm_FlatHashTable$$anon$1().init___scm_FlatHashTable(this)
});
$c_scm_HashSet.prototype.init___scm_FlatHashTable$Contents = (function(contents) {
  $s_scm_FlatHashTable$class__$$init$__scm_FlatHashTable__V(this);
  $s_scm_FlatHashTable$class__initWithContents__scm_FlatHashTable__scm_FlatHashTable$Contents__V(this, contents);
  return this
});
$c_scm_HashSet.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_HashSet(elem)
});
$c_scm_HashSet.prototype.$$plus__O__sc_Set = (function(elem) {
  var this$1 = new $c_scm_HashSet().init___();
  var this$2 = $as_scm_HashSet($s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this$1, this));
  return this$2.$$plus$eq__O__scm_HashSet(elem)
});
$c_scm_HashSet.prototype.$$plus$eq__O__scm_HashSet = (function(elem) {
  $s_scm_FlatHashTable$class__addElem__scm_FlatHashTable__O__Z(this, elem);
  return this
});
function $is_scm_HashSet(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_HashSet)))
}
function $as_scm_HashSet(obj) {
  return (($is_scm_HashSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.HashSet"))
}
function $isArrayOf_scm_HashSet(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_HashSet)))
}
function $asArrayOf_scm_HashSet(obj, depth) {
  return (($isArrayOf_scm_HashSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.HashSet;", depth))
}
var $d_scm_HashSet = new $TypeData().initClass({
  scm_HashSet: 0
}, false, "scala.collection.mutable.HashSet", {
  scm_HashSet: 1,
  scm_AbstractSet: 1,
  scm_AbstractIterable: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_Set: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  scm_SetLike: 1,
  sc_script_Scriptable: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_FlatHashTable: 1,
  scm_FlatHashTable$HashUtils: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_HashSet.prototype.$classData = $d_scm_HashSet;
/** @constructor */
function $c_scm_ListBuffer() {
  $c_scm_AbstractBuffer.call(this);
  this.scala$collection$mutable$ListBuffer$$start$6 = null;
  this.last0$6 = null;
  this.exported$6 = false;
  this.len$6 = 0
}
$c_scm_ListBuffer.prototype = new $h_scm_AbstractBuffer();
$c_scm_ListBuffer.prototype.constructor = $c_scm_ListBuffer;
/** @constructor */
function $h_scm_ListBuffer() {
  /*<skip>*/
}
$h_scm_ListBuffer.prototype = $c_scm_ListBuffer.prototype;
$c_scm_ListBuffer.prototype.copy__p6__V = (function() {
  if (this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()) {
    return (void 0)
  };
  var cursor = this.scala$collection$mutable$ListBuffer$$start$6;
  var this$1 = this.last0$6;
  var limit = this$1.tl$5;
  this.clear__V();
  while ((cursor !== limit)) {
    this.$$plus$eq__O__scm_ListBuffer(cursor.head__O());
    var this$2 = cursor;
    cursor = this$2.tail__sci_List()
  }
});
$c_scm_ListBuffer.prototype.init___ = (function() {
  this.scala$collection$mutable$ListBuffer$$start$6 = $m_sci_Nil$();
  this.exported$6 = false;
  this.len$6 = 0;
  return this
});
$c_scm_ListBuffer.prototype.apply__I__O = (function(n) {
  if (((n < 0) || (n >= this.len$6))) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
  } else {
    var this$2 = this.scala$collection$mutable$ListBuffer$$start$6;
    return $s_sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O(this$2, n)
  }
});
$c_scm_ListBuffer.prototype.lengthCompare__I__I = (function(len) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $s_sc_LinearSeqOptimized$class__lengthCompare__sc_LinearSeqOptimized__I__I(this$1, len)
});
$c_scm_ListBuffer.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $s_sc_LinearSeqOptimized$class__sameElements__sc_LinearSeqOptimized__sc_GenIterable__Z(this$1, that)
});
$c_scm_ListBuffer.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O($uI(v1))
});
$c_scm_ListBuffer.prototype.isEmpty__Z = (function() {
  return this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()
});
$c_scm_ListBuffer.prototype.toList__sci_List = (function() {
  this.exported$6 = (!this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z());
  return this.scala$collection$mutable$ListBuffer$$start$6
});
$c_scm_ListBuffer.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_ListBuffer.prototype.equals__O__Z = (function(that) {
  if ($is_scm_ListBuffer(that)) {
    var x2 = $as_scm_ListBuffer(that);
    return this.scala$collection$mutable$ListBuffer$$start$6.equals__O__Z(x2.scala$collection$mutable$ListBuffer$$start$6)
  } else {
    return $s_sc_GenSeqLike$class__equals__sc_GenSeqLike__O__Z(this, that)
  }
});
$c_scm_ListBuffer.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $s_sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this$1, start, sep, end)
});
$c_scm_ListBuffer.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_ListBuffer(elem)
});
$c_scm_ListBuffer.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_ListBuffer$()
});
$c_scm_ListBuffer.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  var these = this$1;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    var this$2 = these;
    these = this$2.tail__sci_List()
  }
});
$c_scm_ListBuffer.prototype.size__I = (function() {
  return this.len$6
});
$c_scm_ListBuffer.prototype.result__O = (function() {
  return this.toList__sci_List()
});
$c_scm_ListBuffer.prototype.iterator__sc_Iterator = (function() {
  return new $c_scm_ListBuffer$$anon$1().init___scm_ListBuffer(this)
});
$c_scm_ListBuffer.prototype.length__I = (function() {
  return this.len$6
});
$c_scm_ListBuffer.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_ListBuffer.prototype.toStream__sci_Stream = (function() {
  return this.scala$collection$mutable$ListBuffer$$start$6.toStream__sci_Stream()
});
$c_scm_ListBuffer.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $s_sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this$1, b, start, sep, end)
});
$c_scm_ListBuffer.prototype.$$plus$eq__O__scm_ListBuffer = (function(x) {
  if (this.exported$6) {
    this.copy__p6__V()
  };
  if (this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()) {
    this.last0$6 = new $c_sci_$colon$colon().init___O__sci_List(x, $m_sci_Nil$());
    this.scala$collection$mutable$ListBuffer$$start$6 = this.last0$6
  } else {
    var last1 = this.last0$6;
    this.last0$6 = new $c_sci_$colon$colon().init___O__sci_List(x, $m_sci_Nil$());
    last1.tl$5 = this.last0$6
  };
  this.len$6 = ((1 + this.len$6) | 0);
  return this
});
$c_scm_ListBuffer.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_ListBuffer(elem)
});
$c_scm_ListBuffer.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_ListBuffer.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  $s_sc_IterableLike$class__copyToArray__sc_IterableLike__O__I__I__V(this$1, xs, start, len)
});
$c_scm_ListBuffer.prototype.clear__V = (function() {
  this.scala$collection$mutable$ListBuffer$$start$6 = $m_sci_Nil$();
  this.last0$6 = null;
  this.exported$6 = false;
  this.len$6 = 0
});
$c_scm_ListBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer = (function(xs) {
  _$plus$plus$eq: while (true) {
    var x1 = xs;
    if ((x1 !== null)) {
      if ((x1 === this)) {
        var n = this.len$6;
        xs = $as_sc_TraversableOnce($s_sc_IterableLike$class__take__sc_IterableLike__I__O(this, n));
        continue _$plus$plus$eq
      }
    };
    return $as_scm_ListBuffer($s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ListBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(xs)
});
$c_scm_ListBuffer.prototype.stringPrefix__T = (function() {
  return "ListBuffer"
});
function $is_scm_ListBuffer(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ListBuffer)))
}
function $as_scm_ListBuffer(obj) {
  return (($is_scm_ListBuffer(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ListBuffer"))
}
function $isArrayOf_scm_ListBuffer(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ListBuffer)))
}
function $asArrayOf_scm_ListBuffer(obj, depth) {
  return (($isArrayOf_scm_ListBuffer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ListBuffer;", depth))
}
var $d_scm_ListBuffer = new $TypeData().initClass({
  scm_ListBuffer: 0
}, false, "scala.collection.mutable.ListBuffer", {
  scm_ListBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_Builder: 1,
  scg_SeqForwarder: 1,
  scg_IterableForwarder: 1,
  scg_TraversableForwarder: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ListBuffer.prototype.$classData = $d_scm_ListBuffer;
/** @constructor */
function $c_scm_StringBuilder() {
  $c_scm_AbstractSeq.call(this);
  this.underlying$5 = null
}
$c_scm_StringBuilder.prototype = new $h_scm_AbstractSeq();
$c_scm_StringBuilder.prototype.constructor = $c_scm_StringBuilder;
/** @constructor */
function $h_scm_StringBuilder() {
  /*<skip>*/
}
$h_scm_StringBuilder.prototype = $c_scm_StringBuilder.prototype;
$c_scm_StringBuilder.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_StringBuilder.prototype.init___ = (function() {
  $c_scm_StringBuilder.prototype.init___I__T.call(this, 16, "");
  return this
});
$c_scm_StringBuilder.prototype.$$plus$eq__C__scm_StringBuilder = (function(x) {
  this.append__C__scm_StringBuilder(x);
  return this
});
$c_scm_StringBuilder.prototype.apply__I__O = (function(idx) {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  var c = (65535 & $uI(thiz.charCodeAt(idx)));
  return new $c_jl_Character().init___C(c)
});
$c_scm_StringBuilder.prototype.lengthCompare__I__I = (function(len) {
  return $s_sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I(this, len)
});
$c_scm_StringBuilder.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  var c = (65535 & $uI(thiz.charCodeAt(index)));
  return new $c_jl_Character().init___C(c)
});
$c_scm_StringBuilder.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $s_sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
$c_scm_StringBuilder.prototype.isEmpty__Z = (function() {
  return $s_sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
$c_scm_StringBuilder.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_StringBuilder.prototype.subSequence__I__I__jl_CharSequence = (function(start, end) {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return $as_T(thiz.substring(start, end))
});
$c_scm_StringBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = $as_jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.$$plus$eq__C__scm_StringBuilder(jsx$1)
});
$c_scm_StringBuilder.prototype.toString__T = (function() {
  var this$1 = this.underlying$5;
  return this$1.content$1
});
$c_scm_StringBuilder.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_IndexedSeq$()
});
$c_scm_StringBuilder.prototype.foreach__F1__V = (function(f) {
  $s_sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V(this, f)
});
$c_scm_StringBuilder.prototype.result__O = (function() {
  var this$1 = this.underlying$5;
  return this$1.content$1
});
$c_scm_StringBuilder.prototype.append__T__scm_StringBuilder = (function(s) {
  this.underlying$5.append__T__jl_StringBuilder(s);
  return this
});
$c_scm_StringBuilder.prototype.seq__scm_Seq = (function() {
  return this
});
$c_scm_StringBuilder.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI(thiz.length))
});
$c_scm_StringBuilder.prototype.init___I__T = (function(initCapacity, initValue) {
  $c_scm_StringBuilder.prototype.init___jl_StringBuilder.call(this, new $c_jl_StringBuilder().init___I((($uI(initValue.length) + initCapacity) | 0)).append__T__jl_StringBuilder(initValue));
  return this
});
$c_scm_StringBuilder.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_StringBuilder.prototype.length__I = (function() {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return $uI(thiz.length)
});
$c_scm_StringBuilder.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_scm_StringBuilder.prototype.init___jl_StringBuilder = (function(underlying) {
  this.underlying$5 = underlying;
  return this
});
$c_scm_StringBuilder.prototype.append__O__scm_StringBuilder = (function(x) {
  this.underlying$5.append__T__jl_StringBuilder($m_sjsr_RuntimeString$().valueOf__O__T(x));
  return this
});
$c_scm_StringBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = $as_jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.$$plus$eq__C__scm_StringBuilder(jsx$1)
});
$c_scm_StringBuilder.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $s_sc_IndexedSeqOptimized$class__copyToArray__sc_IndexedSeqOptimized__O__I__I__V(this, xs, start, len)
});
$c_scm_StringBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_StringBuilder.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_scm_StringBuilder.prototype.append__C__scm_StringBuilder = (function(x) {
  this.underlying$5.append__C__jl_StringBuilder(x);
  return this
});
$c_scm_StringBuilder.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_GrowingBuilder().init___scg_Growable(new $c_scm_StringBuilder().init___())
});
$c_scm_StringBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_StringBuilder = new $TypeData().initClass({
  scm_StringBuilder: 0
}, false, "scala.collection.mutable.StringBuilder", {
  scm_StringBuilder: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  jl_CharSequence: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_StringBuilder.prototype.$classData = $d_scm_StringBuilder;
/** @constructor */
function $c_sjs_js_WrappedArray() {
  $c_scm_AbstractBuffer.call(this);
  this.array$6 = null
}
$c_sjs_js_WrappedArray.prototype = new $h_scm_AbstractBuffer();
$c_sjs_js_WrappedArray.prototype.constructor = $c_sjs_js_WrappedArray;
/** @constructor */
function $h_sjs_js_WrappedArray() {
  /*<skip>*/
}
$h_sjs_js_WrappedArray.prototype = $c_sjs_js_WrappedArray.prototype;
$c_sjs_js_WrappedArray.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.init___ = (function() {
  $c_sjs_js_WrappedArray.prototype.init___sjs_js_Array.call(this, []);
  return this
});
$c_sjs_js_WrappedArray.prototype.apply__I__O = (function(index) {
  return this.array$6[index]
});
$c_sjs_js_WrappedArray.prototype.lengthCompare__I__I = (function(len) {
  return $s_sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I(this, len)
});
$c_sjs_js_WrappedArray.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  return this.array$6[index]
});
$c_sjs_js_WrappedArray.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $s_sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
$c_sjs_js_WrappedArray.prototype.isEmpty__Z = (function() {
  return $s_sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
$c_sjs_js_WrappedArray.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  this.array$6.push(elem);
  return this
});
$c_sjs_js_WrappedArray.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sjs_js_WrappedArray$()
});
$c_sjs_js_WrappedArray.prototype.foreach__F1__V = (function(f) {
  $s_sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V(this, f)
});
$c_sjs_js_WrappedArray.prototype.result__O = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.seq__scm_Seq = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI(this.array$6.length))
});
$c_sjs_js_WrappedArray.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.length__I = (function() {
  return $uI(this.array$6.length)
});
$c_sjs_js_WrappedArray.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  this.array$6.push(elem);
  return this
});
$c_sjs_js_WrappedArray.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $s_sc_IndexedSeqOptimized$class__copyToArray__sc_IndexedSeqOptimized__O__I__I__V(this, xs, start, len)
});
$c_sjs_js_WrappedArray.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_sjs_js_WrappedArray.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sjs_js_WrappedArray.prototype.init___sjs_js_Array = (function(array) {
  this.array$6 = array;
  return this
});
$c_sjs_js_WrappedArray.prototype.stringPrefix__T = (function() {
  return "WrappedArray"
});
var $d_sjs_js_WrappedArray = new $TypeData().initClass({
  sjs_js_WrappedArray: 0
}, false, "scala.scalajs.js.WrappedArray", {
  sjs_js_WrappedArray: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1
});
$c_sjs_js_WrappedArray.prototype.$classData = $d_sjs_js_WrappedArray;
/** @constructor */
function $c_scm_ArrayBuffer() {
  $c_scm_AbstractBuffer.call(this);
  this.initialSize$6 = 0;
  this.array$6 = null;
  this.size0$6 = 0
}
$c_scm_ArrayBuffer.prototype = new $h_scm_AbstractBuffer();
$c_scm_ArrayBuffer.prototype.constructor = $c_scm_ArrayBuffer;
/** @constructor */
function $h_scm_ArrayBuffer() {
  /*<skip>*/
}
$h_scm_ArrayBuffer.prototype = $c_scm_ArrayBuffer.prototype;
$c_scm_ArrayBuffer.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.init___ = (function() {
  $c_scm_ArrayBuffer.prototype.init___I.call(this, 16);
  return this
});
$c_scm_ArrayBuffer.prototype.$$plus$eq__O__scm_ArrayBuffer = (function(elem) {
  var n = ((1 + this.size0$6) | 0);
  $s_scm_ResizableArray$class__ensureSize__scm_ResizableArray__I__V(this, n);
  this.array$6.u[this.size0$6] = elem;
  this.size0$6 = ((1 + this.size0$6) | 0);
  return this
});
$c_scm_ArrayBuffer.prototype.apply__I__O = (function(idx) {
  return $s_scm_ResizableArray$class__apply__scm_ResizableArray__I__O(this, idx)
});
$c_scm_ArrayBuffer.prototype.lengthCompare__I__I = (function(len) {
  return $s_sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I(this, len)
});
$c_scm_ArrayBuffer.prototype.apply__O__O = (function(v1) {
  var idx = $uI(v1);
  return $s_scm_ResizableArray$class__apply__scm_ResizableArray__I__O(this, idx)
});
$c_scm_ArrayBuffer.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $s_sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
$c_scm_ArrayBuffer.prototype.isEmpty__Z = (function() {
  return $s_sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
$c_scm_ArrayBuffer.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuffer(elem)
});
$c_scm_ArrayBuffer.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_ArrayBuffer$()
});
$c_scm_ArrayBuffer.prototype.foreach__F1__V = (function(f) {
  $s_scm_ResizableArray$class__foreach__scm_ResizableArray__F1__V(this, f)
});
$c_scm_ArrayBuffer.prototype.result__O = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.seq__scm_Seq = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, this.size0$6)
});
$c_scm_ArrayBuffer.prototype.init___I = (function(initialSize) {
  this.initialSize$6 = initialSize;
  $s_scm_ResizableArray$class__$$init$__scm_ResizableArray__V(this);
  return this
});
$c_scm_ArrayBuffer.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.length__I = (function() {
  return this.size0$6
});
$c_scm_ArrayBuffer.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer = (function(xs) {
  if ($is_sc_IndexedSeqLike(xs)) {
    var x2 = $as_sc_IndexedSeqLike(xs);
    var n = x2.length__I();
    var n$1 = ((this.size0$6 + n) | 0);
    $s_scm_ResizableArray$class__ensureSize__scm_ResizableArray__I__V(this, n$1);
    x2.copyToArray__O__I__I__V(this.array$6, this.size0$6, n);
    this.size0$6 = ((this.size0$6 + n) | 0);
    return this
  } else {
    return $as_scm_ArrayBuffer($s_scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ArrayBuffer.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuffer(elem)
});
$c_scm_ArrayBuffer.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $s_scm_ResizableArray$class__copyToArray__scm_ResizableArray__O__I__I__V(this, xs, start, len)
});
$c_scm_ArrayBuffer.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_scm_ArrayBuffer.prototype.sizeHint__I__V = (function(len) {
  if (((len > this.size0$6) && (len >= 1))) {
    var newarray = $newArrayObject($d_O.getArrayOf(), [len]);
    var src = this.array$6;
    var length = this.size0$6;
    $systemArraycopy(src, 0, newarray, 0, length);
    this.array$6 = newarray
  }
});
$c_scm_ArrayBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer(xs)
});
$c_scm_ArrayBuffer.prototype.stringPrefix__T = (function() {
  return "ArrayBuffer"
});
function $is_scm_ArrayBuffer(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuffer)))
}
function $as_scm_ArrayBuffer(obj) {
  return (($is_scm_ArrayBuffer(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuffer"))
}
function $isArrayOf_scm_ArrayBuffer(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuffer)))
}
function $asArrayOf_scm_ArrayBuffer(obj, depth) {
  return (($isArrayOf_scm_ArrayBuffer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuffer;", depth))
}
var $d_scm_ArrayBuffer = new $TypeData().initClass({
  scm_ArrayBuffer: 0
}, false, "scala.collection.mutable.ArrayBuffer", {
  scm_ArrayBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1,
  scm_ResizableArray: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuffer.prototype.$classData = $d_scm_ArrayBuffer;
}).call(this);
//# sourceMappingURL=scalajs_template-fastopt.js.map
