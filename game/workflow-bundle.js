var __TEMPORAL__;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@temporalio/common/lib/activity-options.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/activity-options.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ActivityCancellationType = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from coresdk.workflow_commands.ActivityCancellationType
var ActivityCancellationType;
(function (ActivityCancellationType) {
    ActivityCancellationType[ActivityCancellationType["TRY_CANCEL"] = 0] = "TRY_CANCEL";
    ActivityCancellationType[ActivityCancellationType["WAIT_CANCELLATION_COMPLETED"] = 1] = "WAIT_CANCELLATION_COMPLETED";
    ActivityCancellationType[ActivityCancellationType["ABANDON"] = 2] = "ABANDON";
})(ActivityCancellationType || (exports.ActivityCancellationType = ActivityCancellationType = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/data-converter.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/data-converter.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultDataConverter = exports.defaultFailureConverter = void 0;
const failure_converter_1 = __webpack_require__(/*! ./failure-converter */ "./node_modules/@temporalio/common/lib/converter/failure-converter.js");
const payload_converter_1 = __webpack_require__(/*! ./payload-converter */ "./node_modules/@temporalio/common/lib/converter/payload-converter.js");
/**
 * The default {@link FailureConverter} used by the SDK.
 *
 * Error messages and stack traces are serizalized as plain text.
 */
exports.defaultFailureConverter = new failure_converter_1.DefaultFailureConverter();
/**
 * A "loaded" data converter that uses the default set of failure and payload converters.
 */
exports.defaultDataConverter = {
    payloadConverter: payload_converter_1.defaultPayloadConverter,
    failureConverter: exports.defaultFailureConverter,
    payloadCodecs: [],
};


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/failure-converter.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/failure-converter.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DefaultFailureConverter = exports.cutoffStackTrace = void 0;
const failure_1 = __webpack_require__(/*! ../failure */ "./node_modules/@temporalio/common/lib/failure.js");
const type_helpers_1 = __webpack_require__(/*! ../type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
const payload_converter_1 = __webpack_require__(/*! ./payload-converter */ "./node_modules/@temporalio/common/lib/converter/payload-converter.js");
function combineRegExp(...regexps) {
    return new RegExp(regexps.map((x) => `(?:${x.source})`).join('|'));
}
/**
 * Stack traces will be cutoff when on of these patterns is matched
 */
const CUTOFF_STACK_PATTERNS = combineRegExp(
/** Activity execution */
/\s+at Activity\.execute \(.*[\\/]worker[\\/](?:src|lib)[\\/]activity\.[jt]s:\d+:\d+\)/, 
/** Workflow activation */
/\s+at Activator\.\S+NextHandler \(.*[\\/]workflow[\\/](?:src|lib)[\\/]internals\.[jt]s:\d+:\d+\)/, 
/** Workflow run anything in context */
/\s+at Script\.runInContext \((?:node:vm|vm\.js):\d+:\d+\)/);
/**
 * Any stack trace frames that match any of those wil be dopped.
 * The "null." prefix on some cases is to avoid https://github.com/nodejs/node/issues/42417
 */
const DROPPED_STACK_FRAMES_PATTERNS = combineRegExp(
/** Internal functions used to recursively chain interceptors */
/\s+at (null\.)?next \(.*[\\/]common[\\/](?:src|lib)[\\/]interceptors\.[jt]s:\d+:\d+\)/, 
/** Internal functions used to recursively chain interceptors */
/\s+at (null\.)?executeNextHandler \(.*[\\/]worker[\\/](?:src|lib)[\\/]activity\.[jt]s:\d+:\d+\)/);
/**
 * Cuts out the framework part of a stack trace, leaving only user code entries
 */
function cutoffStackTrace(stack) {
    const lines = (stack ?? '').split(/\r?\n/);
    const acc = Array();
    for (const line of lines) {
        if (CUTOFF_STACK_PATTERNS.test(line))
            break;
        if (!DROPPED_STACK_FRAMES_PATTERNS.test(line))
            acc.push(line);
    }
    return acc.join('\n');
}
exports.cutoffStackTrace = cutoffStackTrace;
/**
 * Default, cross-language-compatible Failure converter.
 *
 * By default, it will leave error messages and stack traces as plain text. In order to encrypt them, set
 * `encodeCommonAttributes` to `true` in the constructor options and use a {@link PayloadCodec} that can encrypt /
 * decrypt Payloads in your {@link WorkerOptions.dataConverter | Worker} and
 * {@link ClientOptions.dataConverter | Client options}.
 */
class DefaultFailureConverter {
    constructor(options) {
        const { encodeCommonAttributes } = options ?? {};
        this.options = {
            encodeCommonAttributes: encodeCommonAttributes ?? false,
        };
    }
    /**
     * Converts a Failure proto message to a JS Error object.
     *
     * Does not set common properties, that is done in {@link failureToError}.
     */
    failureToErrorInner(failure, payloadConverter) {
        if (failure.applicationFailureInfo) {
            return new failure_1.ApplicationFailure(failure.message ?? undefined, failure.applicationFailureInfo.type, Boolean(failure.applicationFailureInfo.nonRetryable), (0, payload_converter_1.arrayFromPayloads)(payloadConverter, failure.applicationFailureInfo.details?.payloads), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.serverFailureInfo) {
            return new failure_1.ServerFailure(failure.message ?? undefined, Boolean(failure.serverFailureInfo.nonRetryable), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.timeoutFailureInfo) {
            return new failure_1.TimeoutFailure(failure.message ?? undefined, (0, payload_converter_1.fromPayloadsAtIndex)(payloadConverter, 0, failure.timeoutFailureInfo.lastHeartbeatDetails?.payloads), failure.timeoutFailureInfo.timeoutType ?? failure_1.TimeoutType.TIMEOUT_TYPE_UNSPECIFIED);
        }
        if (failure.terminatedFailureInfo) {
            return new failure_1.TerminatedFailure(failure.message ?? undefined, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.canceledFailureInfo) {
            return new failure_1.CancelledFailure(failure.message ?? undefined, (0, payload_converter_1.arrayFromPayloads)(payloadConverter, failure.canceledFailureInfo.details?.payloads), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.resetWorkflowFailureInfo) {
            return new failure_1.ApplicationFailure(failure.message ?? undefined, 'ResetWorkflow', false, (0, payload_converter_1.arrayFromPayloads)(payloadConverter, failure.resetWorkflowFailureInfo.lastHeartbeatDetails?.payloads), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.childWorkflowExecutionFailureInfo) {
            const { namespace, workflowType, workflowExecution, retryState } = failure.childWorkflowExecutionFailureInfo;
            if (!(workflowType?.name && workflowExecution)) {
                throw new TypeError('Missing attributes on childWorkflowExecutionFailureInfo');
            }
            return new failure_1.ChildWorkflowFailure(namespace ?? undefined, workflowExecution, workflowType.name, retryState ?? failure_1.RetryState.RETRY_STATE_UNSPECIFIED, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.activityFailureInfo) {
            if (!failure.activityFailureInfo.activityType?.name) {
                throw new TypeError('Missing activityType?.name on activityFailureInfo');
            }
            return new failure_1.ActivityFailure(failure.message ?? undefined, failure.activityFailureInfo.activityType.name, failure.activityFailureInfo.activityId ?? undefined, failure.activityFailureInfo.retryState ?? failure_1.RetryState.RETRY_STATE_UNSPECIFIED, failure.activityFailureInfo.identity ?? undefined, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        return new failure_1.TemporalFailure(failure.message ?? undefined, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
    }
    failureToError(failure, payloadConverter) {
        if (failure.encodedAttributes) {
            const attrs = payloadConverter.fromPayload(failure.encodedAttributes);
            // Don't apply encodedAttributes unless they conform to an expected schema
            if (typeof attrs === 'object' && attrs !== null) {
                const { message, stack_trace } = attrs;
                // Avoid mutating the argument
                failure = { ...failure };
                if (typeof message === 'string') {
                    failure.message = message;
                }
                if (typeof stack_trace === 'string') {
                    failure.stackTrace = stack_trace;
                }
            }
        }
        const err = this.failureToErrorInner(failure, payloadConverter);
        err.stack = failure.stackTrace ?? '';
        err.failure = failure;
        return err;
    }
    errorToFailure(err, payloadConverter) {
        const failure = this.errorToFailureInner(err, payloadConverter);
        if (this.options.encodeCommonAttributes) {
            const { message, stackTrace } = failure;
            failure.message = 'Encoded failure';
            failure.stackTrace = '';
            failure.encodedAttributes = payloadConverter.toPayload({ message, stack_trace: stackTrace });
        }
        return failure;
    }
    errorToFailureInner(err, payloadConverter) {
        if (err instanceof failure_1.TemporalFailure) {
            if (err.failure)
                return err.failure;
            const base = {
                message: err.message,
                stackTrace: cutoffStackTrace(err.stack),
                cause: this.optionalErrorToOptionalFailure(err.cause, payloadConverter),
                source: failure_1.FAILURE_SOURCE,
            };
            if (err instanceof failure_1.ActivityFailure) {
                return {
                    ...base,
                    activityFailureInfo: {
                        ...err,
                        activityType: { name: err.activityType },
                    },
                };
            }
            if (err instanceof failure_1.ChildWorkflowFailure) {
                return {
                    ...base,
                    childWorkflowExecutionFailureInfo: {
                        ...err,
                        workflowExecution: err.execution,
                        workflowType: { name: err.workflowType },
                    },
                };
            }
            if (err instanceof failure_1.ApplicationFailure) {
                return {
                    ...base,
                    applicationFailureInfo: {
                        type: err.type,
                        nonRetryable: err.nonRetryable,
                        details: err.details && err.details.length
                            ? { payloads: (0, payload_converter_1.toPayloads)(payloadConverter, ...err.details) }
                            : undefined,
                    },
                };
            }
            if (err instanceof failure_1.CancelledFailure) {
                return {
                    ...base,
                    canceledFailureInfo: {
                        details: err.details && err.details.length
                            ? { payloads: (0, payload_converter_1.toPayloads)(payloadConverter, ...err.details) }
                            : undefined,
                    },
                };
            }
            if (err instanceof failure_1.TimeoutFailure) {
                return {
                    ...base,
                    timeoutFailureInfo: {
                        timeoutType: err.timeoutType,
                        lastHeartbeatDetails: err.lastHeartbeatDetails
                            ? { payloads: (0, payload_converter_1.toPayloads)(payloadConverter, err.lastHeartbeatDetails) }
                            : undefined,
                    },
                };
            }
            if (err instanceof failure_1.ServerFailure) {
                return {
                    ...base,
                    serverFailureInfo: { nonRetryable: err.nonRetryable },
                };
            }
            if (err instanceof failure_1.TerminatedFailure) {
                return {
                    ...base,
                    terminatedFailureInfo: {},
                };
            }
            // Just a TemporalFailure
            return base;
        }
        const base = {
            source: failure_1.FAILURE_SOURCE,
        };
        if ((0, type_helpers_1.isError)(err)) {
            return {
                ...base,
                message: String(err.message) ?? '',
                stackTrace: cutoffStackTrace(err.stack),
                cause: this.optionalErrorToOptionalFailure(err.cause, payloadConverter),
            };
        }
        const recommendation = ` [A non-Error value was thrown from your code. We recommend throwing Error objects so that we can provide a stack trace]`;
        if (typeof err === 'string') {
            return { ...base, message: err + recommendation };
        }
        if (typeof err === 'object') {
            let message = '';
            try {
                message = JSON.stringify(err);
            }
            catch (_err) {
                message = String(err);
            }
            return { ...base, message: message + recommendation };
        }
        return { ...base, message: String(err) + recommendation };
    }
    /**
     * Converts a Failure proto message to a JS Error object if defined or returns undefined.
     */
    optionalFailureToOptionalError(failure, payloadConverter) {
        return failure ? this.failureToError(failure, payloadConverter) : undefined;
    }
    /**
     * Converts an error to a Failure proto message if defined or returns undefined
     */
    optionalErrorToOptionalFailure(err, payloadConverter) {
        return err ? this.errorToFailure(err, payloadConverter) : undefined;
    }
}
exports.DefaultFailureConverter = DefaultFailureConverter;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/payload-codec.js":
/*!************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/payload-codec.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/payload-converter.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/payload-converter.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultPayloadConverter = exports.DefaultPayloadConverter = exports.searchAttributePayloadConverter = exports.SearchAttributePayloadConverter = exports.JsonPayloadConverter = exports.BinaryPayloadConverter = exports.UndefinedPayloadConverter = exports.CompositePayloadConverter = exports.mapFromPayloads = exports.arrayFromPayloads = exports.fromPayloadsAtIndex = exports.mapToPayloads = exports.toPayloads = void 0;
const encoding_1 = __webpack_require__(/*! ../encoding */ "./node_modules/@temporalio/common/lib/encoding.js");
const errors_1 = __webpack_require__(/*! ../errors */ "./node_modules/@temporalio/common/lib/errors.js");
const types_1 = __webpack_require__(/*! ./types */ "./node_modules/@temporalio/common/lib/converter/types.js");
/**
 * Implements conversion of a list of values.
 *
 * @param converter
 * @param values JS values to convert to Payloads
 * @return list of {@link Payload}s
 * @throws {@link ValueError} if conversion of the value passed as parameter failed for any
 *     reason.
 */
function toPayloads(converter, ...values) {
    if (values.length === 0) {
        return undefined;
    }
    return values.map((value) => converter.toPayload(value));
}
exports.toPayloads = toPayloads;
/**
 * Run {@link PayloadConverter.toPayload} on each value in the map.
 *
 * @throws {@link ValueError} if conversion of any value in the map fails
 */
function mapToPayloads(converter, map) {
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, converter.toPayload(v)]));
}
exports.mapToPayloads = mapToPayloads;
/**
 * Implements conversion of an array of values of different types. Useful for deserializing
 * arguments of function invocations.
 *
 * @param converter
 * @param index index of the value in the payloads
 * @param payloads serialized value to convert to JS values.
 * @return converted JS value
 * @throws {@link PayloadConverterError} if conversion of the data passed as parameter failed for any
 *     reason.
 */
function fromPayloadsAtIndex(converter, index, payloads) {
    // To make adding arguments a backwards compatible change
    if (payloads === undefined || payloads === null || index >= payloads.length) {
        return undefined;
    }
    return converter.fromPayload(payloads[index]);
}
exports.fromPayloadsAtIndex = fromPayloadsAtIndex;
/**
 * Run {@link PayloadConverter.fromPayload} on each value in the array.
 */
function arrayFromPayloads(converter, payloads) {
    if (!payloads) {
        return [];
    }
    return payloads.map((payload) => converter.fromPayload(payload));
}
exports.arrayFromPayloads = arrayFromPayloads;
function mapFromPayloads(converter, map) {
    if (map == null)
        return map;
    return Object.fromEntries(Object.entries(map).map(([k, payload]) => {
        const value = converter.fromPayload(payload);
        return [k, value];
    }));
}
exports.mapFromPayloads = mapFromPayloads;
/**
 * Tries to convert values to {@link Payload}s using the {@link PayloadConverterWithEncoding}s provided to the constructor, in the order provided.
 *
 * Converts Payloads to values based on the `Payload.metadata.encoding` field, which matches the {@link PayloadConverterWithEncoding.encodingType}
 * of the converter that created the Payload.
 */
class CompositePayloadConverter {
    constructor(...converters) {
        this.converterByEncoding = new Map();
        if (converters.length === 0) {
            throw new errors_1.PayloadConverterError('Must provide at least one PayloadConverterWithEncoding');
        }
        this.converters = converters;
        for (const converter of converters) {
            this.converterByEncoding.set(converter.encodingType, converter);
        }
    }
    /**
     * Tries to run `.toPayload(value)` on each converter in the order provided at construction.
     * Returns the first successful result, throws {@link ValueError} if there is no converter that can handle the value.
     */
    toPayload(value) {
        for (const converter of this.converters) {
            const result = converter.toPayload(value);
            if (result !== undefined) {
                return result;
            }
        }
        throw new errors_1.ValueError(`Unable to convert ${value} to payload`);
    }
    /**
     * Run {@link PayloadConverterWithEncoding.fromPayload} based on the `encoding` metadata of the {@link Payload}.
     */
    fromPayload(payload) {
        if (payload.metadata === undefined || payload.metadata === null) {
            throw new errors_1.ValueError('Missing payload metadata');
        }
        const encoding = (0, encoding_1.decode)(payload.metadata[types_1.METADATA_ENCODING_KEY]);
        const converter = this.converterByEncoding.get(encoding);
        if (converter === undefined) {
            throw new errors_1.ValueError(`Unknown encoding: ${encoding}`);
        }
        return converter.fromPayload(payload);
    }
}
exports.CompositePayloadConverter = CompositePayloadConverter;
/**
 * Converts between JS undefined and NULL Payload
 */
class UndefinedPayloadConverter {
    constructor() {
        this.encodingType = types_1.encodingTypes.METADATA_ENCODING_NULL;
    }
    toPayload(value) {
        if (value !== undefined) {
            return undefined;
        }
        return {
            metadata: {
                [types_1.METADATA_ENCODING_KEY]: types_1.encodingKeys.METADATA_ENCODING_NULL,
            },
        };
    }
    fromPayload(_content) {
        return undefined; // Just return undefined
    }
}
exports.UndefinedPayloadConverter = UndefinedPayloadConverter;
/**
 * Converts between binary data types and RAW Payload
 */
class BinaryPayloadConverter {
    constructor() {
        this.encodingType = types_1.encodingTypes.METADATA_ENCODING_RAW;
    }
    toPayload(value) {
        if (!(value instanceof Uint8Array)) {
            return undefined;
        }
        return {
            metadata: {
                [types_1.METADATA_ENCODING_KEY]: types_1.encodingKeys.METADATA_ENCODING_RAW,
            },
            data: value,
        };
    }
    fromPayload(content) {
        return (
        // Wrap with Uint8Array from this context to ensure `instanceof` works
        (content.data ? new Uint8Array(content.data.buffer, content.data.byteOffset, content.data.length) : content.data));
    }
}
exports.BinaryPayloadConverter = BinaryPayloadConverter;
/**
 * Converts between non-undefined values and serialized JSON Payload
 */
class JsonPayloadConverter {
    constructor() {
        this.encodingType = types_1.encodingTypes.METADATA_ENCODING_JSON;
    }
    toPayload(value) {
        if (value === undefined) {
            return undefined;
        }
        let json;
        try {
            json = JSON.stringify(value);
        }
        catch (err) {
            return undefined;
        }
        return {
            metadata: {
                [types_1.METADATA_ENCODING_KEY]: types_1.encodingKeys.METADATA_ENCODING_JSON,
            },
            data: (0, encoding_1.encode)(json),
        };
    }
    fromPayload(content) {
        if (content.data === undefined || content.data === null) {
            throw new errors_1.ValueError('Got payload with no data');
        }
        return JSON.parse((0, encoding_1.decode)(content.data));
    }
}
exports.JsonPayloadConverter = JsonPayloadConverter;
/**
 * Converts Search Attribute values using JsonPayloadConverter
 */
class SearchAttributePayloadConverter {
    constructor() {
        this.jsonConverter = new JsonPayloadConverter();
        this.validNonDateTypes = ['string', 'number', 'boolean'];
    }
    toPayload(values) {
        if (!Array.isArray(values)) {
            throw new errors_1.ValueError(`SearchAttribute value must be an array`);
        }
        if (values.length > 0) {
            const firstValue = values[0];
            const firstType = typeof firstValue;
            if (firstType === 'object') {
                for (const [idx, value] of values.entries()) {
                    if (!(value instanceof Date)) {
                        throw new errors_1.ValueError(`SearchAttribute values must arrays of strings, numbers, booleans, or Dates. The value ${value} at index ${idx} is of type ${typeof value}`);
                    }
                }
            }
            else {
                if (!this.validNonDateTypes.includes(firstType)) {
                    throw new errors_1.ValueError(`SearchAttribute array values must be: string | number | boolean | Date`);
                }
                for (const [idx, value] of values.entries()) {
                    if (typeof value !== firstType) {
                        throw new errors_1.ValueError(`All SearchAttribute array values must be of the same type. The first value ${firstValue} of type ${firstType} doesn't match value ${value} of type ${typeof value} at index ${idx}`);
                    }
                }
            }
        }
        // JSON.stringify takes care of converting Dates to ISO strings
        const ret = this.jsonConverter.toPayload(values);
        if (ret === undefined) {
            throw new errors_1.ValueError('Could not convert search attributes to payloads');
        }
        return ret;
    }
    /**
     * Datetime Search Attribute values are converted to `Date`s
     */
    fromPayload(payload) {
        if (payload.metadata === undefined || payload.metadata === null) {
            throw new errors_1.ValueError('Missing payload metadata');
        }
        const value = this.jsonConverter.fromPayload(payload);
        let arrayWrappedValue = Array.isArray(value) ? value : [value];
        const searchAttributeType = (0, encoding_1.decode)(payload.metadata.type);
        if (searchAttributeType === 'Datetime') {
            arrayWrappedValue = arrayWrappedValue.map((dateString) => new Date(dateString));
        }
        return arrayWrappedValue;
    }
}
exports.SearchAttributePayloadConverter = SearchAttributePayloadConverter;
exports.searchAttributePayloadConverter = new SearchAttributePayloadConverter();
class DefaultPayloadConverter extends CompositePayloadConverter {
    // Match the order used in other SDKs, but exclude Protobuf converters so that the code, including
    // `proto3-json-serializer`, doesn't take space in Workflow bundles that don't use Protobufs. To use Protobufs, use
    // {@link DefaultPayloadConverterWithProtobufs}.
    //
    // Go SDK:
    // https://github.com/temporalio/sdk-go/blob/5e5645f0c550dcf717c095ae32c76a7087d2e985/converter/default_data_converter.go#L28
    constructor() {
        super(new UndefinedPayloadConverter(), new BinaryPayloadConverter(), new JsonPayloadConverter());
    }
}
exports.DefaultPayloadConverter = DefaultPayloadConverter;
/**
 * The default {@link PayloadConverter} used by the SDK. Supports `Uint8Array` and JSON serializables (so if
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description | `JSON.stringify(yourArgOrRetval)`}
 * works, the default payload converter will work).
 *
 * To also support Protobufs, create a custom payload converter with {@link DefaultPayloadConverter}:
 *
 * `const myConverter = new DefaultPayloadConverter({ protobufRoot })`
 */
exports.defaultPayloadConverter = new DefaultPayloadConverter();


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/types.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/types.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.METADATA_MESSAGE_TYPE_KEY = exports.encodingKeys = exports.encodingTypes = exports.METADATA_ENCODING_KEY = void 0;
const encoding_1 = __webpack_require__(/*! ../encoding */ "./node_modules/@temporalio/common/lib/encoding.js");
exports.METADATA_ENCODING_KEY = 'encoding';
exports.encodingTypes = {
    METADATA_ENCODING_NULL: 'binary/null',
    METADATA_ENCODING_RAW: 'binary/plain',
    METADATA_ENCODING_JSON: 'json/plain',
    METADATA_ENCODING_PROTOBUF_JSON: 'json/protobuf',
    METADATA_ENCODING_PROTOBUF: 'binary/protobuf',
};
exports.encodingKeys = {
    METADATA_ENCODING_NULL: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_NULL),
    METADATA_ENCODING_RAW: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_RAW),
    METADATA_ENCODING_JSON: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_JSON),
    METADATA_ENCODING_PROTOBUF_JSON: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_PROTOBUF_JSON),
    METADATA_ENCODING_PROTOBUF: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_PROTOBUF),
};
exports.METADATA_MESSAGE_TYPE_KEY = 'messageType';


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/deprecated-time.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/deprecated-time.js ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.optionalTsToDate = exports.tsToDate = exports.msToNumber = exports.msOptionalToNumber = exports.msOptionalToTs = exports.msToTs = exports.msNumberToTs = exports.tsToMs = exports.optionalTsToMs = void 0;
const time = __importStar(__webpack_require__(/*! ./time */ "./node_modules/@temporalio/common/lib/time.js"));
/**
 * Lossy conversion function from Timestamp to number due to possible overflow.
 * If ts is null or undefined returns undefined.
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function optionalTsToMs(ts) {
    return time.optionalTsToMs(ts);
}
exports.optionalTsToMs = optionalTsToMs;
/**
 * Lossy conversion function from Timestamp to number due to possible overflow
 *
 * @hidden
 * @deprecated - meant for internal use only
 * @deprecated - meant for internal use only
 */
function tsToMs(ts) {
    return time.tsToMs(ts);
}
exports.tsToMs = tsToMs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msNumberToTs(millis) {
    return time.msNumberToTs(millis);
}
exports.msNumberToTs = msNumberToTs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msToTs(str) {
    return time.msToTs(str);
}
exports.msToTs = msToTs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msOptionalToTs(str) {
    return time.msOptionalToTs(str);
}
exports.msOptionalToTs = msOptionalToTs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msOptionalToNumber(val) {
    return time.msOptionalToNumber(val);
}
exports.msOptionalToNumber = msOptionalToNumber;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msToNumber(val) {
    return time.msToNumber(val);
}
exports.msToNumber = msToNumber;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function tsToDate(ts) {
    return time.tsToDate(ts);
}
exports.tsToDate = tsToDate;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function optionalTsToDate(ts) {
    return time.optionalTsToDate(ts);
}
exports.optionalTsToDate = optionalTsToDate;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/encoding.js":
/*!*********************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/encoding.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// Pasted with modifications from: https://raw.githubusercontent.com/anonyco/FastestSmallestTextEncoderDecoder/master/EncoderDecoderTogether.src.js
/* eslint no-fallthrough: 0 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decode = exports.encode = exports.TextEncoder = exports.TextDecoder = void 0;
const fromCharCode = String.fromCharCode;
const encoderRegexp = /[\x80-\uD7ff\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]?/g;
const tmpBufferU16 = new Uint16Array(32);
class TextDecoder {
    decode(inputArrayOrBuffer) {
        const inputAs8 = inputArrayOrBuffer instanceof Uint8Array ? inputArrayOrBuffer : new Uint8Array(inputArrayOrBuffer);
        let resultingString = '', tmpStr = '', index = 0, nextEnd = 0, cp0 = 0, codePoint = 0, minBits = 0, cp1 = 0, pos = 0, tmp = -1;
        const len = inputAs8.length | 0;
        const lenMinus32 = (len - 32) | 0;
        // Note that tmp represents the 2nd half of a surrogate pair incase a surrogate gets divided between blocks
        for (; index < len;) {
            nextEnd = index <= lenMinus32 ? 32 : (len - index) | 0;
            for (; pos < nextEnd; index = (index + 1) | 0, pos = (pos + 1) | 0) {
                cp0 = inputAs8[index] & 0xff;
                switch (cp0 >> 4) {
                    case 15:
                        cp1 = inputAs8[(index = (index + 1) | 0)] & 0xff;
                        if (cp1 >> 6 !== 0b10 || 0b11110111 < cp0) {
                            index = (index - 1) | 0;
                            break;
                        }
                        codePoint = ((cp0 & 0b111) << 6) | (cp1 & 0b00111111);
                        minBits = 5; // 20 ensures it never passes -> all invalid replacements
                        cp0 = 0x100; //  keep track of th bit size
                    case 14:
                        cp1 = inputAs8[(index = (index + 1) | 0)] & 0xff;
                        codePoint <<= 6;
                        codePoint |= ((cp0 & 0b1111) << 6) | (cp1 & 0b00111111);
                        minBits = cp1 >> 6 === 0b10 ? (minBits + 4) | 0 : 24; // 24 ensures it never passes -> all invalid replacements
                        cp0 = (cp0 + 0x100) & 0x300; // keep track of th bit size
                    case 13:
                    case 12:
                        cp1 = inputAs8[(index = (index + 1) | 0)] & 0xff;
                        codePoint <<= 6;
                        codePoint |= ((cp0 & 0b11111) << 6) | (cp1 & 0b00111111);
                        minBits = (minBits + 7) | 0;
                        // Now, process the code point
                        if (index < len && cp1 >> 6 === 0b10 && codePoint >> minBits && codePoint < 0x110000) {
                            cp0 = codePoint;
                            codePoint = (codePoint - 0x10000) | 0;
                            if (0 <= codePoint /*0xffff < codePoint*/) {
                                // BMP code point
                                //nextEnd = nextEnd - 1|0;
                                tmp = ((codePoint >> 10) + 0xd800) | 0; // highSurrogate
                                cp0 = ((codePoint & 0x3ff) + 0xdc00) | 0; // lowSurrogate (will be inserted later in the switch-statement)
                                if (pos < 31) {
                                    // notice 31 instead of 32
                                    tmpBufferU16[pos] = tmp;
                                    pos = (pos + 1) | 0;
                                    tmp = -1;
                                }
                                else {
                                    // else, we are at the end of the inputAs8 and let tmp0 be filled in later on
                                    // NOTE that cp1 is being used as a temporary variable for the swapping of tmp with cp0
                                    cp1 = tmp;
                                    tmp = cp0;
                                    cp0 = cp1;
                                }
                            }
                            else
                                nextEnd = (nextEnd + 1) | 0; // because we are advancing i without advancing pos
                        }
                        else {
                            // invalid code point means replacing the whole thing with null replacement characters
                            cp0 >>= 8;
                            index = (index - cp0 - 1) | 0; // reset index  back to what it was before
                            cp0 = 0xfffd;
                        }
                        // Finally, reset the variables for the next go-around
                        minBits = 0;
                        codePoint = 0;
                        nextEnd = index <= lenMinus32 ? 32 : (len - index) | 0;
                    /*case 11:
                  case 10:
                  case 9:
                  case 8:
                    codePoint ? codePoint = 0 : cp0 = 0xfffd; // fill with invalid replacement character
                  case 7:
                  case 6:
                  case 5:
                  case 4:
                  case 3:
                  case 2:
                  case 1:
                  case 0:
                    tmpBufferU16[pos] = cp0;
                    continue;*/
                    default: // fill with invalid replacement character
                        tmpBufferU16[pos] = cp0;
                        continue;
                    case 11:
                    case 10:
                    case 9:
                    case 8:
                }
                tmpBufferU16[pos] = 0xfffd; // fill with invalid replacement character
            }
            tmpStr += fromCharCode(tmpBufferU16[0], tmpBufferU16[1], tmpBufferU16[2], tmpBufferU16[3], tmpBufferU16[4], tmpBufferU16[5], tmpBufferU16[6], tmpBufferU16[7], tmpBufferU16[8], tmpBufferU16[9], tmpBufferU16[10], tmpBufferU16[11], tmpBufferU16[12], tmpBufferU16[13], tmpBufferU16[14], tmpBufferU16[15], tmpBufferU16[16], tmpBufferU16[17], tmpBufferU16[18], tmpBufferU16[19], tmpBufferU16[20], tmpBufferU16[21], tmpBufferU16[22], tmpBufferU16[23], tmpBufferU16[24], tmpBufferU16[25], tmpBufferU16[26], tmpBufferU16[27], tmpBufferU16[28], tmpBufferU16[29], tmpBufferU16[30], tmpBufferU16[31]);
            if (pos < 32)
                tmpStr = tmpStr.slice(0, (pos - 32) | 0); //-(32-pos));
            if (index < len) {
                //fromCharCode.apply(0, tmpBufferU16 : Uint8Array ?  tmpBufferU16.subarray(0,pos) : tmpBufferU16.slice(0,pos));
                tmpBufferU16[0] = tmp;
                pos = ~tmp >>> 31; //tmp !== -1 ? 1 : 0;
                tmp = -1;
                if (tmpStr.length < resultingString.length)
                    continue;
            }
            else if (tmp !== -1) {
                tmpStr += fromCharCode(tmp);
            }
            resultingString += tmpStr;
            tmpStr = '';
        }
        return resultingString;
    }
}
exports.TextDecoder = TextDecoder;
//////////////////////////////////////////////////////////////////////////////////////
function encoderReplacer(nonAsciiChars) {
    // make the UTF string into a binary UTF-8 encoded string
    let point = nonAsciiChars.charCodeAt(0) | 0;
    if (0xd800 <= point) {
        if (point <= 0xdbff) {
            const nextcode = nonAsciiChars.charCodeAt(1) | 0; // defaults to 0 when NaN, causing null replacement character
            if (0xdc00 <= nextcode && nextcode <= 0xdfff) {
                //point = ((point - 0xD800)<<10) + nextcode - 0xDC00 + 0x10000|0;
                point = ((point << 10) + nextcode - 0x35fdc00) | 0;
                if (point > 0xffff)
                    return fromCharCode((0x1e /*0b11110*/ << 3) | (point >> 18), (0x2 /*0b10*/ << 6) | ((point >> 12) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/);
            }
            else
                point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
        }
        else if (point <= 0xdfff) {
            point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
        }
    }
    /*if (point <= 0x007f) return nonAsciiChars;
    else */ if (point <= 0x07ff) {
        return fromCharCode((0x6 << 5) | (point >> 6), (0x2 << 6) | (point & 0x3f));
    }
    else
        return fromCharCode((0xe /*0b1110*/ << 4) | (point >> 12), (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/);
}
class TextEncoder {
    encode(inputString) {
        // 0xc0 => 0b11000000; 0xff => 0b11111111; 0xc0-0xff => 0b11xxxxxx
        // 0x80 => 0b10000000; 0xbf => 0b10111111; 0x80-0xbf => 0b10xxxxxx
        const encodedString = inputString === void 0 ? '' : '' + inputString, len = encodedString.length | 0;
        let result = new Uint8Array(((len << 1) + 8) | 0);
        let tmpResult;
        let i = 0, pos = 0, point = 0, nextcode = 0;
        let upgradededArraySize = !Uint8Array; // normal arrays are auto-expanding
        for (i = 0; i < len; i = (i + 1) | 0, pos = (pos + 1) | 0) {
            point = encodedString.charCodeAt(i) | 0;
            if (point <= 0x007f) {
                result[pos] = point;
            }
            else if (point <= 0x07ff) {
                result[pos] = (0x6 << 5) | (point >> 6);
                result[(pos = (pos + 1) | 0)] = (0x2 << 6) | (point & 0x3f);
            }
            else {
                widenCheck: {
                    if (0xd800 <= point) {
                        if (point <= 0xdbff) {
                            nextcode = encodedString.charCodeAt((i = (i + 1) | 0)) | 0; // defaults to 0 when NaN, causing null replacement character
                            if (0xdc00 <= nextcode && nextcode <= 0xdfff) {
                                //point = ((point - 0xD800)<<10) + nextcode - 0xDC00 + 0x10000|0;
                                point = ((point << 10) + nextcode - 0x35fdc00) | 0;
                                if (point > 0xffff) {
                                    result[pos] = (0x1e /*0b11110*/ << 3) | (point >> 18);
                                    result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | ((point >> 12) & 0x3f) /*0b00111111*/;
                                    result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/;
                                    result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/;
                                    continue;
                                }
                                break widenCheck;
                            }
                            point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
                        }
                        else if (point <= 0xdfff) {
                            point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
                        }
                    }
                    if (!upgradededArraySize && i << 1 < pos && i << 1 < ((pos - 7) | 0)) {
                        upgradededArraySize = true;
                        tmpResult = new Uint8Array(len * 3);
                        tmpResult.set(result);
                        result = tmpResult;
                    }
                }
                result[pos] = (0xe /*0b1110*/ << 4) | (point >> 12);
                result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/;
                result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/;
            }
        }
        return Uint8Array ? result.subarray(0, pos) : result.slice(0, pos);
    }
    encodeInto(inputString, u8Arr) {
        const encodedString = inputString === void 0 ? '' : ('' + inputString).replace(encoderRegexp, encoderReplacer);
        let len = encodedString.length | 0, i = 0, char = 0, read = 0;
        const u8ArrLen = u8Arr.length | 0;
        const inputLength = inputString.length | 0;
        if (u8ArrLen < len)
            len = u8ArrLen;
        putChars: {
            for (; i < len; i = (i + 1) | 0) {
                char = encodedString.charCodeAt(i) | 0;
                switch (char >> 4) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                        read = (read + 1) | 0;
                    // extension points:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                        break;
                    case 12:
                    case 13:
                        if (((i + 1) | 0) < u8ArrLen) {
                            read = (read + 1) | 0;
                            break;
                        }
                    case 14:
                        if (((i + 2) | 0) < u8ArrLen) {
                            //if (!(char === 0xEF && encodedString.substr(i+1|0,2) === "\xBF\xBD"))
                            read = (read + 1) | 0;
                            break;
                        }
                    case 15:
                        if (((i + 3) | 0) < u8ArrLen) {
                            read = (read + 1) | 0;
                            break;
                        }
                    default:
                        break putChars;
                }
                //read = read + ((char >> 6) !== 2) |0;
                u8Arr[i] = char;
            }
        }
        return { written: i, read: inputLength < read ? inputLength : read };
    }
}
exports.TextEncoder = TextEncoder;
/**
 * Encode a UTF-8 string into a Uint8Array
 */
function encode(s) {
    return TextEncoder.prototype.encode(s);
}
exports.encode = encode;
/**
 * Decode a Uint8Array into a UTF-8 string
 */
function decode(a) {
    return TextDecoder.prototype.decode(a);
}
exports.decode = decode;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/errors.js":
/*!*******************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/errors.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NamespaceNotFoundError = exports.WorkflowNotFoundError = exports.WorkflowExecutionAlreadyStartedError = exports.IllegalStateError = exports.PayloadConverterError = exports.ValueError = void 0;
const failure_1 = __webpack_require__(/*! ./failure */ "./node_modules/@temporalio/common/lib/failure.js");
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
/**
 * Thrown from code that receives a value that is unexpected or that it's unable to handle.
 */
let ValueError = class ValueError extends Error {
    constructor(message, cause) {
        super(message ?? undefined);
        this.cause = cause;
    }
};
exports.ValueError = ValueError;
exports.ValueError = ValueError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ValueError')
], ValueError);
/**
 * Thrown when a Payload Converter is misconfigured.
 */
let PayloadConverterError = class PayloadConverterError extends ValueError {
};
exports.PayloadConverterError = PayloadConverterError;
exports.PayloadConverterError = PayloadConverterError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('PayloadConverterError')
], PayloadConverterError);
/**
 * Used in different parts of the SDK to note that something unexpected has happened.
 */
let IllegalStateError = class IllegalStateError extends Error {
};
exports.IllegalStateError = IllegalStateError;
exports.IllegalStateError = IllegalStateError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('IllegalStateError')
], IllegalStateError);
/**
 * This exception is thrown in the following cases:
 *  - Workflow with the same Workflow Id is currently running
 *  - There is a closed Workflow with the same Workflow Id and the {@link WorkflowOptions.workflowIdReusePolicy}
 *    is `WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE`
 *  - There is closed Workflow in the `Completed` state with the same Workflow Id and the {@link WorkflowOptions.workflowIdReusePolicy}
 *    is `WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY`
 */
let WorkflowExecutionAlreadyStartedError = class WorkflowExecutionAlreadyStartedError extends failure_1.TemporalFailure {
    constructor(message, workflowId, workflowType) {
        super(message);
        this.workflowId = workflowId;
        this.workflowType = workflowType;
    }
};
exports.WorkflowExecutionAlreadyStartedError = WorkflowExecutionAlreadyStartedError;
exports.WorkflowExecutionAlreadyStartedError = WorkflowExecutionAlreadyStartedError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('WorkflowExecutionAlreadyStartedError')
], WorkflowExecutionAlreadyStartedError);
/**
 * Thrown when a Workflow with the given Id is not known to Temporal Server.
 * It could be because:
 * - Id passed is incorrect
 * - Workflow is closed (for some calls, e.g. `terminate`)
 * - Workflow was deleted from the Server after reaching its retention limit
 */
let WorkflowNotFoundError = class WorkflowNotFoundError extends Error {
    constructor(message, workflowId, runId) {
        super(message);
        this.workflowId = workflowId;
        this.runId = runId;
    }
};
exports.WorkflowNotFoundError = WorkflowNotFoundError;
exports.WorkflowNotFoundError = WorkflowNotFoundError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('WorkflowNotFoundError')
], WorkflowNotFoundError);
/**
 * Thrown when the specified namespace is not known to Temporal Server.
 */
let NamespaceNotFoundError = class NamespaceNotFoundError extends Error {
    constructor(namespace) {
        super(`Namespace not found: '${namespace}'`);
        this.namespace = namespace;
    }
};
exports.NamespaceNotFoundError = NamespaceNotFoundError;
exports.NamespaceNotFoundError = NamespaceNotFoundError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('NamespaceNotFoundError')
], NamespaceNotFoundError);


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/failure.js":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/failure.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.rootCause = exports.ensureTemporalFailure = exports.ensureApplicationFailure = exports.ChildWorkflowFailure = exports.ActivityFailure = exports.TimeoutFailure = exports.TerminatedFailure = exports.CancelledFailure = exports.ApplicationFailure = exports.ServerFailure = exports.TemporalFailure = exports.RetryState = exports.TimeoutType = exports.FAILURE_SOURCE = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
exports.FAILURE_SOURCE = 'TypeScriptSDK';
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from temporal.api.enums.v1.TimeoutType
var TimeoutType;
(function (TimeoutType) {
    TimeoutType[TimeoutType["TIMEOUT_TYPE_UNSPECIFIED"] = 0] = "TIMEOUT_TYPE_UNSPECIFIED";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_START_TO_CLOSE"] = 1] = "TIMEOUT_TYPE_START_TO_CLOSE";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_SCHEDULE_TO_START"] = 2] = "TIMEOUT_TYPE_SCHEDULE_TO_START";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_SCHEDULE_TO_CLOSE"] = 3] = "TIMEOUT_TYPE_SCHEDULE_TO_CLOSE";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_HEARTBEAT"] = 4] = "TIMEOUT_TYPE_HEARTBEAT";
})(TimeoutType || (exports.TimeoutType = TimeoutType = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from temporal.api.enums.v1.RetryState
var RetryState;
(function (RetryState) {
    RetryState[RetryState["RETRY_STATE_UNSPECIFIED"] = 0] = "RETRY_STATE_UNSPECIFIED";
    RetryState[RetryState["RETRY_STATE_IN_PROGRESS"] = 1] = "RETRY_STATE_IN_PROGRESS";
    RetryState[RetryState["RETRY_STATE_NON_RETRYABLE_FAILURE"] = 2] = "RETRY_STATE_NON_RETRYABLE_FAILURE";
    RetryState[RetryState["RETRY_STATE_TIMEOUT"] = 3] = "RETRY_STATE_TIMEOUT";
    RetryState[RetryState["RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED"] = 4] = "RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED";
    RetryState[RetryState["RETRY_STATE_RETRY_POLICY_NOT_SET"] = 5] = "RETRY_STATE_RETRY_POLICY_NOT_SET";
    RetryState[RetryState["RETRY_STATE_INTERNAL_SERVER_ERROR"] = 6] = "RETRY_STATE_INTERNAL_SERVER_ERROR";
    RetryState[RetryState["RETRY_STATE_CANCEL_REQUESTED"] = 7] = "RETRY_STATE_CANCEL_REQUESTED";
})(RetryState || (exports.RetryState = RetryState = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
/**
 * Represents failures that can cross Workflow and Activity boundaries.
 *
 * **Never extend this class or any of its children.**
 *
 * The only child class you should ever throw from your code is {@link ApplicationFailure}.
 */
let TemporalFailure = class TemporalFailure extends Error {
    constructor(message, cause) {
        super(message ?? undefined);
        this.cause = cause;
    }
};
exports.TemporalFailure = TemporalFailure;
exports.TemporalFailure = TemporalFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('TemporalFailure')
], TemporalFailure);
/** Exceptions originated at the Temporal service. */
let ServerFailure = class ServerFailure extends TemporalFailure {
    constructor(message, nonRetryable, cause) {
        super(message, cause);
        this.nonRetryable = nonRetryable;
    }
};
exports.ServerFailure = ServerFailure;
exports.ServerFailure = ServerFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ServerFailure')
], ServerFailure);
/**
 * `ApplicationFailure`s are used to communicate application-specific failures in Workflows and Activities.
 *
 * The {@link type} property is matched against {@link RetryPolicy.nonRetryableErrorTypes} to determine if an instance
 * of this error is retryable. Another way to avoid retrying is by setting the {@link nonRetryable} flag to `true`.
 *
 * In Workflows, if you throw a non-`ApplicationFailure`, the Workflow Task will fail and be retried. If you throw an
 * `ApplicationFailure`, the Workflow Execution will fail.
 *
 * In Activities, you can either throw an `ApplicationFailure` or another `Error` to fail the Activity Task. In the
 * latter case, the `Error` will be converted to an `ApplicationFailure`. The conversion is done as following:
 *
 * - `type` is set to `error.constructor?.name ?? error.name`
 * - `message` is set to `error.message`
 * - `nonRetryable` is set to false
 * - `details` are set to null
 * - stack trace is copied from the original error
 *
 * When an {@link https://docs.temporal.io/concepts/what-is-an-activity-execution | Activity Execution} fails, the
 * `ApplicationFailure` from the last Activity Task will be the `cause` of the {@link ActivityFailure} thrown in the
 * Workflow.
 */
let ApplicationFailure = class ApplicationFailure extends TemporalFailure {
    /**
     * Alternatively, use {@link fromError} or {@link create}.
     */
    constructor(message, type, nonRetryable, details, cause) {
        super(message, cause);
        this.type = type;
        this.nonRetryable = nonRetryable;
        this.details = details;
    }
    /**
     * Create a new `ApplicationFailure` from an Error object.
     *
     * First calls {@link ensureApplicationFailure | `ensureApplicationFailure(error)`} and then overrides any fields
     * provided in `overrides`.
     */
    static fromError(error, overrides) {
        const failure = ensureApplicationFailure(error);
        Object.assign(failure, overrides);
        return failure;
    }
    /**
     * Create a new `ApplicationFailure`.
     *
     * By default, will be retryable (unless its `type` is included in {@link RetryPolicy.nonRetryableErrorTypes}).
     */
    static create(options) {
        const { message, type, nonRetryable = false, details, cause } = options;
        return new this(message, type, nonRetryable, details, cause);
    }
    /**
     * Get a new `ApplicationFailure` with the {@link nonRetryable} flag set to false. Note that this error will still
     * not be retried if its `type` is included in {@link RetryPolicy.nonRetryableErrorTypes}.
     *
     * @param message Optional error message
     * @param type Optional error type (used by {@link RetryPolicy.nonRetryableErrorTypes})
     * @param details Optional details about the failure. Serialized by the Worker's {@link PayloadConverter}.
     */
    static retryable(message, type, ...details) {
        return new this(message, type ?? 'Error', false, details);
    }
    /**
     * Get a new `ApplicationFailure` with the {@link nonRetryable} flag set to true.
     *
     * When thrown from an Activity or Workflow, the Activity or Workflow will not be retried (even if `type` is not
     * listed in {@link RetryPolicy.nonRetryableErrorTypes}).
     *
     * @param message Optional error message
     * @param type Optional error type
     * @param details Optional details about the failure. Serialized by the Worker's {@link PayloadConverter}.
     */
    static nonRetryable(message, type, ...details) {
        return new this(message, type ?? 'Error', true, details);
    }
};
exports.ApplicationFailure = ApplicationFailure;
exports.ApplicationFailure = ApplicationFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ApplicationFailure')
], ApplicationFailure);
/**
 * This error is thrown when Cancellation has been requested. To allow Cancellation to happen, let it propagate. To
 * ignore Cancellation, catch it and continue executing. Note that Cancellation can only be requested a single time, so
 * your Workflow/Activity Execution will not receive further Cancellation requests.
 *
 * When a Workflow or Activity has been successfully cancelled, a `CancelledFailure` will be the `cause`.
 */
let CancelledFailure = class CancelledFailure extends TemporalFailure {
    constructor(message, details = [], cause) {
        super(message, cause);
        this.details = details;
    }
};
exports.CancelledFailure = CancelledFailure;
exports.CancelledFailure = CancelledFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('CancelledFailure')
], CancelledFailure);
/**
 * Used as the `cause` when a Workflow has been terminated
 */
let TerminatedFailure = class TerminatedFailure extends TemporalFailure {
    constructor(message, cause) {
        super(message, cause);
    }
};
exports.TerminatedFailure = TerminatedFailure;
exports.TerminatedFailure = TerminatedFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('TerminatedFailure')
], TerminatedFailure);
/**
 * Used to represent timeouts of Activities and Workflows
 */
let TimeoutFailure = class TimeoutFailure extends TemporalFailure {
    constructor(message, lastHeartbeatDetails, timeoutType) {
        super(message);
        this.lastHeartbeatDetails = lastHeartbeatDetails;
        this.timeoutType = timeoutType;
    }
};
exports.TimeoutFailure = TimeoutFailure;
exports.TimeoutFailure = TimeoutFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('TimeoutFailure')
], TimeoutFailure);
/**
 * Contains information about an Activity failure. Always contains the original reason for the failure as its `cause`.
 * For example, if an Activity timed out, the cause will be a {@link TimeoutFailure}.
 *
 * This exception is expected to be thrown only by the framework code.
 */
let ActivityFailure = class ActivityFailure extends TemporalFailure {
    constructor(message, activityType, activityId, retryState, identity, cause) {
        super(message, cause);
        this.activityType = activityType;
        this.activityId = activityId;
        this.retryState = retryState;
        this.identity = identity;
    }
};
exports.ActivityFailure = ActivityFailure;
exports.ActivityFailure = ActivityFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ActivityFailure')
], ActivityFailure);
/**
 * Contains information about a Child Workflow failure. Always contains the reason for the failure as its {@link cause}.
 * For example, if the Child was Terminated, the `cause` is a {@link TerminatedFailure}.
 *
 * This exception is expected to be thrown only by the framework code.
 */
let ChildWorkflowFailure = class ChildWorkflowFailure extends TemporalFailure {
    constructor(namespace, execution, workflowType, retryState, cause) {
        super('Child Workflow execution failed', cause);
        this.namespace = namespace;
        this.execution = execution;
        this.workflowType = workflowType;
        this.retryState = retryState;
    }
};
exports.ChildWorkflowFailure = ChildWorkflowFailure;
exports.ChildWorkflowFailure = ChildWorkflowFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ChildWorkflowFailure')
], ChildWorkflowFailure);
/**
 * If `error` is already an `ApplicationFailure`, returns `error`.
 *
 * Otherwise, converts `error` into an `ApplicationFailure` with:
 *
 * - `message`: `error.message` or `String(error)`
 * - `type`: `error.constructor.name` or `error.name`
 * - `stack`: `error.stack` or `''`
 */
function ensureApplicationFailure(error) {
    if (error instanceof ApplicationFailure) {
        return error;
    }
    const message = ((0, type_helpers_1.isRecord)(error) && String(error.message)) || String(error);
    const type = ((0, type_helpers_1.isRecord)(error) && (error.constructor?.name ?? error.name)) || undefined;
    const failure = ApplicationFailure.create({ message, type, nonRetryable: false });
    failure.stack = ((0, type_helpers_1.isRecord)(error) && String(error.stack)) || '';
    return failure;
}
exports.ensureApplicationFailure = ensureApplicationFailure;
/**
 * If `err` is an Error it is turned into an `ApplicationFailure`.
 *
 * If `err` was already a `TemporalFailure`, returns the original error.
 *
 * Otherwise returns an `ApplicationFailure` with `String(err)` as the message.
 */
function ensureTemporalFailure(err) {
    if (err instanceof TemporalFailure) {
        return err;
    }
    return ensureApplicationFailure(err);
}
exports.ensureTemporalFailure = ensureTemporalFailure;
/**
 * Get the root cause message of given `error`.
 *
 * In case `error` is a {@link TemporalFailure}, recurse the `cause` chain and return the root `cause.message`.
 * Otherwise, return `error.message`.
 */
function rootCause(error) {
    if (error instanceof TemporalFailure) {
        return error.cause ? rootCause(error.cause) : error.message;
    }
    return (0, type_helpers_1.errorMessage)(error);
}
exports.rootCause = rootCause;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/index.js":
/*!******************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/index.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * Common library for code that's used across the Client, Worker, and/or Workflow
 *
 * @module
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.errorCode = exports.errorMessage = exports.str = exports.u8 = void 0;
const encoding = __importStar(__webpack_require__(/*! ./encoding */ "./node_modules/@temporalio/common/lib/encoding.js"));
const helpers = __importStar(__webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js"));
__exportStar(__webpack_require__(/*! ./activity-options */ "./node_modules/@temporalio/common/lib/activity-options.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/data-converter */ "./node_modules/@temporalio/common/lib/converter/data-converter.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/failure-converter */ "./node_modules/@temporalio/common/lib/converter/failure-converter.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/payload-codec */ "./node_modules/@temporalio/common/lib/converter/payload-codec.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/payload-converter */ "./node_modules/@temporalio/common/lib/converter/payload-converter.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/types */ "./node_modules/@temporalio/common/lib/converter/types.js"), exports);
__exportStar(__webpack_require__(/*! ./deprecated-time */ "./node_modules/@temporalio/common/lib/deprecated-time.js"), exports);
__exportStar(__webpack_require__(/*! ./errors */ "./node_modules/@temporalio/common/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! ./failure */ "./node_modules/@temporalio/common/lib/failure.js"), exports);
__exportStar(__webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/common/lib/interfaces.js"), exports);
__exportStar(__webpack_require__(/*! ./logger */ "./node_modules/@temporalio/common/lib/logger.js"), exports);
__exportStar(__webpack_require__(/*! ./retry-policy */ "./node_modules/@temporalio/common/lib/retry-policy.js"), exports);
__exportStar(__webpack_require__(/*! ./workflow-handle */ "./node_modules/@temporalio/common/lib/workflow-handle.js"), exports);
__exportStar(__webpack_require__(/*! ./workflow-options */ "./node_modules/@temporalio/common/lib/workflow-options.js"), exports);
__exportStar(__webpack_require__(/*! ./versioning-intent */ "./node_modules/@temporalio/common/lib/versioning-intent.js"), exports);
/**
 * Encode a UTF-8 string into a Uint8Array
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function u8(s) {
    return encoding.encode(s);
}
exports.u8 = u8;
/**
 * Decode a Uint8Array into a UTF-8 string
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function str(arr) {
    return encoding.decode(arr);
}
exports.str = str;
/**
 * Get `error.message` (or `undefined` if not present)
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function errorMessage(error) {
    return helpers.errorMessage(error);
}
exports.errorMessage = errorMessage;
/**
 * Get `error.code` (or `undefined` if not present)
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function errorCode(error) {
    return helpers.errorCode(error);
}
exports.errorCode = errorCode;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/interceptors.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/interceptors.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.composeInterceptors = void 0;
/**
 * Compose all interceptor methods into a single function.
 *
 * Calling the composed function results in calling each of the provided interceptor, in order (from the first to
 * the last), followed by the original function provided as argument to `composeInterceptors()`.
 *
 * @param interceptors a list of interceptors
 * @param method the name of the interceptor method to compose
 * @param next the original function to be executed at the end of the interception chain
 */
// ts-prune-ignore-next (imported via lib/interceptors)
function composeInterceptors(interceptors, method, next) {
    for (let i = interceptors.length - 1; i >= 0; --i) {
        const interceptor = interceptors[i];
        if (interceptor[method] !== undefined) {
            const prev = next;
            // We lose type safety here because Typescript can't deduce that interceptor[method] is a function that returns
            // the same type as Next<I, M>
            next = ((input) => interceptor[method](input, prev));
        }
    }
    return next;
}
exports.composeInterceptors = composeInterceptors;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/interfaces.js":
/*!***********************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/interfaces.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/logger.js":
/*!*******************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/logger.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SdkComponent = void 0;
/**
 * Possible values of the `sdkComponent` meta attributes on log messages. This
 * attribute indicates which subsystem emitted the log message; this may for
 * example be used to implement fine-grained filtering of log messages.
 *
 * Note that there is no guarantee that this list will remain stable in the
 * future; values may be added or removed, and messages that are currently
 * emitted with some `sdkComponent` value may use a different value in the future.
 */
var SdkComponent;
(function (SdkComponent) {
    /**
     * Component name for messages emited from Workflow code, using the {@link Workflow context logger|workflow.log}.
     * The SDK itself never publishes messages with this component name.
     */
    SdkComponent["workflow"] = "workflow";
    /**
     * Component name for messages emited from an activity, using the {@link activity context logger|Context.log}.
     * The SDK itself never publishes messages with this component name.
     */
    SdkComponent["activity"] = "activity";
    /**
     * Component name for messages emited from a Temporal Worker instance.
     *
     * This notably includes:
     * - Issues with Worker or runtime configuration, or the JS execution environment;
     * - Worker's, Activity's, and Workflow's lifecycle events;
     * - Workflow Activation and Activity Task processing events;
     * - Workflow bundling messages;
     * - Sink processing issues.
     */
    SdkComponent["worker"] = "worker";
    /**
     * Component name for all messages emitted by the Rust Core SDK library.
     */
    SdkComponent["core"] = "core";
})(SdkComponent || (exports.SdkComponent = SdkComponent = {}));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/retry-policy.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/retry-policy.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decompileRetryPolicy = exports.compileRetryPolicy = void 0;
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/common/lib/errors.js");
const time_1 = __webpack_require__(/*! ./time */ "./node_modules/@temporalio/common/lib/time.js");
/**
 * Turn a TS RetryPolicy into a proto compatible RetryPolicy
 */
function compileRetryPolicy(retryPolicy) {
    if (retryPolicy.backoffCoefficient != null && retryPolicy.backoffCoefficient <= 0) {
        throw new errors_1.ValueError('RetryPolicy.backoffCoefficient must be greater than 0');
    }
    if (retryPolicy.maximumAttempts != null) {
        if (retryPolicy.maximumAttempts === Number.POSITIVE_INFINITY) {
            // drop field (Infinity is the default)
            const { maximumAttempts: _, ...without } = retryPolicy;
            retryPolicy = without;
        }
        else if (retryPolicy.maximumAttempts <= 0) {
            throw new errors_1.ValueError('RetryPolicy.maximumAttempts must be a positive integer');
        }
        else if (!Number.isInteger(retryPolicy.maximumAttempts)) {
            throw new errors_1.ValueError('RetryPolicy.maximumAttempts must be an integer');
        }
    }
    const maximumInterval = (0, time_1.msOptionalToNumber)(retryPolicy.maximumInterval);
    const initialInterval = (0, time_1.msToNumber)(retryPolicy.initialInterval ?? 1000);
    if (maximumInterval === 0) {
        throw new errors_1.ValueError('RetryPolicy.maximumInterval cannot be 0');
    }
    if (initialInterval === 0) {
        throw new errors_1.ValueError('RetryPolicy.initialInterval cannot be 0');
    }
    if (maximumInterval != null && maximumInterval < initialInterval) {
        throw new errors_1.ValueError('RetryPolicy.maximumInterval cannot be less than its initialInterval');
    }
    return {
        maximumAttempts: retryPolicy.maximumAttempts,
        initialInterval: (0, time_1.msToTs)(initialInterval),
        maximumInterval: (0, time_1.msOptionalToTs)(maximumInterval),
        backoffCoefficient: retryPolicy.backoffCoefficient,
        nonRetryableErrorTypes: retryPolicy.nonRetryableErrorTypes,
    };
}
exports.compileRetryPolicy = compileRetryPolicy;
/**
 * Turn a proto compatible RetryPolicy into a TS RetryPolicy
 */
function decompileRetryPolicy(retryPolicy) {
    if (!retryPolicy) {
        return undefined;
    }
    return {
        backoffCoefficient: retryPolicy.backoffCoefficient ?? undefined,
        maximumAttempts: retryPolicy.maximumAttempts ?? undefined,
        maximumInterval: (0, time_1.optionalTsToMs)(retryPolicy.maximumInterval),
        initialInterval: (0, time_1.optionalTsToMs)(retryPolicy.initialInterval),
        nonRetryableErrorTypes: retryPolicy.nonRetryableErrorTypes ?? undefined,
    };
}
exports.decompileRetryPolicy = decompileRetryPolicy;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/time.js":
/*!*****************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/time.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.optionalDateToTs = exports.optionalTsToDate = exports.tsToDate = exports.msToNumber = exports.msOptionalToNumber = exports.msOptionalToTs = exports.msToTs = exports.msNumberToTs = exports.tsToMs = exports.optionalTsToMs = void 0;
const long_1 = __importDefault(__webpack_require__(/*! long */ "./node_modules/long/umd/index.js")); // eslint-disable-line import/no-named-as-default
const ms_1 = __importDefault(__webpack_require__(/*! ms */ "./node_modules/ms/dist/index.cjs"));
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/common/lib/errors.js");
/**
 * Lossy conversion function from Timestamp to number due to possible overflow.
 * If ts is null or undefined returns undefined.
 */
function optionalTsToMs(ts) {
    if (ts === undefined || ts === null) {
        return undefined;
    }
    return tsToMs(ts);
}
exports.optionalTsToMs = optionalTsToMs;
/**
 * Lossy conversion function from Timestamp to number due to possible overflow
 */
function tsToMs(ts) {
    if (ts === undefined || ts === null) {
        throw new Error(`Expected timestamp, got ${ts}`);
    }
    const { seconds, nanos } = ts;
    return (seconds || long_1.default.UZERO)
        .mul(1000)
        .add(Math.floor((nanos || 0) / 1000000))
        .toNumber();
}
exports.tsToMs = tsToMs;
function msNumberToTs(millis) {
    const seconds = Math.floor(millis / 1000);
    const nanos = (millis % 1000) * 1000000;
    if (Number.isNaN(seconds) || Number.isNaN(nanos)) {
        throw new errors_1.ValueError(`Invalid millis ${millis}`);
    }
    return { seconds: long_1.default.fromNumber(seconds), nanos };
}
exports.msNumberToTs = msNumberToTs;
function msToTs(str) {
    return msNumberToTs(msToNumber(str));
}
exports.msToTs = msToTs;
function msOptionalToTs(str) {
    return str ? msToTs(str) : undefined;
}
exports.msOptionalToTs = msOptionalToTs;
function msOptionalToNumber(val) {
    if (val === undefined)
        return undefined;
    return msToNumber(val);
}
exports.msOptionalToNumber = msOptionalToNumber;
function msToNumber(val) {
    if (typeof val === 'number') {
        return val;
    }
    return msWithValidation(val);
}
exports.msToNumber = msToNumber;
function msWithValidation(str) {
    const millis = (0, ms_1.default)(str);
    if (millis == null || isNaN(millis)) {
        throw new TypeError(`Invalid duration string: '${str}'`);
    }
    return millis;
}
function tsToDate(ts) {
    return new Date(tsToMs(ts));
}
exports.tsToDate = tsToDate;
function optionalTsToDate(ts) {
    if (ts === undefined || ts === null) {
        return undefined;
    }
    return new Date(tsToMs(ts));
}
exports.optionalTsToDate = optionalTsToDate;
// ts-prune-ignore-next (imported via schedule-helpers.ts)
function optionalDateToTs(date) {
    if (date === undefined || date === null) {
        return undefined;
    }
    return msToTs(date.getTime());
}
exports.optionalDateToTs = optionalDateToTs;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/type-helpers.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/type-helpers.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deepFreeze = exports.SymbolBasedInstanceOfError = exports.assertNever = exports.errorCode = exports.errorMessage = exports.isAbortError = exports.isError = exports.hasOwnProperties = exports.hasOwnProperty = exports.isRecord = exports.checkExtends = void 0;
/** Verify that an type _Copy extends _Orig */
function checkExtends() {
    // noop, just type check
}
exports.checkExtends = checkExtends;
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
exports.isRecord = isRecord;
function hasOwnProperty(record, prop) {
    return prop in record;
}
exports.hasOwnProperty = hasOwnProperty;
function hasOwnProperties(record, props) {
    return props.every((prop) => prop in record);
}
exports.hasOwnProperties = hasOwnProperties;
function isError(error) {
    return (isRecord(error) &&
        typeof error.name === 'string' &&
        typeof error.message === 'string' &&
        (error.stack == null || typeof error.stack === 'string'));
}
exports.isError = isError;
function isAbortError(error) {
    return isError(error) && error.name === 'AbortError';
}
exports.isAbortError = isAbortError;
/**
 * Get `error.message` (or `undefined` if not present)
 */
function errorMessage(error) {
    if (isError(error)) {
        return error.message;
    }
    else if (typeof error === 'string') {
        return error;
    }
    return undefined;
}
exports.errorMessage = errorMessage;
function isErrorWithCode(error) {
    return isRecord(error) && typeof error.code === 'string';
}
/**
 * Get `error.code` (or `undefined` if not present)
 */
function errorCode(error) {
    if (isErrorWithCode(error)) {
        return error.code;
    }
    return undefined;
}
exports.errorCode = errorCode;
/**
 * Asserts that some type is the never type
 */
function assertNever(msg, x) {
    throw new TypeError(msg + ': ' + x);
}
exports.assertNever = assertNever;
/**
 * A decorator to be used on error classes. It adds the 'name' property AND provides a custom
 * 'instanceof' handler that works correctly across execution contexts.
 *
 * ### Details ###
 *
 * According to the EcmaScript's spec, the default behavior of JavaScript's `x instanceof Y` operator is to walk up the
 * prototype chain of object 'x', checking if any constructor in that hierarchy is _exactly the same object_ as the
 * constructor function 'Y'.
 *
 * Unfortunately, it happens in various situations that different constructor function objects get created for what
 * appears to be the very same class. This leads to surprising behavior where `instanceof` returns false though it is
 * known that the object is indeed an instance of that class. One particular case where this happens is when constructor
 * 'Y' belongs to a different realm than the constuctor with which 'x' was instantiated. Another case is when two copies
 * of the same library gets loaded in the same realm.
 *
 * In practice, this tends to cause issues when crossing the workflow-sandboxing boundary (since Node's vm module
 * really creates new execution realms), as well as when running tests using Jest (see https://github.com/jestjs/jest/issues/2549
 * for some details on that one).
 *
 * This function injects a custom 'instanceof' handler into the prototype of 'clazz', which is both cross-realm safe and
 * cross-copies-of-the-same-lib safe. It works by adding a special symbol property to the prototype of 'clazz', and then
 * checking for the presence of that symbol.
 */
function SymbolBasedInstanceOfError(markerName) {
    return (clazz) => {
        const marker = Symbol.for(`__temporal_is${markerName}`);
        Object.defineProperty(clazz.prototype, 'name', { value: markerName, enumerable: true });
        Object.defineProperty(clazz.prototype, marker, { value: true, enumerable: false });
        Object.defineProperty(clazz, Symbol.hasInstance, {
            // eslint-disable-next-line object-shorthand
            value: function (error) {
                if (this === clazz) {
                    return isRecord(error) && error[marker] === true;
                }
                else {
                    // 'this' must be a _subclass_ of clazz that doesn't redefined [Symbol.hasInstance], so that it inherited
                    // from clazz's [Symbol.hasInstance]. If we don't handle this particular situation, then
                    // `x instanceof SubclassOfParent` would return true for any instance of 'Parent', which is clearly wrong.
                    //
                    // Ideally, it'd be preferable to avoid this case entirely, by making sure that all subclasses of 'clazz'
                    // redefine [Symbol.hasInstance], but we can't enforce that. We therefore fallback to the default instanceof
                    // behavior (which is NOT cross-realm safe).
                    return this.prototype.isPrototypeOf(error); // eslint-disable-line no-prototype-builtins
                }
            },
        });
    };
}
exports.SymbolBasedInstanceOfError = SymbolBasedInstanceOfError;
// Thanks MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
function deepFreeze(object) {
    // Retrieve the property names defined on object
    const propNames = Object.getOwnPropertyNames(object);
    // Freeze properties before freezing self
    for (const name of propNames) {
        const value = object[name];
        if (value && typeof value === 'object') {
            try {
                deepFreeze(value);
            }
            catch (err) {
                // This is okay, there are some typed arrays that cannot be frozen (encodingKeys)
            }
        }
        else if (typeof value === 'function') {
            Object.freeze(value);
        }
    }
    return Object.freeze(object);
}
exports.deepFreeze = deepFreeze;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/versioning-intent-enum.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/versioning-intent-enum.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.versioningIntentToProto = exports.VersioningIntent = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from coresdk.common.VersioningIntent
/**
 * Protobuf enum representation of {@link VersioningIntentString}.
 *
 * @experimental
 */
var VersioningIntent;
(function (VersioningIntent) {
    VersioningIntent[VersioningIntent["UNSPECIFIED"] = 0] = "UNSPECIFIED";
    VersioningIntent[VersioningIntent["COMPATIBLE"] = 1] = "COMPATIBLE";
    VersioningIntent[VersioningIntent["DEFAULT"] = 2] = "DEFAULT";
})(VersioningIntent || (exports.VersioningIntent = VersioningIntent = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
function versioningIntentToProto(intent) {
    switch (intent) {
        case 'DEFAULT':
            return VersioningIntent.DEFAULT;
        case 'COMPATIBLE':
            return VersioningIntent.COMPATIBLE;
        case undefined:
            return VersioningIntent.UNSPECIFIED;
        default:
            (0, type_helpers_1.assertNever)('Unexpected VersioningIntent', intent);
    }
}
exports.versioningIntentToProto = versioningIntentToProto;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/versioning-intent.js":
/*!******************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/versioning-intent.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/workflow-handle.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/workflow-handle.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/workflow-options.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/workflow-options.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.extractWorkflowType = exports.WorkflowIdReusePolicy = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from temporal.api.enums.v1.WorkflowIdReusePolicy
/**
 * Concept: {@link https://docs.temporal.io/concepts/what-is-a-workflow-id-reuse-policy/ | Workflow Id Reuse Policy}
 *
 * Whether a Workflow can be started with a Workflow Id of a Closed Workflow.
 *
 * *Note: A Workflow can never be started with a Workflow Id of a Running Workflow.*
 */
var WorkflowIdReusePolicy;
(function (WorkflowIdReusePolicy) {
    /**
     * No need to use this.
     *
     * (If a `WorkflowIdReusePolicy` is set to this, or is not set at all, the default value will be used.)
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_UNSPECIFIED"] = 0] = "WORKFLOW_ID_REUSE_POLICY_UNSPECIFIED";
    /**
     * The Workflow can be started if the previous Workflow is in a Closed state.
     * @default
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE"] = 1] = "WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE";
    /**
     * The Workflow can be started if the previous Workflow is in a Closed state that is not Completed.
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY"] = 2] = "WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY";
    /**
     * The Workflow cannot be started.
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE"] = 3] = "WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE";
    /**
     * Terminate the current workflow if one is already running.
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_TERMINATE_IF_RUNNING"] = 4] = "WORKFLOW_ID_REUSE_POLICY_TERMINATE_IF_RUNNING";
})(WorkflowIdReusePolicy || (exports.WorkflowIdReusePolicy = WorkflowIdReusePolicy = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
function extractWorkflowType(workflowTypeOrFunc) {
    if (typeof workflowTypeOrFunc === 'string')
        return workflowTypeOrFunc;
    if (typeof workflowTypeOrFunc === 'function') {
        if (workflowTypeOrFunc?.name)
            return workflowTypeOrFunc.name;
        throw new TypeError('Invalid workflow type: the workflow function is anonymous');
    }
    throw new TypeError(`Invalid workflow type: expected either a string or a function, got '${typeof workflowTypeOrFunc}'`);
}
exports.extractWorkflowType = extractWorkflowType;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/alea.js":
/*!*******************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/alea.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Mash = exports.alea = void 0;
// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// Taken and modified from https://github.com/davidbau/seedrandom/blob/released/lib/alea.js
class Alea {
    constructor(seed) {
        const mash = new Mash();
        // Apply the seeding algorithm from Baagoe.
        this.c = 1;
        this.s0 = mash.mash([32]);
        this.s1 = mash.mash([32]);
        this.s2 = mash.mash([32]);
        this.s0 -= mash.mash(seed);
        if (this.s0 < 0) {
            this.s0 += 1;
        }
        this.s1 -= mash.mash(seed);
        if (this.s1 < 0) {
            this.s1 += 1;
        }
        this.s2 -= mash.mash(seed);
        if (this.s2 < 0) {
            this.s2 += 1;
        }
    }
    next() {
        const t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32
        this.s0 = this.s1;
        this.s1 = this.s2;
        return (this.s2 = t - (this.c = t | 0));
    }
}
function alea(seed) {
    const xg = new Alea(seed);
    return xg.next.bind(xg);
}
exports.alea = alea;
class Mash {
    constructor() {
        this.n = 0xefc8249d;
    }
    mash(data) {
        let { n } = this;
        for (let i = 0; i < data.length; i++) {
            n += data[i];
            let h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000; // 2^32
        }
        this.n = n;
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    }
}
exports.Mash = Mash;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/cancellation-scope.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CancellationScope_cancelRequested;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.registerSleepImplementation = exports.RootCancellationScope = exports.disableStorage = exports.CancellationScope = exports.AsyncLocalStorage = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const time_1 = __webpack_require__(/*! @temporalio/common/lib/time */ "./node_modules/@temporalio/common/lib/time.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const flags_1 = __webpack_require__(/*! ./flags */ "./node_modules/@temporalio/workflow/lib/flags.js");
// AsyncLocalStorage is injected via vm module into global scope.
// In case Workflow code is imported in Node.js context, replace with an empty class.
exports.AsyncLocalStorage = globalThis.AsyncLocalStorage ?? class {
};
/** Magic symbol used to create the root scope - intentionally not exported */
const NO_PARENT = Symbol('NO_PARENT');
/**
 * Cancellation Scopes provide the mechanic by which a Workflow may gracefully handle incoming requests for cancellation
 * (e.g. in response to {@link WorkflowHandle.cancel} or through the UI or CLI), as well as request cancelation of
 * cancellable operations it owns (e.g. Activities, Timers, Child Workflows, etc).
 *
 * Cancellation Scopes form a tree, with the Workflow's main function running in the root scope of that tree.
 * By default, cancellation propagates down from a parent scope to its children and its cancellable operations.
 * A non-cancellable scope can receive cancellation requests, but is never effectively considered as cancelled,
 * thus shieldding its children and cancellable operations from propagation of cancellation requests it receives.
 *
 * Scopes are created using the `CancellationScope` constructor or the static helper methods {@link cancellable},
 * {@link nonCancellable} and {@link withTimeout}. `withTimeout` creates a scope that automatically cancels itself after
 * some duration.
 *
 * Cancellation of a cancellable scope results in all operations created directly in that scope to throw a
 * {@link CancelledFailure} (either directly, or as the `cause` of an {@link ActivityFailure} or a
 * {@link ChildWorkflowFailure}). Further attempt to create new cancellable scopes or cancellable operations within a
 * scope that has already been cancelled will also immediately throw a {@link CancelledFailure} exception. It is however
 * possible to create a non-cancellable scope at that point; this is often used to execute rollback or cleanup
 * operations. For example:
 *
 * ```ts
 * async function myWorkflow(...): Promise<void> {
 *   try {
 *     // This activity runs in the root cancellation scope. Therefore, a cancelation request on
 *     // the Workflow execution (e.g. through the UI or CLI) automatically propagates to this
 *     // activity. Assuming that the activity properly handle the cancellation request, then the
 *     // call below will throw an `ActivityFailure` exception, with `cause` sets to an
 *     // instance of `CancelledFailure`.
 *     await someActivity();
 *   } catch (e) {
 *     if (isCancellation(e)) {
 *       // Run cleanup activity in a non-cancellable scope
 *       await CancellationScope.nonCancellable(async () => {
 *         await cleanupActivity();
 *       }
 *     } else {
 *       throw e;
 *     }
 *   }
 * }
 * ```
 *
 * A cancellable scope may be programatically cancelled by calling {@link cancel|`scope.cancel()`}`. This may be used,
 * for example, to explicitly request cancellation of an Activity or Child Workflow:
 *
 * ```ts
 * const cancellableActivityScope = new CancellationScope();
 * const activityPromise = cancellableActivityScope.run(() => someActivity());
 * cancellableActivityScope.cancel(); // Cancels the activity
 * await activityPromise; // Throws `ActivityFailure` with `cause` set to `CancelledFailure`
 * ```
 */
class CancellationScope {
    constructor(options) {
        _CancellationScope_cancelRequested.set(this, false);
        this.timeout = (0, time_1.msOptionalToNumber)(options?.timeout);
        this.cancellable = options?.cancellable ?? true;
        this.cancelRequested = new Promise((_, reject) => {
            // @ts-expect-error TSC doesn't understand that the Promise executor runs synchronously
            this.reject = (err) => {
                __classPrivateFieldSet(this, _CancellationScope_cancelRequested, true, "f");
                reject(err);
            };
        });
        (0, stack_helpers_1.untrackPromise)(this.cancelRequested);
        // Avoid unhandled rejections
        (0, stack_helpers_1.untrackPromise)(this.cancelRequested.catch(() => undefined));
        if (options?.parent !== NO_PARENT) {
            this.parent = options?.parent || CancellationScope.current();
            if (this.parent.cancellable ||
                (__classPrivateFieldGet(this.parent, _CancellationScope_cancelRequested, "f") &&
                    !(0, global_attributes_1.getActivator)().hasFlag(flags_1.SdkFlags.NonCancellableScopesAreShieldedFromPropagation))) {
                __classPrivateFieldSet(this, _CancellationScope_cancelRequested, __classPrivateFieldGet(this.parent, _CancellationScope_cancelRequested, "f"), "f");
                (0, stack_helpers_1.untrackPromise)(this.parent.cancelRequested.catch((err) => {
                    this.reject(err);
                }));
            }
            else {
                (0, stack_helpers_1.untrackPromise)(this.parent.cancelRequested.catch((err) => {
                    if (!(0, global_attributes_1.getActivator)().hasFlag(flags_1.SdkFlags.NonCancellableScopesAreShieldedFromPropagation)) {
                        this.reject(err);
                    }
                }));
            }
        }
    }
    /**
     * Whether the scope was effectively cancelled. A non-cancellable scope can never be considered cancelled.
     */
    get consideredCancelled() {
        return __classPrivateFieldGet(this, _CancellationScope_cancelRequested, "f") && this.cancellable;
    }
    /**
     * Activate the scope as current and run  `fn`
     *
     * Any timers, Activities, Triggers and CancellationScopes created in the body of `fn`
     * automatically link their cancellation to this scope.
     *
     * @return the result of `fn`
     */
    run(fn) {
        return storage.run(this, this.runInContext.bind(this, fn));
    }
    /**
     * Method that runs a function in AsyncLocalStorage context.
     *
     * Could have been written as anonymous function, made into a method for improved stack traces.
     */
    async runInContext(fn) {
        let timerScope;
        if (this.timeout) {
            timerScope = new CancellationScope();
            (0, stack_helpers_1.untrackPromise)(timerScope
                .run(() => sleep(this.timeout))
                .then(() => this.cancel(), () => {
                // scope was already cancelled, ignore
            }));
        }
        try {
            return await fn();
        }
        finally {
            if (timerScope &&
                !timerScope.consideredCancelled &&
                (0, global_attributes_1.getActivator)().hasFlag(flags_1.SdkFlags.NonCancellableScopesAreShieldedFromPropagation)) {
                timerScope.cancel();
            }
        }
    }
    /**
     * Request to cancel the scope and linked children
     */
    cancel() {
        this.reject(new common_1.CancelledFailure('Cancellation scope cancelled'));
    }
    /**
     * Get the current "active" scope
     */
    static current() {
        // Using globals directly instead of a helper function to avoid circular import
        return storage.getStore() ?? globalThis.__TEMPORAL_ACTIVATOR__.rootScope;
    }
    /** Alias to `new CancellationScope({ cancellable: true }).run(fn)` */
    static cancellable(fn) {
        return new this({ cancellable: true }).run(fn);
    }
    /** Alias to `new CancellationScope({ cancellable: false }).run(fn)` */
    static nonCancellable(fn) {
        return new this({ cancellable: false }).run(fn);
    }
    /** Alias to `new CancellationScope({ cancellable: true, timeout }).run(fn)` */
    static withTimeout(timeout, fn) {
        return new this({ cancellable: true, timeout }).run(fn);
    }
}
exports.CancellationScope = CancellationScope;
_CancellationScope_cancelRequested = new WeakMap();
const storage = new exports.AsyncLocalStorage();
/**
 * Avoid exposing the storage directly so it doesn't get frozen
 */
function disableStorage() {
    storage.disable();
}
exports.disableStorage = disableStorage;
class RootCancellationScope extends CancellationScope {
    constructor() {
        super({ cancellable: true, parent: NO_PARENT });
    }
    cancel() {
        this.reject(new common_1.CancelledFailure('Workflow cancelled'));
    }
}
exports.RootCancellationScope = RootCancellationScope;
/** This function is here to avoid a circular dependency between this module and workflow.ts */
let sleep = (_) => {
    throw new common_1.IllegalStateError('Workflow has not been properly initialized');
};
function registerSleepImplementation(fn) {
    sleep = fn;
}
exports.registerSleepImplementation = registerSleepImplementation;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/errors.js":
/*!*********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/errors.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isCancellation = exports.LocalActivityDoBackoff = exports.DeterminismViolationError = exports.WorkflowError = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const type_helpers_1 = __webpack_require__(/*! @temporalio/common/lib/type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
/**
 * Base class for all workflow errors
 */
let WorkflowError = class WorkflowError extends Error {
};
exports.WorkflowError = WorkflowError;
exports.WorkflowError = WorkflowError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('WorkflowError')
], WorkflowError);
/**
 * Thrown in workflow when it tries to do something that non-deterministic such as construct a WeakRef()
 */
let DeterminismViolationError = class DeterminismViolationError extends WorkflowError {
};
exports.DeterminismViolationError = DeterminismViolationError;
exports.DeterminismViolationError = DeterminismViolationError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('DeterminismViolationError')
], DeterminismViolationError);
/**
 * A class that acts as a marker for this special result type
 */
let LocalActivityDoBackoff = class LocalActivityDoBackoff extends Error {
    constructor(backoff) {
        super();
        this.backoff = backoff;
    }
};
exports.LocalActivityDoBackoff = LocalActivityDoBackoff;
exports.LocalActivityDoBackoff = LocalActivityDoBackoff = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('LocalActivityDoBackoff')
], LocalActivityDoBackoff);
/**
 * Returns whether provided `err` is caused by cancellation
 */
function isCancellation(err) {
    return (err instanceof common_1.CancelledFailure ||
        ((err instanceof common_1.ActivityFailure || err instanceof common_1.ChildWorkflowFailure) && err.cause instanceof common_1.CancelledFailure));
}
exports.isCancellation = isCancellation;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/flags.js":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/flags.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.assertValidFlag = exports.SdkFlags = void 0;
const flagsRegistry = new Map();
exports.SdkFlags = {
    /**
     * This flag gates multiple fixes related to cancellation scopes and timers introduced in 1.10.2/1.11.0:
     * - Cancellation of a non-cancellable scope no longer propagates to children scopes
     *   (see https://github.com/temporalio/sdk-typescript/issues/1423).
     * - CancellationScope.withTimeout(fn) now cancel the timer if `fn` completes before expiration
     *   of the timeout, similar to how `condition(fn, timeout)` works.
     * - Timers created using setTimeout can now be intercepted.
     *
     * @since Introduced in 1.10.2/1.11.0.
     */
    NonCancellableScopesAreShieldedFromPropagation: defineFlag(1, false),
};
function defineFlag(id, def) {
    const flag = { id, default: def };
    flagsRegistry.set(id, flag);
    return flag;
}
function assertValidFlag(id) {
    if (!flagsRegistry.has(id))
        throw new TypeError(`Unknown SDK flag: ${id}`);
}
exports.assertValidFlag = assertValidFlag;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/global-attributes.js":
/*!********************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/global-attributes.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getActivator = exports.assertInWorkflowContext = exports.maybeGetActivator = exports.setActivatorUntyped = exports.maybeGetActivatorUntyped = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
function maybeGetActivatorUntyped() {
    return globalThis.__TEMPORAL_ACTIVATOR__;
}
exports.maybeGetActivatorUntyped = maybeGetActivatorUntyped;
function setActivatorUntyped(activator) {
    globalThis.__TEMPORAL_ACTIVATOR__ = activator;
}
exports.setActivatorUntyped = setActivatorUntyped;
function maybeGetActivator() {
    return maybeGetActivatorUntyped();
}
exports.maybeGetActivator = maybeGetActivator;
function assertInWorkflowContext(message) {
    const activator = maybeGetActivator();
    if (activator == null)
        throw new common_1.IllegalStateError(message);
    return activator;
}
exports.assertInWorkflowContext = assertInWorkflowContext;
function getActivator() {
    const activator = maybeGetActivator();
    if (activator === undefined) {
        throw new common_1.IllegalStateError('Workflow uninitialized');
    }
    return activator;
}
exports.getActivator = getActivator;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/global-overrides.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/global-overrides.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.overrideGlobals = void 0;
/**
 * Overrides some global objects to make them deterministic.
 *
 * @module
 */
const time_1 = __webpack_require__(/*! @temporalio/common/lib/time */ "./node_modules/@temporalio/common/lib/time.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const flags_1 = __webpack_require__(/*! ./flags */ "./node_modules/@temporalio/workflow/lib/flags.js");
const workflow_1 = __webpack_require__(/*! ./workflow */ "./node_modules/@temporalio/workflow/lib/workflow.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
const global = globalThis;
const OriginalDate = globalThis.Date;
function overrideGlobals() {
    // Mock any weak reference because GC is non-deterministic and the effect is observable from the Workflow.
    // Workflow developer will get a meaningful exception if they try to use these.
    global.WeakRef = function () {
        throw new errors_1.DeterminismViolationError('WeakRef cannot be used in Workflows because v8 GC is non-deterministic');
    };
    global.FinalizationRegistry = function () {
        throw new errors_1.DeterminismViolationError('FinalizationRegistry cannot be used in Workflows because v8 GC is non-deterministic');
    };
    global.Date = function (...args) {
        if (args.length > 0) {
            return new OriginalDate(...args);
        }
        return new OriginalDate((0, global_attributes_1.getActivator)().now);
    };
    global.Date.now = function () {
        return (0, global_attributes_1.getActivator)().now;
    };
    global.Date.parse = OriginalDate.parse.bind(OriginalDate);
    global.Date.UTC = OriginalDate.UTC.bind(OriginalDate);
    global.Date.prototype = OriginalDate.prototype;
    const timeoutCancelationScopes = new Map();
    /**
     * @param ms sleep duration -  number of milliseconds. If given a negative number, value will be set to 1.
     */
    global.setTimeout = function (cb, ms, ...args) {
        ms = Math.max(1, ms);
        const activator = (0, global_attributes_1.getActivator)();
        if (activator.hasFlag(flags_1.SdkFlags.NonCancellableScopesAreShieldedFromPropagation)) {
            // Capture the sequence number that sleep will allocate
            const seq = activator.nextSeqs.timer;
            const timerScope = new cancellation_scope_1.CancellationScope({ cancellable: true });
            const sleepPromise = timerScope.run(() => (0, workflow_1.sleep)(ms));
            sleepPromise.then(() => {
                timeoutCancelationScopes.delete(seq);
                cb(...args);
            }, () => {
                timeoutCancelationScopes.delete(seq);
            });
            (0, stack_helpers_1.untrackPromise)(sleepPromise);
            timeoutCancelationScopes.set(seq, timerScope);
            return seq;
        }
        else {
            const seq = activator.nextSeqs.timer++;
            // Create a Promise for AsyncLocalStorage to be able to track this completion using promise hooks.
            new Promise((resolve, reject) => {
                activator.completions.timer.set(seq, { resolve, reject });
                activator.pushCommand({
                    startTimer: {
                        seq,
                        startToFireTimeout: (0, time_1.msToTs)(ms),
                    },
                });
            }).then(() => cb(...args), () => undefined /* ignore cancellation */);
            return seq;
        }
    };
    global.clearTimeout = function (handle) {
        const activator = (0, global_attributes_1.getActivator)();
        const timerScope = timeoutCancelationScopes.get(handle);
        if (timerScope) {
            timeoutCancelationScopes.delete(handle);
            timerScope.cancel();
        }
        else {
            activator.nextSeqs.timer++; // Shouldn't increase seq number, but that's the legacy behavior
            activator.completions.timer.delete(handle);
            activator.pushCommand({
                cancelTimer: {
                    seq: handle,
                },
            });
        }
    };
    // activator.random is mutable, don't hardcode its reference
    Math.random = () => (0, global_attributes_1.getActivator)().random();
}
exports.overrideGlobals = overrideGlobals;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/index.js":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/index.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * This library provides tools required for authoring workflows.
 *
 * ## Usage
 * See the {@link https://docs.temporal.io/typescript/hello-world#workflows | tutorial} for writing your first workflow.
 *
 * ### Timers
 *
 * The recommended way of scheduling timers is by using the {@link sleep} function. We've replaced `setTimeout` and
 * `clearTimeout` with deterministic versions so these are also usable but have a limitation that they don't play well
 * with {@link https://docs.temporal.io/typescript/cancellation-scopes | cancellation scopes}.
 *
 * <!--SNIPSTART typescript-sleep-workflow-->
 * <!--SNIPEND-->
 *
 * ### Activities
 *
 * To schedule Activities, use {@link proxyActivities} to obtain an Activity function and call.
 *
 * <!--SNIPSTART typescript-schedule-activity-workflow-->
 * <!--SNIPEND-->
 *
 * ### Updates, Signals and Queries
 *
 * Use {@link setHandler} to set handlers for Updates, Signals, and Queries.
 *
 * Update and Signal handlers can be either async or non-async functions. Update handlers may return a value, but signal
 * handlers may not (return `void` or `Promise<void>`). You may use Activities, Timers, child Workflows, etc in Update
 * and Signal handlers, but this should be done cautiously: for example, note that if you await async operations such as
 * these in an Update or Signal handler, then you are responsible for ensuring that the workflow does not complete first.
 *
 * Query handlers may **not** be async functions, and may **not** mutate any variables or use Activities, Timers,
 * child Workflows, etc.
 *
 * #### Implementation
 *
 * <!--SNIPSTART typescript-workflow-update-signal-query-example-->
 * <!--SNIPEND-->
 *
 * ### More
 *
 * - [Deterministic built-ins](https://docs.temporal.io/typescript/determinism#sources-of-non-determinism)
 * - [Cancellation and scopes](https://docs.temporal.io/typescript/cancellation-scopes)
 *   - {@link CancellationScope}
 *   - {@link Trigger}
 * - [Sinks](https://docs.temporal.io/application-development/observability/?lang=ts#logging)
 *   - {@link Sinks}
 *
 * @module
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Trigger = exports.log = exports.proxySinks = exports.ParentClosePolicy = exports.ContinueAsNew = exports.ChildWorkflowCancellationType = exports.CancellationScope = exports.AsyncLocalStorage = exports.TimeoutFailure = exports.TerminatedFailure = exports.TemporalFailure = exports.ServerFailure = exports.rootCause = exports.defaultPayloadConverter = exports.ChildWorkflowFailure = exports.CancelledFailure = exports.ApplicationFailure = exports.ActivityFailure = exports.ActivityCancellationType = void 0;
var common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
Object.defineProperty(exports, "ActivityCancellationType", ({ enumerable: true, get: function () { return common_1.ActivityCancellationType; } }));
Object.defineProperty(exports, "ActivityFailure", ({ enumerable: true, get: function () { return common_1.ActivityFailure; } }));
Object.defineProperty(exports, "ApplicationFailure", ({ enumerable: true, get: function () { return common_1.ApplicationFailure; } }));
Object.defineProperty(exports, "CancelledFailure", ({ enumerable: true, get: function () { return common_1.CancelledFailure; } }));
Object.defineProperty(exports, "ChildWorkflowFailure", ({ enumerable: true, get: function () { return common_1.ChildWorkflowFailure; } }));
Object.defineProperty(exports, "defaultPayloadConverter", ({ enumerable: true, get: function () { return common_1.defaultPayloadConverter; } }));
Object.defineProperty(exports, "rootCause", ({ enumerable: true, get: function () { return common_1.rootCause; } }));
Object.defineProperty(exports, "ServerFailure", ({ enumerable: true, get: function () { return common_1.ServerFailure; } }));
Object.defineProperty(exports, "TemporalFailure", ({ enumerable: true, get: function () { return common_1.TemporalFailure; } }));
Object.defineProperty(exports, "TerminatedFailure", ({ enumerable: true, get: function () { return common_1.TerminatedFailure; } }));
Object.defineProperty(exports, "TimeoutFailure", ({ enumerable: true, get: function () { return common_1.TimeoutFailure; } }));
__exportStar(__webpack_require__(/*! @temporalio/common/lib/errors */ "./node_modules/@temporalio/common/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! @temporalio/common/lib/workflow-handle */ "./node_modules/@temporalio/common/lib/workflow-handle.js"), exports);
__exportStar(__webpack_require__(/*! @temporalio/common/lib/workflow-options */ "./node_modules/@temporalio/common/lib/workflow-options.js"), exports);
var cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
Object.defineProperty(exports, "AsyncLocalStorage", ({ enumerable: true, get: function () { return cancellation_scope_1.AsyncLocalStorage; } }));
Object.defineProperty(exports, "CancellationScope", ({ enumerable: true, get: function () { return cancellation_scope_1.CancellationScope; } }));
__exportStar(__webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! ./interceptors */ "./node_modules/@temporalio/workflow/lib/interceptors.js"), exports);
var interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
Object.defineProperty(exports, "ChildWorkflowCancellationType", ({ enumerable: true, get: function () { return interfaces_1.ChildWorkflowCancellationType; } }));
Object.defineProperty(exports, "ContinueAsNew", ({ enumerable: true, get: function () { return interfaces_1.ContinueAsNew; } }));
Object.defineProperty(exports, "ParentClosePolicy", ({ enumerable: true, get: function () { return interfaces_1.ParentClosePolicy; } }));
var sinks_1 = __webpack_require__(/*! ./sinks */ "./node_modules/@temporalio/workflow/lib/sinks.js");
Object.defineProperty(exports, "proxySinks", ({ enumerable: true, get: function () { return sinks_1.proxySinks; } }));
var logs_1 = __webpack_require__(/*! ./logs */ "./node_modules/@temporalio/workflow/lib/logs.js");
Object.defineProperty(exports, "log", ({ enumerable: true, get: function () { return logs_1.log; } }));
var trigger_1 = __webpack_require__(/*! ./trigger */ "./node_modules/@temporalio/workflow/lib/trigger.js");
Object.defineProperty(exports, "Trigger", ({ enumerable: true, get: function () { return trigger_1.Trigger; } }));
__exportStar(__webpack_require__(/*! ./workflow */ "./node_modules/@temporalio/workflow/lib/workflow.js"), exports);


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/interceptors.js":
/*!***************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/interceptors.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Type definitions and generic helpers for interceptors.
 *
 * The Workflow specific interceptors are defined here.
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/interfaces.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/interfaces.js ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ParentClosePolicy = exports.ChildWorkflowCancellationType = exports.ContinueAsNew = void 0;
const type_helpers_1 = __webpack_require__(/*! @temporalio/common/lib/type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
/**
 * Not an actual error, used by the Workflow runtime to abort execution when {@link continueAsNew} is called
 */
let ContinueAsNew = class ContinueAsNew extends Error {
    constructor(command) {
        super('Workflow continued as new');
        this.command = command;
    }
};
exports.ContinueAsNew = ContinueAsNew;
exports.ContinueAsNew = ContinueAsNew = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ContinueAsNew')
], ContinueAsNew);
/**
 * Specifies:
 * - whether cancellation requests are sent to the Child
 * - whether and when a {@link CanceledFailure} is thrown from {@link executeChild} or
 *   {@link ChildWorkflowHandle.result}
 *
 * @default {@link ChildWorkflowCancellationType.WAIT_CANCELLATION_COMPLETED}
 */
var ChildWorkflowCancellationType;
(function (ChildWorkflowCancellationType) {
    /**
     * Don't send a cancellation request to the Child.
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["ABANDON"] = 0] = "ABANDON";
    /**
     * Send a cancellation request to the Child. Immediately throw the error.
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["TRY_CANCEL"] = 1] = "TRY_CANCEL";
    /**
     * Send a cancellation request to the Child. The Child may respect cancellation, in which case an error will be thrown
     * when cancellation has completed, and {@link isCancellation}(error) will be true. On the other hand, the Child may
     * ignore the cancellation request, in which case an error might be thrown with a different cause, or the Child may
     * complete successfully.
     *
     * @default
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["WAIT_CANCELLATION_COMPLETED"] = 2] = "WAIT_CANCELLATION_COMPLETED";
    /**
     * Send a cancellation request to the Child. Throw the error once the Server receives the Child cancellation request.
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["WAIT_CANCELLATION_REQUESTED"] = 3] = "WAIT_CANCELLATION_REQUESTED";
})(ChildWorkflowCancellationType || (exports.ChildWorkflowCancellationType = ChildWorkflowCancellationType = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
/**
 * How a Child Workflow reacts to the Parent Workflow reaching a Closed state.
 *
 * @see {@link https://docs.temporal.io/concepts/what-is-a-parent-close-policy/ | Parent Close Policy}
 */
var ParentClosePolicy;
(function (ParentClosePolicy) {
    /**
     * If a `ParentClosePolicy` is set to this, or is not set at all, the server default value will be used.
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_UNSPECIFIED"] = 0] = "PARENT_CLOSE_POLICY_UNSPECIFIED";
    /**
     * When the Parent is Closed, the Child is Terminated.
     *
     * @default
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_TERMINATE"] = 1] = "PARENT_CLOSE_POLICY_TERMINATE";
    /**
     * When the Parent is Closed, nothing is done to the Child.
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_ABANDON"] = 2] = "PARENT_CLOSE_POLICY_ABANDON";
    /**
     * When the Parent is Closed, the Child is Cancelled.
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_REQUEST_CANCEL"] = 3] = "PARENT_CLOSE_POLICY_REQUEST_CANCEL";
})(ParentClosePolicy || (exports.ParentClosePolicy = ParentClosePolicy = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/internals.js":
/*!************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/internals.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Activator = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const type_helpers_1 = __webpack_require__(/*! @temporalio/common/lib/type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
const alea_1 = __webpack_require__(/*! ./alea */ "./node_modules/@temporalio/workflow/lib/alea.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js");
const interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
const pkg_1 = __importDefault(__webpack_require__(/*! ./pkg */ "./node_modules/@temporalio/workflow/lib/pkg.js"));
const logs_1 = __webpack_require__(/*! ./logs */ "./node_modules/@temporalio/workflow/lib/logs.js");
const flags_1 = __webpack_require__(/*! ./flags */ "./node_modules/@temporalio/workflow/lib/flags.js");
var StartChildWorkflowExecutionFailedCause;
(function (StartChildWorkflowExecutionFailedCause) {
    StartChildWorkflowExecutionFailedCause[StartChildWorkflowExecutionFailedCause["START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_UNSPECIFIED"] = 0] = "START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_UNSPECIFIED";
    StartChildWorkflowExecutionFailedCause[StartChildWorkflowExecutionFailedCause["START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_WORKFLOW_ALREADY_EXISTS"] = 1] = "START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_WORKFLOW_ALREADY_EXISTS";
})(StartChildWorkflowExecutionFailedCause || (StartChildWorkflowExecutionFailedCause = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
/**
 * Keeps all of the Workflow runtime state like pending completions for activities and timers.
 *
 * Implements handlers for all workflow activation jobs.
 */
class Activator {
    constructor({ info, now, showStackTraceSources, sourceMap, getTimeOfDay, randomnessSeed, patches, registeredActivityNames, }) {
        /**
         * Cache for modules - referenced in reusable-vm.ts
         */
        this.moduleCache = new Map();
        /**
         * Map of task sequence to a Completion
         */
        this.completions = {
            timer: new Map(),
            activity: new Map(),
            childWorkflowStart: new Map(),
            childWorkflowComplete: new Map(),
            signalWorkflow: new Map(),
            cancelWorkflow: new Map(),
        };
        /**
         * Holds buffered Update calls until a handler is registered
         */
        this.bufferedUpdates = Array();
        /**
         * Holds buffered signal calls until a handler is registered
         */
        this.bufferedSignals = Array();
        /**
         * Holds buffered query calls until a handler is registered.
         *
         * **IMPORTANT** queries are only buffered until workflow is started.
         * This is required because async interceptors might block workflow function invocation
         * which delays query handler registration.
         */
        this.bufferedQueries = Array();
        /**
         * Mapping of update name to handler and validator
         */
        this.updateHandlers = new Map();
        /**
         * Mapping of signal name to handler
         */
        this.signalHandlers = new Map();
        this.promiseStackStore = {
            promiseToStack: new Map(),
            childToParent: new Map(),
        };
        this.rootScope = new cancellation_scope_1.RootCancellationScope();
        /**
         * Mapping of query name to handler
         */
        this.queryHandlers = new Map([
            [
                '__stack_trace',
                {
                    handler: () => {
                        return this.getStackTraces()
                            .map((s) => s.formatted)
                            .join('\n\n');
                    },
                    description: 'Returns a sensible stack trace.',
                },
            ],
            [
                '__enhanced_stack_trace',
                {
                    handler: () => {
                        const { sourceMap } = this;
                        const sdk = { name: 'typescript', version: pkg_1.default.version };
                        const stacks = this.getStackTraces().map(({ structured: locations }) => ({ locations }));
                        const sources = {};
                        if (this.showStackTraceSources) {
                            for (const { locations } of stacks) {
                                for (const { filePath } of locations) {
                                    if (!filePath)
                                        continue;
                                    const content = sourceMap?.sourcesContent?.[sourceMap?.sources.indexOf(filePath)];
                                    if (!content)
                                        continue;
                                    sources[filePath] = [
                                        {
                                            content,
                                            lineOffset: 0,
                                        },
                                    ];
                                }
                            }
                        }
                        return { sdk, stacks, sources };
                    },
                    description: 'Returns a stack trace annotated with source information.',
                },
            ],
            [
                '__temporal_workflow_metadata',
                {
                    handler: () => {
                        const workflowType = this.info.workflowType;
                        const queryDefinitions = Array.from(this.queryHandlers.entries()).map(([name, value]) => ({
                            name,
                            description: value.description,
                        }));
                        const signalDefinitions = Array.from(this.signalHandlers.entries()).map(([name, value]) => ({
                            name,
                            description: value.description,
                        }));
                        const updateDefinitions = Array.from(this.updateHandlers.entries()).map(([name, value]) => ({
                            name,
                            description: value.description,
                        }));
                        return {
                            definition: {
                                type: workflowType,
                                description: null, // For now, do not set the workflow description in the TS SDK.
                                queryDefinitions,
                                signalDefinitions,
                                updateDefinitions,
                            },
                        };
                    },
                    description: 'Returns metadata associated with this workflow.',
                },
            ],
        ]);
        /**
         * Loaded in {@link initRuntime}
         */
        this.interceptors = { inbound: [], outbound: [], internals: [] };
        /**
         * Buffer that stores all generated commands, reset after each activation
         */
        this.commands = [];
        /**
         * Stores all {@link condition}s that haven't been unblocked yet
         */
        this.blockedConditions = new Map();
        /**
         * Is this Workflow completed?
         *
         * A Workflow will be considered completed if it generates a command that the
         * system considers as a final Workflow command (e.g.
         * completeWorkflowExecution or failWorkflowExecution).
         */
        this.completed = false;
        /**
         * Was this Workflow cancelled?
         */
        this.cancelled = false;
        /**
         * This is tracked to allow buffering queries until a workflow function is called.
         * TODO(bergundy): I don't think this makes sense since queries run last in an activation and must be responded to in
         * the same activation.
         */
        this.workflowFunctionWasCalled = false;
        /**
         * The next (incremental) sequence to assign when generating completable commands
         */
        this.nextSeqs = {
            timer: 1,
            activity: 1,
            childWorkflow: 1,
            signalWorkflow: 1,
            cancelWorkflow: 1,
            condition: 1,
            // Used internally to keep track of active stack traces
            stack: 1,
        };
        this.payloadConverter = common_1.defaultPayloadConverter;
        this.failureConverter = common_1.defaultFailureConverter;
        /**
         * Patches we know the status of for this workflow, as in {@link patched}
         */
        this.knownPresentPatches = new Set();
        /**
         * Patches we sent to core {@link patched}
         */
        this.sentPatches = new Set();
        this.knownFlags = new Set();
        /**
         * Buffered sink calls per activation
         */
        this.sinkCalls = Array();
        this.getTimeOfDay = getTimeOfDay;
        this.info = info;
        this.now = now;
        this.showStackTraceSources = showStackTraceSources;
        this.sourceMap = sourceMap;
        this.random = (0, alea_1.alea)(randomnessSeed);
        this.registeredActivityNames = registeredActivityNames;
        if (info.unsafe.isReplaying) {
            for (const patchId of patches) {
                this.notifyHasPatch({ patchId });
            }
        }
    }
    mutateWorkflowInfo(fn) {
        this.info = fn(this.info);
    }
    getStackTraces() {
        const { childToParent, promiseToStack } = this.promiseStackStore;
        const internalNodes = [...childToParent.values()].reduce((acc, curr) => {
            for (const p of curr) {
                acc.add(p);
            }
            return acc;
        }, new Set());
        const stacks = new Map();
        for (const child of childToParent.keys()) {
            if (!internalNodes.has(child)) {
                const stack = promiseToStack.get(child);
                if (!stack || !stack.formatted)
                    continue;
                stacks.set(stack.formatted, stack);
            }
        }
        // Not 100% sure where this comes from, just filter it out
        stacks.delete('    at Promise.then (<anonymous>)');
        stacks.delete('    at Promise.then (<anonymous>)\n');
        return [...stacks].map(([_, stack]) => stack);
    }
    getAndResetSinkCalls() {
        const { sinkCalls } = this;
        this.sinkCalls = [];
        return sinkCalls;
    }
    /**
     * Buffer a Workflow command to be collected at the end of the current activation.
     *
     * Prevents commands from being added after Workflow completion.
     */
    pushCommand(cmd, complete = false) {
        // Only query responses may be sent after completion
        if (this.completed && !cmd.respondToQuery)
            return;
        this.commands.push(cmd);
        if (complete) {
            this.completed = true;
        }
    }
    concludeActivation() {
        return {
            commands: this.commands.splice(0),
            usedInternalFlags: [...this.knownFlags],
        };
    }
    async startWorkflowNextHandler({ args }) {
        const { workflow } = this;
        if (workflow === undefined) {
            throw new common_1.IllegalStateError('Workflow uninitialized');
        }
        let promise;
        try {
            promise = workflow(...args);
        }
        finally {
            // Queries must be handled even if there was an exception when invoking the Workflow function.
            this.workflowFunctionWasCalled = true;
            // Empty the buffer
            const buffer = this.bufferedQueries.splice(0);
            for (const activation of buffer) {
                this.queryWorkflow(activation);
            }
        }
        return await promise;
    }
    startWorkflow(activation) {
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'execute', this.startWorkflowNextHandler.bind(this));
        (0, stack_helpers_1.untrackPromise)((0, logs_1.executeWithLifecycleLogging)(() => execute({
            headers: activation.headers ?? {},
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.arguments),
        })).then(this.completeWorkflow.bind(this), this.handleWorkflowFailure.bind(this)));
    }
    cancelWorkflow(_activation) {
        this.cancelled = true;
        this.rootScope.cancel();
    }
    fireTimer(activation) {
        // Timers are a special case where their completion might not be in Workflow state,
        // this is due to immediate timer cancellation that doesn't go wait for Core.
        const completion = this.maybeConsumeCompletion('timer', getSeq(activation));
        completion?.resolve(undefined);
    }
    resolveActivity(activation) {
        if (!activation.result) {
            throw new TypeError('Got ResolveActivity activation with no result');
        }
        const { resolve, reject } = this.consumeCompletion('activity', getSeq(activation));
        if (activation.result.completed) {
            const completed = activation.result.completed;
            const result = completed.result ? this.payloadConverter.fromPayload(completed.result) : undefined;
            resolve(result);
        }
        else if (activation.result.failed) {
            const { failure } = activation.result.failed;
            const err = failure ? this.failureToError(failure) : undefined;
            reject(err);
        }
        else if (activation.result.cancelled) {
            const { failure } = activation.result.cancelled;
            const err = failure ? this.failureToError(failure) : undefined;
            reject(err);
        }
        else if (activation.result.backoff) {
            reject(new errors_1.LocalActivityDoBackoff(activation.result.backoff));
        }
    }
    resolveChildWorkflowExecutionStart(activation) {
        const { resolve, reject } = this.consumeCompletion('childWorkflowStart', getSeq(activation));
        if (activation.succeeded) {
            resolve(activation.succeeded.runId);
        }
        else if (activation.failed) {
            if (activation.failed.cause !==
                StartChildWorkflowExecutionFailedCause.START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_WORKFLOW_ALREADY_EXISTS) {
                throw new common_1.IllegalStateError('Got unknown StartChildWorkflowExecutionFailedCause');
            }
            if (!(activation.seq && activation.failed.workflowId && activation.failed.workflowType)) {
                throw new TypeError('Missing attributes in activation job');
            }
            reject(new common_1.WorkflowExecutionAlreadyStartedError('Workflow execution already started', activation.failed.workflowId, activation.failed.workflowType));
        }
        else if (activation.cancelled) {
            if (!activation.cancelled.failure) {
                throw new TypeError('Got no failure in cancelled variant');
            }
            reject(this.failureToError(activation.cancelled.failure));
        }
        else {
            throw new TypeError('Got ResolveChildWorkflowExecutionStart with no status');
        }
    }
    resolveChildWorkflowExecution(activation) {
        if (!activation.result) {
            throw new TypeError('Got ResolveChildWorkflowExecution activation with no result');
        }
        const { resolve, reject } = this.consumeCompletion('childWorkflowComplete', getSeq(activation));
        if (activation.result.completed) {
            const completed = activation.result.completed;
            const result = completed.result ? this.payloadConverter.fromPayload(completed.result) : undefined;
            resolve(result);
        }
        else if (activation.result.failed) {
            const { failure } = activation.result.failed;
            if (failure === undefined || failure === null) {
                throw new TypeError('Got failed result with no failure attribute');
            }
            reject(this.failureToError(failure));
        }
        else if (activation.result.cancelled) {
            const { failure } = activation.result.cancelled;
            if (failure === undefined || failure === null) {
                throw new TypeError('Got cancelled result with no failure attribute');
            }
            reject(this.failureToError(failure));
        }
    }
    // Intentionally non-async function so this handler doesn't show up in the stack trace
    queryWorkflowNextHandler({ queryName, args }) {
        const fn = this.queryHandlers.get(queryName)?.handler;
        if (fn === undefined) {
            const knownQueryTypes = [...this.queryHandlers.keys()].join(' ');
            // Fail the query
            return Promise.reject(new ReferenceError(`Workflow did not register a handler for ${queryName}. Registered queries: [${knownQueryTypes}]`));
        }
        try {
            const ret = fn(...args);
            if (ret instanceof Promise) {
                return Promise.reject(new errors_1.DeterminismViolationError('Query handlers should not return a Promise'));
            }
            return Promise.resolve(ret);
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    queryWorkflow(activation) {
        if (!this.workflowFunctionWasCalled) {
            this.bufferedQueries.push(activation);
            return;
        }
        const { queryType, queryId, headers } = activation;
        if (!(queryType && queryId)) {
            throw new TypeError('Missing query activation attributes');
        }
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'handleQuery', this.queryWorkflowNextHandler.bind(this));
        execute({
            queryName: queryType,
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.arguments),
            queryId,
            headers: headers ?? {},
        }).then((result) => this.completeQuery(queryId, result), (reason) => this.failQuery(queryId, reason));
    }
    doUpdate(activation) {
        const { id: updateId, protocolInstanceId, name, headers, runValidator } = activation;
        if (!updateId) {
            throw new TypeError('Missing activation update id');
        }
        if (!name) {
            throw new TypeError('Missing activation update name');
        }
        if (!protocolInstanceId) {
            throw new TypeError('Missing activation update protocolInstanceId');
        }
        if (!this.updateHandlers.has(name)) {
            this.bufferedUpdates.push(activation);
            return;
        }
        const makeInput = () => ({
            updateId,
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.input),
            name,
            headers: headers ?? {},
        });
        // The implementation below is responsible for upholding, and constrained
        // by, the following contract:
        //
        // 1. If no validator is present then validation interceptors will not be run.
        //
        // 2. During validation, any error must fail the Update; during the Update
        //    itself, Temporal errors fail the Update whereas other errors fail the
        //    activation.
        //
        // 3. The handler must not see any mutations of the arguments made by the
        //    validator.
        //
        // 4. Any error when decoding/deserializing input must be caught and result
        //    in rejection of the Update before it is accepted, even if there is no
        //    validator.
        //
        // 5. The initial synchronous portion of the (async) Update handler should
        //    be executed after the (sync) validator completes such that there is
        //    minimal opportunity for a different concurrent task to be scheduled
        //    between them.
        //
        // 6. The stack trace view provided in the Temporal UI must not be polluted
        //    by promises that do not derive from user code. This implies that
        //    async/await syntax may not be used.
        //
        // Note that there is a deliberately unhandled promise rejection below.
        // These are caught elsewhere and fail the corresponding activation.
        let input;
        try {
            if (runValidator && this.updateHandlers.get(name)?.validator) {
                const validate = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'validateUpdate', this.validateUpdateNextHandler.bind(this));
                validate(makeInput());
            }
            input = makeInput();
        }
        catch (error) {
            this.rejectUpdate(protocolInstanceId, error);
            return;
        }
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'handleUpdate', this.updateNextHandler.bind(this));
        this.acceptUpdate(protocolInstanceId);
        (0, stack_helpers_1.untrackPromise)(execute(input)
            .then((result) => this.completeUpdate(protocolInstanceId, result))
            .catch((error) => {
            if (error instanceof common_1.TemporalFailure) {
                this.rejectUpdate(protocolInstanceId, error);
            }
            else {
                throw error;
            }
        }));
    }
    async updateNextHandler({ name, args }) {
        const entry = this.updateHandlers.get(name);
        if (!entry) {
            return Promise.reject(new common_1.IllegalStateError(`No registered update handler for update: ${name}`));
        }
        const { handler } = entry;
        return await handler(...args);
    }
    validateUpdateNextHandler({ name, args }) {
        const { validator } = this.updateHandlers.get(name) ?? {};
        if (validator) {
            validator(...args);
        }
    }
    dispatchBufferedUpdates() {
        const bufferedUpdates = this.bufferedUpdates;
        while (bufferedUpdates.length) {
            const foundIndex = bufferedUpdates.findIndex((update) => this.updateHandlers.has(update.name));
            if (foundIndex === -1) {
                // No buffered Updates have a handler yet.
                break;
            }
            const [update] = bufferedUpdates.splice(foundIndex, 1);
            this.doUpdate(update);
        }
    }
    rejectBufferedUpdates() {
        while (this.bufferedUpdates.length) {
            const update = this.bufferedUpdates.shift();
            if (update) {
                this.rejectUpdate(
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                update.protocolInstanceId, common_1.ApplicationFailure.nonRetryable(`No registered handler for update: ${update.name}`));
            }
        }
    }
    async signalWorkflowNextHandler({ signalName, args }) {
        const fn = this.signalHandlers.get(signalName)?.handler;
        if (fn) {
            return await fn(...args);
        }
        else if (this.defaultSignalHandler) {
            return await this.defaultSignalHandler(signalName, ...args);
        }
        else {
            throw new common_1.IllegalStateError(`No registered signal handler for signal: ${signalName}`);
        }
    }
    signalWorkflow(activation) {
        const { signalName, headers } = activation;
        if (!signalName) {
            throw new TypeError('Missing activation signalName');
        }
        if (!this.signalHandlers.has(signalName) && !this.defaultSignalHandler) {
            this.bufferedSignals.push(activation);
            return;
        }
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'handleSignal', this.signalWorkflowNextHandler.bind(this));
        execute({
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.input),
            signalName,
            headers: headers ?? {},
        }).catch(this.handleWorkflowFailure.bind(this));
    }
    dispatchBufferedSignals() {
        const bufferedSignals = this.bufferedSignals;
        while (bufferedSignals.length) {
            if (this.defaultSignalHandler) {
                // We have a default signal handler, so all signals are dispatchable
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.signalWorkflow(bufferedSignals.shift());
            }
            else {
                const foundIndex = bufferedSignals.findIndex((signal) => this.signalHandlers.has(signal.signalName));
                if (foundIndex === -1)
                    break;
                const [signal] = bufferedSignals.splice(foundIndex, 1);
                this.signalWorkflow(signal);
            }
        }
    }
    resolveSignalExternalWorkflow(activation) {
        const { resolve, reject } = this.consumeCompletion('signalWorkflow', getSeq(activation));
        if (activation.failure) {
            reject(this.failureToError(activation.failure));
        }
        else {
            resolve(undefined);
        }
    }
    resolveRequestCancelExternalWorkflow(activation) {
        const { resolve, reject } = this.consumeCompletion('cancelWorkflow', getSeq(activation));
        if (activation.failure) {
            reject(this.failureToError(activation.failure));
        }
        else {
            resolve(undefined);
        }
    }
    updateRandomSeed(activation) {
        if (!activation.randomnessSeed) {
            throw new TypeError('Expected activation with randomnessSeed attribute');
        }
        this.random = (0, alea_1.alea)(activation.randomnessSeed.toBytes());
    }
    notifyHasPatch(activation) {
        if (!activation.patchId) {
            throw new TypeError('Notify has patch missing patch name');
        }
        this.knownPresentPatches.add(activation.patchId);
    }
    patchInternal(patchId, deprecated) {
        if (this.workflow === undefined) {
            throw new common_1.IllegalStateError('Patches cannot be used before Workflow starts');
        }
        const usePatch = !this.info.unsafe.isReplaying || this.knownPresentPatches.has(patchId);
        // Avoid sending commands for patches core already knows about.
        // This optimization enables development of automatic patching tools.
        if (usePatch && !this.sentPatches.has(patchId)) {
            this.pushCommand({
                setPatchMarker: { patchId, deprecated },
            });
            this.sentPatches.add(patchId);
        }
        return usePatch;
    }
    // Called early while handling an activation to register known flags
    addKnownFlags(flags) {
        for (const flag of flags) {
            (0, flags_1.assertValidFlag)(flag);
            this.knownFlags.add(flag);
        }
    }
    hasFlag(flag) {
        if (this.knownFlags.has(flag.id)) {
            return true;
        }
        if (!this.info.unsafe.isReplaying && flag.default) {
            this.knownFlags.add(flag.id);
            return true;
        }
        return false;
    }
    removeFromCache() {
        throw new common_1.IllegalStateError('removeFromCache activation job should not reach workflow');
    }
    /**
     * Transforms failures into a command to be sent to the server.
     * Used to handle any failure emitted by the Workflow.
     */
    async handleWorkflowFailure(error) {
        if (this.cancelled && (0, errors_1.isCancellation)(error)) {
            this.pushCommand({ cancelWorkflowExecution: {} }, true);
        }
        else if (error instanceof interfaces_1.ContinueAsNew) {
            this.pushCommand({ continueAsNewWorkflowExecution: error.command }, true);
        }
        else {
            if (!(error instanceof common_1.TemporalFailure)) {
                // This results in an unhandled rejection which will fail the activation
                // preventing it from completing.
                throw error;
            }
            this.pushCommand({
                failWorkflowExecution: {
                    failure: this.errorToFailure(error),
                },
            }, true);
        }
    }
    completeQuery(queryId, result) {
        this.pushCommand({
            respondToQuery: { queryId, succeeded: { response: this.payloadConverter.toPayload(result) } },
        });
    }
    failQuery(queryId, error) {
        this.pushCommand({
            respondToQuery: {
                queryId,
                failed: this.errorToFailure((0, common_1.ensureTemporalFailure)(error)),
            },
        });
    }
    acceptUpdate(protocolInstanceId) {
        this.pushCommand({ updateResponse: { protocolInstanceId, accepted: {} } });
    }
    completeUpdate(protocolInstanceId, result) {
        this.pushCommand({
            updateResponse: { protocolInstanceId, completed: this.payloadConverter.toPayload(result) },
        });
    }
    rejectUpdate(protocolInstanceId, error) {
        this.pushCommand({
            updateResponse: {
                protocolInstanceId,
                rejected: this.errorToFailure((0, common_1.ensureTemporalFailure)(error)),
            },
        });
    }
    /** Consume a completion if it exists in Workflow state */
    maybeConsumeCompletion(type, taskSeq) {
        const completion = this.completions[type].get(taskSeq);
        if (completion !== undefined) {
            this.completions[type].delete(taskSeq);
        }
        return completion;
    }
    /** Consume a completion if it exists in Workflow state, throws if it doesn't */
    consumeCompletion(type, taskSeq) {
        const completion = this.maybeConsumeCompletion(type, taskSeq);
        if (completion === undefined) {
            throw new common_1.IllegalStateError(`No completion for taskSeq ${taskSeq}`);
        }
        return completion;
    }
    completeWorkflow(result) {
        this.pushCommand({
            completeWorkflowExecution: {
                result: this.payloadConverter.toPayload(result),
            },
        }, true);
    }
    errorToFailure(err) {
        return this.failureConverter.errorToFailure(err, this.payloadConverter);
    }
    failureToError(failure) {
        return this.failureConverter.failureToError(failure, this.payloadConverter);
    }
}
exports.Activator = Activator;
function getSeq(activation) {
    const seq = activation.seq;
    if (seq === undefined || seq === null) {
        throw new TypeError(`Got activation with no seq attribute`);
    }
    return seq;
}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/logs.js":
/*!*******************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/logs.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.workflowLogAttributes = exports.executeWithLifecycleLogging = exports.log = void 0;
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
const sinks_1 = __webpack_require__(/*! ./sinks */ "./node_modules/@temporalio/workflow/lib/sinks.js");
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js");
const interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const loggerSink = (0, sinks_1.proxySinks)().__temporal_logger;
/**
 * Symbol used by the SDK logger to extract a timestamp from log attributes.
 * Also defined in `worker/logger.ts` - intentionally not shared.
 */
const LogTimestamp = Symbol.for('log_timestamp');
/**
 * Default workflow logger.
 *
 * This logger is replay-aware and will omit log messages on workflow replay. Messages emitted by this logger are
 * funnelled through a sink that forwards them to the logger registered on {@link Runtime.logger}.
 *
 * Attributes from the current Workflow Execution context are automatically included as metadata on every log
 * entries. An extra `sdkComponent` metadata attribute is also added, with value `workflow`; this can be used for
 * fine-grained filtering of log entries further downstream.
 *
 * To customize log attributes, register a {@link WorkflowOutboundCallsInterceptor} that intercepts the
 * `getLogAttributes()` method.
 *
 * Notice that since sinks are used to power this logger, any log attributes must be transferable via the
 * {@link https://nodejs.org/api/worker_threads.html#worker_threads_port_postmessage_value_transferlist | postMessage}
 * API.
 *
 * NOTE: Specifying a custom logger through {@link defaultSink} or by manually registering a sink named
 * `defaultWorkerLogger` has been deprecated. Please use {@link Runtime.logger} instead.
 */
exports.log = Object.fromEntries(['trace', 'debug', 'info', 'warn', 'error'].map((level) => {
    return [
        level,
        (message, attrs) => {
            const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.log(...) may only be used from workflow context.');
            const getLogAttributes = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'getLogAttributes', (a) => a);
            return loggerSink[level](message, {
                // Inject the call time in nanosecond resolution as expected by the worker logger.
                [LogTimestamp]: activator.getTimeOfDay(),
                sdkComponent: common_1.SdkComponent.workflow,
                ...getLogAttributes(workflowLogAttributes(activator.info)),
                ...attrs,
            });
        },
    ];
}));
function executeWithLifecycleLogging(fn) {
    exports.log.debug('Workflow started', { sdkComponent: common_1.SdkComponent.worker });
    const p = fn().then((res) => {
        exports.log.debug('Workflow completed', { sdkComponent: common_1.SdkComponent.worker });
        return res;
    }, (error) => {
        // Avoid using instanceof checks in case the modules they're defined in loaded more than once,
        // e.g. by jest or when multiple versions are installed.
        if (typeof error === 'object' && error != null) {
            if ((0, errors_1.isCancellation)(error)) {
                exports.log.debug('Workflow completed as cancelled', { sdkComponent: common_1.SdkComponent.worker });
                throw error;
            }
            else if (error instanceof interfaces_1.ContinueAsNew) {
                exports.log.debug('Workflow continued as new', { sdkComponent: common_1.SdkComponent.worker });
                throw error;
            }
        }
        exports.log.warn('Workflow failed', { error, sdkComponent: common_1.SdkComponent.worker });
        throw error;
    });
    // Avoid showing this interceptor in stack trace query
    (0, stack_helpers_1.untrackPromise)(p);
    return p;
}
exports.executeWithLifecycleLogging = executeWithLifecycleLogging;
/**
 * Returns a map of attributes to be set _by default_ on log messages for a given Workflow.
 * Note that this function may be called from outside of the Workflow context (eg. by the worker itself).
 */
function workflowLogAttributes(info) {
    return {
        namespace: info.namespace,
        taskQueue: info.taskQueue,
        workflowId: info.workflowId,
        runId: info.runId,
        workflowType: info.workflowType,
    };
}
exports.workflowLogAttributes = workflowLogAttributes;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/pkg.js":
/*!******************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/pkg.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// ../package.json is outside of the TS project rootDir which causes TS to complain about this import.
// We do not want to change the rootDir because it messes up the output structure.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const package_json_1 = __importDefault(__webpack_require__(/*! ../package.json */ "./node_modules/@temporalio/workflow/package.json"));
exports["default"] = package_json_1.default;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/sinks.js":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/sinks.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Type definitions for the Workflow end of the sinks mechanism.
 *
 * Sinks are a mechanism for exporting data from the Workflow isolate to the
 * Node.js environment, they are necessary because the Workflow has no way to
 * communicate with the outside World.
 *
 * Sinks are typically used for exporting logs, metrics and traces out from the
 * Workflow.
 *
 * Sink functions may not return values to the Workflow in order to prevent
 * breaking determinism.
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.proxySinks = void 0;
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
/**
 * Get a reference to Sinks for exporting data out of the Workflow.
 *
 * These Sinks **must** be registered with the Worker in order for this
 * mechanism to work.
 *
 * @example
 * ```ts
 * import { proxySinks, Sinks } from '@temporalio/workflow';
 *
 * interface MySinks extends Sinks {
 *   logger: {
 *     info(message: string): void;
 *     error(message: string): void;
 *   };
 * }
 *
 * const { logger } = proxySinks<MyDependencies>();
 * logger.info('setting up');
 *
 * export function myWorkflow() {
 *   return {
 *     async execute() {
 *       logger.info("hey ho");
 *       logger.error("lets go");
 *     }
 *   };
 * }
 * ```
 */
function proxySinks() {
    return new Proxy({}, {
        get(_, ifaceName) {
            return new Proxy({}, {
                get(_, fnName) {
                    return (...args) => {
                        const activator = (0, global_attributes_1.assertInWorkflowContext)('Proxied sinks functions may only be used from a Workflow Execution.');
                        activator.sinkCalls.push({
                            ifaceName: ifaceName,
                            fnName: fnName,
                            // Sink function doesn't get called immediately. Make a clone of the sink's args, so that further mutations
                            // to these objects don't corrupt the args that the sink function will receive. Only available from node 17.
                            args: globalThis.structuredClone ? globalThis.structuredClone(args) : args,
                            // activator.info is internally copy-on-write. This ensure that any further mutations
                            // to the workflow state in the context of the present activation will not corrupt the
                            // workflowInfo state that gets passed when the sink function actually gets called.
                            workflowInfo: activator.info,
                        });
                    };
                },
            });
        },
    });
}
exports.proxySinks = proxySinks;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/stack-helpers.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/stack-helpers.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.untrackPromise = void 0;
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
/**
 * Helper function to remove a promise from being tracked for stack trace query purposes
 */
function untrackPromise(promise) {
    const store = (0, global_attributes_1.maybeGetActivatorUntyped)()?.promiseStackStore;
    if (!store)
        return;
    store.childToParent.delete(promise);
    store.promiseToStack.delete(promise);
}
exports.untrackPromise = untrackPromise;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/trigger.js":
/*!**********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/trigger.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Trigger = void 0;
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
/**
 * A `PromiseLike` helper which exposes its `resolve` and `reject` methods.
 *
 * Trigger is CancellationScope-aware: it is linked to the current scope on
 * construction and throws when that scope is cancelled.
 *
 * Useful for e.g. waiting for unblocking a Workflow from a Signal.
 *
 * @example
 * <!--SNIPSTART typescript-trigger-workflow-->
 * <!--SNIPEND-->
 */
class Trigger {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            const scope = cancellation_scope_1.CancellationScope.current();
            if (scope.cancellable) {
                (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.resolve = resolve;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.reject = reject;
        });
        // Avoid unhandled rejections
        (0, stack_helpers_1.untrackPromise)(this.promise.catch(() => undefined));
    }
    then(onfulfilled, onrejected) {
        return this.promise.then(onfulfilled, onrejected);
    }
}
exports.Trigger = Trigger;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/worker-interface.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/worker-interface.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dispose = exports.shouldUnblockConditions = exports.tryUnblockConditions = exports.getAndResetSinkCalls = exports.concludeActivation = exports.activate = exports.initRuntime = void 0;
/**
 * Exported functions for the Worker to interact with the Workflow isolate
 *
 * @module
 */
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const time_1 = __webpack_require__(/*! @temporalio/common/lib/time */ "./node_modules/@temporalio/common/lib/time.js");
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const internals_1 = __webpack_require__(/*! ./internals */ "./node_modules/@temporalio/workflow/lib/internals.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const global = globalThis;
const OriginalDate = globalThis.Date;
/**
 * Initialize the isolate runtime.
 *
 * Sets required internal state and instantiates the workflow and interceptors.
 */
function initRuntime(options) {
    const activator = new internals_1.Activator({
        ...options,
        info: fixPrototypes({
            ...options.info,
            unsafe: { ...options.info.unsafe, now: OriginalDate.now },
        }),
    });
    // There's on activator per workflow instance, set it globally on the context.
    // We do this before importing any user code so user code can statically reference @temporalio/workflow functions
    // as well as Date and Math.random.
    (0, global_attributes_1.setActivatorUntyped)(activator);
    // webpack alias to payloadConverterPath
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const customPayloadConverter = (__webpack_require__(/*! __temporal_custom_payload_converter */ "?2065").payloadConverter);
    // The `payloadConverter` export is validated in the Worker
    if (customPayloadConverter != null) {
        activator.payloadConverter = customPayloadConverter;
    }
    // webpack alias to failureConverterPath
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const customFailureConverter = (__webpack_require__(/*! __temporal_custom_failure_converter */ "?31ff").failureConverter);
    // The `failureConverter` export is validated in the Worker
    if (customFailureConverter != null) {
        activator.failureConverter = customFailureConverter;
    }
    const { importWorkflows, importInterceptors } = global.__TEMPORAL__;
    if (importWorkflows === undefined || importInterceptors === undefined) {
        throw new common_1.IllegalStateError('Workflow bundle did not register import hooks');
    }
    const interceptors = importInterceptors();
    for (const mod of interceptors) {
        const factory = mod.interceptors;
        if (factory !== undefined) {
            if (typeof factory !== 'function') {
                throw new TypeError(`Failed to initialize workflows interceptors: expected a function, but got: '${factory}'`);
            }
            const interceptors = factory();
            activator.interceptors.inbound.push(...(interceptors.inbound ?? []));
            activator.interceptors.outbound.push(...(interceptors.outbound ?? []));
            activator.interceptors.internals.push(...(interceptors.internals ?? []));
        }
    }
    const mod = importWorkflows();
    const workflowFn = mod[activator.info.workflowType];
    const defaultWorkflowFn = mod['default'];
    if (typeof workflowFn === 'function') {
        activator.workflow = workflowFn;
    }
    else if (typeof defaultWorkflowFn === 'function') {
        activator.workflow = defaultWorkflowFn;
    }
    else {
        const details = workflowFn === undefined
            ? 'no such function is exported by the workflow bundle'
            : `expected a function, but got: '${typeof workflowFn}'`;
        throw new TypeError(`Failed to initialize workflow of type '${activator.info.workflowType}': ${details}`);
    }
}
exports.initRuntime = initRuntime;
/**
 * Objects transfered to the VM from outside have prototypes belonging to the
 * outer context, which means that instanceof won't work inside the VM. This
 * function recursively walks over the content of an object, and recreate some
 * of these objects (notably Array, Date and Objects).
 */
function fixPrototypes(obj) {
    if (obj != null && typeof obj === 'object') {
        switch (Object.getPrototypeOf(obj)?.constructor?.name) {
            case 'Array':
                return Array.from(obj.map(fixPrototypes));
            case 'Date':
                return new Date(obj);
            default:
                return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fixPrototypes(v)]));
        }
    }
    else
        return obj;
}
/**
 * Run a chunk of activation jobs
 * @returns a boolean indicating whether job was processed or ignored
 */
function activate(activation, batchIndex) {
    const activator = (0, global_attributes_1.getActivator)();
    const intercept = (0, interceptors_1.composeInterceptors)(activator.interceptors.internals, 'activate', ({ activation, batchIndex }) => {
        if (batchIndex === 0) {
            if (!activation.jobs) {
                throw new TypeError('Got activation with no jobs');
            }
            if (activation.timestamp != null) {
                // timestamp will not be updated for activation that contain only queries
                activator.now = (0, time_1.tsToMs)(activation.timestamp);
            }
            activator.addKnownFlags(activation.availableInternalFlags ?? []);
            // The Rust Core ensures that these activation fields are not null
            activator.mutateWorkflowInfo((info) => ({
                ...info,
                historyLength: activation.historyLength,
                // Exact truncation for multi-petabyte histories
                // historySize === 0 means WFT was generated by pre-1.20.0 server, and the history size is unknown
                historySize: activation.historySizeBytes?.toNumber() || 0,
                continueAsNewSuggested: activation.continueAsNewSuggested ?? false,
                currentBuildId: activation.buildIdForCurrentTask ?? undefined,
                unsafe: {
                    ...info.unsafe,
                    isReplaying: activation.isReplaying ?? false,
                },
            }));
        }
        // Cast from the interface to the class which has the `variant` attribute.
        // This is safe because we know that activation is a proto class.
        const jobs = activation.jobs;
        for (const job of jobs) {
            if (job.variant === undefined) {
                throw new TypeError('Expected job.variant to be defined');
            }
            const variant = job[job.variant];
            if (!variant) {
                throw new TypeError(`Expected job.${job.variant} to be set`);
            }
            // The only job that can be executed on a completed workflow is a query.
            // We might get other jobs after completion for instance when a single
            // activation contains multiple jobs and the first one completes the workflow.
            if (activator.completed && job.variant !== 'queryWorkflow') {
                return;
            }
            activator[job.variant](variant /* TS can't infer this type */);
            if (shouldUnblockConditions(job)) {
                tryUnblockConditions();
            }
        }
    });
    intercept({
        activation,
        batchIndex,
    });
}
exports.activate = activate;
/**
 * Conclude a single activation.
 * Should be called after processing all activation jobs and queued microtasks.
 *
 * Activation failures are handled in the main Node.js isolate.
 */
function concludeActivation() {
    const activator = (0, global_attributes_1.getActivator)();
    activator.rejectBufferedUpdates();
    const intercept = (0, interceptors_1.composeInterceptors)(activator.interceptors.internals, 'concludeActivation', (input) => input);
    const { info } = activator;
    const activationCompletion = activator.concludeActivation();
    const { commands } = intercept({ commands: activationCompletion.commands });
    return {
        runId: info.runId,
        successful: { ...activationCompletion, commands },
    };
}
exports.concludeActivation = concludeActivation;
function getAndResetSinkCalls() {
    return (0, global_attributes_1.getActivator)().getAndResetSinkCalls();
}
exports.getAndResetSinkCalls = getAndResetSinkCalls;
/**
 * Loop through all blocked conditions, evaluate and unblock if possible.
 *
 * @returns number of unblocked conditions.
 */
function tryUnblockConditions() {
    let numUnblocked = 0;
    for (;;) {
        const prevUnblocked = numUnblocked;
        for (const [seq, cond] of (0, global_attributes_1.getActivator)().blockedConditions.entries()) {
            if (cond.fn()) {
                cond.resolve();
                numUnblocked++;
                // It is safe to delete elements during map iteration
                (0, global_attributes_1.getActivator)().blockedConditions.delete(seq);
            }
        }
        if (prevUnblocked === numUnblocked) {
            break;
        }
    }
    return numUnblocked;
}
exports.tryUnblockConditions = tryUnblockConditions;
/**
 * Predicate used to prevent triggering conditions for non-query and non-patch jobs.
 */
function shouldUnblockConditions(job) {
    return !job.queryWorkflow && !job.notifyHasPatch;
}
exports.shouldUnblockConditions = shouldUnblockConditions;
function dispose() {
    const dispose = (0, interceptors_1.composeInterceptors)((0, global_attributes_1.getActivator)().interceptors.internals, 'dispose', async () => {
        (0, cancellation_scope_1.disableStorage)();
    });
    dispose({});
}
exports.dispose = dispose;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/workflow.js":
/*!***********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/workflow.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.workflowMetadataQuery = exports.enhancedStackTraceQuery = exports.stackTraceQuery = exports.upsertSearchAttributes = exports.setDefaultSignalHandler = exports.setHandler = exports.defineQuery = exports.defineSignal = exports.defineUpdate = exports.condition = exports.deprecatePatch = exports.patched = exports.uuid4 = exports.continueAsNew = exports.makeContinueAsNewFunc = exports.inWorkflowContext = exports.workflowInfo = exports.executeChild = exports.startChild = exports.getExternalWorkflowHandle = exports.proxyLocalActivities = exports.proxyActivities = exports.NotAnActivityMethod = exports.scheduleLocalActivity = exports.scheduleActivity = exports.sleep = exports.addDefaultWorkflowOptions = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const versioning_intent_enum_1 = __webpack_require__(/*! @temporalio/common/lib/versioning-intent-enum */ "./node_modules/@temporalio/common/lib/versioning-intent-enum.js");
const time_1 = __webpack_require__(/*! @temporalio/common/lib/time */ "./node_modules/@temporalio/common/lib/time.js");
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
// Avoid a circular dependency
(0, cancellation_scope_1.registerSleepImplementation)(sleep);
/**
 * Adds default values to `workflowId` and `workflowIdReusePolicy` to given workflow options.
 */
function addDefaultWorkflowOptions(opts) {
    const { args, workflowId, ...rest } = opts;
    return {
        workflowId: workflowId ?? uuid4(),
        args: (args ?? []),
        cancellationType: interfaces_1.ChildWorkflowCancellationType.WAIT_CANCELLATION_COMPLETED,
        ...rest,
    };
}
exports.addDefaultWorkflowOptions = addDefaultWorkflowOptions;
/**
 * Push a startTimer command into state accumulator and register completion
 */
function timerNextHandler(input) {
    const activator = (0, global_attributes_1.getActivator)();
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch((err) => {
                if (!activator.completions.timer.delete(input.seq)) {
                    return; // Already resolved or never scheduled
                }
                activator.pushCommand({
                    cancelTimer: {
                        seq: input.seq,
                    },
                });
                reject(err);
            }));
        }
        activator.pushCommand({
            startTimer: {
                seq: input.seq,
                startToFireTimeout: (0, time_1.msToTs)(input.durationMs),
            },
        });
        activator.completions.timer.set(input.seq, {
            resolve,
            reject,
        });
    });
}
/**
 * Asynchronous sleep.
 *
 * Schedules a timer on the Temporal service.
 *
 * @param ms sleep duration - number of milliseconds or {@link https://www.npmjs.com/package/ms | ms-formatted string}.
 * If given a negative number or 0, value will be set to 1.
 */
function sleep(ms) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.sleep(...) may only be used from a Workflow Execution');
    const seq = activator.nextSeqs.timer++;
    const durationMs = Math.max(1, (0, time_1.msToNumber)(ms));
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'startTimer', timerNextHandler);
    return execute({
        durationMs,
        seq,
    });
}
exports.sleep = sleep;
function validateActivityOptions(options) {
    if (options.scheduleToCloseTimeout === undefined && options.startToCloseTimeout === undefined) {
        throw new TypeError('Required either scheduleToCloseTimeout or startToCloseTimeout');
    }
}
// Use same validation we use for normal activities
const validateLocalActivityOptions = validateActivityOptions;
/**
 * Push a scheduleActivity command into activator accumulator and register completion
 */
function scheduleActivityNextHandler({ options, args, headers, seq, activityType }) {
    const activator = (0, global_attributes_1.getActivator)();
    validateActivityOptions(options);
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                if (!activator.completions.activity.has(seq)) {
                    return; // Already resolved or never scheduled
                }
                activator.pushCommand({
                    requestCancelActivity: {
                        seq,
                    },
                });
            }));
        }
        activator.pushCommand({
            scheduleActivity: {
                seq,
                activityId: options.activityId ?? `${seq}`,
                activityType,
                arguments: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                retryPolicy: options.retry ? (0, common_1.compileRetryPolicy)(options.retry) : undefined,
                taskQueue: options.taskQueue || activator.info.taskQueue,
                heartbeatTimeout: (0, time_1.msOptionalToTs)(options.heartbeatTimeout),
                scheduleToCloseTimeout: (0, time_1.msOptionalToTs)(options.scheduleToCloseTimeout),
                startToCloseTimeout: (0, time_1.msOptionalToTs)(options.startToCloseTimeout),
                scheduleToStartTimeout: (0, time_1.msOptionalToTs)(options.scheduleToStartTimeout),
                headers,
                cancellationType: options.cancellationType,
                doNotEagerlyExecute: !(options.allowEagerDispatch ?? true),
                versioningIntent: (0, versioning_intent_enum_1.versioningIntentToProto)(options.versioningIntent),
            },
        });
        activator.completions.activity.set(seq, {
            resolve,
            reject,
        });
    });
}
/**
 * Push a scheduleActivity command into state accumulator and register completion
 */
async function scheduleLocalActivityNextHandler({ options, args, headers, seq, activityType, attempt, originalScheduleTime, }) {
    const activator = (0, global_attributes_1.getActivator)();
    // Eagerly fail the local activity (which will in turn fail the workflow task.
    // Do not fail on replay where the local activities may not be registered on the replay worker.
    if (!activator.info.unsafe.isReplaying && !activator.registeredActivityNames.has(activityType)) {
        throw new ReferenceError(`Local activity of type '${activityType}' not registered on worker`);
    }
    validateLocalActivityOptions(options);
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                if (!activator.completions.activity.has(seq)) {
                    return; // Already resolved or never scheduled
                }
                activator.pushCommand({
                    requestCancelLocalActivity: {
                        seq,
                    },
                });
            }));
        }
        activator.pushCommand({
            scheduleLocalActivity: {
                seq,
                attempt,
                originalScheduleTime,
                // Intentionally not exposing activityId as an option
                activityId: `${seq}`,
                activityType,
                arguments: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                retryPolicy: options.retry ? (0, common_1.compileRetryPolicy)(options.retry) : undefined,
                scheduleToCloseTimeout: (0, time_1.msOptionalToTs)(options.scheduleToCloseTimeout),
                startToCloseTimeout: (0, time_1.msOptionalToTs)(options.startToCloseTimeout),
                scheduleToStartTimeout: (0, time_1.msOptionalToTs)(options.scheduleToStartTimeout),
                localRetryThreshold: (0, time_1.msOptionalToTs)(options.localRetryThreshold),
                headers,
                cancellationType: options.cancellationType,
            },
        });
        activator.completions.activity.set(seq, {
            resolve,
            reject,
        });
    });
}
/**
 * Schedule an activity and run outbound interceptors
 * @hidden
 */
function scheduleActivity(activityType, args, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.scheduleActivity(...) may only be used from a Workflow Execution');
    if (options === undefined) {
        throw new TypeError('Got empty activity options');
    }
    const seq = activator.nextSeqs.activity++;
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'scheduleActivity', scheduleActivityNextHandler);
    return execute({
        activityType,
        headers: {},
        options,
        args,
        seq,
    });
}
exports.scheduleActivity = scheduleActivity;
/**
 * Schedule an activity and run outbound interceptors
 * @hidden
 */
async function scheduleLocalActivity(activityType, args, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.scheduleLocalActivity(...) may only be used from a Workflow Execution');
    if (options === undefined) {
        throw new TypeError('Got empty activity options');
    }
    let attempt = 1;
    let originalScheduleTime = undefined;
    for (;;) {
        const seq = activator.nextSeqs.activity++;
        const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'scheduleLocalActivity', scheduleLocalActivityNextHandler);
        try {
            return (await execute({
                activityType,
                headers: {},
                options,
                args,
                seq,
                attempt,
                originalScheduleTime,
            }));
        }
        catch (err) {
            if (err instanceof errors_1.LocalActivityDoBackoff) {
                await sleep((0, time_1.tsToMs)(err.backoff.backoffDuration));
                if (typeof err.backoff.attempt !== 'number') {
                    throw new TypeError('Invalid backoff attempt type');
                }
                attempt = err.backoff.attempt;
                originalScheduleTime = err.backoff.originalScheduleTime ?? undefined;
            }
            else {
                throw err;
            }
        }
    }
}
exports.scheduleLocalActivity = scheduleLocalActivity;
function startChildWorkflowExecutionNextHandler({ options, headers, workflowType, seq, }) {
    const activator = (0, global_attributes_1.getActivator)();
    const workflowId = options.workflowId ?? uuid4();
    const startPromise = new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                const complete = !activator.completions.childWorkflowComplete.has(seq);
                if (!complete) {
                    activator.pushCommand({
                        cancelChildWorkflowExecution: { childWorkflowSeq: seq },
                    });
                }
                // Nothing to cancel otherwise
            }));
        }
        activator.pushCommand({
            startChildWorkflowExecution: {
                seq,
                workflowId,
                workflowType,
                input: (0, common_1.toPayloads)(activator.payloadConverter, ...options.args),
                retryPolicy: options.retry ? (0, common_1.compileRetryPolicy)(options.retry) : undefined,
                taskQueue: options.taskQueue || activator.info.taskQueue,
                workflowExecutionTimeout: (0, time_1.msOptionalToTs)(options.workflowExecutionTimeout),
                workflowRunTimeout: (0, time_1.msOptionalToTs)(options.workflowRunTimeout),
                workflowTaskTimeout: (0, time_1.msOptionalToTs)(options.workflowTaskTimeout),
                namespace: activator.info.namespace, // Not configurable
                headers,
                cancellationType: options.cancellationType,
                workflowIdReusePolicy: options.workflowIdReusePolicy,
                parentClosePolicy: options.parentClosePolicy,
                cronSchedule: options.cronSchedule,
                searchAttributes: options.searchAttributes
                    ? (0, common_1.mapToPayloads)(common_1.searchAttributePayloadConverter, options.searchAttributes)
                    : undefined,
                memo: options.memo && (0, common_1.mapToPayloads)(activator.payloadConverter, options.memo),
                versioningIntent: (0, versioning_intent_enum_1.versioningIntentToProto)(options.versioningIntent),
            },
        });
        activator.completions.childWorkflowStart.set(seq, {
            resolve,
            reject,
        });
    });
    // We construct a Promise for the completion of the child Workflow before we know
    // if the Workflow code will await it to capture the result in case it does.
    const completePromise = new Promise((resolve, reject) => {
        // Chain start Promise rejection to the complete Promise.
        (0, stack_helpers_1.untrackPromise)(startPromise.catch(reject));
        activator.completions.childWorkflowComplete.set(seq, {
            resolve,
            reject,
        });
    });
    (0, stack_helpers_1.untrackPromise)(startPromise);
    (0, stack_helpers_1.untrackPromise)(completePromise);
    // Prevent unhandled rejection because the completion might not be awaited
    (0, stack_helpers_1.untrackPromise)(completePromise.catch(() => undefined));
    const ret = new Promise((resolve) => resolve([startPromise, completePromise]));
    (0, stack_helpers_1.untrackPromise)(ret);
    return ret;
}
function signalWorkflowNextHandler({ seq, signalName, args, target, headers }) {
    const activator = (0, global_attributes_1.getActivator)();
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                if (!activator.completions.signalWorkflow.has(seq)) {
                    return;
                }
                activator.pushCommand({ cancelSignalWorkflow: { seq } });
            }));
        }
        activator.pushCommand({
            signalExternalWorkflowExecution: {
                seq,
                args: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                headers,
                signalName,
                ...(target.type === 'external'
                    ? {
                        workflowExecution: {
                            namespace: activator.info.namespace,
                            ...target.workflowExecution,
                        },
                    }
                    : {
                        childWorkflowId: target.childWorkflowId,
                    }),
            },
        });
        activator.completions.signalWorkflow.set(seq, { resolve, reject });
    });
}
/**
 * Symbol used in the return type of proxy methods to mark that an attribute on the source type is not a method.
 *
 * @see {@link ActivityInterfaceFor}
 * @see {@link proxyActivities}
 * @see {@link proxyLocalActivities}
 */
exports.NotAnActivityMethod = Symbol.for('__TEMPORAL_NOT_AN_ACTIVITY_METHOD');
/**
 * Configure Activity functions with given {@link ActivityOptions}.
 *
 * This method may be called multiple times to setup Activities with different options.
 *
 * @return a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy | Proxy} for
 *         which each attribute is a callable Activity function
 *
 * @example
 * ```ts
 * import { proxyActivities } from '@temporalio/workflow';
 * import * as activities from '../activities';
 *
 * // Setup Activities from module exports
 * const { httpGet, otherActivity } = proxyActivities<typeof activities>({
 *   startToCloseTimeout: '30 minutes',
 * });
 *
 * // Setup Activities from an explicit interface (e.g. when defined by another SDK)
 * interface JavaActivities {
 *   httpGetFromJava(url: string): Promise<string>
 *   someOtherJavaActivity(arg1: number, arg2: string): Promise<string>;
 * }
 *
 * const {
 *   httpGetFromJava,
 *   someOtherJavaActivity
 * } = proxyActivities<JavaActivities>({
 *   taskQueue: 'java-worker-taskQueue',
 *   startToCloseTimeout: '5m',
 * });
 *
 * export function execute(): Promise<void> {
 *   const response = await httpGet("http://example.com");
 *   // ...
 * }
 * ```
 */
function proxyActivities(options) {
    if (options === undefined) {
        throw new TypeError('options must be defined');
    }
    // Validate as early as possible for immediate user feedback
    validateActivityOptions(options);
    return new Proxy({}, {
        get(_, activityType) {
            if (typeof activityType !== 'string') {
                throw new TypeError(`Only strings are supported for Activity types, got: ${String(activityType)}`);
            }
            return function activityProxyFunction(...args) {
                return scheduleActivity(activityType, args, options);
            };
        },
    });
}
exports.proxyActivities = proxyActivities;
/**
 * Configure Local Activity functions with given {@link LocalActivityOptions}.
 *
 * This method may be called multiple times to setup Activities with different options.
 *
 * @return a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy | Proxy}
 *         for which each attribute is a callable Activity function
 *
 * @see {@link proxyActivities} for examples
 */
function proxyLocalActivities(options) {
    if (options === undefined) {
        throw new TypeError('options must be defined');
    }
    // Validate as early as possible for immediate user feedback
    validateLocalActivityOptions(options);
    return new Proxy({}, {
        get(_, activityType) {
            if (typeof activityType !== 'string') {
                throw new TypeError(`Only strings are supported for Activity types, got: ${String(activityType)}`);
            }
            return function localActivityProxyFunction(...args) {
                return scheduleLocalActivity(activityType, args, options);
            };
        },
    });
}
exports.proxyLocalActivities = proxyLocalActivities;
// TODO: deprecate this patch after "enough" time has passed
const EXTERNAL_WF_CANCEL_PATCH = '__temporal_internal_connect_external_handle_cancel_to_scope';
// The name of this patch comes from an attempt to build a generic internal patching mechanism.
// That effort has been abandoned in favor of a newer WorkflowTaskCompletedMetadata based mechanism.
const CONDITION_0_PATCH = '__sdk_internal_patch_number:1';
/**
 * Returns a client-side handle that can be used to signal and cancel an existing Workflow execution.
 * It takes a Workflow ID and optional run ID.
 */
function getExternalWorkflowHandle(workflowId, runId) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.getExternalWorkflowHandle(...) may only be used from a Workflow Execution. Consider using Client.workflow.getHandle(...) instead.)');
    return {
        workflowId,
        runId,
        cancel() {
            return new Promise((resolve, reject) => {
                // Connect this cancel operation to the current cancellation scope.
                // This is behavior was introduced after v0.22.0 and is incompatible
                // with histories generated with previous SDK versions and thus requires
                // patching.
                //
                // We try to delay patching as much as possible to avoid polluting
                // histories unless strictly required.
                const scope = cancellation_scope_1.CancellationScope.current();
                if (scope.cancellable) {
                    (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch((err) => {
                        if (patched(EXTERNAL_WF_CANCEL_PATCH)) {
                            reject(err);
                        }
                    }));
                }
                if (scope.consideredCancelled) {
                    if (patched(EXTERNAL_WF_CANCEL_PATCH)) {
                        return;
                    }
                }
                const seq = activator.nextSeqs.cancelWorkflow++;
                activator.pushCommand({
                    requestCancelExternalWorkflowExecution: {
                        seq,
                        workflowExecution: {
                            namespace: activator.info.namespace,
                            workflowId,
                            runId,
                        },
                    },
                });
                activator.completions.cancelWorkflow.set(seq, { resolve, reject });
            });
        },
        signal(def, ...args) {
            return (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'signalWorkflow', signalWorkflowNextHandler)({
                seq: activator.nextSeqs.signalWorkflow++,
                signalName: typeof def === 'string' ? def : def.name,
                args,
                target: {
                    type: 'external',
                    workflowExecution: { workflowId, runId },
                },
                headers: {},
            });
        },
    };
}
exports.getExternalWorkflowHandle = getExternalWorkflowHandle;
async function startChild(workflowTypeOrFunc, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.startChild(...) may only be used from a Workflow Execution. Consider using Client.workflow.start(...) instead.)');
    const optionsWithDefaults = addDefaultWorkflowOptions(options ?? {});
    const workflowType = (0, common_1.extractWorkflowType)(workflowTypeOrFunc);
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'startChildWorkflowExecution', startChildWorkflowExecutionNextHandler);
    const [started, completed] = await execute({
        seq: activator.nextSeqs.childWorkflow++,
        options: optionsWithDefaults,
        headers: {},
        workflowType,
    });
    const firstExecutionRunId = await started;
    return {
        workflowId: optionsWithDefaults.workflowId,
        firstExecutionRunId,
        async result() {
            return (await completed);
        },
        async signal(def, ...args) {
            return (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'signalWorkflow', signalWorkflowNextHandler)({
                seq: activator.nextSeqs.signalWorkflow++,
                signalName: typeof def === 'string' ? def : def.name,
                args,
                target: {
                    type: 'child',
                    childWorkflowId: optionsWithDefaults.workflowId,
                },
                headers: {},
            });
        },
    };
}
exports.startChild = startChild;
async function executeChild(workflowTypeOrFunc, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.executeChild(...) may only be used from a Workflow Execution. Consider using Client.workflow.execute(...) instead.');
    const optionsWithDefaults = addDefaultWorkflowOptions(options ?? {});
    const workflowType = (0, common_1.extractWorkflowType)(workflowTypeOrFunc);
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'startChildWorkflowExecution', startChildWorkflowExecutionNextHandler);
    const execPromise = execute({
        seq: activator.nextSeqs.childWorkflow++,
        options: optionsWithDefaults,
        headers: {},
        workflowType,
    });
    (0, stack_helpers_1.untrackPromise)(execPromise);
    const completedPromise = execPromise.then(([_started, completed]) => completed);
    (0, stack_helpers_1.untrackPromise)(completedPromise);
    return completedPromise;
}
exports.executeChild = executeChild;
/**
 * Get information about the current Workflow.
 *
 * WARNING: This function returns a frozen copy of WorkflowInfo, at the point where this method has been called.
 * Changes happening at later point in workflow execution will not be reflected in the returned object.
 *
 * For this reason, we recommend calling `workflowInfo()` on every access to {@link WorkflowInfo}'s fields,
 * rather than caching the `WorkflowInfo` object (or part of it) in a local variable. For example:
 *
 * ```ts
 * // GOOD
 * function myWorkflow() {
 *   doSomething(workflowInfo().searchAttributes)
 *   ...
 *   doSomethingElse(workflowInfo().searchAttributes)
 * }
 * ```
 *
 * vs
 *
 * ```ts
 * // BAD
 * function myWorkflow() {
 *   const attributes = workflowInfo().searchAttributes
 *   doSomething(attributes)
 *   ...
 *   doSomethingElse(attributes)
 * }
 * ```
 */
function workflowInfo() {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.workflowInfo(...) may only be used from a Workflow Execution.');
    return activator.info;
}
exports.workflowInfo = workflowInfo;
/**
 * Returns whether or not code is executing in workflow context
 */
function inWorkflowContext() {
    return (0, global_attributes_1.maybeGetActivator)() !== undefined;
}
exports.inWorkflowContext = inWorkflowContext;
/**
 * Returns a function `f` that will cause the current Workflow to ContinueAsNew when called.
 *
 * `f` takes the same arguments as the Workflow function supplied to typeparam `F`.
 *
 * Once `f` is called, Workflow Execution immediately completes.
 */
function makeContinueAsNewFunc(options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.continueAsNew(...) and Workflow.makeContinueAsNewFunc(...) may only be used from a Workflow Execution.');
    const info = activator.info;
    const { workflowType, taskQueue, ...rest } = options ?? {};
    const requiredOptions = {
        workflowType: workflowType ?? info.workflowType,
        taskQueue: taskQueue ?? info.taskQueue,
        ...rest,
    };
    return (...args) => {
        const fn = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'continueAsNew', async (input) => {
            const { headers, args, options } = input;
            throw new interfaces_1.ContinueAsNew({
                workflowType: options.workflowType,
                arguments: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                headers,
                taskQueue: options.taskQueue,
                memo: options.memo && (0, common_1.mapToPayloads)(activator.payloadConverter, options.memo),
                searchAttributes: options.searchAttributes
                    ? (0, common_1.mapToPayloads)(common_1.searchAttributePayloadConverter, options.searchAttributes)
                    : undefined,
                workflowRunTimeout: (0, time_1.msOptionalToTs)(options.workflowRunTimeout),
                workflowTaskTimeout: (0, time_1.msOptionalToTs)(options.workflowTaskTimeout),
                versioningIntent: (0, versioning_intent_enum_1.versioningIntentToProto)(options.versioningIntent),
            });
        });
        return fn({
            args,
            headers: {},
            options: requiredOptions,
        });
    };
}
exports.makeContinueAsNewFunc = makeContinueAsNewFunc;
/**
 * {@link https://docs.temporal.io/concepts/what-is-continue-as-new/ | Continues-As-New} the current Workflow Execution
 * with default options.
 *
 * Shorthand for `makeContinueAsNewFunc<F>()(...args)`. (See: {@link makeContinueAsNewFunc}.)
 *
 * @example
 *
 *```ts
 *import { continueAsNew } from '@temporalio/workflow';
 *
 *export async function myWorkflow(n: number): Promise<void> {
 *  // ... Workflow logic
 *  await continueAsNew<typeof myWorkflow>(n + 1);
 *}
 *```
 */
function continueAsNew(...args) {
    return makeContinueAsNewFunc()(...args);
}
exports.continueAsNew = continueAsNew;
/**
 * Generate an RFC compliant V4 uuid.
 * Uses the workflow's deterministic PRNG making it safe for use within a workflow.
 * This function is cryptographically insecure.
 * See the {@link https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid | stackoverflow discussion}.
 */
function uuid4() {
    // Return the hexadecimal text representation of number `n`, padded with zeroes to be of length `p`
    const ho = (n, p) => n.toString(16).padStart(p, '0');
    // Create a view backed by a 16-byte buffer
    const view = new DataView(new ArrayBuffer(16));
    // Fill buffer with random values
    view.setUint32(0, (Math.random() * 0x100000000) >>> 0);
    view.setUint32(4, (Math.random() * 0x100000000) >>> 0);
    view.setUint32(8, (Math.random() * 0x100000000) >>> 0);
    view.setUint32(12, (Math.random() * 0x100000000) >>> 0);
    // Patch the 6th byte to reflect a version 4 UUID
    view.setUint8(6, (view.getUint8(6) & 0xf) | 0x40);
    // Patch the 8th byte to reflect a variant 1 UUID (version 4 UUIDs are)
    view.setUint8(8, (view.getUint8(8) & 0x3f) | 0x80);
    // Compile the canonical textual form from the array data
    return `${ho(view.getUint32(0), 8)}-${ho(view.getUint16(4), 4)}-${ho(view.getUint16(6), 4)}-${ho(view.getUint16(8), 4)}-${ho(view.getUint32(10), 8)}${ho(view.getUint16(14), 4)}`;
}
exports.uuid4 = uuid4;
/**
 * Patch or upgrade workflow code by checking or stating that this workflow has a certain patch.
 *
 * See {@link https://docs.temporal.io/typescript/versioning | docs page} for info.
 *
 * If the workflow is replaying an existing history, then this function returns true if that
 * history was produced by a worker which also had a `patched` call with the same `patchId`.
 * If the history was produced by a worker *without* such a call, then it will return false.
 *
 * If the workflow is not currently replaying, then this call *always* returns true.
 *
 * Your workflow code should run the "new" code if this returns true, if it returns false, you
 * should run the "old" code. By doing this, you can maintain determinism.
 *
 * @param patchId An identifier that should be unique to this patch. It is OK to use multiple
 * calls with the same ID, which means all such calls will always return the same value.
 */
function patched(patchId) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.patch(...) and Workflow.deprecatePatch may only be used from a Workflow Execution.');
    return activator.patchInternal(patchId, false);
}
exports.patched = patched;
/**
 * Indicate that a patch is being phased out.
 *
 * See {@link https://docs.temporal.io/typescript/versioning | docs page} for info.
 *
 * Workflows with this call may be deployed alongside workflows with a {@link patched} call, but
 * they must *not* be deployed while any workers still exist running old code without a
 * {@link patched} call, or any runs with histories produced by such workers exist. If either kind
 * of worker encounters a history produced by the other, their behavior is undefined.
 *
 * Once all live workflow runs have been produced by workers with this call, you can deploy workers
 * which are free of either kind of patch call for this ID. Workers with and without this call
 * may coexist, as long as they are both running the "new" code.
 *
 * @param patchId An identifier that should be unique to this patch. It is OK to use multiple
 * calls with the same ID, which means all such calls will always return the same value.
 */
function deprecatePatch(patchId) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.patch(...) and Workflow.deprecatePatch may only be used from a Workflow Execution.');
    activator.patchInternal(patchId, true);
}
exports.deprecatePatch = deprecatePatch;
async function condition(fn, timeout) {
    (0, global_attributes_1.assertInWorkflowContext)('Workflow.condition(...) may only be used from a Workflow Execution.');
    // Prior to 1.5.0, `condition(fn, 0)` was treated as equivalent to `condition(fn, undefined)`
    if (timeout === 0 && !patched(CONDITION_0_PATCH)) {
        return conditionInner(fn);
    }
    if (typeof timeout === 'number' || typeof timeout === 'string') {
        return cancellation_scope_1.CancellationScope.cancellable(async () => {
            try {
                return await Promise.race([sleep(timeout).then(() => false), conditionInner(fn).then(() => true)]);
            }
            finally {
                cancellation_scope_1.CancellationScope.current().cancel();
            }
        });
    }
    return conditionInner(fn);
}
exports.condition = condition;
function conditionInner(fn) {
    const activator = (0, global_attributes_1.getActivator)();
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        const seq = activator.nextSeqs.condition++;
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch((err) => {
                activator.blockedConditions.delete(seq);
                reject(err);
            }));
        }
        // Eager evaluation
        if (fn()) {
            resolve();
            return;
        }
        activator.blockedConditions.set(seq, { fn, resolve });
    });
}
/**
 * Define an update method for a Workflow.
 *
 * Definitions are used to register handler in the Workflow via {@link setHandler} and to update Workflows using a {@link WorkflowHandle}, {@link ChildWorkflowHandle} or {@link ExternalWorkflowHandle}.
 * Definitions can be reused in multiple Workflows.
 */
function defineUpdate(name) {
    return {
        type: 'update',
        name,
    };
}
exports.defineUpdate = defineUpdate;
/**
 * Define a signal method for a Workflow.
 *
 * Definitions are used to register handler in the Workflow via {@link setHandler} and to signal Workflows using a {@link WorkflowHandle}, {@link ChildWorkflowHandle} or {@link ExternalWorkflowHandle}.
 * Definitions can be reused in multiple Workflows.
 */
function defineSignal(name) {
    return {
        type: 'signal',
        name,
    };
}
exports.defineSignal = defineSignal;
/**
 * Define a query method for a Workflow.
 *
 * Definitions are used to register handler in the Workflow via {@link setHandler} and to query Workflows using a {@link WorkflowHandle}.
 * Definitions can be reused in multiple Workflows.
 */
function defineQuery(name) {
    return {
        type: 'query',
        name,
    };
}
exports.defineQuery = defineQuery;
// For Updates and Signals we want to make a public guarantee something like the
// following:
//
//   "If a WFT contains a Signal/Update, and if a handler is available for that
//   Signal/Update, then the handler will be executed.""
//
// However, that statement is not well-defined, leaving several questions open:
//
// 1. What does it mean for a handler to be "available"? What happens if the
//    handler is not present initially but is set at some point during the
//    Workflow code that is executed in that WFT? What happens if the handler is
//    set and then deleted, or replaced with a different handler?
//
// 2. When is the handler executed? (When it first becomes available? At the end
//    of the activation?) What are the execution semantics of Workflow and
//    Signal/Update handler code given that they are concurrent? Can the user
//    rely on Signal/Update side effects being reflected in the Workflow return
//    value, or in the value passed to Continue-As-New? If the handler is an
//    async function / coroutine, how much of it is executed and when is the
//    rest executed?
//
// 3. What happens if the handler is not executed? (i.e. because it wasn't
//    available in the sense defined by (1))
//
// 4. In the case of Update, when is the validation function executed?
//
// The implementation for Typescript is as follows:
//
// 1. sdk-core sorts Signal and Update jobs (and Patches) ahead of all other
//    jobs. Thus if the handler is available at the start of the Activation then
//    the Signal/Update will be executed before Workflow code is executed. If it
//    is not, then the Signal/Update calls is pushed to a buffer.
//
// 2. On each call to setHandler for a given Signal/Update, we make a pass
//    through the buffer list. If a buffered job is associated with the just-set
//    handler, then the job is removed from the buffer and the initial
//    synchronous portion of the handler is invoked on that input (i.e.
//    preempting workflow code).
//
// Thus in the case of Typescript the questions above are answered as follows:
//
// 1. A handler is "available" if it is set at the start of the Activation or
//    becomes set at any point during the Activation. If the handler is not set
//    initially then it is executed as soon as it is set. Subsequent deletion or
//    replacement by a different handler has no impact because the jobs it was
//    handling have already been handled and are no longer in the buffer.
//
// 2. The handler is executed as soon as it becomes available. I.e. if the
//    handler is set at the start of the Activation then it is executed when
//    first attempting to process the Signal/Update job; alternatively, if it is
//    set by a setHandler call made by Workflow code, then it is executed as
//    part of that call (preempting Workflow code). Therefore, a user can rely
//    on Signal/Update side effects being reflected in e.g. the Workflow return
//    value, and in the value passed to Continue-As-New. Activation jobs are
//    processed in the order supplied by sdk-core, i.e. Signals, then Updates,
//    then other jobs. Within each group, the order sent by the server is
//    preserved. If the handler is async, it is executed up to its first yield
//    point.
//
// 3. Signal case: If a handler does not become available for a Signal job then
//    the job remains in the buffer. If a handler for the Signal becomes
//    available in a subsequent Activation (of the same or a subsequent WFT)
//    then the handler will be executed. If not, then the Signal will never be
//    responded to and this causes no error.
//
//    Update case: If a handler does not become available for an Update job then
//    the Update is rejected at the end of the Activation. Thus, if a user does
//    not want an Update to be rejected for this reason, then it is their
//    responsibility to ensure that their application and workflow code interact
//    such that a handler is available for the Update during any Activation
//    which might contain their Update job. (Note that the user often has
//    uncertainty about which WFT their Signal/Update will appear in. For
//    example, if they call startWorkflow() followed by startUpdate(), then they
//    will typically not know whether these will be delivered in one or two
//    WFTs. On the other hand there are situations where they would have reason
//    to believe they are in the same WFT, for example if they do not start
//    Worker polling until after they have verified that both requests have
//    succeeded.)
//
// 5. If an Update has a validation function then it is executed immediately
//    prior to the handler. (Note that the validation function is required to be
//    synchronous).
function setHandler(def, handler, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.setHandler(...) may only be used from a Workflow Execution.');
    const description = options?.description;
    if (def.type === 'update') {
        if (typeof handler === 'function') {
            const updateOptions = options;
            const validator = updateOptions?.validator;
            activator.updateHandlers.set(def.name, { handler, validator, description });
            activator.dispatchBufferedUpdates();
        }
        else if (handler == null) {
            activator.updateHandlers.delete(def.name);
        }
        else {
            throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
        }
    }
    else if (def.type === 'signal') {
        if (typeof handler === 'function') {
            activator.signalHandlers.set(def.name, { handler: handler, description });
            activator.dispatchBufferedSignals();
        }
        else if (handler == null) {
            activator.signalHandlers.delete(def.name);
        }
        else {
            throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
        }
    }
    else if (def.type === 'query') {
        if (typeof handler === 'function') {
            activator.queryHandlers.set(def.name, { handler: handler, description });
        }
        else if (handler == null) {
            activator.queryHandlers.delete(def.name);
        }
        else {
            throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
        }
    }
    else {
        throw new TypeError(`Invalid definition type: ${def.type}`);
    }
}
exports.setHandler = setHandler;
/**
 * Set a signal handler function that will handle signals calls for non-registered signal names.
 *
 * Signals are dispatched to the default signal handler in the order that they were accepted by the server.
 *
 * If this function is called multiple times for a given signal or query name the last handler will overwrite any previous calls.
 *
 * @param handler a function that will handle signals for non-registered signal names, or `undefined` to unset the handler.
 */
function setDefaultSignalHandler(handler) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.setDefaultSignalHandler(...) may only be used from a Workflow Execution.');
    if (typeof handler === 'function') {
        activator.defaultSignalHandler = handler;
        activator.dispatchBufferedSignals();
    }
    else if (handler == null) {
        activator.defaultSignalHandler = undefined;
    }
    else {
        throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
    }
}
exports.setDefaultSignalHandler = setDefaultSignalHandler;
/**
 * Updates this Workflow's Search Attributes by merging the provided `searchAttributes` with the existing Search
 * Attributes, `workflowInfo().searchAttributes`.
 *
 * For example, this Workflow code:
 *
 * ```ts
 * upsertSearchAttributes({
 *   CustomIntField: [1],
 *   CustomBoolField: [true]
 * });
 * upsertSearchAttributes({
 *   CustomIntField: [42],
 *   CustomKeywordField: ['durable code', 'is great']
 * });
 * ```
 *
 * would result in the Workflow having these Search Attributes:
 *
 * ```ts
 * {
 *   CustomIntField: [42],
 *   CustomBoolField: [true],
 *   CustomKeywordField: ['durable code', 'is great']
 * }
 * ```
 *
 * @param searchAttributes The Record to merge. Use a value of `[]` to clear a Search Attribute.
 */
function upsertSearchAttributes(searchAttributes) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.upsertSearchAttributes(...) may only be used from a Workflow Execution.');
    if (searchAttributes == null) {
        throw new Error('searchAttributes must be a non-null SearchAttributes');
    }
    activator.pushCommand({
        upsertWorkflowSearchAttributes: {
            searchAttributes: (0, common_1.mapToPayloads)(common_1.searchAttributePayloadConverter, searchAttributes),
        },
    });
    activator.mutateWorkflowInfo((info) => {
        return {
            ...info,
            searchAttributes: {
                ...info.searchAttributes,
                ...searchAttributes,
            },
        };
    });
}
exports.upsertSearchAttributes = upsertSearchAttributes;
exports.stackTraceQuery = defineQuery('__stack_trace');
exports.enhancedStackTraceQuery = defineQuery('__enhanced_stack_trace');
exports.workflowMetadataQuery = defineQuery('__temporal_workflow_metadata');


/***/ }),

/***/ "./src/workflows.ts":
/*!**************************!*\
  !*** ./src/workflows.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GameWorkflow: () => (/* binding */ GameWorkflow),
/* harmony export */   RoundWorkflow: () => (/* binding */ RoundWorkflow),
/* harmony export */   SnakeWorkerWorkflow: () => (/* binding */ SnakeWorkerWorkflow),
/* harmony export */   SnakeWorkflow: () => (/* binding */ SnakeWorkflow),
/* harmony export */   gameFinishSignal: () => (/* binding */ gameFinishSignal),
/* harmony export */   gameStateQuery: () => (/* binding */ gameStateQuery),
/* harmony export */   roundStartSignal: () => (/* binding */ roundStartSignal),
/* harmony export */   roundStateQuery: () => (/* binding */ roundStateQuery),
/* harmony export */   snakeChangeDirectionSignal: () => (/* binding */ snakeChangeDirectionSignal),
/* harmony export */   snakeMoveSignal: () => (/* binding */ snakeMoveSignal),
/* harmony export */   workerStartedSignal: () => (/* binding */ workerStartedSignal),
/* harmony export */   workerStopSignal: () => (/* binding */ workerStopSignal)
/* harmony export */ });
/* harmony import */ var _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @temporalio/workflow */ "./node_modules/@temporalio/workflow/lib/index.js");
/* harmony import */ var _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__);

const ROUND_WF_ID = 'SnakeGameRound';
const APPLE_POINTS = 10;
const SNAKE_MOVES_BEFORE_CAN = 50;
const SNAKE_WORKER_DOWN_TIME = '1 seconds';
const { emit } = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.proxyLocalActivities)({
    startToCloseTimeout: '1 seconds'
});
const { snakeWorker } = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.proxyActivities)({
    taskQueue: 'snake-workers',
    startToCloseTimeout: '1 hour',
    heartbeatTimeout: 500,
    cancellationType: _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.ActivityCancellationType.WAIT_CANCELLATION_COMPLETED
});
const { snakeTracker } = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.proxyActivities)({
    heartbeatTimeout: 500,
    startToCloseTimeout: '1 hour',
    cancellationType: _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.ActivityCancellationType.WAIT_CANCELLATION_COMPLETED,
    retry: {
        initialInterval: 1,
        backoffCoefficient: 1
    }
});
function randomDirection() {
    const directions = [
        'up',
        'down',
        'left',
        'right'
    ];
    return directions[Math.floor(Math.random() * directions.length)];
}
function oppositeDirection(direction) {
    if (direction === 'up') {
        return 'down';
    } else if (direction === 'down') {
        return 'up';
    } else if (direction === 'left') {
        return 'right';
    } else {
        return 'left';
    }
}
const gameStateQuery = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.defineQuery)('gameState');
const roundStateQuery = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.defineQuery)('roundState');
const gameFinishSignal = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.defineSignal)('gameFinish');
// UI -> GameWorkflow to start round
const roundStartSignal = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.defineSignal)('roundStart');
// Player UI -> SnakeWorkflow to change direction
const snakeChangeDirectionSignal = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.defineSignal)('snakeChangeDirection');
// (Internal) SnakeWorkflow -> Round to trigger a move
const snakeMoveSignal = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.defineSignal)('snakeMove');
const workerStopSignal = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.defineSignal)('workerStop');
const workerStartedSignal = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.defineSignal)('workerStarted');
async function GameWorkflow(config) {
    _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.log.info('Starting game');
    const game = {
        config,
        teams: config.teamNames.reduce((acc, name)=>{
            acc[name] = {
                name,
                score: 0
            };
            return acc;
        }, {})
    };
    let finished = false;
    let roundScope;
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(gameStateQuery, ()=>{
        return game;
    });
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(gameFinishSignal, ()=>{
        finished = true;
        roundScope === null || roundScope === void 0 ? void 0 : roundScope.cancel();
    });
    let newRound;
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(roundStartSignal, async ({ snakes })=>{
        newRound = {
            config,
            teams: buildRoundTeams(game),
            snakes
        };
    });
    while(!finished){
        await (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.condition)(()=>finished || newRound !== undefined);
        if (finished) {
            break;
        }
        roundScope = new _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.CancellationScope();
        try {
            await roundScope.run(async ()=>{
                const roundWf = await (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.startChild)(RoundWorkflow, {
                    workflowId: ROUND_WF_ID,
                    args: [
                        newRound
                    ],
                    parentClosePolicy: _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.ParentClosePolicy.PARENT_CLOSE_POLICY_REQUEST_CANCEL
                });
                newRound = undefined;
                const round = await roundWf.result();
                for (const team of Object.values(round.teams)){
                    game.teams[team.name].score += team.score;
                }
            });
        } catch (err) {
            if (!(0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.isCancellation)(err)) {
                throw err;
            }
        }
    }
}
async function RoundWorkflow({ config, teams, snakes }) {
    _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.log.info('Starting round', {
        config,
        teams,
        snakes
    });
    const round = {
        config: config,
        duration: config.roundDuration,
        apples: {},
        teams: teams,
        snakes: snakes.reduce((acc, snake)=>{
            acc[snake.id] = snake;
            return acc;
        }, {}),
        finished: false
    };
    const snakeMoves = [];
    const workersStarted = [];
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(roundStateQuery, ()=>{
        return round;
    });
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(snakeMoveSignal, async (id, direction)=>{
        if (round.finished) {
            return;
        }
        snakeMoves.push({
            id,
            direction
        });
    });
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(workerStartedSignal, async ({ identity })=>{
        if (round.finished) {
            return;
        }
        workersStarted.push(identity);
    });
    const processSignals = async ()=>{
        const events = [];
        const applesEaten = [];
        const signals = [];
        for (const move of snakeMoves){
            const snake = round.snakes[move.id];
            moveSnake(round, snake, move.direction);
            events.push({
                type: 'snakeMoved',
                payload: {
                    snakeId: move.id,
                    segments: snake.segments
                }
            });
            if (snake.ateAppleId) {
                applesEaten.push(snake.ateAppleId);
                round.teams[snake.teamName].score += APPLE_POINTS;
                snake.ateAppleId = undefined;
            }
        }
        for (const appleId of applesEaten){
            if (config.killWorkers) {
                const worker = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.getExternalWorkflowHandle)(appleId);
                signals.push(worker.signal(workerStopSignal));
                events.push({
                    type: 'worker:stop',
                    payload: {
                        identity: appleId
                    }
                });
            } else {
                workersStarted.push(appleId);
            }
            delete round.apples[appleId];
        }
        for (const workerId of workersStarted){
            round.apples[workerId] = randomEmptyPoint(round);
            events.push({
                type: 'worker:start',
                payload: {
                    identity: workerId
                }
            });
        }
        if (applesEaten.length || workersStarted.length) {
            events.push({
                type: 'roundUpdate',
                payload: {
                    round
                }
            });
        }
        snakeMoves.length = 0;
        workersStarted.length = 0;
        await Promise.all([
            emit(events),
            ...signals
        ]);
    };
    randomizeRound(round);
    const workerCount = snakes.length * 2;
    try {
        await startWorkerManagers(workerCount);
        await startSnakeTrackers(round.snakes);
        await startSnakes(round.config, round.snakes);
        await emit([
            {
                type: 'roundLoading',
                payload: {
                    round
                }
            }
        ]);
        // Wait for all workers to register
        while(true){
            await (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.condition)(()=>workersStarted.length > 0);
            await processSignals();
            if (Object.keys(round.apples).length === workerCount) {
                break;
            }
        }
        // Start the round
        round.startedAt = Date.now();
        Promise.race([
            (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.sleep)(round.duration * 1000),
            _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.CancellationScope.current().cancelRequested
        ]).then(()=>_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.log.info('Round timer expired')).catch(()=>_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.log.info('Round cancelled')).finally(()=>round.finished = true);
        _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.log.info('Round started', {
            round
        });
        await emit([
            {
                type: 'roundStarted',
                payload: {
                    round
                }
            }
        ]);
        while(true){
            await (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.condition)(()=>round.finished || snakeMoves.length > 0 || workersStarted.length > 0);
            if (round.finished) {
                break;
            }
            await processSignals();
        }
    } catch (err) {
        if (!(0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.isCancellation)(err)) {
            throw err;
        }
    } finally{
        round.finished = true;
    }
    await _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.CancellationScope.nonCancellable(async ()=>{
        await emit([
            {
                type: 'roundFinished',
                payload: {
                    round
                }
            }
        ]);
    });
    _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.log.info('Round finished', {
        round
    });
    return round;
}
async function SnakeWorkerWorkflow({ roundId, identity }) {
    const round = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.getExternalWorkflowHandle)(roundId);
    let scope;
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(workerStopSignal, ()=>{
        if (scope) {
            scope.cancel();
        }
    });
    while(true){
        try {
            scope = new _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.CancellationScope();
            await scope.run(()=>snakeWorker(roundId, identity));
        } catch (e) {
            if ((0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.isCancellation)(e)) {
                // Let workers start again faster for now.
                await (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.sleep)(SNAKE_WORKER_DOWN_TIME);
            } else {
                throw e;
            }
        }
    }
}
async function SnakeWorkflow({ roundId, id, direction, nomsPerMove, nomDuration }) {
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(snakeChangeDirectionSignal, (newDirection)=>{
        direction = newDirection;
    });
    const { snakeNom } = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.proxyActivities)({
        startToCloseTimeout: nomDuration * 2,
        retry: {
            initialInterval: 1,
            backoffCoefficient: 1
        }
    });
    const round = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.getExternalWorkflowHandle)(roundId);
    const noms = Array.from({
        length: nomsPerMove
    });
    let moves = 0;
    while(true){
        await Promise.all(noms.map(()=>snakeNom(id, nomDuration)));
        try {
            await round.signal(snakeMoveSignal, id, direction);
        } catch (err) {
            _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.log.info('Cannot signal round, exiting');
            break;
        }
        if (moves++ > SNAKE_MOVES_BEFORE_CAN) {
            await (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.continueAsNew)({
                roundId,
                id,
                direction,
                nomsPerMove,
                nomDuration
            });
        }
    }
}
function moveSnake(round, snake, direction) {
    const config = round.config;
    let headSegment = snake.segments[0];
    let tailSegment = snake.segments[snake.segments.length - 1];
    const currentDirection = headSegment.direction;
    let newDirection = direction;
    // You can't go back on yourself
    if (newDirection === oppositeDirection(currentDirection)) {
        newDirection = currentDirection;
    }
    let currentHead = headSegment.head;
    // Create a new segment if we're changing direction or hitting an edge
    if (newDirection !== currentDirection || againstAnEdge(round, currentHead, direction)) {
        headSegment = {
            head: {
                x: currentHead.x,
                y: currentHead.y
            },
            direction: newDirection,
            length: 0
        };
        snake.segments.unshift(headSegment);
    }
    let newHead = {
        x: currentHead.x,
        y: currentHead.y
    };
    // Move the head segment, wrapping around if we are moving past the edge
    if (newDirection === 'up') {
        newHead.y = newHead.y <= 1 ? config.height : currentHead.y - 1;
    } else if (newDirection === 'down') {
        newHead.y = newHead.y >= config.height ? 1 : currentHead.y + 1;
    } else if (newDirection === 'left') {
        newHead.x = newHead.x <= 1 ? config.width : currentHead.x - 1;
    } else if (newDirection === 'right') {
        newHead.x = newHead.x >= config.width ? 1 : currentHead.x + 1;
    }
    // Check if we've hit another snake
    if (snakeAt(round, newHead)) {
        // Truncate the snake to just the head, and ignore the requested move
        headSegment.length = 1;
        snake.segments = [
            headSegment
        ];
        return;
    }
    // Check if we've hit an apple
    const appleId = appleAt(round, newHead);
    if (appleId !== undefined) {
        // Snake ate an apple, set appleId
        snake.ateAppleId = appleId;
        tailSegment.length += 1; // Grow the snake by increasing the tail length
    }
    headSegment.head = newHead;
    // Manage snake segment growth and shrinking
    if (snake.segments.length > 1) {
        headSegment.length += 1;
        tailSegment.length -= 1;
        // Remove the tail segment if its length reaches 0
        if (tailSegment.length === 0) {
            snake.segments.pop();
        }
    }
}
function againstAnEdge(round, point, direction) {
    if (direction === 'up') {
        return point.y === 1;
    } else if (direction === 'down') {
        return point.y === round.config.height;
    } else if (direction === 'left') {
        return point.x === 1;
    } else {
        return point.x === round.config.width;
    }
}
function appleAt(round, point) {
    for (const [id, apple] of Object.entries(round.apples)){
        if (apple.x === point.x && apple.y === point.y) {
            return id;
        }
    }
    return undefined;
}
function calculatePosition(segment) {
    const { direction, head: start, length } = segment;
    let [t, b] = [
        start.y,
        start.y
    ];
    let [l, r] = [
        start.x,
        start.x
    ];
    if (direction === 'up') {
        b = t + (length - 1);
    } else if (direction === 'down') {
        t = b - (length - 1);
    } else if (direction === 'left') {
        r = l + (length - 1);
    } else {
        l = r - (length - 1);
    }
    return {
        t,
        l,
        b,
        r
    };
}
function snakeAt(round, point) {
    for (const snake of Object.values(round.snakes)){
        for (const segment of snake.segments){
            const pos = calculatePosition(segment);
            if (point.x >= pos.l && point.x <= pos.r && point.y >= pos.t && point.y <= pos.b) {
                return snake;
            }
        }
    }
    return undefined;
}
function randomEmptyPoint(round) {
    let point = {
        x: Math.ceil(Math.random() * round.config.width),
        y: Math.ceil(Math.random() * round.config.height)
    };
    // Check if any apple is at the point
    while(appleAt(round, point) || snakeAt(round, point)){
        point = {
            x: Math.ceil(Math.random() * round.config.width),
            y: Math.ceil(Math.random() * round.config.height)
        };
    }
    return point;
}
function buildRoundTeams(game) {
    const teams = {};
    for (const team of Object.values(game.teams)){
        teams[team.name] = {
            name: team.name,
            score: 0
        };
    }
    return teams;
}
async function startWorkerManagers(count) {
    const snakeWorkerManagers = Array.from({
        length: count
    }).map((_, i)=>{
        const identity = `snake-worker-${i + 1}`;
        return (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.startChild)(SnakeWorkerWorkflow, {
            workflowId: identity,
            args: [
                {
                    roundId: ROUND_WF_ID,
                    identity
                }
            ]
        });
    });
    try {
        await Promise.all(snakeWorkerManagers);
    } catch (err) {
        _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.log.error('Failed to start worker managers', {
            error: err
        });
        throw err;
    }
}
async function startSnakeTrackers(snakes) {
    for (const snake of Object.values(snakes)){
        snakeTracker(snake.id);
    }
}
async function startSnakes(config, snakes) {
    const commands = Object.values(snakes).map((snake)=>(0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.startChild)(SnakeWorkflow, {
            workflowId: snake.id,
            taskQueue: 'snakes',
            workflowTaskTimeout: 500,
            args: [
                {
                    roundId: ROUND_WF_ID,
                    id: snake.id,
                    direction: snake.segments[0].direction,
                    nomsPerMove: config.nomsPerMove,
                    nomDuration: config.nomDuration
                }
            ]
        }));
    try {
        await Promise.all(commands);
    } catch (err) {
        _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.log.error('Failed to start snakes', {
            error: err
        });
        throw err;
    }
}
function randomizeRound(round) {
    for (const snake of Object.values(round.snakes)){
        snake.segments = [
            {
                head: randomEmptyPoint(round),
                direction: randomDirection(),
                length: 1
            }
        ];
    }
}


/***/ }),

/***/ "?31ff":
/*!*****************************************************!*\
  !*** __temporal_custom_failure_converter (ignored) ***!
  \*****************************************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?2065":
/*!*****************************************************!*\
  !*** __temporal_custom_payload_converter (ignored) ***!
  \*****************************************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "./node_modules/ms/dist/index.cjs":
/*!****************************************!*\
  !*** ./node_modules/ms/dist/index.cjs ***!
  \****************************************/
/***/ ((module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
// Helpers.
const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const y = d * 365.25;
function ms(value, options) {
    try {
        if (typeof value === 'string' && value.length > 0) {
            return parse(value);
        }
        else if (typeof value === 'number' && isFinite(value)) {
            return options?.long ? fmtLong(value) : fmtShort(value);
        }
        throw new Error('Value is not a string or number.');
    }
    catch (error) {
        const message = isError(error)
            ? `${error.message}. value=${JSON.stringify(value)}`
            : 'An unknown error has occured.';
        throw new Error(message);
    }
}
/**
 * Parse the given `str` and return milliseconds.
 */
function parse(str) {
    str = String(str);
    if (str.length > 100) {
        throw new Error('Value exceeds the maximum length of 100 characters.');
    }
    const match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
        return NaN;
    }
    const n = parseFloat(match[1]);
    const type = (match[2] || 'ms').toLowerCase();
    switch (type) {
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
            return n * y;
        case 'weeks':
        case 'week':
        case 'w':
            return n * w;
        case 'days':
        case 'day':
        case 'd':
            return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
            return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
            return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
            return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
            return n;
        default:
            // This should never occur.
            throw new Error(`The unit ${type} was matched, but no matching case exists.`);
    }
}
exports["default"] = ms;
/**
 * Short format for `ms`.
 */
function fmtShort(ms) {
    const msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return `${Math.round(ms / d)}d`;
    }
    if (msAbs >= h) {
        return `${Math.round(ms / h)}h`;
    }
    if (msAbs >= m) {
        return `${Math.round(ms / m)}m`;
    }
    if (msAbs >= s) {
        return `${Math.round(ms / s)}s`;
    }
    return `${ms}ms`;
}
/**
 * Long format for `ms`.
 */
function fmtLong(ms) {
    const msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return plural(ms, msAbs, d, 'day');
    }
    if (msAbs >= h) {
        return plural(ms, msAbs, h, 'hour');
    }
    if (msAbs >= m) {
        return plural(ms, msAbs, m, 'minute');
    }
    if (msAbs >= s) {
        return plural(ms, msAbs, s, 'second');
    }
    return `${ms} ms`;
}
/**
 * Pluralization helper.
 */
function plural(ms, msAbs, n, name) {
    const isPlural = msAbs >= n * 1.5;
    return `${Math.round(ms / n)} ${name}${isPlural ? 's' : ''}`;
}
/**
 * A type guard for errors.
 */
function isError(error) {
    return typeof error === 'object' && error !== null && 'message' in error;
}
module.exports = exports.default;
module.exports["default"] = exports.default;


/***/ }),

/***/ "./node_modules/long/umd/index.js":
/*!****************************************!*\
  !*** ./node_modules/long/umd/index.js ***!
  \****************************************/
/***/ ((module, exports) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// GENERATED FILE. DO NOT EDIT.
var Long = (function(exports) {
  "use strict";
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = void 0;
  
  /**
   * @license
   * Copyright 2009 The Closure Library Authors
   * Copyright 2020 Daniel Wirtz / The long.js Authors.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  // WebAssembly optimizations to do native i64 multiplication and divide
  var wasm = null;
  
  try {
    wasm = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 1, 127, 3, 7, 6, 0, 1, 1, 1, 1, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95, 115, 0, 2, 5, 100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95, 115, 0, 4, 5, 114, 101, 109, 95, 117, 0, 5, 8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0, 10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11])), {}).exports;
  } catch (e) {// no wasm support :(
  }
  /**
   * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as *signed* integers.
   *  See the from* functions below for more convenient ways of constructing Longs.
   * @exports Long
   * @class A Long class for representing a 64 bit two's-complement integer value.
   * @param {number} low The low (signed) 32 bits of the long
   * @param {number} high The high (signed) 32 bits of the long
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @constructor
   */
  
  
  function Long(low, high, unsigned) {
    /**
     * The low 32 bits as a signed value.
     * @type {number}
     */
    this.low = low | 0;
    /**
     * The high 32 bits as a signed value.
     * @type {number}
     */
  
    this.high = high | 0;
    /**
     * Whether unsigned or not.
     * @type {boolean}
     */
  
    this.unsigned = !!unsigned;
  } // The internal representation of a long is the two given signed, 32-bit values.
  // We use 32-bit pieces because these are the size of integers on which
  // Javascript performs bit-operations.  For operations like addition and
  // multiplication, we split each number into 16 bit pieces, which can easily be
  // multiplied within Javascript's floating-point representation without overflow
  // or change in sign.
  //
  // In the algorithms below, we frequently reduce the negative case to the
  // positive case by negating the input(s) and then post-processing the result.
  // Note that we must ALWAYS check specially whether those values are MIN_VALUE
  // (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
  // a positive number, it overflows back into a negative).  Not handling this
  // case would often result in infinite recursion.
  //
  // Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the from*
  // methods on which they depend.
  
  /**
   * An indicator used to reliably determine if an object is a Long or not.
   * @type {boolean}
   * @const
   * @private
   */
  
  
  Long.prototype.__isLong__;
  Object.defineProperty(Long.prototype, "__isLong__", {
    value: true
  });
  /**
   * @function
   * @param {*} obj Object
   * @returns {boolean}
   * @inner
   */
  
  function isLong(obj) {
    return (obj && obj["__isLong__"]) === true;
  }
  /**
   * @function
   * @param {*} value number
   * @returns {number}
   * @inner
   */
  
  
  function ctz32(value) {
    var c = Math.clz32(value & -value);
    return value ? 31 - c : c;
  }
  /**
   * Tests if the specified object is a Long.
   * @function
   * @param {*} obj Object
   * @returns {boolean}
   */
  
  
  Long.isLong = isLong;
  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @inner
   */
  
  var INT_CACHE = {};
  /**
   * A cache of the Long representations of small unsigned integer values.
   * @type {!Object}
   * @inner
   */
  
  var UINT_CACHE = {};
  /**
   * @param {number} value
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromInt(value, unsigned) {
    var obj, cachedObj, cache;
  
    if (unsigned) {
      value >>>= 0;
  
      if (cache = 0 <= value && value < 256) {
        cachedObj = UINT_CACHE[value];
        if (cachedObj) return cachedObj;
      }
  
      obj = fromBits(value, 0, true);
      if (cache) UINT_CACHE[value] = obj;
      return obj;
    } else {
      value |= 0;
  
      if (cache = -128 <= value && value < 128) {
        cachedObj = INT_CACHE[value];
        if (cachedObj) return cachedObj;
      }
  
      obj = fromBits(value, value < 0 ? -1 : 0, false);
      if (cache) INT_CACHE[value] = obj;
      return obj;
    }
  }
  /**
   * Returns a Long representing the given 32 bit integer value.
   * @function
   * @param {number} value The 32 bit integer in question
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromInt = fromInt;
  /**
   * @param {number} value
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromNumber(value, unsigned) {
    if (isNaN(value)) return unsigned ? UZERO : ZERO;
  
    if (unsigned) {
      if (value < 0) return UZERO;
      if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
    } else {
      if (value <= -TWO_PWR_63_DBL) return MIN_VALUE;
      if (value + 1 >= TWO_PWR_63_DBL) return MAX_VALUE;
    }
  
    if (value < 0) return fromNumber(-value, unsigned).neg();
    return fromBits(value % TWO_PWR_32_DBL | 0, value / TWO_PWR_32_DBL | 0, unsigned);
  }
  /**
   * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
   * @function
   * @param {number} value The number in question
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromNumber = fromNumber;
  /**
   * @param {number} lowBits
   * @param {number} highBits
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromBits(lowBits, highBits, unsigned) {
    return new Long(lowBits, highBits, unsigned);
  }
  /**
   * Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits. Each is
   *  assumed to use 32 bits.
   * @function
   * @param {number} lowBits The low 32 bits
   * @param {number} highBits The high 32 bits
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromBits = fromBits;
  /**
   * @function
   * @param {number} base
   * @param {number} exponent
   * @returns {number}
   * @inner
   */
  
  var pow_dbl = Math.pow; // Used 4 times (4*8 to 15+4)
  
  /**
   * @param {string} str
   * @param {(boolean|number)=} unsigned
   * @param {number=} radix
   * @returns {!Long}
   * @inner
   */
  
  function fromString(str, unsigned, radix) {
    if (str.length === 0) throw Error('empty string');
  
    if (typeof unsigned === 'number') {
      // For goog.math.long compatibility
      radix = unsigned;
      unsigned = false;
    } else {
      unsigned = !!unsigned;
    }
  
    if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity") return unsigned ? UZERO : ZERO;
    radix = radix || 10;
    if (radix < 2 || 36 < radix) throw RangeError('radix');
    var p;
    if ((p = str.indexOf('-')) > 0) throw Error('interior hyphen');else if (p === 0) {
      return fromString(str.substring(1), unsigned, radix).neg();
    } // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
  
    var radixToPower = fromNumber(pow_dbl(radix, 8));
    var result = ZERO;
  
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i),
          value = parseInt(str.substring(i, i + size), radix);
  
      if (size < 8) {
        var power = fromNumber(pow_dbl(radix, size));
        result = result.mul(power).add(fromNumber(value));
      } else {
        result = result.mul(radixToPower);
        result = result.add(fromNumber(value));
      }
    }
  
    result.unsigned = unsigned;
    return result;
  }
  /**
   * Returns a Long representation of the given string, written using the specified radix.
   * @function
   * @param {string} str The textual representation of the Long
   * @param {(boolean|number)=} unsigned Whether unsigned or not, defaults to signed
   * @param {number=} radix The radix in which the text is written (2-36), defaults to 10
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromString = fromString;
  /**
   * @function
   * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromValue(val, unsigned) {
    if (typeof val === 'number') return fromNumber(val, unsigned);
    if (typeof val === 'string') return fromString(val, unsigned); // Throws for non-objects, converts non-instanceof Long:
  
    return fromBits(val.low, val.high, typeof unsigned === 'boolean' ? unsigned : val.unsigned);
  }
  /**
   * Converts the specified value to a Long using the appropriate from* function for its type.
   * @function
   * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val Value
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long}
   */
  
  
  Long.fromValue = fromValue; // NOTE: the compiler should inline these constant values below and then remove these variables, so there should be
  // no runtime penalty for these.
  
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_16_DBL = 1 << 16;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_24_DBL = 1 << 24;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
  /**
   * @type {!Long}
   * @const
   * @inner
   */
  
  var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);
  /**
   * @type {!Long}
   * @inner
   */
  
  var ZERO = fromInt(0);
  /**
   * Signed zero.
   * @type {!Long}
   */
  
  Long.ZERO = ZERO;
  /**
   * @type {!Long}
   * @inner
   */
  
  var UZERO = fromInt(0, true);
  /**
   * Unsigned zero.
   * @type {!Long}
   */
  
  Long.UZERO = UZERO;
  /**
   * @type {!Long}
   * @inner
   */
  
  var ONE = fromInt(1);
  /**
   * Signed one.
   * @type {!Long}
   */
  
  Long.ONE = ONE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var UONE = fromInt(1, true);
  /**
   * Unsigned one.
   * @type {!Long}
   */
  
  Long.UONE = UONE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var NEG_ONE = fromInt(-1);
  /**
   * Signed negative one.
   * @type {!Long}
   */
  
  Long.NEG_ONE = NEG_ONE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var MAX_VALUE = fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0, false);
  /**
   * Maximum signed value.
   * @type {!Long}
   */
  
  Long.MAX_VALUE = MAX_VALUE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var MAX_UNSIGNED_VALUE = fromBits(0xFFFFFFFF | 0, 0xFFFFFFFF | 0, true);
  /**
   * Maximum unsigned value.
   * @type {!Long}
   */
  
  Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var MIN_VALUE = fromBits(0, 0x80000000 | 0, false);
  /**
   * Minimum signed value.
   * @type {!Long}
   */
  
  Long.MIN_VALUE = MIN_VALUE;
  /**
   * @alias Long.prototype
   * @inner
   */
  
  var LongPrototype = Long.prototype;
  /**
   * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
   * @this {!Long}
   * @returns {number}
   */
  
  LongPrototype.toInt = function toInt() {
    return this.unsigned ? this.low >>> 0 : this.low;
  };
  /**
   * Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa).
   * @this {!Long}
   * @returns {number}
   */
  
  
  LongPrototype.toNumber = function toNumber() {
    if (this.unsigned) return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
    return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
  };
  /**
   * Converts the Long to a string written in the specified radix.
   * @this {!Long}
   * @param {number=} radix Radix (2-36), defaults to 10
   * @returns {string}
   * @override
   * @throws {RangeError} If `radix` is out of range
   */
  
  
  LongPrototype.toString = function toString(radix) {
    radix = radix || 10;
    if (radix < 2 || 36 < radix) throw RangeError('radix');
    if (this.isZero()) return '0';
  
    if (this.isNegative()) {
      // Unsigned Longs are never negative
      if (this.eq(MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = fromNumber(radix),
            div = this.div(radixLong),
            rem1 = div.mul(radixLong).sub(this);
        return div.toString(radix) + rem1.toInt().toString(radix);
      } else return '-' + this.neg().toString(radix);
    } // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
  
  
    var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned),
        rem = this;
    var result = '';
  
    while (true) {
      var remDiv = rem.div(radixToPower),
          intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0,
          digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero()) return digits + result;else {
        while (digits.length < 6) digits = '0' + digits;
  
        result = '' + digits + result;
      }
    }
  };
  /**
   * Gets the high 32 bits as a signed integer.
   * @this {!Long}
   * @returns {number} Signed high bits
   */
  
  
  LongPrototype.getHighBits = function getHighBits() {
    return this.high;
  };
  /**
   * Gets the high 32 bits as an unsigned integer.
   * @this {!Long}
   * @returns {number} Unsigned high bits
   */
  
  
  LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
    return this.high >>> 0;
  };
  /**
   * Gets the low 32 bits as a signed integer.
   * @this {!Long}
   * @returns {number} Signed low bits
   */
  
  
  LongPrototype.getLowBits = function getLowBits() {
    return this.low;
  };
  /**
   * Gets the low 32 bits as an unsigned integer.
   * @this {!Long}
   * @returns {number} Unsigned low bits
   */
  
  
  LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
    return this.low >>> 0;
  };
  /**
   * Gets the number of bits needed to represent the absolute value of this Long.
   * @this {!Long}
   * @returns {number}
   */
  
  
  LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
    if (this.isNegative()) // Unsigned Longs are never negative
      return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
    var val = this.high != 0 ? this.high : this.low;
  
    for (var bit = 31; bit > 0; bit--) if ((val & 1 << bit) != 0) break;
  
    return this.high != 0 ? bit + 33 : bit + 1;
  };
  /**
   * Tests if this Long's value equals zero.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isZero = function isZero() {
    return this.high === 0 && this.low === 0;
  };
  /**
   * Tests if this Long's value equals zero. This is an alias of {@link Long#isZero}.
   * @returns {boolean}
   */
  
  
  LongPrototype.eqz = LongPrototype.isZero;
  /**
   * Tests if this Long's value is negative.
   * @this {!Long}
   * @returns {boolean}
   */
  
  LongPrototype.isNegative = function isNegative() {
    return !this.unsigned && this.high < 0;
  };
  /**
   * Tests if this Long's value is positive or zero.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isPositive = function isPositive() {
    return this.unsigned || this.high >= 0;
  };
  /**
   * Tests if this Long's value is odd.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isOdd = function isOdd() {
    return (this.low & 1) === 1;
  };
  /**
   * Tests if this Long's value is even.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isEven = function isEven() {
    return (this.low & 1) === 0;
  };
  /**
   * Tests if this Long's value equals the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.equals = function equals(other) {
    if (!isLong(other)) other = fromValue(other);
    if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1) return false;
    return this.high === other.high && this.low === other.low;
  };
  /**
   * Tests if this Long's value equals the specified's. This is an alias of {@link Long#equals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.eq = LongPrototype.equals;
  /**
   * Tests if this Long's value differs from the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.notEquals = function notEquals(other) {
    return !this.eq(
    /* validates */
    other);
  };
  /**
   * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.neq = LongPrototype.notEquals;
  /**
   * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.ne = LongPrototype.notEquals;
  /**
   * Tests if this Long's value is less than the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.lessThan = function lessThan(other) {
    return this.comp(
    /* validates */
    other) < 0;
  };
  /**
   * Tests if this Long's value is less than the specified's. This is an alias of {@link Long#lessThan}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.lt = LongPrototype.lessThan;
  /**
   * Tests if this Long's value is less than or equal the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
    return this.comp(
    /* validates */
    other) <= 0;
  };
  /**
   * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.lte = LongPrototype.lessThanOrEqual;
  /**
   * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.le = LongPrototype.lessThanOrEqual;
  /**
   * Tests if this Long's value is greater than the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.greaterThan = function greaterThan(other) {
    return this.comp(
    /* validates */
    other) > 0;
  };
  /**
   * Tests if this Long's value is greater than the specified's. This is an alias of {@link Long#greaterThan}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.gt = LongPrototype.greaterThan;
  /**
   * Tests if this Long's value is greater than or equal the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
    return this.comp(
    /* validates */
    other) >= 0;
  };
  /**
   * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.gte = LongPrototype.greaterThanOrEqual;
  /**
   * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.ge = LongPrototype.greaterThanOrEqual;
  /**
   * Compares this Long's value with the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {number} 0 if they are the same, 1 if the this is greater and -1
   *  if the given one is greater
   */
  
  LongPrototype.compare = function compare(other) {
    if (!isLong(other)) other = fromValue(other);
    if (this.eq(other)) return 0;
    var thisNeg = this.isNegative(),
        otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) return -1;
    if (!thisNeg && otherNeg) return 1; // At this point the sign bits are the same
  
    if (!this.unsigned) return this.sub(other).isNegative() ? -1 : 1; // Both are positive if at least one is unsigned
  
    return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
  };
  /**
   * Compares this Long's value with the specified's. This is an alias of {@link Long#compare}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {number} 0 if they are the same, 1 if the this is greater and -1
   *  if the given one is greater
   */
  
  
  LongPrototype.comp = LongPrototype.compare;
  /**
   * Negates this Long's value.
   * @this {!Long}
   * @returns {!Long} Negated Long
   */
  
  LongPrototype.negate = function negate() {
    if (!this.unsigned && this.eq(MIN_VALUE)) return MIN_VALUE;
    return this.not().add(ONE);
  };
  /**
   * Negates this Long's value. This is an alias of {@link Long#negate}.
   * @function
   * @returns {!Long} Negated Long
   */
  
  
  LongPrototype.neg = LongPrototype.negate;
  /**
   * Returns the sum of this and the specified Long.
   * @this {!Long}
   * @param {!Long|number|string} addend Addend
   * @returns {!Long} Sum
   */
  
  LongPrototype.add = function add(addend) {
    if (!isLong(addend)) addend = fromValue(addend); // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
  
    var a48 = this.high >>> 16;
    var a32 = this.high & 0xFFFF;
    var a16 = this.low >>> 16;
    var a00 = this.low & 0xFFFF;
    var b48 = addend.high >>> 16;
    var b32 = addend.high & 0xFFFF;
    var b16 = addend.low >>> 16;
    var b00 = addend.low & 0xFFFF;
    var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
  };
  /**
   * Returns the difference of this and the specified Long.
   * @this {!Long}
   * @param {!Long|number|string} subtrahend Subtrahend
   * @returns {!Long} Difference
   */
  
  
  LongPrototype.subtract = function subtract(subtrahend) {
    if (!isLong(subtrahend)) subtrahend = fromValue(subtrahend);
    return this.add(subtrahend.neg());
  };
  /**
   * Returns the difference of this and the specified Long. This is an alias of {@link Long#subtract}.
   * @function
   * @param {!Long|number|string} subtrahend Subtrahend
   * @returns {!Long} Difference
   */
  
  
  LongPrototype.sub = LongPrototype.subtract;
  /**
   * Returns the product of this and the specified Long.
   * @this {!Long}
   * @param {!Long|number|string} multiplier Multiplier
   * @returns {!Long} Product
   */
  
  LongPrototype.multiply = function multiply(multiplier) {
    if (this.isZero()) return this;
    if (!isLong(multiplier)) multiplier = fromValue(multiplier); // use wasm support if present
  
    if (wasm) {
      var low = wasm["mul"](this.low, this.high, multiplier.low, multiplier.high);
      return fromBits(low, wasm["get_high"](), this.unsigned);
    }
  
    if (multiplier.isZero()) return this.unsigned ? UZERO : ZERO;
    if (this.eq(MIN_VALUE)) return multiplier.isOdd() ? MIN_VALUE : ZERO;
    if (multiplier.eq(MIN_VALUE)) return this.isOdd() ? MIN_VALUE : ZERO;
  
    if (this.isNegative()) {
      if (multiplier.isNegative()) return this.neg().mul(multiplier.neg());else return this.neg().mul(multiplier).neg();
    } else if (multiplier.isNegative()) return this.mul(multiplier.neg()).neg(); // If both longs are small, use float multiplication
  
  
    if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24)) return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned); // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.
  
    var a48 = this.high >>> 16;
    var a32 = this.high & 0xFFFF;
    var a16 = this.low >>> 16;
    var a00 = this.low & 0xFFFF;
    var b48 = multiplier.high >>> 16;
    var b32 = multiplier.high & 0xFFFF;
    var b16 = multiplier.low >>> 16;
    var b00 = multiplier.low & 0xFFFF;
    var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
  };
  /**
   * Returns the product of this and the specified Long. This is an alias of {@link Long#multiply}.
   * @function
   * @param {!Long|number|string} multiplier Multiplier
   * @returns {!Long} Product
   */
  
  
  LongPrototype.mul = LongPrototype.multiply;
  /**
   * Returns this Long divided by the specified. The result is signed if this Long is signed or
   *  unsigned if this Long is unsigned.
   * @this {!Long}
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Quotient
   */
  
  LongPrototype.divide = function divide(divisor) {
    if (!isLong(divisor)) divisor = fromValue(divisor);
    if (divisor.isZero()) throw Error('division by zero'); // use wasm support if present
  
    if (wasm) {
      // guard against signed division overflow: the largest
      // negative number / -1 would be 1 larger than the largest
      // positive number, due to two's complement.
      if (!this.unsigned && this.high === -0x80000000 && divisor.low === -1 && divisor.high === -1) {
        // be consistent with non-wasm code path
        return this;
      }
  
      var low = (this.unsigned ? wasm["div_u"] : wasm["div_s"])(this.low, this.high, divisor.low, divisor.high);
      return fromBits(low, wasm["get_high"](), this.unsigned);
    }
  
    if (this.isZero()) return this.unsigned ? UZERO : ZERO;
    var approx, rem, res;
  
    if (!this.unsigned) {
      // This section is only relevant for signed longs and is derived from the
      // closure library as a whole.
      if (this.eq(MIN_VALUE)) {
        if (divisor.eq(ONE) || divisor.eq(NEG_ONE)) return MIN_VALUE; // recall that -MIN_VALUE == MIN_VALUE
        else if (divisor.eq(MIN_VALUE)) return ONE;else {
          // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
          var halfThis = this.shr(1);
          approx = halfThis.div(divisor).shl(1);
  
          if (approx.eq(ZERO)) {
            return divisor.isNegative() ? ONE : NEG_ONE;
          } else {
            rem = this.sub(divisor.mul(approx));
            res = approx.add(rem.div(divisor));
            return res;
          }
        }
      } else if (divisor.eq(MIN_VALUE)) return this.unsigned ? UZERO : ZERO;
  
      if (this.isNegative()) {
        if (divisor.isNegative()) return this.neg().div(divisor.neg());
        return this.neg().div(divisor).neg();
      } else if (divisor.isNegative()) return this.div(divisor.neg()).neg();
  
      res = ZERO;
    } else {
      // The algorithm below has not been made for unsigned longs. It's therefore
      // required to take special care of the MSB prior to running it.
      if (!divisor.unsigned) divisor = divisor.toUnsigned();
      if (divisor.gt(this)) return UZERO;
      if (divisor.gt(this.shru(1))) // 15 >>> 1 = 7 ; with divisor = 8 ; true
        return UONE;
      res = UZERO;
    } // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
  
  
    rem = this;
  
    while (rem.gte(divisor)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber())); // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
  
      var log2 = Math.ceil(Math.log(approx) / Math.LN2),
          delta = log2 <= 48 ? 1 : pow_dbl(2, log2 - 48),
          // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      approxRes = fromNumber(approx),
          approxRem = approxRes.mul(divisor);
  
      while (approxRem.isNegative() || approxRem.gt(rem)) {
        approx -= delta;
        approxRes = fromNumber(approx, this.unsigned);
        approxRem = approxRes.mul(divisor);
      } // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
  
  
      if (approxRes.isZero()) approxRes = ONE;
      res = res.add(approxRes);
      rem = rem.sub(approxRem);
    }
  
    return res;
  };
  /**
   * Returns this Long divided by the specified. This is an alias of {@link Long#divide}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Quotient
   */
  
  
  LongPrototype.div = LongPrototype.divide;
  /**
   * Returns this Long modulo the specified.
   * @this {!Long}
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   */
  
  LongPrototype.modulo = function modulo(divisor) {
    if (!isLong(divisor)) divisor = fromValue(divisor); // use wasm support if present
  
    if (wasm) {
      var low = (this.unsigned ? wasm["rem_u"] : wasm["rem_s"])(this.low, this.high, divisor.low, divisor.high);
      return fromBits(low, wasm["get_high"](), this.unsigned);
    }
  
    return this.sub(this.div(divisor).mul(divisor));
  };
  /**
   * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   */
  
  
  LongPrototype.mod = LongPrototype.modulo;
  /**
   * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   */
  
  LongPrototype.rem = LongPrototype.modulo;
  /**
   * Returns the bitwise NOT of this Long.
   * @this {!Long}
   * @returns {!Long}
   */
  
  LongPrototype.not = function not() {
    return fromBits(~this.low, ~this.high, this.unsigned);
  };
  /**
   * Returns count leading zeros of this Long.
   * @this {!Long}
   * @returns {!number}
   */
  
  
  LongPrototype.countLeadingZeros = function countLeadingZeros() {
    return this.high ? Math.clz32(this.high) : Math.clz32(this.low) + 32;
  };
  /**
   * Returns count leading zeros. This is an alias of {@link Long#countLeadingZeros}.
   * @function
   * @param {!Long}
   * @returns {!number}
   */
  
  
  LongPrototype.clz = LongPrototype.countLeadingZeros;
  /**
   * Returns count trailing zeros of this Long.
   * @this {!Long}
   * @returns {!number}
   */
  
  LongPrototype.countTrailingZeros = function countTrailingZeros() {
    return this.low ? ctz32(this.low) : ctz32(this.high) + 32;
  };
  /**
   * Returns count trailing zeros. This is an alias of {@link Long#countTrailingZeros}.
   * @function
   * @param {!Long}
   * @returns {!number}
   */
  
  
  LongPrototype.ctz = LongPrototype.countTrailingZeros;
  /**
   * Returns the bitwise AND of this Long and the specified.
   * @this {!Long}
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   */
  
  LongPrototype.and = function and(other) {
    if (!isLong(other)) other = fromValue(other);
    return fromBits(this.low & other.low, this.high & other.high, this.unsigned);
  };
  /**
   * Returns the bitwise OR of this Long and the specified.
   * @this {!Long}
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   */
  
  
  LongPrototype.or = function or(other) {
    if (!isLong(other)) other = fromValue(other);
    return fromBits(this.low | other.low, this.high | other.high, this.unsigned);
  };
  /**
   * Returns the bitwise XOR of this Long and the given one.
   * @this {!Long}
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   */
  
  
  LongPrototype.xor = function xor(other) {
    if (!isLong(other)) other = fromValue(other);
    return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shiftLeft = function shiftLeft(numBits) {
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;else if (numBits < 32) return fromBits(this.low << numBits, this.high << numBits | this.low >>> 32 - numBits, this.unsigned);else return fromBits(0, this.low << numBits - 32, this.unsigned);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount. This is an alias of {@link Long#shiftLeft}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shl = LongPrototype.shiftLeft;
  /**
   * Returns this Long with bits arithmetically shifted to the right by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  LongPrototype.shiftRight = function shiftRight(numBits) {
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;else if (numBits < 32) return fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >> numBits, this.unsigned);else return fromBits(this.high >> numBits - 32, this.high >= 0 ? 0 : -1, this.unsigned);
  };
  /**
   * Returns this Long with bits arithmetically shifted to the right by the given amount. This is an alias of {@link Long#shiftRight}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shr = LongPrototype.shiftRight;
  /**
   * Returns this Long with bits logically shifted to the right by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;
    if (numBits < 32) return fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >>> numBits, this.unsigned);
    if (numBits === 32) return fromBits(this.high, 0, this.unsigned);
    return fromBits(this.high >>> numBits - 32, 0, this.unsigned);
  };
  /**
   * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shru = LongPrototype.shiftRightUnsigned;
  /**
   * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  LongPrototype.shr_u = LongPrototype.shiftRightUnsigned;
  /**
   * Returns this Long with bits rotated to the left by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  LongPrototype.rotateLeft = function rotateLeft(numBits) {
    var b;
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;
    if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
  
    if (numBits < 32) {
      b = 32 - numBits;
      return fromBits(this.low << numBits | this.high >>> b, this.high << numBits | this.low >>> b, this.unsigned);
    }
  
    numBits -= 32;
    b = 32 - numBits;
    return fromBits(this.high << numBits | this.low >>> b, this.low << numBits | this.high >>> b, this.unsigned);
  };
  /**
   * Returns this Long with bits rotated to the left by the given amount. This is an alias of {@link Long#rotateLeft}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  
  LongPrototype.rotl = LongPrototype.rotateLeft;
  /**
   * Returns this Long with bits rotated to the right by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  LongPrototype.rotateRight = function rotateRight(numBits) {
    var b;
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;
    if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
  
    if (numBits < 32) {
      b = 32 - numBits;
      return fromBits(this.high << b | this.low >>> numBits, this.low << b | this.high >>> numBits, this.unsigned);
    }
  
    numBits -= 32;
    b = 32 - numBits;
    return fromBits(this.low << b | this.high >>> numBits, this.high << b | this.low >>> numBits, this.unsigned);
  };
  /**
   * Returns this Long with bits rotated to the right by the given amount. This is an alias of {@link Long#rotateRight}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  
  LongPrototype.rotr = LongPrototype.rotateRight;
  /**
   * Converts this Long to signed.
   * @this {!Long}
   * @returns {!Long} Signed long
   */
  
  LongPrototype.toSigned = function toSigned() {
    if (!this.unsigned) return this;
    return fromBits(this.low, this.high, false);
  };
  /**
   * Converts this Long to unsigned.
   * @this {!Long}
   * @returns {!Long} Unsigned long
   */
  
  
  LongPrototype.toUnsigned = function toUnsigned() {
    if (this.unsigned) return this;
    return fromBits(this.low, this.high, true);
  };
  /**
   * Converts this Long to its byte representation.
   * @param {boolean=} le Whether little or big endian, defaults to big endian
   * @this {!Long}
   * @returns {!Array.<number>} Byte representation
   */
  
  
  LongPrototype.toBytes = function toBytes(le) {
    return le ? this.toBytesLE() : this.toBytesBE();
  };
  /**
   * Converts this Long to its little endian byte representation.
   * @this {!Long}
   * @returns {!Array.<number>} Little endian byte representation
   */
  
  
  LongPrototype.toBytesLE = function toBytesLE() {
    var hi = this.high,
        lo = this.low;
    return [lo & 0xff, lo >>> 8 & 0xff, lo >>> 16 & 0xff, lo >>> 24, hi & 0xff, hi >>> 8 & 0xff, hi >>> 16 & 0xff, hi >>> 24];
  };
  /**
   * Converts this Long to its big endian byte representation.
   * @this {!Long}
   * @returns {!Array.<number>} Big endian byte representation
   */
  
  
  LongPrototype.toBytesBE = function toBytesBE() {
    var hi = this.high,
        lo = this.low;
    return [hi >>> 24, hi >>> 16 & 0xff, hi >>> 8 & 0xff, hi & 0xff, lo >>> 24, lo >>> 16 & 0xff, lo >>> 8 & 0xff, lo & 0xff];
  };
  /**
   * Creates a Long from its byte representation.
   * @param {!Array.<number>} bytes Byte representation
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @param {boolean=} le Whether little or big endian, defaults to big endian
   * @returns {Long} The corresponding Long value
   */
  
  
  Long.fromBytes = function fromBytes(bytes, unsigned, le) {
    return le ? Long.fromBytesLE(bytes, unsigned) : Long.fromBytesBE(bytes, unsigned);
  };
  /**
   * Creates a Long from its little endian byte representation.
   * @param {!Array.<number>} bytes Little endian byte representation
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {Long} The corresponding Long value
   */
  
  
  Long.fromBytesLE = function fromBytesLE(bytes, unsigned) {
    return new Long(bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24, bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24, unsigned);
  };
  /**
   * Creates a Long from its big endian byte representation.
   * @param {!Array.<number>} bytes Big endian byte representation
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {Long} The corresponding Long value
   */
  
  
  Long.fromBytesBE = function fromBytesBE(bytes, unsigned) {
    return new Long(bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7], bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], unsigned);
  };
  
  var _default = Long;
  exports.default = _default;
  return "default" in exports ? exports.default : exports;
})({});
if (true) !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function() { return Long; }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
else {}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/package.json":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/package.json ***!
  \********************************************************/
/***/ ((module) => {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"name":"@temporalio/workflow","version":"1.10.2","description":"Temporal.io SDK Workflow sub-package","keywords":["temporal","workflow","isolate"],"bugs":{"url":"https://github.com/temporalio/sdk-typescript/issues"},"repository":{"type":"git","url":"git+https://github.com/temporalio/sdk-typescript.git","directory":"packages/workflow"},"homepage":"https://github.com/temporalio/sdk-typescript/tree/main/packages/workflow","license":"MIT","author":"Temporal Technologies Inc. <sdk@temporal.io>","main":"lib/index.js","types":"lib/index.d.ts","scripts":{},"dependencies":{"@temporalio/common":"1.10.2","@temporalio/proto":"1.10.2"},"devDependencies":{"source-map":"^0.7.4"},"publishConfig":{"access":"public"},"files":["src","lib"],"gitHead":"a44bdfa780c1247fe7ed82b4b73c7b1577ee94af"}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = globalThis.__webpack_module_cache__;
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;
/*!****************************************************!*\
  !*** ./src/workflows-autogenerated-entrypoint.cjs ***!
  \****************************************************/

const api = __webpack_require__(/*! @temporalio/workflow/lib/worker-interface.js */ "./node_modules/@temporalio/workflow/lib/worker-interface.js");
exports.api = api;

const { overrideGlobals } = __webpack_require__(/*! @temporalio/workflow/lib/global-overrides.js */ "./node_modules/@temporalio/workflow/lib/global-overrides.js");
overrideGlobals();

exports.importWorkflows = function importWorkflows() {
  return __webpack_require__(/* webpackMode: "eager" */ /*! ./src/workflows.ts */ "./src/workflows.ts");
}

exports.importInterceptors = function importInterceptors() {
  return [
    
  ];
}

})();

__TEMPORAL__ = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2Zsb3ctYnVuZGxlLTRkZGQ4OTYwNWRjNzg3ZTUwYWViLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBRUEsMEhBQThDO0FBSTlDLDBFQUEwRTtBQUMxRSxpRUFBaUU7QUFDakUsSUFBWSx3QkFJWDtBQUpELFdBQVksd0JBQXdCO0lBQ2xDLG1GQUFjO0lBQ2QscUhBQStCO0lBQy9CLDZFQUFXO0FBQ2IsQ0FBQyxFQUpXLHdCQUF3Qix3Q0FBeEIsd0JBQXdCLFFBSW5DO0FBRUQsK0JBQVksR0FBZ0YsQ0FBQztBQUM3RiwrQkFBWSxHQUFnRixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNmN0YsbUpBQWdGO0FBRWhGLG1KQUFnRjtBQTREaEY7Ozs7R0FJRztBQUNVLCtCQUF1QixHQUFxQixJQUFJLDJDQUF1QixFQUFFLENBQUM7QUFFdkY7O0dBRUc7QUFDVSw0QkFBb0IsR0FBd0I7SUFDdkQsZ0JBQWdCLEVBQUUsMkNBQXVCO0lBQ3pDLGdCQUFnQixFQUFFLCtCQUF1QjtJQUN6QyxhQUFhLEVBQUUsRUFBRTtDQUNsQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUM1RUYsNEdBYW9CO0FBQ3BCLDJIQUEwQztBQUMxQyxtSkFBMkc7QUFFM0csU0FBUyxhQUFhLENBQUMsR0FBRyxPQUFpQjtJQUN6QyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDckUsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxxQkFBcUIsR0FBRyxhQUFhO0FBQ3pDLHlCQUF5QjtBQUN6Qix1RkFBdUY7QUFDdkYsMEJBQTBCO0FBQzFCLGtHQUFrRztBQUNsRyx1Q0FBdUM7QUFDdkMsMkRBQTJELENBQzVELENBQUM7QUFFRjs7O0dBR0c7QUFDSCxNQUFNLDZCQUE2QixHQUFHLGFBQWE7QUFDakQsZ0VBQWdF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O0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWixlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1osZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWixhQUFhLFNBQVM7QUFDdEIsZUFBZTtBQUNmO0FBQ0EsY0FBYyxZQUFZO0FBQzFCO0FB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ZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9hY3Rpdml0eS1vcHRpb25zLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvY29udmVydGVyL2RhdGEtY29udmVydGVyLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvY29udmVydGVyL2ZhaWx1cmUtY29udmVydGVyLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvY29udmVydGVyL3BheWxvYWQtY29kZWMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9jb252ZXJ0ZXIvcGF5bG9hZC1jb252ZXJ0ZXIudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9jb252ZXJ0ZXIvdHlwZXMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9kZXByZWNhdGVkLXRpbWUudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9lbmNvZGluZy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2Vycm9ycy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2ZhaWx1cmUudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9pbmRleC50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2ludGVyY2VwdG9ycy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2ludGVyZmFjZXMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9sb2dnZXIudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9yZXRyeS1wb2xpY3kudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy90aW1lLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvdHlwZS1oZWxwZXJzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvdmVyc2lvbmluZy1pbnRlbnQtZW51bS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL3ZlcnNpb25pbmctaW50ZW50LnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvd29ya2Zsb3ctaGFuZGxlLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvd29ya2Zsb3ctb3B0aW9ucy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvYWxlYS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvY2FuY2VsbGF0aW9uLXNjb3BlLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9lcnJvcnMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2ZsYWdzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9nbG9iYWwtYXR0cmlidXRlcy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvZ2xvYmFsLW92ZXJyaWRlcy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvaW5kZXgudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2ludGVyY2VwdG9ycy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvaW50ZXJmYWNlcy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvaW50ZXJuYWxzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9sb2dzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9wa2cudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3NpbmtzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9zdGFjay1oZWxwZXJzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy90cmlnZ2VyLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy93b3JrZXItaW50ZXJmYWNlLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy93b3JrZmxvdy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL3NyYy93b3JrZmxvd3MudHMiLCJpZ25vcmVkfC9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9saWJ8X190ZW1wb3JhbF9jdXN0b21fZmFpbHVyZV9jb252ZXJ0ZXIiLCJpZ25vcmVkfC9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9saWJ8X190ZW1wb3JhbF9jdXN0b21fcGF5bG9hZF9jb252ZXJ0ZXIiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvbXMvZGlzdC9pbmRleC5janMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvbG9uZy91bWQvaW5kZXguanMiLCJ3ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9zcmMvd29ya2Zsb3dzLWF1dG9nZW5lcmF0ZWQtZW50cnlwb2ludC5janMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBjb3Jlc2RrIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgUmV0cnlQb2xpY3kgfSBmcm9tICcuL3JldHJ5LXBvbGljeSc7XG5pbXBvcnQgeyBjaGVja0V4dGVuZHMgfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gJy4vdGltZSc7XG5pbXBvcnQgeyBWZXJzaW9uaW5nSW50ZW50IH0gZnJvbSAnLi92ZXJzaW9uaW5nLWludGVudCc7XG5cbi8vIEF2b2lkIGltcG9ydGluZyB0aGUgcHJvdG8gaW1wbGVtZW50YXRpb24gdG8gcmVkdWNlIHdvcmtmbG93IGJ1bmRsZSBzaXplXG4vLyBDb3BpZWQgZnJvbSBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLkFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZVxuZXhwb3J0IGVudW0gQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlIHtcbiAgVFJZX0NBTkNFTCA9IDAsXG4gIFdBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRCA9IDEsXG4gIEFCQU5ET04gPSAyLFxufVxuXG5jaGVja0V4dGVuZHM8Y29yZXNkay53b3JrZmxvd19jb21tYW5kcy5BY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUsIEFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZT4oKTtcbmNoZWNrRXh0ZW5kczxBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUsIGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlPigpO1xuXG4vKipcbiAqIE9wdGlvbnMgZm9yIHJlbW90ZSBhY3Rpdml0eSBpbnZvY2F0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZpdHlPcHRpb25zIHtcbiAgLyoqXG4gICAqIElkZW50aWZpZXIgdG8gdXNlIGZvciB0cmFja2luZyB0aGUgYWN0aXZpdHkgaW4gV29ya2Zsb3cgaGlzdG9yeS5cbiAgICogVGhlIGBhY3Rpdml0eUlkYCBjYW4gYmUgYWNjZXNzZWQgYnkgdGhlIGFjdGl2aXR5IGZ1bmN0aW9uLlxuICAgKiBEb2VzIG5vdCBuZWVkIHRvIGJlIHVuaXF1ZS5cbiAgICpcbiAgICogQGRlZmF1bHQgYW4gaW5jcmVtZW50YWwgc2VxdWVuY2UgbnVtYmVyXG4gICAqL1xuICBhY3Rpdml0eUlkPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUYXNrIHF1ZXVlIG5hbWUuXG4gICAqXG4gICAqIEBkZWZhdWx0IGN1cnJlbnQgd29ya2VyIHRhc2sgcXVldWVcbiAgICovXG4gIHRhc2tRdWV1ZT86IHN0cmluZztcblxuICAvKipcbiAgICogSGVhcnRiZWF0IGludGVydmFsLiBBY3Rpdml0eSBtdXN0IGhlYXJ0YmVhdCBiZWZvcmUgdGhpcyBpbnRlcnZhbCBwYXNzZXMgYWZ0ZXIgYSBsYXN0IGhlYXJ0YmVhdCBvciBhY3Rpdml0eSBzdGFydC5cbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBoZWFydGJlYXRUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIFJldHJ5UG9saWN5IHRoYXQgZGVmaW5lIGhvdyBhY3Rpdml0eSBpcyByZXRyaWVkIGluIGNhc2Ugb2YgZmFpbHVyZS4gSWYgdGhpcyBpcyBub3Qgc2V0LCB0aGVuIHRoZSBzZXJ2ZXItZGVmaW5lZCBkZWZhdWx0IGFjdGl2aXR5IHJldHJ5IHBvbGljeSB3aWxsIGJlIHVzZWQuIFRvIGVuc3VyZSB6ZXJvIHJldHJpZXMsIHNldCBtYXhpbXVtIGF0dGVtcHRzIHRvIDEuXG4gICAqL1xuICByZXRyeT86IFJldHJ5UG9saWN5O1xuXG4gIC8qKlxuICAgKiBNYXhpbXVtIHRpbWUgb2YgYSBzaW5nbGUgQWN0aXZpdHkgZXhlY3V0aW9uIGF0dGVtcHQuIE5vdGUgdGhhdCB0aGUgVGVtcG9yYWwgU2VydmVyIGRvZXNuJ3QgZGV0ZWN0IFdvcmtlciBwcm9jZXNzXG4gICAqIGZhaWx1cmVzIGRpcmVjdGx5LiBJdCByZWxpZXMgb24gdGhpcyB0aW1lb3V0IHRvIGRldGVjdCB0aGF0IGFuIEFjdGl2aXR5IHRoYXQgZGlkbid0IGNvbXBsZXRlIG9uIHRpbWUuIFNvIHRoaXNcbiAgICogdGltZW91dCBzaG91bGQgYmUgYXMgc2hvcnQgYXMgdGhlIGxvbmdlc3QgcG9zc2libGUgZXhlY3V0aW9uIG9mIHRoZSBBY3Rpdml0eSBib2R5LiBQb3RlbnRpYWxseSBsb25nIHJ1bm5pbmdcbiAgICogQWN0aXZpdGllcyBtdXN0IHNwZWNpZnkge0BsaW5rIGhlYXJ0YmVhdFRpbWVvdXR9IGFuZCBjYWxsIHtAbGluayBhY3Rpdml0eS5Db250ZXh0LmhlYXJ0YmVhdH0gcGVyaW9kaWNhbGx5IGZvclxuICAgKiB0aW1lbHkgZmFpbHVyZSBkZXRlY3Rpb24uXG4gICAqXG4gICAqIEVpdGhlciB0aGlzIG9wdGlvbiBvciB7QGxpbmsgc2NoZWR1bGVUb0Nsb3NlVGltZW91dH0gaXMgcmVxdWlyZWQuXG4gICAqXG4gICAqIEBkZWZhdWx0IGBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0YCBvciB1bmxpbWl0ZWRcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBzdGFydFRvQ2xvc2VUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIFRpbWUgdGhhdCB0aGUgQWN0aXZpdHkgVGFzayBjYW4gc3RheSBpbiB0aGUgVGFzayBRdWV1ZSBiZWZvcmUgaXQgaXMgcGlja2VkIHVwIGJ5IGEgV29ya2VyLiBEbyBub3Qgc3BlY2lmeSB0aGlzIHRpbWVvdXQgdW5sZXNzIHVzaW5nIGhvc3Qgc3BlY2lmaWMgVGFzayBRdWV1ZXMgZm9yIEFjdGl2aXR5IFRhc2tzIGFyZSBiZWluZyB1c2VkIGZvciByb3V0aW5nLlxuICAgKiBgc2NoZWR1bGVUb1N0YXJ0VGltZW91dGAgaXMgYWx3YXlzIG5vbi1yZXRyeWFibGUuIFJldHJ5aW5nIGFmdGVyIHRoaXMgdGltZW91dCBkb2Vzbid0IG1ha2Ugc2Vuc2UgYXMgaXQgd291bGQganVzdCBwdXQgdGhlIEFjdGl2aXR5IFRhc2sgYmFjayBpbnRvIHRoZSBzYW1lIFRhc2sgUXVldWUuXG4gICAqXG4gICAqIEBkZWZhdWx0IGBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0YCBvciB1bmxpbWl0ZWRcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBzY2hlZHVsZVRvU3RhcnRUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIFRvdGFsIHRpbWUgdGhhdCBhIHdvcmtmbG93IGlzIHdpbGxpbmcgdG8gd2FpdCBmb3IgQWN0aXZpdHkgdG8gY29tcGxldGUuXG4gICAqIGBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0YCBsaW1pdHMgdGhlIHRvdGFsIHRpbWUgb2YgYW4gQWN0aXZpdHkncyBleGVjdXRpb24gaW5jbHVkaW5nIHJldHJpZXMgKHVzZSB7QGxpbmsgc3RhcnRUb0Nsb3NlVGltZW91dH0gdG8gbGltaXQgdGhlIHRpbWUgb2YgYSBzaW5nbGUgYXR0ZW1wdCkuXG4gICAqXG4gICAqIEVpdGhlciB0aGlzIG9wdGlvbiBvciB7QGxpbmsgc3RhcnRUb0Nsb3NlVGltZW91dH0gaXMgcmVxdWlyZWQuXG4gICAqXG4gICAqIEBkZWZhdWx0IHVubGltaXRlZFxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGF0IHRoZSBTREsgZG9lcyB3aGVuIHRoZSBBY3Rpdml0eSBpcyBjYW5jZWxsZWQuXG4gICAqIC0gYFRSWV9DQU5DRUxgIC0gSW5pdGlhdGUgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCBhbmQgaW1tZWRpYXRlbHkgcmVwb3J0IGNhbmNlbGxhdGlvbiB0byB0aGUgd29ya2Zsb3cuXG4gICAqIC0gYFdBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRGAgLSBXYWl0IGZvciBhY3Rpdml0eSBjYW5jZWxsYXRpb24gY29tcGxldGlvbi4gTm90ZSB0aGF0IGFjdGl2aXR5IG11c3QgaGVhcnRiZWF0IHRvIHJlY2VpdmUgYVxuICAgKiAgIGNhbmNlbGxhdGlvbiBub3RpZmljYXRpb24uIFRoaXMgY2FuIGJsb2NrIHRoZSBjYW5jZWxsYXRpb24gZm9yIGEgbG9uZyB0aW1lIGlmIGFjdGl2aXR5IGRvZXNuJ3RcbiAgICogICBoZWFydGJlYXQgb3IgY2hvb3NlcyB0byBpZ25vcmUgdGhlIGNhbmNlbGxhdGlvbiByZXF1ZXN0LlxuICAgKiAtIGBBQkFORE9OYCAtIERvIG5vdCByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiB0aGUgYWN0aXZpdHkgYW5kIGltbWVkaWF0ZWx5IHJlcG9ydCBjYW5jZWxsYXRpb24gdG8gdGhlIHdvcmtmbG93LlxuICAgKi9cbiAgY2FuY2VsbGF0aW9uVHlwZT86IEFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZTtcblxuICAvKipcbiAgICogRWFnZXIgZGlzcGF0Y2ggaXMgYW4gb3B0aW1pemF0aW9uIHRoYXQgaW1wcm92ZXMgdGhlIHRocm91Z2hwdXQgYW5kIGxvYWQgb24gdGhlIHNlcnZlciBmb3Igc2NoZWR1bGluZyBBY3Rpdml0aWVzLlxuICAgKiBXaGVuIHVzZWQsIHRoZSBzZXJ2ZXIgd2lsbCBoYW5kIG91dCBBY3Rpdml0eSB0YXNrcyBiYWNrIHRvIHRoZSBXb3JrZXIgd2hlbiBpdCBjb21wbGV0ZXMgYSBXb3JrZmxvdyB0YXNrLlxuICAgKiBJdCBpcyBhdmFpbGFibGUgZnJvbSBzZXJ2ZXIgdmVyc2lvbiAxLjE3IGJlaGluZCB0aGUgYHN5c3RlbS5lbmFibGVBY3Rpdml0eUVhZ2VyRXhlY3V0aW9uYCBmZWF0dXJlIGZsYWcuXG4gICAqXG4gICAqIEVhZ2VyIGRpc3BhdGNoIHdpbGwgb25seSBiZSB1c2VkIGlmIGBhbGxvd0VhZ2VyRGlzcGF0Y2hgIGlzIGVuYWJsZWQgKHRoZSBkZWZhdWx0KSBhbmQge0BsaW5rIHRhc2tRdWV1ZX0gaXMgZWl0aGVyXG4gICAqIG9taXR0ZWQgb3IgdGhlIHNhbWUgYXMgdGhlIGN1cnJlbnQgV29ya2Zsb3cuXG4gICAqXG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGFsbG93RWFnZXJEaXNwYXRjaD86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFdoZW4gdXNpbmcgdGhlIFdvcmtlciBWZXJzaW9uaW5nIGZlYXR1cmUsIHNwZWNpZmllcyB3aGV0aGVyIHRoaXMgQWN0aXZpdHkgc2hvdWxkIHJ1biBvbiBhXG4gICAqIHdvcmtlciB3aXRoIGEgY29tcGF0aWJsZSBCdWlsZCBJZCBvciBub3QuIFNlZSB7QGxpbmsgVmVyc2lvbmluZ0ludGVudH0uXG4gICAqXG4gICAqIEBkZWZhdWx0ICdDT01QQVRJQkxFJ1xuICAgKlxuICAgKiBAZXhwZXJpbWVudGFsXG4gICAqL1xuICB2ZXJzaW9uaW5nSW50ZW50PzogVmVyc2lvbmluZ0ludGVudDtcbn1cblxuLyoqXG4gKiBPcHRpb25zIGZvciBsb2NhbCBhY3Rpdml0eSBpbnZvY2F0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9jYWxBY3Rpdml0eU9wdGlvbnMge1xuICAvKipcbiAgICogUmV0cnlQb2xpY3kgdGhhdCBkZWZpbmVzIGhvdyBhbiBhY3Rpdml0eSBpcyByZXRyaWVkIGluIGNhc2Ugb2YgZmFpbHVyZS4gSWYgdGhpcyBpcyBub3Qgc2V0LCB0aGVuIHRoZSBTREstZGVmaW5lZCBkZWZhdWx0IGFjdGl2aXR5IHJldHJ5IHBvbGljeSB3aWxsIGJlIHVzZWQuXG4gICAqIE5vdGUgdGhhdCBsb2NhbCBhY3Rpdml0aWVzIGFyZSBhbHdheXMgZXhlY3V0ZWQgYXQgbGVhc3Qgb25jZSwgZXZlbiBpZiBtYXhpbXVtIGF0dGVtcHRzIGlzIHNldCB0byAxIGR1ZSB0byBXb3JrZmxvdyB0YXNrIHJldHJpZXMuXG4gICAqL1xuICByZXRyeT86IFJldHJ5UG9saWN5O1xuXG4gIC8qKlxuICAgKiBNYXhpbXVtIHRpbWUgdGhlIGxvY2FsIGFjdGl2aXR5IGlzIGFsbG93ZWQgdG8gZXhlY3V0ZSBhZnRlciB0aGUgdGFzayBpcyBkaXNwYXRjaGVkLiBUaGlzXG4gICAqIHRpbWVvdXQgaXMgYWx3YXlzIHJldHJ5YWJsZS5cbiAgICpcbiAgICogRWl0aGVyIHRoaXMgb3B0aW9uIG9yIHtAbGluayBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0fSBpcyByZXF1aXJlZC5cbiAgICogSWYgc2V0LCB0aGlzIG11c3QgYmUgPD0ge0BsaW5rIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXR9LCBvdGhlcndpc2UsIGl0IHdpbGwgYmUgY2xhbXBlZCBkb3duLlxuICAgKlxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHN0YXJ0VG9DbG9zZVRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogTGltaXRzIHRpbWUgdGhlIGxvY2FsIGFjdGl2aXR5IGNhbiBpZGxlIGludGVybmFsbHkgYmVmb3JlIGJlaW5nIGV4ZWN1dGVkLiBUaGF0IGNhbiBoYXBwZW4gaWZcbiAgICogdGhlIHdvcmtlciBpcyBjdXJyZW50bHkgYXQgbWF4IGNvbmN1cnJlbnQgbG9jYWwgYWN0aXZpdHkgZXhlY3V0aW9ucy4gVGhpcyB0aW1lb3V0IGlzIGFsd2F5c1xuICAgKiBub24gcmV0cnlhYmxlIGFzIGFsbCBhIHJldHJ5IHdvdWxkIGFjaGlldmUgaXMgdG8gcHV0IGl0IGJhY2sgaW50byB0aGUgc2FtZSBxdWV1ZS4gRGVmYXVsdHNcbiAgICogdG8ge0BsaW5rIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXR9IGlmIG5vdCBzcGVjaWZpZWQgYW5kIHRoYXQgaXMgc2V0LiBNdXN0IGJlIDw9XG4gICAqIHtAbGluayBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0fSB3aGVuIHNldCwgb3RoZXJ3aXNlLCBpdCB3aWxsIGJlIGNsYW1wZWQgZG93bi5cbiAgICpcbiAgICogQGRlZmF1bHQgdW5saW1pdGVkXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc2NoZWR1bGVUb1N0YXJ0VGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgaG93IGxvbmcgdGhlIGNhbGxlciBpcyB3aWxsaW5nIHRvIHdhaXQgZm9yIGxvY2FsIGFjdGl2aXR5IGNvbXBsZXRpb24uIExpbWl0cyBob3dcbiAgICogbG9uZyByZXRyaWVzIHdpbGwgYmUgYXR0ZW1wdGVkLlxuICAgKlxuICAgKiBFaXRoZXIgdGhpcyBvcHRpb24gb3Ige0BsaW5rIHN0YXJ0VG9DbG9zZVRpbWVvdXR9IGlzIHJlcXVpcmVkLlxuICAgKlxuICAgKiBAZGVmYXVsdCB1bmxpbWl0ZWRcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIElmIHRoZSBhY3Rpdml0eSBpcyByZXRyeWluZyBhbmQgYmFja29mZiB3b3VsZCBleGNlZWQgdGhpcyB2YWx1ZSwgYSBzZXJ2ZXIgc2lkZSB0aW1lciB3aWxsIGJlIHNjaGVkdWxlZCBmb3IgdGhlIG5leHQgYXR0ZW1wdC5cbiAgICogT3RoZXJ3aXNlLCBiYWNrb2ZmIHdpbGwgaGFwcGVuIGludGVybmFsbHkgaW4gdGhlIFNESy5cbiAgICpcbiAgICogQGRlZmF1bHQgMSBtaW51dGVcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqKi9cbiAgbG9jYWxSZXRyeVRocmVzaG9sZD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoYXQgdGhlIFNESyBkb2VzIHdoZW4gdGhlIEFjdGl2aXR5IGlzIGNhbmNlbGxlZC5cbiAgICogLSBgVFJZX0NBTkNFTGAgLSBJbml0aWF0ZSBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IGFuZCBpbW1lZGlhdGVseSByZXBvcnQgY2FuY2VsbGF0aW9uIHRvIHRoZSB3b3JrZmxvdy5cbiAgICogLSBgV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEYCAtIFdhaXQgZm9yIGFjdGl2aXR5IGNhbmNlbGxhdGlvbiBjb21wbGV0aW9uLiBOb3RlIHRoYXQgYWN0aXZpdHkgbXVzdCBoZWFydGJlYXQgdG8gcmVjZWl2ZSBhXG4gICAqICAgY2FuY2VsbGF0aW9uIG5vdGlmaWNhdGlvbi4gVGhpcyBjYW4gYmxvY2sgdGhlIGNhbmNlbGxhdGlvbiBmb3IgYSBsb25nIHRpbWUgaWYgYWN0aXZpdHkgZG9lc24ndFxuICAgKiAgIGhlYXJ0YmVhdCBvciBjaG9vc2VzIHRvIGlnbm9yZSB0aGUgY2FuY2VsbGF0aW9uIHJlcXVlc3QuXG4gICAqIC0gYEFCQU5ET05gIC0gRG8gbm90IHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIHRoZSBhY3Rpdml0eSBhbmQgaW1tZWRpYXRlbHkgcmVwb3J0IGNhbmNlbGxhdGlvbiB0byB0aGUgd29ya2Zsb3cuXG4gICAqL1xuICBjYW5jZWxsYXRpb25UeXBlPzogY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5BY3Rpdml0eUNhbmNlbGxhdGlvblR5cGU7XG59XG4iLCJpbXBvcnQgeyBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlciwgRmFpbHVyZUNvbnZlcnRlciB9IGZyb20gJy4vZmFpbHVyZS1jb252ZXJ0ZXInO1xuaW1wb3J0IHsgUGF5bG9hZENvZGVjIH0gZnJvbSAnLi9wYXlsb2FkLWNvZGVjJztcbmltcG9ydCB7IGRlZmF1bHRQYXlsb2FkQ29udmVydGVyLCBQYXlsb2FkQ29udmVydGVyIH0gZnJvbSAnLi9wYXlsb2FkLWNvbnZlcnRlcic7XG5cbi8qKlxuICogV2hlbiB5b3VyIGRhdGEgKGFyZ3VtZW50cyBhbmQgcmV0dXJuIHZhbHVlcykgaXMgc2VudCBvdmVyIHRoZSB3aXJlIGFuZCBzdG9yZWQgYnkgVGVtcG9yYWwgU2VydmVyLCBpdCBpcyBlbmNvZGVkIGluXG4gKiBiaW5hcnkgaW4gYSB7QGxpbmsgUGF5bG9hZH0gUHJvdG9idWYgbWVzc2FnZS5cbiAqXG4gKiBUaGUgZGVmYXVsdCBgRGF0YUNvbnZlcnRlcmAgc3VwcG9ydHMgYHVuZGVmaW5lZGAsIGBVaW50OEFycmF5YCwgYW5kIEpTT04gc2VyaWFsaXphYmxlcyAoc28gaWZcbiAqIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9KU09OL3N0cmluZ2lmeSNkZXNjcmlwdGlvbiB8IGBKU09OLnN0cmluZ2lmeSh5b3VyQXJnT3JSZXR2YWwpYH1cbiAqIHdvcmtzLCB0aGUgZGVmYXVsdCBkYXRhIGNvbnZlcnRlciB3aWxsIHdvcmspLiBQcm90b2J1ZnMgYXJlIHN1cHBvcnRlZCB2aWFcbiAqIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC9kYXRhLWNvbnZlcnRlcnMjcHJvdG9idWZzIHwgdGhpcyBBUEl9LlxuICpcbiAqIFVzZSBhIGN1c3RvbSBgRGF0YUNvbnZlcnRlcmAgdG8gY29udHJvbCB0aGUgY29udGVudHMgb2YgeW91ciB7QGxpbmsgUGF5bG9hZH1zLiBDb21tb24gcmVhc29ucyBmb3IgdXNpbmcgYSBjdXN0b21cbiAqIGBEYXRhQ29udmVydGVyYCBhcmU6XG4gKiAtIENvbnZlcnRpbmcgdmFsdWVzIHRoYXQgYXJlIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGRlZmF1bHQgYERhdGFDb252ZXJ0ZXJgIChmb3IgZXhhbXBsZSwgYEpTT04uc3RyaW5naWZ5KClgIGRvZXNuJ3RcbiAqICAgaGFuZGxlIGBCaWdJbnRgcywgc28gaWYgeW91IHdhbnQgdG8gcmV0dXJuIGB7IHRvdGFsOiAxMDAwbiB9YCBmcm9tIGEgV29ya2Zsb3csIFNpZ25hbCwgb3IgQWN0aXZpdHksIHlvdSBuZWVkIHlvdXJcbiAqICAgb3duIGBEYXRhQ29udmVydGVyYCkuXG4gKiAtIEVuY3J5cHRpbmcgdmFsdWVzIHRoYXQgbWF5IGNvbnRhaW4gcHJpdmF0ZSBpbmZvcm1hdGlvbiB0aGF0IHlvdSBkb24ndCB3YW50IHN0b3JlZCBpbiBwbGFpbnRleHQgaW4gVGVtcG9yYWwgU2VydmVyJ3NcbiAqICAgZGF0YWJhc2UuXG4gKiAtIENvbXByZXNzaW5nIHZhbHVlcyB0byByZWR1Y2UgZGlzayBvciBuZXR3b3JrIHVzYWdlLlxuICpcbiAqIFRvIHVzZSB5b3VyIGN1c3RvbSBgRGF0YUNvbnZlcnRlcmAsIHByb3ZpZGUgaXQgdG8gdGhlIHtAbGluayBXb3JrZmxvd0NsaWVudH0sIHtAbGluayBXb3JrZXJ9LCBhbmRcbiAqIHtAbGluayBidW5kbGVXb3JrZmxvd0NvZGV9IChpZiB5b3UgdXNlIGl0KTpcbiAqIC0gYG5ldyBXb3JrZmxvd0NsaWVudCh7IC4uLiwgZGF0YUNvbnZlcnRlciB9KWBcbiAqIC0gYFdvcmtlci5jcmVhdGUoeyAuLi4sIGRhdGFDb252ZXJ0ZXIgfSlgXG4gKiAtIGBidW5kbGVXb3JrZmxvd0NvZGUoeyAuLi4sIHBheWxvYWRDb252ZXJ0ZXJQYXRoIH0pYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIERhdGFDb252ZXJ0ZXIge1xuICAvKipcbiAgICogUGF0aCBvZiBhIGZpbGUgdGhhdCBoYXMgYSBgcGF5bG9hZENvbnZlcnRlcmAgbmFtZWQgZXhwb3J0LlxuICAgKiBgcGF5bG9hZENvbnZlcnRlcmAgc2hvdWxkIGJlIGFuIG9iamVjdCB0aGF0IGltcGxlbWVudHMge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJ9LlxuICAgKiBJZiBubyBwYXRoIGlzIHByb3ZpZGVkLCB7QGxpbmsgZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXJ9IGlzIHVzZWQuXG4gICAqL1xuICBwYXlsb2FkQ29udmVydGVyUGF0aD86IHN0cmluZztcblxuICAvKipcbiAgICogUGF0aCBvZiBhIGZpbGUgdGhhdCBoYXMgYSBgZmFpbHVyZUNvbnZlcnRlcmAgbmFtZWQgZXhwb3J0LlxuICAgKiBgZmFpbHVyZUNvbnZlcnRlcmAgc2hvdWxkIGJlIGFuIG9iamVjdCB0aGF0IGltcGxlbWVudHMge0BsaW5rIEZhaWx1cmVDb252ZXJ0ZXJ9LlxuICAgKiBJZiBubyBwYXRoIGlzIHByb3ZpZGVkLCB7QGxpbmsgZGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJ9IGlzIHVzZWQuXG4gICAqL1xuICBmYWlsdXJlQ29udmVydGVyUGF0aD86IHN0cmluZztcblxuICAvKipcbiAgICogQW4gYXJyYXkgb2Yge0BsaW5rIFBheWxvYWRDb2RlY30gaW5zdGFuY2VzLlxuICAgKlxuICAgKiBQYXlsb2FkcyBhcmUgZW5jb2RlZCBpbiB0aGUgb3JkZXIgb2YgdGhlIGFycmF5IGFuZCBkZWNvZGVkIGluIHRoZSBvcHBvc2l0ZSBvcmRlci4gRm9yIGV4YW1wbGUsIGlmIHlvdSBoYXZlIGFcbiAgICogY29tcHJlc3Npb24gY29kZWMgYW5kIGFuIGVuY3J5cHRpb24gY29kZWMsIHRoZW4geW91IHdhbnQgZGF0YSB0byBiZSBlbmNvZGVkIHdpdGggdGhlIGNvbXByZXNzaW9uIGNvZGVjIGZpcnN0LCBzb1xuICAgKiB5b3UnZCBkbyBgcGF5bG9hZENvZGVjczogW2NvbXByZXNzaW9uQ29kZWMsIGVuY3J5cHRpb25Db2RlY11gLlxuICAgKi9cbiAgcGF5bG9hZENvZGVjcz86IFBheWxvYWRDb2RlY1tdO1xufVxuXG4vKipcbiAqIEEge0BsaW5rIERhdGFDb252ZXJ0ZXJ9IHRoYXQgaGFzIGJlZW4gbG9hZGVkIHZpYSB7QGxpbmsgbG9hZERhdGFDb252ZXJ0ZXJ9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvYWRlZERhdGFDb252ZXJ0ZXIge1xuICBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyO1xuICBmYWlsdXJlQ29udmVydGVyOiBGYWlsdXJlQ29udmVydGVyO1xuICBwYXlsb2FkQ29kZWNzOiBQYXlsb2FkQ29kZWNbXTtcbn1cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCB7QGxpbmsgRmFpbHVyZUNvbnZlcnRlcn0gdXNlZCBieSB0aGUgU0RLLlxuICpcbiAqIEVycm9yIG1lc3NhZ2VzIGFuZCBzdGFjayB0cmFjZXMgYXJlIHNlcml6YWxpemVkIGFzIHBsYWluIHRleHQuXG4gKi9cbmV4cG9ydCBjb25zdCBkZWZhdWx0RmFpbHVyZUNvbnZlcnRlcjogRmFpbHVyZUNvbnZlcnRlciA9IG5ldyBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlcigpO1xuXG4vKipcbiAqIEEgXCJsb2FkZWRcIiBkYXRhIGNvbnZlcnRlciB0aGF0IHVzZXMgdGhlIGRlZmF1bHQgc2V0IG9mIGZhaWx1cmUgYW5kIHBheWxvYWQgY29udmVydGVycy5cbiAqL1xuZXhwb3J0IGNvbnN0IGRlZmF1bHREYXRhQ29udmVydGVyOiBMb2FkZWREYXRhQ29udmVydGVyID0ge1xuICBwYXlsb2FkQ29udmVydGVyOiBkZWZhdWx0UGF5bG9hZENvbnZlcnRlcixcbiAgZmFpbHVyZUNvbnZlcnRlcjogZGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXIsXG4gIHBheWxvYWRDb2RlY3M6IFtdLFxufTtcbiIsImltcG9ydCB7XG4gIEFjdGl2aXR5RmFpbHVyZSxcbiAgQXBwbGljYXRpb25GYWlsdXJlLFxuICBDYW5jZWxsZWRGYWlsdXJlLFxuICBDaGlsZFdvcmtmbG93RmFpbHVyZSxcbiAgRkFJTFVSRV9TT1VSQ0UsXG4gIFByb3RvRmFpbHVyZSxcbiAgUmV0cnlTdGF0ZSxcbiAgU2VydmVyRmFpbHVyZSxcbiAgVGVtcG9yYWxGYWlsdXJlLFxuICBUZXJtaW5hdGVkRmFpbHVyZSxcbiAgVGltZW91dEZhaWx1cmUsXG4gIFRpbWVvdXRUeXBlLFxufSBmcm9tICcuLi9mYWlsdXJlJztcbmltcG9ydCB7IGlzRXJyb3IgfSBmcm9tICcuLi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHsgYXJyYXlGcm9tUGF5bG9hZHMsIGZyb21QYXlsb2Fkc0F0SW5kZXgsIFBheWxvYWRDb252ZXJ0ZXIsIHRvUGF5bG9hZHMgfSBmcm9tICcuL3BheWxvYWQtY29udmVydGVyJztcblxuZnVuY3Rpb24gY29tYmluZVJlZ0V4cCguLi5yZWdleHBzOiBSZWdFeHBbXSk6IFJlZ0V4cCB7XG4gIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4cHMubWFwKCh4KSA9PiBgKD86JHt4LnNvdXJjZX0pYCkuam9pbignfCcpKTtcbn1cblxuLyoqXG4gKiBTdGFjayB0cmFjZXMgd2lsbCBiZSBjdXRvZmYgd2hlbiBvbiBvZiB0aGVzZSBwYXR0ZXJucyBpcyBtYXRjaGVkXG4gKi9cbmNvbnN0IENVVE9GRl9TVEFDS19QQVRURVJOUyA9IGNvbWJpbmVSZWdFeHAoXG4gIC8qKiBBY3Rpdml0eSBleGVjdXRpb24gKi9cbiAgL1xccythdCBBY3Rpdml0eVxcLmV4ZWN1dGUgXFwoLipbXFxcXC9dd29ya2VyW1xcXFwvXSg/OnNyY3xsaWIpW1xcXFwvXWFjdGl2aXR5XFwuW2p0XXM6XFxkKzpcXGQrXFwpLyxcbiAgLyoqIFdvcmtmbG93IGFjdGl2YXRpb24gKi9cbiAgL1xccythdCBBY3RpdmF0b3JcXC5cXFMrTmV4dEhhbmRsZXIgXFwoLipbXFxcXC9dd29ya2Zsb3dbXFxcXC9dKD86c3JjfGxpYilbXFxcXC9daW50ZXJuYWxzXFwuW2p0XXM6XFxkKzpcXGQrXFwpLyxcbiAgLyoqIFdvcmtmbG93IHJ1biBhbnl0aGluZyBpbiBjb250ZXh0ICovXG4gIC9cXHMrYXQgU2NyaXB0XFwucnVuSW5Db250ZXh0IFxcKCg/Om5vZGU6dm18dm1cXC5qcyk6XFxkKzpcXGQrXFwpL1xuKTtcblxuLyoqXG4gKiBBbnkgc3RhY2sgdHJhY2UgZnJhbWVzIHRoYXQgbWF0Y2ggYW55IG9mIHRob3NlIHdpbCBiZSBkb3BwZWQuXG4gKiBUaGUgXCJudWxsLlwiIHByZWZpeCBvbiBzb21lIGNhc2VzIGlzIHRvIGF2b2lkIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9pc3N1ZXMvNDI0MTdcbiAqL1xuY29uc3QgRFJPUFBFRF9TVEFDS19GUkFNRVNfUEFUVEVSTlMgPSBjb21iaW5lUmVnRXhwKFxuICAvKiogSW50ZXJuYWwgZnVuY3Rpb25zIHVzZWQgdG8gcmVjdXJzaXZlbHkgY2hhaW4gaW50ZXJjZXB0b3JzICovXG4gIC9cXHMrYXQgKG51bGxcXC4pP25leHQgXFwoLipbXFxcXC9dY29tbW9uW1xcXFwvXSg/OnNyY3xsaWIpW1xcXFwvXWludGVyY2VwdG9yc1xcLltqdF1zOlxcZCs6XFxkK1xcKS8sXG4gIC8qKiBJbnRlcm5hbCBmdW5jdGlvbnMgdXNlZCB0byByZWN1cnNpdmVseSBjaGFpbiBpbnRlcmNlcHRvcnMgKi9cbiAgL1xccythdCAobnVsbFxcLik/ZXhlY3V0ZU5leHRIYW5kbGVyIFxcKC4qW1xcXFwvXXdvcmtlcltcXFxcL10oPzpzcmN8bGliKVtcXFxcL11hY3Rpdml0eVxcLltqdF1zOlxcZCs6XFxkK1xcKS9cbik7XG5cbi8qKlxuICogQ3V0cyBvdXQgdGhlIGZyYW1ld29yayBwYXJ0IG9mIGEgc3RhY2sgdHJhY2UsIGxlYXZpbmcgb25seSB1c2VyIGNvZGUgZW50cmllc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3V0b2ZmU3RhY2tUcmFjZShzdGFjaz86IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGxpbmVzID0gKHN0YWNrID8/ICcnKS5zcGxpdCgvXFxyP1xcbi8pO1xuICBjb25zdCBhY2MgPSBBcnJheTxzdHJpbmc+KCk7XG4gIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgIGlmIChDVVRPRkZfU1RBQ0tfUEFUVEVSTlMudGVzdChsaW5lKSkgYnJlYWs7XG4gICAgaWYgKCFEUk9QUEVEX1NUQUNLX0ZSQU1FU19QQVRURVJOUy50ZXN0KGxpbmUpKSBhY2MucHVzaChsaW5lKTtcbiAgfVxuICByZXR1cm4gYWNjLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIEEgYEZhaWx1cmVDb252ZXJ0ZXJgIGlzIHJlc3BvbnNpYmxlIGZvciBjb252ZXJ0aW5nIGZyb20gcHJvdG8gYEZhaWx1cmVgIGluc3RhbmNlcyB0byBKUyBgRXJyb3JzYCBhbmQgYmFjay5cbiAqXG4gKiBXZSByZWNvbW1lbmRlZCB1c2luZyB0aGUge0BsaW5rIERlZmF1bHRGYWlsdXJlQ29udmVydGVyfSBpbnN0ZWFkIG9mIGN1c3RvbWl6aW5nIHRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIGluIG9yZGVyXG4gKiB0byBtYWludGFpbiBjcm9zcy1sYW5ndWFnZSBGYWlsdXJlIHNlcmlhbGl6YXRpb24gY29tcGF0aWJpbGl0eS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBGYWlsdXJlQ29udmVydGVyIHtcbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgY2F1Z2h0IGVycm9yIHRvIGEgRmFpbHVyZSBwcm90byBtZXNzYWdlLlxuICAgKi9cbiAgZXJyb3JUb0ZhaWx1cmUoZXJyOiB1bmtub3duLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogUHJvdG9GYWlsdXJlO1xuICAvKipcbiAgICogQ29udmVydHMgYSBGYWlsdXJlIHByb3RvIG1lc3NhZ2UgdG8gYSBKUyBFcnJvciBvYmplY3QuXG4gICAqXG4gICAqIFRoZSByZXR1cm5lZCBlcnJvciBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIGBUZW1wb3JhbEZhaWx1cmVgLlxuICAgKi9cbiAgZmFpbHVyZVRvRXJyb3IoZXJyOiBQcm90b0ZhaWx1cmUsIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBUZW1wb3JhbEZhaWx1cmU7XG59XG5cbi8qKlxuICogVGhlIFwic2hhcGVcIiBvZiB0aGUgYXR0cmlidXRlcyBzZXQgYXMgdGhlIHtAbGluayBQcm90b0ZhaWx1cmUuZW5jb2RlZEF0dHJpYnV0ZXN9IHBheWxvYWQgaW4gY2FzZVxuICoge0BsaW5rIERlZmF1bHRFbmNvZGVkRmFpbHVyZUF0dHJpYnV0ZXMuZW5jb2RlQ29tbW9uQXR0cmlidXRlc30gaXMgc2V0IHRvIGB0cnVlYC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZWZhdWx0RW5jb2RlZEZhaWx1cmVBdHRyaWJ1dGVzIHtcbiAgbWVzc2FnZTogc3RyaW5nO1xuICBzdGFja190cmFjZTogc3RyaW5nO1xufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIHRoZSB7QGxpbmsgRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJ9IGNvbnN0cnVjdG9yLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIERlZmF1bHRGYWlsdXJlQ29udmVydGVyT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIGVuY29kZSBlcnJvciBtZXNzYWdlcyBhbmQgc3RhY2sgdHJhY2VzIChmb3IgZW5jcnlwdGluZyB0aGVzZSBhdHRyaWJ1dGVzIHVzZSBhIHtAbGluayBQYXlsb2FkQ29kZWN9KS5cbiAgICovXG4gIGVuY29kZUNvbW1vbkF0dHJpYnV0ZXM6IGJvb2xlYW47XG59XG5cbi8qKlxuICogRGVmYXVsdCwgY3Jvc3MtbGFuZ3VhZ2UtY29tcGF0aWJsZSBGYWlsdXJlIGNvbnZlcnRlci5cbiAqXG4gKiBCeSBkZWZhdWx0LCBpdCB3aWxsIGxlYXZlIGVycm9yIG1lc3NhZ2VzIGFuZCBzdGFjayB0cmFjZXMgYXMgcGxhaW4gdGV4dC4gSW4gb3JkZXIgdG8gZW5jcnlwdCB0aGVtLCBzZXRcbiAqIGBlbmNvZGVDb21tb25BdHRyaWJ1dGVzYCB0byBgdHJ1ZWAgaW4gdGhlIGNvbnN0cnVjdG9yIG9wdGlvbnMgYW5kIHVzZSBhIHtAbGluayBQYXlsb2FkQ29kZWN9IHRoYXQgY2FuIGVuY3J5cHQgL1xuICogZGVjcnlwdCBQYXlsb2FkcyBpbiB5b3VyIHtAbGluayBXb3JrZXJPcHRpb25zLmRhdGFDb252ZXJ0ZXIgfCBXb3JrZXJ9IGFuZFxuICoge0BsaW5rIENsaWVudE9wdGlvbnMuZGF0YUNvbnZlcnRlciB8IENsaWVudCBvcHRpb25zfS5cbiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRGYWlsdXJlQ29udmVydGVyIGltcGxlbWVudHMgRmFpbHVyZUNvbnZlcnRlciB7XG4gIHB1YmxpYyByZWFkb25seSBvcHRpb25zOiBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlck9wdGlvbnM7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IFBhcnRpYWw8RGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJPcHRpb25zPikge1xuICAgIGNvbnN0IHsgZW5jb2RlQ29tbW9uQXR0cmlidXRlcyB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICBlbmNvZGVDb21tb25BdHRyaWJ1dGVzOiBlbmNvZGVDb21tb25BdHRyaWJ1dGVzID8/IGZhbHNlLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSBGYWlsdXJlIHByb3RvIG1lc3NhZ2UgdG8gYSBKUyBFcnJvciBvYmplY3QuXG4gICAqXG4gICAqIERvZXMgbm90IHNldCBjb21tb24gcHJvcGVydGllcywgdGhhdCBpcyBkb25lIGluIHtAbGluayBmYWlsdXJlVG9FcnJvcn0uXG4gICAqL1xuICBmYWlsdXJlVG9FcnJvcklubmVyKGZhaWx1cmU6IFByb3RvRmFpbHVyZSwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFRlbXBvcmFsRmFpbHVyZSB7XG4gICAgaWYgKGZhaWx1cmUuYXBwbGljYXRpb25GYWlsdXJlSW5mbykge1xuICAgICAgcmV0dXJuIG5ldyBBcHBsaWNhdGlvbkZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIGZhaWx1cmUuYXBwbGljYXRpb25GYWlsdXJlSW5mby50eXBlLFxuICAgICAgICBCb29sZWFuKGZhaWx1cmUuYXBwbGljYXRpb25GYWlsdXJlSW5mby5ub25SZXRyeWFibGUpLFxuICAgICAgICBhcnJheUZyb21QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCBmYWlsdXJlLmFwcGxpY2F0aW9uRmFpbHVyZUluZm8uZGV0YWlscz8ucGF5bG9hZHMpLFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUuc2VydmVyRmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgU2VydmVyRmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgQm9vbGVhbihmYWlsdXJlLnNlcnZlckZhaWx1cmVJbmZvLm5vblJldHJ5YWJsZSksXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS50aW1lb3V0RmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgVGltZW91dEZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIGZyb21QYXlsb2Fkc0F0SW5kZXgocGF5bG9hZENvbnZlcnRlciwgMCwgZmFpbHVyZS50aW1lb3V0RmFpbHVyZUluZm8ubGFzdEhlYXJ0YmVhdERldGFpbHM/LnBheWxvYWRzKSxcbiAgICAgICAgZmFpbHVyZS50aW1lb3V0RmFpbHVyZUluZm8udGltZW91dFR5cGUgPz8gVGltZW91dFR5cGUuVElNRU9VVF9UWVBFX1VOU1BFQ0lGSUVEXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS50ZXJtaW5hdGVkRmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgVGVybWluYXRlZEZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS5jYW5jZWxlZEZhaWx1cmVJbmZvKSB7XG4gICAgICByZXR1cm4gbmV3IENhbmNlbGxlZEZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIGFycmF5RnJvbVBheWxvYWRzKHBheWxvYWRDb252ZXJ0ZXIsIGZhaWx1cmUuY2FuY2VsZWRGYWlsdXJlSW5mby5kZXRhaWxzPy5wYXlsb2FkcyksXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS5yZXNldFdvcmtmbG93RmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgQXBwbGljYXRpb25GYWlsdXJlKFxuICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICAnUmVzZXRXb3JrZmxvdycsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBhcnJheUZyb21QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCBmYWlsdXJlLnJlc2V0V29ya2Zsb3dGYWlsdXJlSW5mby5sYXN0SGVhcnRiZWF0RGV0YWlscz8ucGF5bG9hZHMpLFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUuY2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWx1cmVJbmZvKSB7XG4gICAgICBjb25zdCB7IG5hbWVzcGFjZSwgd29ya2Zsb3dUeXBlLCB3b3JrZmxvd0V4ZWN1dGlvbiwgcmV0cnlTdGF0ZSB9ID0gZmFpbHVyZS5jaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbHVyZUluZm87XG4gICAgICBpZiAoISh3b3JrZmxvd1R5cGU/Lm5hbWUgJiYgd29ya2Zsb3dFeGVjdXRpb24pKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYXR0cmlidXRlcyBvbiBjaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbHVyZUluZm8nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgQ2hpbGRXb3JrZmxvd0ZhaWx1cmUoXG4gICAgICAgIG5hbWVzcGFjZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIHdvcmtmbG93RXhlY3V0aW9uLFxuICAgICAgICB3b3JrZmxvd1R5cGUubmFtZSxcbiAgICAgICAgcmV0cnlTdGF0ZSA/PyBSZXRyeVN0YXRlLlJFVFJZX1NUQVRFX1VOU1BFQ0lGSUVELFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUuYWN0aXZpdHlGYWlsdXJlSW5mbykge1xuICAgICAgaWYgKCFmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8uYWN0aXZpdHlUeXBlPy5uYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYWN0aXZpdHlUeXBlPy5uYW1lIG9uIGFjdGl2aXR5RmFpbHVyZUluZm8nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgQWN0aXZpdHlGYWlsdXJlKFxuICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICBmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8uYWN0aXZpdHlUeXBlLm5hbWUsXG4gICAgICAgIGZhaWx1cmUuYWN0aXZpdHlGYWlsdXJlSW5mby5hY3Rpdml0eUlkID8/IHVuZGVmaW5lZCxcbiAgICAgICAgZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvLnJldHJ5U3RhdGUgPz8gUmV0cnlTdGF0ZS5SRVRSWV9TVEFURV9VTlNQRUNJRklFRCxcbiAgICAgICAgZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvLmlkZW50aXR5ID8/IHVuZGVmaW5lZCxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVtcG9yYWxGYWlsdXJlKFxuICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgKTtcbiAgfVxuXG4gIGZhaWx1cmVUb0Vycm9yKGZhaWx1cmU6IFByb3RvRmFpbHVyZSwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFRlbXBvcmFsRmFpbHVyZSB7XG4gICAgaWYgKGZhaWx1cmUuZW5jb2RlZEF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IGF0dHJzID0gcGF5bG9hZENvbnZlcnRlci5mcm9tUGF5bG9hZDxEZWZhdWx0RW5jb2RlZEZhaWx1cmVBdHRyaWJ1dGVzPihmYWlsdXJlLmVuY29kZWRBdHRyaWJ1dGVzKTtcbiAgICAgIC8vIERvbid0IGFwcGx5IGVuY29kZWRBdHRyaWJ1dGVzIHVubGVzcyB0aGV5IGNvbmZvcm0gdG8gYW4gZXhwZWN0ZWQgc2NoZW1hXG4gICAgICBpZiAodHlwZW9mIGF0dHJzID09PSAnb2JqZWN0JyAmJiBhdHRycyAhPT0gbnVsbCkge1xuICAgICAgICBjb25zdCB7IG1lc3NhZ2UsIHN0YWNrX3RyYWNlIH0gPSBhdHRycztcbiAgICAgICAgLy8gQXZvaWQgbXV0YXRpbmcgdGhlIGFyZ3VtZW50XG4gICAgICAgIGZhaWx1cmUgPSB7IC4uLmZhaWx1cmUgfTtcbiAgICAgICAgaWYgKHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGZhaWx1cmUubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBzdGFja190cmFjZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBmYWlsdXJlLnN0YWNrVHJhY2UgPSBzdGFja190cmFjZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBlcnIgPSB0aGlzLmZhaWx1cmVUb0Vycm9ySW5uZXIoZmFpbHVyZSwgcGF5bG9hZENvbnZlcnRlcik7XG4gICAgZXJyLnN0YWNrID0gZmFpbHVyZS5zdGFja1RyYWNlID8/ICcnO1xuICAgIGVyci5mYWlsdXJlID0gZmFpbHVyZTtcbiAgICByZXR1cm4gZXJyO1xuICB9XG5cbiAgZXJyb3JUb0ZhaWx1cmUoZXJyOiB1bmtub3duLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogUHJvdG9GYWlsdXJlIHtcbiAgICBjb25zdCBmYWlsdXJlID0gdGhpcy5lcnJvclRvRmFpbHVyZUlubmVyKGVyciwgcGF5bG9hZENvbnZlcnRlcik7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lbmNvZGVDb21tb25BdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCB7IG1lc3NhZ2UsIHN0YWNrVHJhY2UgfSA9IGZhaWx1cmU7XG4gICAgICBmYWlsdXJlLm1lc3NhZ2UgPSAnRW5jb2RlZCBmYWlsdXJlJztcbiAgICAgIGZhaWx1cmUuc3RhY2tUcmFjZSA9ICcnO1xuICAgICAgZmFpbHVyZS5lbmNvZGVkQXR0cmlidXRlcyA9IHBheWxvYWRDb252ZXJ0ZXIudG9QYXlsb2FkKHsgbWVzc2FnZSwgc3RhY2tfdHJhY2U6IHN0YWNrVHJhY2UgfSk7XG4gICAgfVxuICAgIHJldHVybiBmYWlsdXJlO1xuICB9XG5cbiAgZXJyb3JUb0ZhaWx1cmVJbm5lcihlcnI6IHVua25vd24sIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBQcm90b0ZhaWx1cmUge1xuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBUZW1wb3JhbEZhaWx1cmUpIHtcbiAgICAgIGlmIChlcnIuZmFpbHVyZSkgcmV0dXJuIGVyci5mYWlsdXJlO1xuICAgICAgY29uc3QgYmFzZSA9IHtcbiAgICAgICAgbWVzc2FnZTogZXJyLm1lc3NhZ2UsXG4gICAgICAgIHN0YWNrVHJhY2U6IGN1dG9mZlN0YWNrVHJhY2UoZXJyLnN0YWNrKSxcbiAgICAgICAgY2F1c2U6IHRoaXMub3B0aW9uYWxFcnJvclRvT3B0aW9uYWxGYWlsdXJlKGVyci5jYXVzZSwgcGF5bG9hZENvbnZlcnRlciksXG4gICAgICAgIHNvdXJjZTogRkFJTFVSRV9TT1VSQ0UsXG4gICAgICB9O1xuXG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgQWN0aXZpdHlGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICBhY3Rpdml0eUZhaWx1cmVJbmZvOiB7XG4gICAgICAgICAgICAuLi5lcnIsXG4gICAgICAgICAgICBhY3Rpdml0eVR5cGU6IHsgbmFtZTogZXJyLmFjdGl2aXR5VHlwZSB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgQ2hpbGRXb3JrZmxvd0ZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIGNoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsdXJlSW5mbzoge1xuICAgICAgICAgICAgLi4uZXJyLFxuICAgICAgICAgICAgd29ya2Zsb3dFeGVjdXRpb246IGVyci5leGVjdXRpb24sXG4gICAgICAgICAgICB3b3JrZmxvd1R5cGU6IHsgbmFtZTogZXJyLndvcmtmbG93VHlwZSB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgQXBwbGljYXRpb25GYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICBhcHBsaWNhdGlvbkZhaWx1cmVJbmZvOiB7XG4gICAgICAgICAgICB0eXBlOiBlcnIudHlwZSxcbiAgICAgICAgICAgIG5vblJldHJ5YWJsZTogZXJyLm5vblJldHJ5YWJsZSxcbiAgICAgICAgICAgIGRldGFpbHM6XG4gICAgICAgICAgICAgIGVyci5kZXRhaWxzICYmIGVyci5kZXRhaWxzLmxlbmd0aFxuICAgICAgICAgICAgICAgID8geyBwYXlsb2FkczogdG9QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCAuLi5lcnIuZGV0YWlscykgfVxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgQ2FuY2VsbGVkRmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgY2FuY2VsZWRGYWlsdXJlSW5mbzoge1xuICAgICAgICAgICAgZGV0YWlsczpcbiAgICAgICAgICAgICAgZXJyLmRldGFpbHMgJiYgZXJyLmRldGFpbHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgPyB7IHBheWxvYWRzOiB0b1BheWxvYWRzKHBheWxvYWRDb252ZXJ0ZXIsIC4uLmVyci5kZXRhaWxzKSB9XG4gICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBUaW1lb3V0RmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgdGltZW91dEZhaWx1cmVJbmZvOiB7XG4gICAgICAgICAgICB0aW1lb3V0VHlwZTogZXJyLnRpbWVvdXRUeXBlLFxuICAgICAgICAgICAgbGFzdEhlYXJ0YmVhdERldGFpbHM6IGVyci5sYXN0SGVhcnRiZWF0RGV0YWlsc1xuICAgICAgICAgICAgICA/IHsgcGF5bG9hZHM6IHRvUGF5bG9hZHMocGF5bG9hZENvbnZlcnRlciwgZXJyLmxhc3RIZWFydGJlYXREZXRhaWxzKSB9XG4gICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgU2VydmVyRmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgc2VydmVyRmFpbHVyZUluZm86IHsgbm9uUmV0cnlhYmxlOiBlcnIubm9uUmV0cnlhYmxlIH0sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgVGVybWluYXRlZEZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIHRlcm1pbmF0ZWRGYWlsdXJlSW5mbzoge30sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICAvLyBKdXN0IGEgVGVtcG9yYWxGYWlsdXJlXG4gICAgICByZXR1cm4gYmFzZTtcbiAgICB9XG5cbiAgICBjb25zdCBiYXNlID0ge1xuICAgICAgc291cmNlOiBGQUlMVVJFX1NPVVJDRSxcbiAgICB9O1xuXG4gICAgaWYgKGlzRXJyb3IoZXJyKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgbWVzc2FnZTogU3RyaW5nKGVyci5tZXNzYWdlKSA/PyAnJyxcbiAgICAgICAgc3RhY2tUcmFjZTogY3V0b2ZmU3RhY2tUcmFjZShlcnIuc3RhY2spLFxuICAgICAgICBjYXVzZTogdGhpcy5vcHRpb25hbEVycm9yVG9PcHRpb25hbEZhaWx1cmUoKGVyciBhcyBhbnkpLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgcmVjb21tZW5kYXRpb24gPSBgIFtBIG5vbi1FcnJvciB2YWx1ZSB3YXMgdGhyb3duIGZyb20geW91ciBjb2RlLiBXZSByZWNvbW1lbmQgdGhyb3dpbmcgRXJyb3Igb2JqZWN0cyBzbyB0aGF0IHdlIGNhbiBwcm92aWRlIGEgc3RhY2sgdHJhY2VdYDtcblxuICAgIGlmICh0eXBlb2YgZXJyID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHsgLi4uYmFzZSwgbWVzc2FnZTogZXJyICsgcmVjb21tZW5kYXRpb24gfTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBlcnIgPT09ICdvYmplY3QnKSB7XG4gICAgICBsZXQgbWVzc2FnZSA9ICcnO1xuICAgICAgdHJ5IHtcbiAgICAgICAgbWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KGVycik7XG4gICAgICB9IGNhdGNoIChfZXJyKSB7XG4gICAgICAgIG1lc3NhZ2UgPSBTdHJpbmcoZXJyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IC4uLmJhc2UsIG1lc3NhZ2U6IG1lc3NhZ2UgKyByZWNvbW1lbmRhdGlvbiB9O1xuICAgIH1cblxuICAgIHJldHVybiB7IC4uLmJhc2UsIG1lc3NhZ2U6IFN0cmluZyhlcnIpICsgcmVjb21tZW5kYXRpb24gfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIEZhaWx1cmUgcHJvdG8gbWVzc2FnZSB0byBhIEpTIEVycm9yIG9iamVjdCBpZiBkZWZpbmVkIG9yIHJldHVybnMgdW5kZWZpbmVkLlxuICAgKi9cbiAgb3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKFxuICAgIGZhaWx1cmU6IFByb3RvRmFpbHVyZSB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlclxuICApOiBUZW1wb3JhbEZhaWx1cmUgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiBmYWlsdXJlID8gdGhpcy5mYWlsdXJlVG9FcnJvcihmYWlsdXJlLCBwYXlsb2FkQ29udmVydGVyKSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhbiBlcnJvciB0byBhIEZhaWx1cmUgcHJvdG8gbWVzc2FnZSBpZiBkZWZpbmVkIG9yIHJldHVybnMgdW5kZWZpbmVkXG4gICAqL1xuICBvcHRpb25hbEVycm9yVG9PcHRpb25hbEZhaWx1cmUoZXJyOiB1bmtub3duLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogUHJvdG9GYWlsdXJlIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gZXJyID8gdGhpcy5lcnJvclRvRmFpbHVyZShlcnIsIHBheWxvYWRDb252ZXJ0ZXIpIDogdW5kZWZpbmVkO1xuICB9XG59XG4iLCJpbXBvcnQgeyBQYXlsb2FkIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5cbi8qKlxuICogYFBheWxvYWRDb2RlY2AgaXMgYW4gb3B0aW9uYWwgc3RlcCB0aGF0IGhhcHBlbnMgYmV0d2VlbiB0aGUgd2lyZSBhbmQgdGhlIHtAbGluayBQYXlsb2FkQ29udmVydGVyfTpcbiAqXG4gKiBUZW1wb3JhbCBTZXJ2ZXIgPC0tPiBXaXJlIDwtLT4gYFBheWxvYWRDb2RlY2AgPC0tPiBgUGF5bG9hZENvbnZlcnRlcmAgPC0tPiBVc2VyIGNvZGVcbiAqXG4gKiBJbXBsZW1lbnQgdGhpcyB0byB0cmFuc2Zvcm0gYW4gYXJyYXkgb2Yge0BsaW5rIFBheWxvYWR9cyB0by9mcm9tIHRoZSBmb3JtYXQgc2VudCBvdmVyIHRoZSB3aXJlIGFuZCBzdG9yZWQgYnkgVGVtcG9yYWwgU2VydmVyLlxuICogQ29tbW9uIHRyYW5zZm9ybWF0aW9ucyBhcmUgZW5jcnlwdGlvbiBhbmQgY29tcHJlc3Npb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGF5bG9hZENvZGVjIHtcbiAgLyoqXG4gICAqIEVuY29kZSBhbiBhcnJheSBvZiB7QGxpbmsgUGF5bG9hZH1zIGZvciBzZW5kaW5nIG92ZXIgdGhlIHdpcmUuXG4gICAqIEBwYXJhbSBwYXlsb2FkcyBNYXkgaGF2ZSBsZW5ndGggMC5cbiAgICovXG4gIGVuY29kZShwYXlsb2FkczogUGF5bG9hZFtdKTogUHJvbWlzZTxQYXlsb2FkW10+O1xuXG4gIC8qKlxuICAgKiBEZWNvZGUgYW4gYXJyYXkgb2Yge0BsaW5rIFBheWxvYWR9cyByZWNlaXZlZCBmcm9tIHRoZSB3aXJlLlxuICAgKi9cbiAgZGVjb2RlKHBheWxvYWRzOiBQYXlsb2FkW10pOiBQcm9taXNlPFBheWxvYWRbXT47XG59XG4iLCJpbXBvcnQgeyBkZWNvZGUsIGVuY29kZSB9IGZyb20gJy4uL2VuY29kaW5nJztcbmltcG9ydCB7IFBheWxvYWRDb252ZXJ0ZXJFcnJvciwgVmFsdWVFcnJvciB9IGZyb20gJy4uL2Vycm9ycyc7XG5pbXBvcnQgeyBQYXlsb2FkIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBlbmNvZGluZ0tleXMsIGVuY29kaW5nVHlwZXMsIE1FVEFEQVRBX0VOQ09ESU5HX0tFWSB9IGZyb20gJy4vdHlwZXMnO1xuXG4vKipcbiAqIFVzZWQgYnkgdGhlIGZyYW1ld29yayB0byBzZXJpYWxpemUvZGVzZXJpYWxpemUgZGF0YSBsaWtlIHBhcmFtZXRlcnMgYW5kIHJldHVybiB2YWx1ZXMuXG4gKlxuICogVGhpcyBpcyBjYWxsZWQgaW5zaWRlIHRoZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvZGV0ZXJtaW5pc20gfCBXb3JrZmxvdyBpc29sYXRlfS5cbiAqIFRvIHdyaXRlIGFzeW5jIGNvZGUgb3IgdXNlIE5vZGUgQVBJcyAob3IgdXNlIHBhY2thZ2VzIHRoYXQgdXNlIE5vZGUgQVBJcyksIHVzZSBhIHtAbGluayBQYXlsb2FkQ29kZWN9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBheWxvYWRDb252ZXJ0ZXIge1xuICAvKipcbiAgICogQ29udmVydHMgYSB2YWx1ZSB0byBhIHtAbGluayBQYXlsb2FkfS5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LiBFeGFtcGxlIHZhbHVlcyBpbmNsdWRlIHRoZSBXb3JrZmxvdyBhcmdzIHNlbnQgZnJvbSB0aGUgQ2xpZW50IGFuZCB0aGUgdmFsdWVzIHJldHVybmVkIGJ5IGEgV29ya2Zsb3cgb3IgQWN0aXZpdHkuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSB7QGxpbmsgUGF5bG9hZH0uXG4gICAqXG4gICAqIFNob3VsZCB0aHJvdyB7QGxpbmsgVmFsdWVFcnJvcn0gaWYgdW5hYmxlIHRvIGNvbnZlcnQuXG4gICAqL1xuICB0b1BheWxvYWQ8VD4odmFsdWU6IFQpOiBQYXlsb2FkO1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHtAbGluayBQYXlsb2FkfSBiYWNrIHRvIGEgdmFsdWUuXG4gICAqL1xuICBmcm9tUGF5bG9hZDxUPihwYXlsb2FkOiBQYXlsb2FkKTogVDtcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnRzIGNvbnZlcnNpb24gb2YgYSBsaXN0IG9mIHZhbHVlcy5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyXG4gKiBAcGFyYW0gdmFsdWVzIEpTIHZhbHVlcyB0byBjb252ZXJ0IHRvIFBheWxvYWRzXG4gKiBAcmV0dXJuIGxpc3Qgb2Yge0BsaW5rIFBheWxvYWR9c1xuICogQHRocm93cyB7QGxpbmsgVmFsdWVFcnJvcn0gaWYgY29udmVyc2lvbiBvZiB0aGUgdmFsdWUgcGFzc2VkIGFzIHBhcmFtZXRlciBmYWlsZWQgZm9yIGFueVxuICogICAgIHJlYXNvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvUGF5bG9hZHMoY29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyLCAuLi52YWx1ZXM6IHVua25vd25bXSk6IFBheWxvYWRbXSB8IHVuZGVmaW5lZCB7XG4gIGlmICh2YWx1ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiB2YWx1ZXMubWFwKCh2YWx1ZSkgPT4gY29udmVydGVyLnRvUGF5bG9hZCh2YWx1ZSkpO1xufVxuXG4vKipcbiAqIFJ1biB7QGxpbmsgUGF5bG9hZENvbnZlcnRlci50b1BheWxvYWR9IG9uIGVhY2ggdmFsdWUgaW4gdGhlIG1hcC5cbiAqXG4gKiBAdGhyb3dzIHtAbGluayBWYWx1ZUVycm9yfSBpZiBjb252ZXJzaW9uIG9mIGFueSB2YWx1ZSBpbiB0aGUgbWFwIGZhaWxzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXBUb1BheWxvYWRzPEsgZXh0ZW5kcyBzdHJpbmc+KGNvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlciwgbWFwOiBSZWNvcmQ8SywgYW55Pik6IFJlY29yZDxLLCBQYXlsb2FkPiB7XG4gIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMobWFwKS5tYXAoKFtrLCB2XSk6IFtLLCBQYXlsb2FkXSA9PiBbayBhcyBLLCBjb252ZXJ0ZXIudG9QYXlsb2FkKHYpXSlcbiAgKSBhcyBSZWNvcmQ8SywgUGF5bG9hZD47XG59XG5cbi8qKlxuICogSW1wbGVtZW50cyBjb252ZXJzaW9uIG9mIGFuIGFycmF5IG9mIHZhbHVlcyBvZiBkaWZmZXJlbnQgdHlwZXMuIFVzZWZ1bCBmb3IgZGVzZXJpYWxpemluZ1xuICogYXJndW1lbnRzIG9mIGZ1bmN0aW9uIGludm9jYXRpb25zLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJcbiAqIEBwYXJhbSBpbmRleCBpbmRleCBvZiB0aGUgdmFsdWUgaW4gdGhlIHBheWxvYWRzXG4gKiBAcGFyYW0gcGF5bG9hZHMgc2VyaWFsaXplZCB2YWx1ZSB0byBjb252ZXJ0IHRvIEpTIHZhbHVlcy5cbiAqIEByZXR1cm4gY29udmVydGVkIEpTIHZhbHVlXG4gKiBAdGhyb3dzIHtAbGluayBQYXlsb2FkQ29udmVydGVyRXJyb3J9IGlmIGNvbnZlcnNpb24gb2YgdGhlIGRhdGEgcGFzc2VkIGFzIHBhcmFtZXRlciBmYWlsZWQgZm9yIGFueVxuICogICAgIHJlYXNvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21QYXlsb2Fkc0F0SW5kZXg8VD4oY29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyLCBpbmRleDogbnVtYmVyLCBwYXlsb2Fkcz86IFBheWxvYWRbXSB8IG51bGwpOiBUIHtcbiAgLy8gVG8gbWFrZSBhZGRpbmcgYXJndW1lbnRzIGEgYmFja3dhcmRzIGNvbXBhdGlibGUgY2hhbmdlXG4gIGlmIChwYXlsb2FkcyA9PT0gdW5kZWZpbmVkIHx8IHBheWxvYWRzID09PSBudWxsIHx8IGluZGV4ID49IHBheWxvYWRzLmxlbmd0aCkge1xuICAgIHJldHVybiB1bmRlZmluZWQgYXMgYW55O1xuICB9XG4gIHJldHVybiBjb252ZXJ0ZXIuZnJvbVBheWxvYWQocGF5bG9hZHNbaW5kZXhdKTtcbn1cblxuLyoqXG4gKiBSdW4ge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXIuZnJvbVBheWxvYWR9IG9uIGVhY2ggdmFsdWUgaW4gdGhlIGFycmF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlGcm9tUGF5bG9hZHMoY29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyLCBwYXlsb2Fkcz86IFBheWxvYWRbXSB8IG51bGwpOiB1bmtub3duW10ge1xuICBpZiAoIXBheWxvYWRzKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIHJldHVybiBwYXlsb2Fkcy5tYXAoKHBheWxvYWQ6IFBheWxvYWQpID0+IGNvbnZlcnRlci5mcm9tUGF5bG9hZChwYXlsb2FkKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXBGcm9tUGF5bG9hZHM8SyBleHRlbmRzIHN0cmluZz4oXG4gIGNvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcixcbiAgbWFwPzogUmVjb3JkPEssIFBheWxvYWQ+IHwgbnVsbCB8IHVuZGVmaW5lZFxuKTogUmVjb3JkPEssIHVua25vd24+IHwgdW5kZWZpbmVkIHwgbnVsbCB7XG4gIGlmIChtYXAgPT0gbnVsbCkgcmV0dXJuIG1hcDtcbiAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICBPYmplY3QuZW50cmllcyhtYXApLm1hcCgoW2ssIHBheWxvYWRdKTogW0ssIHVua25vd25dID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gY29udmVydGVyLmZyb21QYXlsb2FkKHBheWxvYWQgYXMgUGF5bG9hZCk7XG4gICAgICByZXR1cm4gW2sgYXMgSywgdmFsdWVdO1xuICAgIH0pXG4gICkgYXMgUmVjb3JkPEssIHVua25vd24+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2Rpbmcge1xuICAvKipcbiAgICogQ29udmVydHMgYSB2YWx1ZSB0byBhIHtAbGluayBQYXlsb2FkfS5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LiBFeGFtcGxlIHZhbHVlcyBpbmNsdWRlIHRoZSBXb3JrZmxvdyBhcmdzIHNlbnQgZnJvbSB0aGUgQ2xpZW50IGFuZCB0aGUgdmFsdWVzIHJldHVybmVkIGJ5IGEgV29ya2Zsb3cgb3IgQWN0aXZpdHkuXG4gICAqIEByZXR1cm5zIFRoZSB7QGxpbmsgUGF5bG9hZH0sIG9yIGB1bmRlZmluZWRgIGlmIHVuYWJsZSB0byBjb252ZXJ0LlxuICAgKi9cbiAgdG9QYXlsb2FkPFQ+KHZhbHVlOiBUKTogUGF5bG9hZCB8IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogQ29udmVydHMgYSB7QGxpbmsgUGF5bG9hZH0gYmFjayB0byBhIHZhbHVlLlxuICAgKi9cbiAgZnJvbVBheWxvYWQ8VD4ocGF5bG9hZDogUGF5bG9hZCk6IFQ7XG5cbiAgcmVhZG9ubHkgZW5jb2RpbmdUeXBlOiBzdHJpbmc7XG59XG5cbi8qKlxuICogVHJpZXMgdG8gY29udmVydCB2YWx1ZXMgdG8ge0BsaW5rIFBheWxvYWR9cyB1c2luZyB0aGUge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2Rpbmd9cyBwcm92aWRlZCB0byB0aGUgY29uc3RydWN0b3IsIGluIHRoZSBvcmRlciBwcm92aWRlZC5cbiAqXG4gKiBDb252ZXJ0cyBQYXlsb2FkcyB0byB2YWx1ZXMgYmFzZWQgb24gdGhlIGBQYXlsb2FkLm1ldGFkYXRhLmVuY29kaW5nYCBmaWVsZCwgd2hpY2ggbWF0Y2hlcyB0aGUge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2RpbmcuZW5jb2RpbmdUeXBlfVxuICogb2YgdGhlIGNvbnZlcnRlciB0aGF0IGNyZWF0ZWQgdGhlIFBheWxvYWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb3NpdGVQYXlsb2FkQ29udmVydGVyIGltcGxlbWVudHMgUGF5bG9hZENvbnZlcnRlciB7XG4gIHJlYWRvbmx5IGNvbnZlcnRlcnM6IFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2RpbmdbXTtcbiAgcmVhZG9ubHkgY29udmVydGVyQnlFbmNvZGluZzogTWFwPHN0cmluZywgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZz4gPSBuZXcgTWFwKCk7XG5cbiAgY29uc3RydWN0b3IoLi4uY29udmVydGVyczogUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZ1tdKSB7XG4gICAgaWYgKGNvbnZlcnRlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgUGF5bG9hZENvbnZlcnRlckVycm9yKCdNdXN0IHByb3ZpZGUgYXQgbGVhc3Qgb25lIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2RpbmcnKTtcbiAgICB9XG5cbiAgICB0aGlzLmNvbnZlcnRlcnMgPSBjb252ZXJ0ZXJzO1xuICAgIGZvciAoY29uc3QgY29udmVydGVyIG9mIGNvbnZlcnRlcnMpIHtcbiAgICAgIHRoaXMuY29udmVydGVyQnlFbmNvZGluZy5zZXQoY29udmVydGVyLmVuY29kaW5nVHlwZSwgY29udmVydGVyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJpZXMgdG8gcnVuIGAudG9QYXlsb2FkKHZhbHVlKWAgb24gZWFjaCBjb252ZXJ0ZXIgaW4gdGhlIG9yZGVyIHByb3ZpZGVkIGF0IGNvbnN0cnVjdGlvbi5cbiAgICogUmV0dXJucyB0aGUgZmlyc3Qgc3VjY2Vzc2Z1bCByZXN1bHQsIHRocm93cyB7QGxpbmsgVmFsdWVFcnJvcn0gaWYgdGhlcmUgaXMgbm8gY29udmVydGVyIHRoYXQgY2FuIGhhbmRsZSB0aGUgdmFsdWUuXG4gICAqL1xuICBwdWJsaWMgdG9QYXlsb2FkPFQ+KHZhbHVlOiBUKTogUGF5bG9hZCB7XG4gICAgZm9yIChjb25zdCBjb252ZXJ0ZXIgb2YgdGhpcy5jb252ZXJ0ZXJzKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBjb252ZXJ0ZXIudG9QYXlsb2FkKHZhbHVlKTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKGBVbmFibGUgdG8gY29udmVydCAke3ZhbHVlfSB0byBwYXlsb2FkYCk7XG4gIH1cblxuICAvKipcbiAgICogUnVuIHtAbGluayBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nLmZyb21QYXlsb2FkfSBiYXNlZCBvbiB0aGUgYGVuY29kaW5nYCBtZXRhZGF0YSBvZiB0aGUge0BsaW5rIFBheWxvYWR9LlxuICAgKi9cbiAgcHVibGljIGZyb21QYXlsb2FkPFQ+KHBheWxvYWQ6IFBheWxvYWQpOiBUIHtcbiAgICBpZiAocGF5bG9hZC5tZXRhZGF0YSA9PT0gdW5kZWZpbmVkIHx8IHBheWxvYWQubWV0YWRhdGEgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdNaXNzaW5nIHBheWxvYWQgbWV0YWRhdGEnKTtcbiAgICB9XG4gICAgY29uc3QgZW5jb2RpbmcgPSBkZWNvZGUocGF5bG9hZC5tZXRhZGF0YVtNRVRBREFUQV9FTkNPRElOR19LRVldKTtcbiAgICBjb25zdCBjb252ZXJ0ZXIgPSB0aGlzLmNvbnZlcnRlckJ5RW5jb2RpbmcuZ2V0KGVuY29kaW5nKTtcbiAgICBpZiAoY29udmVydGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKGBVbmtub3duIGVuY29kaW5nOiAke2VuY29kaW5nfWApO1xuICAgIH1cbiAgICByZXR1cm4gY29udmVydGVyLmZyb21QYXlsb2FkKHBheWxvYWQpO1xuICB9XG59XG5cbi8qKlxuICogQ29udmVydHMgYmV0d2VlbiBKUyB1bmRlZmluZWQgYW5kIE5VTEwgUGF5bG9hZFxuICovXG5leHBvcnQgY2xhc3MgVW5kZWZpbmVkUGF5bG9hZENvbnZlcnRlciBpbXBsZW1lbnRzIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2Rpbmcge1xuICBwdWJsaWMgZW5jb2RpbmdUeXBlID0gZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19OVUxMO1xuXG4gIHB1YmxpYyB0b1BheWxvYWQodmFsdWU6IHVua25vd24pOiBQYXlsb2FkIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgW01FVEFEQVRBX0VOQ09ESU5HX0tFWV06IGVuY29kaW5nS2V5cy5NRVRBREFUQV9FTkNPRElOR19OVUxMLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGZyb21QYXlsb2FkPFQ+KF9jb250ZW50OiBQYXlsb2FkKTogVCB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZCBhcyBhbnk7IC8vIEp1c3QgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG59XG5cbi8qKlxuICogQ29udmVydHMgYmV0d2VlbiBiaW5hcnkgZGF0YSB0eXBlcyBhbmQgUkFXIFBheWxvYWRcbiAqL1xuZXhwb3J0IGNsYXNzIEJpbmFyeVBheWxvYWRDb252ZXJ0ZXIgaW1wbGVtZW50cyBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nIHtcbiAgcHVibGljIGVuY29kaW5nVHlwZSA9IGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfUkFXO1xuXG4gIHB1YmxpYyB0b1BheWxvYWQodmFsdWU6IHVua25vd24pOiBQYXlsb2FkIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoISh2YWx1ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBbTUVUQURBVEFfRU5DT0RJTkdfS0VZXTogZW5jb2RpbmdLZXlzLk1FVEFEQVRBX0VOQ09ESU5HX1JBVyxcbiAgICAgIH0sXG4gICAgICBkYXRhOiB2YWx1ZSxcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGZyb21QYXlsb2FkPFQ+KGNvbnRlbnQ6IFBheWxvYWQpOiBUIHtcbiAgICByZXR1cm4gKFxuICAgICAgLy8gV3JhcCB3aXRoIFVpbnQ4QXJyYXkgZnJvbSB0aGlzIGNvbnRleHQgdG8gZW5zdXJlIGBpbnN0YW5jZW9mYCB3b3Jrc1xuICAgICAgKFxuICAgICAgICBjb250ZW50LmRhdGEgPyBuZXcgVWludDhBcnJheShjb250ZW50LmRhdGEuYnVmZmVyLCBjb250ZW50LmRhdGEuYnl0ZU9mZnNldCwgY29udGVudC5kYXRhLmxlbmd0aCkgOiBjb250ZW50LmRhdGFcbiAgICAgICkgYXMgYW55XG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIGJldHdlZW4gbm9uLXVuZGVmaW5lZCB2YWx1ZXMgYW5kIHNlcmlhbGl6ZWQgSlNPTiBQYXlsb2FkXG4gKi9cbmV4cG9ydCBjbGFzcyBKc29uUGF5bG9hZENvbnZlcnRlciBpbXBsZW1lbnRzIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2Rpbmcge1xuICBwdWJsaWMgZW5jb2RpbmdUeXBlID0gZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19KU09OO1xuXG4gIHB1YmxpYyB0b1BheWxvYWQodmFsdWU6IHVua25vd24pOiBQYXlsb2FkIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBsZXQganNvbjtcbiAgICB0cnkge1xuICAgICAganNvbiA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIFtNRVRBREFUQV9FTkNPRElOR19LRVldOiBlbmNvZGluZ0tleXMuTUVUQURBVEFfRU5DT0RJTkdfSlNPTixcbiAgICAgIH0sXG4gICAgICBkYXRhOiBlbmNvZGUoanNvbiksXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBmcm9tUGF5bG9hZDxUPihjb250ZW50OiBQYXlsb2FkKTogVCB7XG4gICAgaWYgKGNvbnRlbnQuZGF0YSA9PT0gdW5kZWZpbmVkIHx8IGNvbnRlbnQuZGF0YSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ0dvdCBwYXlsb2FkIHdpdGggbm8gZGF0YScpO1xuICAgIH1cbiAgICByZXR1cm4gSlNPTi5wYXJzZShkZWNvZGUoY29udGVudC5kYXRhKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBTZWFyY2ggQXR0cmlidXRlIHZhbHVlcyB1c2luZyBKc29uUGF5bG9hZENvbnZlcnRlclxuICovXG5leHBvcnQgY2xhc3MgU2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlciBpbXBsZW1lbnRzIFBheWxvYWRDb252ZXJ0ZXIge1xuICBqc29uQ29udmVydGVyID0gbmV3IEpzb25QYXlsb2FkQ29udmVydGVyKCk7XG4gIHZhbGlkTm9uRGF0ZVR5cGVzID0gWydzdHJpbmcnLCAnbnVtYmVyJywgJ2Jvb2xlYW4nXTtcblxuICBwdWJsaWMgdG9QYXlsb2FkKHZhbHVlczogdW5rbm93bik6IFBheWxvYWQge1xuICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZXMpKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihgU2VhcmNoQXR0cmlidXRlIHZhbHVlIG11c3QgYmUgYW4gYXJyYXlgKTtcbiAgICB9XG5cbiAgICBpZiAodmFsdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGZpcnN0VmFsdWUgPSB2YWx1ZXNbMF07XG4gICAgICBjb25zdCBmaXJzdFR5cGUgPSB0eXBlb2YgZmlyc3RWYWx1ZTtcbiAgICAgIGlmIChmaXJzdFR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAoY29uc3QgW2lkeCwgdmFsdWVdIG9mIHZhbHVlcy5lbnRyaWVzKCkpIHtcbiAgICAgICAgICBpZiAoISh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihcbiAgICAgICAgICAgICAgYFNlYXJjaEF0dHJpYnV0ZSB2YWx1ZXMgbXVzdCBhcnJheXMgb2Ygc3RyaW5ncywgbnVtYmVycywgYm9vbGVhbnMsIG9yIERhdGVzLiBUaGUgdmFsdWUgJHt2YWx1ZX0gYXQgaW5kZXggJHtpZHh9IGlzIG9mIHR5cGUgJHt0eXBlb2YgdmFsdWV9YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghdGhpcy52YWxpZE5vbkRhdGVUeXBlcy5pbmNsdWRlcyhmaXJzdFR5cGUpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoYFNlYXJjaEF0dHJpYnV0ZSBhcnJheSB2YWx1ZXMgbXVzdCBiZTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IERhdGVgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgW2lkeCwgdmFsdWVdIG9mIHZhbHVlcy5lbnRyaWVzKCkpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBmaXJzdFR5cGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKFxuICAgICAgICAgICAgICBgQWxsIFNlYXJjaEF0dHJpYnV0ZSBhcnJheSB2YWx1ZXMgbXVzdCBiZSBvZiB0aGUgc2FtZSB0eXBlLiBUaGUgZmlyc3QgdmFsdWUgJHtmaXJzdFZhbHVlfSBvZiB0eXBlICR7Zmlyc3RUeXBlfSBkb2Vzbid0IG1hdGNoIHZhbHVlICR7dmFsdWV9IG9mIHR5cGUgJHt0eXBlb2YgdmFsdWV9IGF0IGluZGV4ICR7aWR4fWBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSlNPTi5zdHJpbmdpZnkgdGFrZXMgY2FyZSBvZiBjb252ZXJ0aW5nIERhdGVzIHRvIElTTyBzdHJpbmdzXG4gICAgY29uc3QgcmV0ID0gdGhpcy5qc29uQ29udmVydGVyLnRvUGF5bG9hZCh2YWx1ZXMpO1xuICAgIGlmIChyZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ0NvdWxkIG5vdCBjb252ZXJ0IHNlYXJjaCBhdHRyaWJ1dGVzIHRvIHBheWxvYWRzJyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvKipcbiAgICogRGF0ZXRpbWUgU2VhcmNoIEF0dHJpYnV0ZSB2YWx1ZXMgYXJlIGNvbnZlcnRlZCB0byBgRGF0ZWBzXG4gICAqL1xuICBwdWJsaWMgZnJvbVBheWxvYWQ8VD4ocGF5bG9hZDogUGF5bG9hZCk6IFQge1xuICAgIGlmIChwYXlsb2FkLm1ldGFkYXRhID09PSB1bmRlZmluZWQgfHwgcGF5bG9hZC5tZXRhZGF0YSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ01pc3NpbmcgcGF5bG9hZCBtZXRhZGF0YScpO1xuICAgIH1cblxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5qc29uQ29udmVydGVyLmZyb21QYXlsb2FkKHBheWxvYWQpO1xuICAgIGxldCBhcnJheVdyYXBwZWRWYWx1ZSA9IEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUgOiBbdmFsdWVdO1xuXG4gICAgY29uc3Qgc2VhcmNoQXR0cmlidXRlVHlwZSA9IGRlY29kZShwYXlsb2FkLm1ldGFkYXRhLnR5cGUpO1xuICAgIGlmIChzZWFyY2hBdHRyaWJ1dGVUeXBlID09PSAnRGF0ZXRpbWUnKSB7XG4gICAgICBhcnJheVdyYXBwZWRWYWx1ZSA9IGFycmF5V3JhcHBlZFZhbHVlLm1hcCgoZGF0ZVN0cmluZykgPT4gbmV3IERhdGUoZGF0ZVN0cmluZykpO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXlXcmFwcGVkVmFsdWUgYXMgdW5rbm93biBhcyBUO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyID0gbmV3IFNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIoKTtcblxuZXhwb3J0IGNsYXNzIERlZmF1bHRQYXlsb2FkQ29udmVydGVyIGV4dGVuZHMgQ29tcG9zaXRlUGF5bG9hZENvbnZlcnRlciB7XG4gIC8vIE1hdGNoIHRoZSBvcmRlciB1c2VkIGluIG90aGVyIFNES3MsIGJ1dCBleGNsdWRlIFByb3RvYnVmIGNvbnZlcnRlcnMgc28gdGhhdCB0aGUgY29kZSwgaW5jbHVkaW5nXG4gIC8vIGBwcm90bzMtanNvbi1zZXJpYWxpemVyYCwgZG9lc24ndCB0YWtlIHNwYWNlIGluIFdvcmtmbG93IGJ1bmRsZXMgdGhhdCBkb24ndCB1c2UgUHJvdG9idWZzLiBUbyB1c2UgUHJvdG9idWZzLCB1c2VcbiAgLy8ge0BsaW5rIERlZmF1bHRQYXlsb2FkQ29udmVydGVyV2l0aFByb3RvYnVmc30uXG4gIC8vXG4gIC8vIEdvIFNESzpcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3RlbXBvcmFsaW8vc2RrLWdvL2Jsb2IvNWU1NjQ1ZjBjNTUwZGNmNzE3YzA5NWFlMzJjNzZhNzA4N2QyZTk4NS9jb252ZXJ0ZXIvZGVmYXVsdF9kYXRhX2NvbnZlcnRlci5nbyNMMjhcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIobmV3IFVuZGVmaW5lZFBheWxvYWRDb252ZXJ0ZXIoKSwgbmV3IEJpbmFyeVBheWxvYWRDb252ZXJ0ZXIoKSwgbmV3IEpzb25QYXlsb2FkQ29udmVydGVyKCkpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJ9IHVzZWQgYnkgdGhlIFNESy4gU3VwcG9ydHMgYFVpbnQ4QXJyYXlgIGFuZCBKU09OIHNlcmlhbGl6YWJsZXMgKHNvIGlmXG4gKiB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvSlNPTi9zdHJpbmdpZnkjZGVzY3JpcHRpb24gfCBgSlNPTi5zdHJpbmdpZnkoeW91ckFyZ09yUmV0dmFsKWB9XG4gKiB3b3JrcywgdGhlIGRlZmF1bHQgcGF5bG9hZCBjb252ZXJ0ZXIgd2lsbCB3b3JrKS5cbiAqXG4gKiBUbyBhbHNvIHN1cHBvcnQgUHJvdG9idWZzLCBjcmVhdGUgYSBjdXN0b20gcGF5bG9hZCBjb252ZXJ0ZXIgd2l0aCB7QGxpbmsgRGVmYXVsdFBheWxvYWRDb252ZXJ0ZXJ9OlxuICpcbiAqIGBjb25zdCBteUNvbnZlcnRlciA9IG5ldyBEZWZhdWx0UGF5bG9hZENvbnZlcnRlcih7IHByb3RvYnVmUm9vdCB9KWBcbiAqL1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRQYXlsb2FkQ29udmVydGVyID0gbmV3IERlZmF1bHRQYXlsb2FkQ29udmVydGVyKCk7XG4iLCJpbXBvcnQgeyBlbmNvZGUgfSBmcm9tICcuLi9lbmNvZGluZyc7XG5cbmV4cG9ydCBjb25zdCBNRVRBREFUQV9FTkNPRElOR19LRVkgPSAnZW5jb2RpbmcnO1xuZXhwb3J0IGNvbnN0IGVuY29kaW5nVHlwZXMgPSB7XG4gIE1FVEFEQVRBX0VOQ09ESU5HX05VTEw6ICdiaW5hcnkvbnVsbCcsXG4gIE1FVEFEQVRBX0VOQ09ESU5HX1JBVzogJ2JpbmFyeS9wbGFpbicsXG4gIE1FVEFEQVRBX0VOQ09ESU5HX0pTT046ICdqc29uL3BsYWluJyxcbiAgTUVUQURBVEFfRU5DT0RJTkdfUFJPVE9CVUZfSlNPTjogJ2pzb24vcHJvdG9idWYnLFxuICBNRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRjogJ2JpbmFyeS9wcm90b2J1ZicsXG59IGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgRW5jb2RpbmdUeXBlID0gKHR5cGVvZiBlbmNvZGluZ1R5cGVzKVtrZXlvZiB0eXBlb2YgZW5jb2RpbmdUeXBlc107XG5cbmV4cG9ydCBjb25zdCBlbmNvZGluZ0tleXMgPSB7XG4gIE1FVEFEQVRBX0VOQ09ESU5HX05VTEw6IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX05VTEwpLFxuICBNRVRBREFUQV9FTkNPRElOR19SQVc6IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX1JBVyksXG4gIE1FVEFEQVRBX0VOQ09ESU5HX0pTT046IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX0pTT04pLFxuICBNRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRl9KU09OOiBlbmNvZGUoZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRl9KU09OKSxcbiAgTUVUQURBVEFfRU5DT0RJTkdfUFJPVE9CVUY6IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX1BST1RPQlVGKSxcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjb25zdCBNRVRBREFUQV9NRVNTQUdFX1RZUEVfS0VZID0gJ21lc3NhZ2VUeXBlJztcbiIsImltcG9ydCAqIGFzIHRpbWUgZnJvbSAnLi90aW1lJztcbmltcG9ydCB7IHR5cGUgVGltZXN0YW1wLCBEdXJhdGlvbiB9IGZyb20gJy4vdGltZSc7XG5cbi8qKlxuICogTG9zc3kgY29udmVyc2lvbiBmdW5jdGlvbiBmcm9tIFRpbWVzdGFtcCB0byBudW1iZXIgZHVlIHRvIHBvc3NpYmxlIG92ZXJmbG93LlxuICogSWYgdHMgaXMgbnVsbCBvciB1bmRlZmluZWQgcmV0dXJucyB1bmRlZmluZWQuXG4gKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsVHNUb01zKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHRpbWUub3B0aW9uYWxUc1RvTXModHMpO1xufVxuXG4vKipcbiAqIExvc3N5IGNvbnZlcnNpb24gZnVuY3Rpb24gZnJvbSBUaW1lc3RhbXAgdG8gbnVtYmVyIGR1ZSB0byBwb3NzaWJsZSBvdmVyZmxvd1xuICpcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gdHNUb01zKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHtcbiAgcmV0dXJuIHRpbWUudHNUb01zKHRzKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gbXNOdW1iZXJUb1RzKG1pbGxpczogbnVtYmVyKTogVGltZXN0YW1wIHtcbiAgcmV0dXJuIHRpbWUubXNOdW1iZXJUb1RzKG1pbGxpcyk7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1zVG9UcyhzdHI6IER1cmF0aW9uKTogVGltZXN0YW1wIHtcbiAgcmV0dXJuIHRpbWUubXNUb1RzKHN0cik7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1zT3B0aW9uYWxUb1RzKHN0cjogRHVyYXRpb24gfCB1bmRlZmluZWQpOiBUaW1lc3RhbXAgfCB1bmRlZmluZWQge1xuICByZXR1cm4gdGltZS5tc09wdGlvbmFsVG9UcyhzdHIpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtc09wdGlvbmFsVG9OdW1iZXIodmFsOiBEdXJhdGlvbiB8IHVuZGVmaW5lZCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0aW1lLm1zT3B0aW9uYWxUb051bWJlcih2YWwpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtc1RvTnVtYmVyKHZhbDogRHVyYXRpb24pOiBudW1iZXIge1xuICByZXR1cm4gdGltZS5tc1RvTnVtYmVyKHZhbCk7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRzVG9EYXRlKHRzOiBUaW1lc3RhbXApOiBEYXRlIHtcbiAgcmV0dXJuIHRpbWUudHNUb0RhdGUodHMpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHRpb25hbFRzVG9EYXRlKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogRGF0ZSB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0aW1lLm9wdGlvbmFsVHNUb0RhdGUodHMpO1xufVxuIiwiLy8gUGFzdGVkIHdpdGggbW9kaWZpY2F0aW9ucyBmcm9tOiBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vYW5vbnljby9GYXN0ZXN0U21hbGxlc3RUZXh0RW5jb2RlckRlY29kZXIvbWFzdGVyL0VuY29kZXJEZWNvZGVyVG9nZXRoZXIuc3JjLmpzXG4vKiBlc2xpbnQgbm8tZmFsbHRocm91Z2g6IDAgKi9cblxuY29uc3QgZnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcbmNvbnN0IGVuY29kZXJSZWdleHAgPSAvW1xceDgwLVxcdUQ3ZmZcXHVEQzAwLVxcdUZGRkZdfFtcXHVEODAwLVxcdURCRkZdW1xcdURDMDAtXFx1REZGRl0/L2c7XG5jb25zdCB0bXBCdWZmZXJVMTYgPSBuZXcgVWludDE2QXJyYXkoMzIpO1xuXG5leHBvcnQgY2xhc3MgVGV4dERlY29kZXIge1xuICBkZWNvZGUoaW5wdXRBcnJheU9yQnVmZmVyOiBVaW50OEFycmF5IHwgQXJyYXlCdWZmZXIgfCBTaGFyZWRBcnJheUJ1ZmZlcik6IHN0cmluZyB7XG4gICAgY29uc3QgaW5wdXRBczggPSBpbnB1dEFycmF5T3JCdWZmZXIgaW5zdGFuY2VvZiBVaW50OEFycmF5ID8gaW5wdXRBcnJheU9yQnVmZmVyIDogbmV3IFVpbnQ4QXJyYXkoaW5wdXRBcnJheU9yQnVmZmVyKTtcblxuICAgIGxldCByZXN1bHRpbmdTdHJpbmcgPSAnJyxcbiAgICAgIHRtcFN0ciA9ICcnLFxuICAgICAgaW5kZXggPSAwLFxuICAgICAgbmV4dEVuZCA9IDAsXG4gICAgICBjcDAgPSAwLFxuICAgICAgY29kZVBvaW50ID0gMCxcbiAgICAgIG1pbkJpdHMgPSAwLFxuICAgICAgY3AxID0gMCxcbiAgICAgIHBvcyA9IDAsXG4gICAgICB0bXAgPSAtMTtcbiAgICBjb25zdCBsZW4gPSBpbnB1dEFzOC5sZW5ndGggfCAwO1xuICAgIGNvbnN0IGxlbk1pbnVzMzIgPSAobGVuIC0gMzIpIHwgMDtcbiAgICAvLyBOb3RlIHRoYXQgdG1wIHJlcHJlc2VudHMgdGhlIDJuZCBoYWxmIG9mIGEgc3Vycm9nYXRlIHBhaXIgaW5jYXNlIGEgc3Vycm9nYXRlIGdldHMgZGl2aWRlZCBiZXR3ZWVuIGJsb2Nrc1xuICAgIGZvciAoOyBpbmRleCA8IGxlbjsgKSB7XG4gICAgICBuZXh0RW5kID0gaW5kZXggPD0gbGVuTWludXMzMiA/IDMyIDogKGxlbiAtIGluZGV4KSB8IDA7XG4gICAgICBmb3IgKDsgcG9zIDwgbmV4dEVuZDsgaW5kZXggPSAoaW5kZXggKyAxKSB8IDAsIHBvcyA9IChwb3MgKyAxKSB8IDApIHtcbiAgICAgICAgY3AwID0gaW5wdXRBczhbaW5kZXhdICYgMHhmZjtcbiAgICAgICAgc3dpdGNoIChjcDAgPj4gNCkge1xuICAgICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgICBjcDEgPSBpbnB1dEFzOFsoaW5kZXggPSAoaW5kZXggKyAxKSB8IDApXSAmIDB4ZmY7XG4gICAgICAgICAgICBpZiAoY3AxID4+IDYgIT09IDBiMTAgfHwgMGIxMTExMDExMSA8IGNwMCkge1xuICAgICAgICAgICAgICBpbmRleCA9IChpbmRleCAtIDEpIHwgMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb2RlUG9pbnQgPSAoKGNwMCAmIDBiMTExKSA8PCA2KSB8IChjcDEgJiAwYjAwMTExMTExKTtcbiAgICAgICAgICAgIG1pbkJpdHMgPSA1OyAvLyAyMCBlbnN1cmVzIGl0IG5ldmVyIHBhc3NlcyAtPiBhbGwgaW52YWxpZCByZXBsYWNlbWVudHNcbiAgICAgICAgICAgIGNwMCA9IDB4MTAwOyAvLyAga2VlcCB0cmFjayBvZiB0aCBiaXQgc2l6ZVxuICAgICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgICBjcDEgPSBpbnB1dEFzOFsoaW5kZXggPSAoaW5kZXggKyAxKSB8IDApXSAmIDB4ZmY7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPDw9IDY7XG4gICAgICAgICAgICBjb2RlUG9pbnQgfD0gKChjcDAgJiAwYjExMTEpIDw8IDYpIHwgKGNwMSAmIDBiMDAxMTExMTEpO1xuICAgICAgICAgICAgbWluQml0cyA9IGNwMSA+PiA2ID09PSAwYjEwID8gKG1pbkJpdHMgKyA0KSB8IDAgOiAyNDsgLy8gMjQgZW5zdXJlcyBpdCBuZXZlciBwYXNzZXMgLT4gYWxsIGludmFsaWQgcmVwbGFjZW1lbnRzXG4gICAgICAgICAgICBjcDAgPSAoY3AwICsgMHgxMDApICYgMHgzMDA7IC8vIGtlZXAgdHJhY2sgb2YgdGggYml0IHNpemVcbiAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICBjcDEgPSBpbnB1dEFzOFsoaW5kZXggPSAoaW5kZXggKyAxKSB8IDApXSAmIDB4ZmY7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPDw9IDY7XG4gICAgICAgICAgICBjb2RlUG9pbnQgfD0gKChjcDAgJiAwYjExMTExKSA8PCA2KSB8IChjcDEgJiAwYjAwMTExMTExKTtcbiAgICAgICAgICAgIG1pbkJpdHMgPSAobWluQml0cyArIDcpIHwgMDtcblxuICAgICAgICAgICAgLy8gTm93LCBwcm9jZXNzIHRoZSBjb2RlIHBvaW50XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBsZW4gJiYgY3AxID4+IDYgPT09IDBiMTAgJiYgY29kZVBvaW50ID4+IG1pbkJpdHMgJiYgY29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgICAgICAgICAgY3AwID0gY29kZVBvaW50O1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSAoY29kZVBvaW50IC0gMHgxMDAwMCkgfCAwO1xuICAgICAgICAgICAgICBpZiAoMCA8PSBjb2RlUG9pbnQgLyoweGZmZmYgPCBjb2RlUG9pbnQqLykge1xuICAgICAgICAgICAgICAgIC8vIEJNUCBjb2RlIHBvaW50XG4gICAgICAgICAgICAgICAgLy9uZXh0RW5kID0gbmV4dEVuZCAtIDF8MDtcblxuICAgICAgICAgICAgICAgIHRtcCA9ICgoY29kZVBvaW50ID4+IDEwKSArIDB4ZDgwMCkgfCAwOyAvLyBoaWdoU3Vycm9nYXRlXG4gICAgICAgICAgICAgICAgY3AwID0gKChjb2RlUG9pbnQgJiAweDNmZikgKyAweGRjMDApIHwgMDsgLy8gbG93U3Vycm9nYXRlICh3aWxsIGJlIGluc2VydGVkIGxhdGVyIGluIHRoZSBzd2l0Y2gtc3RhdGVtZW50KVxuXG4gICAgICAgICAgICAgICAgaWYgKHBvcyA8IDMxKSB7XG4gICAgICAgICAgICAgICAgICAvLyBub3RpY2UgMzEgaW5zdGVhZCBvZiAzMlxuICAgICAgICAgICAgICAgICAgdG1wQnVmZmVyVTE2W3Bvc10gPSB0bXA7XG4gICAgICAgICAgICAgICAgICBwb3MgPSAocG9zICsgMSkgfCAwO1xuICAgICAgICAgICAgICAgICAgdG1wID0gLTE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIC8vIGVsc2UsIHdlIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSBpbnB1dEFzOCBhbmQgbGV0IHRtcDAgYmUgZmlsbGVkIGluIGxhdGVyIG9uXG4gICAgICAgICAgICAgICAgICAvLyBOT1RFIHRoYXQgY3AxIGlzIGJlaW5nIHVzZWQgYXMgYSB0ZW1wb3JhcnkgdmFyaWFibGUgZm9yIHRoZSBzd2FwcGluZyBvZiB0bXAgd2l0aCBjcDBcbiAgICAgICAgICAgICAgICAgIGNwMSA9IHRtcDtcbiAgICAgICAgICAgICAgICAgIHRtcCA9IGNwMDtcbiAgICAgICAgICAgICAgICAgIGNwMCA9IGNwMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSBuZXh0RW5kID0gKG5leHRFbmQgKyAxKSB8IDA7IC8vIGJlY2F1c2Ugd2UgYXJlIGFkdmFuY2luZyBpIHdpdGhvdXQgYWR2YW5jaW5nIHBvc1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gaW52YWxpZCBjb2RlIHBvaW50IG1lYW5zIHJlcGxhY2luZyB0aGUgd2hvbGUgdGhpbmcgd2l0aCBudWxsIHJlcGxhY2VtZW50IGNoYXJhY3RlcnNcbiAgICAgICAgICAgICAgY3AwID4+PSA4O1xuICAgICAgICAgICAgICBpbmRleCA9IChpbmRleCAtIGNwMCAtIDEpIHwgMDsgLy8gcmVzZXQgaW5kZXggIGJhY2sgdG8gd2hhdCBpdCB3YXMgYmVmb3JlXG4gICAgICAgICAgICAgIGNwMCA9IDB4ZmZmZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRmluYWxseSwgcmVzZXQgdGhlIHZhcmlhYmxlcyBmb3IgdGhlIG5leHQgZ28tYXJvdW5kXG4gICAgICAgICAgICBtaW5CaXRzID0gMDtcbiAgICAgICAgICAgIGNvZGVQb2ludCA9IDA7XG4gICAgICAgICAgICBuZXh0RW5kID0gaW5kZXggPD0gbGVuTWludXMzMiA/IDMyIDogKGxlbiAtIGluZGV4KSB8IDA7XG4gICAgICAgICAgLypjYXNlIDExOlxuICAgICAgICBjYXNlIDEwOlxuICAgICAgICBjYXNlIDk6XG4gICAgICAgIGNhc2UgODpcbiAgICAgICAgICBjb2RlUG9pbnQgPyBjb2RlUG9pbnQgPSAwIDogY3AwID0gMHhmZmZkOyAvLyBmaWxsIHdpdGggaW52YWxpZCByZXBsYWNlbWVudCBjaGFyYWN0ZXJcbiAgICAgICAgY2FzZSA3OlxuICAgICAgICBjYXNlIDY6XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICBjYXNlIDM6XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgdG1wQnVmZmVyVTE2W3Bvc10gPSBjcDA7XG4gICAgICAgICAgY29udGludWU7Ki9cbiAgICAgICAgICBkZWZhdWx0OiAvLyBmaWxsIHdpdGggaW52YWxpZCByZXBsYWNlbWVudCBjaGFyYWN0ZXJcbiAgICAgICAgICAgIHRtcEJ1ZmZlclUxNltwb3NdID0gY3AwO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICBjYXNlIDg6XG4gICAgICAgIH1cbiAgICAgICAgdG1wQnVmZmVyVTE2W3Bvc10gPSAweGZmZmQ7IC8vIGZpbGwgd2l0aCBpbnZhbGlkIHJlcGxhY2VtZW50IGNoYXJhY3RlclxuICAgICAgfVxuICAgICAgdG1wU3RyICs9IGZyb21DaGFyQ29kZShcbiAgICAgICAgdG1wQnVmZmVyVTE2WzBdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzNdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbNF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNls1XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzZdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbN10sXG4gICAgICAgIHRtcEJ1ZmZlclUxNls4XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzldLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTBdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTFdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTJdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTNdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTRdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTVdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTZdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTddLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMThdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTldLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjBdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjFdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjJdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjNdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjRdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjVdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjZdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjddLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjhdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjldLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMzBdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMzFdXG4gICAgICApO1xuICAgICAgaWYgKHBvcyA8IDMyKSB0bXBTdHIgPSB0bXBTdHIuc2xpY2UoMCwgKHBvcyAtIDMyKSB8IDApOyAvLy0oMzItcG9zKSk7XG4gICAgICBpZiAoaW5kZXggPCBsZW4pIHtcbiAgICAgICAgLy9mcm9tQ2hhckNvZGUuYXBwbHkoMCwgdG1wQnVmZmVyVTE2IDogVWludDhBcnJheSA/ICB0bXBCdWZmZXJVMTYuc3ViYXJyYXkoMCxwb3MpIDogdG1wQnVmZmVyVTE2LnNsaWNlKDAscG9zKSk7XG4gICAgICAgIHRtcEJ1ZmZlclUxNlswXSA9IHRtcDtcbiAgICAgICAgcG9zID0gfnRtcCA+Pj4gMzE7IC8vdG1wICE9PSAtMSA/IDEgOiAwO1xuICAgICAgICB0bXAgPSAtMTtcblxuICAgICAgICBpZiAodG1wU3RyLmxlbmd0aCA8IHJlc3VsdGluZ1N0cmluZy5sZW5ndGgpIGNvbnRpbnVlO1xuICAgICAgfSBlbHNlIGlmICh0bXAgIT09IC0xKSB7XG4gICAgICAgIHRtcFN0ciArPSBmcm9tQ2hhckNvZGUodG1wKTtcbiAgICAgIH1cblxuICAgICAgcmVzdWx0aW5nU3RyaW5nICs9IHRtcFN0cjtcbiAgICAgIHRtcFN0ciA9ICcnO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRpbmdTdHJpbmc7XG4gIH1cbn1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmZ1bmN0aW9uIGVuY29kZXJSZXBsYWNlcihub25Bc2NpaUNoYXJzOiBzdHJpbmcpIHtcbiAgLy8gbWFrZSB0aGUgVVRGIHN0cmluZyBpbnRvIGEgYmluYXJ5IFVURi04IGVuY29kZWQgc3RyaW5nXG4gIGxldCBwb2ludCA9IG5vbkFzY2lpQ2hhcnMuY2hhckNvZGVBdCgwKSB8IDA7XG4gIGlmICgweGQ4MDAgPD0gcG9pbnQpIHtcbiAgICBpZiAocG9pbnQgPD0gMHhkYmZmKSB7XG4gICAgICBjb25zdCBuZXh0Y29kZSA9IG5vbkFzY2lpQ2hhcnMuY2hhckNvZGVBdCgxKSB8IDA7IC8vIGRlZmF1bHRzIHRvIDAgd2hlbiBOYU4sIGNhdXNpbmcgbnVsbCByZXBsYWNlbWVudCBjaGFyYWN0ZXJcblxuICAgICAgaWYgKDB4ZGMwMCA8PSBuZXh0Y29kZSAmJiBuZXh0Y29kZSA8PSAweGRmZmYpIHtcbiAgICAgICAgLy9wb2ludCA9ICgocG9pbnQgLSAweEQ4MDApPDwxMCkgKyBuZXh0Y29kZSAtIDB4REMwMCArIDB4MTAwMDB8MDtcbiAgICAgICAgcG9pbnQgPSAoKHBvaW50IDw8IDEwKSArIG5leHRjb2RlIC0gMHgzNWZkYzAwKSB8IDA7XG4gICAgICAgIGlmIChwb2ludCA+IDB4ZmZmZilcbiAgICAgICAgICByZXR1cm4gZnJvbUNoYXJDb2RlKFxuICAgICAgICAgICAgKDB4MWUgLyowYjExMTEwKi8gPDwgMykgfCAocG9pbnQgPj4gMTgpLFxuICAgICAgICAgICAgKDB4MiAvKjBiMTAqLyA8PCA2KSB8ICgocG9pbnQgPj4gMTIpICYgMHgzZikgLyowYjAwMTExMTExKi8sXG4gICAgICAgICAgICAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKChwb2ludCA+PiA2KSAmIDB4M2YpIC8qMGIwMDExMTExMSovLFxuICAgICAgICAgICAgKDB4MiAvKjBiMTAqLyA8PCA2KSB8IChwb2ludCAmIDB4M2YpIC8qMGIwMDExMTExMSovXG4gICAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBwb2ludCA9IDY1NTMzIC8qMGIxMTExMTExMTExMTExMTAxKi87IC8vcmV0dXJuICdcXHhFRlxceEJGXFx4QkQnOy8vZnJvbUNoYXJDb2RlKDB4ZWYsIDB4YmYsIDB4YmQpO1xuICAgIH0gZWxzZSBpZiAocG9pbnQgPD0gMHhkZmZmKSB7XG4gICAgICBwb2ludCA9IDY1NTMzIC8qMGIxMTExMTExMTExMTExMTAxKi87IC8vcmV0dXJuICdcXHhFRlxceEJGXFx4QkQnOy8vZnJvbUNoYXJDb2RlKDB4ZWYsIDB4YmYsIDB4YmQpO1xuICAgIH1cbiAgfVxuICAvKmlmIChwb2ludCA8PSAweDAwN2YpIHJldHVybiBub25Bc2NpaUNoYXJzO1xuICBlbHNlICovIGlmIChwb2ludCA8PSAweDA3ZmYpIHtcbiAgICByZXR1cm4gZnJvbUNoYXJDb2RlKCgweDYgPDwgNSkgfCAocG9pbnQgPj4gNiksICgweDIgPDwgNikgfCAocG9pbnQgJiAweDNmKSk7XG4gIH0gZWxzZVxuICAgIHJldHVybiBmcm9tQ2hhckNvZGUoXG4gICAgICAoMHhlIC8qMGIxMTEwKi8gPDwgNCkgfCAocG9pbnQgPj4gMTIpLFxuICAgICAgKDB4MiAvKjBiMTAqLyA8PCA2KSB8ICgocG9pbnQgPj4gNikgJiAweDNmKSAvKjBiMDAxMTExMTEqLyxcbiAgICAgICgweDIgLyowYjEwKi8gPDwgNikgfCAocG9pbnQgJiAweDNmKSAvKjBiMDAxMTExMTEqL1xuICAgICk7XG59XG5cbmV4cG9ydCBjbGFzcyBUZXh0RW5jb2RlciB7XG4gIHB1YmxpYyBlbmNvZGUoaW5wdXRTdHJpbmc6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICAgIC8vIDB4YzAgPT4gMGIxMTAwMDAwMDsgMHhmZiA9PiAwYjExMTExMTExOyAweGMwLTB4ZmYgPT4gMGIxMXh4eHh4eFxuICAgIC8vIDB4ODAgPT4gMGIxMDAwMDAwMDsgMHhiZiA9PiAwYjEwMTExMTExOyAweDgwLTB4YmYgPT4gMGIxMHh4eHh4eFxuICAgIGNvbnN0IGVuY29kZWRTdHJpbmcgPSBpbnB1dFN0cmluZyA9PT0gdm9pZCAwID8gJycgOiAnJyArIGlucHV0U3RyaW5nLFxuICAgICAgbGVuID0gZW5jb2RlZFN0cmluZy5sZW5ndGggfCAwO1xuICAgIGxldCByZXN1bHQgPSBuZXcgVWludDhBcnJheSgoKGxlbiA8PCAxKSArIDgpIHwgMCk7XG4gICAgbGV0IHRtcFJlc3VsdDogVWludDhBcnJheTtcbiAgICBsZXQgaSA9IDAsXG4gICAgICBwb3MgPSAwLFxuICAgICAgcG9pbnQgPSAwLFxuICAgICAgbmV4dGNvZGUgPSAwO1xuICAgIGxldCB1cGdyYWRlZGVkQXJyYXlTaXplID0gIVVpbnQ4QXJyYXk7IC8vIG5vcm1hbCBhcnJheXMgYXJlIGF1dG8tZXhwYW5kaW5nXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSA9IChpICsgMSkgfCAwLCBwb3MgPSAocG9zICsgMSkgfCAwKSB7XG4gICAgICBwb2ludCA9IGVuY29kZWRTdHJpbmcuY2hhckNvZGVBdChpKSB8IDA7XG4gICAgICBpZiAocG9pbnQgPD0gMHgwMDdmKSB7XG4gICAgICAgIHJlc3VsdFtwb3NdID0gcG9pbnQ7XG4gICAgICB9IGVsc2UgaWYgKHBvaW50IDw9IDB4MDdmZikge1xuICAgICAgICByZXN1bHRbcG9zXSA9ICgweDYgPDwgNSkgfCAocG9pbnQgPj4gNik7XG4gICAgICAgIHJlc3VsdFsocG9zID0gKHBvcyArIDEpIHwgMCldID0gKDB4MiA8PCA2KSB8IChwb2ludCAmIDB4M2YpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2lkZW5DaGVjazoge1xuICAgICAgICAgIGlmICgweGQ4MDAgPD0gcG9pbnQpIHtcbiAgICAgICAgICAgIGlmIChwb2ludCA8PSAweGRiZmYpIHtcbiAgICAgICAgICAgICAgbmV4dGNvZGUgPSBlbmNvZGVkU3RyaW5nLmNoYXJDb2RlQXQoKGkgPSAoaSArIDEpIHwgMCkpIHwgMDsgLy8gZGVmYXVsdHMgdG8gMCB3aGVuIE5hTiwgY2F1c2luZyBudWxsIHJlcGxhY2VtZW50IGNoYXJhY3RlclxuXG4gICAgICAgICAgICAgIGlmICgweGRjMDAgPD0gbmV4dGNvZGUgJiYgbmV4dGNvZGUgPD0gMHhkZmZmKSB7XG4gICAgICAgICAgICAgICAgLy9wb2ludCA9ICgocG9pbnQgLSAweEQ4MDApPDwxMCkgKyBuZXh0Y29kZSAtIDB4REMwMCArIDB4MTAwMDB8MDtcbiAgICAgICAgICAgICAgICBwb2ludCA9ICgocG9pbnQgPDwgMTApICsgbmV4dGNvZGUgLSAweDM1ZmRjMDApIHwgMDtcbiAgICAgICAgICAgICAgICBpZiAocG9pbnQgPiAweGZmZmYpIHtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdFtwb3NdID0gKDB4MWUgLyowYjExMTEwKi8gPDwgMykgfCAocG9pbnQgPj4gMTgpO1xuICAgICAgICAgICAgICAgICAgcmVzdWx0Wyhwb3MgPSAocG9zICsgMSkgfCAwKV0gPSAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKChwb2ludCA+PiAxMikgJiAweDNmKSAvKjBiMDAxMTExMTEqLztcbiAgICAgICAgICAgICAgICAgIHJlc3VsdFsocG9zID0gKHBvcyArIDEpIHwgMCldID0gKDB4MiAvKjBiMTAqLyA8PCA2KSB8ICgocG9pbnQgPj4gNikgJiAweDNmKSAvKjBiMDAxMTExMTEqLztcbiAgICAgICAgICAgICAgICAgIHJlc3VsdFsocG9zID0gKHBvcyArIDEpIHwgMCldID0gKDB4MiAvKjBiMTAqLyA8PCA2KSB8IChwb2ludCAmIDB4M2YpIC8qMGIwMDExMTExMSovO1xuICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrIHdpZGVuQ2hlY2s7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcG9pbnQgPSA2NTUzMyAvKjBiMTExMTExMTExMTExMTEwMSovOyAvL3JldHVybiAnXFx4RUZcXHhCRlxceEJEJzsvL2Zyb21DaGFyQ29kZSgweGVmLCAweGJmLCAweGJkKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocG9pbnQgPD0gMHhkZmZmKSB7XG4gICAgICAgICAgICAgIHBvaW50ID0gNjU1MzMgLyowYjExMTExMTExMTExMTExMDEqLzsgLy9yZXR1cm4gJ1xceEVGXFx4QkZcXHhCRCc7Ly9mcm9tQ2hhckNvZGUoMHhlZiwgMHhiZiwgMHhiZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghdXBncmFkZWRlZEFycmF5U2l6ZSAmJiBpIDw8IDEgPCBwb3MgJiYgaSA8PCAxIDwgKChwb3MgLSA3KSB8IDApKSB7XG4gICAgICAgICAgICB1cGdyYWRlZGVkQXJyYXlTaXplID0gdHJ1ZTtcbiAgICAgICAgICAgIHRtcFJlc3VsdCA9IG5ldyBVaW50OEFycmF5KGxlbiAqIDMpO1xuICAgICAgICAgICAgdG1wUmVzdWx0LnNldChyZXN1bHQpO1xuICAgICAgICAgICAgcmVzdWx0ID0gdG1wUmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXN1bHRbcG9zXSA9ICgweGUgLyowYjExMTAqLyA8PCA0KSB8IChwb2ludCA+PiAxMik7XG4gICAgICAgIHJlc3VsdFsocG9zID0gKHBvcyArIDEpIHwgMCldID0gKDB4MiAvKjBiMTAqLyA8PCA2KSB8ICgocG9pbnQgPj4gNikgJiAweDNmKSAvKjBiMDAxMTExMTEqLztcbiAgICAgICAgcmVzdWx0Wyhwb3MgPSAocG9zICsgMSkgfCAwKV0gPSAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKHBvaW50ICYgMHgzZikgLyowYjAwMTExMTExKi87XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBVaW50OEFycmF5ID8gcmVzdWx0LnN1YmFycmF5KDAsIHBvcykgOiByZXN1bHQuc2xpY2UoMCwgcG9zKTtcbiAgfVxuXG4gIHB1YmxpYyBlbmNvZGVJbnRvKGlucHV0U3RyaW5nOiBzdHJpbmcsIHU4QXJyOiBVaW50OEFycmF5KTogeyB3cml0dGVuOiBudW1iZXI7IHJlYWQ6IG51bWJlciB9IHtcbiAgICBjb25zdCBlbmNvZGVkU3RyaW5nID0gaW5wdXRTdHJpbmcgPT09IHZvaWQgMCA/ICcnIDogKCcnICsgaW5wdXRTdHJpbmcpLnJlcGxhY2UoZW5jb2RlclJlZ2V4cCwgZW5jb2RlclJlcGxhY2VyKTtcbiAgICBsZXQgbGVuID0gZW5jb2RlZFN0cmluZy5sZW5ndGggfCAwLFxuICAgICAgaSA9IDAsXG4gICAgICBjaGFyID0gMCxcbiAgICAgIHJlYWQgPSAwO1xuICAgIGNvbnN0IHU4QXJyTGVuID0gdThBcnIubGVuZ3RoIHwgMDtcbiAgICBjb25zdCBpbnB1dExlbmd0aCA9IGlucHV0U3RyaW5nLmxlbmd0aCB8IDA7XG4gICAgaWYgKHU4QXJyTGVuIDwgbGVuKSBsZW4gPSB1OEFyckxlbjtcbiAgICBwdXRDaGFyczoge1xuICAgICAgZm9yICg7IGkgPCBsZW47IGkgPSAoaSArIDEpIHwgMCkge1xuICAgICAgICBjaGFyID0gZW5jb2RlZFN0cmluZy5jaGFyQ29kZUF0KGkpIHwgMDtcbiAgICAgICAgc3dpdGNoIChjaGFyID4+IDQpIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgcmVhZCA9IChyZWFkICsgMSkgfCAwO1xuICAgICAgICAgIC8vIGV4dGVuc2lvbiBwb2ludHM6XG4gICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgIGNhc2UgMTE6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgICBpZiAoKChpICsgMSkgfCAwKSA8IHU4QXJyTGVuKSB7XG4gICAgICAgICAgICAgIHJlYWQgPSAocmVhZCArIDEpIHwgMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSAxNDpcbiAgICAgICAgICAgIGlmICgoKGkgKyAyKSB8IDApIDwgdThBcnJMZW4pIHtcbiAgICAgICAgICAgICAgLy9pZiAoIShjaGFyID09PSAweEVGICYmIGVuY29kZWRTdHJpbmcuc3Vic3RyKGkrMXwwLDIpID09PSBcIlxceEJGXFx4QkRcIikpXG4gICAgICAgICAgICAgIHJlYWQgPSAocmVhZCArIDEpIHwgMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICAgIGlmICgoKGkgKyAzKSB8IDApIDwgdThBcnJMZW4pIHtcbiAgICAgICAgICAgICAgcmVhZCA9IChyZWFkICsgMSkgfCAwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWsgcHV0Q2hhcnM7XG4gICAgICAgIH1cbiAgICAgICAgLy9yZWFkID0gcmVhZCArICgoY2hhciA+PiA2KSAhPT0gMikgfDA7XG4gICAgICAgIHU4QXJyW2ldID0gY2hhcjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgd3JpdHRlbjogaSwgcmVhZDogaW5wdXRMZW5ndGggPCByZWFkID8gaW5wdXRMZW5ndGggOiByZWFkIH07XG4gIH1cbn1cblxuLyoqXG4gKiBFbmNvZGUgYSBVVEYtOCBzdHJpbmcgaW50byBhIFVpbnQ4QXJyYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZShzOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIFRleHRFbmNvZGVyLnByb3RvdHlwZS5lbmNvZGUocyk7XG59XG5cbi8qKlxuICogRGVjb2RlIGEgVWludDhBcnJheSBpbnRvIGEgVVRGLTggc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGUoYTogVWludDhBcnJheSk6IHN0cmluZyB7XG4gIHJldHVybiBUZXh0RGVjb2Rlci5wcm90b3R5cGUuZGVjb2RlKGEpO1xufVxuIiwiaW1wb3J0IHsgVGVtcG9yYWxGYWlsdXJlIH0gZnJvbSAnLi9mYWlsdXJlJztcbmltcG9ydCB7IFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yIH0gZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuXG4vKipcbiAqIFRocm93biBmcm9tIGNvZGUgdGhhdCByZWNlaXZlcyBhIHZhbHVlIHRoYXQgaXMgdW5leHBlY3RlZCBvciB0aGF0IGl0J3MgdW5hYmxlIHRvIGhhbmRsZS5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdWYWx1ZUVycm9yJylcbmV4cG9ydCBjbGFzcyBWYWx1ZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcHVibGljIHJlYWRvbmx5IGNhdXNlPzogdW5rbm93blxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IHVuZGVmaW5lZCk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIFBheWxvYWQgQ29udmVydGVyIGlzIG1pc2NvbmZpZ3VyZWQuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignUGF5bG9hZENvbnZlcnRlckVycm9yJylcbmV4cG9ydCBjbGFzcyBQYXlsb2FkQ29udmVydGVyRXJyb3IgZXh0ZW5kcyBWYWx1ZUVycm9yIHt9XG5cbi8qKlxuICogVXNlZCBpbiBkaWZmZXJlbnQgcGFydHMgb2YgdGhlIFNESyB0byBub3RlIHRoYXQgc29tZXRoaW5nIHVuZXhwZWN0ZWQgaGFzIGhhcHBlbmVkLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0lsbGVnYWxTdGF0ZUVycm9yJylcbmV4cG9ydCBjbGFzcyBJbGxlZ2FsU3RhdGVFcnJvciBleHRlbmRzIEVycm9yIHt9XG5cbi8qKlxuICogVGhpcyBleGNlcHRpb24gaXMgdGhyb3duIGluIHRoZSBmb2xsb3dpbmcgY2FzZXM6XG4gKiAgLSBXb3JrZmxvdyB3aXRoIHRoZSBzYW1lIFdvcmtmbG93IElkIGlzIGN1cnJlbnRseSBydW5uaW5nXG4gKiAgLSBUaGVyZSBpcyBhIGNsb3NlZCBXb3JrZmxvdyB3aXRoIHRoZSBzYW1lIFdvcmtmbG93IElkIGFuZCB0aGUge0BsaW5rIFdvcmtmbG93T3B0aW9ucy53b3JrZmxvd0lkUmV1c2VQb2xpY3l9XG4gKiAgICBpcyBgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX1JFSkVDVF9EVVBMSUNBVEVgXG4gKiAgLSBUaGVyZSBpcyBjbG9zZWQgV29ya2Zsb3cgaW4gdGhlIGBDb21wbGV0ZWRgIHN0YXRlIHdpdGggdGhlIHNhbWUgV29ya2Zsb3cgSWQgYW5kIHRoZSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLndvcmtmbG93SWRSZXVzZVBvbGljeX1cbiAqICAgIGlzIGBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfQUxMT1dfRFVQTElDQVRFX0ZBSUxFRF9PTkxZYFxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1dvcmtmbG93RXhlY3V0aW9uQWxyZWFkeVN0YXJ0ZWRFcnJvcicpXG5leHBvcnQgY2xhc3MgV29ya2Zsb3dFeGVjdXRpb25BbHJlYWR5U3RhcnRlZEVycm9yIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSB3b3JrZmxvd0lkOiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IHdvcmtmbG93VHlwZTogc3RyaW5nXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYSBXb3JrZmxvdyB3aXRoIHRoZSBnaXZlbiBJZCBpcyBub3Qga25vd24gdG8gVGVtcG9yYWwgU2VydmVyLlxuICogSXQgY291bGQgYmUgYmVjYXVzZTpcbiAqIC0gSWQgcGFzc2VkIGlzIGluY29ycmVjdFxuICogLSBXb3JrZmxvdyBpcyBjbG9zZWQgKGZvciBzb21lIGNhbGxzLCBlLmcuIGB0ZXJtaW5hdGVgKVxuICogLSBXb3JrZmxvdyB3YXMgZGVsZXRlZCBmcm9tIHRoZSBTZXJ2ZXIgYWZ0ZXIgcmVhY2hpbmcgaXRzIHJldGVudGlvbiBsaW1pdFxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1dvcmtmbG93Tm90Rm91bmRFcnJvcicpXG5leHBvcnQgY2xhc3MgV29ya2Zsb3dOb3RGb3VuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IHdvcmtmbG93SWQ6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgcnVuSWQ6IHN0cmluZyB8IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIHRoZSBzcGVjaWZpZWQgbmFtZXNwYWNlIGlzIG5vdCBrbm93biB0byBUZW1wb3JhbCBTZXJ2ZXIuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignTmFtZXNwYWNlTm90Rm91bmRFcnJvcicpXG5leHBvcnQgY2xhc3MgTmFtZXNwYWNlTm90Rm91bmRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IG5hbWVzcGFjZTogc3RyaW5nKSB7XG4gICAgc3VwZXIoYE5hbWVzcGFjZSBub3QgZm91bmQ6ICcke25hbWVzcGFjZX0nYCk7XG4gIH1cbn1cbiIsImltcG9ydCB0eXBlIHsgdGVtcG9yYWwgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBjaGVja0V4dGVuZHMsIGVycm9yTWVzc2FnZSwgaXNSZWNvcmQsIFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yIH0gZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuXG5leHBvcnQgY29uc3QgRkFJTFVSRV9TT1VSQ0UgPSAnVHlwZVNjcmlwdFNESyc7XG5leHBvcnQgdHlwZSBQcm90b0ZhaWx1cmUgPSB0ZW1wb3JhbC5hcGkuZmFpbHVyZS52MS5JRmFpbHVyZTtcblxuLy8gQXZvaWQgaW1wb3J0aW5nIHRoZSBwcm90byBpbXBsZW1lbnRhdGlvbiB0byByZWR1Y2Ugd29ya2Zsb3cgYnVuZGxlIHNpemVcbi8vIENvcGllZCBmcm9tIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5UaW1lb3V0VHlwZVxuZXhwb3J0IGVudW0gVGltZW91dFR5cGUge1xuICBUSU1FT1VUX1RZUEVfVU5TUEVDSUZJRUQgPSAwLFxuICBUSU1FT1VUX1RZUEVfU1RBUlRfVE9fQ0xPU0UgPSAxLFxuICBUSU1FT1VUX1RZUEVfU0NIRURVTEVfVE9fU1RBUlQgPSAyLFxuICBUSU1FT1VUX1RZUEVfU0NIRURVTEVfVE9fQ0xPU0UgPSAzLFxuICBUSU1FT1VUX1RZUEVfSEVBUlRCRUFUID0gNCxcbn1cblxuY2hlY2tFeHRlbmRzPHRlbXBvcmFsLmFwaS5lbnVtcy52MS5UaW1lb3V0VHlwZSwgVGltZW91dFR5cGU+KCk7XG5jaGVja0V4dGVuZHM8VGltZW91dFR5cGUsIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5UaW1lb3V0VHlwZT4oKTtcblxuLy8gQXZvaWQgaW1wb3J0aW5nIHRoZSBwcm90byBpbXBsZW1lbnRhdGlvbiB0byByZWR1Y2Ugd29ya2Zsb3cgYnVuZGxlIHNpemVcbi8vIENvcGllZCBmcm9tIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5SZXRyeVN0YXRlXG5leHBvcnQgZW51bSBSZXRyeVN0YXRlIHtcbiAgUkVUUllfU1RBVEVfVU5TUEVDSUZJRUQgPSAwLFxuICBSRVRSWV9TVEFURV9JTl9QUk9HUkVTUyA9IDEsXG4gIFJFVFJZX1NUQVRFX05PTl9SRVRSWUFCTEVfRkFJTFVSRSA9IDIsXG4gIFJFVFJZX1NUQVRFX1RJTUVPVVQgPSAzLFxuICBSRVRSWV9TVEFURV9NQVhJTVVNX0FUVEVNUFRTX1JFQUNIRUQgPSA0LFxuICBSRVRSWV9TVEFURV9SRVRSWV9QT0xJQ1lfTk9UX1NFVCA9IDUsXG4gIFJFVFJZX1NUQVRFX0lOVEVSTkFMX1NFUlZFUl9FUlJPUiA9IDYsXG4gIFJFVFJZX1NUQVRFX0NBTkNFTF9SRVFVRVNURUQgPSA3LFxufVxuXG5jaGVja0V4dGVuZHM8dGVtcG9yYWwuYXBpLmVudW1zLnYxLlJldHJ5U3RhdGUsIFJldHJ5U3RhdGU+KCk7XG5jaGVja0V4dGVuZHM8UmV0cnlTdGF0ZSwgdGVtcG9yYWwuYXBpLmVudW1zLnYxLlJldHJ5U3RhdGU+KCk7XG5cbmV4cG9ydCB0eXBlIFdvcmtmbG93RXhlY3V0aW9uID0gdGVtcG9yYWwuYXBpLmNvbW1vbi52MS5JV29ya2Zsb3dFeGVjdXRpb247XG5cbi8qKlxuICogUmVwcmVzZW50cyBmYWlsdXJlcyB0aGF0IGNhbiBjcm9zcyBXb3JrZmxvdyBhbmQgQWN0aXZpdHkgYm91bmRhcmllcy5cbiAqXG4gKiAqKk5ldmVyIGV4dGVuZCB0aGlzIGNsYXNzIG9yIGFueSBvZiBpdHMgY2hpbGRyZW4uKipcbiAqXG4gKiBUaGUgb25seSBjaGlsZCBjbGFzcyB5b3Ugc2hvdWxkIGV2ZXIgdGhyb3cgZnJvbSB5b3VyIGNvZGUgaXMge0BsaW5rIEFwcGxpY2F0aW9uRmFpbHVyZX0uXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignVGVtcG9yYWxGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBUZW1wb3JhbEZhaWx1cmUgZXh0ZW5kcyBFcnJvciB7XG4gIC8qKlxuICAgKiBUaGUgb3JpZ2luYWwgZmFpbHVyZSB0aGF0IGNvbnN0cnVjdGVkIHRoaXMgZXJyb3IuXG4gICAqXG4gICAqIE9ubHkgcHJlc2VudCBpZiB0aGlzIGVycm9yIHdhcyBnZW5lcmF0ZWQgZnJvbSBhbiBleHRlcm5hbCBvcGVyYXRpb24uXG4gICAqL1xuICBwdWJsaWMgZmFpbHVyZT86IFByb3RvRmFpbHVyZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlPzogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgY2F1c2U/OiBFcnJvclxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IHVuZGVmaW5lZCk7XG4gIH1cbn1cblxuLyoqIEV4Y2VwdGlvbnMgb3JpZ2luYXRlZCBhdCB0aGUgVGVtcG9yYWwgc2VydmljZS4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignU2VydmVyRmFpbHVyZScpXG5leHBvcnQgY2xhc3MgU2VydmVyRmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgbm9uUmV0cnlhYmxlOiBib29sZWFuLFxuICAgIGNhdXNlPzogRXJyb3JcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgY2F1c2UpO1xuICB9XG59XG5cbi8qKlxuICogYEFwcGxpY2F0aW9uRmFpbHVyZWBzIGFyZSB1c2VkIHRvIGNvbW11bmljYXRlIGFwcGxpY2F0aW9uLXNwZWNpZmljIGZhaWx1cmVzIGluIFdvcmtmbG93cyBhbmQgQWN0aXZpdGllcy5cbiAqXG4gKiBUaGUge0BsaW5rIHR5cGV9IHByb3BlcnR5IGlzIG1hdGNoZWQgYWdhaW5zdCB7QGxpbmsgUmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlc30gdG8gZGV0ZXJtaW5lIGlmIGFuIGluc3RhbmNlXG4gKiBvZiB0aGlzIGVycm9yIGlzIHJldHJ5YWJsZS4gQW5vdGhlciB3YXkgdG8gYXZvaWQgcmV0cnlpbmcgaXMgYnkgc2V0dGluZyB0aGUge0BsaW5rIG5vblJldHJ5YWJsZX0gZmxhZyB0byBgdHJ1ZWAuXG4gKlxuICogSW4gV29ya2Zsb3dzLCBpZiB5b3UgdGhyb3cgYSBub24tYEFwcGxpY2F0aW9uRmFpbHVyZWAsIHRoZSBXb3JrZmxvdyBUYXNrIHdpbGwgZmFpbCBhbmQgYmUgcmV0cmllZC4gSWYgeW91IHRocm93IGFuXG4gKiBgQXBwbGljYXRpb25GYWlsdXJlYCwgdGhlIFdvcmtmbG93IEV4ZWN1dGlvbiB3aWxsIGZhaWwuXG4gKlxuICogSW4gQWN0aXZpdGllcywgeW91IGNhbiBlaXRoZXIgdGhyb3cgYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAgb3IgYW5vdGhlciBgRXJyb3JgIHRvIGZhaWwgdGhlIEFjdGl2aXR5IFRhc2suIEluIHRoZVxuICogbGF0dGVyIGNhc2UsIHRoZSBgRXJyb3JgIHdpbGwgYmUgY29udmVydGVkIHRvIGFuIGBBcHBsaWNhdGlvbkZhaWx1cmVgLiBUaGUgY29udmVyc2lvbiBpcyBkb25lIGFzIGZvbGxvd2luZzpcbiAqXG4gKiAtIGB0eXBlYCBpcyBzZXQgdG8gYGVycm9yLmNvbnN0cnVjdG9yPy5uYW1lID8/IGVycm9yLm5hbWVgXG4gKiAtIGBtZXNzYWdlYCBpcyBzZXQgdG8gYGVycm9yLm1lc3NhZ2VgXG4gKiAtIGBub25SZXRyeWFibGVgIGlzIHNldCB0byBmYWxzZVxuICogLSBgZGV0YWlsc2AgYXJlIHNldCB0byBudWxsXG4gKiAtIHN0YWNrIHRyYWNlIGlzIGNvcGllZCBmcm9tIHRoZSBvcmlnaW5hbCBlcnJvclxuICpcbiAqIFdoZW4gYW4ge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9jb25jZXB0cy93aGF0LWlzLWFuLWFjdGl2aXR5LWV4ZWN1dGlvbiB8IEFjdGl2aXR5IEV4ZWN1dGlvbn0gZmFpbHMsIHRoZVxuICogYEFwcGxpY2F0aW9uRmFpbHVyZWAgZnJvbSB0aGUgbGFzdCBBY3Rpdml0eSBUYXNrIHdpbGwgYmUgdGhlIGBjYXVzZWAgb2YgdGhlIHtAbGluayBBY3Rpdml0eUZhaWx1cmV9IHRocm93biBpbiB0aGVcbiAqIFdvcmtmbG93LlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0FwcGxpY2F0aW9uRmFpbHVyZScpXG5leHBvcnQgY2xhc3MgQXBwbGljYXRpb25GYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgLyoqXG4gICAqIEFsdGVybmF0aXZlbHksIHVzZSB7QGxpbmsgZnJvbUVycm9yfSBvciB7QGxpbmsgY3JlYXRlfS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U/OiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIHB1YmxpYyByZWFkb25seSB0eXBlPzogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgbm9uUmV0cnlhYmxlPzogYm9vbGVhbiB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgcHVibGljIHJlYWRvbmx5IGRldGFpbHM/OiB1bmtub3duW10gfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIGNhdXNlPzogRXJyb3JcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgY2F1c2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgQXBwbGljYXRpb25GYWlsdXJlYCBmcm9tIGFuIEVycm9yIG9iamVjdC5cbiAgICpcbiAgICogRmlyc3QgY2FsbHMge0BsaW5rIGVuc3VyZUFwcGxpY2F0aW9uRmFpbHVyZSB8IGBlbnN1cmVBcHBsaWNhdGlvbkZhaWx1cmUoZXJyb3IpYH0gYW5kIHRoZW4gb3ZlcnJpZGVzIGFueSBmaWVsZHNcbiAgICogcHJvdmlkZWQgaW4gYG92ZXJyaWRlc2AuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21FcnJvcihlcnJvcjogRXJyb3IgfCB1bmtub3duLCBvdmVycmlkZXM/OiBBcHBsaWNhdGlvbkZhaWx1cmVPcHRpb25zKTogQXBwbGljYXRpb25GYWlsdXJlIHtcbiAgICBjb25zdCBmYWlsdXJlID0gZW5zdXJlQXBwbGljYXRpb25GYWlsdXJlKGVycm9yKTtcbiAgICBPYmplY3QuYXNzaWduKGZhaWx1cmUsIG92ZXJyaWRlcyk7XG4gICAgcmV0dXJuIGZhaWx1cmU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBBcHBsaWNhdGlvbkZhaWx1cmVgLlxuICAgKlxuICAgKiBCeSBkZWZhdWx0LCB3aWxsIGJlIHJldHJ5YWJsZSAodW5sZXNzIGl0cyBgdHlwZWAgaXMgaW5jbHVkZWQgaW4ge0BsaW5rIFJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXN9KS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9wdGlvbnM6IEFwcGxpY2F0aW9uRmFpbHVyZU9wdGlvbnMpOiBBcHBsaWNhdGlvbkZhaWx1cmUge1xuICAgIGNvbnN0IHsgbWVzc2FnZSwgdHlwZSwgbm9uUmV0cnlhYmxlID0gZmFsc2UsIGRldGFpbHMsIGNhdXNlIH0gPSBvcHRpb25zO1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlLCB0eXBlLCBub25SZXRyeWFibGUsIGRldGFpbHMsIGNhdXNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBuZXcgYEFwcGxpY2F0aW9uRmFpbHVyZWAgd2l0aCB0aGUge0BsaW5rIG5vblJldHJ5YWJsZX0gZmxhZyBzZXQgdG8gZmFsc2UuIE5vdGUgdGhhdCB0aGlzIGVycm9yIHdpbGwgc3RpbGxcbiAgICogbm90IGJlIHJldHJpZWQgaWYgaXRzIGB0eXBlYCBpcyBpbmNsdWRlZCBpbiB7QGxpbmsgUmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlc30uXG4gICAqXG4gICAqIEBwYXJhbSBtZXNzYWdlIE9wdGlvbmFsIGVycm9yIG1lc3NhZ2VcbiAgICogQHBhcmFtIHR5cGUgT3B0aW9uYWwgZXJyb3IgdHlwZSAodXNlZCBieSB7QGxpbmsgUmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlc30pXG4gICAqIEBwYXJhbSBkZXRhaWxzIE9wdGlvbmFsIGRldGFpbHMgYWJvdXQgdGhlIGZhaWx1cmUuIFNlcmlhbGl6ZWQgYnkgdGhlIFdvcmtlcidzIHtAbGluayBQYXlsb2FkQ29udmVydGVyfS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcmV0cnlhYmxlKG1lc3NhZ2U/OiBzdHJpbmcgfCBudWxsLCB0eXBlPzogc3RyaW5nIHwgbnVsbCwgLi4uZGV0YWlsczogdW5rbm93bltdKTogQXBwbGljYXRpb25GYWlsdXJlIHtcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSwgdHlwZSA/PyAnRXJyb3InLCBmYWxzZSwgZGV0YWlscyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgbmV3IGBBcHBsaWNhdGlvbkZhaWx1cmVgIHdpdGggdGhlIHtAbGluayBub25SZXRyeWFibGV9IGZsYWcgc2V0IHRvIHRydWUuXG4gICAqXG4gICAqIFdoZW4gdGhyb3duIGZyb20gYW4gQWN0aXZpdHkgb3IgV29ya2Zsb3csIHRoZSBBY3Rpdml0eSBvciBXb3JrZmxvdyB3aWxsIG5vdCBiZSByZXRyaWVkIChldmVuIGlmIGB0eXBlYCBpcyBub3RcbiAgICogbGlzdGVkIGluIHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfSkuXG4gICAqXG4gICAqIEBwYXJhbSBtZXNzYWdlIE9wdGlvbmFsIGVycm9yIG1lc3NhZ2VcbiAgICogQHBhcmFtIHR5cGUgT3B0aW9uYWwgZXJyb3IgdHlwZVxuICAgKiBAcGFyYW0gZGV0YWlscyBPcHRpb25hbCBkZXRhaWxzIGFib3V0IHRoZSBmYWlsdXJlLiBTZXJpYWxpemVkIGJ5IHRoZSBXb3JrZXIncyB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn0uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIG5vblJldHJ5YWJsZShtZXNzYWdlPzogc3RyaW5nIHwgbnVsbCwgdHlwZT86IHN0cmluZyB8IG51bGwsIC4uLmRldGFpbHM6IHVua25vd25bXSk6IEFwcGxpY2F0aW9uRmFpbHVyZSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKG1lc3NhZ2UsIHR5cGUgPz8gJ0Vycm9yJywgdHJ1ZSwgZGV0YWlscyk7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBBcHBsaWNhdGlvbkZhaWx1cmVPcHRpb25zIHtcbiAgLyoqXG4gICAqIEVycm9yIG1lc3NhZ2VcbiAgICovXG4gIG1lc3NhZ2U/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEVycm9yIHR5cGUgKHVzZWQgYnkge0BsaW5rIFJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXN9KVxuICAgKi9cbiAgdHlwZT86IHN0cmluZztcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgY3VycmVudCBBY3Rpdml0eSBvciBXb3JrZmxvdyBjYW4gYmUgcmV0cmllZFxuICAgKlxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgbm9uUmV0cnlhYmxlPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogRGV0YWlscyBhYm91dCB0aGUgZmFpbHVyZS4gU2VyaWFsaXplZCBieSB0aGUgV29ya2VyJ3Mge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJ9LlxuICAgKi9cbiAgZGV0YWlscz86IHVua25vd25bXTtcblxuICAvKipcbiAgICogQ2F1c2Ugb2YgdGhlIGZhaWx1cmVcbiAgICovXG4gIGNhdXNlPzogRXJyb3I7XG59XG5cbi8qKlxuICogVGhpcyBlcnJvciBpcyB0aHJvd24gd2hlbiBDYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLiBUbyBhbGxvdyBDYW5jZWxsYXRpb24gdG8gaGFwcGVuLCBsZXQgaXQgcHJvcGFnYXRlLiBUb1xuICogaWdub3JlIENhbmNlbGxhdGlvbiwgY2F0Y2ggaXQgYW5kIGNvbnRpbnVlIGV4ZWN1dGluZy4gTm90ZSB0aGF0IENhbmNlbGxhdGlvbiBjYW4gb25seSBiZSByZXF1ZXN0ZWQgYSBzaW5nbGUgdGltZSwgc29cbiAqIHlvdXIgV29ya2Zsb3cvQWN0aXZpdHkgRXhlY3V0aW9uIHdpbGwgbm90IHJlY2VpdmUgZnVydGhlciBDYW5jZWxsYXRpb24gcmVxdWVzdHMuXG4gKlxuICogV2hlbiBhIFdvcmtmbG93IG9yIEFjdGl2aXR5IGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBjYW5jZWxsZWQsIGEgYENhbmNlbGxlZEZhaWx1cmVgIHdpbGwgYmUgdGhlIGBjYXVzZWAuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignQ2FuY2VsbGVkRmFpbHVyZScpXG5leHBvcnQgY2xhc3MgQ2FuY2VsbGVkRmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgZGV0YWlsczogdW5rbm93bltdID0gW10sXG4gICAgY2F1c2U/OiBFcnJvclxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlLCBjYXVzZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBVc2VkIGFzIHRoZSBgY2F1c2VgIHdoZW4gYSBXb3JrZmxvdyBoYXMgYmVlbiB0ZXJtaW5hdGVkXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignVGVybWluYXRlZEZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIFRlcm1pbmF0ZWRGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nIHwgdW5kZWZpbmVkLCBjYXVzZT86IEVycm9yKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgY2F1c2UpO1xuICB9XG59XG5cbi8qKlxuICogVXNlZCB0byByZXByZXNlbnQgdGltZW91dHMgb2YgQWN0aXZpdGllcyBhbmQgV29ya2Zsb3dzXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignVGltZW91dEZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIFRpbWVvdXRGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSBsYXN0SGVhcnRiZWF0RGV0YWlsczogdW5rbm93bixcbiAgICBwdWJsaWMgcmVhZG9ubHkgdGltZW91dFR5cGU6IFRpbWVvdXRUeXBlXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICB9XG59XG5cbi8qKlxuICogQ29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgYW4gQWN0aXZpdHkgZmFpbHVyZS4gQWx3YXlzIGNvbnRhaW5zIHRoZSBvcmlnaW5hbCByZWFzb24gZm9yIHRoZSBmYWlsdXJlIGFzIGl0cyBgY2F1c2VgLlxuICogRm9yIGV4YW1wbGUsIGlmIGFuIEFjdGl2aXR5IHRpbWVkIG91dCwgdGhlIGNhdXNlIHdpbGwgYmUgYSB7QGxpbmsgVGltZW91dEZhaWx1cmV9LlxuICpcbiAqIFRoaXMgZXhjZXB0aW9uIGlzIGV4cGVjdGVkIHRvIGJlIHRocm93biBvbmx5IGJ5IHRoZSBmcmFtZXdvcmsgY29kZS5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdBY3Rpdml0eUZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIEFjdGl2aXR5RmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcHVibGljIHJlYWRvbmx5IGFjdGl2aXR5VHlwZTogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSBhY3Rpdml0eUlkOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcHVibGljIHJlYWRvbmx5IHJldHJ5U3RhdGU6IFJldHJ5U3RhdGUsXG4gICAgcHVibGljIHJlYWRvbmx5IGlkZW50aXR5OiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgY2F1c2U/OiBFcnJvclxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlLCBjYXVzZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCBhIENoaWxkIFdvcmtmbG93IGZhaWx1cmUuIEFsd2F5cyBjb250YWlucyB0aGUgcmVhc29uIGZvciB0aGUgZmFpbHVyZSBhcyBpdHMge0BsaW5rIGNhdXNlfS5cbiAqIEZvciBleGFtcGxlLCBpZiB0aGUgQ2hpbGQgd2FzIFRlcm1pbmF0ZWQsIHRoZSBgY2F1c2VgIGlzIGEge0BsaW5rIFRlcm1pbmF0ZWRGYWlsdXJlfS5cbiAqXG4gKiBUaGlzIGV4Y2VwdGlvbiBpcyBleHBlY3RlZCB0byBiZSB0aHJvd24gb25seSBieSB0aGUgZnJhbWV3b3JrIGNvZGUuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignQ2hpbGRXb3JrZmxvd0ZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIENoaWxkV29ya2Zsb3dGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSBuYW1lc3BhY2U6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgZXhlY3V0aW9uOiBXb3JrZmxvd0V4ZWN1dGlvbixcbiAgICBwdWJsaWMgcmVhZG9ubHkgd29ya2Zsb3dUeXBlOiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IHJldHJ5U3RhdGU6IFJldHJ5U3RhdGUsXG4gICAgY2F1c2U/OiBFcnJvclxuICApIHtcbiAgICBzdXBlcignQ2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uIGZhaWxlZCcsIGNhdXNlKTtcbiAgfVxufVxuXG4vKipcbiAqIElmIGBlcnJvcmAgaXMgYWxyZWFkeSBhbiBgQXBwbGljYXRpb25GYWlsdXJlYCwgcmV0dXJucyBgZXJyb3JgLlxuICpcbiAqIE90aGVyd2lzZSwgY29udmVydHMgYGVycm9yYCBpbnRvIGFuIGBBcHBsaWNhdGlvbkZhaWx1cmVgIHdpdGg6XG4gKlxuICogLSBgbWVzc2FnZWA6IGBlcnJvci5tZXNzYWdlYCBvciBgU3RyaW5nKGVycm9yKWBcbiAqIC0gYHR5cGVgOiBgZXJyb3IuY29uc3RydWN0b3IubmFtZWAgb3IgYGVycm9yLm5hbWVgXG4gKiAtIGBzdGFja2A6IGBlcnJvci5zdGFja2Agb3IgYCcnYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlQXBwbGljYXRpb25GYWlsdXJlKGVycm9yOiB1bmtub3duKTogQXBwbGljYXRpb25GYWlsdXJlIHtcbiAgaWYgKGVycm9yIGluc3RhbmNlb2YgQXBwbGljYXRpb25GYWlsdXJlKSB7XG4gICAgcmV0dXJuIGVycm9yO1xuICB9XG5cbiAgY29uc3QgbWVzc2FnZSA9IChpc1JlY29yZChlcnJvcikgJiYgU3RyaW5nKGVycm9yLm1lc3NhZ2UpKSB8fCBTdHJpbmcoZXJyb3IpO1xuICBjb25zdCB0eXBlID0gKGlzUmVjb3JkKGVycm9yKSAmJiAoZXJyb3IuY29uc3RydWN0b3I/Lm5hbWUgPz8gZXJyb3IubmFtZSkpIHx8IHVuZGVmaW5lZDtcbiAgY29uc3QgZmFpbHVyZSA9IEFwcGxpY2F0aW9uRmFpbHVyZS5jcmVhdGUoeyBtZXNzYWdlLCB0eXBlLCBub25SZXRyeWFibGU6IGZhbHNlIH0pO1xuICBmYWlsdXJlLnN0YWNrID0gKGlzUmVjb3JkKGVycm9yKSAmJiBTdHJpbmcoZXJyb3Iuc3RhY2spKSB8fCAnJztcbiAgcmV0dXJuIGZhaWx1cmU7XG59XG5cbi8qKlxuICogSWYgYGVycmAgaXMgYW4gRXJyb3IgaXQgaXMgdHVybmVkIGludG8gYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAuXG4gKlxuICogSWYgYGVycmAgd2FzIGFscmVhZHkgYSBgVGVtcG9yYWxGYWlsdXJlYCwgcmV0dXJucyB0aGUgb3JpZ2luYWwgZXJyb3IuXG4gKlxuICogT3RoZXJ3aXNlIHJldHVybnMgYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAgd2l0aCBgU3RyaW5nKGVycilgIGFzIHRoZSBtZXNzYWdlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlVGVtcG9yYWxGYWlsdXJlKGVycjogdW5rbm93bik6IFRlbXBvcmFsRmFpbHVyZSB7XG4gIGlmIChlcnIgaW5zdGFuY2VvZiBUZW1wb3JhbEZhaWx1cmUpIHtcbiAgICByZXR1cm4gZXJyO1xuICB9XG4gIHJldHVybiBlbnN1cmVBcHBsaWNhdGlvbkZhaWx1cmUoZXJyKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIHJvb3QgY2F1c2UgbWVzc2FnZSBvZiBnaXZlbiBgZXJyb3JgLlxuICpcbiAqIEluIGNhc2UgYGVycm9yYCBpcyBhIHtAbGluayBUZW1wb3JhbEZhaWx1cmV9LCByZWN1cnNlIHRoZSBgY2F1c2VgIGNoYWluIGFuZCByZXR1cm4gdGhlIHJvb3QgYGNhdXNlLm1lc3NhZ2VgLlxuICogT3RoZXJ3aXNlLCByZXR1cm4gYGVycm9yLm1lc3NhZ2VgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcm9vdENhdXNlKGVycm9yOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGVycm9yIGluc3RhbmNlb2YgVGVtcG9yYWxGYWlsdXJlKSB7XG4gICAgcmV0dXJuIGVycm9yLmNhdXNlID8gcm9vdENhdXNlKGVycm9yLmNhdXNlKSA6IGVycm9yLm1lc3NhZ2U7XG4gIH1cbiAgcmV0dXJuIGVycm9yTWVzc2FnZShlcnJvcik7XG59XG4iLCIvKipcbiAqIENvbW1vbiBsaWJyYXJ5IGZvciBjb2RlIHRoYXQncyB1c2VkIGFjcm9zcyB0aGUgQ2xpZW50LCBXb3JrZXIsIGFuZC9vciBXb3JrZmxvd1xuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5pbXBvcnQgKiBhcyBlbmNvZGluZyBmcm9tICcuL2VuY29kaW5nJztcbmltcG9ydCAqIGFzIGhlbHBlcnMgZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuXG5leHBvcnQgKiBmcm9tICcuL2FjdGl2aXR5LW9wdGlvbnMnO1xuZXhwb3J0ICogZnJvbSAnLi9jb252ZXJ0ZXIvZGF0YS1jb252ZXJ0ZXInO1xuZXhwb3J0ICogZnJvbSAnLi9jb252ZXJ0ZXIvZmFpbHVyZS1jb252ZXJ0ZXInO1xuZXhwb3J0ICogZnJvbSAnLi9jb252ZXJ0ZXIvcGF5bG9hZC1jb2RlYyc7XG5leHBvcnQgKiBmcm9tICcuL2NvbnZlcnRlci9wYXlsb2FkLWNvbnZlcnRlcic7XG5leHBvcnQgKiBmcm9tICcuL2NvbnZlcnRlci90eXBlcyc7XG5leHBvcnQgKiBmcm9tICcuL2RlcHJlY2F0ZWQtdGltZSc7XG5leHBvcnQgKiBmcm9tICcuL2Vycm9ycyc7XG5leHBvcnQgKiBmcm9tICcuL2ZhaWx1cmUnO1xuZXhwb3J0IHsgSGVhZGVycywgTmV4dCB9IGZyb20gJy4vaW50ZXJjZXB0b3JzJztcbmV4cG9ydCAqIGZyb20gJy4vaW50ZXJmYWNlcyc7XG5leHBvcnQgKiBmcm9tICcuL2xvZ2dlcic7XG5leHBvcnQgKiBmcm9tICcuL3JldHJ5LXBvbGljeSc7XG5leHBvcnQgdHlwZSB7IFRpbWVzdGFtcCwgRHVyYXRpb24sIFN0cmluZ1ZhbHVlIH0gZnJvbSAnLi90aW1lJztcbmV4cG9ydCAqIGZyb20gJy4vd29ya2Zsb3ctaGFuZGxlJztcbmV4cG9ydCAqIGZyb20gJy4vd29ya2Zsb3ctb3B0aW9ucyc7XG5leHBvcnQgKiBmcm9tICcuL3ZlcnNpb25pbmctaW50ZW50JztcblxuLyoqXG4gKiBFbmNvZGUgYSBVVEYtOCBzdHJpbmcgaW50byBhIFVpbnQ4QXJyYXlcbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gdTgoczogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIHJldHVybiBlbmNvZGluZy5lbmNvZGUocyk7XG59XG5cbi8qKlxuICogRGVjb2RlIGEgVWludDhBcnJheSBpbnRvIGEgVVRGLTggc3RyaW5nXG4gKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cihhcnI6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICByZXR1cm4gZW5jb2RpbmcuZGVjb2RlKGFycik7XG59XG5cbi8qKlxuICogR2V0IGBlcnJvci5tZXNzYWdlYCAob3IgYHVuZGVmaW5lZGAgaWYgbm90IHByZXNlbnQpXG4gKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yTWVzc2FnZShlcnJvcjogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBoZWxwZXJzLmVycm9yTWVzc2FnZShlcnJvcik7XG59XG5cbi8qKlxuICogR2V0IGBlcnJvci5jb2RlYCAob3IgYHVuZGVmaW5lZGAgaWYgbm90IHByZXNlbnQpXG4gKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yQ29kZShlcnJvcjogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBoZWxwZXJzLmVycm9yQ29kZShlcnJvcik7XG59XG4iLCJpbXBvcnQgeyBBbnlGdW5jLCBPbWl0TGFzdFBhcmFtIH0gZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHsgUGF5bG9hZCB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbi8qKlxuICogVHlwZSBvZiB0aGUgbmV4dCBmdW5jdGlvbiBmb3IgYSBnaXZlbiBpbnRlcmNlcHRvciBmdW5jdGlvblxuICpcbiAqIENhbGxlZCBmcm9tIGFuIGludGVyY2VwdG9yIHRvIGNvbnRpbnVlIHRoZSBpbnRlcmNlcHRpb24gY2hhaW5cbiAqL1xuZXhwb3J0IHR5cGUgTmV4dDxJRiwgRk4gZXh0ZW5kcyBrZXlvZiBJRj4gPSBSZXF1aXJlZDxJRj5bRk5dIGV4dGVuZHMgQW55RnVuYyA/IE9taXRMYXN0UGFyYW08UmVxdWlyZWQ8SUY+W0ZOXT4gOiBuZXZlcjtcblxuLyoqIEhlYWRlcnMgYXJlIGp1c3QgYSBtYXBwaW5nIG9mIGhlYWRlciBuYW1lIHRvIFBheWxvYWQgKi9cbmV4cG9ydCB0eXBlIEhlYWRlcnMgPSBSZWNvcmQ8c3RyaW5nLCBQYXlsb2FkPjtcblxuLyoqXG4gKiBDb21wb3NlIGFsbCBpbnRlcmNlcHRvciBtZXRob2RzIGludG8gYSBzaW5nbGUgZnVuY3Rpb24uXG4gKlxuICogQ2FsbGluZyB0aGUgY29tcG9zZWQgZnVuY3Rpb24gcmVzdWx0cyBpbiBjYWxsaW5nIGVhY2ggb2YgdGhlIHByb3ZpZGVkIGludGVyY2VwdG9yLCBpbiBvcmRlciAoZnJvbSB0aGUgZmlyc3QgdG9cbiAqIHRoZSBsYXN0KSwgZm9sbG93ZWQgYnkgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHByb3ZpZGVkIGFzIGFyZ3VtZW50IHRvIGBjb21wb3NlSW50ZXJjZXB0b3JzKClgLlxuICpcbiAqIEBwYXJhbSBpbnRlcmNlcHRvcnMgYSBsaXN0IG9mIGludGVyY2VwdG9yc1xuICogQHBhcmFtIG1ldGhvZCB0aGUgbmFtZSBvZiB0aGUgaW50ZXJjZXB0b3IgbWV0aG9kIHRvIGNvbXBvc2VcbiAqIEBwYXJhbSBuZXh0IHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB0byBiZSBleGVjdXRlZCBhdCB0aGUgZW5kIG9mIHRoZSBpbnRlcmNlcHRpb24gY2hhaW5cbiAqL1xuLy8gdHMtcHJ1bmUtaWdub3JlLW5leHQgKGltcG9ydGVkIHZpYSBsaWIvaW50ZXJjZXB0b3JzKVxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvc2VJbnRlcmNlcHRvcnM8SSwgTSBleHRlbmRzIGtleW9mIEk+KGludGVyY2VwdG9yczogSVtdLCBtZXRob2Q6IE0sIG5leHQ6IE5leHQ8SSwgTT4pOiBOZXh0PEksIE0+IHtcbiAgZm9yIChsZXQgaSA9IGludGVyY2VwdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgIGNvbnN0IGludGVyY2VwdG9yID0gaW50ZXJjZXB0b3JzW2ldO1xuICAgIGlmIChpbnRlcmNlcHRvclttZXRob2RdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IHByZXYgPSBuZXh0O1xuICAgICAgLy8gV2UgbG9zZSB0eXBlIHNhZmV0eSBoZXJlIGJlY2F1c2UgVHlwZXNjcmlwdCBjYW4ndCBkZWR1Y2UgdGhhdCBpbnRlcmNlcHRvclttZXRob2RdIGlzIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zXG4gICAgICAvLyB0aGUgc2FtZSB0eXBlIGFzIE5leHQ8SSwgTT5cbiAgICAgIG5leHQgPSAoKGlucHV0OiBhbnkpID0+IChpbnRlcmNlcHRvclttZXRob2RdIGFzIGFueSkoaW5wdXQsIHByZXYpKSBhcyBhbnk7XG4gICAgfVxuICB9XG4gIHJldHVybiBuZXh0O1xufVxuIiwiaW1wb3J0IHR5cGUgeyB0ZW1wb3JhbCB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcblxuZXhwb3J0IHR5cGUgUGF5bG9hZCA9IHRlbXBvcmFsLmFwaS5jb21tb24udjEuSVBheWxvYWQ7XG5cbi8qKiBUeXBlIHRoYXQgY2FuIGJlIHJldHVybmVkIGZyb20gYSBXb3JrZmxvdyBgZXhlY3V0ZWAgZnVuY3Rpb24gKi9cbmV4cG9ydCB0eXBlIFdvcmtmbG93UmV0dXJuVHlwZSA9IFByb21pc2U8YW55PjtcbmV4cG9ydCB0eXBlIFdvcmtmbG93VXBkYXRlVHlwZSA9ICguLi5hcmdzOiBhbnlbXSkgPT4gUHJvbWlzZTxhbnk+IHwgYW55O1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dVcGRhdGVWYWxpZGF0b3JUeXBlID0gKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dVcGRhdGVBbm5vdGF0ZWRUeXBlID0ge1xuICBoYW5kbGVyOiBXb3JrZmxvd1VwZGF0ZVR5cGU7XG4gIHZhbGlkYXRvcj86IFdvcmtmbG93VXBkYXRlVmFsaWRhdG9yVHlwZTtcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG59O1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dTaWduYWxUeXBlID0gKC4uLmFyZ3M6IGFueVtdKSA9PiBQcm9taXNlPHZvaWQ+IHwgdm9pZDtcbmV4cG9ydCB0eXBlIFdvcmtmbG93U2lnbmFsQW5ub3RhdGVkVHlwZSA9IHsgaGFuZGxlcjogV29ya2Zsb3dTaWduYWxUeXBlOyBkZXNjcmlwdGlvbj86IHN0cmluZyB9O1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dRdWVyeVR5cGUgPSAoLi4uYXJnczogYW55W10pID0+IGFueTtcbmV4cG9ydCB0eXBlIFdvcmtmbG93UXVlcnlBbm5vdGF0ZWRUeXBlID0geyBoYW5kbGVyOiBXb3JrZmxvd1F1ZXJ5VHlwZTsgZGVzY3JpcHRpb24/OiBzdHJpbmcgfTtcblxuLyoqXG4gKiBCcm9hZCBXb3JrZmxvdyBmdW5jdGlvbiBkZWZpbml0aW9uLCBzcGVjaWZpYyBXb3JrZmxvd3Mgd2lsbCB0eXBpY2FsbHkgdXNlIGEgbmFycm93ZXIgdHlwZSBkZWZpbml0aW9uLCBlLmc6XG4gKiBgYGB0c1xuICogZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG15V29ya2Zsb3coYXJnMTogbnVtYmVyLCBhcmcyOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz47XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHR5cGUgV29ya2Zsb3cgPSAoLi4uYXJnczogYW55W10pID0+IFdvcmtmbG93UmV0dXJuVHlwZTtcblxuZGVjbGFyZSBjb25zdCBhcmdzQnJhbmQ6IHVuaXF1ZSBzeW1ib2w7XG5kZWNsYXJlIGNvbnN0IHJldEJyYW5kOiB1bmlxdWUgc3ltYm9sO1xuXG4vKipcbiAqIEFuIGludGVyZmFjZSByZXByZXNlbnRpbmcgYSBXb3JrZmxvdyB1cGRhdGUgZGVmaW5pdGlvbiwgYXMgcmV0dXJuZWQgZnJvbSB7QGxpbmsgZGVmaW5lVXBkYXRlfVxuICpcbiAqIEByZW1hcmtzIGBBcmdzYCBjYW4gYmUgdXNlZCBmb3IgcGFyYW1ldGVyIHR5cGUgaW5mZXJlbmNlIGluIGhhbmRsZXIgZnVuY3Rpb25zIGFuZCBXb3JrZmxvd0hhbmRsZSBtZXRob2RzLlxuICogYE5hbWVgIGNhbiBvcHRpb25hbGx5IGJlIHNwZWNpZmllZCB3aXRoIGEgc3RyaW5nIGxpdGVyYWwgdHlwZSB0byBwcmVzZXJ2ZSB0eXBlLWxldmVsIGtub3dsZWRnZSBvZiB0aGUgdXBkYXRlIG5hbWUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVXBkYXRlRGVmaW5pdGlvbjxSZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiB7XG4gIHR5cGU6ICd1cGRhdGUnO1xuICBuYW1lOiBOYW1lO1xuICAvKipcbiAgICogVmlydHVhbCB0eXBlIGJyYW5kIHRvIG1haW50YWluIGEgZGlzdGluY3Rpb24gYmV0d2VlbiB7QGxpbmsgVXBkYXRlRGVmaW5pdGlvbn0gdHlwZXMgd2l0aCBkaWZmZXJlbnQgYXJncy5cbiAgICogVGhpcyBmaWVsZCBpcyBub3QgcHJlc2VudCBhdCBydW4tdGltZS5cbiAgICovXG4gIFthcmdzQnJhbmRdOiBBcmdzO1xuICAvKipcbiAgICogVmlydHVhbCB0eXBlIGJyYW5kIHRvIG1haW50YWluIGEgZGlzdGluY3Rpb24gYmV0d2VlbiB7QGxpbmsgVXBkYXRlRGVmaW5pdGlvbn0gdHlwZXMgd2l0aCBkaWZmZXJlbnQgcmV0dXJuIHR5cGVzLlxuICAgKiBUaGlzIGZpZWxkIGlzIG5vdCBwcmVzZW50IGF0IHJ1bi10aW1lLlxuICAgKi9cbiAgW3JldEJyYW5kXTogUmV0O1xufVxuXG4vKipcbiAqIEFuIGludGVyZmFjZSByZXByZXNlbnRpbmcgYSBXb3JrZmxvdyBzaWduYWwgZGVmaW5pdGlvbiwgYXMgcmV0dXJuZWQgZnJvbSB7QGxpbmsgZGVmaW5lU2lnbmFsfVxuICpcbiAqIEByZW1hcmtzIGBBcmdzYCBjYW4gYmUgdXNlZCBmb3IgcGFyYW1ldGVyIHR5cGUgaW5mZXJlbmNlIGluIGhhbmRsZXIgZnVuY3Rpb25zIGFuZCBXb3JrZmxvd0hhbmRsZSBtZXRob2RzLlxuICogYE5hbWVgIGNhbiBvcHRpb25hbGx5IGJlIHNwZWNpZmllZCB3aXRoIGEgc3RyaW5nIGxpdGVyYWwgdHlwZSB0byBwcmVzZXJ2ZSB0eXBlLWxldmVsIGtub3dsZWRnZSBvZiB0aGUgc2lnbmFsIG5hbWUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmFsRGVmaW5pdGlvbjxBcmdzIGV4dGVuZHMgYW55W10gPSBbXSwgTmFtZSBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4ge1xuICB0eXBlOiAnc2lnbmFsJztcbiAgbmFtZTogTmFtZTtcbiAgLyoqXG4gICAqIFZpcnR1YWwgdHlwZSBicmFuZCB0byBtYWludGFpbiBhIGRpc3RpbmN0aW9uIGJldHdlZW4ge0BsaW5rIFNpZ25hbERlZmluaXRpb259IHR5cGVzIHdpdGggZGlmZmVyZW50IGFyZ3MuXG4gICAqIFRoaXMgZmllbGQgaXMgbm90IHByZXNlbnQgYXQgcnVuLXRpbWUuXG4gICAqL1xuICBbYXJnc0JyYW5kXTogQXJncztcbn1cblxuLyoqXG4gKiBBbiBpbnRlcmZhY2UgcmVwcmVzZW50aW5nIGEgV29ya2Zsb3cgcXVlcnkgZGVmaW5pdGlvbiBhcyByZXR1cm5lZCBmcm9tIHtAbGluayBkZWZpbmVRdWVyeX1cbiAqXG4gKiBAcmVtYXJrcyBgQXJnc2AgYW5kIGBSZXRgIGNhbiBiZSB1c2VkIGZvciBwYXJhbWV0ZXIgdHlwZSBpbmZlcmVuY2UgaW4gaGFuZGxlciBmdW5jdGlvbnMgYW5kIFdvcmtmbG93SGFuZGxlIG1ldGhvZHMuXG4gKiBgTmFtZWAgY2FuIG9wdGlvbmFsbHkgYmUgc3BlY2lmaWVkIHdpdGggYSBzdHJpbmcgbGl0ZXJhbCB0eXBlIHRvIHByZXNlcnZlIHR5cGUtbGV2ZWwga25vd2xlZGdlIG9mIHRoZSBxdWVyeSBuYW1lLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXJ5RGVmaW5pdGlvbjxSZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiB7XG4gIHR5cGU6ICdxdWVyeSc7XG4gIG5hbWU6IE5hbWU7XG4gIC8qKlxuICAgKiBWaXJ0dWFsIHR5cGUgYnJhbmQgdG8gbWFpbnRhaW4gYSBkaXN0aW5jdGlvbiBiZXR3ZWVuIHtAbGluayBRdWVyeURlZmluaXRpb259IHR5cGVzIHdpdGggZGlmZmVyZW50IGFyZ3MuXG4gICAqIFRoaXMgZmllbGQgaXMgbm90IHByZXNlbnQgYXQgcnVuLXRpbWUuXG4gICAqL1xuICBbYXJnc0JyYW5kXTogQXJncztcbiAgLyoqXG4gICAqIFZpcnR1YWwgdHlwZSBicmFuZCB0byBtYWludGFpbiBhIGRpc3RpbmN0aW9uIGJldHdlZW4ge0BsaW5rIFF1ZXJ5RGVmaW5pdGlvbn0gdHlwZXMgd2l0aCBkaWZmZXJlbnQgcmV0dXJuIHR5cGVzLlxuICAgKiBUaGlzIGZpZWxkIGlzIG5vdCBwcmVzZW50IGF0IHJ1bi10aW1lLlxuICAgKi9cbiAgW3JldEJyYW5kXTogUmV0O1xufVxuXG4vKiogR2V0IHRoZSBcInVud3JhcHBlZFwiIHJldHVybiB0eXBlICh3aXRob3V0IFByb21pc2UpIG9mIHRoZSBleGVjdXRlIGhhbmRsZXIgZnJvbSBXb3JrZmxvdyB0eXBlIGBXYCAqL1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dSZXN1bHRUeXBlPFcgZXh0ZW5kcyBXb3JrZmxvdz4gPSBSZXR1cm5UeXBlPFc+IGV4dGVuZHMgUHJvbWlzZTxpbmZlciBSPiA/IFIgOiBuZXZlcjtcblxuLyoqXG4gKiBJZiBhbm90aGVyIFNESyBjcmVhdGVzIGEgU2VhcmNoIEF0dHJpYnV0ZSB0aGF0J3Mgbm90IGFuIGFycmF5LCB3ZSB3cmFwIGl0IGluIGFuIGFycmF5LlxuICpcbiAqIERhdGVzIGFyZSBzZXJpYWxpemVkIGFzIElTTyBzdHJpbmdzLlxuICovXG5leHBvcnQgdHlwZSBTZWFyY2hBdHRyaWJ1dGVzID0gUmVjb3JkPHN0cmluZywgU2VhcmNoQXR0cmlidXRlVmFsdWUgfCBSZWFkb25seTxTZWFyY2hBdHRyaWJ1dGVWYWx1ZT4gfCB1bmRlZmluZWQ+O1xuZXhwb3J0IHR5cGUgU2VhcmNoQXR0cmlidXRlVmFsdWUgPSBzdHJpbmdbXSB8IG51bWJlcltdIHwgYm9vbGVhbltdIHwgRGF0ZVtdO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2aXR5RnVuY3Rpb248UCBleHRlbmRzIGFueVtdID0gYW55W10sIFIgPSBhbnk+IHtcbiAgKC4uLmFyZ3M6IFApOiBQcm9taXNlPFI+O1xufVxuXG4vKipcbiAqIE1hcHBpbmcgb2YgQWN0aXZpdHkgbmFtZSB0byBmdW5jdGlvblxuICogQGRlcHJlY2F0ZWQgbm90IHJlcXVpcmVkIGFueW1vcmUsIGZvciB1bnR5cGVkIGFjdGl2aXRpZXMgdXNlIHtAbGluayBVbnR5cGVkQWN0aXZpdGllc31cbiAqL1xuZXhwb3J0IHR5cGUgQWN0aXZpdHlJbnRlcmZhY2UgPSBSZWNvcmQ8c3RyaW5nLCBBY3Rpdml0eUZ1bmN0aW9uPjtcblxuLyoqXG4gKiBNYXBwaW5nIG9mIEFjdGl2aXR5IG5hbWUgdG8gZnVuY3Rpb25cbiAqL1xuZXhwb3J0IHR5cGUgVW50eXBlZEFjdGl2aXRpZXMgPSBSZWNvcmQ8c3RyaW5nLCBBY3Rpdml0eUZ1bmN0aW9uPjtcblxuLyoqXG4gKiBBIHdvcmtmbG93J3MgaGlzdG9yeSBhbmQgSUQuIFVzZWZ1bCBmb3IgcmVwbGF5LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEhpc3RvcnlBbmRXb3JrZmxvd0lkIHtcbiAgd29ya2Zsb3dJZDogc3RyaW5nO1xuICBoaXN0b3J5OiB0ZW1wb3JhbC5hcGkuaGlzdG9yeS52MS5IaXN0b3J5IHwgdW5rbm93biB8IHVuZGVmaW5lZDtcbn1cbiIsImV4cG9ydCB0eXBlIExvZ0xldmVsID0gJ1RSQUNFJyB8ICdERUJVRycgfCAnSU5GTycgfCAnV0FSTicgfCAnRVJST1InO1xuXG5leHBvcnQgdHlwZSBMb2dNZXRhZGF0YSA9IFJlY29yZDxzdHJpbmcgfCBzeW1ib2wsIGFueT47XG5cbi8qKlxuICogSW1wbGVtZW50IHRoaXMgaW50ZXJmYWNlIGluIG9yZGVyIHRvIGN1c3RvbWl6ZSB3b3JrZXIgbG9nZ2luZ1xuICovXG5leHBvcnQgaW50ZXJmYWNlIExvZ2dlciB7XG4gIGxvZyhsZXZlbDogTG9nTGV2ZWwsIG1lc3NhZ2U6IHN0cmluZywgbWV0YT86IExvZ01ldGFkYXRhKTogYW55O1xuICB0cmFjZShtZXNzYWdlOiBzdHJpbmcsIG1ldGE/OiBMb2dNZXRhZGF0YSk6IGFueTtcbiAgZGVidWcobWVzc2FnZTogc3RyaW5nLCBtZXRhPzogTG9nTWV0YWRhdGEpOiBhbnk7XG4gIGluZm8obWVzc2FnZTogc3RyaW5nLCBtZXRhPzogTG9nTWV0YWRhdGEpOiBhbnk7XG4gIHdhcm4obWVzc2FnZTogc3RyaW5nLCBtZXRhPzogTG9nTWV0YWRhdGEpOiBhbnk7XG4gIGVycm9yKG1lc3NhZ2U6IHN0cmluZywgbWV0YT86IExvZ01ldGFkYXRhKTogYW55O1xufVxuXG4vKipcbiAqIFBvc3NpYmxlIHZhbHVlcyBvZiB0aGUgYHNka0NvbXBvbmVudGAgbWV0YSBhdHRyaWJ1dGVzIG9uIGxvZyBtZXNzYWdlcy4gVGhpc1xuICogYXR0cmlidXRlIGluZGljYXRlcyB3aGljaCBzdWJzeXN0ZW0gZW1pdHRlZCB0aGUgbG9nIG1lc3NhZ2U7IHRoaXMgbWF5IGZvclxuICogZXhhbXBsZSBiZSB1c2VkIHRvIGltcGxlbWVudCBmaW5lLWdyYWluZWQgZmlsdGVyaW5nIG9mIGxvZyBtZXNzYWdlcy5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlcmUgaXMgbm8gZ3VhcmFudGVlIHRoYXQgdGhpcyBsaXN0IHdpbGwgcmVtYWluIHN0YWJsZSBpbiB0aGVcbiAqIGZ1dHVyZTsgdmFsdWVzIG1heSBiZSBhZGRlZCBvciByZW1vdmVkLCBhbmQgbWVzc2FnZXMgdGhhdCBhcmUgY3VycmVudGx5XG4gKiBlbWl0dGVkIHdpdGggc29tZSBgc2RrQ29tcG9uZW50YCB2YWx1ZSBtYXkgdXNlIGEgZGlmZmVyZW50IHZhbHVlIGluIHRoZSBmdXR1cmUuXG4gKi9cbmV4cG9ydCBlbnVtIFNka0NvbXBvbmVudCB7XG4gIC8qKlxuICAgKiBDb21wb25lbnQgbmFtZSBmb3IgbWVzc2FnZXMgZW1pdGVkIGZyb20gV29ya2Zsb3cgY29kZSwgdXNpbmcgdGhlIHtAbGluayBXb3JrZmxvdyBjb250ZXh0IGxvZ2dlcnx3b3JrZmxvdy5sb2d9LlxuICAgKiBUaGUgU0RLIGl0c2VsZiBuZXZlciBwdWJsaXNoZXMgbWVzc2FnZXMgd2l0aCB0aGlzIGNvbXBvbmVudCBuYW1lLlxuICAgKi9cbiAgd29ya2Zsb3cgPSAnd29ya2Zsb3cnLFxuXG4gIC8qKlxuICAgKiBDb21wb25lbnQgbmFtZSBmb3IgbWVzc2FnZXMgZW1pdGVkIGZyb20gYW4gYWN0aXZpdHksIHVzaW5nIHRoZSB7QGxpbmsgYWN0aXZpdHkgY29udGV4dCBsb2dnZXJ8Q29udGV4dC5sb2d9LlxuICAgKiBUaGUgU0RLIGl0c2VsZiBuZXZlciBwdWJsaXNoZXMgbWVzc2FnZXMgd2l0aCB0aGlzIGNvbXBvbmVudCBuYW1lLlxuICAgKi9cbiAgYWN0aXZpdHkgPSAnYWN0aXZpdHknLFxuXG4gIC8qKlxuICAgKiBDb21wb25lbnQgbmFtZSBmb3IgbWVzc2FnZXMgZW1pdGVkIGZyb20gYSBUZW1wb3JhbCBXb3JrZXIgaW5zdGFuY2UuXG4gICAqXG4gICAqIFRoaXMgbm90YWJseSBpbmNsdWRlczpcbiAgICogLSBJc3N1ZXMgd2l0aCBXb3JrZXIgb3IgcnVudGltZSBjb25maWd1cmF0aW9uLCBvciB0aGUgSlMgZXhlY3V0aW9uIGVudmlyb25tZW50O1xuICAgKiAtIFdvcmtlcidzLCBBY3Rpdml0eSdzLCBhbmQgV29ya2Zsb3cncyBsaWZlY3ljbGUgZXZlbnRzO1xuICAgKiAtIFdvcmtmbG93IEFjdGl2YXRpb24gYW5kIEFjdGl2aXR5IFRhc2sgcHJvY2Vzc2luZyBldmVudHM7XG4gICAqIC0gV29ya2Zsb3cgYnVuZGxpbmcgbWVzc2FnZXM7XG4gICAqIC0gU2luayBwcm9jZXNzaW5nIGlzc3Vlcy5cbiAgICovXG4gIHdvcmtlciA9ICd3b3JrZXInLFxuXG4gIC8qKlxuICAgKiBDb21wb25lbnQgbmFtZSBmb3IgYWxsIG1lc3NhZ2VzIGVtaXR0ZWQgYnkgdGhlIFJ1c3QgQ29yZSBTREsgbGlicmFyeS5cbiAgICovXG4gIGNvcmUgPSAnY29yZScsXG59XG4iLCJpbXBvcnQgdHlwZSB7IHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgVmFsdWVFcnJvciB9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7IER1cmF0aW9uLCBtc09wdGlvbmFsVG9OdW1iZXIsIG1zT3B0aW9uYWxUb1RzLCBtc1RvTnVtYmVyLCBtc1RvVHMsIG9wdGlvbmFsVHNUb01zIH0gZnJvbSAnLi90aW1lJztcblxuLyoqXG4gKiBPcHRpb25zIGZvciByZXRyeWluZyBXb3JrZmxvd3MgYW5kIEFjdGl2aXRpZXNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXRyeVBvbGljeSB7XG4gIC8qKlxuICAgKiBDb2VmZmljaWVudCB1c2VkIHRvIGNhbGN1bGF0ZSB0aGUgbmV4dCByZXRyeSBpbnRlcnZhbC5cbiAgICogVGhlIG5leHQgcmV0cnkgaW50ZXJ2YWwgaXMgcHJldmlvdXMgaW50ZXJ2YWwgbXVsdGlwbGllZCBieSB0aGlzIGNvZWZmaWNpZW50LlxuICAgKiBAbWluaW11bSAxXG4gICAqIEBkZWZhdWx0IDJcbiAgICovXG4gIGJhY2tvZmZDb2VmZmljaWVudD86IG51bWJlcjtcbiAgLyoqXG4gICAqIEludGVydmFsIG9mIHRoZSBmaXJzdCByZXRyeS5cbiAgICogSWYgY29lZmZpY2llbnQgaXMgMSB0aGVuIGl0IGlzIHVzZWQgZm9yIGFsbCByZXRyaWVzXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKiBAZGVmYXVsdCAxIHNlY29uZFxuICAgKi9cbiAgaW5pdGlhbEludGVydmFsPzogRHVyYXRpb247XG4gIC8qKlxuICAgKiBNYXhpbXVtIG51bWJlciBvZiBhdHRlbXB0cy4gV2hlbiBleGNlZWRlZCwgcmV0cmllcyBzdG9wIChldmVuIGlmIHtAbGluayBBY3Rpdml0eU9wdGlvbnMuc2NoZWR1bGVUb0Nsb3NlVGltZW91dH1cbiAgICogaGFzbid0IGJlZW4gcmVhY2hlZCkuXG4gICAqXG4gICAqIEBkZWZhdWx0IEluZmluaXR5XG4gICAqL1xuICBtYXhpbXVtQXR0ZW1wdHM/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBNYXhpbXVtIGludGVydmFsIGJldHdlZW4gcmV0cmllcy5cbiAgICogRXhwb25lbnRpYWwgYmFja29mZiBsZWFkcyB0byBpbnRlcnZhbCBpbmNyZWFzZS5cbiAgICogVGhpcyB2YWx1ZSBpcyB0aGUgY2FwIG9mIHRoZSBpbmNyZWFzZS5cbiAgICpcbiAgICogQGRlZmF1bHQgMTAweCBvZiB7QGxpbmsgaW5pdGlhbEludGVydmFsfVxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIG1heGltdW1JbnRlcnZhbD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBMaXN0IG9mIGFwcGxpY2F0aW9uIGZhaWx1cmVzIHR5cGVzIHRvIG5vdCByZXRyeS5cbiAgICovXG4gIG5vblJldHJ5YWJsZUVycm9yVHlwZXM/OiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBUdXJuIGEgVFMgUmV0cnlQb2xpY3kgaW50byBhIHByb3RvIGNvbXBhdGlibGUgUmV0cnlQb2xpY3lcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVSZXRyeVBvbGljeShyZXRyeVBvbGljeTogUmV0cnlQb2xpY3kpOiB0ZW1wb3JhbC5hcGkuY29tbW9uLnYxLklSZXRyeVBvbGljeSB7XG4gIGlmIChyZXRyeVBvbGljeS5iYWNrb2ZmQ29lZmZpY2llbnQgIT0gbnVsbCAmJiByZXRyeVBvbGljeS5iYWNrb2ZmQ29lZmZpY2llbnQgPD0gMCkge1xuICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5iYWNrb2ZmQ29lZmZpY2llbnQgbXVzdCBiZSBncmVhdGVyIHRoYW4gMCcpO1xuICB9XG4gIGlmIChyZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgIT0gbnVsbCkge1xuICAgIGlmIChyZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgPT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSkge1xuICAgICAgLy8gZHJvcCBmaWVsZCAoSW5maW5pdHkgaXMgdGhlIGRlZmF1bHQpXG4gICAgICBjb25zdCB7IG1heGltdW1BdHRlbXB0czogXywgLi4ud2l0aG91dCB9ID0gcmV0cnlQb2xpY3k7XG4gICAgICByZXRyeVBvbGljeSA9IHdpdGhvdXQ7XG4gICAgfSBlbHNlIGlmIChyZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgPD0gMCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlcicpO1xuICAgIH0gZWxzZSBpZiAoIU51bWJlci5pc0ludGVnZXIocmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzKSkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyBtdXN0IGJlIGFuIGludGVnZXInKTtcbiAgICB9XG4gIH1cbiAgY29uc3QgbWF4aW11bUludGVydmFsID0gbXNPcHRpb25hbFRvTnVtYmVyKHJldHJ5UG9saWN5Lm1heGltdW1JbnRlcnZhbCk7XG4gIGNvbnN0IGluaXRpYWxJbnRlcnZhbCA9IG1zVG9OdW1iZXIocmV0cnlQb2xpY3kuaW5pdGlhbEludGVydmFsID8/IDEwMDApO1xuICBpZiAobWF4aW11bUludGVydmFsID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5Lm1heGltdW1JbnRlcnZhbCBjYW5ub3QgYmUgMCcpO1xuICB9XG4gIGlmIChpbml0aWFsSW50ZXJ2YWwgPT09IDApIHtcbiAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignUmV0cnlQb2xpY3kuaW5pdGlhbEludGVydmFsIGNhbm5vdCBiZSAwJyk7XG4gIH1cbiAgaWYgKG1heGltdW1JbnRlcnZhbCAhPSBudWxsICYmIG1heGltdW1JbnRlcnZhbCA8IGluaXRpYWxJbnRlcnZhbCkge1xuICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5tYXhpbXVtSW50ZXJ2YWwgY2Fubm90IGJlIGxlc3MgdGhhbiBpdHMgaW5pdGlhbEludGVydmFsJyk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBtYXhpbXVtQXR0ZW1wdHM6IHJldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyxcbiAgICBpbml0aWFsSW50ZXJ2YWw6IG1zVG9Ucyhpbml0aWFsSW50ZXJ2YWwpLFxuICAgIG1heGltdW1JbnRlcnZhbDogbXNPcHRpb25hbFRvVHMobWF4aW11bUludGVydmFsKSxcbiAgICBiYWNrb2ZmQ29lZmZpY2llbnQ6IHJldHJ5UG9saWN5LmJhY2tvZmZDb2VmZmljaWVudCxcbiAgICBub25SZXRyeWFibGVFcnJvclR5cGVzOiByZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzLFxuICB9O1xufVxuXG4vKipcbiAqIFR1cm4gYSBwcm90byBjb21wYXRpYmxlIFJldHJ5UG9saWN5IGludG8gYSBUUyBSZXRyeVBvbGljeVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb21waWxlUmV0cnlQb2xpY3koXG4gIHJldHJ5UG9saWN5PzogdGVtcG9yYWwuYXBpLmNvbW1vbi52MS5JUmV0cnlQb2xpY3kgfCBudWxsXG4pOiBSZXRyeVBvbGljeSB8IHVuZGVmaW5lZCB7XG4gIGlmICghcmV0cnlQb2xpY3kpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBiYWNrb2ZmQ29lZmZpY2llbnQ6IHJldHJ5UG9saWN5LmJhY2tvZmZDb2VmZmljaWVudCA/PyB1bmRlZmluZWQsXG4gICAgbWF4aW11bUF0dGVtcHRzOiByZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgPz8gdW5kZWZpbmVkLFxuICAgIG1heGltdW1JbnRlcnZhbDogb3B0aW9uYWxUc1RvTXMocmV0cnlQb2xpY3kubWF4aW11bUludGVydmFsKSxcbiAgICBpbml0aWFsSW50ZXJ2YWw6IG9wdGlvbmFsVHNUb01zKHJldHJ5UG9saWN5LmluaXRpYWxJbnRlcnZhbCksXG4gICAgbm9uUmV0cnlhYmxlRXJyb3JUeXBlczogcmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlcyA/PyB1bmRlZmluZWQsXG4gIH07XG59XG4iLCJpbXBvcnQgTG9uZyBmcm9tICdsb25nJzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBpbXBvcnQvbm8tbmFtZWQtYXMtZGVmYXVsdFxuaW1wb3J0IG1zLCB7IFN0cmluZ1ZhbHVlIH0gZnJvbSAnbXMnO1xuaW1wb3J0IHR5cGUgeyBnb29nbGUgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBWYWx1ZUVycm9yIH0gZnJvbSAnLi9lcnJvcnMnO1xuXG4vLyBOT1RFOiB0aGVzZSBhcmUgdGhlIHNhbWUgaW50ZXJmYWNlIGluIEpTXG4vLyBnb29nbGUucHJvdG9idWYuSUR1cmF0aW9uO1xuLy8gZ29vZ2xlLnByb3RvYnVmLklUaW1lc3RhbXA7XG4vLyBUaGUgY29udmVyc2lvbiBmdW5jdGlvbnMgYmVsb3cgc2hvdWxkIHdvcmsgZm9yIGJvdGhcblxuZXhwb3J0IHR5cGUgVGltZXN0YW1wID0gZ29vZ2xlLnByb3RvYnVmLklUaW1lc3RhbXA7XG5cbi8qKlxuICogQSBkdXJhdGlvbiwgZXhwcmVzc2VkIGVpdGhlciBhcyBhIG51bWJlciBvZiBtaWxsaXNlY29uZHMsIG9yIGFzIGEge0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ30uXG4gKi9cbmV4cG9ydCB0eXBlIER1cmF0aW9uID0gU3RyaW5nVmFsdWUgfCBudW1iZXI7XG5cbmV4cG9ydCB0eXBlIHsgU3RyaW5nVmFsdWUgfSBmcm9tICdtcyc7XG5cbi8qKlxuICogTG9zc3kgY29udmVyc2lvbiBmdW5jdGlvbiBmcm9tIFRpbWVzdGFtcCB0byBudW1iZXIgZHVlIHRvIHBvc3NpYmxlIG92ZXJmbG93LlxuICogSWYgdHMgaXMgbnVsbCBvciB1bmRlZmluZWQgcmV0dXJucyB1bmRlZmluZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHRpb25hbFRzVG9Ncyh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIGlmICh0cyA9PT0gdW5kZWZpbmVkIHx8IHRzID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gdHNUb01zKHRzKTtcbn1cblxuLyoqXG4gKiBMb3NzeSBjb252ZXJzaW9uIGZ1bmN0aW9uIGZyb20gVGltZXN0YW1wIHRvIG51bWJlciBkdWUgdG8gcG9zc2libGUgb3ZlcmZsb3dcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRzVG9Ncyh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCk6IG51bWJlciB7XG4gIGlmICh0cyA9PT0gdW5kZWZpbmVkIHx8IHRzID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCB0aW1lc3RhbXAsIGdvdCAke3RzfWApO1xuICB9XG4gIGNvbnN0IHsgc2Vjb25kcywgbmFub3MgfSA9IHRzO1xuICByZXR1cm4gKHNlY29uZHMgfHwgTG9uZy5VWkVSTylcbiAgICAubXVsKDEwMDApXG4gICAgLmFkZChNYXRoLmZsb29yKChuYW5vcyB8fCAwKSAvIDEwMDAwMDApKVxuICAgIC50b051bWJlcigpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbXNOdW1iZXJUb1RzKG1pbGxpczogbnVtYmVyKTogVGltZXN0YW1wIHtcbiAgY29uc3Qgc2Vjb25kcyA9IE1hdGguZmxvb3IobWlsbGlzIC8gMTAwMCk7XG4gIGNvbnN0IG5hbm9zID0gKG1pbGxpcyAlIDEwMDApICogMTAwMDAwMDtcbiAgaWYgKE51bWJlci5pc05hTihzZWNvbmRzKSB8fCBOdW1iZXIuaXNOYU4obmFub3MpKSB7XG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoYEludmFsaWQgbWlsbGlzICR7bWlsbGlzfWApO1xuICB9XG4gIHJldHVybiB7IHNlY29uZHM6IExvbmcuZnJvbU51bWJlcihzZWNvbmRzKSwgbmFub3MgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1zVG9UcyhzdHI6IER1cmF0aW9uKTogVGltZXN0YW1wIHtcbiAgcmV0dXJuIG1zTnVtYmVyVG9Ucyhtc1RvTnVtYmVyKHN0cikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbXNPcHRpb25hbFRvVHMoc3RyOiBEdXJhdGlvbiB8IHVuZGVmaW5lZCk6IFRpbWVzdGFtcCB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBzdHIgPyBtc1RvVHMoc3RyKSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1zT3B0aW9uYWxUb051bWJlcih2YWw6IER1cmF0aW9uIHwgdW5kZWZpbmVkKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdW5kZWZpbmVkO1xuICByZXR1cm4gbXNUb051bWJlcih2YWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbXNUb051bWJlcih2YWw6IER1cmF0aW9uKTogbnVtYmVyIHtcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuICByZXR1cm4gbXNXaXRoVmFsaWRhdGlvbih2YWwpO1xufVxuXG5mdW5jdGlvbiBtc1dpdGhWYWxpZGF0aW9uKHN0cjogU3RyaW5nVmFsdWUpOiBudW1iZXIge1xuICBjb25zdCBtaWxsaXMgPSBtcyhzdHIpO1xuICBpZiAobWlsbGlzID09IG51bGwgfHwgaXNOYU4obWlsbGlzKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEludmFsaWQgZHVyYXRpb24gc3RyaW5nOiAnJHtzdHJ9J2ApO1xuICB9XG4gIHJldHVybiBtaWxsaXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0c1RvRGF0ZSh0czogVGltZXN0YW1wKTogRGF0ZSB7XG4gIHJldHVybiBuZXcgRGF0ZSh0c1RvTXModHMpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsVHNUb0RhdGUodHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQpOiBEYXRlIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHRzID09PSB1bmRlZmluZWQgfHwgdHMgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiBuZXcgRGF0ZSh0c1RvTXModHMpKTtcbn1cblxuLy8gdHMtcHJ1bmUtaWdub3JlLW5leHQgKGltcG9ydGVkIHZpYSBzY2hlZHVsZS1oZWxwZXJzLnRzKVxuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsRGF0ZVRvVHMoZGF0ZTogRGF0ZSB8IG51bGwgfCB1bmRlZmluZWQpOiBUaW1lc3RhbXAgfCB1bmRlZmluZWQge1xuICBpZiAoZGF0ZSA9PT0gdW5kZWZpbmVkIHx8IGRhdGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiBtc1RvVHMoZGF0ZS5nZXRUaW1lKCkpO1xufVxuIiwiLyoqIFNob3J0aGFuZCBhbGlhcyAqL1xuZXhwb3J0IHR5cGUgQW55RnVuYyA9ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55O1xuLyoqIEEgdHVwbGUgd2l0aG91dCBpdHMgbGFzdCBlbGVtZW50ICovXG5leHBvcnQgdHlwZSBPbWl0TGFzdDxUPiA9IFQgZXh0ZW5kcyBbLi4uaW5mZXIgUkVTVCwgYW55XSA/IFJFU1QgOiBuZXZlcjtcbi8qKiBGIHdpdGggYWxsIGFyZ3VtZW50cyBidXQgdGhlIGxhc3QgKi9cbmV4cG9ydCB0eXBlIE9taXRMYXN0UGFyYW08RiBleHRlbmRzIEFueUZ1bmM+ID0gKC4uLmFyZ3M6IE9taXRMYXN0PFBhcmFtZXRlcnM8Rj4+KSA9PiBSZXR1cm5UeXBlPEY+O1xuLyoqIFJlcXVpcmUgdGhhdCBUIGhhcyBhdCBsZWFzdCBvbmUgb2YgdGhlIHByb3ZpZGVkIHByb3BlcnRpZXMgZGVmaW5lZCAqL1xuZXhwb3J0IHR5cGUgUmVxdWlyZUF0TGVhc3RPbmU8VCwgS2V5cyBleHRlbmRzIGtleW9mIFQgPSBrZXlvZiBUPiA9IFBpY2s8VCwgRXhjbHVkZTxrZXlvZiBULCBLZXlzPj4gJlxuICB7XG4gICAgW0sgaW4gS2V5c10tPzogUmVxdWlyZWQ8UGljazxULCBLPj4gJiBQYXJ0aWFsPFBpY2s8VCwgRXhjbHVkZTxLZXlzLCBLPj4+O1xuICB9W0tleXNdO1xuXG4vKiogVmVyaWZ5IHRoYXQgYW4gdHlwZSBfQ29weSBleHRlbmRzIF9PcmlnICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tFeHRlbmRzPF9PcmlnLCBfQ29weSBleHRlbmRzIF9PcmlnPigpOiB2b2lkIHtcbiAgLy8gbm9vcCwganVzdCB0eXBlIGNoZWNrXG59XG5cbmV4cG9ydCB0eXBlIFJlcGxhY2U8QmFzZSwgTmV3PiA9IE9taXQ8QmFzZSwga2V5b2YgTmV3PiAmIE5ldztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVjb3JkKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc093blByb3BlcnR5PFggZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgWSBleHRlbmRzIFByb3BlcnR5S2V5PihcbiAgcmVjb3JkOiBYLFxuICBwcm9wOiBZXG4pOiByZWNvcmQgaXMgWCAmIFJlY29yZDxZLCB1bmtub3duPiB7XG4gIHJldHVybiBwcm9wIGluIHJlY29yZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc093blByb3BlcnRpZXM8WCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBZIGV4dGVuZHMgUHJvcGVydHlLZXk+KFxuICByZWNvcmQ6IFgsXG4gIHByb3BzOiBZW11cbik6IHJlY29yZCBpcyBYICYgUmVjb3JkPFksIHVua25vd24+IHtcbiAgcmV0dXJuIHByb3BzLmV2ZXJ5KChwcm9wKSA9PiBwcm9wIGluIHJlY29yZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Vycm9yKGVycm9yOiB1bmtub3duKTogZXJyb3IgaXMgRXJyb3Ige1xuICByZXR1cm4gKFxuICAgIGlzUmVjb3JkKGVycm9yKSAmJlxuICAgIHR5cGVvZiBlcnJvci5uYW1lID09PSAnc3RyaW5nJyAmJlxuICAgIHR5cGVvZiBlcnJvci5tZXNzYWdlID09PSAnc3RyaW5nJyAmJlxuICAgIChlcnJvci5zdGFjayA9PSBudWxsIHx8IHR5cGVvZiBlcnJvci5zdGFjayA9PT0gJ3N0cmluZycpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Fib3J0RXJyb3IoZXJyb3I6IHVua25vd24pOiBlcnJvciBpcyBFcnJvciAmIHsgbmFtZTogJ0Fib3J0RXJyb3InIH0ge1xuICByZXR1cm4gaXNFcnJvcihlcnJvcikgJiYgZXJyb3IubmFtZSA9PT0gJ0Fib3J0RXJyb3InO1xufVxuXG4vKipcbiAqIEdldCBgZXJyb3IubWVzc2FnZWAgKG9yIGB1bmRlZmluZWRgIGlmIG5vdCBwcmVzZW50KVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JNZXNzYWdlKGVycm9yOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGlzRXJyb3IoZXJyb3IpKSB7XG4gICAgcmV0dXJuIGVycm9yLm1lc3NhZ2U7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGVycm9yID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5pbnRlcmZhY2UgRXJyb3JXaXRoQ29kZSB7XG4gIGNvZGU6IHN0cmluZztcbn1cblxuZnVuY3Rpb24gaXNFcnJvcldpdGhDb2RlKGVycm9yOiB1bmtub3duKTogZXJyb3IgaXMgRXJyb3JXaXRoQ29kZSB7XG4gIHJldHVybiBpc1JlY29yZChlcnJvcikgJiYgdHlwZW9mIGVycm9yLmNvZGUgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIEdldCBgZXJyb3IuY29kZWAgKG9yIGB1bmRlZmluZWRgIGlmIG5vdCBwcmVzZW50KVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JDb2RlKGVycm9yOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGlzRXJyb3JXaXRoQ29kZShlcnJvcikpIHtcbiAgICByZXR1cm4gZXJyb3IuY29kZTtcbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQXNzZXJ0cyB0aGF0IHNvbWUgdHlwZSBpcyB0aGUgbmV2ZXIgdHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0TmV2ZXIobXNnOiBzdHJpbmcsIHg6IG5ldmVyKTogbmV2ZXIge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKG1zZyArICc6ICcgKyB4KTtcbn1cblxuZXhwb3J0IHR5cGUgQ2xhc3M8RSBleHRlbmRzIEVycm9yPiA9IHtcbiAgbmV3ICguLi5hcmdzOiBhbnlbXSk6IEU7XG4gIHByb3RvdHlwZTogRTtcbn07XG5cbi8qKlxuICogQSBkZWNvcmF0b3IgdG8gYmUgdXNlZCBvbiBlcnJvciBjbGFzc2VzLiBJdCBhZGRzIHRoZSAnbmFtZScgcHJvcGVydHkgQU5EIHByb3ZpZGVzIGEgY3VzdG9tXG4gKiAnaW5zdGFuY2VvZicgaGFuZGxlciB0aGF0IHdvcmtzIGNvcnJlY3RseSBhY3Jvc3MgZXhlY3V0aW9uIGNvbnRleHRzLlxuICpcbiAqICMjIyBEZXRhaWxzICMjI1xuICpcbiAqIEFjY29yZGluZyB0byB0aGUgRWNtYVNjcmlwdCdzIHNwZWMsIHRoZSBkZWZhdWx0IGJlaGF2aW9yIG9mIEphdmFTY3JpcHQncyBgeCBpbnN0YW5jZW9mIFlgIG9wZXJhdG9yIGlzIHRvIHdhbGsgdXAgdGhlXG4gKiBwcm90b3R5cGUgY2hhaW4gb2Ygb2JqZWN0ICd4JywgY2hlY2tpbmcgaWYgYW55IGNvbnN0cnVjdG9yIGluIHRoYXQgaGllcmFyY2h5IGlzIF9leGFjdGx5IHRoZSBzYW1lIG9iamVjdF8gYXMgdGhlXG4gKiBjb25zdHJ1Y3RvciBmdW5jdGlvbiAnWScuXG4gKlxuICogVW5mb3J0dW5hdGVseSwgaXQgaGFwcGVucyBpbiB2YXJpb3VzIHNpdHVhdGlvbnMgdGhhdCBkaWZmZXJlbnQgY29uc3RydWN0b3IgZnVuY3Rpb24gb2JqZWN0cyBnZXQgY3JlYXRlZCBmb3Igd2hhdFxuICogYXBwZWFycyB0byBiZSB0aGUgdmVyeSBzYW1lIGNsYXNzLiBUaGlzIGxlYWRzIHRvIHN1cnByaXNpbmcgYmVoYXZpb3Igd2hlcmUgYGluc3RhbmNlb2ZgIHJldHVybnMgZmFsc2UgdGhvdWdoIGl0IGlzXG4gKiBrbm93biB0aGF0IHRoZSBvYmplY3QgaXMgaW5kZWVkIGFuIGluc3RhbmNlIG9mIHRoYXQgY2xhc3MuIE9uZSBwYXJ0aWN1bGFyIGNhc2Ugd2hlcmUgdGhpcyBoYXBwZW5zIGlzIHdoZW4gY29uc3RydWN0b3JcbiAqICdZJyBiZWxvbmdzIHRvIGEgZGlmZmVyZW50IHJlYWxtIHRoYW4gdGhlIGNvbnN0dWN0b3Igd2l0aCB3aGljaCAneCcgd2FzIGluc3RhbnRpYXRlZC4gQW5vdGhlciBjYXNlIGlzIHdoZW4gdHdvIGNvcGllc1xuICogb2YgdGhlIHNhbWUgbGlicmFyeSBnZXRzIGxvYWRlZCBpbiB0aGUgc2FtZSByZWFsbS5cbiAqXG4gKiBJbiBwcmFjdGljZSwgdGhpcyB0ZW5kcyB0byBjYXVzZSBpc3N1ZXMgd2hlbiBjcm9zc2luZyB0aGUgd29ya2Zsb3ctc2FuZGJveGluZyBib3VuZGFyeSAoc2luY2UgTm9kZSdzIHZtIG1vZHVsZVxuICogcmVhbGx5IGNyZWF0ZXMgbmV3IGV4ZWN1dGlvbiByZWFsbXMpLCBhcyB3ZWxsIGFzIHdoZW4gcnVubmluZyB0ZXN0cyB1c2luZyBKZXN0IChzZWUgaHR0cHM6Ly9naXRodWIuY29tL2plc3Rqcy9qZXN0L2lzc3Vlcy8yNTQ5XG4gKiBmb3Igc29tZSBkZXRhaWxzIG9uIHRoYXQgb25lKS5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGluamVjdHMgYSBjdXN0b20gJ2luc3RhbmNlb2YnIGhhbmRsZXIgaW50byB0aGUgcHJvdG90eXBlIG9mICdjbGF6eicsIHdoaWNoIGlzIGJvdGggY3Jvc3MtcmVhbG0gc2FmZSBhbmRcbiAqIGNyb3NzLWNvcGllcy1vZi10aGUtc2FtZS1saWIgc2FmZS4gSXQgd29ya3MgYnkgYWRkaW5nIGEgc3BlY2lhbCBzeW1ib2wgcHJvcGVydHkgdG8gdGhlIHByb3RvdHlwZSBvZiAnY2xhenonLCBhbmQgdGhlblxuICogY2hlY2tpbmcgZm9yIHRoZSBwcmVzZW5jZSBvZiB0aGF0IHN5bWJvbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yPEUgZXh0ZW5kcyBFcnJvcj4obWFya2VyTmFtZTogc3RyaW5nKTogKGNsYXp6OiBDbGFzczxFPikgPT4gdm9pZCB7XG4gIHJldHVybiAoY2xheno6IENsYXNzPEU+KTogdm9pZCA9PiB7XG4gICAgY29uc3QgbWFya2VyID0gU3ltYm9sLmZvcihgX190ZW1wb3JhbF9pcyR7bWFya2VyTmFtZX1gKTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbGF6ei5wcm90b3R5cGUsICduYW1lJywgeyB2YWx1ZTogbWFya2VyTmFtZSwgZW51bWVyYWJsZTogdHJ1ZSB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2xhenoucHJvdG90eXBlLCBtYXJrZXIsIHsgdmFsdWU6IHRydWUsIGVudW1lcmFibGU6IGZhbHNlIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbGF6eiwgU3ltYm9sLmhhc0luc3RhbmNlLCB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgb2JqZWN0LXNob3J0aGFuZFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uICh0aGlzOiBhbnksIGVycm9yOiBvYmplY3QpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMgPT09IGNsYXp6KSB7XG4gICAgICAgICAgcmV0dXJuIGlzUmVjb3JkKGVycm9yKSAmJiAoZXJyb3IgYXMgYW55KVttYXJrZXJdID09PSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vICd0aGlzJyBtdXN0IGJlIGEgX3N1YmNsYXNzXyBvZiBjbGF6eiB0aGF0IGRvZXNuJ3QgcmVkZWZpbmVkIFtTeW1ib2wuaGFzSW5zdGFuY2VdLCBzbyB0aGF0IGl0IGluaGVyaXRlZFxuICAgICAgICAgIC8vIGZyb20gY2xhenoncyBbU3ltYm9sLmhhc0luc3RhbmNlXS4gSWYgd2UgZG9uJ3QgaGFuZGxlIHRoaXMgcGFydGljdWxhciBzaXR1YXRpb24sIHRoZW5cbiAgICAgICAgICAvLyBgeCBpbnN0YW5jZW9mIFN1YmNsYXNzT2ZQYXJlbnRgIHdvdWxkIHJldHVybiB0cnVlIGZvciBhbnkgaW5zdGFuY2Ugb2YgJ1BhcmVudCcsIHdoaWNoIGlzIGNsZWFybHkgd3JvbmcuXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyBJZGVhbGx5LCBpdCdkIGJlIHByZWZlcmFibGUgdG8gYXZvaWQgdGhpcyBjYXNlIGVudGlyZWx5LCBieSBtYWtpbmcgc3VyZSB0aGF0IGFsbCBzdWJjbGFzc2VzIG9mICdjbGF6eidcbiAgICAgICAgICAvLyByZWRlZmluZSBbU3ltYm9sLmhhc0luc3RhbmNlXSwgYnV0IHdlIGNhbid0IGVuZm9yY2UgdGhhdC4gV2UgdGhlcmVmb3JlIGZhbGxiYWNrIHRvIHRoZSBkZWZhdWx0IGluc3RhbmNlb2ZcbiAgICAgICAgICAvLyBiZWhhdmlvciAod2hpY2ggaXMgTk9UIGNyb3NzLXJlYWxtIHNhZmUpLlxuICAgICAgICAgIHJldHVybiB0aGlzLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGVycm9yKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KTtcbiAgfTtcbn1cblxuLy8gVGhhbmtzIE1ETjogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2ZyZWV6ZVxuZXhwb3J0IGZ1bmN0aW9uIGRlZXBGcmVlemU8VD4ob2JqZWN0OiBUKTogVCB7XG4gIC8vIFJldHJpZXZlIHRoZSBwcm9wZXJ0eSBuYW1lcyBkZWZpbmVkIG9uIG9iamVjdFxuICBjb25zdCBwcm9wTmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmplY3QpO1xuXG4gIC8vIEZyZWV6ZSBwcm9wZXJ0aWVzIGJlZm9yZSBmcmVlemluZyBzZWxmXG4gIGZvciAoY29uc3QgbmFtZSBvZiBwcm9wTmFtZXMpIHtcbiAgICBjb25zdCB2YWx1ZSA9IChvYmplY3QgYXMgYW55KVtuYW1lXTtcblxuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkZWVwRnJlZXplKHZhbHVlKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyBUaGlzIGlzIG9rYXksIHRoZXJlIGFyZSBzb21lIHR5cGVkIGFycmF5cyB0aGF0IGNhbm5vdCBiZSBmcm96ZW4gKGVuY29kaW5nS2V5cylcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgT2JqZWN0LmZyZWV6ZSh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5mcmVlemUob2JqZWN0KTtcbn1cbiIsImltcG9ydCB0eXBlIHsgY29yZXNkayB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB0eXBlIHsgVmVyc2lvbmluZ0ludGVudCBhcyBWZXJzaW9uaW5nSW50ZW50U3RyaW5nIH0gZnJvbSAnLi92ZXJzaW9uaW5nLWludGVudCc7XG5pbXBvcnQgeyBhc3NlcnROZXZlciwgY2hlY2tFeHRlbmRzIH0gZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuXG4vLyBBdm9pZCBpbXBvcnRpbmcgdGhlIHByb3RvIGltcGxlbWVudGF0aW9uIHRvIHJlZHVjZSB3b3JrZmxvdyBidW5kbGUgc2l6ZVxuLy8gQ29waWVkIGZyb20gY29yZXNkay5jb21tb24uVmVyc2lvbmluZ0ludGVudFxuLyoqXG4gKiBQcm90b2J1ZiBlbnVtIHJlcHJlc2VudGF0aW9uIG9mIHtAbGluayBWZXJzaW9uaW5nSW50ZW50U3RyaW5nfS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBlbnVtIFZlcnNpb25pbmdJbnRlbnQge1xuICBVTlNQRUNJRklFRCA9IDAsXG4gIENPTVBBVElCTEUgPSAxLFxuICBERUZBVUxUID0gMixcbn1cblxuY2hlY2tFeHRlbmRzPGNvcmVzZGsuY29tbW9uLlZlcnNpb25pbmdJbnRlbnQsIFZlcnNpb25pbmdJbnRlbnQ+KCk7XG5jaGVja0V4dGVuZHM8VmVyc2lvbmluZ0ludGVudCwgY29yZXNkay5jb21tb24uVmVyc2lvbmluZ0ludGVudD4oKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHZlcnNpb25pbmdJbnRlbnRUb1Byb3RvKGludGVudDogVmVyc2lvbmluZ0ludGVudFN0cmluZyB8IHVuZGVmaW5lZCk6IFZlcnNpb25pbmdJbnRlbnQge1xuICBzd2l0Y2ggKGludGVudCkge1xuICAgIGNhc2UgJ0RFRkFVTFQnOlxuICAgICAgcmV0dXJuIFZlcnNpb25pbmdJbnRlbnQuREVGQVVMVDtcbiAgICBjYXNlICdDT01QQVRJQkxFJzpcbiAgICAgIHJldHVybiBWZXJzaW9uaW5nSW50ZW50LkNPTVBBVElCTEU7XG4gICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICByZXR1cm4gVmVyc2lvbmluZ0ludGVudC5VTlNQRUNJRklFRDtcbiAgICBkZWZhdWx0OlxuICAgICAgYXNzZXJ0TmV2ZXIoJ1VuZXhwZWN0ZWQgVmVyc2lvbmluZ0ludGVudCcsIGludGVudCk7XG4gIH1cbn1cbiIsIi8qKlxuICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHVzZXIgaW50ZW5kcyBjZXJ0YWluIGNvbW1hbmRzIHRvIGJlIHJ1biBvbiBhIGNvbXBhdGlibGUgd29ya2VyIEJ1aWxkIElkIHZlcnNpb24gb3Igbm90LlxuICpcbiAqIGBDT01QQVRJQkxFYCBpbmRpY2F0ZXMgdGhhdCB0aGUgY29tbWFuZCBzaG91bGQgcnVuIG9uIGEgd29ya2VyIHdpdGggY29tcGF0aWJsZSB2ZXJzaW9uIGlmIHBvc3NpYmxlLiBJdCBtYXkgbm90IGJlXG4gKiBwb3NzaWJsZSBpZiB0aGUgdGFyZ2V0IHRhc2sgcXVldWUgZG9lcyBub3QgYWxzbyBoYXZlIGtub3dsZWRnZSBvZiB0aGUgY3VycmVudCB3b3JrZXIncyBCdWlsZCBJZC5cbiAqXG4gKiBgREVGQVVMVGAgaW5kaWNhdGVzIHRoYXQgdGhlIGNvbW1hbmQgc2hvdWxkIHJ1biBvbiB0aGUgdGFyZ2V0IHRhc2sgcXVldWUncyBjdXJyZW50IG92ZXJhbGwtZGVmYXVsdCBCdWlsZCBJZC5cbiAqXG4gKiBXaGVyZSB0aGlzIHR5cGUgaXMgYWNjZXB0ZWQgb3B0aW9uYWxseSwgYW4gdW5zZXQgdmFsdWUgaW5kaWNhdGVzIHRoYXQgdGhlIFNESyBzaG91bGQgY2hvb3NlIHRoZSBtb3N0IHNlbnNpYmxlIGRlZmF1bHRcbiAqIGJlaGF2aW9yIGZvciB0aGUgdHlwZSBvZiBjb21tYW5kLCBhY2NvdW50aW5nIGZvciB3aGV0aGVyIHRoZSBjb21tYW5kIHdpbGwgYmUgcnVuIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgdGhlXG4gKiBjdXJyZW50IHdvcmtlci4gVGhlIGRlZmF1bHQgYmVoYXZpb3IgZm9yIHN0YXJ0aW5nIFdvcmtmbG93cyBpcyBgREVGQVVMVGAuIFRoZSBkZWZhdWx0IGJlaGF2aW9yIGZvciBXb3JrZmxvd3Mgc3RhcnRpbmdcbiAqIEFjdGl2aXRpZXMsIHN0YXJ0aW5nIENoaWxkIFdvcmtmbG93cywgb3IgQ29udGludWluZyBBcyBOZXcgaXMgYENPTVBBVElCTEVgLlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IHR5cGUgVmVyc2lvbmluZ0ludGVudCA9ICdDT01QQVRJQkxFJyB8ICdERUZBVUxUJztcbiIsImltcG9ydCB7IFdvcmtmbG93LCBXb3JrZmxvd1Jlc3VsdFR5cGUsIFNpZ25hbERlZmluaXRpb24gfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG4vKipcbiAqIEJhc2UgV29ya2Zsb3dIYW5kbGUgaW50ZXJmYWNlLCBleHRlbmRlZCBpbiB3b3JrZmxvdyBhbmQgY2xpZW50IGxpYnMuXG4gKlxuICogVHJhbnNmb3JtcyBhIHdvcmtmbG93IGludGVyZmFjZSBgVGAgaW50byBhIGNsaWVudCBpbnRlcmZhY2UuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmFzZVdvcmtmbG93SGFuZGxlPFQgZXh0ZW5kcyBXb3JrZmxvdz4ge1xuICAvKipcbiAgICogUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gV29ya2Zsb3cgZXhlY3V0aW9uIGNvbXBsZXRlc1xuICAgKi9cbiAgcmVzdWx0KCk6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PjtcblxuICAvKipcbiAgICogU2lnbmFsIGEgcnVubmluZyBXb3JrZmxvdy5cbiAgICpcbiAgICogQHBhcmFtIGRlZiBhIHNpZ25hbCBkZWZpbml0aW9uIGFzIHJldHVybmVkIGZyb20ge0BsaW5rIGRlZmluZVNpZ25hbH1cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYGBgdHNcbiAgICogYXdhaXQgaGFuZGxlLnNpZ25hbChpbmNyZW1lbnRTaWduYWwsIDMpO1xuICAgKiBgYGBcbiAgICovXG4gIHNpZ25hbDxBcmdzIGV4dGVuZHMgYW55W10gPSBbXSwgTmFtZSBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4oXG4gICAgZGVmOiBTaWduYWxEZWZpbml0aW9uPEFyZ3MsIE5hbWU+IHwgc3RyaW5nLFxuICAgIC4uLmFyZ3M6IEFyZ3NcbiAgKTogUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogVGhlIHdvcmtmbG93SWQgb2YgdGhlIGN1cnJlbnQgV29ya2Zsb3dcbiAgICovXG4gIHJlYWRvbmx5IHdvcmtmbG93SWQ6IHN0cmluZztcbn1cbiIsImltcG9ydCB0eXBlIHsgdGVtcG9yYWwgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBTZWFyY2hBdHRyaWJ1dGVzLCBXb3JrZmxvdyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBSZXRyeVBvbGljeSB9IGZyb20gJy4vcmV0cnktcG9saWN5JztcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSAnLi90aW1lJztcbmltcG9ydCB7IGNoZWNrRXh0ZW5kcyB9IGZyb20gJy4vdHlwZS1oZWxwZXJzJztcblxuLy8gQXZvaWQgaW1wb3J0aW5nIHRoZSBwcm90byBpbXBsZW1lbnRhdGlvbiB0byByZWR1Y2Ugd29ya2Zsb3cgYnVuZGxlIHNpemVcbi8vIENvcGllZCBmcm9tIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5Xb3JrZmxvd0lkUmV1c2VQb2xpY3lcbi8qKlxuICogQ29uY2VwdDoge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9jb25jZXB0cy93aGF0LWlzLWEtd29ya2Zsb3ctaWQtcmV1c2UtcG9saWN5LyB8IFdvcmtmbG93IElkIFJldXNlIFBvbGljeX1cbiAqXG4gKiBXaGV0aGVyIGEgV29ya2Zsb3cgY2FuIGJlIHN0YXJ0ZWQgd2l0aCBhIFdvcmtmbG93IElkIG9mIGEgQ2xvc2VkIFdvcmtmbG93LlxuICpcbiAqICpOb3RlOiBBIFdvcmtmbG93IGNhbiBuZXZlciBiZSBzdGFydGVkIHdpdGggYSBXb3JrZmxvdyBJZCBvZiBhIFJ1bm5pbmcgV29ya2Zsb3cuKlxuICovXG5leHBvcnQgZW51bSBXb3JrZmxvd0lkUmV1c2VQb2xpY3kge1xuICAvKipcbiAgICogTm8gbmVlZCB0byB1c2UgdGhpcy5cbiAgICpcbiAgICogKElmIGEgYFdvcmtmbG93SWRSZXVzZVBvbGljeWAgaXMgc2V0IHRvIHRoaXMsIG9yIGlzIG5vdCBzZXQgYXQgYWxsLCB0aGUgZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQuKVxuICAgKi9cbiAgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX1VOU1BFQ0lGSUVEID0gMCxcblxuICAvKipcbiAgICogVGhlIFdvcmtmbG93IGNhbiBiZSBzdGFydGVkIGlmIHRoZSBwcmV2aW91cyBXb3JrZmxvdyBpcyBpbiBhIENsb3NlZCBzdGF0ZS5cbiAgICogQGRlZmF1bHRcbiAgICovXG4gIFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9BTExPV19EVVBMSUNBVEUgPSAxLFxuXG4gIC8qKlxuICAgKiBUaGUgV29ya2Zsb3cgY2FuIGJlIHN0YXJ0ZWQgaWYgdGhlIHByZXZpb3VzIFdvcmtmbG93IGlzIGluIGEgQ2xvc2VkIHN0YXRlIHRoYXQgaXMgbm90IENvbXBsZXRlZC5cbiAgICovXG4gIFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9BTExPV19EVVBMSUNBVEVfRkFJTEVEX09OTFkgPSAyLFxuXG4gIC8qKlxuICAgKiBUaGUgV29ya2Zsb3cgY2Fubm90IGJlIHN0YXJ0ZWQuXG4gICAqL1xuICBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfUkVKRUNUX0RVUExJQ0FURSA9IDMsXG5cbiAgLyoqXG4gICAqIFRlcm1pbmF0ZSB0aGUgY3VycmVudCB3b3JrZmxvdyBpZiBvbmUgaXMgYWxyZWFkeSBydW5uaW5nLlxuICAgKi9cbiAgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX1RFUk1JTkFURV9JRl9SVU5OSU5HID0gNCxcbn1cblxuY2hlY2tFeHRlbmRzPHRlbXBvcmFsLmFwaS5lbnVtcy52MS5Xb3JrZmxvd0lkUmV1c2VQb2xpY3ksIFdvcmtmbG93SWRSZXVzZVBvbGljeT4oKTtcbmNoZWNrRXh0ZW5kczxXb3JrZmxvd0lkUmV1c2VQb2xpY3ksIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5Xb3JrZmxvd0lkUmV1c2VQb2xpY3k+KCk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmFzZVdvcmtmbG93T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIGEgV29ya2Zsb3cgY2FuIGJlIHN0YXJ0ZWQgd2l0aCBhIFdvcmtmbG93IElkIG9mIGEgQ2xvc2VkIFdvcmtmbG93LlxuICAgKlxuICAgKiAqTm90ZTogQSBXb3JrZmxvdyBjYW4gbmV2ZXIgYmUgc3RhcnRlZCB3aXRoIGEgV29ya2Zsb3cgSWQgb2YgYSBSdW5uaW5nIFdvcmtmbG93LipcbiAgICpcbiAgICogQGRlZmF1bHQge0BsaW5rIFdvcmtmbG93SWRSZXVzZVBvbGljeS5XT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfQUxMT1dfRFVQTElDQVRFfVxuICAgKi9cbiAgd29ya2Zsb3dJZFJldXNlUG9saWN5PzogV29ya2Zsb3dJZFJldXNlUG9saWN5O1xuXG4gIC8qKlxuICAgKiBDb250cm9scyBob3cgYSBXb3JrZmxvdyBFeGVjdXRpb24gaXMgcmV0cmllZC5cbiAgICpcbiAgICogQnkgZGVmYXVsdCwgV29ya2Zsb3cgRXhlY3V0aW9ucyBhcmUgbm90IHJldHJpZWQuIERvIG5vdCBvdmVycmlkZSB0aGlzIGJlaGF2aW9yIHVubGVzcyB5b3Uga25vdyB3aGF0IHlvdSdyZSBkb2luZy5cbiAgICoge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9jb25jZXB0cy93aGF0LWlzLWEtcmV0cnktcG9saWN5LyB8IE1vcmUgaW5mb3JtYXRpb259LlxuICAgKi9cbiAgcmV0cnk/OiBSZXRyeVBvbGljeTtcblxuICAvKipcbiAgICogT3B0aW9uYWwgY3JvbiBzY2hlZHVsZSBmb3IgV29ya2Zsb3cuIElmIGEgY3JvbiBzY2hlZHVsZSBpcyBzcGVjaWZpZWQsIHRoZSBXb3JrZmxvdyB3aWxsIHJ1biBhcyBhIGNyb24gYmFzZWQgb24gdGhlXG4gICAqIHNjaGVkdWxlLiBUaGUgc2NoZWR1bGluZyB3aWxsIGJlIGJhc2VkIG9uIFVUQyB0aW1lLiBUaGUgc2NoZWR1bGUgZm9yIHRoZSBuZXh0IHJ1biBvbmx5IGhhcHBlbnMgYWZ0ZXIgdGhlIGN1cnJlbnRcbiAgICogcnVuIGlzIGNvbXBsZXRlZC9mYWlsZWQvdGltZW91dC4gSWYgYSBSZXRyeVBvbGljeSBpcyBhbHNvIHN1cHBsaWVkLCBhbmQgdGhlIFdvcmtmbG93IGZhaWxlZCBvciB0aW1lZCBvdXQsIHRoZVxuICAgKiBXb3JrZmxvdyB3aWxsIGJlIHJldHJpZWQgYmFzZWQgb24gdGhlIHJldHJ5IHBvbGljeS4gV2hpbGUgdGhlIFdvcmtmbG93IGlzIHJldHJ5aW5nLCBpdCB3b24ndCBzY2hlZHVsZSBpdHMgbmV4dCBydW4uXG4gICAqIElmIHRoZSBuZXh0IHNjaGVkdWxlIGlzIGR1ZSB3aGlsZSB0aGUgV29ya2Zsb3cgaXMgcnVubmluZyAob3IgcmV0cnlpbmcpLCB0aGVuIGl0IHdpbGwgc2tpcCB0aGF0IHNjaGVkdWxlLiBDcm9uXG4gICAqIFdvcmtmbG93IHdpbGwgbm90IHN0b3AgdW50aWwgaXQgaXMgdGVybWluYXRlZCBvciBjYW5jZWxsZWQgKGJ5IHJldHVybmluZyB0ZW1wb3JhbC5DYW5jZWxlZEVycm9yKS5cbiAgICogaHR0cHM6Ly9jcm9udGFiLmd1cnUvIGlzIHVzZWZ1bCBmb3IgdGVzdGluZyB5b3VyIGNyb24gZXhwcmVzc2lvbnMuXG4gICAqL1xuICBjcm9uU2NoZWR1bGU/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBhZGRpdGlvbmFsIG5vbi1pbmRleGVkIGluZm9ybWF0aW9uIHRvIGF0dGFjaCB0byB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uLiBUaGUgdmFsdWVzIGNhbiBiZSBhbnl0aGluZyB0aGF0XG4gICAqIGlzIHNlcmlhbGl6YWJsZSBieSB7QGxpbmsgRGF0YUNvbnZlcnRlcn0uXG4gICAqL1xuICBtZW1vPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBhZGRpdGlvbmFsIGluZGV4ZWQgaW5mb3JtYXRpb24gdG8gYXR0YWNoIHRvIHRoZSBXb3JrZmxvdyBFeGVjdXRpb24uIE1vcmUgaW5mbzpcbiAgICogaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2RvY3MvdHlwZXNjcmlwdC9zZWFyY2gtYXR0cmlidXRlc1xuICAgKlxuICAgKiBWYWx1ZXMgYXJlIGFsd2F5cyBjb252ZXJ0ZWQgdXNpbmcge0BsaW5rIEpzb25QYXlsb2FkQ29udmVydGVyfSwgZXZlbiB3aGVuIGEgY3VzdG9tIGRhdGEgY29udmVydGVyIGlzIHByb3ZpZGVkLlxuICAgKi9cbiAgc2VhcmNoQXR0cmlidXRlcz86IFNlYXJjaEF0dHJpYnV0ZXM7XG59XG5cbmV4cG9ydCB0eXBlIFdpdGhXb3JrZmxvd0FyZ3M8VyBleHRlbmRzIFdvcmtmbG93LCBUPiA9IFQgJlxuICAoUGFyYW1ldGVyczxXPiBleHRlbmRzIFthbnksIC4uLmFueVtdXVxuICAgID8ge1xuICAgICAgICAvKipcbiAgICAgICAgICogQXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIFdvcmtmbG93XG4gICAgICAgICAqL1xuICAgICAgICBhcmdzOiBQYXJhbWV0ZXJzPFc+IHwgUmVhZG9ubHk8UGFyYW1ldGVyczxXPj47XG4gICAgICB9XG4gICAgOiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgV29ya2Zsb3dcbiAgICAgICAgICovXG4gICAgICAgIGFyZ3M/OiBQYXJhbWV0ZXJzPFc+IHwgUmVhZG9ubHk8UGFyYW1ldGVyczxXPj47XG4gICAgICB9KTtcblxuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0R1cmF0aW9uT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBUaGUgdGltZSBhZnRlciB3aGljaCB3b3JrZmxvdyBydW4gaXMgYXV0b21hdGljYWxseSB0ZXJtaW5hdGVkIGJ5IFRlbXBvcmFsIHNlcnZpY2UuIERvIG5vdFxuICAgKiByZWx5IG9uIHJ1biB0aW1lb3V0IGZvciBidXNpbmVzcyBsZXZlbCB0aW1lb3V0cy4gSXQgaXMgcHJlZmVycmVkIHRvIHVzZSBpbiB3b3JrZmxvdyB0aW1lcnNcbiAgICogZm9yIHRoaXMgcHVycG9zZS5cbiAgICpcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICB3b3JrZmxvd1J1blRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICpcbiAgICogVGhlIHRpbWUgYWZ0ZXIgd2hpY2ggd29ya2Zsb3cgZXhlY3V0aW9uICh3aGljaCBpbmNsdWRlcyBydW4gcmV0cmllcyBhbmQgY29udGludWUgYXMgbmV3KSBpc1xuICAgKiBhdXRvbWF0aWNhbGx5IHRlcm1pbmF0ZWQgYnkgVGVtcG9yYWwgc2VydmljZS4gRG8gbm90IHJlbHkgb24gZXhlY3V0aW9uIHRpbWVvdXQgZm9yIGJ1c2luZXNzXG4gICAqIGxldmVsIHRpbWVvdXRzLiBJdCBpcyBwcmVmZXJyZWQgdG8gdXNlIGluIHdvcmtmbG93IHRpbWVycyBmb3IgdGhpcyBwdXJwb3NlLlxuICAgKlxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHdvcmtmbG93RXhlY3V0aW9uVGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBNYXhpbXVtIGV4ZWN1dGlvbiB0aW1lIG9mIGEgc2luZ2xlIHdvcmtmbG93IHRhc2suIERlZmF1bHQgaXMgMTAgc2Vjb25kcy5cbiAgICpcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICB3b3JrZmxvd1Rhc2tUaW1lb3V0PzogRHVyYXRpb247XG59XG5cbmV4cG9ydCB0eXBlIENvbW1vbldvcmtmbG93T3B0aW9ucyA9IEJhc2VXb3JrZmxvd09wdGlvbnMgJiBXb3JrZmxvd0R1cmF0aW9uT3B0aW9ucztcblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RXb3JrZmxvd1R5cGU8VCBleHRlbmRzIFdvcmtmbG93Pih3b3JrZmxvd1R5cGVPckZ1bmM6IHN0cmluZyB8IFQpOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIHdvcmtmbG93VHlwZU9yRnVuYyA9PT0gJ3N0cmluZycpIHJldHVybiB3b3JrZmxvd1R5cGVPckZ1bmMgYXMgc3RyaW5nO1xuICBpZiAodHlwZW9mIHdvcmtmbG93VHlwZU9yRnVuYyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmICh3b3JrZmxvd1R5cGVPckZ1bmM/Lm5hbWUpIHJldHVybiB3b3JrZmxvd1R5cGVPckZ1bmMubmFtZTtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIHdvcmtmbG93IHR5cGU6IHRoZSB3b3JrZmxvdyBmdW5jdGlvbiBpcyBhbm9ueW1vdXMnKTtcbiAgfVxuICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgIGBJbnZhbGlkIHdvcmtmbG93IHR5cGU6IGV4cGVjdGVkIGVpdGhlciBhIHN0cmluZyBvciBhIGZ1bmN0aW9uLCBnb3QgJyR7dHlwZW9mIHdvcmtmbG93VHlwZU9yRnVuY30nYFxuICApO1xufVxuIiwiLy8gQSBwb3J0IG9mIGFuIGFsZ29yaXRobSBieSBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLmNvbT4sIDIwMTBcbi8vIGh0dHA6Ly9iYWFnb2UuY29tL2VuL1JhbmRvbU11c2luZ3MvamF2YXNjcmlwdC9cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ucXVpbmxhbi9iZXR0ZXItcmFuZG9tLW51bWJlcnMtZm9yLWphdmFzY3JpcHQtbWlycm9yXG4vLyBPcmlnaW5hbCB3b3JrIGlzIHVuZGVyIE1JVCBsaWNlbnNlIC1cblxuLy8gQ29weXJpZ2h0IChDKSAyMDEwIGJ5IEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2Uub3JnPlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8vIFRha2VuIGFuZCBtb2RpZmllZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9kYXZpZGJhdS9zZWVkcmFuZG9tL2Jsb2IvcmVsZWFzZWQvbGliL2FsZWEuanNcblxuY2xhc3MgQWxlYSB7XG4gIHB1YmxpYyBjOiBudW1iZXI7XG4gIHB1YmxpYyBzMDogbnVtYmVyO1xuICBwdWJsaWMgczE6IG51bWJlcjtcbiAgcHVibGljIHMyOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioc2VlZDogbnVtYmVyW10pIHtcbiAgICBjb25zdCBtYXNoID0gbmV3IE1hc2goKTtcbiAgICAvLyBBcHBseSB0aGUgc2VlZGluZyBhbGdvcml0aG0gZnJvbSBCYWFnb2UuXG4gICAgdGhpcy5jID0gMTtcbiAgICB0aGlzLnMwID0gbWFzaC5tYXNoKFszMl0pO1xuICAgIHRoaXMuczEgPSBtYXNoLm1hc2goWzMyXSk7XG4gICAgdGhpcy5zMiA9IG1hc2gubWFzaChbMzJdKTtcbiAgICB0aGlzLnMwIC09IG1hc2gubWFzaChzZWVkKTtcbiAgICBpZiAodGhpcy5zMCA8IDApIHtcbiAgICAgIHRoaXMuczAgKz0gMTtcbiAgICB9XG4gICAgdGhpcy5zMSAtPSBtYXNoLm1hc2goc2VlZCk7XG4gICAgaWYgKHRoaXMuczEgPCAwKSB7XG4gICAgICB0aGlzLnMxICs9IDE7XG4gICAgfVxuICAgIHRoaXMuczIgLT0gbWFzaC5tYXNoKHNlZWQpO1xuICAgIGlmICh0aGlzLnMyIDwgMCkge1xuICAgICAgdGhpcy5zMiArPSAxO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBuZXh0KCk6IG51bWJlciB7XG4gICAgY29uc3QgdCA9IDIwOTE2MzkgKiB0aGlzLnMwICsgdGhpcy5jICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgICB0aGlzLnMwID0gdGhpcy5zMTtcbiAgICB0aGlzLnMxID0gdGhpcy5zMjtcbiAgICByZXR1cm4gKHRoaXMuczIgPSB0IC0gKHRoaXMuYyA9IHQgfCAwKSk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgUk5HID0gKCkgPT4gbnVtYmVyO1xuXG5leHBvcnQgZnVuY3Rpb24gYWxlYShzZWVkOiBudW1iZXJbXSk6IFJORyB7XG4gIGNvbnN0IHhnID0gbmV3IEFsZWEoc2VlZCk7XG4gIHJldHVybiB4Zy5uZXh0LmJpbmQoeGcpO1xufVxuXG5leHBvcnQgY2xhc3MgTWFzaCB7XG4gIHByaXZhdGUgbiA9IDB4ZWZjODI0OWQ7XG5cbiAgcHVibGljIG1hc2goZGF0YTogbnVtYmVyW10pOiBudW1iZXIge1xuICAgIGxldCB7IG4gfSA9IHRoaXM7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBuICs9IGRhdGFbaV07XG4gICAgICBsZXQgaCA9IDAuMDI1MTk2MDMyODI0MTY5MzggKiBuO1xuICAgICAgbiA9IGggPj4+IDA7XG4gICAgICBoIC09IG47XG4gICAgICBoICo9IG47XG4gICAgICBuID0gaCA+Pj4gMDtcbiAgICAgIGggLT0gbjtcbiAgICAgIG4gKz0gaCAqIDB4MTAwMDAwMDAwOyAvLyAyXjMyXG4gICAgfVxuICAgIHRoaXMubiA9IG47XG4gICAgcmV0dXJuIChuID4+PiAwKSAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gIH1cbn1cbiIsImltcG9ydCB0eXBlIHsgQXN5bmNMb2NhbFN0b3JhZ2UgYXMgQUxTIH0gZnJvbSAnbm9kZTphc3luY19ob29rcyc7XG5pbXBvcnQgeyBDYW5jZWxsZWRGYWlsdXJlLCBEdXJhdGlvbiwgSWxsZWdhbFN0YXRlRXJyb3IgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgbXNPcHRpb25hbFRvTnVtYmVyIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90aW1lJztcbmltcG9ydCB7IHVudHJhY2tQcm9taXNlIH0gZnJvbSAnLi9zdGFjay1oZWxwZXJzJztcbmltcG9ydCB7IGdldEFjdGl2YXRvciB9IGZyb20gJy4vZ2xvYmFsLWF0dHJpYnV0ZXMnO1xuaW1wb3J0IHsgU2RrRmxhZ3MgfSBmcm9tICcuL2ZsYWdzJztcblxuLy8gQXN5bmNMb2NhbFN0b3JhZ2UgaXMgaW5qZWN0ZWQgdmlhIHZtIG1vZHVsZSBpbnRvIGdsb2JhbCBzY29wZS5cbi8vIEluIGNhc2UgV29ya2Zsb3cgY29kZSBpcyBpbXBvcnRlZCBpbiBOb2RlLmpzIGNvbnRleHQsIHJlcGxhY2Ugd2l0aCBhbiBlbXB0eSBjbGFzcy5cbmV4cG9ydCBjb25zdCBBc3luY0xvY2FsU3RvcmFnZTogbmV3IDxUPigpID0+IEFMUzxUPiA9IChnbG9iYWxUaGlzIGFzIGFueSkuQXN5bmNMb2NhbFN0b3JhZ2UgPz8gY2xhc3Mge307XG5cbi8qKiBNYWdpYyBzeW1ib2wgdXNlZCB0byBjcmVhdGUgdGhlIHJvb3Qgc2NvcGUgLSBpbnRlbnRpb25hbGx5IG5vdCBleHBvcnRlZCAqL1xuY29uc3QgTk9fUEFSRU5UID0gU3ltYm9sKCdOT19QQVJFTlQnKTtcblxuLyoqXG4gKiBPcHRpb24gZm9yIGNvbnN0cnVjdGluZyBhIENhbmNlbGxhdGlvblNjb3BlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2FuY2VsbGF0aW9uU2NvcGVPcHRpb25zIHtcbiAgLyoqXG4gICAqIFRpbWUgaW4gbWlsbGlzZWNvbmRzIGJlZm9yZSB0aGUgc2NvcGUgY2FuY2VsbGF0aW9uIGlzIGF1dG9tYXRpY2FsbHkgcmVxdWVzdGVkXG4gICAqL1xuICB0aW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIElmIGZhbHNlLCBwcmV2ZW50IG91dGVyIGNhbmNlbGxhdGlvbiBmcm9tIHByb3BhZ2F0aW5nIHRvIGlubmVyIHNjb3BlcywgQWN0aXZpdGllcywgdGltZXJzLCBhbmQgVHJpZ2dlcnMsIGRlZmF1bHRzIHRvIHRydWUuXG4gICAqIChTY29wZSBzdGlsbCBwcm9wYWdhdGVzIENhbmNlbGxlZEZhaWx1cmUgdGhyb3duIGZyb20gd2l0aGluKS5cbiAgICovXG4gIGNhbmNlbGxhYmxlOiBib29sZWFuO1xuICAvKipcbiAgICogQW4gb3B0aW9uYWwgQ2FuY2VsbGF0aW9uU2NvcGUgKHVzZWZ1bCBmb3IgcnVubmluZyBiYWNrZ3JvdW5kIHRhc2tzKS5cbiAgICogVGhlIGBOT19QQVJFTlRgIHN5bWJvbCBpcyByZXNlcnZlZCBmb3IgdGhlIHJvb3Qgc2NvcGUuXG4gICAqL1xuICBwYXJlbnQ/OiBDYW5jZWxsYXRpb25TY29wZSB8IHR5cGVvZiBOT19QQVJFTlQ7XG59XG5cbi8qKlxuICogQ2FuY2VsbGF0aW9uIFNjb3BlcyBwcm92aWRlIHRoZSBtZWNoYW5pYyBieSB3aGljaCBhIFdvcmtmbG93IG1heSBncmFjZWZ1bGx5IGhhbmRsZSBpbmNvbWluZyByZXF1ZXN0cyBmb3IgY2FuY2VsbGF0aW9uXG4gKiAoZS5nLiBpbiByZXNwb25zZSB0byB7QGxpbmsgV29ya2Zsb3dIYW5kbGUuY2FuY2VsfSBvciB0aHJvdWdoIHRoZSBVSSBvciBDTEkpLCBhcyB3ZWxsIGFzIHJlcXVlc3QgY2FuY2VsYXRpb24gb2ZcbiAqIGNhbmNlbGxhYmxlIG9wZXJhdGlvbnMgaXQgb3ducyAoZS5nLiBBY3Rpdml0aWVzLCBUaW1lcnMsIENoaWxkIFdvcmtmbG93cywgZXRjKS5cbiAqXG4gKiBDYW5jZWxsYXRpb24gU2NvcGVzIGZvcm0gYSB0cmVlLCB3aXRoIHRoZSBXb3JrZmxvdydzIG1haW4gZnVuY3Rpb24gcnVubmluZyBpbiB0aGUgcm9vdCBzY29wZSBvZiB0aGF0IHRyZWUuXG4gKiBCeSBkZWZhdWx0LCBjYW5jZWxsYXRpb24gcHJvcGFnYXRlcyBkb3duIGZyb20gYSBwYXJlbnQgc2NvcGUgdG8gaXRzIGNoaWxkcmVuIGFuZCBpdHMgY2FuY2VsbGFibGUgb3BlcmF0aW9ucy5cbiAqIEEgbm9uLWNhbmNlbGxhYmxlIHNjb3BlIGNhbiByZWNlaXZlIGNhbmNlbGxhdGlvbiByZXF1ZXN0cywgYnV0IGlzIG5ldmVyIGVmZmVjdGl2ZWx5IGNvbnNpZGVyZWQgYXMgY2FuY2VsbGVkLFxuICogdGh1cyBzaGllbGRkaW5nIGl0cyBjaGlsZHJlbiBhbmQgY2FuY2VsbGFibGUgb3BlcmF0aW9ucyBmcm9tIHByb3BhZ2F0aW9uIG9mIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyBpdCByZWNlaXZlcy5cbiAqXG4gKiBTY29wZXMgYXJlIGNyZWF0ZWQgdXNpbmcgdGhlIGBDYW5jZWxsYXRpb25TY29wZWAgY29uc3RydWN0b3Igb3IgdGhlIHN0YXRpYyBoZWxwZXIgbWV0aG9kcyB7QGxpbmsgY2FuY2VsbGFibGV9LFxuICoge0BsaW5rIG5vbkNhbmNlbGxhYmxlfSBhbmQge0BsaW5rIHdpdGhUaW1lb3V0fS4gYHdpdGhUaW1lb3V0YCBjcmVhdGVzIGEgc2NvcGUgdGhhdCBhdXRvbWF0aWNhbGx5IGNhbmNlbHMgaXRzZWxmIGFmdGVyXG4gKiBzb21lIGR1cmF0aW9uLlxuICpcbiAqIENhbmNlbGxhdGlvbiBvZiBhIGNhbmNlbGxhYmxlIHNjb3BlIHJlc3VsdHMgaW4gYWxsIG9wZXJhdGlvbnMgY3JlYXRlZCBkaXJlY3RseSBpbiB0aGF0IHNjb3BlIHRvIHRocm93IGFcbiAqIHtAbGluayBDYW5jZWxsZWRGYWlsdXJlfSAoZWl0aGVyIGRpcmVjdGx5LCBvciBhcyB0aGUgYGNhdXNlYCBvZiBhbiB7QGxpbmsgQWN0aXZpdHlGYWlsdXJlfSBvciBhXG4gKiB7QGxpbmsgQ2hpbGRXb3JrZmxvd0ZhaWx1cmV9KS4gRnVydGhlciBhdHRlbXB0IHRvIGNyZWF0ZSBuZXcgY2FuY2VsbGFibGUgc2NvcGVzIG9yIGNhbmNlbGxhYmxlIG9wZXJhdGlvbnMgd2l0aGluIGFcbiAqIHNjb3BlIHRoYXQgaGFzIGFscmVhZHkgYmVlbiBjYW5jZWxsZWQgd2lsbCBhbHNvIGltbWVkaWF0ZWx5IHRocm93IGEge0BsaW5rIENhbmNlbGxlZEZhaWx1cmV9IGV4Y2VwdGlvbi4gSXQgaXMgaG93ZXZlclxuICogcG9zc2libGUgdG8gY3JlYXRlIGEgbm9uLWNhbmNlbGxhYmxlIHNjb3BlIGF0IHRoYXQgcG9pbnQ7IHRoaXMgaXMgb2Z0ZW4gdXNlZCB0byBleGVjdXRlIHJvbGxiYWNrIG9yIGNsZWFudXBcbiAqIG9wZXJhdGlvbnMuIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYHRzXG4gKiBhc3luYyBmdW5jdGlvbiBteVdvcmtmbG93KC4uLik6IFByb21pc2U8dm9pZD4ge1xuICogICB0cnkge1xuICogICAgIC8vIFRoaXMgYWN0aXZpdHkgcnVucyBpbiB0aGUgcm9vdCBjYW5jZWxsYXRpb24gc2NvcGUuIFRoZXJlZm9yZSwgYSBjYW5jZWxhdGlvbiByZXF1ZXN0IG9uXG4gKiAgICAgLy8gdGhlIFdvcmtmbG93IGV4ZWN1dGlvbiAoZS5nLiB0aHJvdWdoIHRoZSBVSSBvciBDTEkpIGF1dG9tYXRpY2FsbHkgcHJvcGFnYXRlcyB0byB0aGlzXG4gKiAgICAgLy8gYWN0aXZpdHkuIEFzc3VtaW5nIHRoYXQgdGhlIGFjdGl2aXR5IHByb3Blcmx5IGhhbmRsZSB0aGUgY2FuY2VsbGF0aW9uIHJlcXVlc3QsIHRoZW4gdGhlXG4gKiAgICAgLy8gY2FsbCBiZWxvdyB3aWxsIHRocm93IGFuIGBBY3Rpdml0eUZhaWx1cmVgIGV4Y2VwdGlvbiwgd2l0aCBgY2F1c2VgIHNldHMgdG8gYW5cbiAqICAgICAvLyBpbnN0YW5jZSBvZiBgQ2FuY2VsbGVkRmFpbHVyZWAuXG4gKiAgICAgYXdhaXQgc29tZUFjdGl2aXR5KCk7XG4gKiAgIH0gY2F0Y2ggKGUpIHtcbiAqICAgICBpZiAoaXNDYW5jZWxsYXRpb24oZSkpIHtcbiAqICAgICAgIC8vIFJ1biBjbGVhbnVwIGFjdGl2aXR5IGluIGEgbm9uLWNhbmNlbGxhYmxlIHNjb3BlXG4gKiAgICAgICBhd2FpdCBDYW5jZWxsYXRpb25TY29wZS5ub25DYW5jZWxsYWJsZShhc3luYyAoKSA9PiB7XG4gKiAgICAgICAgIGF3YWl0IGNsZWFudXBBY3Rpdml0eSgpO1xuICogICAgICAgfVxuICogICAgIH0gZWxzZSB7XG4gKiAgICAgICB0aHJvdyBlO1xuICogICAgIH1cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQSBjYW5jZWxsYWJsZSBzY29wZSBtYXkgYmUgcHJvZ3JhbWF0aWNhbGx5IGNhbmNlbGxlZCBieSBjYWxsaW5nIHtAbGluayBjYW5jZWx8YHNjb3BlLmNhbmNlbCgpYH1gLiBUaGlzIG1heSBiZSB1c2VkLFxuICogZm9yIGV4YW1wbGUsIHRvIGV4cGxpY2l0bHkgcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gQWN0aXZpdHkgb3IgQ2hpbGQgV29ya2Zsb3c6XG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IGNhbmNlbGxhYmxlQWN0aXZpdHlTY29wZSA9IG5ldyBDYW5jZWxsYXRpb25TY29wZSgpO1xuICogY29uc3QgYWN0aXZpdHlQcm9taXNlID0gY2FuY2VsbGFibGVBY3Rpdml0eVNjb3BlLnJ1bigoKSA9PiBzb21lQWN0aXZpdHkoKSk7XG4gKiBjYW5jZWxsYWJsZUFjdGl2aXR5U2NvcGUuY2FuY2VsKCk7IC8vIENhbmNlbHMgdGhlIGFjdGl2aXR5XG4gKiBhd2FpdCBhY3Rpdml0eVByb21pc2U7IC8vIFRocm93cyBgQWN0aXZpdHlGYWlsdXJlYCB3aXRoIGBjYXVzZWAgc2V0IHRvIGBDYW5jZWxsZWRGYWlsdXJlYFxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBDYW5jZWxsYXRpb25TY29wZSB7XG4gIC8qKlxuICAgKiBUaW1lIGluIG1pbGxpc2Vjb25kcyBiZWZvcmUgdGhlIHNjb3BlIGNhbmNlbGxhdGlvbiBpcyBhdXRvbWF0aWNhbGx5IHJlcXVlc3RlZFxuICAgKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHRpbWVvdXQ/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIElmIGZhbHNlLCB0aGVuIHRoaXMgc2NvcGUgd2lsbCBuZXZlciBiZSBjb25zaWRlcmVkIGNhbmNlbGxlZCwgZXZlbiBpZiBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IGlzIHJlY2VpdmVkIChlaXRoZXJcbiAgICogZGlyZWN0bHkgYnkgY2FsbGluZyBgc2NvcGUuY2FuY2VsKClgIG9yIGluZGlyZWN0bHkgYnkgY2FuY2VsbGluZyBhIGNhbmNlbGxhYmxlIHBhcmVudCBzY29wZSkuIFRoaXMgZWZmZWN0aXZlbHlcbiAgICogc2hpZWxkcyB0aGUgc2NvcGUncyBjaGlsZHJlbiBhbmQgY2FuY2VsbGFibGUgb3BlcmF0aW9ucyBmcm9tIHByb3BhZ2F0aW9uIG9mIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyBtYWRlIG9uIHRoZVxuICAgKiBub24tY2FuY2VsbGFibGUgc2NvcGUuXG4gICAqXG4gICAqIE5vdGUgdGhhdCB0aGUgUHJvbWlzZSByZXR1cm5lZCBieSB0aGUgYHJ1bmAgZnVuY3Rpb24gb2Ygbm9uLWNhbmNlbGxhYmxlIHNjb3BlIG1heSBzdGlsbCB0aHJvdyBhIGBDYW5jZWxsZWRGYWlsdXJlYFxuICAgKiBpZiBzdWNoIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24gZnJvbSB3aXRoaW4gdGhhdCBzY29wZSAoZS5nLiBieSBkaXJlY3RseSBjYW5jZWxsaW5nIGEgY2FuY2VsbGFibGUgY2hpbGQgc2NvcGUpLlxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGNhbmNlbGxhYmxlOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBBbiBvcHRpb25hbCBDYW5jZWxsYXRpb25TY29wZSAodXNlZnVsIGZvciBydW5uaW5nIGJhY2tncm91bmQgdGFza3MpLCBkZWZhdWx0cyB0byB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudH0oKVxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IHBhcmVudD86IENhbmNlbGxhdGlvblNjb3BlO1xuXG4gIC8qKlxuICAgKiBBIFByb21pc2UgdGhhdCB0aHJvd3Mgd2hlbiBhIGNhbmNlbGxhYmxlIHNjb3BlIHJlY2VpdmVzIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QsIGVpdGhlciBkaXJlY3RseVxuICAgKiAoaS5lLiBgc2NvcGUuY2FuY2VsKClgKSwgb3IgaW5kaXJlY3RseSAoYnkgY2FuY2VsbGluZyBhIGNhbmNlbGxhYmxlIHBhcmVudCBzY29wZSkuXG4gICAqXG4gICAqIE5vdGUgdGhhdCBhIG5vbi1jYW5jZWxsYWJsZSBzY29wZSBtYXkgcmVjZWl2ZSBjYW5jZWxsYXRpb24gcmVxdWVzdHMsIHJlc3VsdGluZyBpbiB0aGUgYGNhbmNlbFJlcXVlc3RlZGAgcHJvbWlzZSBmb3JcbiAgICogdGhhdCBzY29wZSB0byB0aHJvdywgdGhvdWdoIHRoZSBzY29wZSB3aWxsIG5vdCBlZmZlY3RpdmVseSBnZXQgY2FuY2VsbGVkIChpLmUuIGBjb25zaWRlcmVkQ2FuY2VsbGVkYCB3aWxsIHN0aWxsXG4gICAqIHJldHVybiBgZmFsc2VgLCBhbmQgY2FuY2VsbGF0aW9uIHdpbGwgbm90IGJlIHByb3BhZ2F0ZWQgdG8gY2hpbGQgc2NvcGVzIGFuZCBjb250YWluZWQgb3BlcmF0aW9ucykuXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgY2FuY2VsUmVxdWVzdGVkOiBQcm9taXNlPG5ldmVyPjtcblxuICAjY2FuY2VsUmVxdWVzdGVkID0gZmFsc2U7XG5cbiAgLy8gVHlwZXNjcmlwdCBkb2VzIG5vdCB1bmRlcnN0YW5kIHRoYXQgdGhlIFByb21pc2UgZXhlY3V0b3IgcnVucyBzeW5jaHJvbm91c2x5IGluIHRoZSBjb25zdHJ1Y3RvclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gIC8vIEB0cy1pZ25vcmVcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zPzogQ2FuY2VsbGF0aW9uU2NvcGVPcHRpb25zKSB7XG4gICAgdGhpcy50aW1lb3V0ID0gbXNPcHRpb25hbFRvTnVtYmVyKG9wdGlvbnM/LnRpbWVvdXQpO1xuICAgIHRoaXMuY2FuY2VsbGFibGUgPSBvcHRpb25zPy5jYW5jZWxsYWJsZSA/PyB0cnVlO1xuICAgIHRoaXMuY2FuY2VsUmVxdWVzdGVkID0gbmV3IFByb21pc2UoKF8sIHJlamVjdCkgPT4ge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUU0MgZG9lc24ndCB1bmRlcnN0YW5kIHRoYXQgdGhlIFByb21pc2UgZXhlY3V0b3IgcnVucyBzeW5jaHJvbm91c2x5XG4gICAgICB0aGlzLnJlamVjdCA9IChlcnIpID0+IHtcbiAgICAgICAgdGhpcy4jY2FuY2VsUmVxdWVzdGVkID0gdHJ1ZTtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9O1xuICAgIH0pO1xuICAgIHVudHJhY2tQcm9taXNlKHRoaXMuY2FuY2VsUmVxdWVzdGVkKTtcbiAgICAvLyBBdm9pZCB1bmhhbmRsZWQgcmVqZWN0aW9uc1xuICAgIHVudHJhY2tQcm9taXNlKHRoaXMuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKCgpID0+IHVuZGVmaW5lZCkpO1xuICAgIGlmIChvcHRpb25zPy5wYXJlbnQgIT09IE5PX1BBUkVOVCkge1xuICAgICAgdGhpcy5wYXJlbnQgPSBvcHRpb25zPy5wYXJlbnQgfHwgQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLnBhcmVudC5jYW5jZWxsYWJsZSB8fFxuICAgICAgICAodGhpcy5wYXJlbnQuI2NhbmNlbFJlcXVlc3RlZCAmJlxuICAgICAgICAgICFnZXRBY3RpdmF0b3IoKS5oYXNGbGFnKFNka0ZsYWdzLk5vbkNhbmNlbGxhYmxlU2NvcGVzQXJlU2hpZWxkZWRGcm9tUHJvcGFnYXRpb24pKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuI2NhbmNlbFJlcXVlc3RlZCA9IHRoaXMucGFyZW50LiNjYW5jZWxSZXF1ZXN0ZWQ7XG4gICAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICAgIHRoaXMucGFyZW50LmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlamVjdChlcnIpO1xuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgICB0aGlzLnBhcmVudC5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKCFnZXRBY3RpdmF0b3IoKS5oYXNGbGFnKFNka0ZsYWdzLk5vbkNhbmNlbGxhYmxlU2NvcGVzQXJlU2hpZWxkZWRGcm9tUHJvcGFnYXRpb24pKSB7XG4gICAgICAgICAgICAgIHRoaXMucmVqZWN0KGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgc2NvcGUgd2FzIGVmZmVjdGl2ZWx5IGNhbmNlbGxlZC4gQSBub24tY2FuY2VsbGFibGUgc2NvcGUgY2FuIG5ldmVyIGJlIGNvbnNpZGVyZWQgY2FuY2VsbGVkLlxuICAgKi9cbiAgcHVibGljIGdldCBjb25zaWRlcmVkQ2FuY2VsbGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLiNjYW5jZWxSZXF1ZXN0ZWQgJiYgdGhpcy5jYW5jZWxsYWJsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBY3RpdmF0ZSB0aGUgc2NvcGUgYXMgY3VycmVudCBhbmQgcnVuICBgZm5gXG4gICAqXG4gICAqIEFueSB0aW1lcnMsIEFjdGl2aXRpZXMsIFRyaWdnZXJzIGFuZCBDYW5jZWxsYXRpb25TY29wZXMgY3JlYXRlZCBpbiB0aGUgYm9keSBvZiBgZm5gXG4gICAqIGF1dG9tYXRpY2FsbHkgbGluayB0aGVpciBjYW5jZWxsYXRpb24gdG8gdGhpcyBzY29wZS5cbiAgICpcbiAgICogQHJldHVybiB0aGUgcmVzdWx0IG9mIGBmbmBcbiAgICovXG4gIHJ1bjxUPihmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiBzdG9yYWdlLnJ1bih0aGlzLCB0aGlzLnJ1bkluQ29udGV4dC5iaW5kKHRoaXMsIGZuKSBhcyAoKSA9PiBQcm9taXNlPFQ+KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgdGhhdCBydW5zIGEgZnVuY3Rpb24gaW4gQXN5bmNMb2NhbFN0b3JhZ2UgY29udGV4dC5cbiAgICpcbiAgICogQ291bGQgaGF2ZSBiZWVuIHdyaXR0ZW4gYXMgYW5vbnltb3VzIGZ1bmN0aW9uLCBtYWRlIGludG8gYSBtZXRob2QgZm9yIGltcHJvdmVkIHN0YWNrIHRyYWNlcy5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBydW5JbkNvbnRleHQ8VD4oZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICBsZXQgdGltZXJTY29wZTogQ2FuY2VsbGF0aW9uU2NvcGUgfCB1bmRlZmluZWQ7XG4gICAgaWYgKHRoaXMudGltZW91dCkge1xuICAgICAgdGltZXJTY29wZSA9IG5ldyBDYW5jZWxsYXRpb25TY29wZSgpO1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHRpbWVyU2NvcGVcbiAgICAgICAgICAucnVuKCgpID0+IHNsZWVwKHRoaXMudGltZW91dCBhcyBudW1iZXIpKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgKCkgPT4gdGhpcy5jYW5jZWwoKSxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgLy8gc2NvcGUgd2FzIGFscmVhZHkgY2FuY2VsbGVkLCBpZ25vcmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IGZuKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChcbiAgICAgICAgdGltZXJTY29wZSAmJlxuICAgICAgICAhdGltZXJTY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkICYmXG4gICAgICAgIGdldEFjdGl2YXRvcigpLmhhc0ZsYWcoU2RrRmxhZ3MuTm9uQ2FuY2VsbGFibGVTY29wZXNBcmVTaGllbGRlZEZyb21Qcm9wYWdhdGlvbilcbiAgICAgICkge1xuICAgICAgICB0aW1lclNjb3BlLmNhbmNlbCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1ZXN0IHRvIGNhbmNlbCB0aGUgc2NvcGUgYW5kIGxpbmtlZCBjaGlsZHJlblxuICAgKi9cbiAgY2FuY2VsKCk6IHZvaWQge1xuICAgIHRoaXMucmVqZWN0KG5ldyBDYW5jZWxsZWRGYWlsdXJlKCdDYW5jZWxsYXRpb24gc2NvcGUgY2FuY2VsbGVkJykpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBcImFjdGl2ZVwiIHNjb3BlXG4gICAqL1xuICBzdGF0aWMgY3VycmVudCgpOiBDYW5jZWxsYXRpb25TY29wZSB7XG4gICAgLy8gVXNpbmcgZ2xvYmFscyBkaXJlY3RseSBpbnN0ZWFkIG9mIGEgaGVscGVyIGZ1bmN0aW9uIHRvIGF2b2lkIGNpcmN1bGFyIGltcG9ydFxuICAgIHJldHVybiBzdG9yYWdlLmdldFN0b3JlKCkgPz8gKGdsb2JhbFRoaXMgYXMgYW55KS5fX1RFTVBPUkFMX0FDVElWQVRPUl9fLnJvb3RTY29wZTtcbiAgfVxuXG4gIC8qKiBBbGlhcyB0byBgbmV3IENhbmNlbGxhdGlvblNjb3BlKHsgY2FuY2VsbGFibGU6IHRydWUgfSkucnVuKGZuKWAgKi9cbiAgc3RhdGljIGNhbmNlbGxhYmxlPFQ+KGZuOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHsgY2FuY2VsbGFibGU6IHRydWUgfSkucnVuKGZuKTtcbiAgfVxuXG4gIC8qKiBBbGlhcyB0byBgbmV3IENhbmNlbGxhdGlvblNjb3BlKHsgY2FuY2VsbGFibGU6IGZhbHNlIH0pLnJ1bihmbilgICovXG4gIHN0YXRpYyBub25DYW5jZWxsYWJsZTxUPihmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiBuZXcgdGhpcyh7IGNhbmNlbGxhYmxlOiBmYWxzZSB9KS5ydW4oZm4pO1xuICB9XG5cbiAgLyoqIEFsaWFzIHRvIGBuZXcgQ2FuY2VsbGF0aW9uU2NvcGUoeyBjYW5jZWxsYWJsZTogdHJ1ZSwgdGltZW91dCB9KS5ydW4oZm4pYCAqL1xuICBzdGF0aWMgd2l0aFRpbWVvdXQ8VD4odGltZW91dDogRHVyYXRpb24sIGZuOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHsgY2FuY2VsbGFibGU6IHRydWUsIHRpbWVvdXQgfSkucnVuKGZuKTtcbiAgfVxufVxuXG5jb25zdCBzdG9yYWdlID0gbmV3IEFzeW5jTG9jYWxTdG9yYWdlPENhbmNlbGxhdGlvblNjb3BlPigpO1xuXG4vKipcbiAqIEF2b2lkIGV4cG9zaW5nIHRoZSBzdG9yYWdlIGRpcmVjdGx5IHNvIGl0IGRvZXNuJ3QgZ2V0IGZyb3plblxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzYWJsZVN0b3JhZ2UoKTogdm9pZCB7XG4gIHN0b3JhZ2UuZGlzYWJsZSgpO1xufVxuXG5leHBvcnQgY2xhc3MgUm9vdENhbmNlbGxhdGlvblNjb3BlIGV4dGVuZHMgQ2FuY2VsbGF0aW9uU2NvcGUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcih7IGNhbmNlbGxhYmxlOiB0cnVlLCBwYXJlbnQ6IE5PX1BBUkVOVCB9KTtcbiAgfVxuXG4gIGNhbmNlbCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlamVjdChuZXcgQ2FuY2VsbGVkRmFpbHVyZSgnV29ya2Zsb3cgY2FuY2VsbGVkJykpO1xuICB9XG59XG5cbi8qKiBUaGlzIGZ1bmN0aW9uIGlzIGhlcmUgdG8gYXZvaWQgYSBjaXJjdWxhciBkZXBlbmRlbmN5IGJldHdlZW4gdGhpcyBtb2R1bGUgYW5kIHdvcmtmbG93LnRzICovXG5sZXQgc2xlZXAgPSAoXzogRHVyYXRpb24pOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdXb3JrZmxvdyBoYXMgbm90IGJlZW4gcHJvcGVybHkgaW5pdGlhbGl6ZWQnKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclNsZWVwSW1wbGVtZW50YXRpb24oZm46IHR5cGVvZiBzbGVlcCk6IHZvaWQge1xuICBzbGVlcCA9IGZuO1xufVxuIiwiaW1wb3J0IHsgQWN0aXZpdHlGYWlsdXJlLCBDYW5jZWxsZWRGYWlsdXJlLCBDaGlsZFdvcmtmbG93RmFpbHVyZSB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvciB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvdHlwZS1oZWxwZXJzJztcbmltcG9ydCB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgYWxsIHdvcmtmbG93IGVycm9yc1xuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1dvcmtmbG93RXJyb3InKVxuZXhwb3J0IGNsYXNzIFdvcmtmbG93RXJyb3IgZXh0ZW5kcyBFcnJvciB7fVxuXG4vKipcbiAqIFRocm93biBpbiB3b3JrZmxvdyB3aGVuIGl0IHRyaWVzIHRvIGRvIHNvbWV0aGluZyB0aGF0IG5vbi1kZXRlcm1pbmlzdGljIHN1Y2ggYXMgY29uc3RydWN0IGEgV2Vha1JlZigpXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvcicpXG5leHBvcnQgY2xhc3MgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvciBleHRlbmRzIFdvcmtmbG93RXJyb3Ige31cblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgYWN0cyBhcyBhIG1hcmtlciBmb3IgdGhpcyBzcGVjaWFsIHJlc3VsdCB0eXBlXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignTG9jYWxBY3Rpdml0eURvQmFja29mZicpXG5leHBvcnQgY2xhc3MgTG9jYWxBY3Rpdml0eURvQmFja29mZiBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IGJhY2tvZmY6IGNvcmVzZGsuYWN0aXZpdHlfcmVzdWx0LklEb0JhY2tvZmYpIHtcbiAgICBzdXBlcigpO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIHByb3ZpZGVkIGBlcnJgIGlzIGNhdXNlZCBieSBjYW5jZWxsYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2FuY2VsbGF0aW9uKGVycjogdW5rbm93bik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIGVyciBpbnN0YW5jZW9mIENhbmNlbGxlZEZhaWx1cmUgfHxcbiAgICAoKGVyciBpbnN0YW5jZW9mIEFjdGl2aXR5RmFpbHVyZSB8fCBlcnIgaW5zdGFuY2VvZiBDaGlsZFdvcmtmbG93RmFpbHVyZSkgJiYgZXJyLmNhdXNlIGluc3RhbmNlb2YgQ2FuY2VsbGVkRmFpbHVyZSlcbiAgKTtcbn1cbiIsImV4cG9ydCB0eXBlIFNka0ZsYWcgPSB7XG4gIGdldCBpZCgpOiBudW1iZXI7XG4gIGdldCBkZWZhdWx0KCk6IGJvb2xlYW47XG59O1xuXG5jb25zdCBmbGFnc1JlZ2lzdHJ5OiBNYXA8bnVtYmVyLCBTZGtGbGFnPiA9IG5ldyBNYXAoKTtcblxuZXhwb3J0IGNvbnN0IFNka0ZsYWdzID0ge1xuICAvKipcbiAgICogVGhpcyBmbGFnIGdhdGVzIG11bHRpcGxlIGZpeGVzIHJlbGF0ZWQgdG8gY2FuY2VsbGF0aW9uIHNjb3BlcyBhbmQgdGltZXJzIGludHJvZHVjZWQgaW4gMS4xMC4yLzEuMTEuMDpcbiAgICogLSBDYW5jZWxsYXRpb24gb2YgYSBub24tY2FuY2VsbGFibGUgc2NvcGUgbm8gbG9uZ2VyIHByb3BhZ2F0ZXMgdG8gY2hpbGRyZW4gc2NvcGVzXG4gICAqICAgKHNlZSBodHRwczovL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9zZGstdHlwZXNjcmlwdC9pc3N1ZXMvMTQyMykuXG4gICAqIC0gQ2FuY2VsbGF0aW9uU2NvcGUud2l0aFRpbWVvdXQoZm4pIG5vdyBjYW5jZWwgdGhlIHRpbWVyIGlmIGBmbmAgY29tcGxldGVzIGJlZm9yZSBleHBpcmF0aW9uXG4gICAqICAgb2YgdGhlIHRpbWVvdXQsIHNpbWlsYXIgdG8gaG93IGBjb25kaXRpb24oZm4sIHRpbWVvdXQpYCB3b3Jrcy5cbiAgICogLSBUaW1lcnMgY3JlYXRlZCB1c2luZyBzZXRUaW1lb3V0IGNhbiBub3cgYmUgaW50ZXJjZXB0ZWQuXG4gICAqXG4gICAqIEBzaW5jZSBJbnRyb2R1Y2VkIGluIDEuMTAuMi8xLjExLjAuXG4gICAqL1xuICBOb25DYW5jZWxsYWJsZVNjb3Blc0FyZVNoaWVsZGVkRnJvbVByb3BhZ2F0aW9uOiBkZWZpbmVGbGFnKDEsIGZhbHNlKSxcbn0gYXMgY29uc3Q7XG5cbmZ1bmN0aW9uIGRlZmluZUZsYWcoaWQ6IG51bWJlciwgZGVmOiBib29sZWFuKTogU2RrRmxhZyB7XG4gIGNvbnN0IGZsYWcgPSB7IGlkLCBkZWZhdWx0OiBkZWYgfTtcbiAgZmxhZ3NSZWdpc3RyeS5zZXQoaWQsIGZsYWcpO1xuICByZXR1cm4gZmxhZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFZhbGlkRmxhZyhpZDogbnVtYmVyKTogdm9pZCB7XG4gIGlmICghZmxhZ3NSZWdpc3RyeS5oYXMoaWQpKSB0aHJvdyBuZXcgVHlwZUVycm9yKGBVbmtub3duIFNESyBmbGFnOiAke2lkfWApO1xufVxuIiwiaW1wb3J0IHsgSWxsZWdhbFN0YXRlRXJyb3IgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgdHlwZSBBY3RpdmF0b3IgfSBmcm9tICcuL2ludGVybmFscyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXliZUdldEFjdGl2YXRvclVudHlwZWQoKTogdW5rbm93biB7XG4gIHJldHVybiAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fVEVNUE9SQUxfQUNUSVZBVE9SX187XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRBY3RpdmF0b3JVbnR5cGVkKGFjdGl2YXRvcjogdW5rbm93bik6IHZvaWQge1xuICAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fVEVNUE9SQUxfQUNUSVZBVE9SX18gPSBhY3RpdmF0b3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXliZUdldEFjdGl2YXRvcigpOiBBY3RpdmF0b3IgfCB1bmRlZmluZWQge1xuICByZXR1cm4gbWF5YmVHZXRBY3RpdmF0b3JVbnR5cGVkKCkgYXMgQWN0aXZhdG9yIHwgdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQobWVzc2FnZTogc3RyaW5nKTogQWN0aXZhdG9yIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gbWF5YmVHZXRBY3RpdmF0b3IoKTtcbiAgaWYgKGFjdGl2YXRvciA9PSBudWxsKSB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBhY3RpdmF0b3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBY3RpdmF0b3IoKTogQWN0aXZhdG9yIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gbWF5YmVHZXRBY3RpdmF0b3IoKTtcbiAgaWYgKGFjdGl2YXRvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdXb3JrZmxvdyB1bmluaXRpYWxpemVkJyk7XG4gIH1cbiAgcmV0dXJuIGFjdGl2YXRvcjtcbn1cbiIsIi8qKlxuICogT3ZlcnJpZGVzIHNvbWUgZ2xvYmFsIG9iamVjdHMgdG8gbWFrZSB0aGVtIGRldGVybWluaXN0aWMuXG4gKlxuICogQG1vZHVsZVxuICovXG5pbXBvcnQgeyBtc1RvVHMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3RpbWUnO1xuaW1wb3J0IHsgQ2FuY2VsbGF0aW9uU2NvcGUgfSBmcm9tICcuL2NhbmNlbGxhdGlvbi1zY29wZSc7XG5pbXBvcnQgeyBEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yIH0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHsgZ2V0QWN0aXZhdG9yIH0gZnJvbSAnLi9nbG9iYWwtYXR0cmlidXRlcyc7XG5pbXBvcnQgeyBTZGtGbGFncyB9IGZyb20gJy4vZmxhZ3MnO1xuaW1wb3J0IHsgc2xlZXAgfSBmcm9tICcuL3dvcmtmbG93JztcbmltcG9ydCB7IHVudHJhY2tQcm9taXNlIH0gZnJvbSAnLi9zdGFjay1oZWxwZXJzJztcblxuY29uc3QgZ2xvYmFsID0gZ2xvYmFsVGhpcyBhcyBhbnk7XG5jb25zdCBPcmlnaW5hbERhdGUgPSBnbG9iYWxUaGlzLkRhdGU7XG5cbmV4cG9ydCBmdW5jdGlvbiBvdmVycmlkZUdsb2JhbHMoKTogdm9pZCB7XG4gIC8vIE1vY2sgYW55IHdlYWsgcmVmZXJlbmNlIGJlY2F1c2UgR0MgaXMgbm9uLWRldGVybWluaXN0aWMgYW5kIHRoZSBlZmZlY3QgaXMgb2JzZXJ2YWJsZSBmcm9tIHRoZSBXb3JrZmxvdy5cbiAgLy8gV29ya2Zsb3cgZGV2ZWxvcGVyIHdpbGwgZ2V0IGEgbWVhbmluZ2Z1bCBleGNlcHRpb24gaWYgdGhleSB0cnkgdG8gdXNlIHRoZXNlLlxuICBnbG9iYWwuV2Vha1JlZiA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aHJvdyBuZXcgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvcignV2Vha1JlZiBjYW5ub3QgYmUgdXNlZCBpbiBXb3JrZmxvd3MgYmVjYXVzZSB2OCBHQyBpcyBub24tZGV0ZXJtaW5pc3RpYycpO1xuICB9O1xuICBnbG9iYWwuRmluYWxpemF0aW9uUmVnaXN0cnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhyb3cgbmV3IERldGVybWluaXNtVmlvbGF0aW9uRXJyb3IoXG4gICAgICAnRmluYWxpemF0aW9uUmVnaXN0cnkgY2Fubm90IGJlIHVzZWQgaW4gV29ya2Zsb3dzIGJlY2F1c2UgdjggR0MgaXMgbm9uLWRldGVybWluaXN0aWMnXG4gICAgKTtcbiAgfTtcblxuICBnbG9iYWwuRGF0ZSA9IGZ1bmN0aW9uICguLi5hcmdzOiB1bmtub3duW10pIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gbmV3IChPcmlnaW5hbERhdGUgYXMgYW55KSguLi5hcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBPcmlnaW5hbERhdGUoZ2V0QWN0aXZhdG9yKCkubm93KTtcbiAgfTtcblxuICBnbG9iYWwuRGF0ZS5ub3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGdldEFjdGl2YXRvcigpLm5vdztcbiAgfTtcblxuICBnbG9iYWwuRGF0ZS5wYXJzZSA9IE9yaWdpbmFsRGF0ZS5wYXJzZS5iaW5kKE9yaWdpbmFsRGF0ZSk7XG4gIGdsb2JhbC5EYXRlLlVUQyA9IE9yaWdpbmFsRGF0ZS5VVEMuYmluZChPcmlnaW5hbERhdGUpO1xuXG4gIGdsb2JhbC5EYXRlLnByb3RvdHlwZSA9IE9yaWdpbmFsRGF0ZS5wcm90b3R5cGU7XG5cbiAgY29uc3QgdGltZW91dENhbmNlbGF0aW9uU2NvcGVzID0gbmV3IE1hcDxudW1iZXIsIENhbmNlbGxhdGlvblNjb3BlPigpO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gbXMgc2xlZXAgZHVyYXRpb24gLSAgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcy4gSWYgZ2l2ZW4gYSBuZWdhdGl2ZSBudW1iZXIsIHZhbHVlIHdpbGwgYmUgc2V0IHRvIDEuXG4gICAqL1xuICBnbG9iYWwuc2V0VGltZW91dCA9IGZ1bmN0aW9uIChjYjogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnksIG1zOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogbnVtYmVyIHtcbiAgICBtcyA9IE1hdGgubWF4KDEsIG1zKTtcbiAgICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgICBpZiAoYWN0aXZhdG9yLmhhc0ZsYWcoU2RrRmxhZ3MuTm9uQ2FuY2VsbGFibGVTY29wZXNBcmVTaGllbGRlZEZyb21Qcm9wYWdhdGlvbikpIHtcbiAgICAgIC8vIENhcHR1cmUgdGhlIHNlcXVlbmNlIG51bWJlciB0aGF0IHNsZWVwIHdpbGwgYWxsb2NhdGVcbiAgICAgIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy50aW1lcjtcbiAgICAgIGNvbnN0IHRpbWVyU2NvcGUgPSBuZXcgQ2FuY2VsbGF0aW9uU2NvcGUoeyBjYW5jZWxsYWJsZTogdHJ1ZSB9KTtcbiAgICAgIGNvbnN0IHNsZWVwUHJvbWlzZSA9IHRpbWVyU2NvcGUucnVuKCgpID0+IHNsZWVwKG1zKSk7XG4gICAgICBzbGVlcFByb21pc2UudGhlbihcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHRpbWVvdXRDYW5jZWxhdGlvblNjb3Blcy5kZWxldGUoc2VxKTtcbiAgICAgICAgICBjYiguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHRpbWVvdXRDYW5jZWxhdGlvblNjb3Blcy5kZWxldGUoc2VxKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNsZWVwUHJvbWlzZSk7XG4gICAgICB0aW1lb3V0Q2FuY2VsYXRpb25TY29wZXMuc2V0KHNlcSwgdGltZXJTY29wZSk7XG4gICAgICByZXR1cm4gc2VxO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMudGltZXIrKztcbiAgICAgIC8vIENyZWF0ZSBhIFByb21pc2UgZm9yIEFzeW5jTG9jYWxTdG9yYWdlIHRvIGJlIGFibGUgdG8gdHJhY2sgdGhpcyBjb21wbGV0aW9uIHVzaW5nIHByb21pc2UgaG9va3MuXG4gICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy50aW1lci5zZXQoc2VxLCB7IHJlc29sdmUsIHJlamVjdCB9KTtcbiAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICBzdGFydFRpbWVyOiB7XG4gICAgICAgICAgICBzZXEsXG4gICAgICAgICAgICBzdGFydFRvRmlyZVRpbWVvdXQ6IG1zVG9UcyhtcyksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICB9KS50aGVuKFxuICAgICAgICAoKSA9PiBjYiguLi5hcmdzKSxcbiAgICAgICAgKCkgPT4gdW5kZWZpbmVkIC8qIGlnbm9yZSBjYW5jZWxsYXRpb24gKi9cbiAgICAgICk7XG4gICAgICByZXR1cm4gc2VxO1xuICAgIH1cbiAgfTtcblxuICBnbG9iYWwuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24gKGhhbmRsZTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gICAgY29uc3QgdGltZXJTY29wZSA9IHRpbWVvdXRDYW5jZWxhdGlvblNjb3Blcy5nZXQoaGFuZGxlKTtcbiAgICBpZiAodGltZXJTY29wZSkge1xuICAgICAgdGltZW91dENhbmNlbGF0aW9uU2NvcGVzLmRlbGV0ZShoYW5kbGUpO1xuICAgICAgdGltZXJTY29wZS5jYW5jZWwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWN0aXZhdG9yLm5leHRTZXFzLnRpbWVyKys7IC8vIFNob3VsZG4ndCBpbmNyZWFzZSBzZXEgbnVtYmVyLCBidXQgdGhhdCdzIHRoZSBsZWdhY3kgYmVoYXZpb3JcbiAgICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy50aW1lci5kZWxldGUoaGFuZGxlKTtcbiAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgIGNhbmNlbFRpbWVyOiB7XG4gICAgICAgICAgc2VxOiBoYW5kbGUsXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgLy8gYWN0aXZhdG9yLnJhbmRvbSBpcyBtdXRhYmxlLCBkb24ndCBoYXJkY29kZSBpdHMgcmVmZXJlbmNlXG4gIE1hdGgucmFuZG9tID0gKCkgPT4gZ2V0QWN0aXZhdG9yKCkucmFuZG9tKCk7XG59XG4iLCIvKipcbiAqIFRoaXMgbGlicmFyeSBwcm92aWRlcyB0b29scyByZXF1aXJlZCBmb3IgYXV0aG9yaW5nIHdvcmtmbG93cy5cbiAqXG4gKiAjIyBVc2FnZVxuICogU2VlIHRoZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvaGVsbG8td29ybGQjd29ya2Zsb3dzIHwgdHV0b3JpYWx9IGZvciB3cml0aW5nIHlvdXIgZmlyc3Qgd29ya2Zsb3cuXG4gKlxuICogIyMjIFRpbWVyc1xuICpcbiAqIFRoZSByZWNvbW1lbmRlZCB3YXkgb2Ygc2NoZWR1bGluZyB0aW1lcnMgaXMgYnkgdXNpbmcgdGhlIHtAbGluayBzbGVlcH0gZnVuY3Rpb24uIFdlJ3ZlIHJlcGxhY2VkIGBzZXRUaW1lb3V0YCBhbmRcbiAqIGBjbGVhclRpbWVvdXRgIHdpdGggZGV0ZXJtaW5pc3RpYyB2ZXJzaW9ucyBzbyB0aGVzZSBhcmUgYWxzbyB1c2FibGUgYnV0IGhhdmUgYSBsaW1pdGF0aW9uIHRoYXQgdGhleSBkb24ndCBwbGF5IHdlbGxcbiAqIHdpdGgge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2NhbmNlbGxhdGlvbi1zY29wZXMgfCBjYW5jZWxsYXRpb24gc2NvcGVzfS5cbiAqXG4gKiA8IS0tU05JUFNUQVJUIHR5cGVzY3JpcHQtc2xlZXAtd29ya2Zsb3ctLT5cbiAqIDwhLS1TTklQRU5ELS0+XG4gKlxuICogIyMjIEFjdGl2aXRpZXNcbiAqXG4gKiBUbyBzY2hlZHVsZSBBY3Rpdml0aWVzLCB1c2Uge0BsaW5rIHByb3h5QWN0aXZpdGllc30gdG8gb2J0YWluIGFuIEFjdGl2aXR5IGZ1bmN0aW9uIGFuZCBjYWxsLlxuICpcbiAqIDwhLS1TTklQU1RBUlQgdHlwZXNjcmlwdC1zY2hlZHVsZS1hY3Rpdml0eS13b3JrZmxvdy0tPlxuICogPCEtLVNOSVBFTkQtLT5cbiAqXG4gKiAjIyMgVXBkYXRlcywgU2lnbmFscyBhbmQgUXVlcmllc1xuICpcbiAqIFVzZSB7QGxpbmsgc2V0SGFuZGxlcn0gdG8gc2V0IGhhbmRsZXJzIGZvciBVcGRhdGVzLCBTaWduYWxzLCBhbmQgUXVlcmllcy5cbiAqXG4gKiBVcGRhdGUgYW5kIFNpZ25hbCBoYW5kbGVycyBjYW4gYmUgZWl0aGVyIGFzeW5jIG9yIG5vbi1hc3luYyBmdW5jdGlvbnMuIFVwZGF0ZSBoYW5kbGVycyBtYXkgcmV0dXJuIGEgdmFsdWUsIGJ1dCBzaWduYWxcbiAqIGhhbmRsZXJzIG1heSBub3QgKHJldHVybiBgdm9pZGAgb3IgYFByb21pc2U8dm9pZD5gKS4gWW91IG1heSB1c2UgQWN0aXZpdGllcywgVGltZXJzLCBjaGlsZCBXb3JrZmxvd3MsIGV0YyBpbiBVcGRhdGVcbiAqIGFuZCBTaWduYWwgaGFuZGxlcnMsIGJ1dCB0aGlzIHNob3VsZCBiZSBkb25lIGNhdXRpb3VzbHk6IGZvciBleGFtcGxlLCBub3RlIHRoYXQgaWYgeW91IGF3YWl0IGFzeW5jIG9wZXJhdGlvbnMgc3VjaCBhc1xuICogdGhlc2UgaW4gYW4gVXBkYXRlIG9yIFNpZ25hbCBoYW5kbGVyLCB0aGVuIHlvdSBhcmUgcmVzcG9uc2libGUgZm9yIGVuc3VyaW5nIHRoYXQgdGhlIHdvcmtmbG93IGRvZXMgbm90IGNvbXBsZXRlIGZpcnN0LlxuICpcbiAqIFF1ZXJ5IGhhbmRsZXJzIG1heSAqKm5vdCoqIGJlIGFzeW5jIGZ1bmN0aW9ucywgYW5kIG1heSAqKm5vdCoqIG11dGF0ZSBhbnkgdmFyaWFibGVzIG9yIHVzZSBBY3Rpdml0aWVzLCBUaW1lcnMsXG4gKiBjaGlsZCBXb3JrZmxvd3MsIGV0Yy5cbiAqXG4gKiAjIyMjIEltcGxlbWVudGF0aW9uXG4gKlxuICogPCEtLVNOSVBTVEFSVCB0eXBlc2NyaXB0LXdvcmtmbG93LXVwZGF0ZS1zaWduYWwtcXVlcnktZXhhbXBsZS0tPlxuICogPCEtLVNOSVBFTkQtLT5cbiAqXG4gKiAjIyMgTW9yZVxuICpcbiAqIC0gW0RldGVybWluaXN0aWMgYnVpbHQtaW5zXShodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC9kZXRlcm1pbmlzbSNzb3VyY2VzLW9mLW5vbi1kZXRlcm1pbmlzbSlcbiAqIC0gW0NhbmNlbGxhdGlvbiBhbmQgc2NvcGVzXShodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC9jYW5jZWxsYXRpb24tc2NvcGVzKVxuICogICAtIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1cbiAqICAgLSB7QGxpbmsgVHJpZ2dlcn1cbiAqIC0gW1NpbmtzXShodHRwczovL2RvY3MudGVtcG9yYWwuaW8vYXBwbGljYXRpb24tZGV2ZWxvcG1lbnQvb2JzZXJ2YWJpbGl0eS8/bGFuZz10cyNsb2dnaW5nKVxuICogICAtIHtAbGluayBTaW5rc31cbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuZXhwb3J0IHtcbiAgQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlLFxuICBBY3Rpdml0eUZhaWx1cmUsXG4gIEFjdGl2aXR5T3B0aW9ucyxcbiAgQXBwbGljYXRpb25GYWlsdXJlLFxuICBDYW5jZWxsZWRGYWlsdXJlLFxuICBDaGlsZFdvcmtmbG93RmFpbHVyZSxcbiAgZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIsXG4gIFBheWxvYWRDb252ZXJ0ZXIsXG4gIFJldHJ5UG9saWN5LFxuICByb290Q2F1c2UsXG4gIFNlcnZlckZhaWx1cmUsXG4gIFRlbXBvcmFsRmFpbHVyZSxcbiAgVGVybWluYXRlZEZhaWx1cmUsXG4gIFRpbWVvdXRGYWlsdXJlLFxufSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuZXhwb3J0ICogZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi9lcnJvcnMnO1xuZXhwb3J0IHtcbiAgQWN0aXZpdHlGdW5jdGlvbixcbiAgQWN0aXZpdHlJbnRlcmZhY2UsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb25cbiAgUGF5bG9hZCxcbiAgUXVlcnlEZWZpbml0aW9uLFxuICBTZWFyY2hBdHRyaWJ1dGVzLFxuICBTZWFyY2hBdHRyaWJ1dGVWYWx1ZSxcbiAgU2lnbmFsRGVmaW5pdGlvbixcbiAgVW50eXBlZEFjdGl2aXRpZXMsXG4gIFdvcmtmbG93LFxuICBXb3JrZmxvd1F1ZXJ5VHlwZSxcbiAgV29ya2Zsb3dSZXN1bHRUeXBlLFxuICBXb3JrZmxvd1JldHVyblR5cGUsXG4gIFdvcmtmbG93U2lnbmFsVHlwZSxcbn0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi9pbnRlcmZhY2VzJztcbmV4cG9ydCAqIGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvd29ya2Zsb3ctaGFuZGxlJztcbmV4cG9ydCAqIGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvd29ya2Zsb3ctb3B0aW9ucyc7XG5leHBvcnQgeyBBc3luY0xvY2FsU3RvcmFnZSwgQ2FuY2VsbGF0aW9uU2NvcGUsIENhbmNlbGxhdGlvblNjb3BlT3B0aW9ucyB9IGZyb20gJy4vY2FuY2VsbGF0aW9uLXNjb3BlJztcbmV4cG9ydCAqIGZyb20gJy4vZXJyb3JzJztcbmV4cG9ydCAqIGZyb20gJy4vaW50ZXJjZXB0b3JzJztcbmV4cG9ydCB7XG4gIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLFxuICBDaGlsZFdvcmtmbG93T3B0aW9ucyxcbiAgQ29udGludWVBc05ldyxcbiAgQ29udGludWVBc05ld09wdGlvbnMsXG4gIEVuaGFuY2VkU3RhY2tUcmFjZSxcbiAgRmlsZUxvY2F0aW9uLFxuICBGaWxlU2xpY2UsXG4gIFBhcmVudENsb3NlUG9saWN5LFxuICBQYXJlbnRXb3JrZmxvd0luZm8sXG4gIFNES0luZm8sXG4gIFN0YWNrVHJhY2UsXG4gIFVuc2FmZVdvcmtmbG93SW5mbyxcbiAgV29ya2Zsb3dJbmZvLFxufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuZXhwb3J0IHsgcHJveHlTaW5rcywgU2luaywgU2lua0NhbGwsIFNpbmtGdW5jdGlvbiwgU2lua3MgfSBmcm9tICcuL3NpbmtzJztcbmV4cG9ydCB7IGxvZyB9IGZyb20gJy4vbG9ncyc7XG5leHBvcnQgeyBUcmlnZ2VyIH0gZnJvbSAnLi90cmlnZ2VyJztcbmV4cG9ydCAqIGZyb20gJy4vd29ya2Zsb3cnO1xuZXhwb3J0IHsgQ2hpbGRXb3JrZmxvd0hhbmRsZSwgRXh0ZXJuYWxXb3JrZmxvd0hhbmRsZSB9IGZyb20gJy4vd29ya2Zsb3ctaGFuZGxlJztcblxuLy8gQW55dGhpbmcgYmVsb3cgdGhpcyBsaW5lIGlzIGRlcHJlY2F0ZWRcblxuZXhwb3J0IHtcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIERvIG5vdCB1c2UgTG9nZ2VyU2lua3MgZGlyZWN0bHkuIFRvIGxvZyBmcm9tIFdvcmtmbG93IGNvZGUsIHVzZSB0aGUgYGxvZ2Agb2JqZWN0XG4gICAqICAgICAgICAgICAgIGV4cG9ydGVkIGJ5IHRoZSBgQHRlbXBvcmFsaW8vd29ya2Zsb3dgIHBhY2thZ2UuIFRvIGNhcHR1cmUgbG9nIG1lc3NhZ2VzIGVtaXR0ZWRcbiAgICogICAgICAgICAgICAgYnkgV29ya2Zsb3cgY29kZSwgc2V0IHRoZSB7QGxpbmsgUnVudGltZS5sb2dnZXJ9IHByb3BlcnR5LlxuICAgKi9cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGRlcHJlY2F0aW9uL2RlcHJlY2F0aW9uXG4gIExvZ2dlclNpbmtzRGVwcmVjYXRlZCBhcyBMb2dnZXJTaW5rcyxcbn0gZnJvbSAnLi9sb2dzJztcbiIsIi8qKlxuICogVHlwZSBkZWZpbml0aW9ucyBhbmQgZ2VuZXJpYyBoZWxwZXJzIGZvciBpbnRlcmNlcHRvcnMuXG4gKlxuICogVGhlIFdvcmtmbG93IHNwZWNpZmljIGludGVyY2VwdG9ycyBhcmUgZGVmaW5lZCBoZXJlLlxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5pbXBvcnQgeyBBY3Rpdml0eU9wdGlvbnMsIEhlYWRlcnMsIExvY2FsQWN0aXZpdHlPcHRpb25zLCBOZXh0LCBUaW1lc3RhbXAsIFdvcmtmbG93RXhlY3V0aW9uIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB0eXBlIHsgY29yZXNkayB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IENoaWxkV29ya2Zsb3dPcHRpb25zV2l0aERlZmF1bHRzLCBDb250aW51ZUFzTmV3T3B0aW9ucyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCB7IE5leHQsIEhlYWRlcnMgfTtcblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yLmV4ZWN1dGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dFeGVjdXRlSW5wdXQge1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvci5oYW5kbGVVcGRhdGUgYW5kXG4gKiBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yLnZhbGlkYXRlVXBkYXRlICovXG5leHBvcnQgaW50ZXJmYWNlIFVwZGF0ZUlucHV0IHtcbiAgcmVhZG9ubHkgdXBkYXRlSWQ6IHN0cmluZztcbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvci5oYW5kbGVTaWduYWwgKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmFsSW5wdXQge1xuICByZWFkb25seSBzaWduYWxOYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yLmhhbmRsZVF1ZXJ5ICovXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXJ5SW5wdXQge1xuICByZWFkb25seSBxdWVyeUlkOiBzdHJpbmc7XG4gIHJlYWRvbmx5IHF1ZXJ5TmFtZTogc3RyaW5nO1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG59XG5cbi8qKlxuICogSW1wbGVtZW50IGFueSBvZiB0aGVzZSBtZXRob2RzIHRvIGludGVyY2VwdCBXb3JrZmxvdyBpbmJvdW5kIGNhbGxzIGxpa2UgZXhlY3V0aW9uLCBhbmQgc2lnbmFsIGFuZCBxdWVyeSBoYW5kbGluZy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yIHtcbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IGV4ZWN1dGUgbWV0aG9kIGlzIGNhbGxlZFxuICAgKlxuICAgKiBAcmV0dXJuIHJlc3VsdCBvZiB0aGUgV29ya2Zsb3cgZXhlY3V0aW9uXG4gICAqL1xuICBleGVjdXRlPzogKGlucHV0OiBXb3JrZmxvd0V4ZWN1dGVJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnZXhlY3V0ZSc+KSA9PiBQcm9taXNlPHVua25vd24+O1xuXG4gIC8qKiBDYWxsZWQgd2hlbiBVcGRhdGUgaGFuZGxlciBpcyBjYWxsZWRcbiAgICpcbiAgICogQHJldHVybiByZXN1bHQgb2YgdGhlIFVwZGF0ZVxuICAgKi9cbiAgaGFuZGxlVXBkYXRlPzogKGlucHV0OiBVcGRhdGVJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnaGFuZGxlVXBkYXRlJz4pID0+IFByb21pc2U8dW5rbm93bj47XG5cbiAgLyoqIENhbGxlZCB3aGVuIHVwZGF0ZSB2YWxpZGF0b3IgY2FsbGVkICovXG4gIHZhbGlkYXRlVXBkYXRlPzogKGlucHV0OiBVcGRhdGVJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAndmFsaWRhdGVVcGRhdGUnPikgPT4gdm9pZDtcblxuICAvKiogQ2FsbGVkIHdoZW4gc2lnbmFsIGlzIGRlbGl2ZXJlZCB0byBhIFdvcmtmbG93IGV4ZWN1dGlvbiAqL1xuICBoYW5kbGVTaWduYWw/OiAoaW5wdXQ6IFNpZ25hbElucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdoYW5kbGVTaWduYWwnPikgPT4gUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYSBXb3JrZmxvdyBpcyBxdWVyaWVkXG4gICAqXG4gICAqIEByZXR1cm4gcmVzdWx0IG9mIHRoZSBxdWVyeVxuICAgKi9cbiAgaGFuZGxlUXVlcnk/OiAoaW5wdXQ6IFF1ZXJ5SW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2hhbmRsZVF1ZXJ5Jz4pID0+IFByb21pc2U8dW5rbm93bj47XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Iuc2NoZWR1bGVBY3Rpdml0eSAqL1xuZXhwb3J0IGludGVyZmFjZSBBY3Rpdml0eUlucHV0IHtcbiAgcmVhZG9ubHkgYWN0aXZpdHlUeXBlOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgb3B0aW9uczogQWN0aXZpdHlPcHRpb25zO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xuICByZWFkb25seSBzZXE6IG51bWJlcjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5zY2hlZHVsZUxvY2FsQWN0aXZpdHkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9jYWxBY3Rpdml0eUlucHV0IHtcbiAgcmVhZG9ubHkgYWN0aXZpdHlUeXBlOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgb3B0aW9uczogTG9jYWxBY3Rpdml0eU9wdGlvbnM7XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG4gIHJlYWRvbmx5IHNlcTogbnVtYmVyO1xuICByZWFkb25seSBvcmlnaW5hbFNjaGVkdWxlVGltZT86IFRpbWVzdGFtcDtcbiAgcmVhZG9ubHkgYXR0ZW1wdDogbnVtYmVyO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yLnN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25JbnB1dCB7XG4gIHJlYWRvbmx5IHdvcmtmbG93VHlwZTogc3RyaW5nO1xuICByZWFkb25seSBvcHRpb25zOiBDaGlsZFdvcmtmbG93T3B0aW9uc1dpdGhEZWZhdWx0cztcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbiAgcmVhZG9ubHkgc2VxOiBudW1iZXI7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Iuc3RhcnRUaW1lciAqL1xuZXhwb3J0IGludGVyZmFjZSBUaW1lcklucHV0IHtcbiAgcmVhZG9ubHkgZHVyYXRpb25NczogbnVtYmVyO1xuICByZWFkb25seSBzZXE6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBTYW1lIGFzIENvbnRpbnVlQXNOZXdPcHRpb25zIGJ1dCB3b3JrZmxvd1R5cGUgbXVzdCBiZSBkZWZpbmVkXG4gKi9cbmV4cG9ydCB0eXBlIENvbnRpbnVlQXNOZXdJbnB1dE9wdGlvbnMgPSBDb250aW51ZUFzTmV3T3B0aW9ucyAmIFJlcXVpcmVkPFBpY2s8Q29udGludWVBc05ld09wdGlvbnMsICd3b3JrZmxvd1R5cGUnPj47XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3IuY29udGludWVBc05ldyAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250aW51ZUFzTmV3SW5wdXQge1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG4gIHJlYWRvbmx5IG9wdGlvbnM6IENvbnRpbnVlQXNOZXdJbnB1dE9wdGlvbnM7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Iuc2lnbmFsV29ya2Zsb3cgKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmFsV29ya2Zsb3dJbnB1dCB7XG4gIHJlYWRvbmx5IHNlcTogbnVtYmVyO1xuICByZWFkb25seSBzaWduYWxOYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbiAgcmVhZG9ubHkgdGFyZ2V0OlxuICAgIHwge1xuICAgICAgICByZWFkb25seSB0eXBlOiAnZXh0ZXJuYWwnO1xuICAgICAgICByZWFkb25seSB3b3JrZmxvd0V4ZWN1dGlvbjogV29ya2Zsb3dFeGVjdXRpb247XG4gICAgICB9XG4gICAgfCB7XG4gICAgICAgIHJlYWRvbmx5IHR5cGU6ICdjaGlsZCc7XG4gICAgICAgIHJlYWRvbmx5IGNoaWxkV29ya2Zsb3dJZDogc3RyaW5nO1xuICAgICAgfTtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5nZXRMb2dBdHRyaWJ1dGVzICovXG5leHBvcnQgdHlwZSBHZXRMb2dBdHRyaWJ1dGVzSW5wdXQgPSBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuLyoqXG4gKiBJbXBsZW1lbnQgYW55IG9mIHRoZXNlIG1ldGhvZHMgdG8gaW50ZXJjZXB0IFdvcmtmbG93IGNvZGUgY2FsbHMgdG8gdGhlIFRlbXBvcmFsIEFQSXMsIGxpa2Ugc2NoZWR1bGluZyBhbiBhY3Rpdml0eSBhbmQgc3RhcnRpbmcgYSB0aW1lclxuICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yIHtcbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IHNjaGVkdWxlcyBhbiBBY3Rpdml0eVxuICAgKlxuICAgKiBAcmV0dXJuIHJlc3VsdCBvZiB0aGUgYWN0aXZpdHkgZXhlY3V0aW9uXG4gICAqL1xuICBzY2hlZHVsZUFjdGl2aXR5PzogKGlucHV0OiBBY3Rpdml0eUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdzY2hlZHVsZUFjdGl2aXR5Jz4pID0+IFByb21pc2U8dW5rbm93bj47XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IHNjaGVkdWxlcyBhIGxvY2FsIEFjdGl2aXR5XG4gICAqXG4gICAqIEByZXR1cm4gcmVzdWx0IG9mIHRoZSBhY3Rpdml0eSBleGVjdXRpb25cbiAgICovXG4gIHNjaGVkdWxlTG9jYWxBY3Rpdml0eT86IChpbnB1dDogTG9jYWxBY3Rpdml0eUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdzY2hlZHVsZUxvY2FsQWN0aXZpdHknPikgPT4gUHJvbWlzZTx1bmtub3duPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgc3RhcnRzIGEgdGltZXJcbiAgICovXG4gIHN0YXJ0VGltZXI/OiAoaW5wdXQ6IFRpbWVySW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ3N0YXJ0VGltZXInPikgPT4gUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgY2FsbHMgY29udGludWVBc05ld1xuICAgKi9cbiAgY29udGludWVBc05ldz86IChpbnB1dDogQ29udGludWVBc05ld0lucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdjb250aW51ZUFzTmV3Jz4pID0+IFByb21pc2U8bmV2ZXI+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBzaWduYWxzIGEgY2hpbGQgb3IgZXh0ZXJuYWwgV29ya2Zsb3dcbiAgICovXG4gIHNpZ25hbFdvcmtmbG93PzogKGlucHV0OiBTaWduYWxXb3JrZmxvd0lucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdzaWduYWxXb3JrZmxvdyc+KSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBzdGFydHMgYSBjaGlsZCB3b3JrZmxvdyBleGVjdXRpb24sIHRoZSBpbnRlcmNlcHRvciBmdW5jdGlvbiByZXR1cm5zIDIgcHJvbWlzZXM6XG4gICAqXG4gICAqIC0gVGhlIGZpcnN0IHJlc29sdmVzIHdpdGggdGhlIGBydW5JZGAgd2hlbiB0aGUgY2hpbGQgd29ya2Zsb3cgaGFzIHN0YXJ0ZWQgb3IgcmVqZWN0cyBpZiBmYWlsZWQgdG8gc3RhcnQuXG4gICAqIC0gVGhlIHNlY29uZCByZXNvbHZlcyB3aXRoIHRoZSB3b3JrZmxvdyByZXN1bHQgd2hlbiB0aGUgY2hpbGQgd29ya2Zsb3cgY29tcGxldGVzIG9yIHJlamVjdHMgb24gZmFpbHVyZS5cbiAgICovXG4gIHN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbj86IChcbiAgICBpbnB1dDogU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uSW5wdXQsXG4gICAgbmV4dDogTmV4dDx0aGlzLCAnc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uJz5cbiAgKSA9PiBQcm9taXNlPFtQcm9taXNlPHN0cmluZz4sIFByb21pc2U8dW5rbm93bj5dPjtcblxuICAvKipcbiAgICogQ2FsbGVkIG9uIGVhY2ggaW52b2NhdGlvbiBvZiB0aGUgYHdvcmtmbG93LmxvZ2AgbWV0aG9kcy5cbiAgICpcbiAgICogVGhlIGF0dHJpYnV0ZXMgcmV0dXJuZWQgaW4gdGhpcyBjYWxsIGFyZSBhdHRhY2hlZCB0byBldmVyeSBsb2cgbWVzc2FnZS5cbiAgICovXG4gIGdldExvZ0F0dHJpYnV0ZXM/OiAoaW5wdXQ6IEdldExvZ0F0dHJpYnV0ZXNJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnZ2V0TG9nQXR0cmlidXRlcyc+KSA9PiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0ludGVybmFsc0ludGVyY2VwdG9yLmNvbmNsdWRlQWN0aXZhdGlvbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb25jbHVkZUFjdGl2YXRpb25JbnB1dCB7XG4gIGNvbW1hbmRzOiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLklXb3JrZmxvd0NvbW1hbmRbXTtcbn1cblxuLyoqIE91dHB1dCBmb3IgV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvci5jb25jbHVkZUFjdGl2YXRpb24gKi9cbmV4cG9ydCB0eXBlIENvbmNsdWRlQWN0aXZhdGlvbk91dHB1dCA9IENvbmNsdWRlQWN0aXZhdGlvbklucHV0O1xuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3IuYWN0aXZhdGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZhdGVJbnB1dCB7XG4gIGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JV29ya2Zsb3dBY3RpdmF0aW9uO1xuICBiYXRjaEluZGV4OiBudW1iZXI7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvci5kaXNwb3NlICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWVtcHR5LWludGVyZmFjZVxuZXhwb3J0IGludGVyZmFjZSBEaXNwb3NlSW5wdXQge31cblxuLyoqXG4gKiBJbnRlcmNlcHRvciBmb3IgdGhlIGludGVybmFscyBvZiB0aGUgV29ya2Zsb3cgcnVudGltZS5cbiAqXG4gKiBVc2UgdG8gbWFuaXB1bGF0ZSBvciB0cmFjZSBXb3JrZmxvdyBhY3RpdmF0aW9ucy5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIFRoaXMgQVBJIGlzIGZvciBhZHZhbmNlZCB1c2UgY2FzZXMgYW5kIG1heSBjaGFuZ2UgaW4gdGhlIGZ1dHVyZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0ludGVybmFsc0ludGVyY2VwdG9yIHtcbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBXb3JrZmxvdyBydW50aW1lIHJ1bnMgYSBXb3JrZmxvd0FjdGl2YXRpb25Kb2IuXG4gICAqL1xuICBhY3RpdmF0ZT8oaW5wdXQ6IEFjdGl2YXRlSW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2FjdGl2YXRlJz4pOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgYWZ0ZXIgYWxsIGBXb3JrZmxvd0FjdGl2YXRpb25Kb2JgcyBoYXZlIGJlZW4gcHJvY2Vzc2VkIGZvciBhbiBhY3RpdmF0aW9uLlxuICAgKlxuICAgKiBDYW4gbWFuaXB1bGF0ZSB0aGUgY29tbWFuZHMgZ2VuZXJhdGVkIGJ5IHRoZSBXb3JrZmxvd1xuICAgKi9cbiAgY29uY2x1ZGVBY3RpdmF0aW9uPyhpbnB1dDogQ29uY2x1ZGVBY3RpdmF0aW9uSW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2NvbmNsdWRlQWN0aXZhdGlvbic+KTogQ29uY2x1ZGVBY3RpdmF0aW9uT3V0cHV0O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgYmVmb3JlIGRpc3Bvc2luZyB0aGUgV29ya2Zsb3cgaXNvbGF0ZSBjb250ZXh0LlxuICAgKlxuICAgKiBJbXBsZW1lbnQgdGhpcyBtZXRob2QgdG8gcGVyZm9ybSBhbnkgcmVzb3VyY2UgY2xlYW51cC5cbiAgICovXG4gIGRpc3Bvc2U/KGlucHV0OiBEaXNwb3NlSW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2Rpc3Bvc2UnPik6IHZvaWQ7XG59XG5cbi8qKlxuICogQSBtYXBwaW5nIGZyb20gaW50ZXJjZXB0b3IgdHlwZSB0byBhbiBvcHRpb25hbCBsaXN0IG9mIGludGVyY2VwdG9yIGltcGxlbWVudGF0aW9uc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93SW50ZXJjZXB0b3JzIHtcbiAgaW5ib3VuZD86IFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3JbXTtcbiAgb3V0Ym91bmQ/OiBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvcltdO1xuICBpbnRlcm5hbHM/OiBXb3JrZmxvd0ludGVybmFsc0ludGVyY2VwdG9yW107XG59XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHJldHVybnMge0BsaW5rIFdvcmtmbG93SW50ZXJjZXB0b3JzfSBhbmQgdGFrZXMgbm8gYXJndW1lbnRzLlxuICpcbiAqIFdvcmtmbG93IGludGVyY2VwdG9yIG1vZHVsZXMgc2hvdWxkIGV4cG9ydCBhbiBgaW50ZXJjZXB0b3JzYCBmdW5jdGlvbiBvZiB0aGlzIHR5cGUuXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiBgYGB0c1xuICogZXhwb3J0IGZ1bmN0aW9uIGludGVyY2VwdG9ycygpOiBXb3JrZmxvd0ludGVyY2VwdG9ycyB7XG4gKiAgIHJldHVybiB7XG4gKiAgICAgaW5ib3VuZDogW10sICAgLy8gUG9wdWxhdGUgd2l0aCBsaXN0IG9mIGludGVyY2VwdG9yIGltcGxlbWVudGF0aW9uc1xuICogICAgIG91dGJvdW5kOiBbXSwgIC8vIFBvcHVsYXRlIHdpdGggbGlzdCBvZiBpbnRlcmNlcHRvciBpbXBsZW1lbnRhdGlvbnNcbiAqICAgICBpbnRlcm5hbHM6IFtdLCAvLyBQb3B1bGF0ZSB3aXRoIGxpc3Qgb2YgaW50ZXJjZXB0b3IgaW1wbGVtZW50YXRpb25zXG4gKiAgIH07XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dJbnRlcmNlcHRvcnNGYWN0b3J5ID0gKCkgPT4gV29ya2Zsb3dJbnRlcmNlcHRvcnM7XG4iLCJpbXBvcnQgdHlwZSB7IFJhd1NvdXJjZU1hcCB9IGZyb20gJ3NvdXJjZS1tYXAnO1xuaW1wb3J0IHtcbiAgUmV0cnlQb2xpY3ksXG4gIFRlbXBvcmFsRmFpbHVyZSxcbiAgQ29tbW9uV29ya2Zsb3dPcHRpb25zLFxuICBTZWFyY2hBdHRyaWJ1dGVzLFxuICBTaWduYWxEZWZpbml0aW9uLFxuICBVcGRhdGVEZWZpbml0aW9uLFxuICBRdWVyeURlZmluaXRpb24sXG4gIER1cmF0aW9uLFxuICBWZXJzaW9uaW5nSW50ZW50LFxufSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgY2hlY2tFeHRlbmRzLCBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvciB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvdHlwZS1oZWxwZXJzJztcbmltcG9ydCB0eXBlIHsgY29yZXNkayB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcblxuLyoqXG4gKiBXb3JrZmxvdyBFeGVjdXRpb24gaW5mb3JtYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0luZm8ge1xuICAvKipcbiAgICogSUQgb2YgdGhlIFdvcmtmbG93LCB0aGlzIGNhbiBiZSBzZXQgYnkgdGhlIGNsaWVudCBkdXJpbmcgV29ya2Zsb3cgY3JlYXRpb24uXG4gICAqIEEgc2luZ2xlIFdvcmtmbG93IG1heSBydW4gbXVsdGlwbGUgdGltZXMgZS5nLiB3aGVuIHNjaGVkdWxlZCB3aXRoIGNyb24uXG4gICAqL1xuICByZWFkb25seSB3b3JrZmxvd0lkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIElEIG9mIGEgc2luZ2xlIFdvcmtmbG93IHJ1blxuICAgKi9cbiAgcmVhZG9ubHkgcnVuSWQ6IHN0cmluZztcblxuICAvKipcbiAgICogV29ya2Zsb3cgZnVuY3Rpb24ncyBuYW1lXG4gICAqL1xuICByZWFkb25seSB3b3JrZmxvd1R5cGU6IHN0cmluZztcblxuICAvKipcbiAgICogSW5kZXhlZCBpbmZvcm1hdGlvbiBhdHRhY2hlZCB0byB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uXG4gICAqXG4gICAqIFRoaXMgdmFsdWUgbWF5IGNoYW5nZSBkdXJpbmcgdGhlIGxpZmV0aW1lIG9mIGFuIEV4ZWN1dGlvbi5cbiAgICovXG4gIHJlYWRvbmx5IHNlYXJjaEF0dHJpYnV0ZXM6IFNlYXJjaEF0dHJpYnV0ZXM7XG5cbiAgLyoqXG4gICAqIE5vbi1pbmRleGVkIGluZm9ybWF0aW9uIGF0dGFjaGVkIHRvIHRoZSBXb3JrZmxvdyBFeGVjdXRpb25cbiAgICovXG4gIHJlYWRvbmx5IG1lbW8/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICAvKipcbiAgICogUGFyZW50IFdvcmtmbG93IGluZm8gKHByZXNlbnQgaWYgdGhpcyBpcyBhIENoaWxkIFdvcmtmbG93KVxuICAgKi9cbiAgcmVhZG9ubHkgcGFyZW50PzogUGFyZW50V29ya2Zsb3dJbmZvO1xuXG4gIC8qKlxuICAgKiBSZXN1bHQgZnJvbSB0aGUgcHJldmlvdXMgUnVuIChwcmVzZW50IGlmIHRoaXMgaXMgYSBDcm9uIFdvcmtmbG93IG9yIHdhcyBDb250aW51ZWQgQXMgTmV3KS5cbiAgICpcbiAgICogQW4gYXJyYXkgb2YgdmFsdWVzLCBzaW5jZSBvdGhlciBTREtzIG1heSByZXR1cm4gbXVsdGlwbGUgdmFsdWVzIGZyb20gYSBXb3JrZmxvdy5cbiAgICovXG4gIHJlYWRvbmx5IGxhc3RSZXN1bHQ/OiB1bmtub3duO1xuXG4gIC8qKlxuICAgKiBGYWlsdXJlIGZyb20gdGhlIHByZXZpb3VzIFJ1biAocHJlc2VudCB3aGVuIHRoaXMgUnVuIGlzIGEgcmV0cnksIG9yIHRoZSBsYXN0IFJ1biBvZiBhIENyb24gV29ya2Zsb3cgZmFpbGVkKVxuICAgKi9cbiAgcmVhZG9ubHkgbGFzdEZhaWx1cmU/OiBUZW1wb3JhbEZhaWx1cmU7XG5cbiAgLyoqXG4gICAqIExlbmd0aCBvZiBXb3JrZmxvdyBoaXN0b3J5IHVwIHVudGlsIHRoZSBjdXJyZW50IFdvcmtmbG93IFRhc2suXG4gICAqXG4gICAqIFRoaXMgdmFsdWUgY2hhbmdlcyBkdXJpbmcgdGhlIGxpZmV0aW1lIG9mIGFuIEV4ZWN1dGlvbi5cbiAgICpcbiAgICogWW91IG1heSBzYWZlbHkgdXNlIHRoaXMgaW5mb3JtYXRpb24gdG8gZGVjaWRlIHdoZW4gdG8ge0BsaW5rIGNvbnRpbnVlQXNOZXd9LlxuICAgKi9cbiAgcmVhZG9ubHkgaGlzdG9yeUxlbmd0aDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBTaXplIG9mIFdvcmtmbG93IGhpc3RvcnkgaW4gYnl0ZXMgdW50aWwgdGhlIGN1cnJlbnQgV29ya2Zsb3cgVGFzay5cbiAgICpcbiAgICogVGhpcyB2YWx1ZSBjaGFuZ2VzIGR1cmluZyB0aGUgbGlmZXRpbWUgb2YgYW4gRXhlY3V0aW9uLlxuICAgKlxuICAgKiBTdXBwb3J0ZWQgb25seSBvbiBUZW1wb3JhbCBTZXJ2ZXIgMS4yMCssIGFsd2F5cyB6ZXJvIG9uIG9sZGVyIHNlcnZlcnMuXG4gICAqXG4gICAqIFlvdSBtYXkgc2FmZWx5IHVzZSB0aGlzIGluZm9ybWF0aW9uIHRvIGRlY2lkZSB3aGVuIHRvIHtAbGluayBjb250aW51ZUFzTmV3fS5cbiAgICovXG4gIHJlYWRvbmx5IGhpc3RvcnlTaXplOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEEgaGludCBwcm92aWRlZCBieSB0aGUgY3VycmVudCBXb3JrZmxvd1Rhc2tTdGFydGVkIGV2ZW50IHJlY29tbWVuZGluZyB3aGV0aGVyIHRvXG4gICAqIHtAbGluayBjb250aW51ZUFzTmV3fS5cbiAgICpcbiAgICogVGhpcyB2YWx1ZSBjaGFuZ2VzIGR1cmluZyB0aGUgbGlmZXRpbWUgb2YgYW4gRXhlY3V0aW9uLlxuICAgKlxuICAgKiBTdXBwb3J0ZWQgb25seSBvbiBUZW1wb3JhbCBTZXJ2ZXIgMS4yMCssIGFsd2F5cyBgZmFsc2VgIG9uIG9sZGVyIHNlcnZlcnMuXG4gICAqL1xuICByZWFkb25seSBjb250aW51ZUFzTmV3U3VnZ2VzdGVkOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBUYXNrIHF1ZXVlIHRoaXMgV29ya2Zsb3cgaXMgZXhlY3V0aW5nIG9uXG4gICAqL1xuICByZWFkb25seSB0YXNrUXVldWU6IHN0cmluZztcblxuICAvKipcbiAgICogTmFtZXNwYWNlIHRoaXMgV29ya2Zsb3cgaXMgZXhlY3V0aW5nIGluXG4gICAqL1xuICByZWFkb25seSBuYW1lc3BhY2U6IHN0cmluZztcblxuICAvKipcbiAgICogUnVuIElkIG9mIHRoZSBmaXJzdCBSdW4gaW4gdGhpcyBFeGVjdXRpb24gQ2hhaW5cbiAgICovXG4gIHJlYWRvbmx5IGZpcnN0RXhlY3V0aW9uUnVuSWQ6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIGxhc3QgUnVuIElkIGluIHRoaXMgRXhlY3V0aW9uIENoYWluXG4gICAqL1xuICByZWFkb25seSBjb250aW51ZWRGcm9tRXhlY3V0aW9uUnVuSWQ/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRpbWUgYXQgd2hpY2ggdGhpcyBbV29ya2Zsb3cgRXhlY3V0aW9uIENoYWluXShodHRwczovL2RvY3MudGVtcG9yYWwuaW8vd29ya2Zsb3dzI3dvcmtmbG93LWV4ZWN1dGlvbi1jaGFpbikgd2FzIHN0YXJ0ZWRcbiAgICovXG4gIHJlYWRvbmx5IHN0YXJ0VGltZTogRGF0ZTtcblxuICAvKipcbiAgICogVGltZSBhdCB3aGljaCB0aGUgY3VycmVudCBXb3JrZmxvdyBSdW4gc3RhcnRlZFxuICAgKi9cbiAgcmVhZG9ubHkgcnVuU3RhcnRUaW1lOiBEYXRlO1xuXG4gIC8qKlxuICAgKiBNaWxsaXNlY29uZHMgYWZ0ZXIgd2hpY2ggdGhlIFdvcmtmbG93IEV4ZWN1dGlvbiBpcyBhdXRvbWF0aWNhbGx5IHRlcm1pbmF0ZWQgYnkgVGVtcG9yYWwgU2VydmVyLiBTZXQgdmlhIHtAbGluayBXb3JrZmxvd09wdGlvbnMud29ya2Zsb3dFeGVjdXRpb25UaW1lb3V0fS5cbiAgICovXG4gIHJlYWRvbmx5IGV4ZWN1dGlvblRpbWVvdXRNcz86IG51bWJlcjtcblxuICAvKipcbiAgICogVGltZSBhdCB3aGljaCB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uIGV4cGlyZXNcbiAgICovXG4gIHJlYWRvbmx5IGV4ZWN1dGlvbkV4cGlyYXRpb25UaW1lPzogRGF0ZTtcblxuICAvKipcbiAgICogTWlsbGlzZWNvbmRzIGFmdGVyIHdoaWNoIHRoZSBXb3JrZmxvdyBSdW4gaXMgYXV0b21hdGljYWxseSB0ZXJtaW5hdGVkIGJ5IFRlbXBvcmFsIFNlcnZlci4gU2V0IHZpYSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLndvcmtmbG93UnVuVGltZW91dH0uXG4gICAqL1xuICByZWFkb25seSBydW5UaW1lb3V0TXM/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIE1heGltdW0gZXhlY3V0aW9uIHRpbWUgb2YgYSBXb3JrZmxvdyBUYXNrIGluIG1pbGxpc2Vjb25kcy4gU2V0IHZpYSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLndvcmtmbG93VGFza1RpbWVvdXR9LlxuICAgKi9cbiAgcmVhZG9ubHkgdGFza1RpbWVvdXRNczogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBSZXRyeSBQb2xpY3kgZm9yIHRoaXMgRXhlY3V0aW9uLiBTZXQgdmlhIHtAbGluayBXb3JrZmxvd09wdGlvbnMucmV0cnl9LlxuICAgKi9cbiAgcmVhZG9ubHkgcmV0cnlQb2xpY3k/OiBSZXRyeVBvbGljeTtcblxuICAvKipcbiAgICogU3RhcnRzIGF0IDEgYW5kIGluY3JlbWVudHMgZm9yIGV2ZXJ5IHJldHJ5IGlmIHRoZXJlIGlzIGEgYHJldHJ5UG9saWN5YFxuICAgKi9cbiAgcmVhZG9ubHkgYXR0ZW1wdDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBDcm9uIFNjaGVkdWxlIGZvciB0aGlzIEV4ZWN1dGlvbi4gU2V0IHZpYSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLmNyb25TY2hlZHVsZX0uXG4gICAqL1xuICByZWFkb25seSBjcm9uU2NoZWR1bGU/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIE1pbGxpc2Vjb25kcyBiZXR3ZWVuIENyb24gUnVuc1xuICAgKi9cbiAgcmVhZG9ubHkgY3JvblNjaGVkdWxlVG9TY2hlZHVsZUludGVydmFsPzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaGUgQnVpbGQgSUQgb2YgdGhlIHdvcmtlciB3aGljaCBleGVjdXRlZCB0aGUgY3VycmVudCBXb3JrZmxvdyBUYXNrLiBNYXkgYmUgdW5kZWZpbmVkIGlmIHRoZVxuICAgKiB0YXNrIHdhcyBjb21wbGV0ZWQgYnkgYSB3b3JrZXIgd2l0aG91dCBhIEJ1aWxkIElELiBJZiB0aGlzIHdvcmtlciBpcyB0aGUgb25lIGV4ZWN1dGluZyB0aGlzXG4gICAqIHRhc2sgZm9yIHRoZSBmaXJzdCB0aW1lIGFuZCBoYXMgYSBCdWlsZCBJRCBzZXQsIHRoZW4gaXRzIElEIHdpbGwgYmUgdXNlZC4gVGhpcyB2YWx1ZSBtYXkgY2hhbmdlXG4gICAqIG92ZXIgdGhlIGxpZmV0aW1lIG9mIHRoZSB3b3JrZmxvdyBydW4sIGJ1dCBpcyBkZXRlcm1pbmlzdGljIGFuZCBzYWZlIHRvIHVzZSBmb3IgYnJhbmNoaW5nLlxuICAgKi9cbiAgcmVhZG9ubHkgY3VycmVudEJ1aWxkSWQ/OiBzdHJpbmc7XG5cbiAgcmVhZG9ubHkgdW5zYWZlOiBVbnNhZmVXb3JrZmxvd0luZm87XG59XG5cbi8qKlxuICogVW5zYWZlIGluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50IFdvcmtmbG93IEV4ZWN1dGlvbi5cbiAqXG4gKiBOZXZlciByZWx5IG9uIHRoaXMgaW5mb3JtYXRpb24gaW4gV29ya2Zsb3cgbG9naWMgYXMgaXQgd2lsbCBjYXVzZSBub24tZGV0ZXJtaW5pc3RpYyBiZWhhdmlvci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBVbnNhZmVXb3JrZmxvd0luZm8ge1xuICAvKipcbiAgICogQ3VycmVudCBzeXN0ZW0gdGltZSBpbiBtaWxsaXNlY29uZHNcbiAgICpcbiAgICogVGhlIHNhZmUgdmVyc2lvbiBvZiB0aW1lIGlzIGBuZXcgRGF0ZSgpYCBhbmQgYERhdGUubm93KClgLCB3aGljaCBhcmUgc2V0IG9uIHRoZSBmaXJzdCBpbnZvY2F0aW9uIG9mIGEgV29ya2Zsb3dcbiAgICogVGFzayBhbmQgc3RheSBjb25zdGFudCBmb3IgdGhlIGR1cmF0aW9uIG9mIHRoZSBUYXNrIGFuZCBkdXJpbmcgcmVwbGF5LlxuICAgKi9cbiAgcmVhZG9ubHkgbm93OiAoKSA9PiBudW1iZXI7XG5cbiAgcmVhZG9ubHkgaXNSZXBsYXlpbmc6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFyZW50V29ya2Zsb3dJbmZvIHtcbiAgd29ya2Zsb3dJZDogc3RyaW5nO1xuICBydW5JZDogc3RyaW5nO1xuICBuYW1lc3BhY2U6IHN0cmluZztcbn1cblxuLyoqXG4gKiBOb3QgYW4gYWN0dWFsIGVycm9yLCB1c2VkIGJ5IHRoZSBXb3JrZmxvdyBydW50aW1lIHRvIGFib3J0IGV4ZWN1dGlvbiB3aGVuIHtAbGluayBjb250aW51ZUFzTmV3fSBpcyBjYWxsZWRcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdDb250aW51ZUFzTmV3JylcbmV4cG9ydCBjbGFzcyBDb250aW51ZUFzTmV3IGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgY29tbWFuZDogY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5JQ29udGludWVBc05ld1dvcmtmbG93RXhlY3V0aW9uKSB7XG4gICAgc3VwZXIoJ1dvcmtmbG93IGNvbnRpbnVlZCBhcyBuZXcnKTtcbiAgfVxufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIGNvbnRpbnVpbmcgYSBXb3JrZmxvdyBhcyBuZXdcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250aW51ZUFzTmV3T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIFdvcmtmbG93IHR5cGUgbmFtZSwgZS5nLiB0aGUgZmlsZW5hbWUgaW4gdGhlIE5vZGUuanMgU0RLIG9yIGNsYXNzIG5hbWUgaW4gSmF2YVxuICAgKi9cbiAgd29ya2Zsb3dUeXBlPzogc3RyaW5nO1xuICAvKipcbiAgICogVGFzayBxdWV1ZSB0byBjb250aW51ZSB0aGUgV29ya2Zsb3cgaW5cbiAgICovXG4gIHRhc2tRdWV1ZT86IHN0cmluZztcbiAgLyoqXG4gICAqIFRpbWVvdXQgZm9yIHRoZSBlbnRpcmUgV29ya2Zsb3cgcnVuXG4gICAqIEBmb3JtYXQge0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHdvcmtmbG93UnVuVGltZW91dD86IER1cmF0aW9uO1xuICAvKipcbiAgICogVGltZW91dCBmb3IgYSBzaW5nbGUgV29ya2Zsb3cgdGFza1xuICAgKiBAZm9ybWF0IHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICB3b3JrZmxvd1Rhc2tUaW1lb3V0PzogRHVyYXRpb247XG4gIC8qKlxuICAgKiBOb24tc2VhcmNoYWJsZSBhdHRyaWJ1dGVzIHRvIGF0dGFjaCB0byBuZXh0IFdvcmtmbG93IHJ1blxuICAgKi9cbiAgbWVtbz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAvKipcbiAgICogU2VhcmNoYWJsZSBhdHRyaWJ1dGVzIHRvIGF0dGFjaCB0byBuZXh0IFdvcmtmbG93IHJ1blxuICAgKi9cbiAgc2VhcmNoQXR0cmlidXRlcz86IFNlYXJjaEF0dHJpYnV0ZXM7XG4gIC8qKlxuICAgKiBXaGVuIHVzaW5nIHRoZSBXb3JrZXIgVmVyc2lvbmluZyBmZWF0dXJlLCBzcGVjaWZpZXMgd2hldGhlciB0aGlzIFdvcmtmbG93IHNob3VsZFxuICAgKiBDb250aW51ZS1hcy1OZXcgb250byBhIHdvcmtlciB3aXRoIGEgY29tcGF0aWJsZSBCdWlsZCBJZCBvciBub3QuIFNlZSB7QGxpbmsgVmVyc2lvbmluZ0ludGVudH0uXG4gICAqXG4gICAqIEBkZWZhdWx0ICdDT01QQVRJQkxFJ1xuICAgKlxuICAgKiBAZXhwZXJpbWVudGFsXG4gICAqL1xuICB2ZXJzaW9uaW5nSW50ZW50PzogVmVyc2lvbmluZ0ludGVudDtcbn1cblxuLyoqXG4gKiBTcGVjaWZpZXM6XG4gKiAtIHdoZXRoZXIgY2FuY2VsbGF0aW9uIHJlcXVlc3RzIGFyZSBzZW50IHRvIHRoZSBDaGlsZFxuICogLSB3aGV0aGVyIGFuZCB3aGVuIGEge0BsaW5rIENhbmNlbGVkRmFpbHVyZX0gaXMgdGhyb3duIGZyb20ge0BsaW5rIGV4ZWN1dGVDaGlsZH0gb3JcbiAqICAge0BsaW5rIENoaWxkV29ya2Zsb3dIYW5kbGUucmVzdWx0fVxuICpcbiAqIEBkZWZhdWx0IHtAbGluayBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZS5XQUlUX0NBTkNFTExBVElPTl9DT01QTEVURUR9XG4gKi9cbmV4cG9ydCBlbnVtIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlIHtcbiAgLyoqXG4gICAqIERvbid0IHNlbmQgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCB0byB0aGUgQ2hpbGQuXG4gICAqL1xuICBBQkFORE9OID0gMCxcblxuICAvKipcbiAgICogU2VuZCBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IHRvIHRoZSBDaGlsZC4gSW1tZWRpYXRlbHkgdGhyb3cgdGhlIGVycm9yLlxuICAgKi9cbiAgVFJZX0NBTkNFTCA9IDEsXG5cbiAgLyoqXG4gICAqIFNlbmQgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCB0byB0aGUgQ2hpbGQuIFRoZSBDaGlsZCBtYXkgcmVzcGVjdCBjYW5jZWxsYXRpb24sIGluIHdoaWNoIGNhc2UgYW4gZXJyb3Igd2lsbCBiZSB0aHJvd25cbiAgICogd2hlbiBjYW5jZWxsYXRpb24gaGFzIGNvbXBsZXRlZCwgYW5kIHtAbGluayBpc0NhbmNlbGxhdGlvbn0oZXJyb3IpIHdpbGwgYmUgdHJ1ZS4gT24gdGhlIG90aGVyIGhhbmQsIHRoZSBDaGlsZCBtYXlcbiAgICogaWdub3JlIHRoZSBjYW5jZWxsYXRpb24gcmVxdWVzdCwgaW4gd2hpY2ggY2FzZSBhbiBlcnJvciBtaWdodCBiZSB0aHJvd24gd2l0aCBhIGRpZmZlcmVudCBjYXVzZSwgb3IgdGhlIENoaWxkIG1heVxuICAgKiBjb21wbGV0ZSBzdWNjZXNzZnVsbHkuXG4gICAqXG4gICAqIEBkZWZhdWx0XG4gICAqL1xuICBXQUlUX0NBTkNFTExBVElPTl9DT01QTEVURUQgPSAyLFxuXG4gIC8qKlxuICAgKiBTZW5kIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgdG8gdGhlIENoaWxkLiBUaHJvdyB0aGUgZXJyb3Igb25jZSB0aGUgU2VydmVyIHJlY2VpdmVzIHRoZSBDaGlsZCBjYW5jZWxsYXRpb24gcmVxdWVzdC5cbiAgICovXG4gIFdBSVRfQ0FOQ0VMTEFUSU9OX1JFUVVFU1RFRCA9IDMsXG59XG5cbmNoZWNrRXh0ZW5kczxjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LkNoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLCBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZT4oKTtcbmNoZWNrRXh0ZW5kczxDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZSwgY29yZXNkay5jaGlsZF93b3JrZmxvdy5DaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZT4oKTtcblxuLyoqXG4gKiBIb3cgYSBDaGlsZCBXb3JrZmxvdyByZWFjdHMgdG8gdGhlIFBhcmVudCBXb3JrZmxvdyByZWFjaGluZyBhIENsb3NlZCBzdGF0ZS5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vY29uY2VwdHMvd2hhdC1pcy1hLXBhcmVudC1jbG9zZS1wb2xpY3kvIHwgUGFyZW50IENsb3NlIFBvbGljeX1cbiAqL1xuZXhwb3J0IGVudW0gUGFyZW50Q2xvc2VQb2xpY3kge1xuICAvKipcbiAgICogSWYgYSBgUGFyZW50Q2xvc2VQb2xpY3lgIGlzIHNldCB0byB0aGlzLCBvciBpcyBub3Qgc2V0IGF0IGFsbCwgdGhlIHNlcnZlciBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZC5cbiAgICovXG4gIFBBUkVOVF9DTE9TRV9QT0xJQ1lfVU5TUEVDSUZJRUQgPSAwLFxuXG4gIC8qKlxuICAgKiBXaGVuIHRoZSBQYXJlbnQgaXMgQ2xvc2VkLCB0aGUgQ2hpbGQgaXMgVGVybWluYXRlZC5cbiAgICpcbiAgICogQGRlZmF1bHRcbiAgICovXG4gIFBBUkVOVF9DTE9TRV9QT0xJQ1lfVEVSTUlOQVRFID0gMSxcblxuICAvKipcbiAgICogV2hlbiB0aGUgUGFyZW50IGlzIENsb3NlZCwgbm90aGluZyBpcyBkb25lIHRvIHRoZSBDaGlsZC5cbiAgICovXG4gIFBBUkVOVF9DTE9TRV9QT0xJQ1lfQUJBTkRPTiA9IDIsXG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIFBhcmVudCBpcyBDbG9zZWQsIHRoZSBDaGlsZCBpcyBDYW5jZWxsZWQuXG4gICAqL1xuICBQQVJFTlRfQ0xPU0VfUE9MSUNZX1JFUVVFU1RfQ0FOQ0VMID0gMyxcbn1cblxuY2hlY2tFeHRlbmRzPGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuUGFyZW50Q2xvc2VQb2xpY3ksIFBhcmVudENsb3NlUG9saWN5PigpO1xuY2hlY2tFeHRlbmRzPFBhcmVudENsb3NlUG9saWN5LCBjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LlBhcmVudENsb3NlUG9saWN5PigpO1xuXG5leHBvcnQgaW50ZXJmYWNlIENoaWxkV29ya2Zsb3dPcHRpb25zIGV4dGVuZHMgQ29tbW9uV29ya2Zsb3dPcHRpb25zIHtcbiAgLyoqXG4gICAqIFdvcmtmbG93IGlkIHRvIHVzZSB3aGVuIHN0YXJ0aW5nLiBJZiBub3Qgc3BlY2lmaWVkIGEgVVVJRCBpcyBnZW5lcmF0ZWQuIE5vdGUgdGhhdCBpdCBpc1xuICAgKiBkYW5nZXJvdXMgYXMgaW4gY2FzZSBvZiBjbGllbnQgc2lkZSByZXRyaWVzIG5vIGRlZHVwbGljYXRpb24gd2lsbCBoYXBwZW4gYmFzZWQgb24gdGhlXG4gICAqIGdlbmVyYXRlZCBpZC4gU28gcHJlZmVyIGFzc2lnbmluZyBidXNpbmVzcyBtZWFuaW5nZnVsIGlkcyBpZiBwb3NzaWJsZS5cbiAgICovXG4gIHdvcmtmbG93SWQ/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRhc2sgcXVldWUgdG8gdXNlIGZvciBXb3JrZmxvdyB0YXNrcy4gSXQgc2hvdWxkIG1hdGNoIGEgdGFzayBxdWV1ZSBzcGVjaWZpZWQgd2hlbiBjcmVhdGluZyBhXG4gICAqIGBXb3JrZXJgIHRoYXQgaG9zdHMgdGhlIFdvcmtmbG93IGNvZGUuXG4gICAqL1xuICB0YXNrUXVldWU/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllczpcbiAgICogLSB3aGV0aGVyIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyBhcmUgc2VudCB0byB0aGUgQ2hpbGRcbiAgICogLSB3aGV0aGVyIGFuZCB3aGVuIGFuIGVycm9yIGlzIHRocm93biBmcm9tIHtAbGluayBleGVjdXRlQ2hpbGR9IG9yXG4gICAqICAge0BsaW5rIENoaWxkV29ya2Zsb3dIYW5kbGUucmVzdWx0fVxuICAgKlxuICAgKiBAZGVmYXVsdCB7QGxpbmsgQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUuV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEfVxuICAgKi9cbiAgY2FuY2VsbGF0aW9uVHlwZT86IENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgaG93IHRoZSBDaGlsZCByZWFjdHMgdG8gdGhlIFBhcmVudCBXb3JrZmxvdyByZWFjaGluZyBhIENsb3NlZCBzdGF0ZS5cbiAgICpcbiAgICogQGRlZmF1bHQge0BsaW5rIFBhcmVudENsb3NlUG9saWN5LlBBUkVOVF9DTE9TRV9QT0xJQ1lfVEVSTUlOQVRFfVxuICAgKi9cbiAgcGFyZW50Q2xvc2VQb2xpY3k/OiBQYXJlbnRDbG9zZVBvbGljeTtcblxuICAvKipcbiAgICogV2hlbiB1c2luZyB0aGUgV29ya2VyIFZlcnNpb25pbmcgZmVhdHVyZSwgc3BlY2lmaWVzIHdoZXRoZXIgdGhpcyBDaGlsZCBXb3JrZmxvdyBzaG91bGQgcnVuIG9uXG4gICAqIGEgd29ya2VyIHdpdGggYSBjb21wYXRpYmxlIEJ1aWxkIElkIG9yIG5vdC4gU2VlIHtAbGluayBWZXJzaW9uaW5nSW50ZW50fS5cbiAgICpcbiAgICogQGRlZmF1bHQgJ0NPTVBBVElCTEUnXG4gICAqXG4gICAqIEBleHBlcmltZW50YWxcbiAgICovXG4gIHZlcnNpb25pbmdJbnRlbnQ/OiBWZXJzaW9uaW5nSW50ZW50O1xufVxuXG5leHBvcnQgdHlwZSBSZXF1aXJlZENoaWxkV29ya2Zsb3dPcHRpb25zID0gUmVxdWlyZWQ8UGljazxDaGlsZFdvcmtmbG93T3B0aW9ucywgJ3dvcmtmbG93SWQnIHwgJ2NhbmNlbGxhdGlvblR5cGUnPj4gJiB7XG4gIGFyZ3M6IHVua25vd25bXTtcbn07XG5cbmV4cG9ydCB0eXBlIENoaWxkV29ya2Zsb3dPcHRpb25zV2l0aERlZmF1bHRzID0gQ2hpbGRXb3JrZmxvd09wdGlvbnMgJiBSZXF1aXJlZENoaWxkV29ya2Zsb3dPcHRpb25zO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNES0luZm8ge1xuICBuYW1lOiBzdHJpbmc7XG4gIHZlcnNpb246IHN0cmluZztcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgc2xpY2Ugb2YgYSBmaWxlIHN0YXJ0aW5nIGF0IGxpbmVPZmZzZXRcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBGaWxlU2xpY2Uge1xuICAvKipcbiAgICogc2xpY2Ugb2YgYSBmaWxlIHdpdGggYFxcbmAgKG5ld2xpbmUpIGxpbmUgdGVybWluYXRvci5cbiAgICovXG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgLyoqXG4gICAqIE9ubHkgdXNlZCBwb3NzaWJsZSB0byB0cmltIHRoZSBmaWxlIHdpdGhvdXQgYnJlYWtpbmcgc3ludGF4IGhpZ2hsaWdodGluZy5cbiAgICovXG4gIGxpbmVPZmZzZXQ6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBBIHBvaW50ZXIgdG8gYSBsb2NhdGlvbiBpbiBhIGZpbGVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBGaWxlTG9jYXRpb24ge1xuICAvKipcbiAgICogUGF0aCB0byBzb3VyY2UgZmlsZSAoYWJzb2x1dGUgb3IgcmVsYXRpdmUpLlxuICAgKiBXaGVuIHVzaW5nIGEgcmVsYXRpdmUgcGF0aCwgbWFrZSBzdXJlIGFsbCBwYXRocyBhcmUgcmVsYXRpdmUgdG8gdGhlIHNhbWUgcm9vdC5cbiAgICovXG4gIGZpbGVQYXRoPzogc3RyaW5nO1xuICAvKipcbiAgICogSWYgcG9zc2libGUsIFNESyBzaG91bGQgc2VuZCB0aGlzLCByZXF1aXJlZCBmb3IgZGlzcGxheWluZyB0aGUgY29kZSBsb2NhdGlvbi5cbiAgICovXG4gIGxpbmU/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBJZiBwb3NzaWJsZSwgU0RLIHNob3VsZCBzZW5kIHRoaXMuXG4gICAqL1xuICBjb2x1bW4/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBGdW5jdGlvbiBuYW1lIHRoaXMgbGluZSBiZWxvbmdzIHRvIChpZiBhcHBsaWNhYmxlKS5cbiAgICogVXNlZCBmb3IgZmFsbGluZyBiYWNrIHRvIHN0YWNrIHRyYWNlIHZpZXcuXG4gICAqL1xuICBmdW5jdGlvbk5hbWU/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RhY2tUcmFjZSB7XG4gIGxvY2F0aW9uczogRmlsZUxvY2F0aW9uW107XG59XG5cbi8qKlxuICogVXNlZCBhcyB0aGUgcmVzdWx0IGZvciB0aGUgZW5oYW5jZWQgc3RhY2sgdHJhY2UgcXVlcnlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFbmhhbmNlZFN0YWNrVHJhY2Uge1xuICBzZGs6IFNES0luZm87XG4gIC8qKlxuICAgKiBNYXBwaW5nIG9mIGZpbGUgcGF0aCB0byBmaWxlIGNvbnRlbnRzLlxuICAgKiBTREsgbWF5IGNob29zZSB0byBzZW5kIG5vLCBzb21lIG9yIGFsbCBzb3VyY2VzLlxuICAgKiBTb3VyY2VzIG1pZ2h0IGJlIHRyaW1tZWQsIGFuZCBzb21lIHRpbWUgb25seSB0aGUgZmlsZShzKSBvZiB0aGUgdG9wIGVsZW1lbnQgb2YgdGhlIHRyYWNlIHdpbGwgYmUgc2VudC5cbiAgICovXG4gIHNvdXJjZXM6IFJlY29yZDxzdHJpbmcsIEZpbGVTbGljZVtdPjtcbiAgc3RhY2tzOiBTdGFja1RyYWNlW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dDcmVhdGVPcHRpb25zIHtcbiAgaW5mbzogV29ya2Zsb3dJbmZvO1xuICByYW5kb21uZXNzU2VlZDogbnVtYmVyW107XG4gIG5vdzogbnVtYmVyO1xuICBwYXRjaGVzOiBzdHJpbmdbXTtcbiAgc2hvd1N0YWNrVHJhY2VTb3VyY2VzOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93Q3JlYXRlT3B0aW9uc0ludGVybmFsIGV4dGVuZHMgV29ya2Zsb3dDcmVhdGVPcHRpb25zIHtcbiAgc291cmNlTWFwOiBSYXdTb3VyY2VNYXA7XG4gIHJlZ2lzdGVyZWRBY3Rpdml0eU5hbWVzOiBTZXQ8c3RyaW5nPjtcbiAgZ2V0VGltZU9mRGF5KCk6IGJpZ2ludDtcbn1cblxuLyoqXG4gKiBBIGhhbmRsZXIgZnVuY3Rpb24gY2FwYWJsZSBvZiBhY2NlcHRpbmcgdGhlIGFyZ3VtZW50cyBmb3IgYSBnaXZlbiBVcGRhdGVEZWZpbml0aW9uLCBTaWduYWxEZWZpbml0aW9uIG9yIFF1ZXJ5RGVmaW5pdGlvbi5cbiAqL1xuZXhwb3J0IHR5cGUgSGFuZGxlcjxcbiAgUmV0LFxuICBBcmdzIGV4dGVuZHMgYW55W10sXG4gIFQgZXh0ZW5kcyBVcGRhdGVEZWZpbml0aW9uPFJldCwgQXJncz4gfCBTaWduYWxEZWZpbml0aW9uPEFyZ3M+IHwgUXVlcnlEZWZpbml0aW9uPFJldCwgQXJncz4sXG4+ID0gVCBleHRlbmRzIFVwZGF0ZURlZmluaXRpb248aW5mZXIgUiwgaW5mZXIgQT5cbiAgPyAoLi4uYXJnczogQSkgPT4gUiB8IFByb21pc2U8Uj5cbiAgOiBUIGV4dGVuZHMgU2lnbmFsRGVmaW5pdGlvbjxpbmZlciBBPlxuICAgID8gKC4uLmFyZ3M6IEEpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+XG4gICAgOiBUIGV4dGVuZHMgUXVlcnlEZWZpbml0aW9uPGluZmVyIFIsIGluZmVyIEE+XG4gICAgICA/ICguLi5hcmdzOiBBKSA9PiBSXG4gICAgICA6IG5ldmVyO1xuXG4vKipcbiAqIEEgaGFuZGxlciBmdW5jdGlvbiBhY2NlcHRpbmcgc2lnbmFsIGNhbGxzIGZvciBub24tcmVnaXN0ZXJlZCBzaWduYWwgbmFtZXMuXG4gKi9cbmV4cG9ydCB0eXBlIERlZmF1bHRTaWduYWxIYW5kbGVyID0gKHNpZ25hbE5hbWU6IHN0cmluZywgLi4uYXJnczogdW5rbm93bltdKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcblxuLyoqXG4gKiBBIHZhbGlkYXRpb24gZnVuY3Rpb24gY2FwYWJsZSBvZiBhY2NlcHRpbmcgdGhlIGFyZ3VtZW50cyBmb3IgYSBnaXZlbiBVcGRhdGVEZWZpbml0aW9uLlxuICovXG5leHBvcnQgdHlwZSBVcGRhdGVWYWxpZGF0b3I8QXJncyBleHRlbmRzIGFueVtdPiA9ICguLi5hcmdzOiBBcmdzKSA9PiB2b2lkO1xuXG4vKipcbiAqIEEgZGVzY3JpcHRpb24gb2YgYSBxdWVyeSBoYW5kbGVyLlxuICovXG5leHBvcnQgdHlwZSBRdWVyeUhhbmRsZXJPcHRpb25zID0geyBkZXNjcmlwdGlvbj86IHN0cmluZyB9O1xuXG4vKipcbiAqIEEgZGVzY3JpcHRpb24gb2YgYSBzaWduYWwgaGFuZGxlci5cbiAqL1xuZXhwb3J0IHR5cGUgU2lnbmFsSGFuZGxlck9wdGlvbnMgPSB7IGRlc2NyaXB0aW9uPzogc3RyaW5nIH07XG5cbi8qKlxuICogQSB2YWxpZGF0b3IgYW5kIGRlc2NyaXB0aW9uIG9mIGFuIHVwZGF0ZSBoYW5kbGVyLlxuICovXG5leHBvcnQgdHlwZSBVcGRhdGVIYW5kbGVyT3B0aW9uczxBcmdzIGV4dGVuZHMgYW55W10+ID0geyB2YWxpZGF0b3I/OiBVcGRhdGVWYWxpZGF0b3I8QXJncz47IGRlc2NyaXB0aW9uPzogc3RyaW5nIH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZhdGlvbkNvbXBsZXRpb24ge1xuICBjb21tYW5kczogY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5JV29ya2Zsb3dDb21tYW5kW107XG4gIHVzZWRJbnRlcm5hbEZsYWdzOiBudW1iZXJbXTtcbn1cbiIsImltcG9ydCB0eXBlIHsgUmF3U291cmNlTWFwIH0gZnJvbSAnc291cmNlLW1hcCc7XG5pbXBvcnQge1xuICBkZWZhdWx0RmFpbHVyZUNvbnZlcnRlcixcbiAgRmFpbHVyZUNvbnZlcnRlcixcbiAgUGF5bG9hZENvbnZlcnRlcixcbiAgYXJyYXlGcm9tUGF5bG9hZHMsXG4gIGRlZmF1bHRQYXlsb2FkQ29udmVydGVyLFxuICBlbnN1cmVUZW1wb3JhbEZhaWx1cmUsXG4gIElsbGVnYWxTdGF0ZUVycm9yLFxuICBUZW1wb3JhbEZhaWx1cmUsXG4gIFdvcmtmbG93LFxuICBXb3JrZmxvd0V4ZWN1dGlvbkFscmVhZHlTdGFydGVkRXJyb3IsXG4gIFdvcmtmbG93UXVlcnlBbm5vdGF0ZWRUeXBlLFxuICBXb3JrZmxvd1NpZ25hbEFubm90YXRlZFR5cGUsXG4gIFdvcmtmbG93VXBkYXRlQW5ub3RhdGVkVHlwZSxcbiAgUHJvdG9GYWlsdXJlLFxuICBBcHBsaWNhdGlvbkZhaWx1cmUsXG59IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyBjb21wb3NlSW50ZXJjZXB0b3JzIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHsgY2hlY2tFeHRlbmRzIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHR5cGUgeyBjb3Jlc2RrLCB0ZW1wb3JhbCB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IGFsZWEsIFJORyB9IGZyb20gJy4vYWxlYSc7XG5pbXBvcnQgeyBSb290Q2FuY2VsbGF0aW9uU2NvcGUgfSBmcm9tICcuL2NhbmNlbGxhdGlvbi1zY29wZSc7XG5pbXBvcnQgeyBEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yLCBMb2NhbEFjdGl2aXR5RG9CYWNrb2ZmLCBpc0NhbmNlbGxhdGlvbiB9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7IFF1ZXJ5SW5wdXQsIFNpZ25hbElucHV0LCBVcGRhdGVJbnB1dCwgV29ya2Zsb3dFeGVjdXRlSW5wdXQsIFdvcmtmbG93SW50ZXJjZXB0b3JzIH0gZnJvbSAnLi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHtcbiAgQ29udGludWVBc05ldyxcbiAgRGVmYXVsdFNpZ25hbEhhbmRsZXIsXG4gIFNES0luZm8sXG4gIEZpbGVTbGljZSxcbiAgRW5oYW5jZWRTdGFja1RyYWNlLFxuICBGaWxlTG9jYXRpb24sXG4gIFdvcmtmbG93SW5mbyxcbiAgV29ya2Zsb3dDcmVhdGVPcHRpb25zSW50ZXJuYWwsXG4gIEFjdGl2YXRpb25Db21wbGV0aW9uLFxufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgdHlwZSBTaW5rQ2FsbCB9IGZyb20gJy4vc2lua3MnO1xuaW1wb3J0IHsgdW50cmFja1Byb21pc2UgfSBmcm9tICcuL3N0YWNrLWhlbHBlcnMnO1xuaW1wb3J0IHBrZyBmcm9tICcuL3BrZyc7XG5pbXBvcnQgeyBleGVjdXRlV2l0aExpZmVjeWNsZUxvZ2dpbmcgfSBmcm9tICcuL2xvZ3MnO1xuaW1wb3J0IHsgU2RrRmxhZywgYXNzZXJ0VmFsaWRGbGFnIH0gZnJvbSAnLi9mbGFncyc7XG5cbmVudW0gU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2Uge1xuICBTVEFSVF9DSElMRF9XT1JLRkxPV19FWEVDVVRJT05fRkFJTEVEX0NBVVNFX1VOU1BFQ0lGSUVEID0gMCxcbiAgU1RBUlRfQ0hJTERfV09SS0ZMT1dfRVhFQ1VUSU9OX0ZBSUxFRF9DQVVTRV9XT1JLRkxPV19BTFJFQURZX0VYSVNUUyA9IDEsXG59XG5cbmNoZWNrRXh0ZW5kczxjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LlN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlLCBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZT4oKTtcbmNoZWNrRXh0ZW5kczxTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZSwgY29yZXNkay5jaGlsZF93b3JrZmxvdy5TdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZT4oKTtcblxuZXhwb3J0IGludGVyZmFjZSBTdGFjayB7XG4gIGZvcm1hdHRlZDogc3RyaW5nO1xuICBzdHJ1Y3R1cmVkOiBGaWxlTG9jYXRpb25bXTtcbn1cblxuLyoqXG4gKiBHbG9iYWwgc3RvcmUgdG8gdHJhY2sgcHJvbWlzZSBzdGFja3MgZm9yIHN0YWNrIHRyYWNlIHF1ZXJ5XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHJvbWlzZVN0YWNrU3RvcmUge1xuICBjaGlsZFRvUGFyZW50OiBNYXA8UHJvbWlzZTx1bmtub3duPiwgU2V0PFByb21pc2U8dW5rbm93bj4+PjtcbiAgcHJvbWlzZVRvU3RhY2s6IE1hcDxQcm9taXNlPHVua25vd24+LCBTdGFjaz47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGxldGlvbiB7XG4gIHJlc29sdmUodmFsOiB1bmtub3duKTogdW5rbm93bjtcbiAgcmVqZWN0KHJlYXNvbjogdW5rbm93bik6IHVua25vd247XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uZGl0aW9uIHtcbiAgZm4oKTogYm9vbGVhbjtcbiAgcmVzb2x2ZSgpOiB2b2lkO1xufVxuXG5leHBvcnQgdHlwZSBBY3RpdmF0aW9uSGFuZGxlckZ1bmN0aW9uPEsgZXh0ZW5kcyBrZXlvZiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbkpvYj4gPSAoXG4gIGFjdGl2YXRpb246IE5vbk51bGxhYmxlPGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JV29ya2Zsb3dBY3RpdmF0aW9uSm9iW0tdPlxuKSA9PiB2b2lkO1xuXG4vKipcbiAqIFZlcmlmaWVzIGFsbCBhY3RpdmF0aW9uIGpvYiBoYW5kbGluZyBtZXRob2RzIGFyZSBpbXBsZW1lbnRlZFxuICovXG5leHBvcnQgdHlwZSBBY3RpdmF0aW9uSGFuZGxlciA9IHtcbiAgW1AgaW4ga2V5b2YgY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklXb3JrZmxvd0FjdGl2YXRpb25Kb2JdOiBBY3RpdmF0aW9uSGFuZGxlckZ1bmN0aW9uPFA+O1xufTtcblxuLyoqXG4gKiBLZWVwcyBhbGwgb2YgdGhlIFdvcmtmbG93IHJ1bnRpbWUgc3RhdGUgbGlrZSBwZW5kaW5nIGNvbXBsZXRpb25zIGZvciBhY3Rpdml0aWVzIGFuZCB0aW1lcnMuXG4gKlxuICogSW1wbGVtZW50cyBoYW5kbGVycyBmb3IgYWxsIHdvcmtmbG93IGFjdGl2YXRpb24gam9icy5cbiAqL1xuZXhwb3J0IGNsYXNzIEFjdGl2YXRvciBpbXBsZW1lbnRzIEFjdGl2YXRpb25IYW5kbGVyIHtcbiAgLyoqXG4gICAqIENhY2hlIGZvciBtb2R1bGVzIC0gcmVmZXJlbmNlZCBpbiByZXVzYWJsZS12bS50c1xuICAgKi9cbiAgcmVhZG9ubHkgbW9kdWxlQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgdW5rbm93bj4oKTtcbiAgLyoqXG4gICAqIE1hcCBvZiB0YXNrIHNlcXVlbmNlIHRvIGEgQ29tcGxldGlvblxuICAgKi9cbiAgcmVhZG9ubHkgY29tcGxldGlvbnMgPSB7XG4gICAgdGltZXI6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICAgIGFjdGl2aXR5OiBuZXcgTWFwPG51bWJlciwgQ29tcGxldGlvbj4oKSxcbiAgICBjaGlsZFdvcmtmbG93U3RhcnQ6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICAgIGNoaWxkV29ya2Zsb3dDb21wbGV0ZTogbmV3IE1hcDxudW1iZXIsIENvbXBsZXRpb24+KCksXG4gICAgc2lnbmFsV29ya2Zsb3c6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICAgIGNhbmNlbFdvcmtmbG93OiBuZXcgTWFwPG51bWJlciwgQ29tcGxldGlvbj4oKSxcbiAgfTtcblxuICAvKipcbiAgICogSG9sZHMgYnVmZmVyZWQgVXBkYXRlIGNhbGxzIHVudGlsIGEgaGFuZGxlciBpcyByZWdpc3RlcmVkXG4gICAqL1xuICByZWFkb25seSBidWZmZXJlZFVwZGF0ZXMgPSBBcnJheTxjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSURvVXBkYXRlPigpO1xuXG4gIC8qKlxuICAgKiBIb2xkcyBidWZmZXJlZCBzaWduYWwgY2FsbHMgdW50aWwgYSBoYW5kbGVyIGlzIHJlZ2lzdGVyZWRcbiAgICovXG4gIHJlYWRvbmx5IGJ1ZmZlcmVkU2lnbmFscyA9IEFycmF5PGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JU2lnbmFsV29ya2Zsb3c+KCk7XG5cbiAgLyoqXG4gICAqIEhvbGRzIGJ1ZmZlcmVkIHF1ZXJ5IGNhbGxzIHVudGlsIGEgaGFuZGxlciBpcyByZWdpc3RlcmVkLlxuICAgKlxuICAgKiAqKklNUE9SVEFOVCoqIHF1ZXJpZXMgYXJlIG9ubHkgYnVmZmVyZWQgdW50aWwgd29ya2Zsb3cgaXMgc3RhcnRlZC5cbiAgICogVGhpcyBpcyByZXF1aXJlZCBiZWNhdXNlIGFzeW5jIGludGVyY2VwdG9ycyBtaWdodCBibG9jayB3b3JrZmxvdyBmdW5jdGlvbiBpbnZvY2F0aW9uXG4gICAqIHdoaWNoIGRlbGF5cyBxdWVyeSBoYW5kbGVyIHJlZ2lzdHJhdGlvbi5cbiAgICovXG4gIHByb3RlY3RlZCByZWFkb25seSBidWZmZXJlZFF1ZXJpZXMgPSBBcnJheTxjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVF1ZXJ5V29ya2Zsb3c+KCk7XG5cbiAgLyoqXG4gICAqIE1hcHBpbmcgb2YgdXBkYXRlIG5hbWUgdG8gaGFuZGxlciBhbmQgdmFsaWRhdG9yXG4gICAqL1xuICByZWFkb25seSB1cGRhdGVIYW5kbGVycyA9IG5ldyBNYXA8c3RyaW5nLCBXb3JrZmxvd1VwZGF0ZUFubm90YXRlZFR5cGU+KCk7XG5cbiAgLyoqXG4gICAqIE1hcHBpbmcgb2Ygc2lnbmFsIG5hbWUgdG8gaGFuZGxlclxuICAgKi9cbiAgcmVhZG9ubHkgc2lnbmFsSGFuZGxlcnMgPSBuZXcgTWFwPHN0cmluZywgV29ya2Zsb3dTaWduYWxBbm5vdGF0ZWRUeXBlPigpO1xuXG4gIC8qKlxuICAgKiBBIHNpZ25hbCBoYW5kbGVyIHRoYXQgY2F0Y2hlcyBjYWxscyBmb3Igbm9uLXJlZ2lzdGVyZWQgc2lnbmFsIG5hbWVzLlxuICAgKi9cbiAgZGVmYXVsdFNpZ25hbEhhbmRsZXI/OiBEZWZhdWx0U2lnbmFsSGFuZGxlcjtcblxuICAvKipcbiAgICogU291cmNlIG1hcCBmaWxlIGZvciBsb29raW5nIHVwIHRoZSBzb3VyY2UgZmlsZXMgaW4gcmVzcG9uc2UgdG8gX19lbmhhbmNlZF9zdGFja190cmFjZVxuICAgKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHNvdXJjZU1hcDogUmF3U291cmNlTWFwO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIG9yIG5vdCB0byBzZW5kIHRoZSBzb3VyY2VzIGluIGVuaGFuY2VkIHN0YWNrIHRyYWNlIHF1ZXJ5IHJlc3BvbnNlc1xuICAgKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHNob3dTdGFja1RyYWNlU291cmNlcztcblxuICByZWFkb25seSBwcm9taXNlU3RhY2tTdG9yZTogUHJvbWlzZVN0YWNrU3RvcmUgPSB7XG4gICAgcHJvbWlzZVRvU3RhY2s6IG5ldyBNYXAoKSxcbiAgICBjaGlsZFRvUGFyZW50OiBuZXcgTWFwKCksXG4gIH07XG5cbiAgcHVibGljIHJlYWRvbmx5IHJvb3RTY29wZSA9IG5ldyBSb290Q2FuY2VsbGF0aW9uU2NvcGUoKTtcblxuICAvKipcbiAgICogTWFwcGluZyBvZiBxdWVyeSBuYW1lIHRvIGhhbmRsZXJcbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBxdWVyeUhhbmRsZXJzID0gbmV3IE1hcDxzdHJpbmcsIFdvcmtmbG93UXVlcnlBbm5vdGF0ZWRUeXBlPihbXG4gICAgW1xuICAgICAgJ19fc3RhY2tfdHJhY2UnLFxuICAgICAge1xuICAgICAgICBoYW5kbGVyOiAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhY2tUcmFjZXMoKVxuICAgICAgICAgICAgLm1hcCgocykgPT4gcy5mb3JtYXR0ZWQpXG4gICAgICAgICAgICAuam9pbignXFxuXFxuJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmV0dXJucyBhIHNlbnNpYmxlIHN0YWNrIHRyYWNlLicsXG4gICAgICB9LFxuICAgIF0sXG4gICAgW1xuICAgICAgJ19fZW5oYW5jZWRfc3RhY2tfdHJhY2UnLFxuICAgICAge1xuICAgICAgICBoYW5kbGVyOiAoKTogRW5oYW5jZWRTdGFja1RyYWNlID0+IHtcbiAgICAgICAgICBjb25zdCB7IHNvdXJjZU1hcCB9ID0gdGhpcztcbiAgICAgICAgICBjb25zdCBzZGs6IFNES0luZm8gPSB7IG5hbWU6ICd0eXBlc2NyaXB0JywgdmVyc2lvbjogcGtnLnZlcnNpb24gfTtcbiAgICAgICAgICBjb25zdCBzdGFja3MgPSB0aGlzLmdldFN0YWNrVHJhY2VzKCkubWFwKCh7IHN0cnVjdHVyZWQ6IGxvY2F0aW9ucyB9KSA9PiAoeyBsb2NhdGlvbnMgfSkpO1xuICAgICAgICAgIGNvbnN0IHNvdXJjZXM6IFJlY29yZDxzdHJpbmcsIEZpbGVTbGljZVtdPiA9IHt9O1xuICAgICAgICAgIGlmICh0aGlzLnNob3dTdGFja1RyYWNlU291cmNlcykge1xuICAgICAgICAgICAgZm9yIChjb25zdCB7IGxvY2F0aW9ucyB9IG9mIHN0YWNrcykge1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IHsgZmlsZVBhdGggfSBvZiBsb2NhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWZpbGVQYXRoKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gc291cmNlTWFwPy5zb3VyY2VzQ29udGVudD8uW3NvdXJjZU1hcD8uc291cmNlcy5pbmRleE9mKGZpbGVQYXRoKV07XG4gICAgICAgICAgICAgICAgaWYgKCFjb250ZW50KSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBzb3VyY2VzW2ZpbGVQYXRoXSA9IFtcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgbGluZU9mZnNldDogMCxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4geyBzZGssIHN0YWNrcywgc291cmNlcyB9O1xuICAgICAgICB9LFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JldHVybnMgYSBzdGFjayB0cmFjZSBhbm5vdGF0ZWQgd2l0aCBzb3VyY2UgaW5mb3JtYXRpb24uJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBbXG4gICAgICAnX190ZW1wb3JhbF93b3JrZmxvd19tZXRhZGF0YScsXG4gICAgICB7XG4gICAgICAgIGhhbmRsZXI6ICgpOiB0ZW1wb3JhbC5hcGkuc2RrLnYxLklXb3JrZmxvd01ldGFkYXRhID0+IHtcbiAgICAgICAgICBjb25zdCB3b3JrZmxvd1R5cGUgPSB0aGlzLmluZm8ud29ya2Zsb3dUeXBlO1xuICAgICAgICAgIGNvbnN0IHF1ZXJ5RGVmaW5pdGlvbnMgPSBBcnJheS5mcm9tKHRoaXMucXVlcnlIYW5kbGVycy5lbnRyaWVzKCkpLm1hcCgoW25hbWUsIHZhbHVlXSkgPT4gKHtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogdmFsdWUuZGVzY3JpcHRpb24sXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIGNvbnN0IHNpZ25hbERlZmluaXRpb25zID0gQXJyYXkuZnJvbSh0aGlzLnNpZ25hbEhhbmRsZXJzLmVudHJpZXMoKSkubWFwKChbbmFtZSwgdmFsdWVdKSA9PiAoe1xuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB2YWx1ZS5kZXNjcmlwdGlvbixcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgY29uc3QgdXBkYXRlRGVmaW5pdGlvbnMgPSBBcnJheS5mcm9tKHRoaXMudXBkYXRlSGFuZGxlcnMuZW50cmllcygpKS5tYXAoKFtuYW1lLCB2YWx1ZV0pID0+ICh7XG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHZhbHVlLmRlc2NyaXB0aW9uLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVmaW5pdGlvbjoge1xuICAgICAgICAgICAgICB0eXBlOiB3b3JrZmxvd1R5cGUsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBudWxsLCAvLyBGb3Igbm93LCBkbyBub3Qgc2V0IHRoZSB3b3JrZmxvdyBkZXNjcmlwdGlvbiBpbiB0aGUgVFMgU0RLLlxuICAgICAgICAgICAgICBxdWVyeURlZmluaXRpb25zLFxuICAgICAgICAgICAgICBzaWduYWxEZWZpbml0aW9ucyxcbiAgICAgICAgICAgICAgdXBkYXRlRGVmaW5pdGlvbnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmV0dXJucyBtZXRhZGF0YSBhc3NvY2lhdGVkIHdpdGggdGhpcyB3b3JrZmxvdy4nLFxuICAgICAgfSxcbiAgICBdLFxuICBdKTtcblxuICAvKipcbiAgICogTG9hZGVkIGluIHtAbGluayBpbml0UnVudGltZX1cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBpbnRlcmNlcHRvcnM6IFJlcXVpcmVkPFdvcmtmbG93SW50ZXJjZXB0b3JzPiA9IHsgaW5ib3VuZDogW10sIG91dGJvdW5kOiBbXSwgaW50ZXJuYWxzOiBbXSB9O1xuXG4gIC8qKlxuICAgKiBCdWZmZXIgdGhhdCBzdG9yZXMgYWxsIGdlbmVyYXRlZCBjb21tYW5kcywgcmVzZXQgYWZ0ZXIgZWFjaCBhY3RpdmF0aW9uXG4gICAqL1xuICBwcm90ZWN0ZWQgY29tbWFuZHM6IGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuSVdvcmtmbG93Q29tbWFuZFtdID0gW107XG5cbiAgLyoqXG4gICAqIFN0b3JlcyBhbGwge0BsaW5rIGNvbmRpdGlvbn1zIHRoYXQgaGF2ZW4ndCBiZWVuIHVuYmxvY2tlZCB5ZXRcbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBibG9ja2VkQ29uZGl0aW9ucyA9IG5ldyBNYXA8bnVtYmVyLCBDb25kaXRpb24+KCk7XG5cbiAgLyoqXG4gICAqIElzIHRoaXMgV29ya2Zsb3cgY29tcGxldGVkP1xuICAgKlxuICAgKiBBIFdvcmtmbG93IHdpbGwgYmUgY29uc2lkZXJlZCBjb21wbGV0ZWQgaWYgaXQgZ2VuZXJhdGVzIGEgY29tbWFuZCB0aGF0IHRoZVxuICAgKiBzeXN0ZW0gY29uc2lkZXJzIGFzIGEgZmluYWwgV29ya2Zsb3cgY29tbWFuZCAoZS5nLlxuICAgKiBjb21wbGV0ZVdvcmtmbG93RXhlY3V0aW9uIG9yIGZhaWxXb3JrZmxvd0V4ZWN1dGlvbikuXG4gICAqL1xuICBwdWJsaWMgY29tcGxldGVkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFdhcyB0aGlzIFdvcmtmbG93IGNhbmNlbGxlZD9cbiAgICovXG4gIHByb3RlY3RlZCBjYW5jZWxsZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogVGhpcyBpcyB0cmFja2VkIHRvIGFsbG93IGJ1ZmZlcmluZyBxdWVyaWVzIHVudGlsIGEgd29ya2Zsb3cgZnVuY3Rpb24gaXMgY2FsbGVkLlxuICAgKiBUT0RPKGJlcmd1bmR5KTogSSBkb24ndCB0aGluayB0aGlzIG1ha2VzIHNlbnNlIHNpbmNlIHF1ZXJpZXMgcnVuIGxhc3QgaW4gYW4gYWN0aXZhdGlvbiBhbmQgbXVzdCBiZSByZXNwb25kZWQgdG8gaW5cbiAgICogdGhlIHNhbWUgYWN0aXZhdGlvbi5cbiAgICovXG4gIHByb3RlY3RlZCB3b3JrZmxvd0Z1bmN0aW9uV2FzQ2FsbGVkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFRoZSBuZXh0IChpbmNyZW1lbnRhbCkgc2VxdWVuY2UgdG8gYXNzaWduIHdoZW4gZ2VuZXJhdGluZyBjb21wbGV0YWJsZSBjb21tYW5kc1xuICAgKi9cbiAgcHVibGljIG5leHRTZXFzID0ge1xuICAgIHRpbWVyOiAxLFxuICAgIGFjdGl2aXR5OiAxLFxuICAgIGNoaWxkV29ya2Zsb3c6IDEsXG4gICAgc2lnbmFsV29ya2Zsb3c6IDEsXG4gICAgY2FuY2VsV29ya2Zsb3c6IDEsXG4gICAgY29uZGl0aW9uOiAxLFxuICAgIC8vIFVzZWQgaW50ZXJuYWxseSB0byBrZWVwIHRyYWNrIG9mIGFjdGl2ZSBzdGFjayB0cmFjZXNcbiAgICBzdGFjazogMSxcbiAgfTtcblxuICAvKipcbiAgICogVGhpcyBpcyBzZXQgZXZlcnkgdGltZSB0aGUgd29ya2Zsb3cgZXhlY3V0ZXMgYW4gYWN0aXZhdGlvblxuICAgKi9cbiAgbm93OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBXb3JrZmxvdywgaW5pdGlhbGl6ZWQgd2hlbiBhIFdvcmtmbG93IGlzIHN0YXJ0ZWRcbiAgICovXG4gIHB1YmxpYyB3b3JrZmxvdz86IFdvcmtmbG93O1xuXG4gIC8qKlxuICAgKiBJbmZvcm1hdGlvbiBhYm91dCB0aGUgY3VycmVudCBXb3JrZmxvd1xuICAgKi9cbiAgcHVibGljIGluZm86IFdvcmtmbG93SW5mbztcblxuICAvKipcbiAgICogQSBkZXRlcm1pbmlzdGljIFJORywgdXNlZCBieSB0aGUgaXNvbGF0ZSdzIG92ZXJyaWRkZW4gTWF0aC5yYW5kb21cbiAgICovXG4gIHB1YmxpYyByYW5kb206IFJORztcblxuICBwdWJsaWMgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlciA9IGRlZmF1bHRQYXlsb2FkQ29udmVydGVyO1xuICBwdWJsaWMgZmFpbHVyZUNvbnZlcnRlcjogRmFpbHVyZUNvbnZlcnRlciA9IGRlZmF1bHRGYWlsdXJlQ29udmVydGVyO1xuXG4gIC8qKlxuICAgKiBQYXRjaGVzIHdlIGtub3cgdGhlIHN0YXR1cyBvZiBmb3IgdGhpcyB3b3JrZmxvdywgYXMgaW4ge0BsaW5rIHBhdGNoZWR9XG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGtub3duUHJlc2VudFBhdGNoZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICAvKipcbiAgICogUGF0Y2hlcyB3ZSBzZW50IHRvIGNvcmUge0BsaW5rIHBhdGNoZWR9XG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IHNlbnRQYXRjaGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBrbm93bkZsYWdzID0gbmV3IFNldDxudW1iZXI+KCk7XG5cbiAgLyoqXG4gICAqIEJ1ZmZlcmVkIHNpbmsgY2FsbHMgcGVyIGFjdGl2YXRpb25cbiAgICovXG4gIHNpbmtDYWxscyA9IEFycmF5PFNpbmtDYWxsPigpO1xuXG4gIC8qKlxuICAgKiBBIG5hbm9zZWNvbmQgcmVzb2x1dGlvbiB0aW1lIGZ1bmN0aW9uLCBleHRlcm5hbGx5IGluamVjdGVkXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgZ2V0VGltZU9mRGF5OiAoKSA9PiBiaWdpbnQ7XG5cbiAgcHVibGljIHJlYWRvbmx5IHJlZ2lzdGVyZWRBY3Rpdml0eU5hbWVzOiBTZXQ8c3RyaW5nPjtcblxuICBjb25zdHJ1Y3Rvcih7XG4gICAgaW5mbyxcbiAgICBub3csXG4gICAgc2hvd1N0YWNrVHJhY2VTb3VyY2VzLFxuICAgIHNvdXJjZU1hcCxcbiAgICBnZXRUaW1lT2ZEYXksXG4gICAgcmFuZG9tbmVzc1NlZWQsXG4gICAgcGF0Y2hlcyxcbiAgICByZWdpc3RlcmVkQWN0aXZpdHlOYW1lcyxcbiAgfTogV29ya2Zsb3dDcmVhdGVPcHRpb25zSW50ZXJuYWwpIHtcbiAgICB0aGlzLmdldFRpbWVPZkRheSA9IGdldFRpbWVPZkRheTtcbiAgICB0aGlzLmluZm8gPSBpbmZvO1xuICAgIHRoaXMubm93ID0gbm93O1xuICAgIHRoaXMuc2hvd1N0YWNrVHJhY2VTb3VyY2VzID0gc2hvd1N0YWNrVHJhY2VTb3VyY2VzO1xuICAgIHRoaXMuc291cmNlTWFwID0gc291cmNlTWFwO1xuICAgIHRoaXMucmFuZG9tID0gYWxlYShyYW5kb21uZXNzU2VlZCk7XG4gICAgdGhpcy5yZWdpc3RlcmVkQWN0aXZpdHlOYW1lcyA9IHJlZ2lzdGVyZWRBY3Rpdml0eU5hbWVzO1xuXG4gICAgaWYgKGluZm8udW5zYWZlLmlzUmVwbGF5aW5nKSB7XG4gICAgICBmb3IgKGNvbnN0IHBhdGNoSWQgb2YgcGF0Y2hlcykge1xuICAgICAgICB0aGlzLm5vdGlmeUhhc1BhdGNoKHsgcGF0Y2hJZCB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBtdXRhdGVXb3JrZmxvd0luZm8oZm46IChpbmZvOiBXb3JrZmxvd0luZm8pID0+IFdvcmtmbG93SW5mbyk6IHZvaWQge1xuICAgIHRoaXMuaW5mbyA9IGZuKHRoaXMuaW5mbyk7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0U3RhY2tUcmFjZXMoKTogU3RhY2tbXSB7XG4gICAgY29uc3QgeyBjaGlsZFRvUGFyZW50LCBwcm9taXNlVG9TdGFjayB9ID0gdGhpcy5wcm9taXNlU3RhY2tTdG9yZTtcbiAgICBjb25zdCBpbnRlcm5hbE5vZGVzID0gWy4uLmNoaWxkVG9QYXJlbnQudmFsdWVzKCldLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IHAgb2YgY3Vycikge1xuICAgICAgICBhY2MuYWRkKHApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCBuZXcgU2V0KCkpO1xuICAgIGNvbnN0IHN0YWNrcyA9IG5ldyBNYXA8c3RyaW5nLCBTdGFjaz4oKTtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkVG9QYXJlbnQua2V5cygpKSB7XG4gICAgICBpZiAoIWludGVybmFsTm9kZXMuaGFzKGNoaWxkKSkge1xuICAgICAgICBjb25zdCBzdGFjayA9IHByb21pc2VUb1N0YWNrLmdldChjaGlsZCk7XG4gICAgICAgIGlmICghc3RhY2sgfHwgIXN0YWNrLmZvcm1hdHRlZCkgY29udGludWU7XG4gICAgICAgIHN0YWNrcy5zZXQoc3RhY2suZm9ybWF0dGVkLCBzdGFjayk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIE5vdCAxMDAlIHN1cmUgd2hlcmUgdGhpcyBjb21lcyBmcm9tLCBqdXN0IGZpbHRlciBpdCBvdXRcbiAgICBzdGFja3MuZGVsZXRlKCcgICAgYXQgUHJvbWlzZS50aGVuICg8YW5vbnltb3VzPiknKTtcbiAgICBzdGFja3MuZGVsZXRlKCcgICAgYXQgUHJvbWlzZS50aGVuICg8YW5vbnltb3VzPilcXG4nKTtcbiAgICByZXR1cm4gWy4uLnN0YWNrc10ubWFwKChbXywgc3RhY2tdKSA9PiBzdGFjayk7XG4gIH1cblxuICBnZXRBbmRSZXNldFNpbmtDYWxscygpOiBTaW5rQ2FsbFtdIHtcbiAgICBjb25zdCB7IHNpbmtDYWxscyB9ID0gdGhpcztcbiAgICB0aGlzLnNpbmtDYWxscyA9IFtdO1xuICAgIHJldHVybiBzaW5rQ2FsbHM7XG4gIH1cblxuICAvKipcbiAgICogQnVmZmVyIGEgV29ya2Zsb3cgY29tbWFuZCB0byBiZSBjb2xsZWN0ZWQgYXQgdGhlIGVuZCBvZiB0aGUgY3VycmVudCBhY3RpdmF0aW9uLlxuICAgKlxuICAgKiBQcmV2ZW50cyBjb21tYW5kcyBmcm9tIGJlaW5nIGFkZGVkIGFmdGVyIFdvcmtmbG93IGNvbXBsZXRpb24uXG4gICAqL1xuICBwdXNoQ29tbWFuZChjbWQ6IGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuSVdvcmtmbG93Q29tbWFuZCwgY29tcGxldGUgPSBmYWxzZSk6IHZvaWQge1xuICAgIC8vIE9ubHkgcXVlcnkgcmVzcG9uc2VzIG1heSBiZSBzZW50IGFmdGVyIGNvbXBsZXRpb25cbiAgICBpZiAodGhpcy5jb21wbGV0ZWQgJiYgIWNtZC5yZXNwb25kVG9RdWVyeSkgcmV0dXJuO1xuICAgIHRoaXMuY29tbWFuZHMucHVzaChjbWQpO1xuICAgIGlmIChjb21wbGV0ZSkge1xuICAgICAgdGhpcy5jb21wbGV0ZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGNvbmNsdWRlQWN0aXZhdGlvbigpOiBBY3RpdmF0aW9uQ29tcGxldGlvbiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbW1hbmRzOiB0aGlzLmNvbW1hbmRzLnNwbGljZSgwKSxcbiAgICAgIHVzZWRJbnRlcm5hbEZsYWdzOiBbLi4udGhpcy5rbm93bkZsYWdzXSxcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGFzeW5jIHN0YXJ0V29ya2Zsb3dOZXh0SGFuZGxlcih7IGFyZ3MgfTogV29ya2Zsb3dFeGVjdXRlSW5wdXQpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IHsgd29ya2Zsb3cgfSA9IHRoaXM7XG4gICAgaWYgKHdvcmtmbG93ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcignV29ya2Zsb3cgdW5pbml0aWFsaXplZCcpO1xuICAgIH1cbiAgICBsZXQgcHJvbWlzZTogUHJvbWlzZTxhbnk+O1xuICAgIHRyeSB7XG4gICAgICBwcm9taXNlID0gd29ya2Zsb3coLi4uYXJncyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIFF1ZXJpZXMgbXVzdCBiZSBoYW5kbGVkIGV2ZW4gaWYgdGhlcmUgd2FzIGFuIGV4Y2VwdGlvbiB3aGVuIGludm9raW5nIHRoZSBXb3JrZmxvdyBmdW5jdGlvbi5cbiAgICAgIHRoaXMud29ya2Zsb3dGdW5jdGlvbldhc0NhbGxlZCA9IHRydWU7XG4gICAgICAvLyBFbXB0eSB0aGUgYnVmZmVyXG4gICAgICBjb25zdCBidWZmZXIgPSB0aGlzLmJ1ZmZlcmVkUXVlcmllcy5zcGxpY2UoMCk7XG4gICAgICBmb3IgKGNvbnN0IGFjdGl2YXRpb24gb2YgYnVmZmVyKSB7XG4gICAgICAgIHRoaXMucXVlcnlXb3JrZmxvdyhhY3RpdmF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IHByb21pc2U7XG4gIH1cblxuICBwdWJsaWMgc3RhcnRXb3JrZmxvdyhhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVN0YXJ0V29ya2Zsb3cpOiB2b2lkIHtcbiAgICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyh0aGlzLmludGVyY2VwdG9ycy5pbmJvdW5kLCAnZXhlY3V0ZScsIHRoaXMuc3RhcnRXb3JrZmxvd05leHRIYW5kbGVyLmJpbmQodGhpcykpO1xuXG4gICAgdW50cmFja1Byb21pc2UoXG4gICAgICBleGVjdXRlV2l0aExpZmVjeWNsZUxvZ2dpbmcoKCkgPT5cbiAgICAgICAgZXhlY3V0ZSh7XG4gICAgICAgICAgaGVhZGVyczogYWN0aXZhdGlvbi5oZWFkZXJzID8/IHt9LFxuICAgICAgICAgIGFyZ3M6IGFycmF5RnJvbVBheWxvYWRzKHRoaXMucGF5bG9hZENvbnZlcnRlciwgYWN0aXZhdGlvbi5hcmd1bWVudHMpLFxuICAgICAgICB9KVxuICAgICAgKS50aGVuKHRoaXMuY29tcGxldGVXb3JrZmxvdy5iaW5kKHRoaXMpLCB0aGlzLmhhbmRsZVdvcmtmbG93RmFpbHVyZS5iaW5kKHRoaXMpKVxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgY2FuY2VsV29ya2Zsb3coX2FjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JQ2FuY2VsV29ya2Zsb3cpOiB2b2lkIHtcbiAgICB0aGlzLmNhbmNlbGxlZCA9IHRydWU7XG4gICAgdGhpcy5yb290U2NvcGUuY2FuY2VsKCk7XG4gIH1cblxuICBwdWJsaWMgZmlyZVRpbWVyKGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JRmlyZVRpbWVyKTogdm9pZCB7XG4gICAgLy8gVGltZXJzIGFyZSBhIHNwZWNpYWwgY2FzZSB3aGVyZSB0aGVpciBjb21wbGV0aW9uIG1pZ2h0IG5vdCBiZSBpbiBXb3JrZmxvdyBzdGF0ZSxcbiAgICAvLyB0aGlzIGlzIGR1ZSB0byBpbW1lZGlhdGUgdGltZXIgY2FuY2VsbGF0aW9uIHRoYXQgZG9lc24ndCBnbyB3YWl0IGZvciBDb3JlLlxuICAgIGNvbnN0IGNvbXBsZXRpb24gPSB0aGlzLm1heWJlQ29uc3VtZUNvbXBsZXRpb24oJ3RpbWVyJywgZ2V0U2VxKGFjdGl2YXRpb24pKTtcbiAgICBjb21wbGV0aW9uPy5yZXNvbHZlKHVuZGVmaW5lZCk7XG4gIH1cblxuICBwdWJsaWMgcmVzb2x2ZUFjdGl2aXR5KGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JUmVzb2x2ZUFjdGl2aXR5KTogdm9pZCB7XG4gICAgaWYgKCFhY3RpdmF0aW9uLnJlc3VsdCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IFJlc29sdmVBY3Rpdml0eSBhY3RpdmF0aW9uIHdpdGggbm8gcmVzdWx0Jyk7XG4gICAgfVxuICAgIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0IH0gPSB0aGlzLmNvbnN1bWVDb21wbGV0aW9uKCdhY3Rpdml0eScsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmNvbXBsZXRlZCkge1xuICAgICAgY29uc3QgY29tcGxldGVkID0gYWN0aXZhdGlvbi5yZXN1bHQuY29tcGxldGVkO1xuICAgICAgY29uc3QgcmVzdWx0ID0gY29tcGxldGVkLnJlc3VsdCA/IHRoaXMucGF5bG9hZENvbnZlcnRlci5mcm9tUGF5bG9hZChjb21wbGV0ZWQucmVzdWx0KSA6IHVuZGVmaW5lZDtcbiAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmZhaWxlZCkge1xuICAgICAgY29uc3QgeyBmYWlsdXJlIH0gPSBhY3RpdmF0aW9uLnJlc3VsdC5mYWlsZWQ7XG4gICAgICBjb25zdCBlcnIgPSBmYWlsdXJlID8gdGhpcy5mYWlsdXJlVG9FcnJvcihmYWlsdXJlKSA6IHVuZGVmaW5lZDtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuY2FuY2VsbGVkKSB7XG4gICAgICBjb25zdCB7IGZhaWx1cmUgfSA9IGFjdGl2YXRpb24ucmVzdWx0LmNhbmNlbGxlZDtcbiAgICAgIGNvbnN0IGVyciA9IGZhaWx1cmUgPyB0aGlzLmZhaWx1cmVUb0Vycm9yKGZhaWx1cmUpIDogdW5kZWZpbmVkO1xuICAgICAgcmVqZWN0KGVycik7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5iYWNrb2ZmKSB7XG4gICAgICByZWplY3QobmV3IExvY2FsQWN0aXZpdHlEb0JhY2tvZmYoYWN0aXZhdGlvbi5yZXN1bHQuYmFja29mZikpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZXNvbHZlQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvblN0YXJ0KFxuICAgIGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JUmVzb2x2ZUNoaWxkV29ya2Zsb3dFeGVjdXRpb25TdGFydFxuICApOiB2b2lkIHtcbiAgICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCB9ID0gdGhpcy5jb25zdW1lQ29tcGxldGlvbignY2hpbGRXb3JrZmxvd1N0YXJ0JywgZ2V0U2VxKGFjdGl2YXRpb24pKTtcbiAgICBpZiAoYWN0aXZhdGlvbi5zdWNjZWVkZWQpIHtcbiAgICAgIHJlc29sdmUoYWN0aXZhdGlvbi5zdWNjZWVkZWQucnVuSWQpO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5mYWlsZWQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgYWN0aXZhdGlvbi5mYWlsZWQuY2F1c2UgIT09XG4gICAgICAgIFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlLlNUQVJUX0NISUxEX1dPUktGTE9XX0VYRUNVVElPTl9GQUlMRURfQ0FVU0VfV09SS0ZMT1dfQUxSRUFEWV9FWElTVFNcbiAgICAgICkge1xuICAgICAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ0dvdCB1bmtub3duIFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlJyk7XG4gICAgICB9XG4gICAgICBpZiAoIShhY3RpdmF0aW9uLnNlcSAmJiBhY3RpdmF0aW9uLmZhaWxlZC53b3JrZmxvd0lkICYmIGFjdGl2YXRpb24uZmFpbGVkLndvcmtmbG93VHlwZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBhdHRyaWJ1dGVzIGluIGFjdGl2YXRpb24gam9iJyk7XG4gICAgICB9XG4gICAgICByZWplY3QoXG4gICAgICAgIG5ldyBXb3JrZmxvd0V4ZWN1dGlvbkFscmVhZHlTdGFydGVkRXJyb3IoXG4gICAgICAgICAgJ1dvcmtmbG93IGV4ZWN1dGlvbiBhbHJlYWR5IHN0YXJ0ZWQnLFxuICAgICAgICAgIGFjdGl2YXRpb24uZmFpbGVkLndvcmtmbG93SWQsXG4gICAgICAgICAgYWN0aXZhdGlvbi5mYWlsZWQud29ya2Zsb3dUeXBlXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLmNhbmNlbGxlZCkge1xuICAgICAgaWYgKCFhY3RpdmF0aW9uLmNhbmNlbGxlZC5mYWlsdXJlKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBubyBmYWlsdXJlIGluIGNhbmNlbGxlZCB2YXJpYW50Jyk7XG4gICAgICB9XG4gICAgICByZWplY3QodGhpcy5mYWlsdXJlVG9FcnJvcihhY3RpdmF0aW9uLmNhbmNlbGxlZC5mYWlsdXJlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBSZXNvbHZlQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvblN0YXJ0IHdpdGggbm8gc3RhdHVzJyk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uKGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JUmVzb2x2ZUNoaWxkV29ya2Zsb3dFeGVjdXRpb24pOiB2b2lkIHtcbiAgICBpZiAoIWFjdGl2YXRpb24ucmVzdWx0KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgUmVzb2x2ZUNoaWxkV29ya2Zsb3dFeGVjdXRpb24gYWN0aXZhdGlvbiB3aXRoIG5vIHJlc3VsdCcpO1xuICAgIH1cbiAgICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCB9ID0gdGhpcy5jb25zdW1lQ29tcGxldGlvbignY2hpbGRXb3JrZmxvd0NvbXBsZXRlJywgZ2V0U2VxKGFjdGl2YXRpb24pKTtcbiAgICBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuY29tcGxldGVkKSB7XG4gICAgICBjb25zdCBjb21wbGV0ZWQgPSBhY3RpdmF0aW9uLnJlc3VsdC5jb21wbGV0ZWQ7XG4gICAgICBjb25zdCByZXN1bHQgPSBjb21wbGV0ZWQucmVzdWx0ID8gdGhpcy5wYXlsb2FkQ29udmVydGVyLmZyb21QYXlsb2FkKGNvbXBsZXRlZC5yZXN1bHQpIDogdW5kZWZpbmVkO1xuICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuZmFpbGVkKSB7XG4gICAgICBjb25zdCB7IGZhaWx1cmUgfSA9IGFjdGl2YXRpb24ucmVzdWx0LmZhaWxlZDtcbiAgICAgIGlmIChmYWlsdXJlID09PSB1bmRlZmluZWQgfHwgZmFpbHVyZSA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgZmFpbGVkIHJlc3VsdCB3aXRoIG5vIGZhaWx1cmUgYXR0cmlidXRlJyk7XG4gICAgICB9XG4gICAgICByZWplY3QodGhpcy5mYWlsdXJlVG9FcnJvcihmYWlsdXJlKSk7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5jYW5jZWxsZWQpIHtcbiAgICAgIGNvbnN0IHsgZmFpbHVyZSB9ID0gYWN0aXZhdGlvbi5yZXN1bHQuY2FuY2VsbGVkO1xuICAgICAgaWYgKGZhaWx1cmUgPT09IHVuZGVmaW5lZCB8fCBmYWlsdXJlID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBjYW5jZWxsZWQgcmVzdWx0IHdpdGggbm8gZmFpbHVyZSBhdHRyaWJ1dGUnKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdCh0aGlzLmZhaWx1cmVUb0Vycm9yKGZhaWx1cmUpKTtcbiAgICB9XG4gIH1cblxuICAvLyBJbnRlbnRpb25hbGx5IG5vbi1hc3luYyBmdW5jdGlvbiBzbyB0aGlzIGhhbmRsZXIgZG9lc24ndCBzaG93IHVwIGluIHRoZSBzdGFjayB0cmFjZVxuICBwcm90ZWN0ZWQgcXVlcnlXb3JrZmxvd05leHRIYW5kbGVyKHsgcXVlcnlOYW1lLCBhcmdzIH06IFF1ZXJ5SW5wdXQpOiBQcm9taXNlPHVua25vd24+IHtcbiAgICBjb25zdCBmbiA9IHRoaXMucXVlcnlIYW5kbGVycy5nZXQocXVlcnlOYW1lKT8uaGFuZGxlcjtcbiAgICBpZiAoZm4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3Qga25vd25RdWVyeVR5cGVzID0gWy4uLnRoaXMucXVlcnlIYW5kbGVycy5rZXlzKCldLmpvaW4oJyAnKTtcbiAgICAgIC8vIEZhaWwgdGhlIHF1ZXJ5XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoXG4gICAgICAgIG5ldyBSZWZlcmVuY2VFcnJvcihcbiAgICAgICAgICBgV29ya2Zsb3cgZGlkIG5vdCByZWdpc3RlciBhIGhhbmRsZXIgZm9yICR7cXVlcnlOYW1lfS4gUmVnaXN0ZXJlZCBxdWVyaWVzOiBbJHtrbm93blF1ZXJ5VHlwZXN9XWBcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJldCA9IGZuKC4uLmFyZ3MpO1xuICAgICAgaWYgKHJldCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yKCdRdWVyeSBoYW5kbGVycyBzaG91bGQgbm90IHJldHVybiBhIFByb21pc2UnKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJldCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcXVlcnlXb3JrZmxvdyhhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVF1ZXJ5V29ya2Zsb3cpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMud29ya2Zsb3dGdW5jdGlvbldhc0NhbGxlZCkge1xuICAgICAgdGhpcy5idWZmZXJlZFF1ZXJpZXMucHVzaChhY3RpdmF0aW9uKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7IHF1ZXJ5VHlwZSwgcXVlcnlJZCwgaGVhZGVycyB9ID0gYWN0aXZhdGlvbjtcbiAgICBpZiAoIShxdWVyeVR5cGUgJiYgcXVlcnlJZCkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgcXVlcnkgYWN0aXZhdGlvbiBhdHRyaWJ1dGVzJyk7XG4gICAgfVxuXG4gICAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgICB0aGlzLmludGVyY2VwdG9ycy5pbmJvdW5kLFxuICAgICAgJ2hhbmRsZVF1ZXJ5JyxcbiAgICAgIHRoaXMucXVlcnlXb3JrZmxvd05leHRIYW5kbGVyLmJpbmQodGhpcylcbiAgICApO1xuICAgIGV4ZWN1dGUoe1xuICAgICAgcXVlcnlOYW1lOiBxdWVyeVR5cGUsXG4gICAgICBhcmdzOiBhcnJheUZyb21QYXlsb2Fkcyh0aGlzLnBheWxvYWRDb252ZXJ0ZXIsIGFjdGl2YXRpb24uYXJndW1lbnRzKSxcbiAgICAgIHF1ZXJ5SWQsXG4gICAgICBoZWFkZXJzOiBoZWFkZXJzID8/IHt9LFxuICAgIH0pLnRoZW4oXG4gICAgICAocmVzdWx0KSA9PiB0aGlzLmNvbXBsZXRlUXVlcnkocXVlcnlJZCwgcmVzdWx0KSxcbiAgICAgIChyZWFzb24pID0+IHRoaXMuZmFpbFF1ZXJ5KHF1ZXJ5SWQsIHJlYXNvbilcbiAgICApO1xuICB9XG5cbiAgcHVibGljIGRvVXBkYXRlKGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JRG9VcGRhdGUpOiB2b2lkIHtcbiAgICBjb25zdCB7IGlkOiB1cGRhdGVJZCwgcHJvdG9jb2xJbnN0YW5jZUlkLCBuYW1lLCBoZWFkZXJzLCBydW5WYWxpZGF0b3IgfSA9IGFjdGl2YXRpb247XG4gICAgaWYgKCF1cGRhdGVJZCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBhY3RpdmF0aW9uIHVwZGF0ZSBpZCcpO1xuICAgIH1cbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYWN0aXZhdGlvbiB1cGRhdGUgbmFtZScpO1xuICAgIH1cbiAgICBpZiAoIXByb3RvY29sSW5zdGFuY2VJZCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBhY3RpdmF0aW9uIHVwZGF0ZSBwcm90b2NvbEluc3RhbmNlSWQnKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLnVwZGF0ZUhhbmRsZXJzLmhhcyhuYW1lKSkge1xuICAgICAgdGhpcy5idWZmZXJlZFVwZGF0ZXMucHVzaChhY3RpdmF0aW9uKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBtYWtlSW5wdXQgPSAoKTogVXBkYXRlSW5wdXQgPT4gKHtcbiAgICAgIHVwZGF0ZUlkLFxuICAgICAgYXJnczogYXJyYXlGcm9tUGF5bG9hZHModGhpcy5wYXlsb2FkQ29udmVydGVyLCBhY3RpdmF0aW9uLmlucHV0KSxcbiAgICAgIG5hbWUsXG4gICAgICBoZWFkZXJzOiBoZWFkZXJzID8/IHt9LFxuICAgIH0pO1xuXG4gICAgLy8gVGhlIGltcGxlbWVudGF0aW9uIGJlbG93IGlzIHJlc3BvbnNpYmxlIGZvciB1cGhvbGRpbmcsIGFuZCBjb25zdHJhaW5lZFxuICAgIC8vIGJ5LCB0aGUgZm9sbG93aW5nIGNvbnRyYWN0OlxuICAgIC8vXG4gICAgLy8gMS4gSWYgbm8gdmFsaWRhdG9yIGlzIHByZXNlbnQgdGhlbiB2YWxpZGF0aW9uIGludGVyY2VwdG9ycyB3aWxsIG5vdCBiZSBydW4uXG4gICAgLy9cbiAgICAvLyAyLiBEdXJpbmcgdmFsaWRhdGlvbiwgYW55IGVycm9yIG11c3QgZmFpbCB0aGUgVXBkYXRlOyBkdXJpbmcgdGhlIFVwZGF0ZVxuICAgIC8vICAgIGl0c2VsZiwgVGVtcG9yYWwgZXJyb3JzIGZhaWwgdGhlIFVwZGF0ZSB3aGVyZWFzIG90aGVyIGVycm9ycyBmYWlsIHRoZVxuICAgIC8vICAgIGFjdGl2YXRpb24uXG4gICAgLy9cbiAgICAvLyAzLiBUaGUgaGFuZGxlciBtdXN0IG5vdCBzZWUgYW55IG11dGF0aW9ucyBvZiB0aGUgYXJndW1lbnRzIG1hZGUgYnkgdGhlXG4gICAgLy8gICAgdmFsaWRhdG9yLlxuICAgIC8vXG4gICAgLy8gNC4gQW55IGVycm9yIHdoZW4gZGVjb2RpbmcvZGVzZXJpYWxpemluZyBpbnB1dCBtdXN0IGJlIGNhdWdodCBhbmQgcmVzdWx0XG4gICAgLy8gICAgaW4gcmVqZWN0aW9uIG9mIHRoZSBVcGRhdGUgYmVmb3JlIGl0IGlzIGFjY2VwdGVkLCBldmVuIGlmIHRoZXJlIGlzIG5vXG4gICAgLy8gICAgdmFsaWRhdG9yLlxuICAgIC8vXG4gICAgLy8gNS4gVGhlIGluaXRpYWwgc3luY2hyb25vdXMgcG9ydGlvbiBvZiB0aGUgKGFzeW5jKSBVcGRhdGUgaGFuZGxlciBzaG91bGRcbiAgICAvLyAgICBiZSBleGVjdXRlZCBhZnRlciB0aGUgKHN5bmMpIHZhbGlkYXRvciBjb21wbGV0ZXMgc3VjaCB0aGF0IHRoZXJlIGlzXG4gICAgLy8gICAgbWluaW1hbCBvcHBvcnR1bml0eSBmb3IgYSBkaWZmZXJlbnQgY29uY3VycmVudCB0YXNrIHRvIGJlIHNjaGVkdWxlZFxuICAgIC8vICAgIGJldHdlZW4gdGhlbS5cbiAgICAvL1xuICAgIC8vIDYuIFRoZSBzdGFjayB0cmFjZSB2aWV3IHByb3ZpZGVkIGluIHRoZSBUZW1wb3JhbCBVSSBtdXN0IG5vdCBiZSBwb2xsdXRlZFxuICAgIC8vICAgIGJ5IHByb21pc2VzIHRoYXQgZG8gbm90IGRlcml2ZSBmcm9tIHVzZXIgY29kZS4gVGhpcyBpbXBsaWVzIHRoYXRcbiAgICAvLyAgICBhc3luYy9hd2FpdCBzeW50YXggbWF5IG5vdCBiZSB1c2VkLlxuICAgIC8vXG4gICAgLy8gTm90ZSB0aGF0IHRoZXJlIGlzIGEgZGVsaWJlcmF0ZWx5IHVuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbiBiZWxvdy5cbiAgICAvLyBUaGVzZSBhcmUgY2F1Z2h0IGVsc2V3aGVyZSBhbmQgZmFpbCB0aGUgY29ycmVzcG9uZGluZyBhY3RpdmF0aW9uLlxuICAgIGxldCBpbnB1dDogVXBkYXRlSW5wdXQ7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChydW5WYWxpZGF0b3IgJiYgdGhpcy51cGRhdGVIYW5kbGVycy5nZXQobmFtZSk/LnZhbGlkYXRvcikge1xuICAgICAgICBjb25zdCB2YWxpZGF0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgICAgICAgdGhpcy5pbnRlcmNlcHRvcnMuaW5ib3VuZCxcbiAgICAgICAgICAndmFsaWRhdGVVcGRhdGUnLFxuICAgICAgICAgIHRoaXMudmFsaWRhdGVVcGRhdGVOZXh0SGFuZGxlci5iaW5kKHRoaXMpXG4gICAgICAgICk7XG4gICAgICAgIHZhbGlkYXRlKG1ha2VJbnB1dCgpKTtcbiAgICAgIH1cbiAgICAgIGlucHV0ID0gbWFrZUlucHV0KCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMucmVqZWN0VXBkYXRlKHByb3RvY29sSW5zdGFuY2VJZCwgZXJyb3IpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyh0aGlzLmludGVyY2VwdG9ycy5pbmJvdW5kLCAnaGFuZGxlVXBkYXRlJywgdGhpcy51cGRhdGVOZXh0SGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmFjY2VwdFVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQpO1xuICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgZXhlY3V0ZShpbnB1dClcbiAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4gdGhpcy5jb21wbGV0ZVVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQsIHJlc3VsdCkpXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBUZW1wb3JhbEZhaWx1cmUpIHtcbiAgICAgICAgICAgIHRoaXMucmVqZWN0VXBkYXRlKHByb3RvY29sSW5zdGFuY2VJZCwgZXJyb3IpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyB1cGRhdGVOZXh0SGFuZGxlcih7IG5hbWUsIGFyZ3MgfTogVXBkYXRlSW5wdXQpOiBQcm9taXNlPHVua25vd24+IHtcbiAgICBjb25zdCBlbnRyeSA9IHRoaXMudXBkYXRlSGFuZGxlcnMuZ2V0KG5hbWUpO1xuICAgIGlmICghZW50cnkpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgSWxsZWdhbFN0YXRlRXJyb3IoYE5vIHJlZ2lzdGVyZWQgdXBkYXRlIGhhbmRsZXIgZm9yIHVwZGF0ZTogJHtuYW1lfWApKTtcbiAgICB9XG4gICAgY29uc3QgeyBoYW5kbGVyIH0gPSBlbnRyeTtcbiAgICByZXR1cm4gYXdhaXQgaGFuZGxlciguLi5hcmdzKTtcbiAgfVxuXG4gIHByb3RlY3RlZCB2YWxpZGF0ZVVwZGF0ZU5leHRIYW5kbGVyKHsgbmFtZSwgYXJncyB9OiBVcGRhdGVJbnB1dCk6IHZvaWQge1xuICAgIGNvbnN0IHsgdmFsaWRhdG9yIH0gPSB0aGlzLnVwZGF0ZUhhbmRsZXJzLmdldChuYW1lKSA/PyB7fTtcbiAgICBpZiAodmFsaWRhdG9yKSB7XG4gICAgICB2YWxpZGF0b3IoLi4uYXJncyk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGRpc3BhdGNoQnVmZmVyZWRVcGRhdGVzKCk6IHZvaWQge1xuICAgIGNvbnN0IGJ1ZmZlcmVkVXBkYXRlcyA9IHRoaXMuYnVmZmVyZWRVcGRhdGVzO1xuICAgIHdoaWxlIChidWZmZXJlZFVwZGF0ZXMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBmb3VuZEluZGV4ID0gYnVmZmVyZWRVcGRhdGVzLmZpbmRJbmRleCgodXBkYXRlKSA9PiB0aGlzLnVwZGF0ZUhhbmRsZXJzLmhhcyh1cGRhdGUubmFtZSBhcyBzdHJpbmcpKTtcbiAgICAgIGlmIChmb3VuZEluZGV4ID09PSAtMSkge1xuICAgICAgICAvLyBObyBidWZmZXJlZCBVcGRhdGVzIGhhdmUgYSBoYW5kbGVyIHlldC5cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjb25zdCBbdXBkYXRlXSA9IGJ1ZmZlcmVkVXBkYXRlcy5zcGxpY2UoZm91bmRJbmRleCwgMSk7XG4gICAgICB0aGlzLmRvVXBkYXRlKHVwZGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlamVjdEJ1ZmZlcmVkVXBkYXRlcygpOiB2b2lkIHtcbiAgICB3aGlsZSAodGhpcy5idWZmZXJlZFVwZGF0ZXMubGVuZ3RoKSB7XG4gICAgICBjb25zdCB1cGRhdGUgPSB0aGlzLmJ1ZmZlcmVkVXBkYXRlcy5zaGlmdCgpO1xuICAgICAgaWYgKHVwZGF0ZSkge1xuICAgICAgICB0aGlzLnJlamVjdFVwZGF0ZShcbiAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uICovXG4gICAgICAgICAgdXBkYXRlLnByb3RvY29sSW5zdGFuY2VJZCEsXG4gICAgICAgICAgQXBwbGljYXRpb25GYWlsdXJlLm5vblJldHJ5YWJsZShgTm8gcmVnaXN0ZXJlZCBoYW5kbGVyIGZvciB1cGRhdGU6ICR7dXBkYXRlLm5hbWV9YClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc2lnbmFsV29ya2Zsb3dOZXh0SGFuZGxlcih7IHNpZ25hbE5hbWUsIGFyZ3MgfTogU2lnbmFsSW5wdXQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBmbiA9IHRoaXMuc2lnbmFsSGFuZGxlcnMuZ2V0KHNpZ25hbE5hbWUpPy5oYW5kbGVyO1xuICAgIGlmIChmbikge1xuICAgICAgcmV0dXJuIGF3YWl0IGZuKC4uLmFyZ3MpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0U2lnbmFsSGFuZGxlcikge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZGVmYXVsdFNpZ25hbEhhbmRsZXIoc2lnbmFsTmFtZSwgLi4uYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcihgTm8gcmVnaXN0ZXJlZCBzaWduYWwgaGFuZGxlciBmb3Igc2lnbmFsOiAke3NpZ25hbE5hbWV9YCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNpZ25hbFdvcmtmbG93KGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JU2lnbmFsV29ya2Zsb3cpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpZ25hbE5hbWUsIGhlYWRlcnMgfSA9IGFjdGl2YXRpb247XG4gICAgaWYgKCFzaWduYWxOYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGFjdGl2YXRpb24gc2lnbmFsTmFtZScpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5zaWduYWxIYW5kbGVycy5oYXMoc2lnbmFsTmFtZSkgJiYgIXRoaXMuZGVmYXVsdFNpZ25hbEhhbmRsZXIpIHtcbiAgICAgIHRoaXMuYnVmZmVyZWRTaWduYWxzLnB1c2goYWN0aXZhdGlvbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgICB0aGlzLmludGVyY2VwdG9ycy5pbmJvdW5kLFxuICAgICAgJ2hhbmRsZVNpZ25hbCcsXG4gICAgICB0aGlzLnNpZ25hbFdvcmtmbG93TmV4dEhhbmRsZXIuYmluZCh0aGlzKVxuICAgICk7XG4gICAgZXhlY3V0ZSh7XG4gICAgICBhcmdzOiBhcnJheUZyb21QYXlsb2Fkcyh0aGlzLnBheWxvYWRDb252ZXJ0ZXIsIGFjdGl2YXRpb24uaW5wdXQpLFxuICAgICAgc2lnbmFsTmFtZSxcbiAgICAgIGhlYWRlcnM6IGhlYWRlcnMgPz8ge30sXG4gICAgfSkuY2F0Y2godGhpcy5oYW5kbGVXb3JrZmxvd0ZhaWx1cmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBwdWJsaWMgZGlzcGF0Y2hCdWZmZXJlZFNpZ25hbHMoKTogdm9pZCB7XG4gICAgY29uc3QgYnVmZmVyZWRTaWduYWxzID0gdGhpcy5idWZmZXJlZFNpZ25hbHM7XG4gICAgd2hpbGUgKGJ1ZmZlcmVkU2lnbmFscy5sZW5ndGgpIHtcbiAgICAgIGlmICh0aGlzLmRlZmF1bHRTaWduYWxIYW5kbGVyKSB7XG4gICAgICAgIC8vIFdlIGhhdmUgYSBkZWZhdWx0IHNpZ25hbCBoYW5kbGVyLCBzbyBhbGwgc2lnbmFscyBhcmUgZGlzcGF0Y2hhYmxlXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uXG4gICAgICAgIHRoaXMuc2lnbmFsV29ya2Zsb3coYnVmZmVyZWRTaWduYWxzLnNoaWZ0KCkhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGZvdW5kSW5kZXggPSBidWZmZXJlZFNpZ25hbHMuZmluZEluZGV4KChzaWduYWwpID0+IHRoaXMuc2lnbmFsSGFuZGxlcnMuaGFzKHNpZ25hbC5zaWduYWxOYW1lIGFzIHN0cmluZykpO1xuICAgICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIGJyZWFrO1xuICAgICAgICBjb25zdCBbc2lnbmFsXSA9IGJ1ZmZlcmVkU2lnbmFscy5zcGxpY2UoZm91bmRJbmRleCwgMSk7XG4gICAgICAgIHRoaXMuc2lnbmFsV29ya2Zsb3coc2lnbmFsKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVzb2x2ZVNpZ25hbEV4dGVybmFsV29ya2Zsb3coYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklSZXNvbHZlU2lnbmFsRXh0ZXJuYWxXb3JrZmxvdyk6IHZvaWQge1xuICAgIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0IH0gPSB0aGlzLmNvbnN1bWVDb21wbGV0aW9uKCdzaWduYWxXb3JrZmxvdycsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgaWYgKGFjdGl2YXRpb24uZmFpbHVyZSkge1xuICAgICAgcmVqZWN0KHRoaXMuZmFpbHVyZVRvRXJyb3IoYWN0aXZhdGlvbi5mYWlsdXJlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc29sdmUodW5kZWZpbmVkKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVzb2x2ZVJlcXVlc3RDYW5jZWxFeHRlcm5hbFdvcmtmbG93KFxuICAgIGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JUmVzb2x2ZVJlcXVlc3RDYW5jZWxFeHRlcm5hbFdvcmtmbG93XG4gICk6IHZvaWQge1xuICAgIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0IH0gPSB0aGlzLmNvbnN1bWVDb21wbGV0aW9uKCdjYW5jZWxXb3JrZmxvdycsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgaWYgKGFjdGl2YXRpb24uZmFpbHVyZSkge1xuICAgICAgcmVqZWN0KHRoaXMuZmFpbHVyZVRvRXJyb3IoYWN0aXZhdGlvbi5mYWlsdXJlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc29sdmUodW5kZWZpbmVkKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgdXBkYXRlUmFuZG9tU2VlZChhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVVwZGF0ZVJhbmRvbVNlZWQpOiB2b2lkIHtcbiAgICBpZiAoIWFjdGl2YXRpb24ucmFuZG9tbmVzc1NlZWQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGFjdGl2YXRpb24gd2l0aCByYW5kb21uZXNzU2VlZCBhdHRyaWJ1dGUnKTtcbiAgICB9XG4gICAgdGhpcy5yYW5kb20gPSBhbGVhKGFjdGl2YXRpb24ucmFuZG9tbmVzc1NlZWQudG9CeXRlcygpKTtcbiAgfVxuXG4gIHB1YmxpYyBub3RpZnlIYXNQYXRjaChhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSU5vdGlmeUhhc1BhdGNoKTogdm9pZCB7XG4gICAgaWYgKCFhY3RpdmF0aW9uLnBhdGNoSWQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ05vdGlmeSBoYXMgcGF0Y2ggbWlzc2luZyBwYXRjaCBuYW1lJyk7XG4gICAgfVxuICAgIHRoaXMua25vd25QcmVzZW50UGF0Y2hlcy5hZGQoYWN0aXZhdGlvbi5wYXRjaElkKTtcbiAgfVxuXG4gIHB1YmxpYyBwYXRjaEludGVybmFsKHBhdGNoSWQ6IHN0cmluZywgZGVwcmVjYXRlZDogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLndvcmtmbG93ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcignUGF0Y2hlcyBjYW5ub3QgYmUgdXNlZCBiZWZvcmUgV29ya2Zsb3cgc3RhcnRzJyk7XG4gICAgfVxuICAgIGNvbnN0IHVzZVBhdGNoID0gIXRoaXMuaW5mby51bnNhZmUuaXNSZXBsYXlpbmcgfHwgdGhpcy5rbm93blByZXNlbnRQYXRjaGVzLmhhcyhwYXRjaElkKTtcbiAgICAvLyBBdm9pZCBzZW5kaW5nIGNvbW1hbmRzIGZvciBwYXRjaGVzIGNvcmUgYWxyZWFkeSBrbm93cyBhYm91dC5cbiAgICAvLyBUaGlzIG9wdGltaXphdGlvbiBlbmFibGVzIGRldmVsb3BtZW50IG9mIGF1dG9tYXRpYyBwYXRjaGluZyB0b29scy5cbiAgICBpZiAodXNlUGF0Y2ggJiYgIXRoaXMuc2VudFBhdGNoZXMuaGFzKHBhdGNoSWQpKSB7XG4gICAgICB0aGlzLnB1c2hDb21tYW5kKHtcbiAgICAgICAgc2V0UGF0Y2hNYXJrZXI6IHsgcGF0Y2hJZCwgZGVwcmVjYXRlZCB9LFxuICAgICAgfSk7XG4gICAgICB0aGlzLnNlbnRQYXRjaGVzLmFkZChwYXRjaElkKTtcbiAgICB9XG4gICAgcmV0dXJuIHVzZVBhdGNoO1xuICB9XG5cbiAgLy8gQ2FsbGVkIGVhcmx5IHdoaWxlIGhhbmRsaW5nIGFuIGFjdGl2YXRpb24gdG8gcmVnaXN0ZXIga25vd24gZmxhZ3NcbiAgcHVibGljIGFkZEtub3duRmxhZ3MoZmxhZ3M6IG51bWJlcltdKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBmbGFnIG9mIGZsYWdzKSB7XG4gICAgICBhc3NlcnRWYWxpZEZsYWcoZmxhZyk7XG4gICAgICB0aGlzLmtub3duRmxhZ3MuYWRkKGZsYWcpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBoYXNGbGFnKGZsYWc6IFNka0ZsYWcpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5rbm93bkZsYWdzLmhhcyhmbGFnLmlkKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICghdGhpcy5pbmZvLnVuc2FmZS5pc1JlcGxheWluZyAmJiBmbGFnLmRlZmF1bHQpIHtcbiAgICAgIHRoaXMua25vd25GbGFncy5hZGQoZmxhZy5pZCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHVibGljIHJlbW92ZUZyb21DYWNoZSgpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ3JlbW92ZUZyb21DYWNoZSBhY3RpdmF0aW9uIGpvYiBzaG91bGQgbm90IHJlYWNoIHdvcmtmbG93Jyk7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtcyBmYWlsdXJlcyBpbnRvIGEgY29tbWFuZCB0byBiZSBzZW50IHRvIHRoZSBzZXJ2ZXIuXG4gICAqIFVzZWQgdG8gaGFuZGxlIGFueSBmYWlsdXJlIGVtaXR0ZWQgYnkgdGhlIFdvcmtmbG93LlxuICAgKi9cbiAgYXN5bmMgaGFuZGxlV29ya2Zsb3dGYWlsdXJlKGVycm9yOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuY2FuY2VsbGVkICYmIGlzQ2FuY2VsbGF0aW9uKGVycm9yKSkge1xuICAgICAgdGhpcy5wdXNoQ29tbWFuZCh7IGNhbmNlbFdvcmtmbG93RXhlY3V0aW9uOiB7fSB9LCB0cnVlKTtcbiAgICB9IGVsc2UgaWYgKGVycm9yIGluc3RhbmNlb2YgQ29udGludWVBc05ldykge1xuICAgICAgdGhpcy5wdXNoQ29tbWFuZCh7IGNvbnRpbnVlQXNOZXdXb3JrZmxvd0V4ZWN1dGlvbjogZXJyb3IuY29tbWFuZCB9LCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBUZW1wb3JhbEZhaWx1cmUpKSB7XG4gICAgICAgIC8vIFRoaXMgcmVzdWx0cyBpbiBhbiB1bmhhbmRsZWQgcmVqZWN0aW9uIHdoaWNoIHdpbGwgZmFpbCB0aGUgYWN0aXZhdGlvblxuICAgICAgICAvLyBwcmV2ZW50aW5nIGl0IGZyb20gY29tcGxldGluZy5cbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucHVzaENvbW1hbmQoXG4gICAgICAgIHtcbiAgICAgICAgICBmYWlsV29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgICAgIGZhaWx1cmU6IHRoaXMuZXJyb3JUb0ZhaWx1cmUoZXJyb3IpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHRydWVcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjb21wbGV0ZVF1ZXJ5KHF1ZXJ5SWQ6IHN0cmluZywgcmVzdWx0OiB1bmtub3duKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoQ29tbWFuZCh7XG4gICAgICByZXNwb25kVG9RdWVyeTogeyBxdWVyeUlkLCBzdWNjZWVkZWQ6IHsgcmVzcG9uc2U6IHRoaXMucGF5bG9hZENvbnZlcnRlci50b1BheWxvYWQocmVzdWx0KSB9IH0sXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGZhaWxRdWVyeShxdWVyeUlkOiBzdHJpbmcsIGVycm9yOiB1bmtub3duKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoQ29tbWFuZCh7XG4gICAgICByZXNwb25kVG9RdWVyeToge1xuICAgICAgICBxdWVyeUlkLFxuICAgICAgICBmYWlsZWQ6IHRoaXMuZXJyb3JUb0ZhaWx1cmUoZW5zdXJlVGVtcG9yYWxGYWlsdXJlKGVycm9yKSksXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhY2NlcHRVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hDb21tYW5kKHsgdXBkYXRlUmVzcG9uc2U6IHsgcHJvdG9jb2xJbnN0YW5jZUlkLCBhY2NlcHRlZDoge30gfSB9KTtcbiAgfVxuXG4gIHByaXZhdGUgY29tcGxldGVVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkOiBzdHJpbmcsIHJlc3VsdDogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMucHVzaENvbW1hbmQoe1xuICAgICAgdXBkYXRlUmVzcG9uc2U6IHsgcHJvdG9jb2xJbnN0YW5jZUlkLCBjb21wbGV0ZWQ6IHRoaXMucGF5bG9hZENvbnZlcnRlci50b1BheWxvYWQocmVzdWx0KSB9LFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZWplY3RVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkOiBzdHJpbmcsIGVycm9yOiB1bmtub3duKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoQ29tbWFuZCh7XG4gICAgICB1cGRhdGVSZXNwb25zZToge1xuICAgICAgICBwcm90b2NvbEluc3RhbmNlSWQsXG4gICAgICAgIHJlamVjdGVkOiB0aGlzLmVycm9yVG9GYWlsdXJlKGVuc3VyZVRlbXBvcmFsRmFpbHVyZShlcnJvcikpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBDb25zdW1lIGEgY29tcGxldGlvbiBpZiBpdCBleGlzdHMgaW4gV29ya2Zsb3cgc3RhdGUgKi9cbiAgcHJpdmF0ZSBtYXliZUNvbnN1bWVDb21wbGV0aW9uKHR5cGU6IGtleW9mIEFjdGl2YXRvclsnY29tcGxldGlvbnMnXSwgdGFza1NlcTogbnVtYmVyKTogQ29tcGxldGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgY29tcGxldGlvbiA9IHRoaXMuY29tcGxldGlvbnNbdHlwZV0uZ2V0KHRhc2tTZXEpO1xuICAgIGlmIChjb21wbGV0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuY29tcGxldGlvbnNbdHlwZV0uZGVsZXRlKHRhc2tTZXEpO1xuICAgIH1cbiAgICByZXR1cm4gY29tcGxldGlvbjtcbiAgfVxuXG4gIC8qKiBDb25zdW1lIGEgY29tcGxldGlvbiBpZiBpdCBleGlzdHMgaW4gV29ya2Zsb3cgc3RhdGUsIHRocm93cyBpZiBpdCBkb2Vzbid0ICovXG4gIHByaXZhdGUgY29uc3VtZUNvbXBsZXRpb24odHlwZToga2V5b2YgQWN0aXZhdG9yWydjb21wbGV0aW9ucyddLCB0YXNrU2VxOiBudW1iZXIpOiBDb21wbGV0aW9uIHtcbiAgICBjb25zdCBjb21wbGV0aW9uID0gdGhpcy5tYXliZUNvbnN1bWVDb21wbGV0aW9uKHR5cGUsIHRhc2tTZXEpO1xuICAgIGlmIChjb21wbGV0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcihgTm8gY29tcGxldGlvbiBmb3IgdGFza1NlcSAke3Rhc2tTZXF9YCk7XG4gICAgfVxuICAgIHJldHVybiBjb21wbGV0aW9uO1xuICB9XG5cbiAgcHJpdmF0ZSBjb21wbGV0ZVdvcmtmbG93KHJlc3VsdDogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMucHVzaENvbW1hbmQoXG4gICAgICB7XG4gICAgICAgIGNvbXBsZXRlV29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgICByZXN1bHQ6IHRoaXMucGF5bG9hZENvbnZlcnRlci50b1BheWxvYWQocmVzdWx0KSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB0cnVlXG4gICAgKTtcbiAgfVxuXG4gIGVycm9yVG9GYWlsdXJlKGVycjogdW5rbm93bik6IFByb3RvRmFpbHVyZSB7XG4gICAgcmV0dXJuIHRoaXMuZmFpbHVyZUNvbnZlcnRlci5lcnJvclRvRmFpbHVyZShlcnIsIHRoaXMucGF5bG9hZENvbnZlcnRlcik7XG4gIH1cblxuICBmYWlsdXJlVG9FcnJvcihmYWlsdXJlOiBQcm90b0ZhaWx1cmUpOiBFcnJvciB7XG4gICAgcmV0dXJuIHRoaXMuZmFpbHVyZUNvbnZlcnRlci5mYWlsdXJlVG9FcnJvcihmYWlsdXJlLCB0aGlzLnBheWxvYWRDb252ZXJ0ZXIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFNlcTxUIGV4dGVuZHMgeyBzZXE/OiBudW1iZXIgfCBudWxsIH0+KGFjdGl2YXRpb246IFQpOiBudW1iZXIge1xuICBjb25zdCBzZXEgPSBhY3RpdmF0aW9uLnNlcTtcbiAgaWYgKHNlcSA9PT0gdW5kZWZpbmVkIHx8IHNlcSA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEdvdCBhY3RpdmF0aW9uIHdpdGggbm8gc2VxIGF0dHJpYnV0ZWApO1xuICB9XG4gIHJldHVybiBzZXE7XG59XG4iLCJpbXBvcnQgeyBjb21wb3NlSW50ZXJjZXB0b3JzIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHsgU2RrQ29tcG9uZW50IH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IHVudHJhY2tQcm9taXNlIH0gZnJvbSAnLi9zdGFjay1oZWxwZXJzJztcbmltcG9ydCB7IHR5cGUgU2luaywgdHlwZSBTaW5rcywgcHJveHlTaW5rcyB9IGZyb20gJy4vc2lua3MnO1xuaW1wb3J0IHsgaXNDYW5jZWxsYXRpb24gfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQgeyBXb3JrZmxvd0luZm8sIENvbnRpbnVlQXNOZXcgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQgfSBmcm9tICcuL2dsb2JhbC1hdHRyaWJ1dGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0xvZ2dlciBleHRlbmRzIFNpbmsge1xuICB0cmFjZShtZXNzYWdlOiBzdHJpbmcsIGF0dHJzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkO1xuICBkZWJ1ZyhtZXNzYWdlOiBzdHJpbmcsIGF0dHJzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkO1xuICBpbmZvKG1lc3NhZ2U6IHN0cmluZywgYXR0cnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQ7XG4gIHdhcm4obWVzc2FnZTogc3RyaW5nLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZDtcbiAgZXJyb3IobWVzc2FnZTogc3RyaW5nLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZDtcbn1cblxuLyoqXG4gKiBTaW5rIGludGVyZmFjZSBmb3IgZm9yd2FyZGluZyBsb2dzIGZyb20gdGhlIFdvcmtmbG93IHNhbmRib3ggdG8gdGhlIFdvcmtlclxuICpcbiAqIEBkZXByZWNhdGVkIERvIG5vdCB1c2UgTG9nZ2VyU2lua3MgZGlyZWN0bHkuIFRvIGxvZyBmcm9tIFdvcmtmbG93IGNvZGUsIHVzZSB0aGUgYGxvZ2Agb2JqZWN0XG4gKiAgICAgICAgICAgICBleHBvcnRlZCBieSB0aGUgYEB0ZW1wb3JhbGlvL3dvcmtmbG93YCBwYWNrYWdlLiBUbyBjYXB0dXJlIGxvZyBtZXNzYWdlcyBlbWl0dGVkXG4gKiAgICAgICAgICAgICBieSBXb3JrZmxvdyBjb2RlLCBzZXQgdGhlIHtAbGluayBSdW50aW1lLmxvZ2dlcn0gcHJvcGVydHkuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyU2lua3NEZXByZWNhdGVkIGV4dGVuZHMgU2lua3Mge1xuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgRG8gbm90IHVzZSBMb2dnZXJTaW5rcyBkaXJlY3RseS4gVG8gbG9nIGZyb20gV29ya2Zsb3cgY29kZSwgdXNlIHRoZSBgbG9nYCBvYmplY3RcbiAgICogICAgICAgICAgICAgZXhwb3J0ZWQgYnkgdGhlIGBAdGVtcG9yYWxpby93b3JrZmxvd2AgcGFja2FnZS4gVG8gY2FwdHVyZSBsb2cgbWVzc2FnZXMgZW1pdHRlZFxuICAgKiAgICAgICAgICAgICBieSBXb3JrZmxvdyBjb2RlLCBzZXQgdGhlIHtAbGluayBSdW50aW1lLmxvZ2dlcn0gcHJvcGVydHkuXG4gICAqL1xuICBkZWZhdWx0V29ya2VyTG9nZ2VyOiBXb3JrZmxvd0xvZ2dlcjtcbn1cblxuLyoqXG4gKiBTaW5rIGludGVyZmFjZSBmb3IgZm9yd2FyZGluZyBsb2dzIGZyb20gdGhlIFdvcmtmbG93IHNhbmRib3ggdG8gdGhlIFdvcmtlclxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvZ2dlclNpbmtzSW50ZXJuYWwgZXh0ZW5kcyBTaW5rcyB7XG4gIF9fdGVtcG9yYWxfbG9nZ2VyOiBXb3JrZmxvd0xvZ2dlcjtcbn1cblxuY29uc3QgbG9nZ2VyU2luayA9IHByb3h5U2lua3M8TG9nZ2VyU2lua3NJbnRlcm5hbD4oKS5fX3RlbXBvcmFsX2xvZ2dlcjtcblxuLyoqXG4gKiBTeW1ib2wgdXNlZCBieSB0aGUgU0RLIGxvZ2dlciB0byBleHRyYWN0IGEgdGltZXN0YW1wIGZyb20gbG9nIGF0dHJpYnV0ZXMuXG4gKiBBbHNvIGRlZmluZWQgaW4gYHdvcmtlci9sb2dnZXIudHNgIC0gaW50ZW50aW9uYWxseSBub3Qgc2hhcmVkLlxuICovXG5jb25zdCBMb2dUaW1lc3RhbXAgPSBTeW1ib2wuZm9yKCdsb2dfdGltZXN0YW1wJyk7XG5cbi8qKlxuICogRGVmYXVsdCB3b3JrZmxvdyBsb2dnZXIuXG4gKlxuICogVGhpcyBsb2dnZXIgaXMgcmVwbGF5LWF3YXJlIGFuZCB3aWxsIG9taXQgbG9nIG1lc3NhZ2VzIG9uIHdvcmtmbG93IHJlcGxheS4gTWVzc2FnZXMgZW1pdHRlZCBieSB0aGlzIGxvZ2dlciBhcmVcbiAqIGZ1bm5lbGxlZCB0aHJvdWdoIGEgc2luayB0aGF0IGZvcndhcmRzIHRoZW0gdG8gdGhlIGxvZ2dlciByZWdpc3RlcmVkIG9uIHtAbGluayBSdW50aW1lLmxvZ2dlcn0uXG4gKlxuICogQXR0cmlidXRlcyBmcm9tIHRoZSBjdXJyZW50IFdvcmtmbG93IEV4ZWN1dGlvbiBjb250ZXh0IGFyZSBhdXRvbWF0aWNhbGx5IGluY2x1ZGVkIGFzIG1ldGFkYXRhIG9uIGV2ZXJ5IGxvZ1xuICogZW50cmllcy4gQW4gZXh0cmEgYHNka0NvbXBvbmVudGAgbWV0YWRhdGEgYXR0cmlidXRlIGlzIGFsc28gYWRkZWQsIHdpdGggdmFsdWUgYHdvcmtmbG93YDsgdGhpcyBjYW4gYmUgdXNlZCBmb3JcbiAqIGZpbmUtZ3JhaW5lZCBmaWx0ZXJpbmcgb2YgbG9nIGVudHJpZXMgZnVydGhlciBkb3duc3RyZWFtLlxuICpcbiAqIFRvIGN1c3RvbWl6ZSBsb2cgYXR0cmlidXRlcywgcmVnaXN0ZXIgYSB7QGxpbmsgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3J9IHRoYXQgaW50ZXJjZXB0cyB0aGVcbiAqIGBnZXRMb2dBdHRyaWJ1dGVzKClgIG1ldGhvZC5cbiAqXG4gKiBOb3RpY2UgdGhhdCBzaW5jZSBzaW5rcyBhcmUgdXNlZCB0byBwb3dlciB0aGlzIGxvZ2dlciwgYW55IGxvZyBhdHRyaWJ1dGVzIG11c3QgYmUgdHJhbnNmZXJhYmxlIHZpYSB0aGVcbiAqIHtAbGluayBodHRwczovL25vZGVqcy5vcmcvYXBpL3dvcmtlcl90aHJlYWRzLmh0bWwjd29ya2VyX3RocmVhZHNfcG9ydF9wb3N0bWVzc2FnZV92YWx1ZV90cmFuc2Zlcmxpc3QgfCBwb3N0TWVzc2FnZX1cbiAqIEFQSS5cbiAqXG4gKiBOT1RFOiBTcGVjaWZ5aW5nIGEgY3VzdG9tIGxvZ2dlciB0aHJvdWdoIHtAbGluayBkZWZhdWx0U2lua30gb3IgYnkgbWFudWFsbHkgcmVnaXN0ZXJpbmcgYSBzaW5rIG5hbWVkXG4gKiBgZGVmYXVsdFdvcmtlckxvZ2dlcmAgaGFzIGJlZW4gZGVwcmVjYXRlZC4gUGxlYXNlIHVzZSB7QGxpbmsgUnVudGltZS5sb2dnZXJ9IGluc3RlYWQuXG4gKi9cbmV4cG9ydCBjb25zdCBsb2c6IFdvcmtmbG93TG9nZ2VyID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAoWyd0cmFjZScsICdkZWJ1ZycsICdpbmZvJywgJ3dhcm4nLCAnZXJyb3InXSBhcyBBcnJheTxrZXlvZiBXb3JrZmxvd0xvZ2dlcj4pLm1hcCgobGV2ZWwpID0+IHtcbiAgICByZXR1cm4gW1xuICAgICAgbGV2ZWwsXG4gICAgICAobWVzc2FnZTogc3RyaW5nLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiB7XG4gICAgICAgIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy5sb2coLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gd29ya2Zsb3cgY29udGV4dC4nKTtcbiAgICAgICAgY29uc3QgZ2V0TG9nQXR0cmlidXRlcyA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCwgJ2dldExvZ0F0dHJpYnV0ZXMnLCAoYSkgPT4gYSk7XG4gICAgICAgIHJldHVybiBsb2dnZXJTaW5rW2xldmVsXShtZXNzYWdlLCB7XG4gICAgICAgICAgLy8gSW5qZWN0IHRoZSBjYWxsIHRpbWUgaW4gbmFub3NlY29uZCByZXNvbHV0aW9uIGFzIGV4cGVjdGVkIGJ5IHRoZSB3b3JrZXIgbG9nZ2VyLlxuICAgICAgICAgIFtMb2dUaW1lc3RhbXBdOiBhY3RpdmF0b3IuZ2V0VGltZU9mRGF5KCksXG4gICAgICAgICAgc2RrQ29tcG9uZW50OiBTZGtDb21wb25lbnQud29ya2Zsb3csXG4gICAgICAgICAgLi4uZ2V0TG9nQXR0cmlidXRlcyh3b3JrZmxvd0xvZ0F0dHJpYnV0ZXMoYWN0aXZhdG9yLmluZm8pKSxcbiAgICAgICAgICAuLi5hdHRycyxcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIF07XG4gIH0pXG4pIGFzIGFueTtcblxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWN1dGVXaXRoTGlmZWN5Y2xlTG9nZ2luZyhmbjogKCkgPT4gUHJvbWlzZTx1bmtub3duPik6IFByb21pc2U8dW5rbm93bj4ge1xuICBsb2cuZGVidWcoJ1dvcmtmbG93IHN0YXJ0ZWQnLCB7IHNka0NvbXBvbmVudDogU2RrQ29tcG9uZW50LndvcmtlciB9KTtcbiAgY29uc3QgcCA9IGZuKCkudGhlbihcbiAgICAocmVzKSA9PiB7XG4gICAgICBsb2cuZGVidWcoJ1dvcmtmbG93IGNvbXBsZXRlZCcsIHsgc2RrQ29tcG9uZW50OiBTZGtDb21wb25lbnQud29ya2VyIH0pO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9LFxuICAgIChlcnJvcikgPT4ge1xuICAgICAgLy8gQXZvaWQgdXNpbmcgaW5zdGFuY2VvZiBjaGVja3MgaW4gY2FzZSB0aGUgbW9kdWxlcyB0aGV5J3JlIGRlZmluZWQgaW4gbG9hZGVkIG1vcmUgdGhhbiBvbmNlLFxuICAgICAgLy8gZS5nLiBieSBqZXN0IG9yIHdoZW4gbXVsdGlwbGUgdmVyc2lvbnMgYXJlIGluc3RhbGxlZC5cbiAgICAgIGlmICh0eXBlb2YgZXJyb3IgPT09ICdvYmplY3QnICYmIGVycm9yICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGlzQ2FuY2VsbGF0aW9uKGVycm9yKSkge1xuICAgICAgICAgIGxvZy5kZWJ1ZygnV29ya2Zsb3cgY29tcGxldGVkIGFzIGNhbmNlbGxlZCcsIHsgc2RrQ29tcG9uZW50OiBTZGtDb21wb25lbnQud29ya2VyIH0pO1xuICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9IGVsc2UgaWYgKGVycm9yIGluc3RhbmNlb2YgQ29udGludWVBc05ldykge1xuICAgICAgICAgIGxvZy5kZWJ1ZygnV29ya2Zsb3cgY29udGludWVkIGFzIG5ldycsIHsgc2RrQ29tcG9uZW50OiBTZGtDb21wb25lbnQud29ya2VyIH0pO1xuICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsb2cud2FybignV29ya2Zsb3cgZmFpbGVkJywgeyBlcnJvciwgc2RrQ29tcG9uZW50OiBTZGtDb21wb25lbnQud29ya2VyIH0pO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICApO1xuICAvLyBBdm9pZCBzaG93aW5nIHRoaXMgaW50ZXJjZXB0b3IgaW4gc3RhY2sgdHJhY2UgcXVlcnlcbiAgdW50cmFja1Byb21pc2UocCk7XG4gIHJldHVybiBwO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBtYXAgb2YgYXR0cmlidXRlcyB0byBiZSBzZXQgX2J5IGRlZmF1bHRfIG9uIGxvZyBtZXNzYWdlcyBmb3IgYSBnaXZlbiBXb3JrZmxvdy5cbiAqIE5vdGUgdGhhdCB0aGlzIGZ1bmN0aW9uIG1heSBiZSBjYWxsZWQgZnJvbSBvdXRzaWRlIG9mIHRoZSBXb3JrZmxvdyBjb250ZXh0IChlZy4gYnkgdGhlIHdvcmtlciBpdHNlbGYpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gd29ya2Zsb3dMb2dBdHRyaWJ1dGVzKGluZm86IFdvcmtmbG93SW5mbyk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lc3BhY2U6IGluZm8ubmFtZXNwYWNlLFxuICAgIHRhc2tRdWV1ZTogaW5mby50YXNrUXVldWUsXG4gICAgd29ya2Zsb3dJZDogaW5mby53b3JrZmxvd0lkLFxuICAgIHJ1bklkOiBpbmZvLnJ1bklkLFxuICAgIHdvcmtmbG93VHlwZTogaW5mby53b3JrZmxvd1R5cGUsXG4gIH07XG59XG4iLCIvLyAuLi9wYWNrYWdlLmpzb24gaXMgb3V0c2lkZSBvZiB0aGUgVFMgcHJvamVjdCByb290RGlyIHdoaWNoIGNhdXNlcyBUUyB0byBjb21wbGFpbiBhYm91dCB0aGlzIGltcG9ydC5cbi8vIFdlIGRvIG5vdCB3YW50IHRvIGNoYW5nZSB0aGUgcm9vdERpciBiZWNhdXNlIGl0IG1lc3NlcyB1cCB0aGUgb3V0cHV0IHN0cnVjdHVyZS5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCBwa2cgZnJvbSAnLi4vcGFja2FnZS5qc29uJztcblxuZXhwb3J0IGRlZmF1bHQgcGtnIGFzIHsgbmFtZTogc3RyaW5nOyB2ZXJzaW9uOiBzdHJpbmcgfTtcbiIsIi8qKlxuICogVHlwZSBkZWZpbml0aW9ucyBmb3IgdGhlIFdvcmtmbG93IGVuZCBvZiB0aGUgc2lua3MgbWVjaGFuaXNtLlxuICpcbiAqIFNpbmtzIGFyZSBhIG1lY2hhbmlzbSBmb3IgZXhwb3J0aW5nIGRhdGEgZnJvbSB0aGUgV29ya2Zsb3cgaXNvbGF0ZSB0byB0aGVcbiAqIE5vZGUuanMgZW52aXJvbm1lbnQsIHRoZXkgYXJlIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZSBXb3JrZmxvdyBoYXMgbm8gd2F5IHRvXG4gKiBjb21tdW5pY2F0ZSB3aXRoIHRoZSBvdXRzaWRlIFdvcmxkLlxuICpcbiAqIFNpbmtzIGFyZSB0eXBpY2FsbHkgdXNlZCBmb3IgZXhwb3J0aW5nIGxvZ3MsIG1ldHJpY3MgYW5kIHRyYWNlcyBvdXQgZnJvbSB0aGVcbiAqIFdvcmtmbG93LlxuICpcbiAqIFNpbmsgZnVuY3Rpb25zIG1heSBub3QgcmV0dXJuIHZhbHVlcyB0byB0aGUgV29ya2Zsb3cgaW4gb3JkZXIgdG8gcHJldmVudFxuICogYnJlYWtpbmcgZGV0ZXJtaW5pc20uXG4gKlxuICogQG1vZHVsZVxuICovXG5cbmltcG9ydCB7IFdvcmtmbG93SW5mbyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBhc3NlcnRJbldvcmtmbG93Q29udGV4dCB9IGZyb20gJy4vZ2xvYmFsLWF0dHJpYnV0ZXMnO1xuXG4vKipcbiAqIEFueSBmdW5jdGlvbiBzaWduYXR1cmUgY2FuIGJlIHVzZWQgZm9yIFNpbmsgZnVuY3Rpb25zIGFzIGxvbmcgYXMgdGhlIHJldHVybiB0eXBlIGlzIGB2b2lkYC5cbiAqXG4gKiBXaGVuIGNhbGxpbmcgYSBTaW5rIGZ1bmN0aW9uLCBhcmd1bWVudHMgYXJlIGNvcGllZCBmcm9tIHRoZSBXb3JrZmxvdyBpc29sYXRlIHRvIHRoZSBOb2RlLmpzIGVudmlyb25tZW50IHVzaW5nXG4gKiB7QGxpbmsgaHR0cHM6Ly9ub2RlanMub3JnL2FwaS93b3JrZXJfdGhyZWFkcy5odG1sI3dvcmtlcl90aHJlYWRzX3BvcnRfcG9zdG1lc3NhZ2VfdmFsdWVfdHJhbnNmZXJsaXN0IHwgcG9zdE1lc3NhZ2V9LlxuXG4gKiBUaGlzIGNvbnN0cmFpbnMgdGhlIGFyZ3VtZW50IHR5cGVzIHRvIHByaW1pdGl2ZXMgKGV4Y2x1ZGluZyBTeW1ib2xzKS5cbiAqL1xuZXhwb3J0IHR5cGUgU2lua0Z1bmN0aW9uID0gKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkO1xuXG4vKiogQSBtYXBwaW5nIG9mIG5hbWUgdG8gZnVuY3Rpb24sIGRlZmluZXMgYSBzaW5nbGUgc2luayAoZS5nLiBsb2dnZXIpICovXG5leHBvcnQgdHlwZSBTaW5rID0gUmVjb3JkPHN0cmluZywgU2lua0Z1bmN0aW9uPjtcbi8qKlxuICogV29ya2Zsb3cgU2luayBhcmUgYSBtYXBwaW5nIG9mIG5hbWUgdG8ge0BsaW5rIFNpbmt9XG4gKi9cbmV4cG9ydCB0eXBlIFNpbmtzID0gUmVjb3JkPHN0cmluZywgU2luaz47XG5cbi8qKlxuICogQ2FsbCBpbmZvcm1hdGlvbiBmb3IgYSBTaW5rXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2lua0NhbGwge1xuICBpZmFjZU5hbWU6IHN0cmluZztcbiAgZm5OYW1lOiBzdHJpbmc7XG4gIGFyZ3M6IGFueVtdO1xuICB3b3JrZmxvd0luZm86IFdvcmtmbG93SW5mbztcbn1cblxuLyoqXG4gKiBHZXQgYSByZWZlcmVuY2UgdG8gU2lua3MgZm9yIGV4cG9ydGluZyBkYXRhIG91dCBvZiB0aGUgV29ya2Zsb3cuXG4gKlxuICogVGhlc2UgU2lua3MgKiptdXN0KiogYmUgcmVnaXN0ZXJlZCB3aXRoIHRoZSBXb3JrZXIgaW4gb3JkZXIgZm9yIHRoaXNcbiAqIG1lY2hhbmlzbSB0byB3b3JrLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcHJveHlTaW5rcywgU2lua3MgfSBmcm9tICdAdGVtcG9yYWxpby93b3JrZmxvdyc7XG4gKlxuICogaW50ZXJmYWNlIE15U2lua3MgZXh0ZW5kcyBTaW5rcyB7XG4gKiAgIGxvZ2dlcjoge1xuICogICAgIGluZm8obWVzc2FnZTogc3RyaW5nKTogdm9pZDtcbiAqICAgICBlcnJvcihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkO1xuICogICB9O1xuICogfVxuICpcbiAqIGNvbnN0IHsgbG9nZ2VyIH0gPSBwcm94eVNpbmtzPE15RGVwZW5kZW5jaWVzPigpO1xuICogbG9nZ2VyLmluZm8oJ3NldHRpbmcgdXAnKTtcbiAqXG4gKiBleHBvcnQgZnVuY3Rpb24gbXlXb3JrZmxvdygpIHtcbiAqICAgcmV0dXJuIHtcbiAqICAgICBhc3luYyBleGVjdXRlKCkge1xuICogICAgICAgbG9nZ2VyLmluZm8oXCJoZXkgaG9cIik7XG4gKiAgICAgICBsb2dnZXIuZXJyb3IoXCJsZXRzIGdvXCIpO1xuICogICAgIH1cbiAqICAgfTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJveHlTaW5rczxUIGV4dGVuZHMgU2lua3M+KCk6IFQge1xuICByZXR1cm4gbmV3IFByb3h5KFxuICAgIHt9LFxuICAgIHtcbiAgICAgIGdldChfLCBpZmFjZU5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eShcbiAgICAgICAgICB7fSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBnZXQoXywgZm5OYW1lKSB7XG4gICAgICAgICAgICAgIHJldHVybiAoLi4uYXJnczogYW55W10pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAgICAgICAgICAgICAgICdQcm94aWVkIHNpbmtzIGZ1bmN0aW9ucyBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYWN0aXZhdG9yLnNpbmtDYWxscy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgIGlmYWNlTmFtZTogaWZhY2VOYW1lIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICAgIGZuTmFtZTogZm5OYW1lIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICAgIC8vIFNpbmsgZnVuY3Rpb24gZG9lc24ndCBnZXQgY2FsbGVkIGltbWVkaWF0ZWx5LiBNYWtlIGEgY2xvbmUgb2YgdGhlIHNpbmsncyBhcmdzLCBzbyB0aGF0IGZ1cnRoZXIgbXV0YXRpb25zXG4gICAgICAgICAgICAgICAgICAvLyB0byB0aGVzZSBvYmplY3RzIGRvbid0IGNvcnJ1cHQgdGhlIGFyZ3MgdGhhdCB0aGUgc2luayBmdW5jdGlvbiB3aWxsIHJlY2VpdmUuIE9ubHkgYXZhaWxhYmxlIGZyb20gbm9kZSAxNy5cbiAgICAgICAgICAgICAgICAgIGFyZ3M6IChnbG9iYWxUaGlzIGFzIGFueSkuc3RydWN0dXJlZENsb25lID8gKGdsb2JhbFRoaXMgYXMgYW55KS5zdHJ1Y3R1cmVkQ2xvbmUoYXJncykgOiBhcmdzLFxuICAgICAgICAgICAgICAgICAgLy8gYWN0aXZhdG9yLmluZm8gaXMgaW50ZXJuYWxseSBjb3B5LW9uLXdyaXRlLiBUaGlzIGVuc3VyZSB0aGF0IGFueSBmdXJ0aGVyIG11dGF0aW9uc1xuICAgICAgICAgICAgICAgICAgLy8gdG8gdGhlIHdvcmtmbG93IHN0YXRlIGluIHRoZSBjb250ZXh0IG9mIHRoZSBwcmVzZW50IGFjdGl2YXRpb24gd2lsbCBub3QgY29ycnVwdCB0aGVcbiAgICAgICAgICAgICAgICAgIC8vIHdvcmtmbG93SW5mbyBzdGF0ZSB0aGF0IGdldHMgcGFzc2VkIHdoZW4gdGhlIHNpbmsgZnVuY3Rpb24gYWN0dWFsbHkgZ2V0cyBjYWxsZWQuXG4gICAgICAgICAgICAgICAgICB3b3JrZmxvd0luZm86IGFjdGl2YXRvci5pbmZvLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9LFxuICAgIH1cbiAgKSBhcyBhbnk7XG59XG4iLCJpbXBvcnQgeyBtYXliZUdldEFjdGl2YXRvclVudHlwZWQgfSBmcm9tICcuL2dsb2JhbC1hdHRyaWJ1dGVzJztcbmltcG9ydCB0eXBlIHsgUHJvbWlzZVN0YWNrU3RvcmUgfSBmcm9tICcuL2ludGVybmFscyc7XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIHJlbW92ZSBhIHByb21pc2UgZnJvbSBiZWluZyB0cmFja2VkIGZvciBzdGFjayB0cmFjZSBxdWVyeSBwdXJwb3Nlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdW50cmFja1Byb21pc2UocHJvbWlzZTogUHJvbWlzZTx1bmtub3duPik6IHZvaWQge1xuICBjb25zdCBzdG9yZSA9IChtYXliZUdldEFjdGl2YXRvclVudHlwZWQoKSBhcyBhbnkpPy5wcm9taXNlU3RhY2tTdG9yZSBhcyBQcm9taXNlU3RhY2tTdG9yZSB8IHVuZGVmaW5lZDtcbiAgaWYgKCFzdG9yZSkgcmV0dXJuO1xuICBzdG9yZS5jaGlsZFRvUGFyZW50LmRlbGV0ZShwcm9taXNlKTtcbiAgc3RvcmUucHJvbWlzZVRvU3RhY2suZGVsZXRlKHByb21pc2UpO1xufVxuIiwiaW1wb3J0IHsgQ2FuY2VsbGF0aW9uU2NvcGUgfSBmcm9tICcuL2NhbmNlbGxhdGlvbi1zY29wZSc7XG5pbXBvcnQgeyB1bnRyYWNrUHJvbWlzZSB9IGZyb20gJy4vc3RhY2staGVscGVycyc7XG5cbi8qKlxuICogQSBgUHJvbWlzZUxpa2VgIGhlbHBlciB3aGljaCBleHBvc2VzIGl0cyBgcmVzb2x2ZWAgYW5kIGByZWplY3RgIG1ldGhvZHMuXG4gKlxuICogVHJpZ2dlciBpcyBDYW5jZWxsYXRpb25TY29wZS1hd2FyZTogaXQgaXMgbGlua2VkIHRvIHRoZSBjdXJyZW50IHNjb3BlIG9uXG4gKiBjb25zdHJ1Y3Rpb24gYW5kIHRocm93cyB3aGVuIHRoYXQgc2NvcGUgaXMgY2FuY2VsbGVkLlxuICpcbiAqIFVzZWZ1bCBmb3IgZS5nLiB3YWl0aW5nIGZvciB1bmJsb2NraW5nIGEgV29ya2Zsb3cgZnJvbSBhIFNpZ25hbC5cbiAqXG4gKiBAZXhhbXBsZVxuICogPCEtLVNOSVBTVEFSVCB0eXBlc2NyaXB0LXRyaWdnZXItd29ya2Zsb3ctLT5cbiAqIDwhLS1TTklQRU5ELS0+XG4gKi9cbmV4cG9ydCBjbGFzcyBUcmlnZ2VyPFQ+IGltcGxlbWVudHMgUHJvbWlzZUxpa2U8VD4ge1xuICAvLyBUeXBlc2NyaXB0IGRvZXMgbm90IHJlYWxpemUgdGhhdCB0aGUgcHJvbWlzZSBleGVjdXRvciBpcyBydW4gc3luY2hyb25vdXNseSBpbiB0aGUgY29uc3RydWN0b3JcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAvLyBAdHMtaWdub3JlXG4gIHB1YmxpYyByZWFkb25seSByZXNvbHZlOiAodmFsdWU6IFQgfCBQcm9taXNlTGlrZTxUPikgPT4gdm9pZDtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAvLyBAdHMtaWdub3JlXG4gIHB1YmxpYyByZWFkb25seSByZWplY3Q6IChyZWFzb24/OiBhbnkpID0+IHZvaWQ7XG4gIHByb3RlY3RlZCByZWFkb25seSBwcm9taXNlOiBQcm9taXNlPFQ+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIH1cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICB0aGlzLnJlamVjdCA9IHJlamVjdDtcbiAgICB9KTtcbiAgICAvLyBBdm9pZCB1bmhhbmRsZWQgcmVqZWN0aW9uc1xuICAgIHVudHJhY2tQcm9taXNlKHRoaXMucHJvbWlzZS5jYXRjaCgoKSA9PiB1bmRlZmluZWQpKTtcbiAgfVxuXG4gIHRoZW48VFJlc3VsdDEgPSBULCBUUmVzdWx0MiA9IG5ldmVyPihcbiAgICBvbmZ1bGZpbGxlZD86ICgodmFsdWU6IFQpID0+IFRSZXN1bHQxIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDE+KSB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgb25yZWplY3RlZD86ICgocmVhc29uOiBhbnkpID0+IFRSZXN1bHQyIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDI+KSB8IHVuZGVmaW5lZCB8IG51bGxcbiAgKTogUHJvbWlzZUxpa2U8VFJlc3VsdDEgfCBUUmVzdWx0Mj4ge1xuICAgIHJldHVybiB0aGlzLnByb21pc2UudGhlbihvbmZ1bGZpbGxlZCwgb25yZWplY3RlZCk7XG4gIH1cbn1cbiIsIi8qKlxuICogRXhwb3J0ZWQgZnVuY3Rpb25zIGZvciB0aGUgV29ya2VyIHRvIGludGVyYWN0IHdpdGggdGhlIFdvcmtmbG93IGlzb2xhdGVcbiAqXG4gKiBAbW9kdWxlXG4gKi9cbmltcG9ydCB7IElsbGVnYWxTdGF0ZUVycm9yIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IHRzVG9NcyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvdGltZSc7XG5pbXBvcnQgeyBjb21wb3NlSW50ZXJjZXB0b3JzIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHsgY29yZXNkayB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IGRpc2FibGVTdG9yYWdlIH0gZnJvbSAnLi9jYW5jZWxsYXRpb24tc2NvcGUnO1xuaW1wb3J0IHsgV29ya2Zsb3dJbnRlcmNlcHRvcnNGYWN0b3J5IH0gZnJvbSAnLi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHsgV29ya2Zsb3dDcmVhdGVPcHRpb25zSW50ZXJuYWwgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQWN0aXZhdG9yIH0gZnJvbSAnLi9pbnRlcm5hbHMnO1xuaW1wb3J0IHsgc2V0QWN0aXZhdG9yVW50eXBlZCwgZ2V0QWN0aXZhdG9yIH0gZnJvbSAnLi9nbG9iYWwtYXR0cmlidXRlcyc7XG5pbXBvcnQgeyB0eXBlIFNpbmtDYWxsIH0gZnJvbSAnLi9zaW5rcyc7XG5cbi8vIEV4cG9ydCB0aGUgdHlwZSBmb3IgdXNlIG9uIHRoZSBcIndvcmtlclwiIHNpZGVcbmV4cG9ydCB7IFByb21pc2VTdGFja1N0b3JlIH0gZnJvbSAnLi9pbnRlcm5hbHMnO1xuXG5jb25zdCBnbG9iYWwgPSBnbG9iYWxUaGlzIGFzIGFueTtcbmNvbnN0IE9yaWdpbmFsRGF0ZSA9IGdsb2JhbFRoaXMuRGF0ZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSBpc29sYXRlIHJ1bnRpbWUuXG4gKlxuICogU2V0cyByZXF1aXJlZCBpbnRlcm5hbCBzdGF0ZSBhbmQgaW5zdGFudGlhdGVzIHRoZSB3b3JrZmxvdyBhbmQgaW50ZXJjZXB0b3JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5pdFJ1bnRpbWUob3B0aW9uczogV29ya2Zsb3dDcmVhdGVPcHRpb25zSW50ZXJuYWwpOiB2b2lkIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gbmV3IEFjdGl2YXRvcih7XG4gICAgLi4ub3B0aW9ucyxcbiAgICBpbmZvOiBmaXhQcm90b3R5cGVzKHtcbiAgICAgIC4uLm9wdGlvbnMuaW5mbyxcbiAgICAgIHVuc2FmZTogeyAuLi5vcHRpb25zLmluZm8udW5zYWZlLCBub3c6IE9yaWdpbmFsRGF0ZS5ub3cgfSxcbiAgICB9KSxcbiAgfSk7XG4gIC8vIFRoZXJlJ3Mgb24gYWN0aXZhdG9yIHBlciB3b3JrZmxvdyBpbnN0YW5jZSwgc2V0IGl0IGdsb2JhbGx5IG9uIHRoZSBjb250ZXh0LlxuICAvLyBXZSBkbyB0aGlzIGJlZm9yZSBpbXBvcnRpbmcgYW55IHVzZXIgY29kZSBzbyB1c2VyIGNvZGUgY2FuIHN0YXRpY2FsbHkgcmVmZXJlbmNlIEB0ZW1wb3JhbGlvL3dvcmtmbG93IGZ1bmN0aW9uc1xuICAvLyBhcyB3ZWxsIGFzIERhdGUgYW5kIE1hdGgucmFuZG9tLlxuICBzZXRBY3RpdmF0b3JVbnR5cGVkKGFjdGl2YXRvcik7XG5cbiAgLy8gd2VicGFjayBhbGlhcyB0byBwYXlsb2FkQ29udmVydGVyUGF0aFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuICBjb25zdCBjdXN0b21QYXlsb2FkQ29udmVydGVyID0gcmVxdWlyZSgnX190ZW1wb3JhbF9jdXN0b21fcGF5bG9hZF9jb252ZXJ0ZXInKS5wYXlsb2FkQ29udmVydGVyO1xuICAvLyBUaGUgYHBheWxvYWRDb252ZXJ0ZXJgIGV4cG9ydCBpcyB2YWxpZGF0ZWQgaW4gdGhlIFdvcmtlclxuICBpZiAoY3VzdG9tUGF5bG9hZENvbnZlcnRlciAhPSBudWxsKSB7XG4gICAgYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIgPSBjdXN0b21QYXlsb2FkQ29udmVydGVyO1xuICB9XG4gIC8vIHdlYnBhY2sgYWxpYXMgdG8gZmFpbHVyZUNvbnZlcnRlclBhdGhcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcbiAgY29uc3QgY3VzdG9tRmFpbHVyZUNvbnZlcnRlciA9IHJlcXVpcmUoJ19fdGVtcG9yYWxfY3VzdG9tX2ZhaWx1cmVfY29udmVydGVyJykuZmFpbHVyZUNvbnZlcnRlcjtcbiAgLy8gVGhlIGBmYWlsdXJlQ29udmVydGVyYCBleHBvcnQgaXMgdmFsaWRhdGVkIGluIHRoZSBXb3JrZXJcbiAgaWYgKGN1c3RvbUZhaWx1cmVDb252ZXJ0ZXIgIT0gbnVsbCkge1xuICAgIGFjdGl2YXRvci5mYWlsdXJlQ29udmVydGVyID0gY3VzdG9tRmFpbHVyZUNvbnZlcnRlcjtcbiAgfVxuXG4gIGNvbnN0IHsgaW1wb3J0V29ya2Zsb3dzLCBpbXBvcnRJbnRlcmNlcHRvcnMgfSA9IGdsb2JhbC5fX1RFTVBPUkFMX187XG4gIGlmIChpbXBvcnRXb3JrZmxvd3MgPT09IHVuZGVmaW5lZCB8fCBpbXBvcnRJbnRlcmNlcHRvcnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcignV29ya2Zsb3cgYnVuZGxlIGRpZCBub3QgcmVnaXN0ZXIgaW1wb3J0IGhvb2tzJyk7XG4gIH1cblxuICBjb25zdCBpbnRlcmNlcHRvcnMgPSBpbXBvcnRJbnRlcmNlcHRvcnMoKTtcbiAgZm9yIChjb25zdCBtb2Qgb2YgaW50ZXJjZXB0b3JzKSB7XG4gICAgY29uc3QgZmFjdG9yeTogV29ya2Zsb3dJbnRlcmNlcHRvcnNGYWN0b3J5ID0gbW9kLmludGVyY2VwdG9ycztcbiAgICBpZiAoZmFjdG9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodHlwZW9mIGZhY3RvcnkgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRmFpbGVkIHRvIGluaXRpYWxpemUgd29ya2Zsb3dzIGludGVyY2VwdG9yczogZXhwZWN0ZWQgYSBmdW5jdGlvbiwgYnV0IGdvdDogJyR7ZmFjdG9yeX0nYCk7XG4gICAgICB9XG4gICAgICBjb25zdCBpbnRlcmNlcHRvcnMgPSBmYWN0b3J5KCk7XG4gICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLmluYm91bmQucHVzaCguLi4oaW50ZXJjZXB0b3JzLmluYm91bmQgPz8gW10pKTtcbiAgICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQucHVzaCguLi4oaW50ZXJjZXB0b3JzLm91dGJvdW5kID8/IFtdKSk7XG4gICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLmludGVybmFscy5wdXNoKC4uLihpbnRlcmNlcHRvcnMuaW50ZXJuYWxzID8/IFtdKSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbW9kID0gaW1wb3J0V29ya2Zsb3dzKCk7XG4gIGNvbnN0IHdvcmtmbG93Rm4gPSBtb2RbYWN0aXZhdG9yLmluZm8ud29ya2Zsb3dUeXBlXTtcbiAgY29uc3QgZGVmYXVsdFdvcmtmbG93Rm4gPSBtb2RbJ2RlZmF1bHQnXTtcblxuICBpZiAodHlwZW9mIHdvcmtmbG93Rm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICBhY3RpdmF0b3Iud29ya2Zsb3cgPSB3b3JrZmxvd0ZuO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZhdWx0V29ya2Zsb3dGbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGFjdGl2YXRvci53b3JrZmxvdyA9IGRlZmF1bHRXb3JrZmxvd0ZuO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGRldGFpbHMgPVxuICAgICAgd29ya2Zsb3dGbiA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gJ25vIHN1Y2ggZnVuY3Rpb24gaXMgZXhwb3J0ZWQgYnkgdGhlIHdvcmtmbG93IGJ1bmRsZSdcbiAgICAgICAgOiBgZXhwZWN0ZWQgYSBmdW5jdGlvbiwgYnV0IGdvdDogJyR7dHlwZW9mIHdvcmtmbG93Rm59J2A7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRmFpbGVkIHRvIGluaXRpYWxpemUgd29ya2Zsb3cgb2YgdHlwZSAnJHthY3RpdmF0b3IuaW5mby53b3JrZmxvd1R5cGV9JzogJHtkZXRhaWxzfWApO1xuICB9XG59XG5cbi8qKlxuICogT2JqZWN0cyB0cmFuc2ZlcmVkIHRvIHRoZSBWTSBmcm9tIG91dHNpZGUgaGF2ZSBwcm90b3R5cGVzIGJlbG9uZ2luZyB0byB0aGVcbiAqIG91dGVyIGNvbnRleHQsIHdoaWNoIG1lYW5zIHRoYXQgaW5zdGFuY2VvZiB3b24ndCB3b3JrIGluc2lkZSB0aGUgVk0uIFRoaXNcbiAqIGZ1bmN0aW9uIHJlY3Vyc2l2ZWx5IHdhbGtzIG92ZXIgdGhlIGNvbnRlbnQgb2YgYW4gb2JqZWN0LCBhbmQgcmVjcmVhdGUgc29tZVxuICogb2YgdGhlc2Ugb2JqZWN0cyAobm90YWJseSBBcnJheSwgRGF0ZSBhbmQgT2JqZWN0cykuXG4gKi9cbmZ1bmN0aW9uIGZpeFByb3RvdHlwZXM8WD4ob2JqOiBYKTogWCB7XG4gIGlmIChvYmogIT0gbnVsbCAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgIHN3aXRjaCAoT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaik/LmNvbnN0cnVjdG9yPy5uYW1lKSB7XG4gICAgICBjYXNlICdBcnJheSc6XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKChvYmogYXMgQXJyYXk8dW5rbm93bj4pLm1hcChmaXhQcm90b3R5cGVzKSkgYXMgWDtcbiAgICAgIGNhc2UgJ0RhdGUnOlxuICAgICAgICByZXR1cm4gbmV3IERhdGUob2JqIGFzIHVua25vd24gYXMgRGF0ZSkgYXMgWDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoT2JqZWN0LmVudHJpZXMob2JqKS5tYXAoKFtrLCB2XSk6IFtzdHJpbmcsIGFueV0gPT4gW2ssIGZpeFByb3RvdHlwZXModildKSkgYXMgWDtcbiAgICB9XG4gIH0gZWxzZSByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIFJ1biBhIGNodW5rIG9mIGFjdGl2YXRpb24gam9ic1xuICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciBqb2Igd2FzIHByb2Nlc3NlZCBvciBpZ25vcmVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uV29ya2Zsb3dBY3RpdmF0aW9uLCBiYXRjaEluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIGNvbnN0IGludGVyY2VwdCA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoYWN0aXZhdG9yLmludGVyY2VwdG9ycy5pbnRlcm5hbHMsICdhY3RpdmF0ZScsICh7IGFjdGl2YXRpb24sIGJhdGNoSW5kZXggfSkgPT4ge1xuICAgIGlmIChiYXRjaEluZGV4ID09PSAwKSB7XG4gICAgICBpZiAoIWFjdGl2YXRpb24uam9icykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgYWN0aXZhdGlvbiB3aXRoIG5vIGpvYnMnKTtcbiAgICAgIH1cbiAgICAgIGlmIChhY3RpdmF0aW9uLnRpbWVzdGFtcCAhPSBudWxsKSB7XG4gICAgICAgIC8vIHRpbWVzdGFtcCB3aWxsIG5vdCBiZSB1cGRhdGVkIGZvciBhY3RpdmF0aW9uIHRoYXQgY29udGFpbiBvbmx5IHF1ZXJpZXNcbiAgICAgICAgYWN0aXZhdG9yLm5vdyA9IHRzVG9NcyhhY3RpdmF0aW9uLnRpbWVzdGFtcCk7XG4gICAgICB9XG4gICAgICBhY3RpdmF0b3IuYWRkS25vd25GbGFncyhhY3RpdmF0aW9uLmF2YWlsYWJsZUludGVybmFsRmxhZ3MgPz8gW10pO1xuXG4gICAgICAvLyBUaGUgUnVzdCBDb3JlIGVuc3VyZXMgdGhhdCB0aGVzZSBhY3RpdmF0aW9uIGZpZWxkcyBhcmUgbm90IG51bGxcbiAgICAgIGFjdGl2YXRvci5tdXRhdGVXb3JrZmxvd0luZm8oKGluZm8pID0+ICh7XG4gICAgICAgIC4uLmluZm8sXG4gICAgICAgIGhpc3RvcnlMZW5ndGg6IGFjdGl2YXRpb24uaGlzdG9yeUxlbmd0aCBhcyBudW1iZXIsXG4gICAgICAgIC8vIEV4YWN0IHRydW5jYXRpb24gZm9yIG11bHRpLXBldGFieXRlIGhpc3Rvcmllc1xuICAgICAgICAvLyBoaXN0b3J5U2l6ZSA9PT0gMCBtZWFucyBXRlQgd2FzIGdlbmVyYXRlZCBieSBwcmUtMS4yMC4wIHNlcnZlciwgYW5kIHRoZSBoaXN0b3J5IHNpemUgaXMgdW5rbm93blxuICAgICAgICBoaXN0b3J5U2l6ZTogYWN0aXZhdGlvbi5oaXN0b3J5U2l6ZUJ5dGVzPy50b051bWJlcigpIHx8IDAsXG4gICAgICAgIGNvbnRpbnVlQXNOZXdTdWdnZXN0ZWQ6IGFjdGl2YXRpb24uY29udGludWVBc05ld1N1Z2dlc3RlZCA/PyBmYWxzZSxcbiAgICAgICAgY3VycmVudEJ1aWxkSWQ6IGFjdGl2YXRpb24uYnVpbGRJZEZvckN1cnJlbnRUYXNrID8/IHVuZGVmaW5lZCxcbiAgICAgICAgdW5zYWZlOiB7XG4gICAgICAgICAgLi4uaW5mby51bnNhZmUsXG4gICAgICAgICAgaXNSZXBsYXlpbmc6IGFjdGl2YXRpb24uaXNSZXBsYXlpbmcgPz8gZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICB9KSk7XG4gICAgfVxuXG4gICAgLy8gQ2FzdCBmcm9tIHRoZSBpbnRlcmZhY2UgdG8gdGhlIGNsYXNzIHdoaWNoIGhhcyB0aGUgYHZhcmlhbnRgIGF0dHJpYnV0ZS5cbiAgICAvLyBUaGlzIGlzIHNhZmUgYmVjYXVzZSB3ZSBrbm93IHRoYXQgYWN0aXZhdGlvbiBpcyBhIHByb3RvIGNsYXNzLlxuICAgIGNvbnN0IGpvYnMgPSBhY3RpdmF0aW9uLmpvYnMgYXMgY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLldvcmtmbG93QWN0aXZhdGlvbkpvYltdO1xuXG4gICAgZm9yIChjb25zdCBqb2Igb2Ygam9icykge1xuICAgICAgaWYgKGpvYi52YXJpYW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgam9iLnZhcmlhbnQgdG8gYmUgZGVmaW5lZCcpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB2YXJpYW50ID0gam9iW2pvYi52YXJpYW50XTtcbiAgICAgIGlmICghdmFyaWFudCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBqb2IuJHtqb2IudmFyaWFudH0gdG8gYmUgc2V0YCk7XG4gICAgICB9XG4gICAgICAvLyBUaGUgb25seSBqb2IgdGhhdCBjYW4gYmUgZXhlY3V0ZWQgb24gYSBjb21wbGV0ZWQgd29ya2Zsb3cgaXMgYSBxdWVyeS5cbiAgICAgIC8vIFdlIG1pZ2h0IGdldCBvdGhlciBqb2JzIGFmdGVyIGNvbXBsZXRpb24gZm9yIGluc3RhbmNlIHdoZW4gYSBzaW5nbGVcbiAgICAgIC8vIGFjdGl2YXRpb24gY29udGFpbnMgbXVsdGlwbGUgam9icyBhbmQgdGhlIGZpcnN0IG9uZSBjb21wbGV0ZXMgdGhlIHdvcmtmbG93LlxuICAgICAgaWYgKGFjdGl2YXRvci5jb21wbGV0ZWQgJiYgam9iLnZhcmlhbnQgIT09ICdxdWVyeVdvcmtmbG93Jykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhY3RpdmF0b3Jbam9iLnZhcmlhbnRdKHZhcmlhbnQgYXMgYW55IC8qIFRTIGNhbid0IGluZmVyIHRoaXMgdHlwZSAqLyk7XG4gICAgICBpZiAoc2hvdWxkVW5ibG9ja0NvbmRpdGlvbnMoam9iKSkge1xuICAgICAgICB0cnlVbmJsb2NrQ29uZGl0aW9ucygpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGludGVyY2VwdCh7XG4gICAgYWN0aXZhdGlvbixcbiAgICBiYXRjaEluZGV4LFxuICB9KTtcbn1cblxuLyoqXG4gKiBDb25jbHVkZSBhIHNpbmdsZSBhY3RpdmF0aW9uLlxuICogU2hvdWxkIGJlIGNhbGxlZCBhZnRlciBwcm9jZXNzaW5nIGFsbCBhY3RpdmF0aW9uIGpvYnMgYW5kIHF1ZXVlZCBtaWNyb3Rhc2tzLlxuICpcbiAqIEFjdGl2YXRpb24gZmFpbHVyZXMgYXJlIGhhbmRsZWQgaW4gdGhlIG1haW4gTm9kZS5qcyBpc29sYXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uY2x1ZGVBY3RpdmF0aW9uKCk6IGNvcmVzZGsud29ya2Zsb3dfY29tcGxldGlvbi5JV29ya2Zsb3dBY3RpdmF0aW9uQ29tcGxldGlvbiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICBhY3RpdmF0b3IucmVqZWN0QnVmZmVyZWRVcGRhdGVzKCk7XG4gIGNvbnN0IGludGVyY2VwdCA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoYWN0aXZhdG9yLmludGVyY2VwdG9ycy5pbnRlcm5hbHMsICdjb25jbHVkZUFjdGl2YXRpb24nLCAoaW5wdXQpID0+IGlucHV0KTtcbiAgY29uc3QgeyBpbmZvIH0gPSBhY3RpdmF0b3I7XG4gIGNvbnN0IGFjdGl2YXRpb25Db21wbGV0aW9uID0gYWN0aXZhdG9yLmNvbmNsdWRlQWN0aXZhdGlvbigpO1xuICBjb25zdCB7IGNvbW1hbmRzIH0gPSBpbnRlcmNlcHQoeyBjb21tYW5kczogYWN0aXZhdGlvbkNvbXBsZXRpb24uY29tbWFuZHMgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBydW5JZDogaW5mby5ydW5JZCxcbiAgICBzdWNjZXNzZnVsOiB7IC4uLmFjdGl2YXRpb25Db21wbGV0aW9uLCBjb21tYW5kcyB9LFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QW5kUmVzZXRTaW5rQ2FsbHMoKTogU2lua0NhbGxbXSB7XG4gIHJldHVybiBnZXRBY3RpdmF0b3IoKS5nZXRBbmRSZXNldFNpbmtDYWxscygpO1xufVxuXG4vKipcbiAqIExvb3AgdGhyb3VnaCBhbGwgYmxvY2tlZCBjb25kaXRpb25zLCBldmFsdWF0ZSBhbmQgdW5ibG9jayBpZiBwb3NzaWJsZS5cbiAqXG4gKiBAcmV0dXJucyBudW1iZXIgb2YgdW5ibG9ja2VkIGNvbmRpdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cnlVbmJsb2NrQ29uZGl0aW9ucygpOiBudW1iZXIge1xuICBsZXQgbnVtVW5ibG9ja2VkID0gMDtcbiAgZm9yICg7Oykge1xuICAgIGNvbnN0IHByZXZVbmJsb2NrZWQgPSBudW1VbmJsb2NrZWQ7XG4gICAgZm9yIChjb25zdCBbc2VxLCBjb25kXSBvZiBnZXRBY3RpdmF0b3IoKS5ibG9ja2VkQ29uZGl0aW9ucy5lbnRyaWVzKCkpIHtcbiAgICAgIGlmIChjb25kLmZuKCkpIHtcbiAgICAgICAgY29uZC5yZXNvbHZlKCk7XG4gICAgICAgIG51bVVuYmxvY2tlZCsrO1xuICAgICAgICAvLyBJdCBpcyBzYWZlIHRvIGRlbGV0ZSBlbGVtZW50cyBkdXJpbmcgbWFwIGl0ZXJhdGlvblxuICAgICAgICBnZXRBY3RpdmF0b3IoKS5ibG9ja2VkQ29uZGl0aW9ucy5kZWxldGUoc2VxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHByZXZVbmJsb2NrZWQgPT09IG51bVVuYmxvY2tlZCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBudW1VbmJsb2NrZWQ7XG59XG5cbi8qKlxuICogUHJlZGljYXRlIHVzZWQgdG8gcHJldmVudCB0cmlnZ2VyaW5nIGNvbmRpdGlvbnMgZm9yIG5vbi1xdWVyeSBhbmQgbm9uLXBhdGNoIGpvYnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRVbmJsb2NrQ29uZGl0aW9ucyhqb2I6IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JV29ya2Zsb3dBY3RpdmF0aW9uSm9iKTogYm9vbGVhbiB7XG4gIHJldHVybiAham9iLnF1ZXJ5V29ya2Zsb3cgJiYgIWpvYi5ub3RpZnlIYXNQYXRjaDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3Bvc2UoKTogdm9pZCB7XG4gIGNvbnN0IGRpc3Bvc2UgPSBjb21wb3NlSW50ZXJjZXB0b3JzKGdldEFjdGl2YXRvcigpLmludGVyY2VwdG9ycy5pbnRlcm5hbHMsICdkaXNwb3NlJywgYXN5bmMgKCkgPT4ge1xuICAgIGRpc2FibGVTdG9yYWdlKCk7XG4gIH0pO1xuICBkaXNwb3NlKHt9KTtcbn1cbiIsImltcG9ydCB7XG4gIEFjdGl2aXR5RnVuY3Rpb24sXG4gIEFjdGl2aXR5T3B0aW9ucyxcbiAgY29tcGlsZVJldHJ5UG9saWN5LFxuICBleHRyYWN0V29ya2Zsb3dUeXBlLFxuICBMb2NhbEFjdGl2aXR5T3B0aW9ucyxcbiAgbWFwVG9QYXlsb2FkcyxcbiAgUXVlcnlEZWZpbml0aW9uLFxuICBzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyLFxuICBTZWFyY2hBdHRyaWJ1dGVzLFxuICBTaWduYWxEZWZpbml0aW9uLFxuICB0b1BheWxvYWRzLFxuICBVbnR5cGVkQWN0aXZpdGllcyxcbiAgVXBkYXRlRGVmaW5pdGlvbixcbiAgV2l0aFdvcmtmbG93QXJncyxcbiAgV29ya2Zsb3csXG4gIFdvcmtmbG93UmVzdWx0VHlwZSxcbiAgV29ya2Zsb3dSZXR1cm5UeXBlLFxuICBXb3JrZmxvd1VwZGF0ZVZhbGlkYXRvclR5cGUsXG59IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyB2ZXJzaW9uaW5nSW50ZW50VG9Qcm90byB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvdmVyc2lvbmluZy1pbnRlbnQtZW51bSc7XG5pbXBvcnQgeyBEdXJhdGlvbiwgbXNPcHRpb25hbFRvVHMsIG1zVG9OdW1iZXIsIG1zVG9UcywgdHNUb01zIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90aW1lJztcbmltcG9ydCB7IGNvbXBvc2VJbnRlcmNlcHRvcnMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQgeyB0ZW1wb3JhbCB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IENhbmNlbGxhdGlvblNjb3BlLCByZWdpc3RlclNsZWVwSW1wbGVtZW50YXRpb24gfSBmcm9tICcuL2NhbmNlbGxhdGlvbi1zY29wZSc7XG5pbXBvcnQge1xuICBBY3Rpdml0eUlucHV0LFxuICBMb2NhbEFjdGl2aXR5SW5wdXQsXG4gIFNpZ25hbFdvcmtmbG93SW5wdXQsXG4gIFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbklucHV0LFxuICBUaW1lcklucHV0LFxufSBmcm9tICcuL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQge1xuICBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZSxcbiAgQ2hpbGRXb3JrZmxvd09wdGlvbnMsXG4gIENoaWxkV29ya2Zsb3dPcHRpb25zV2l0aERlZmF1bHRzLFxuICBDb250aW51ZUFzTmV3LFxuICBDb250aW51ZUFzTmV3T3B0aW9ucyxcbiAgRGVmYXVsdFNpZ25hbEhhbmRsZXIsXG4gIEVuaGFuY2VkU3RhY2tUcmFjZSxcbiAgSGFuZGxlcixcbiAgUXVlcnlIYW5kbGVyT3B0aW9ucyxcbiAgU2lnbmFsSGFuZGxlck9wdGlvbnMsXG4gIFVwZGF0ZUhhbmRsZXJPcHRpb25zLFxuICBXb3JrZmxvd0luZm8sXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBMb2NhbEFjdGl2aXR5RG9CYWNrb2ZmIH0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHsgYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQsIGdldEFjdGl2YXRvciwgbWF5YmVHZXRBY3RpdmF0b3IgfSBmcm9tICcuL2dsb2JhbC1hdHRyaWJ1dGVzJztcbmltcG9ydCB7IHVudHJhY2tQcm9taXNlIH0gZnJvbSAnLi9zdGFjay1oZWxwZXJzJztcbmltcG9ydCB7IENoaWxkV29ya2Zsb3dIYW5kbGUsIEV4dGVybmFsV29ya2Zsb3dIYW5kbGUgfSBmcm9tICcuL3dvcmtmbG93LWhhbmRsZSc7XG5cbi8vIEF2b2lkIGEgY2lyY3VsYXIgZGVwZW5kZW5jeVxucmVnaXN0ZXJTbGVlcEltcGxlbWVudGF0aW9uKHNsZWVwKTtcblxuLyoqXG4gKiBBZGRzIGRlZmF1bHQgdmFsdWVzIHRvIGB3b3JrZmxvd0lkYCBhbmQgYHdvcmtmbG93SWRSZXVzZVBvbGljeWAgdG8gZ2l2ZW4gd29ya2Zsb3cgb3B0aW9ucy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZERlZmF1bHRXb3JrZmxvd09wdGlvbnM8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgb3B0czogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IENoaWxkV29ya2Zsb3dPcHRpb25zV2l0aERlZmF1bHRzIHtcbiAgY29uc3QgeyBhcmdzLCB3b3JrZmxvd0lkLCAuLi5yZXN0IH0gPSBvcHRzO1xuICByZXR1cm4ge1xuICAgIHdvcmtmbG93SWQ6IHdvcmtmbG93SWQgPz8gdXVpZDQoKSxcbiAgICBhcmdzOiAoYXJncyA/PyBbXSkgYXMgdW5rbm93bltdLFxuICAgIGNhbmNlbGxhdGlvblR5cGU6IENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLldBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRCxcbiAgICAuLi5yZXN0LFxuICB9O1xufVxuXG4vKipcbiAqIFB1c2ggYSBzdGFydFRpbWVyIGNvbW1hbmQgaW50byBzdGF0ZSBhY2N1bXVsYXRvciBhbmQgcmVnaXN0ZXIgY29tcGxldGlvblxuICovXG5mdW5jdGlvbiB0aW1lck5leHRIYW5kbGVyKGlucHV0OiBUaW1lcklucHV0KSB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKCFhY3RpdmF0b3IuY29tcGxldGlvbnMudGltZXIuZGVsZXRlKGlucHV0LnNlcSkpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gQWxyZWFkeSByZXNvbHZlZCBvciBuZXZlciBzY2hlZHVsZWRcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICAgIGNhbmNlbFRpbWVyOiB7XG4gICAgICAgICAgICAgIHNlcTogaW5wdXQuc2VxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICBzdGFydFRpbWVyOiB7XG4gICAgICAgIHNlcTogaW5wdXQuc2VxLFxuICAgICAgICBzdGFydFRvRmlyZVRpbWVvdXQ6IG1zVG9UcyhpbnB1dC5kdXJhdGlvbk1zKSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLnRpbWVyLnNldChpbnB1dC5zZXEsIHtcbiAgICAgIHJlc29sdmUsXG4gICAgICByZWplY3QsXG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEFzeW5jaHJvbm91cyBzbGVlcC5cbiAqXG4gKiBTY2hlZHVsZXMgYSB0aW1lciBvbiB0aGUgVGVtcG9yYWwgc2VydmljZS5cbiAqXG4gKiBAcGFyYW0gbXMgc2xlZXAgZHVyYXRpb24gLSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9LlxuICogSWYgZ2l2ZW4gYSBuZWdhdGl2ZSBudW1iZXIgb3IgMCwgdmFsdWUgd2lsbCBiZSBzZXQgdG8gMS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNsZWVwKG1zOiBEdXJhdGlvbik6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dCgnV29ya2Zsb3cuc2xlZXAoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24nKTtcbiAgY29uc3Qgc2VxID0gYWN0aXZhdG9yLm5leHRTZXFzLnRpbWVyKys7XG5cbiAgY29uc3QgZHVyYXRpb25NcyA9IE1hdGgubWF4KDEsIG1zVG9OdW1iZXIobXMpKTtcblxuICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLCAnc3RhcnRUaW1lcicsIHRpbWVyTmV4dEhhbmRsZXIpO1xuXG4gIHJldHVybiBleGVjdXRlKHtcbiAgICBkdXJhdGlvbk1zLFxuICAgIHNlcSxcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlQWN0aXZpdHlPcHRpb25zKG9wdGlvbnM6IEFjdGl2aXR5T3B0aW9ucyk6IHZvaWQge1xuICBpZiAob3B0aW9ucy5zY2hlZHVsZVRvQ2xvc2VUaW1lb3V0ID09PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5zdGFydFRvQ2xvc2VUaW1lb3V0ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdSZXF1aXJlZCBlaXRoZXIgc2NoZWR1bGVUb0Nsb3NlVGltZW91dCBvciBzdGFydFRvQ2xvc2VUaW1lb3V0Jyk7XG4gIH1cbn1cblxuLy8gVXNlIHNhbWUgdmFsaWRhdGlvbiB3ZSB1c2UgZm9yIG5vcm1hbCBhY3Rpdml0aWVzXG5jb25zdCB2YWxpZGF0ZUxvY2FsQWN0aXZpdHlPcHRpb25zID0gdmFsaWRhdGVBY3Rpdml0eU9wdGlvbnM7XG5cbi8qKlxuICogUHVzaCBhIHNjaGVkdWxlQWN0aXZpdHkgY29tbWFuZCBpbnRvIGFjdGl2YXRvciBhY2N1bXVsYXRvciBhbmQgcmVnaXN0ZXIgY29tcGxldGlvblxuICovXG5mdW5jdGlvbiBzY2hlZHVsZUFjdGl2aXR5TmV4dEhhbmRsZXIoeyBvcHRpb25zLCBhcmdzLCBoZWFkZXJzLCBzZXEsIGFjdGl2aXR5VHlwZSB9OiBBY3Rpdml0eUlucHV0KTogUHJvbWlzZTx1bmtub3duPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICB2YWxpZGF0ZUFjdGl2aXR5T3B0aW9ucyhvcHRpb25zKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICBpZiAoc2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCkge1xuICAgICAgdW50cmFja1Byb21pc2Uoc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKHJlamVjdCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIGlmICghYWN0aXZhdG9yLmNvbXBsZXRpb25zLmFjdGl2aXR5LmhhcyhzZXEpKSB7XG4gICAgICAgICAgICByZXR1cm47IC8vIEFscmVhZHkgcmVzb2x2ZWQgb3IgbmV2ZXIgc2NoZWR1bGVkXG4gICAgICAgICAgfVxuICAgICAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgICAgICByZXF1ZXN0Q2FuY2VsQWN0aXZpdHk6IHtcbiAgICAgICAgICAgICAgc2VxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICBzY2hlZHVsZUFjdGl2aXR5OiB7XG4gICAgICAgIHNlcSxcbiAgICAgICAgYWN0aXZpdHlJZDogb3B0aW9ucy5hY3Rpdml0eUlkID8/IGAke3NlcX1gLFxuICAgICAgICBhY3Rpdml0eVR5cGUsXG4gICAgICAgIGFyZ3VtZW50czogdG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgLi4uYXJncyksXG4gICAgICAgIHJldHJ5UG9saWN5OiBvcHRpb25zLnJldHJ5ID8gY29tcGlsZVJldHJ5UG9saWN5KG9wdGlvbnMucmV0cnkpIDogdW5kZWZpbmVkLFxuICAgICAgICB0YXNrUXVldWU6IG9wdGlvbnMudGFza1F1ZXVlIHx8IGFjdGl2YXRvci5pbmZvLnRhc2tRdWV1ZSxcbiAgICAgICAgaGVhcnRiZWF0VGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5oZWFydGJlYXRUaW1lb3V0KSxcbiAgICAgICAgc2NoZWR1bGVUb0Nsb3NlVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5zY2hlZHVsZVRvQ2xvc2VUaW1lb3V0KSxcbiAgICAgICAgc3RhcnRUb0Nsb3NlVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5zdGFydFRvQ2xvc2VUaW1lb3V0KSxcbiAgICAgICAgc2NoZWR1bGVUb1N0YXJ0VGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5zY2hlZHVsZVRvU3RhcnRUaW1lb3V0KSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgY2FuY2VsbGF0aW9uVHlwZTogb3B0aW9ucy5jYW5jZWxsYXRpb25UeXBlLFxuICAgICAgICBkb05vdEVhZ2VybHlFeGVjdXRlOiAhKG9wdGlvbnMuYWxsb3dFYWdlckRpc3BhdGNoID8/IHRydWUpLFxuICAgICAgICB2ZXJzaW9uaW5nSW50ZW50OiB2ZXJzaW9uaW5nSW50ZW50VG9Qcm90byhvcHRpb25zLnZlcnNpb25pbmdJbnRlbnQpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuYWN0aXZpdHkuc2V0KHNlcSwge1xuICAgICAgcmVzb2x2ZSxcbiAgICAgIHJlamVjdCxcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogUHVzaCBhIHNjaGVkdWxlQWN0aXZpdHkgY29tbWFuZCBpbnRvIHN0YXRlIGFjY3VtdWxhdG9yIGFuZCByZWdpc3RlciBjb21wbGV0aW9uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNjaGVkdWxlTG9jYWxBY3Rpdml0eU5leHRIYW5kbGVyKHtcbiAgb3B0aW9ucyxcbiAgYXJncyxcbiAgaGVhZGVycyxcbiAgc2VxLFxuICBhY3Rpdml0eVR5cGUsXG4gIGF0dGVtcHQsXG4gIG9yaWdpbmFsU2NoZWR1bGVUaW1lLFxufTogTG9jYWxBY3Rpdml0eUlucHV0KTogUHJvbWlzZTx1bmtub3duPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICAvLyBFYWdlcmx5IGZhaWwgdGhlIGxvY2FsIGFjdGl2aXR5ICh3aGljaCB3aWxsIGluIHR1cm4gZmFpbCB0aGUgd29ya2Zsb3cgdGFzay5cbiAgLy8gRG8gbm90IGZhaWwgb24gcmVwbGF5IHdoZXJlIHRoZSBsb2NhbCBhY3Rpdml0aWVzIG1heSBub3QgYmUgcmVnaXN0ZXJlZCBvbiB0aGUgcmVwbGF5IHdvcmtlci5cbiAgaWYgKCFhY3RpdmF0b3IuaW5mby51bnNhZmUuaXNSZXBsYXlpbmcgJiYgIWFjdGl2YXRvci5yZWdpc3RlcmVkQWN0aXZpdHlOYW1lcy5oYXMoYWN0aXZpdHlUeXBlKSkge1xuICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgTG9jYWwgYWN0aXZpdHkgb2YgdHlwZSAnJHthY3Rpdml0eVR5cGV9JyBub3QgcmVnaXN0ZXJlZCBvbiB3b3JrZXJgKTtcbiAgfVxuICB2YWxpZGF0ZUxvY2FsQWN0aXZpdHlPcHRpb25zKG9wdGlvbnMpO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICBpZiAoIWFjdGl2YXRvci5jb21wbGV0aW9ucy5hY3Rpdml0eS5oYXMoc2VxKSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBBbHJlYWR5IHJlc29sdmVkIG9yIG5ldmVyIHNjaGVkdWxlZFxuICAgICAgICAgIH1cbiAgICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICAgICAgcmVxdWVzdENhbmNlbExvY2FsQWN0aXZpdHk6IHtcbiAgICAgICAgICAgICAgc2VxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICBzY2hlZHVsZUxvY2FsQWN0aXZpdHk6IHtcbiAgICAgICAgc2VxLFxuICAgICAgICBhdHRlbXB0LFxuICAgICAgICBvcmlnaW5hbFNjaGVkdWxlVGltZSxcbiAgICAgICAgLy8gSW50ZW50aW9uYWxseSBub3QgZXhwb3NpbmcgYWN0aXZpdHlJZCBhcyBhbiBvcHRpb25cbiAgICAgICAgYWN0aXZpdHlJZDogYCR7c2VxfWAsXG4gICAgICAgIGFjdGl2aXR5VHlwZSxcbiAgICAgICAgYXJndW1lbnRzOiB0b1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCAuLi5hcmdzKSxcbiAgICAgICAgcmV0cnlQb2xpY3k6IG9wdGlvbnMucmV0cnkgPyBjb21waWxlUmV0cnlQb2xpY3kob3B0aW9ucy5yZXRyeSkgOiB1bmRlZmluZWQsXG4gICAgICAgIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMuc2NoZWR1bGVUb0Nsb3NlVGltZW91dCksXG4gICAgICAgIHN0YXJ0VG9DbG9zZVRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMuc3RhcnRUb0Nsb3NlVGltZW91dCksXG4gICAgICAgIHNjaGVkdWxlVG9TdGFydFRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMuc2NoZWR1bGVUb1N0YXJ0VGltZW91dCksXG4gICAgICAgIGxvY2FsUmV0cnlUaHJlc2hvbGQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMubG9jYWxSZXRyeVRocmVzaG9sZCksXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIGNhbmNlbGxhdGlvblR5cGU6IG9wdGlvbnMuY2FuY2VsbGF0aW9uVHlwZSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLmFjdGl2aXR5LnNldChzZXEsIHtcbiAgICAgIHJlc29sdmUsXG4gICAgICByZWplY3QsXG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFNjaGVkdWxlIGFuIGFjdGl2aXR5IGFuZCBydW4gb3V0Ym91bmQgaW50ZXJjZXB0b3JzXG4gKiBAaGlkZGVuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2hlZHVsZUFjdGl2aXR5PFI+KGFjdGl2aXR5VHlwZTogc3RyaW5nLCBhcmdzOiBhbnlbXSwgb3B0aW9uczogQWN0aXZpdHlPcHRpb25zKTogUHJvbWlzZTxSPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5zY2hlZHVsZUFjdGl2aXR5KC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uJ1xuICApO1xuICBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IGVtcHR5IGFjdGl2aXR5IG9wdGlvbnMnKTtcbiAgfVxuICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMuYWN0aXZpdHkrKztcbiAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCwgJ3NjaGVkdWxlQWN0aXZpdHknLCBzY2hlZHVsZUFjdGl2aXR5TmV4dEhhbmRsZXIpO1xuXG4gIHJldHVybiBleGVjdXRlKHtcbiAgICBhY3Rpdml0eVR5cGUsXG4gICAgaGVhZGVyczoge30sXG4gICAgb3B0aW9ucyxcbiAgICBhcmdzLFxuICAgIHNlcSxcbiAgfSkgYXMgUHJvbWlzZTxSPjtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZSBhbiBhY3Rpdml0eSBhbmQgcnVuIG91dGJvdW5kIGludGVyY2VwdG9yc1xuICogQGhpZGRlblxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2NoZWR1bGVMb2NhbEFjdGl2aXR5PFI+KFxuICBhY3Rpdml0eVR5cGU6IHN0cmluZyxcbiAgYXJnczogYW55W10sXG4gIG9wdGlvbnM6IExvY2FsQWN0aXZpdHlPcHRpb25zXG4pOiBQcm9taXNlPFI+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LnNjaGVkdWxlTG9jYWxBY3Rpdml0eSguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbidcbiAgKTtcbiAgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBlbXB0eSBhY3Rpdml0eSBvcHRpb25zJyk7XG4gIH1cblxuICBsZXQgYXR0ZW1wdCA9IDE7XG4gIGxldCBvcmlnaW5hbFNjaGVkdWxlVGltZSA9IHVuZGVmaW5lZDtcblxuICBmb3IgKDs7KSB7XG4gICAgY29uc3Qgc2VxID0gYWN0aXZhdG9yLm5leHRTZXFzLmFjdGl2aXR5Kys7XG4gICAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLFxuICAgICAgJ3NjaGVkdWxlTG9jYWxBY3Rpdml0eScsXG4gICAgICBzY2hlZHVsZUxvY2FsQWN0aXZpdHlOZXh0SGFuZGxlclxuICAgICk7XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIChhd2FpdCBleGVjdXRlKHtcbiAgICAgICAgYWN0aXZpdHlUeXBlLFxuICAgICAgICBoZWFkZXJzOiB7fSxcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgYXJncyxcbiAgICAgICAgc2VxLFxuICAgICAgICBhdHRlbXB0LFxuICAgICAgICBvcmlnaW5hbFNjaGVkdWxlVGltZSxcbiAgICAgIH0pKSBhcyBQcm9taXNlPFI+O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIExvY2FsQWN0aXZpdHlEb0JhY2tvZmYpIHtcbiAgICAgICAgYXdhaXQgc2xlZXAodHNUb01zKGVyci5iYWNrb2ZmLmJhY2tvZmZEdXJhdGlvbikpO1xuICAgICAgICBpZiAodHlwZW9mIGVyci5iYWNrb2ZmLmF0dGVtcHQgIT09ICdudW1iZXInKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBiYWNrb2ZmIGF0dGVtcHQgdHlwZScpO1xuICAgICAgICB9XG4gICAgICAgIGF0dGVtcHQgPSBlcnIuYmFja29mZi5hdHRlbXB0O1xuICAgICAgICBvcmlnaW5hbFNjaGVkdWxlVGltZSA9IGVyci5iYWNrb2ZmLm9yaWdpbmFsU2NoZWR1bGVUaW1lID8/IHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uTmV4dEhhbmRsZXIoe1xuICBvcHRpb25zLFxuICBoZWFkZXJzLFxuICB3b3JrZmxvd1R5cGUsXG4gIHNlcSxcbn06IFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbklucHV0KTogUHJvbWlzZTxbUHJvbWlzZTxzdHJpbmc+LCBQcm9taXNlPHVua25vd24+XT4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgY29uc3Qgd29ya2Zsb3dJZCA9IG9wdGlvbnMud29ya2Zsb3dJZCA/PyB1dWlkNCgpO1xuICBjb25zdCBzdGFydFByb21pc2UgPSBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICBpZiAoc2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCkge1xuICAgICAgdW50cmFja1Byb21pc2Uoc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKHJlamVjdCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNvbXBsZXRlID0gIWFjdGl2YXRvci5jb21wbGV0aW9ucy5jaGlsZFdvcmtmbG93Q29tcGxldGUuaGFzKHNlcSk7XG5cbiAgICAgICAgICBpZiAoIWNvbXBsZXRlKSB7XG4gICAgICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICAgICAgICBjYW5jZWxDaGlsZFdvcmtmbG93RXhlY3V0aW9uOiB7IGNoaWxkV29ya2Zsb3dTZXE6IHNlcSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIE5vdGhpbmcgdG8gY2FuY2VsIG90aGVyd2lzZVxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICBzZXEsXG4gICAgICAgIHdvcmtmbG93SWQsXG4gICAgICAgIHdvcmtmbG93VHlwZSxcbiAgICAgICAgaW5wdXQ6IHRvUGF5bG9hZHMoYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsIC4uLm9wdGlvbnMuYXJncyksXG4gICAgICAgIHJldHJ5UG9saWN5OiBvcHRpb25zLnJldHJ5ID8gY29tcGlsZVJldHJ5UG9saWN5KG9wdGlvbnMucmV0cnkpIDogdW5kZWZpbmVkLFxuICAgICAgICB0YXNrUXVldWU6IG9wdGlvbnMudGFza1F1ZXVlIHx8IGFjdGl2YXRvci5pbmZvLnRhc2tRdWV1ZSxcbiAgICAgICAgd29ya2Zsb3dFeGVjdXRpb25UaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLndvcmtmbG93RXhlY3V0aW9uVGltZW91dCksXG4gICAgICAgIHdvcmtmbG93UnVuVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy53b3JrZmxvd1J1blRpbWVvdXQpLFxuICAgICAgICB3b3JrZmxvd1Rhc2tUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLndvcmtmbG93VGFza1RpbWVvdXQpLFxuICAgICAgICBuYW1lc3BhY2U6IGFjdGl2YXRvci5pbmZvLm5hbWVzcGFjZSwgLy8gTm90IGNvbmZpZ3VyYWJsZVxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBjYW5jZWxsYXRpb25UeXBlOiBvcHRpb25zLmNhbmNlbGxhdGlvblR5cGUsXG4gICAgICAgIHdvcmtmbG93SWRSZXVzZVBvbGljeTogb3B0aW9ucy53b3JrZmxvd0lkUmV1c2VQb2xpY3ksXG4gICAgICAgIHBhcmVudENsb3NlUG9saWN5OiBvcHRpb25zLnBhcmVudENsb3NlUG9saWN5LFxuICAgICAgICBjcm9uU2NoZWR1bGU6IG9wdGlvbnMuY3JvblNjaGVkdWxlLFxuICAgICAgICBzZWFyY2hBdHRyaWJ1dGVzOiBvcHRpb25zLnNlYXJjaEF0dHJpYnV0ZXNcbiAgICAgICAgICA/IG1hcFRvUGF5bG9hZHMoc2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlciwgb3B0aW9ucy5zZWFyY2hBdHRyaWJ1dGVzKVxuICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICBtZW1vOiBvcHRpb25zLm1lbW8gJiYgbWFwVG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgb3B0aW9ucy5tZW1vKSxcbiAgICAgICAgdmVyc2lvbmluZ0ludGVudDogdmVyc2lvbmluZ0ludGVudFRvUHJvdG8ob3B0aW9ucy52ZXJzaW9uaW5nSW50ZW50KSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLmNoaWxkV29ya2Zsb3dTdGFydC5zZXQoc2VxLCB7XG4gICAgICByZXNvbHZlLFxuICAgICAgcmVqZWN0LFxuICAgIH0pO1xuICB9KTtcblxuICAvLyBXZSBjb25zdHJ1Y3QgYSBQcm9taXNlIGZvciB0aGUgY29tcGxldGlvbiBvZiB0aGUgY2hpbGQgV29ya2Zsb3cgYmVmb3JlIHdlIGtub3dcbiAgLy8gaWYgdGhlIFdvcmtmbG93IGNvZGUgd2lsbCBhd2FpdCBpdCB0byBjYXB0dXJlIHRoZSByZXN1bHQgaW4gY2FzZSBpdCBkb2VzLlxuICBjb25zdCBjb21wbGV0ZVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgLy8gQ2hhaW4gc3RhcnQgUHJvbWlzZSByZWplY3Rpb24gdG8gdGhlIGNvbXBsZXRlIFByb21pc2UuXG4gICAgdW50cmFja1Byb21pc2Uoc3RhcnRQcm9taXNlLmNhdGNoKHJlamVjdCkpO1xuICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy5jaGlsZFdvcmtmbG93Q29tcGxldGUuc2V0KHNlcSwge1xuICAgICAgcmVzb2x2ZSxcbiAgICAgIHJlamVjdCxcbiAgICB9KTtcbiAgfSk7XG4gIHVudHJhY2tQcm9taXNlKHN0YXJ0UHJvbWlzZSk7XG4gIHVudHJhY2tQcm9taXNlKGNvbXBsZXRlUHJvbWlzZSk7XG4gIC8vIFByZXZlbnQgdW5oYW5kbGVkIHJlamVjdGlvbiBiZWNhdXNlIHRoZSBjb21wbGV0aW9uIG1pZ2h0IG5vdCBiZSBhd2FpdGVkXG4gIHVudHJhY2tQcm9taXNlKGNvbXBsZXRlUHJvbWlzZS5jYXRjaCgoKSA9PiB1bmRlZmluZWQpKTtcbiAgY29uc3QgcmV0ID0gbmV3IFByb21pc2U8W1Byb21pc2U8c3RyaW5nPiwgUHJvbWlzZTx1bmtub3duPl0+KChyZXNvbHZlKSA9PiByZXNvbHZlKFtzdGFydFByb21pc2UsIGNvbXBsZXRlUHJvbWlzZV0pKTtcbiAgdW50cmFja1Byb21pc2UocmV0KTtcbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gc2lnbmFsV29ya2Zsb3dOZXh0SGFuZGxlcih7IHNlcSwgc2lnbmFsTmFtZSwgYXJncywgdGFyZ2V0LCBoZWFkZXJzIH06IFNpZ25hbFdvcmtmbG93SW5wdXQpIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICBpZiAoc2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCkge1xuICAgICAgdW50cmFja1Byb21pc2Uoc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKHJlamVjdCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFhY3RpdmF0b3IuY29tcGxldGlvbnMuc2lnbmFsV29ya2Zsb3cuaGFzKHNlcSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHsgY2FuY2VsU2lnbmFsV29ya2Zsb3c6IHsgc2VxIH0gfSk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgc2lnbmFsRXh0ZXJuYWxXb3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICBzZXEsXG4gICAgICAgIGFyZ3M6IHRvUGF5bG9hZHMoYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsIC4uLmFyZ3MpLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBzaWduYWxOYW1lLFxuICAgICAgICAuLi4odGFyZ2V0LnR5cGUgPT09ICdleHRlcm5hbCdcbiAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgd29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgICAgICAgICBuYW1lc3BhY2U6IGFjdGl2YXRvci5pbmZvLm5hbWVzcGFjZSxcbiAgICAgICAgICAgICAgICAuLi50YXJnZXQud29ya2Zsb3dFeGVjdXRpb24sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XG4gICAgICAgICAgOiB7XG4gICAgICAgICAgICAgIGNoaWxkV29ya2Zsb3dJZDogdGFyZ2V0LmNoaWxkV29ya2Zsb3dJZCxcbiAgICAgICAgICAgIH0pLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy5zaWduYWxXb3JrZmxvdy5zZXQoc2VxLCB7IHJlc29sdmUsIHJlamVjdCB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogU3ltYm9sIHVzZWQgaW4gdGhlIHJldHVybiB0eXBlIG9mIHByb3h5IG1ldGhvZHMgdG8gbWFyayB0aGF0IGFuIGF0dHJpYnV0ZSBvbiB0aGUgc291cmNlIHR5cGUgaXMgbm90IGEgbWV0aG9kLlxuICpcbiAqIEBzZWUge0BsaW5rIEFjdGl2aXR5SW50ZXJmYWNlRm9yfVxuICogQHNlZSB7QGxpbmsgcHJveHlBY3Rpdml0aWVzfVxuICogQHNlZSB7QGxpbmsgcHJveHlMb2NhbEFjdGl2aXRpZXN9XG4gKi9cbmV4cG9ydCBjb25zdCBOb3RBbkFjdGl2aXR5TWV0aG9kID0gU3ltYm9sLmZvcignX19URU1QT1JBTF9OT1RfQU5fQUNUSVZJVFlfTUVUSE9EJyk7XG5cbi8qKlxuICogVHlwZSBoZWxwZXIgdGhhdCB0YWtlcyBhIHR5cGUgYFRgIGFuZCB0cmFuc2Zvcm1zIGF0dHJpYnV0ZXMgdGhhdCBhcmUgbm90IHtAbGluayBBY3Rpdml0eUZ1bmN0aW9ufSB0b1xuICoge0BsaW5rIE5vdEFuQWN0aXZpdHlNZXRob2R9LlxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogVXNlZCBieSB7QGxpbmsgcHJveHlBY3Rpdml0aWVzfSB0byBnZXQgdGhpcyBjb21waWxlLXRpbWUgZXJyb3I6XG4gKlxuICogYGBgdHNcbiAqIGludGVyZmFjZSBNeUFjdGl2aXRpZXMge1xuICogICB2YWxpZChpbnB1dDogbnVtYmVyKTogUHJvbWlzZTxudW1iZXI+O1xuICogICBpbnZhbGlkKGlucHV0OiBudW1iZXIpOiBudW1iZXI7XG4gKiB9XG4gKlxuICogY29uc3QgYWN0ID0gcHJveHlBY3Rpdml0aWVzPE15QWN0aXZpdGllcz4oeyBzdGFydFRvQ2xvc2VUaW1lb3V0OiAnNW0nIH0pO1xuICpcbiAqIGF3YWl0IGFjdC52YWxpZCh0cnVlKTtcbiAqIGF3YWl0IGFjdC5pbnZhbGlkKCk7XG4gKiAvLyBeIFRTIGNvbXBsYWlucyB3aXRoOlxuICogLy8gKHByb3BlcnR5KSBpbnZhbGlkRGVmaW5pdGlvbjogdHlwZW9mIE5vdEFuQWN0aXZpdHlNZXRob2RcbiAqIC8vIFRoaXMgZXhwcmVzc2lvbiBpcyBub3QgY2FsbGFibGUuXG4gKiAvLyBUeXBlICdTeW1ib2wnIGhhcyBubyBjYWxsIHNpZ25hdHVyZXMuKDIzNDkpXG4gKiBgYGBcbiAqL1xuZXhwb3J0IHR5cGUgQWN0aXZpdHlJbnRlcmZhY2VGb3I8VD4gPSB7XG4gIFtLIGluIGtleW9mIFRdOiBUW0tdIGV4dGVuZHMgQWN0aXZpdHlGdW5jdGlvbiA/IFRbS10gOiB0eXBlb2YgTm90QW5BY3Rpdml0eU1ldGhvZDtcbn07XG5cbi8qKlxuICogQ29uZmlndXJlIEFjdGl2aXR5IGZ1bmN0aW9ucyB3aXRoIGdpdmVuIHtAbGluayBBY3Rpdml0eU9wdGlvbnN9LlxuICpcbiAqIFRoaXMgbWV0aG9kIG1heSBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgdG8gc2V0dXAgQWN0aXZpdGllcyB3aXRoIGRpZmZlcmVudCBvcHRpb25zLlxuICpcbiAqIEByZXR1cm4gYSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvUHJveHkgfCBQcm94eX0gZm9yXG4gKiAgICAgICAgIHdoaWNoIGVhY2ggYXR0cmlidXRlIGlzIGEgY2FsbGFibGUgQWN0aXZpdHkgZnVuY3Rpb25cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHByb3h5QWN0aXZpdGllcyB9IGZyb20gJ0B0ZW1wb3JhbGlvL3dvcmtmbG93JztcbiAqIGltcG9ydCAqIGFzIGFjdGl2aXRpZXMgZnJvbSAnLi4vYWN0aXZpdGllcyc7XG4gKlxuICogLy8gU2V0dXAgQWN0aXZpdGllcyBmcm9tIG1vZHVsZSBleHBvcnRzXG4gKiBjb25zdCB7IGh0dHBHZXQsIG90aGVyQWN0aXZpdHkgfSA9IHByb3h5QWN0aXZpdGllczx0eXBlb2YgYWN0aXZpdGllcz4oe1xuICogICBzdGFydFRvQ2xvc2VUaW1lb3V0OiAnMzAgbWludXRlcycsXG4gKiB9KTtcbiAqXG4gKiAvLyBTZXR1cCBBY3Rpdml0aWVzIGZyb20gYW4gZXhwbGljaXQgaW50ZXJmYWNlIChlLmcuIHdoZW4gZGVmaW5lZCBieSBhbm90aGVyIFNESylcbiAqIGludGVyZmFjZSBKYXZhQWN0aXZpdGllcyB7XG4gKiAgIGh0dHBHZXRGcm9tSmF2YSh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPlxuICogICBzb21lT3RoZXJKYXZhQWN0aXZpdHkoYXJnMTogbnVtYmVyLCBhcmcyOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz47XG4gKiB9XG4gKlxuICogY29uc3Qge1xuICogICBodHRwR2V0RnJvbUphdmEsXG4gKiAgIHNvbWVPdGhlckphdmFBY3Rpdml0eVxuICogfSA9IHByb3h5QWN0aXZpdGllczxKYXZhQWN0aXZpdGllcz4oe1xuICogICB0YXNrUXVldWU6ICdqYXZhLXdvcmtlci10YXNrUXVldWUnLFxuICogICBzdGFydFRvQ2xvc2VUaW1lb3V0OiAnNW0nLFxuICogfSk7XG4gKlxuICogZXhwb3J0IGZ1bmN0aW9uIGV4ZWN1dGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gKiAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgaHR0cEdldChcImh0dHA6Ly9leGFtcGxlLmNvbVwiKTtcbiAqICAgLy8gLi4uXG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3h5QWN0aXZpdGllczxBID0gVW50eXBlZEFjdGl2aXRpZXM+KG9wdGlvbnM6IEFjdGl2aXR5T3B0aW9ucyk6IEFjdGl2aXR5SW50ZXJmYWNlRm9yPEE+IHtcbiAgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbnMgbXVzdCBiZSBkZWZpbmVkJyk7XG4gIH1cbiAgLy8gVmFsaWRhdGUgYXMgZWFybHkgYXMgcG9zc2libGUgZm9yIGltbWVkaWF0ZSB1c2VyIGZlZWRiYWNrXG4gIHZhbGlkYXRlQWN0aXZpdHlPcHRpb25zKG9wdGlvbnMpO1xuICByZXR1cm4gbmV3IFByb3h5KFxuICAgIHt9LFxuICAgIHtcbiAgICAgIGdldChfLCBhY3Rpdml0eVR5cGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhY3Rpdml0eVR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgT25seSBzdHJpbmdzIGFyZSBzdXBwb3J0ZWQgZm9yIEFjdGl2aXR5IHR5cGVzLCBnb3Q6ICR7U3RyaW5nKGFjdGl2aXR5VHlwZSl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGFjdGl2aXR5UHJveHlGdW5jdGlvbiguLi5hcmdzOiB1bmtub3duW10pOiBQcm9taXNlPHVua25vd24+IHtcbiAgICAgICAgICByZXR1cm4gc2NoZWR1bGVBY3Rpdml0eShhY3Rpdml0eVR5cGUsIGFyZ3MsIG9wdGlvbnMpO1xuICAgICAgICB9O1xuICAgICAgfSxcbiAgICB9XG4gICkgYXMgYW55O1xufVxuXG4vKipcbiAqIENvbmZpZ3VyZSBMb2NhbCBBY3Rpdml0eSBmdW5jdGlvbnMgd2l0aCBnaXZlbiB7QGxpbmsgTG9jYWxBY3Rpdml0eU9wdGlvbnN9LlxuICpcbiAqIFRoaXMgbWV0aG9kIG1heSBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgdG8gc2V0dXAgQWN0aXZpdGllcyB3aXRoIGRpZmZlcmVudCBvcHRpb25zLlxuICpcbiAqIEByZXR1cm4gYSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvUHJveHkgfCBQcm94eX1cbiAqICAgICAgICAgZm9yIHdoaWNoIGVhY2ggYXR0cmlidXRlIGlzIGEgY2FsbGFibGUgQWN0aXZpdHkgZnVuY3Rpb25cbiAqXG4gKiBAc2VlIHtAbGluayBwcm94eUFjdGl2aXRpZXN9IGZvciBleGFtcGxlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcHJveHlMb2NhbEFjdGl2aXRpZXM8QSA9IFVudHlwZWRBY3Rpdml0aWVzPihvcHRpb25zOiBMb2NhbEFjdGl2aXR5T3B0aW9ucyk6IEFjdGl2aXR5SW50ZXJmYWNlRm9yPEE+IHtcbiAgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbnMgbXVzdCBiZSBkZWZpbmVkJyk7XG4gIH1cbiAgLy8gVmFsaWRhdGUgYXMgZWFybHkgYXMgcG9zc2libGUgZm9yIGltbWVkaWF0ZSB1c2VyIGZlZWRiYWNrXG4gIHZhbGlkYXRlTG9jYWxBY3Rpdml0eU9wdGlvbnMob3B0aW9ucyk7XG4gIHJldHVybiBuZXcgUHJveHkoXG4gICAge30sXG4gICAge1xuICAgICAgZ2V0KF8sIGFjdGl2aXR5VHlwZSkge1xuICAgICAgICBpZiAodHlwZW9mIGFjdGl2aXR5VHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBPbmx5IHN0cmluZ3MgYXJlIHN1cHBvcnRlZCBmb3IgQWN0aXZpdHkgdHlwZXMsIGdvdDogJHtTdHJpbmcoYWN0aXZpdHlUeXBlKX1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbG9jYWxBY3Rpdml0eVByb3h5RnVuY3Rpb24oLi4uYXJnczogdW5rbm93bltdKSB7XG4gICAgICAgICAgcmV0dXJuIHNjaGVkdWxlTG9jYWxBY3Rpdml0eShhY3Rpdml0eVR5cGUsIGFyZ3MsIG9wdGlvbnMpO1xuICAgICAgICB9O1xuICAgICAgfSxcbiAgICB9XG4gICkgYXMgYW55O1xufVxuXG4vLyBUT0RPOiBkZXByZWNhdGUgdGhpcyBwYXRjaCBhZnRlciBcImVub3VnaFwiIHRpbWUgaGFzIHBhc3NlZFxuY29uc3QgRVhURVJOQUxfV0ZfQ0FOQ0VMX1BBVENIID0gJ19fdGVtcG9yYWxfaW50ZXJuYWxfY29ubmVjdF9leHRlcm5hbF9oYW5kbGVfY2FuY2VsX3RvX3Njb3BlJztcbi8vIFRoZSBuYW1lIG9mIHRoaXMgcGF0Y2ggY29tZXMgZnJvbSBhbiBhdHRlbXB0IHRvIGJ1aWxkIGEgZ2VuZXJpYyBpbnRlcm5hbCBwYXRjaGluZyBtZWNoYW5pc20uXG4vLyBUaGF0IGVmZm9ydCBoYXMgYmVlbiBhYmFuZG9uZWQgaW4gZmF2b3Igb2YgYSBuZXdlciBXb3JrZmxvd1Rhc2tDb21wbGV0ZWRNZXRhZGF0YSBiYXNlZCBtZWNoYW5pc20uXG5jb25zdCBDT05ESVRJT05fMF9QQVRDSCA9ICdfX3Nka19pbnRlcm5hbF9wYXRjaF9udW1iZXI6MSc7XG5cbi8qKlxuICogUmV0dXJucyBhIGNsaWVudC1zaWRlIGhhbmRsZSB0aGF0IGNhbiBiZSB1c2VkIHRvIHNpZ25hbCBhbmQgY2FuY2VsIGFuIGV4aXN0aW5nIFdvcmtmbG93IGV4ZWN1dGlvbi5cbiAqIEl0IHRha2VzIGEgV29ya2Zsb3cgSUQgYW5kIG9wdGlvbmFsIHJ1biBJRC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEV4dGVybmFsV29ya2Zsb3dIYW5kbGUod29ya2Zsb3dJZDogc3RyaW5nLCBydW5JZD86IHN0cmluZyk6IEV4dGVybmFsV29ya2Zsb3dIYW5kbGUge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuZ2V0RXh0ZXJuYWxXb3JrZmxvd0hhbmRsZSguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4gQ29uc2lkZXIgdXNpbmcgQ2xpZW50LndvcmtmbG93LmdldEhhbmRsZSguLi4pIGluc3RlYWQuKSdcbiAgKTtcbiAgcmV0dXJuIHtcbiAgICB3b3JrZmxvd0lkLFxuICAgIHJ1bklkLFxuICAgIGNhbmNlbCgpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIC8vIENvbm5lY3QgdGhpcyBjYW5jZWwgb3BlcmF0aW9uIHRvIHRoZSBjdXJyZW50IGNhbmNlbGxhdGlvbiBzY29wZS5cbiAgICAgICAgLy8gVGhpcyBpcyBiZWhhdmlvciB3YXMgaW50cm9kdWNlZCBhZnRlciB2MC4yMi4wIGFuZCBpcyBpbmNvbXBhdGlibGVcbiAgICAgICAgLy8gd2l0aCBoaXN0b3JpZXMgZ2VuZXJhdGVkIHdpdGggcHJldmlvdXMgU0RLIHZlcnNpb25zIGFuZCB0aHVzIHJlcXVpcmVzXG4gICAgICAgIC8vIHBhdGNoaW5nLlxuICAgICAgICAvL1xuICAgICAgICAvLyBXZSB0cnkgdG8gZGVsYXkgcGF0Y2hpbmcgYXMgbXVjaCBhcyBwb3NzaWJsZSB0byBhdm9pZCBwb2xsdXRpbmdcbiAgICAgICAgLy8gaGlzdG9yaWVzIHVubGVzcyBzdHJpY3RseSByZXF1aXJlZC5cbiAgICAgICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHBhdGNoZWQoRVhURVJOQUxfV0ZfQ0FOQ0VMX1BBVENIKSkge1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgICAgICBpZiAocGF0Y2hlZChFWFRFUk5BTF9XRl9DQU5DRUxfUEFUQ0gpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2VxID0gYWN0aXZhdG9yLm5leHRTZXFzLmNhbmNlbFdvcmtmbG93Kys7XG4gICAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgICAgcmVxdWVzdENhbmNlbEV4dGVybmFsV29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgICAgIHNlcSxcbiAgICAgICAgICAgIHdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgICAgICAgIG5hbWVzcGFjZTogYWN0aXZhdG9yLmluZm8ubmFtZXNwYWNlLFxuICAgICAgICAgICAgICB3b3JrZmxvd0lkLFxuICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy5jYW5jZWxXb3JrZmxvdy5zZXQoc2VxLCB7IHJlc29sdmUsIHJlamVjdCB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgc2lnbmFsPEFyZ3MgZXh0ZW5kcyBhbnlbXT4oZGVmOiBTaWduYWxEZWZpbml0aW9uPEFyZ3M+IHwgc3RyaW5nLCAuLi5hcmdzOiBBcmdzKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICByZXR1cm4gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICAgICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCxcbiAgICAgICAgJ3NpZ25hbFdvcmtmbG93JyxcbiAgICAgICAgc2lnbmFsV29ya2Zsb3dOZXh0SGFuZGxlclxuICAgICAgKSh7XG4gICAgICAgIHNlcTogYWN0aXZhdG9yLm5leHRTZXFzLnNpZ25hbFdvcmtmbG93KyssXG4gICAgICAgIHNpZ25hbE5hbWU6IHR5cGVvZiBkZWYgPT09ICdzdHJpbmcnID8gZGVmIDogZGVmLm5hbWUsXG4gICAgICAgIGFyZ3MsXG4gICAgICAgIHRhcmdldDoge1xuICAgICAgICAgIHR5cGU6ICdleHRlcm5hbCcsXG4gICAgICAgICAgd29ya2Zsb3dFeGVjdXRpb246IHsgd29ya2Zsb3dJZCwgcnVuSWQgfSxcbiAgICAgICAgfSxcbiAgICAgICAgaGVhZGVyczoge30sXG4gICAgICB9KTtcbiAgICB9LFxuICB9O1xufVxuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uXG4gKlxuICogLSBSZXR1cm5zIGEgY2xpZW50LXNpZGUgaGFuZGxlIHRoYXQgaW1wbGVtZW50cyBhIGNoaWxkIFdvcmtmbG93IGludGVyZmFjZS5cbiAqIC0gQnkgZGVmYXVsdCwgYSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKlxuICogQSBjaGlsZCBXb3JrZmxvdyBoYW5kbGUgc3VwcG9ydHMgYXdhaXRpbmcgY29tcGxldGlvbiwgc2lnbmFsaW5nIGFuZCBjYW5jZWxsYXRpb24gdmlhIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICogSW4gb3JkZXIgdG8gcXVlcnkgdGhlIGNoaWxkLCB1c2UgYSB7QGxpbmsgV29ya2Zsb3dDbGllbnR9IGZyb20gYW4gQWN0aXZpdHkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydENoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93VHlwZTogc3RyaW5nLFxuICBvcHRpb25zOiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxDaGlsZFdvcmtmbG93SGFuZGxlPFQ+PjtcblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvblxuICpcbiAqIC0gUmV0dXJucyBhIGNsaWVudC1zaWRlIGhhbmRsZSB0aGF0IGltcGxlbWVudHMgYSBjaGlsZCBXb3JrZmxvdyBpbnRlcmZhY2UuXG4gKiAtIERlZHVjZXMgdGhlIFdvcmtmbG93IHR5cGUgYW5kIHNpZ25hdHVyZSBmcm9tIHByb3ZpZGVkIFdvcmtmbG93IGZ1bmN0aW9uLlxuICogLSBCeSBkZWZhdWx0LCBhIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqXG4gKiBBIGNoaWxkIFdvcmtmbG93IGhhbmRsZSBzdXBwb3J0cyBhd2FpdGluZyBjb21wbGV0aW9uLCBzaWduYWxpbmcgYW5kIGNhbmNlbGxhdGlvbiB2aWEge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKiBJbiBvcmRlciB0byBxdWVyeSB0aGUgY2hpbGQsIHVzZSBhIHtAbGluayBXb3JrZmxvd0NsaWVudH0gZnJvbSBhbiBBY3Rpdml0eS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0Q2hpbGQ8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgd29ya2Zsb3dGdW5jOiBULFxuICBvcHRpb25zOiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxDaGlsZFdvcmtmbG93SGFuZGxlPFQ+PjtcblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvblxuICpcbiAqICoqT3ZlcnJpZGUgZm9yIFdvcmtmbG93cyB0aGF0IGFjY2VwdCBubyBhcmd1bWVudHMqKi5cbiAqXG4gKiAtIFJldHVybnMgYSBjbGllbnQtc2lkZSBoYW5kbGUgdGhhdCBpbXBsZW1lbnRzIGEgY2hpbGQgV29ya2Zsb3cgaW50ZXJmYWNlLlxuICogLSBUaGUgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICpcbiAqIEEgY2hpbGQgV29ya2Zsb3cgaGFuZGxlIHN1cHBvcnRzIGF3YWl0aW5nIGNvbXBsZXRpb24sIHNpZ25hbGluZyBhbmQgY2FuY2VsbGF0aW9uIHZpYSB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqIEluIG9yZGVyIHRvIHF1ZXJ5IHRoZSBjaGlsZCwgdXNlIGEge0BsaW5rIFdvcmtmbG93Q2xpZW50fSBmcm9tIGFuIEFjdGl2aXR5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRDaGlsZDxUIGV4dGVuZHMgKCkgPT4gUHJvbWlzZTxhbnk+Pih3b3JrZmxvd1R5cGU6IHN0cmluZyk6IFByb21pc2U8Q2hpbGRXb3JrZmxvd0hhbmRsZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb25cbiAqXG4gKiAqKk92ZXJyaWRlIGZvciBXb3JrZmxvd3MgdGhhdCBhY2NlcHQgbm8gYXJndW1lbnRzKiouXG4gKlxuICogLSBSZXR1cm5zIGEgY2xpZW50LXNpZGUgaGFuZGxlIHRoYXQgaW1wbGVtZW50cyBhIGNoaWxkIFdvcmtmbG93IGludGVyZmFjZS5cbiAqIC0gRGVkdWNlcyB0aGUgV29ya2Zsb3cgdHlwZSBhbmQgc2lnbmF0dXJlIGZyb20gcHJvdmlkZWQgV29ya2Zsb3cgZnVuY3Rpb24uXG4gKiAtIFRoZSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKlxuICogQSBjaGlsZCBXb3JrZmxvdyBoYW5kbGUgc3VwcG9ydHMgYXdhaXRpbmcgY29tcGxldGlvbiwgc2lnbmFsaW5nIGFuZCBjYW5jZWxsYXRpb24gdmlhIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICogSW4gb3JkZXIgdG8gcXVlcnkgdGhlIGNoaWxkLCB1c2UgYSB7QGxpbmsgV29ya2Zsb3dDbGllbnR9IGZyb20gYW4gQWN0aXZpdHkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydENoaWxkPFQgZXh0ZW5kcyAoKSA9PiBQcm9taXNlPGFueT4+KHdvcmtmbG93RnVuYzogVCk6IFByb21pc2U8Q2hpbGRXb3JrZmxvd0hhbmRsZTxUPj47XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydENoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93VHlwZU9yRnVuYzogc3RyaW5nIHwgVCxcbiAgb3B0aW9ucz86IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPENoaWxkV29ya2Zsb3dIYW5kbGU8VD4+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LnN0YXJ0Q2hpbGQoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uIENvbnNpZGVyIHVzaW5nIENsaWVudC53b3JrZmxvdy5zdGFydCguLi4pIGluc3RlYWQuKSdcbiAgKTtcbiAgY29uc3Qgb3B0aW9uc1dpdGhEZWZhdWx0cyA9IGFkZERlZmF1bHRXb3JrZmxvd09wdGlvbnMob3B0aW9ucyA/PyAoe30gYXMgYW55KSk7XG4gIGNvbnN0IHdvcmtmbG93VHlwZSA9IGV4dHJhY3RXb3JrZmxvd1R5cGUod29ya2Zsb3dUeXBlT3JGdW5jKTtcbiAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCxcbiAgICAnc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uJyxcbiAgICBzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25OZXh0SGFuZGxlclxuICApO1xuICBjb25zdCBbc3RhcnRlZCwgY29tcGxldGVkXSA9IGF3YWl0IGV4ZWN1dGUoe1xuICAgIHNlcTogYWN0aXZhdG9yLm5leHRTZXFzLmNoaWxkV29ya2Zsb3crKyxcbiAgICBvcHRpb25zOiBvcHRpb25zV2l0aERlZmF1bHRzLFxuICAgIGhlYWRlcnM6IHt9LFxuICAgIHdvcmtmbG93VHlwZSxcbiAgfSk7XG4gIGNvbnN0IGZpcnN0RXhlY3V0aW9uUnVuSWQgPSBhd2FpdCBzdGFydGVkO1xuXG4gIHJldHVybiB7XG4gICAgd29ya2Zsb3dJZDogb3B0aW9uc1dpdGhEZWZhdWx0cy53b3JrZmxvd0lkLFxuICAgIGZpcnN0RXhlY3V0aW9uUnVuSWQsXG4gICAgYXN5bmMgcmVzdWx0KCk6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PiB7XG4gICAgICByZXR1cm4gKGF3YWl0IGNvbXBsZXRlZCkgYXMgYW55O1xuICAgIH0sXG4gICAgYXN5bmMgc2lnbmFsPEFyZ3MgZXh0ZW5kcyBhbnlbXT4oZGVmOiBTaWduYWxEZWZpbml0aW9uPEFyZ3M+IHwgc3RyaW5nLCAuLi5hcmdzOiBBcmdzKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICByZXR1cm4gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICAgICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCxcbiAgICAgICAgJ3NpZ25hbFdvcmtmbG93JyxcbiAgICAgICAgc2lnbmFsV29ya2Zsb3dOZXh0SGFuZGxlclxuICAgICAgKSh7XG4gICAgICAgIHNlcTogYWN0aXZhdG9yLm5leHRTZXFzLnNpZ25hbFdvcmtmbG93KyssXG4gICAgICAgIHNpZ25hbE5hbWU6IHR5cGVvZiBkZWYgPT09ICdzdHJpbmcnID8gZGVmIDogZGVmLm5hbWUsXG4gICAgICAgIGFyZ3MsXG4gICAgICAgIHRhcmdldDoge1xuICAgICAgICAgIHR5cGU6ICdjaGlsZCcsXG4gICAgICAgICAgY2hpbGRXb3JrZmxvd0lkOiBvcHRpb25zV2l0aERlZmF1bHRzLndvcmtmbG93SWQsXG4gICAgICAgIH0sXG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgfSk7XG4gICAgfSxcbiAgfTtcbn1cblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvbiBhbmQgYXdhaXQgaXRzIGNvbXBsZXRpb24uXG4gKlxuICogLSBCeSBkZWZhdWx0LCBhIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqIC0gVGhpcyBvcGVyYXRpb24gaXMgY2FuY2VsbGFibGUgdXNpbmcge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKlxuICogQHJldHVybiBUaGUgcmVzdWx0IG9mIHRoZSBjaGlsZCBXb3JrZmxvdy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd1R5cGU6IHN0cmluZyxcbiAgb3B0aW9uczogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PjtcblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvbiBhbmQgYXdhaXQgaXRzIGNvbXBsZXRpb24uXG4gKlxuICogLSBCeSBkZWZhdWx0LCBhIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqIC0gRGVkdWNlcyB0aGUgV29ya2Zsb3cgdHlwZSBhbmQgc2lnbmF0dXJlIGZyb20gcHJvdmlkZWQgV29ya2Zsb3cgZnVuY3Rpb24uXG4gKiAtIFRoaXMgb3BlcmF0aW9uIGlzIGNhbmNlbGxhYmxlIHVzaW5nIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICpcbiAqIEByZXR1cm4gVGhlIHJlc3VsdCBvZiB0aGUgY2hpbGQgV29ya2Zsb3cuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlQ2hpbGQ8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgd29ya2Zsb3dGdW5jOiBULFxuICBvcHRpb25zOiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+O1xuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uIGFuZCBhd2FpdCBpdHMgY29tcGxldGlvbi5cbiAqXG4gKiAqKk92ZXJyaWRlIGZvciBXb3JrZmxvd3MgdGhhdCBhY2NlcHQgbm8gYXJndW1lbnRzKiouXG4gKlxuICogLSBUaGUgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICogLSBUaGlzIG9wZXJhdGlvbiBpcyBjYW5jZWxsYWJsZSB1c2luZyB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqXG4gKiBAcmV0dXJuIFRoZSByZXN1bHQgb2YgdGhlIGNoaWxkIFdvcmtmbG93LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNoaWxkPFQgZXh0ZW5kcyAoKSA9PiBXb3JrZmxvd1JldHVyblR5cGU+KFxuICB3b3JrZmxvd1R5cGU6IHN0cmluZ1xuKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+O1xuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uIGFuZCBhd2FpdCBpdHMgY29tcGxldGlvbi5cbiAqXG4gKiAqKk92ZXJyaWRlIGZvciBXb3JrZmxvd3MgdGhhdCBhY2NlcHQgbm8gYXJndW1lbnRzKiouXG4gKlxuICogLSBUaGUgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICogLSBEZWR1Y2VzIHRoZSBXb3JrZmxvdyB0eXBlIGFuZCBzaWduYXR1cmUgZnJvbSBwcm92aWRlZCBXb3JrZmxvdyBmdW5jdGlvbi5cbiAqIC0gVGhpcyBvcGVyYXRpb24gaXMgY2FuY2VsbGFibGUgdXNpbmcge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKlxuICogQHJldHVybiBUaGUgcmVzdWx0IG9mIHRoZSBjaGlsZCBXb3JrZmxvdy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVDaGlsZDxUIGV4dGVuZHMgKCkgPT4gV29ya2Zsb3dSZXR1cm5UeXBlPih3b3JrZmxvd0Z1bmM6IFQpOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj47XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlQ2hpbGQ8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgd29ya2Zsb3dUeXBlT3JGdW5jOiBzdHJpbmcgfCBULFxuICBvcHRpb25zPzogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5leGVjdXRlQ2hpbGQoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uIENvbnNpZGVyIHVzaW5nIENsaWVudC53b3JrZmxvdy5leGVjdXRlKC4uLikgaW5zdGVhZC4nXG4gICk7XG4gIGNvbnN0IG9wdGlvbnNXaXRoRGVmYXVsdHMgPSBhZGREZWZhdWx0V29ya2Zsb3dPcHRpb25zKG9wdGlvbnMgPz8gKHt9IGFzIGFueSkpO1xuICBjb25zdCB3b3JrZmxvd1R5cGUgPSBleHRyYWN0V29ya2Zsb3dUeXBlKHdvcmtmbG93VHlwZU9yRnVuYyk7XG4gIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsXG4gICAgJ3N0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbicsXG4gICAgc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uTmV4dEhhbmRsZXJcbiAgKTtcbiAgY29uc3QgZXhlY1Byb21pc2UgPSBleGVjdXRlKHtcbiAgICBzZXE6IGFjdGl2YXRvci5uZXh0U2Vxcy5jaGlsZFdvcmtmbG93KyssXG4gICAgb3B0aW9uczogb3B0aW9uc1dpdGhEZWZhdWx0cyxcbiAgICBoZWFkZXJzOiB7fSxcbiAgICB3b3JrZmxvd1R5cGUsXG4gIH0pO1xuICB1bnRyYWNrUHJvbWlzZShleGVjUHJvbWlzZSk7XG4gIGNvbnN0IGNvbXBsZXRlZFByb21pc2UgPSBleGVjUHJvbWlzZS50aGVuKChbX3N0YXJ0ZWQsIGNvbXBsZXRlZF0pID0+IGNvbXBsZXRlZCk7XG4gIHVudHJhY2tQcm9taXNlKGNvbXBsZXRlZFByb21pc2UpO1xuICByZXR1cm4gY29tcGxldGVkUHJvbWlzZSBhcyBQcm9taXNlPGFueT47XG59XG5cbi8qKlxuICogR2V0IGluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50IFdvcmtmbG93LlxuICpcbiAqIFdBUk5JTkc6IFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIGZyb3plbiBjb3B5IG9mIFdvcmtmbG93SW5mbywgYXQgdGhlIHBvaW50IHdoZXJlIHRoaXMgbWV0aG9kIGhhcyBiZWVuIGNhbGxlZC5cbiAqIENoYW5nZXMgaGFwcGVuaW5nIGF0IGxhdGVyIHBvaW50IGluIHdvcmtmbG93IGV4ZWN1dGlvbiB3aWxsIG5vdCBiZSByZWZsZWN0ZWQgaW4gdGhlIHJldHVybmVkIG9iamVjdC5cbiAqXG4gKiBGb3IgdGhpcyByZWFzb24sIHdlIHJlY29tbWVuZCBjYWxsaW5nIGB3b3JrZmxvd0luZm8oKWAgb24gZXZlcnkgYWNjZXNzIHRvIHtAbGluayBXb3JrZmxvd0luZm99J3MgZmllbGRzLFxuICogcmF0aGVyIHRoYW4gY2FjaGluZyB0aGUgYFdvcmtmbG93SW5mb2Agb2JqZWN0IChvciBwYXJ0IG9mIGl0KSBpbiBhIGxvY2FsIHZhcmlhYmxlLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGB0c1xuICogLy8gR09PRFxuICogZnVuY3Rpb24gbXlXb3JrZmxvdygpIHtcbiAqICAgZG9Tb21ldGhpbmcod29ya2Zsb3dJbmZvKCkuc2VhcmNoQXR0cmlidXRlcylcbiAqICAgLi4uXG4gKiAgIGRvU29tZXRoaW5nRWxzZSh3b3JrZmxvd0luZm8oKS5zZWFyY2hBdHRyaWJ1dGVzKVxuICogfVxuICogYGBgXG4gKlxuICogdnNcbiAqXG4gKiBgYGB0c1xuICogLy8gQkFEXG4gKiBmdW5jdGlvbiBteVdvcmtmbG93KCkge1xuICogICBjb25zdCBhdHRyaWJ1dGVzID0gd29ya2Zsb3dJbmZvKCkuc2VhcmNoQXR0cmlidXRlc1xuICogICBkb1NvbWV0aGluZyhhdHRyaWJ1dGVzKVxuICogICAuLi5cbiAqICAgZG9Tb21ldGhpbmdFbHNlKGF0dHJpYnV0ZXMpXG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdvcmtmbG93SW5mbygpOiBXb3JrZmxvd0luZm8ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dCgnV29ya2Zsb3cud29ya2Zsb3dJbmZvKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLicpO1xuICByZXR1cm4gYWN0aXZhdG9yLmluZm87XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCBjb2RlIGlzIGV4ZWN1dGluZyBpbiB3b3JrZmxvdyBjb250ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbldvcmtmbG93Q29udGV4dCgpOiBib29sZWFuIHtcbiAgcmV0dXJuIG1heWJlR2V0QWN0aXZhdG9yKCkgIT09IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZnVuY3Rpb24gYGZgIHRoYXQgd2lsbCBjYXVzZSB0aGUgY3VycmVudCBXb3JrZmxvdyB0byBDb250aW51ZUFzTmV3IHdoZW4gY2FsbGVkLlxuICpcbiAqIGBmYCB0YWtlcyB0aGUgc2FtZSBhcmd1bWVudHMgYXMgdGhlIFdvcmtmbG93IGZ1bmN0aW9uIHN1cHBsaWVkIHRvIHR5cGVwYXJhbSBgRmAuXG4gKlxuICogT25jZSBgZmAgaXMgY2FsbGVkLCBXb3JrZmxvdyBFeGVjdXRpb24gaW1tZWRpYXRlbHkgY29tcGxldGVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZUNvbnRpbnVlQXNOZXdGdW5jPEYgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIG9wdGlvbnM/OiBDb250aW51ZUFzTmV3T3B0aW9uc1xuKTogKC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rj4pID0+IFByb21pc2U8bmV2ZXI+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LmNvbnRpbnVlQXNOZXcoLi4uKSBhbmQgV29ya2Zsb3cubWFrZUNvbnRpbnVlQXNOZXdGdW5jKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLidcbiAgKTtcbiAgY29uc3QgaW5mbyA9IGFjdGl2YXRvci5pbmZvO1xuICBjb25zdCB7IHdvcmtmbG93VHlwZSwgdGFza1F1ZXVlLCAuLi5yZXN0IH0gPSBvcHRpb25zID8/IHt9O1xuICBjb25zdCByZXF1aXJlZE9wdGlvbnMgPSB7XG4gICAgd29ya2Zsb3dUeXBlOiB3b3JrZmxvd1R5cGUgPz8gaW5mby53b3JrZmxvd1R5cGUsXG4gICAgdGFza1F1ZXVlOiB0YXNrUXVldWUgPz8gaW5mby50YXNrUXVldWUsXG4gICAgLi4ucmVzdCxcbiAgfTtcblxuICByZXR1cm4gKC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rj4pOiBQcm9taXNlPG5ldmVyPiA9PiB7XG4gICAgY29uc3QgZm4gPSBjb21wb3NlSW50ZXJjZXB0b3JzKGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsICdjb250aW51ZUFzTmV3JywgYXN5bmMgKGlucHV0KSA9PiB7XG4gICAgICBjb25zdCB7IGhlYWRlcnMsIGFyZ3MsIG9wdGlvbnMgfSA9IGlucHV0O1xuICAgICAgdGhyb3cgbmV3IENvbnRpbnVlQXNOZXcoe1xuICAgICAgICB3b3JrZmxvd1R5cGU6IG9wdGlvbnMud29ya2Zsb3dUeXBlLFxuICAgICAgICBhcmd1bWVudHM6IHRvUGF5bG9hZHMoYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsIC4uLmFyZ3MpLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICB0YXNrUXVldWU6IG9wdGlvbnMudGFza1F1ZXVlLFxuICAgICAgICBtZW1vOiBvcHRpb25zLm1lbW8gJiYgbWFwVG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgb3B0aW9ucy5tZW1vKSxcbiAgICAgICAgc2VhcmNoQXR0cmlidXRlczogb3B0aW9ucy5zZWFyY2hBdHRyaWJ1dGVzXG4gICAgICAgICAgPyBtYXBUb1BheWxvYWRzKHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIsIG9wdGlvbnMuc2VhcmNoQXR0cmlidXRlcylcbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgd29ya2Zsb3dSdW5UaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLndvcmtmbG93UnVuVGltZW91dCksXG4gICAgICAgIHdvcmtmbG93VGFza1RpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMud29ya2Zsb3dUYXNrVGltZW91dCksXG4gICAgICAgIHZlcnNpb25pbmdJbnRlbnQ6IHZlcnNpb25pbmdJbnRlbnRUb1Byb3RvKG9wdGlvbnMudmVyc2lvbmluZ0ludGVudCksXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gZm4oe1xuICAgICAgYXJncyxcbiAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgb3B0aW9uczogcmVxdWlyZWRPcHRpb25zLFxuICAgIH0pO1xuICB9O1xufVxuXG4vKipcbiAqIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vY29uY2VwdHMvd2hhdC1pcy1jb250aW51ZS1hcy1uZXcvIHwgQ29udGludWVzLUFzLU5ld30gdGhlIGN1cnJlbnQgV29ya2Zsb3cgRXhlY3V0aW9uXG4gKiB3aXRoIGRlZmF1bHQgb3B0aW9ucy5cbiAqXG4gKiBTaG9ydGhhbmQgZm9yIGBtYWtlQ29udGludWVBc05ld0Z1bmM8Rj4oKSguLi5hcmdzKWAuIChTZWU6IHtAbGluayBtYWtlQ29udGludWVBc05ld0Z1bmN9LilcbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqYGBgdHNcbiAqaW1wb3J0IHsgY29udGludWVBc05ldyB9IGZyb20gJ0B0ZW1wb3JhbGlvL3dvcmtmbG93JztcbiAqXG4gKmV4cG9ydCBhc3luYyBmdW5jdGlvbiBteVdvcmtmbG93KG46IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICogIC8vIC4uLiBXb3JrZmxvdyBsb2dpY1xuICogIGF3YWl0IGNvbnRpbnVlQXNOZXc8dHlwZW9mIG15V29ya2Zsb3c+KG4gKyAxKTtcbiAqfVxuICpgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnRpbnVlQXNOZXc8RiBleHRlbmRzIFdvcmtmbG93PiguLi5hcmdzOiBQYXJhbWV0ZXJzPEY+KTogUHJvbWlzZTxuZXZlcj4ge1xuICByZXR1cm4gbWFrZUNvbnRpbnVlQXNOZXdGdW5jKCkoLi4uYXJncyk7XG59XG5cbi8qKlxuICogR2VuZXJhdGUgYW4gUkZDIGNvbXBsaWFudCBWNCB1dWlkLlxuICogVXNlcyB0aGUgd29ya2Zsb3cncyBkZXRlcm1pbmlzdGljIFBSTkcgbWFraW5nIGl0IHNhZmUgZm9yIHVzZSB3aXRoaW4gYSB3b3JrZmxvdy5cbiAqIFRoaXMgZnVuY3Rpb24gaXMgY3J5cHRvZ3JhcGhpY2FsbHkgaW5zZWN1cmUuXG4gKiBTZWUgdGhlIHtAbGluayBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDUwMzQvaG93LXRvLWNyZWF0ZS1hLWd1aWQtdXVpZCB8IHN0YWNrb3ZlcmZsb3cgZGlzY3Vzc2lvbn0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1dWlkNCgpOiBzdHJpbmcge1xuICAvLyBSZXR1cm4gdGhlIGhleGFkZWNpbWFsIHRleHQgcmVwcmVzZW50YXRpb24gb2YgbnVtYmVyIGBuYCwgcGFkZGVkIHdpdGggemVyb2VzIHRvIGJlIG9mIGxlbmd0aCBgcGBcbiAgY29uc3QgaG8gPSAobjogbnVtYmVyLCBwOiBudW1iZXIpID0+IG4udG9TdHJpbmcoMTYpLnBhZFN0YXJ0KHAsICcwJyk7XG4gIC8vIENyZWF0ZSBhIHZpZXcgYmFja2VkIGJ5IGEgMTYtYnl0ZSBidWZmZXJcbiAgY29uc3QgdmlldyA9IG5ldyBEYXRhVmlldyhuZXcgQXJyYXlCdWZmZXIoMTYpKTtcbiAgLy8gRmlsbCBidWZmZXIgd2l0aCByYW5kb20gdmFsdWVzXG4gIHZpZXcuc2V0VWludDMyKDAsIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDApID4+PiAwKTtcbiAgdmlldy5zZXRVaW50MzIoNCwgKE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMCkgPj4+IDApO1xuICB2aWV3LnNldFVpbnQzMig4LCAoTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwKSA+Pj4gMCk7XG4gIHZpZXcuc2V0VWludDMyKDEyLCAoTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwKSA+Pj4gMCk7XG4gIC8vIFBhdGNoIHRoZSA2dGggYnl0ZSB0byByZWZsZWN0IGEgdmVyc2lvbiA0IFVVSURcbiAgdmlldy5zZXRVaW50OCg2LCAodmlldy5nZXRVaW50OCg2KSAmIDB4ZikgfCAweDQwKTtcbiAgLy8gUGF0Y2ggdGhlIDh0aCBieXRlIHRvIHJlZmxlY3QgYSB2YXJpYW50IDEgVVVJRCAodmVyc2lvbiA0IFVVSURzIGFyZSlcbiAgdmlldy5zZXRVaW50OCg4LCAodmlldy5nZXRVaW50OCg4KSAmIDB4M2YpIHwgMHg4MCk7XG4gIC8vIENvbXBpbGUgdGhlIGNhbm9uaWNhbCB0ZXh0dWFsIGZvcm0gZnJvbSB0aGUgYXJyYXkgZGF0YVxuICByZXR1cm4gYCR7aG8odmlldy5nZXRVaW50MzIoMCksIDgpfS0ke2hvKHZpZXcuZ2V0VWludDE2KDQpLCA0KX0tJHtobyh2aWV3LmdldFVpbnQxNig2KSwgNCl9LSR7aG8oXG4gICAgdmlldy5nZXRVaW50MTYoOCksXG4gICAgNFxuICApfS0ke2hvKHZpZXcuZ2V0VWludDMyKDEwKSwgOCl9JHtobyh2aWV3LmdldFVpbnQxNigxNCksIDQpfWA7XG59XG5cbi8qKlxuICogUGF0Y2ggb3IgdXBncmFkZSB3b3JrZmxvdyBjb2RlIGJ5IGNoZWNraW5nIG9yIHN0YXRpbmcgdGhhdCB0aGlzIHdvcmtmbG93IGhhcyBhIGNlcnRhaW4gcGF0Y2guXG4gKlxuICogU2VlIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC92ZXJzaW9uaW5nIHwgZG9jcyBwYWdlfSBmb3IgaW5mby5cbiAqXG4gKiBJZiB0aGUgd29ya2Zsb3cgaXMgcmVwbGF5aW5nIGFuIGV4aXN0aW5nIGhpc3RvcnksIHRoZW4gdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRydWUgaWYgdGhhdFxuICogaGlzdG9yeSB3YXMgcHJvZHVjZWQgYnkgYSB3b3JrZXIgd2hpY2ggYWxzbyBoYWQgYSBgcGF0Y2hlZGAgY2FsbCB3aXRoIHRoZSBzYW1lIGBwYXRjaElkYC5cbiAqIElmIHRoZSBoaXN0b3J5IHdhcyBwcm9kdWNlZCBieSBhIHdvcmtlciAqd2l0aG91dCogc3VjaCBhIGNhbGwsIHRoZW4gaXQgd2lsbCByZXR1cm4gZmFsc2UuXG4gKlxuICogSWYgdGhlIHdvcmtmbG93IGlzIG5vdCBjdXJyZW50bHkgcmVwbGF5aW5nLCB0aGVuIHRoaXMgY2FsbCAqYWx3YXlzKiByZXR1cm5zIHRydWUuXG4gKlxuICogWW91ciB3b3JrZmxvdyBjb2RlIHNob3VsZCBydW4gdGhlIFwibmV3XCIgY29kZSBpZiB0aGlzIHJldHVybnMgdHJ1ZSwgaWYgaXQgcmV0dXJucyBmYWxzZSwgeW91XG4gKiBzaG91bGQgcnVuIHRoZSBcIm9sZFwiIGNvZGUuIEJ5IGRvaW5nIHRoaXMsIHlvdSBjYW4gbWFpbnRhaW4gZGV0ZXJtaW5pc20uXG4gKlxuICogQHBhcmFtIHBhdGNoSWQgQW4gaWRlbnRpZmllciB0aGF0IHNob3VsZCBiZSB1bmlxdWUgdG8gdGhpcyBwYXRjaC4gSXQgaXMgT0sgdG8gdXNlIG11bHRpcGxlXG4gKiBjYWxscyB3aXRoIHRoZSBzYW1lIElELCB3aGljaCBtZWFucyBhbGwgc3VjaCBjYWxscyB3aWxsIGFsd2F5cyByZXR1cm4gdGhlIHNhbWUgdmFsdWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXRjaGVkKHBhdGNoSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cucGF0Y2goLi4uKSBhbmQgV29ya2Zsb3cuZGVwcmVjYXRlUGF0Y2ggbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLidcbiAgKTtcbiAgcmV0dXJuIGFjdGl2YXRvci5wYXRjaEludGVybmFsKHBhdGNoSWQsIGZhbHNlKTtcbn1cblxuLyoqXG4gKiBJbmRpY2F0ZSB0aGF0IGEgcGF0Y2ggaXMgYmVpbmcgcGhhc2VkIG91dC5cbiAqXG4gKiBTZWUge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L3ZlcnNpb25pbmcgfCBkb2NzIHBhZ2V9IGZvciBpbmZvLlxuICpcbiAqIFdvcmtmbG93cyB3aXRoIHRoaXMgY2FsbCBtYXkgYmUgZGVwbG95ZWQgYWxvbmdzaWRlIHdvcmtmbG93cyB3aXRoIGEge0BsaW5rIHBhdGNoZWR9IGNhbGwsIGJ1dFxuICogdGhleSBtdXN0ICpub3QqIGJlIGRlcGxveWVkIHdoaWxlIGFueSB3b3JrZXJzIHN0aWxsIGV4aXN0IHJ1bm5pbmcgb2xkIGNvZGUgd2l0aG91dCBhXG4gKiB7QGxpbmsgcGF0Y2hlZH0gY2FsbCwgb3IgYW55IHJ1bnMgd2l0aCBoaXN0b3JpZXMgcHJvZHVjZWQgYnkgc3VjaCB3b3JrZXJzIGV4aXN0LiBJZiBlaXRoZXIga2luZFxuICogb2Ygd29ya2VyIGVuY291bnRlcnMgYSBoaXN0b3J5IHByb2R1Y2VkIGJ5IHRoZSBvdGhlciwgdGhlaXIgYmVoYXZpb3IgaXMgdW5kZWZpbmVkLlxuICpcbiAqIE9uY2UgYWxsIGxpdmUgd29ya2Zsb3cgcnVucyBoYXZlIGJlZW4gcHJvZHVjZWQgYnkgd29ya2VycyB3aXRoIHRoaXMgY2FsbCwgeW91IGNhbiBkZXBsb3kgd29ya2Vyc1xuICogd2hpY2ggYXJlIGZyZWUgb2YgZWl0aGVyIGtpbmQgb2YgcGF0Y2ggY2FsbCBmb3IgdGhpcyBJRC4gV29ya2VycyB3aXRoIGFuZCB3aXRob3V0IHRoaXMgY2FsbFxuICogbWF5IGNvZXhpc3QsIGFzIGxvbmcgYXMgdGhleSBhcmUgYm90aCBydW5uaW5nIHRoZSBcIm5ld1wiIGNvZGUuXG4gKlxuICogQHBhcmFtIHBhdGNoSWQgQW4gaWRlbnRpZmllciB0aGF0IHNob3VsZCBiZSB1bmlxdWUgdG8gdGhpcyBwYXRjaC4gSXQgaXMgT0sgdG8gdXNlIG11bHRpcGxlXG4gKiBjYWxscyB3aXRoIHRoZSBzYW1lIElELCB3aGljaCBtZWFucyBhbGwgc3VjaCBjYWxscyB3aWxsIGFsd2F5cyByZXR1cm4gdGhlIHNhbWUgdmFsdWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXByZWNhdGVQYXRjaChwYXRjaElkOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LnBhdGNoKC4uLikgYW5kIFdvcmtmbG93LmRlcHJlY2F0ZVBhdGNoIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nXG4gICk7XG4gIGFjdGl2YXRvci5wYXRjaEludGVybmFsKHBhdGNoSWQsIHRydWUpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBgZm5gIGV2YWx1YXRlcyB0byBgdHJ1ZWAgb3IgYHRpbWVvdXRgIGV4cGlyZXMuXG4gKlxuICogQHBhcmFtIHRpbWVvdXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICpcbiAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGNvbmRpdGlvbiB3YXMgdHJ1ZSBiZWZvcmUgdGhlIHRpbWVvdXQgZXhwaXJlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY29uZGl0aW9uKGZuOiAoKSA9PiBib29sZWFuLCB0aW1lb3V0OiBEdXJhdGlvbik6IFByb21pc2U8Ym9vbGVhbj47XG5cbi8qKlxuICogUmV0dXJucyBhIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIGBmbmAgZXZhbHVhdGVzIHRvIGB0cnVlYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmRpdGlvbihmbjogKCkgPT4gYm9vbGVhbik6IFByb21pc2U8dm9pZD47XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb25kaXRpb24oZm46ICgpID0+IGJvb2xlYW4sIHRpbWVvdXQ/OiBEdXJhdGlvbik6IFByb21pc2U8dm9pZCB8IGJvb2xlYW4+IHtcbiAgYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoJ1dvcmtmbG93LmNvbmRpdGlvbiguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nKTtcbiAgLy8gUHJpb3IgdG8gMS41LjAsIGBjb25kaXRpb24oZm4sIDApYCB3YXMgdHJlYXRlZCBhcyBlcXVpdmFsZW50IHRvIGBjb25kaXRpb24oZm4sIHVuZGVmaW5lZClgXG4gIGlmICh0aW1lb3V0ID09PSAwICYmICFwYXRjaGVkKENPTkRJVElPTl8wX1BBVENIKSkge1xuICAgIHJldHVybiBjb25kaXRpb25Jbm5lcihmbik7XG4gIH1cbiAgaWYgKHR5cGVvZiB0aW1lb3V0ID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgdGltZW91dCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gQ2FuY2VsbGF0aW9uU2NvcGUuY2FuY2VsbGFibGUoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IFByb21pc2UucmFjZShbc2xlZXAodGltZW91dCkudGhlbigoKSA9PiBmYWxzZSksIGNvbmRpdGlvbklubmVyKGZuKS50aGVuKCgpID0+IHRydWUpXSk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCkuY2FuY2VsKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGNvbmRpdGlvbklubmVyKGZuKTtcbn1cblxuZnVuY3Rpb24gY29uZGl0aW9uSW5uZXIoZm46ICgpID0+IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMuY29uZGl0aW9uKys7XG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBhY3RpdmF0b3IuYmxvY2tlZENvbmRpdGlvbnMuZGVsZXRlKHNlcSk7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIEVhZ2VyIGV2YWx1YXRpb25cbiAgICBpZiAoZm4oKSkge1xuICAgICAgcmVzb2x2ZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGFjdGl2YXRvci5ibG9ja2VkQ29uZGl0aW9ucy5zZXQoc2VxLCB7IGZuLCByZXNvbHZlIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBEZWZpbmUgYW4gdXBkYXRlIG1ldGhvZCBmb3IgYSBXb3JrZmxvdy5cbiAqXG4gKiBEZWZpbml0aW9ucyBhcmUgdXNlZCB0byByZWdpc3RlciBoYW5kbGVyIGluIHRoZSBXb3JrZmxvdyB2aWEge0BsaW5rIHNldEhhbmRsZXJ9IGFuZCB0byB1cGRhdGUgV29ya2Zsb3dzIHVzaW5nIGEge0BsaW5rIFdvcmtmbG93SGFuZGxlfSwge0BsaW5rIENoaWxkV29ya2Zsb3dIYW5kbGV9IG9yIHtAbGluayBFeHRlcm5hbFdvcmtmbG93SGFuZGxlfS5cbiAqIERlZmluaXRpb25zIGNhbiBiZSByZXVzZWQgaW4gbXVsdGlwbGUgV29ya2Zsb3dzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lVXBkYXRlPFJldCwgQXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+KFxuICBuYW1lOiBOYW1lXG4pOiBVcGRhdGVEZWZpbml0aW9uPFJldCwgQXJncywgTmFtZT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICd1cGRhdGUnLFxuICAgIG5hbWUsXG4gIH0gYXMgVXBkYXRlRGVmaW5pdGlvbjxSZXQsIEFyZ3MsIE5hbWU+O1xufVxuXG4vKipcbiAqIERlZmluZSBhIHNpZ25hbCBtZXRob2QgZm9yIGEgV29ya2Zsb3cuXG4gKlxuICogRGVmaW5pdGlvbnMgYXJlIHVzZWQgdG8gcmVnaXN0ZXIgaGFuZGxlciBpbiB0aGUgV29ya2Zsb3cgdmlhIHtAbGluayBzZXRIYW5kbGVyfSBhbmQgdG8gc2lnbmFsIFdvcmtmbG93cyB1c2luZyBhIHtAbGluayBXb3JrZmxvd0hhbmRsZX0sIHtAbGluayBDaGlsZFdvcmtmbG93SGFuZGxlfSBvciB7QGxpbmsgRXh0ZXJuYWxXb3JrZmxvd0hhbmRsZX0uXG4gKiBEZWZpbml0aW9ucyBjYW4gYmUgcmV1c2VkIGluIG11bHRpcGxlIFdvcmtmbG93cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZVNpZ25hbDxBcmdzIGV4dGVuZHMgYW55W10gPSBbXSwgTmFtZSBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4oXG4gIG5hbWU6IE5hbWVcbik6IFNpZ25hbERlZmluaXRpb248QXJncywgTmFtZT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdzaWduYWwnLFxuICAgIG5hbWUsXG4gIH0gYXMgU2lnbmFsRGVmaW5pdGlvbjxBcmdzLCBOYW1lPjtcbn1cblxuLyoqXG4gKiBEZWZpbmUgYSBxdWVyeSBtZXRob2QgZm9yIGEgV29ya2Zsb3cuXG4gKlxuICogRGVmaW5pdGlvbnMgYXJlIHVzZWQgdG8gcmVnaXN0ZXIgaGFuZGxlciBpbiB0aGUgV29ya2Zsb3cgdmlhIHtAbGluayBzZXRIYW5kbGVyfSBhbmQgdG8gcXVlcnkgV29ya2Zsb3dzIHVzaW5nIGEge0BsaW5rIFdvcmtmbG93SGFuZGxlfS5cbiAqIERlZmluaXRpb25zIGNhbiBiZSByZXVzZWQgaW4gbXVsdGlwbGUgV29ya2Zsb3dzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lUXVlcnk8UmV0LCBBcmdzIGV4dGVuZHMgYW55W10gPSBbXSwgTmFtZSBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4oXG4gIG5hbWU6IE5hbWVcbik6IFF1ZXJ5RGVmaW5pdGlvbjxSZXQsIEFyZ3MsIE5hbWU+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAncXVlcnknLFxuICAgIG5hbWUsXG4gIH0gYXMgUXVlcnlEZWZpbml0aW9uPFJldCwgQXJncywgTmFtZT47XG59XG5cbi8qKlxuICogU2V0IGEgaGFuZGxlciBmdW5jdGlvbiBmb3IgYSBXb3JrZmxvdyB1cGRhdGUsIHNpZ25hbCwgb3IgcXVlcnkuXG4gKlxuICogSWYgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgbXVsdGlwbGUgdGltZXMgZm9yIGEgZ2l2ZW4gdXBkYXRlLCBzaWduYWwsIG9yIHF1ZXJ5IG5hbWUgdGhlIGxhc3QgaGFuZGxlciB3aWxsIG92ZXJ3cml0ZSBhbnkgcHJldmlvdXMgY2FsbHMuXG4gKlxuICogQHBhcmFtIGRlZiBhbiB7QGxpbmsgVXBkYXRlRGVmaW5pdGlvbn0sIHtAbGluayBTaWduYWxEZWZpbml0aW9ufSwgb3Ige0BsaW5rIFF1ZXJ5RGVmaW5pdGlvbn0gYXMgcmV0dXJuZWQgYnkge0BsaW5rIGRlZmluZVVwZGF0ZX0sIHtAbGluayBkZWZpbmVTaWduYWx9LCBvciB7QGxpbmsgZGVmaW5lUXVlcnl9IHJlc3BlY3RpdmVseS5cbiAqIEBwYXJhbSBoYW5kbGVyIGEgY29tcGF0aWJsZSBoYW5kbGVyIGZ1bmN0aW9uIGZvciB0aGUgZ2l2ZW4gZGVmaW5pdGlvbiBvciBgdW5kZWZpbmVkYCB0byB1bnNldCB0aGUgaGFuZGxlci5cbiAqIEBwYXJhbSBvcHRpb25zIGFuIG9wdGlvbmFsIGBkZXNjcmlwdGlvbmAgb2YgdGhlIGhhbmRsZXIgYW5kIGFuIG9wdGlvbmFsIHVwZGF0ZSBgdmFsaWRhdG9yYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEhhbmRsZXI8UmV0LCBBcmdzIGV4dGVuZHMgYW55W10sIFQgZXh0ZW5kcyBRdWVyeURlZmluaXRpb248UmV0LCBBcmdzPj4oXG4gIGRlZjogVCxcbiAgaGFuZGxlcjogSGFuZGxlcjxSZXQsIEFyZ3MsIFQ+IHwgdW5kZWZpbmVkLFxuICBvcHRpb25zPzogUXVlcnlIYW5kbGVyT3B0aW9uc1xuKTogdm9pZDtcbmV4cG9ydCBmdW5jdGlvbiBzZXRIYW5kbGVyPFJldCwgQXJncyBleHRlbmRzIGFueVtdLCBUIGV4dGVuZHMgU2lnbmFsRGVmaW5pdGlvbjxBcmdzPj4oXG4gIGRlZjogVCxcbiAgaGFuZGxlcjogSGFuZGxlcjxSZXQsIEFyZ3MsIFQ+IHwgdW5kZWZpbmVkLFxuICBvcHRpb25zPzogU2lnbmFsSGFuZGxlck9wdGlvbnNcbik6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gc2V0SGFuZGxlcjxSZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSwgVCBleHRlbmRzIFVwZGF0ZURlZmluaXRpb248UmV0LCBBcmdzPj4oXG4gIGRlZjogVCxcbiAgaGFuZGxlcjogSGFuZGxlcjxSZXQsIEFyZ3MsIFQ+IHwgdW5kZWZpbmVkLFxuICBvcHRpb25zPzogVXBkYXRlSGFuZGxlck9wdGlvbnM8QXJncz5cbik6IHZvaWQ7XG5cbi8vIEZvciBVcGRhdGVzIGFuZCBTaWduYWxzIHdlIHdhbnQgdG8gbWFrZSBhIHB1YmxpYyBndWFyYW50ZWUgc29tZXRoaW5nIGxpa2UgdGhlXG4vLyBmb2xsb3dpbmc6XG4vL1xuLy8gICBcIklmIGEgV0ZUIGNvbnRhaW5zIGEgU2lnbmFsL1VwZGF0ZSwgYW5kIGlmIGEgaGFuZGxlciBpcyBhdmFpbGFibGUgZm9yIHRoYXRcbi8vICAgU2lnbmFsL1VwZGF0ZSwgdGhlbiB0aGUgaGFuZGxlciB3aWxsIGJlIGV4ZWN1dGVkLlwiXCJcbi8vXG4vLyBIb3dldmVyLCB0aGF0IHN0YXRlbWVudCBpcyBub3Qgd2VsbC1kZWZpbmVkLCBsZWF2aW5nIHNldmVyYWwgcXVlc3Rpb25zIG9wZW46XG4vL1xuLy8gMS4gV2hhdCBkb2VzIGl0IG1lYW4gZm9yIGEgaGFuZGxlciB0byBiZSBcImF2YWlsYWJsZVwiPyBXaGF0IGhhcHBlbnMgaWYgdGhlXG4vLyAgICBoYW5kbGVyIGlzIG5vdCBwcmVzZW50IGluaXRpYWxseSBidXQgaXMgc2V0IGF0IHNvbWUgcG9pbnQgZHVyaW5nIHRoZVxuLy8gICAgV29ya2Zsb3cgY29kZSB0aGF0IGlzIGV4ZWN1dGVkIGluIHRoYXQgV0ZUPyBXaGF0IGhhcHBlbnMgaWYgdGhlIGhhbmRsZXIgaXNcbi8vICAgIHNldCBhbmQgdGhlbiBkZWxldGVkLCBvciByZXBsYWNlZCB3aXRoIGEgZGlmZmVyZW50IGhhbmRsZXI/XG4vL1xuLy8gMi4gV2hlbiBpcyB0aGUgaGFuZGxlciBleGVjdXRlZD8gKFdoZW4gaXQgZmlyc3QgYmVjb21lcyBhdmFpbGFibGU/IEF0IHRoZSBlbmRcbi8vICAgIG9mIHRoZSBhY3RpdmF0aW9uPykgV2hhdCBhcmUgdGhlIGV4ZWN1dGlvbiBzZW1hbnRpY3Mgb2YgV29ya2Zsb3cgYW5kXG4vLyAgICBTaWduYWwvVXBkYXRlIGhhbmRsZXIgY29kZSBnaXZlbiB0aGF0IHRoZXkgYXJlIGNvbmN1cnJlbnQ/IENhbiB0aGUgdXNlclxuLy8gICAgcmVseSBvbiBTaWduYWwvVXBkYXRlIHNpZGUgZWZmZWN0cyBiZWluZyByZWZsZWN0ZWQgaW4gdGhlIFdvcmtmbG93IHJldHVyblxuLy8gICAgdmFsdWUsIG9yIGluIHRoZSB2YWx1ZSBwYXNzZWQgdG8gQ29udGludWUtQXMtTmV3PyBJZiB0aGUgaGFuZGxlciBpcyBhblxuLy8gICAgYXN5bmMgZnVuY3Rpb24gLyBjb3JvdXRpbmUsIGhvdyBtdWNoIG9mIGl0IGlzIGV4ZWN1dGVkIGFuZCB3aGVuIGlzIHRoZVxuLy8gICAgcmVzdCBleGVjdXRlZD9cbi8vXG4vLyAzLiBXaGF0IGhhcHBlbnMgaWYgdGhlIGhhbmRsZXIgaXMgbm90IGV4ZWN1dGVkPyAoaS5lLiBiZWNhdXNlIGl0IHdhc24ndFxuLy8gICAgYXZhaWxhYmxlIGluIHRoZSBzZW5zZSBkZWZpbmVkIGJ5ICgxKSlcbi8vXG4vLyA0LiBJbiB0aGUgY2FzZSBvZiBVcGRhdGUsIHdoZW4gaXMgdGhlIHZhbGlkYXRpb24gZnVuY3Rpb24gZXhlY3V0ZWQ/XG4vL1xuLy8gVGhlIGltcGxlbWVudGF0aW9uIGZvciBUeXBlc2NyaXB0IGlzIGFzIGZvbGxvd3M6XG4vL1xuLy8gMS4gc2RrLWNvcmUgc29ydHMgU2lnbmFsIGFuZCBVcGRhdGUgam9icyAoYW5kIFBhdGNoZXMpIGFoZWFkIG9mIGFsbCBvdGhlclxuLy8gICAgam9icy4gVGh1cyBpZiB0aGUgaGFuZGxlciBpcyBhdmFpbGFibGUgYXQgdGhlIHN0YXJ0IG9mIHRoZSBBY3RpdmF0aW9uIHRoZW5cbi8vICAgIHRoZSBTaWduYWwvVXBkYXRlIHdpbGwgYmUgZXhlY3V0ZWQgYmVmb3JlIFdvcmtmbG93IGNvZGUgaXMgZXhlY3V0ZWQuIElmIGl0XG4vLyAgICBpcyBub3QsIHRoZW4gdGhlIFNpZ25hbC9VcGRhdGUgY2FsbHMgaXMgcHVzaGVkIHRvIGEgYnVmZmVyLlxuLy9cbi8vIDIuIE9uIGVhY2ggY2FsbCB0byBzZXRIYW5kbGVyIGZvciBhIGdpdmVuIFNpZ25hbC9VcGRhdGUsIHdlIG1ha2UgYSBwYXNzXG4vLyAgICB0aHJvdWdoIHRoZSBidWZmZXIgbGlzdC4gSWYgYSBidWZmZXJlZCBqb2IgaXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBqdXN0LXNldFxuLy8gICAgaGFuZGxlciwgdGhlbiB0aGUgam9iIGlzIHJlbW92ZWQgZnJvbSB0aGUgYnVmZmVyIGFuZCB0aGUgaW5pdGlhbFxuLy8gICAgc3luY2hyb25vdXMgcG9ydGlvbiBvZiB0aGUgaGFuZGxlciBpcyBpbnZva2VkIG9uIHRoYXQgaW5wdXQgKGkuZS5cbi8vICAgIHByZWVtcHRpbmcgd29ya2Zsb3cgY29kZSkuXG4vL1xuLy8gVGh1cyBpbiB0aGUgY2FzZSBvZiBUeXBlc2NyaXB0IHRoZSBxdWVzdGlvbnMgYWJvdmUgYXJlIGFuc3dlcmVkIGFzIGZvbGxvd3M6XG4vL1xuLy8gMS4gQSBoYW5kbGVyIGlzIFwiYXZhaWxhYmxlXCIgaWYgaXQgaXMgc2V0IGF0IHRoZSBzdGFydCBvZiB0aGUgQWN0aXZhdGlvbiBvclxuLy8gICAgYmVjb21lcyBzZXQgYXQgYW55IHBvaW50IGR1cmluZyB0aGUgQWN0aXZhdGlvbi4gSWYgdGhlIGhhbmRsZXIgaXMgbm90IHNldFxuLy8gICAgaW5pdGlhbGx5IHRoZW4gaXQgaXMgZXhlY3V0ZWQgYXMgc29vbiBhcyBpdCBpcyBzZXQuIFN1YnNlcXVlbnQgZGVsZXRpb24gb3Jcbi8vICAgIHJlcGxhY2VtZW50IGJ5IGEgZGlmZmVyZW50IGhhbmRsZXIgaGFzIG5vIGltcGFjdCBiZWNhdXNlIHRoZSBqb2JzIGl0IHdhc1xuLy8gICAgaGFuZGxpbmcgaGF2ZSBhbHJlYWR5IGJlZW4gaGFuZGxlZCBhbmQgYXJlIG5vIGxvbmdlciBpbiB0aGUgYnVmZmVyLlxuLy9cbi8vIDIuIFRoZSBoYW5kbGVyIGlzIGV4ZWN1dGVkIGFzIHNvb24gYXMgaXQgYmVjb21lcyBhdmFpbGFibGUuIEkuZS4gaWYgdGhlXG4vLyAgICBoYW5kbGVyIGlzIHNldCBhdCB0aGUgc3RhcnQgb2YgdGhlIEFjdGl2YXRpb24gdGhlbiBpdCBpcyBleGVjdXRlZCB3aGVuXG4vLyAgICBmaXJzdCBhdHRlbXB0aW5nIHRvIHByb2Nlc3MgdGhlIFNpZ25hbC9VcGRhdGUgam9iOyBhbHRlcm5hdGl2ZWx5LCBpZiBpdCBpc1xuLy8gICAgc2V0IGJ5IGEgc2V0SGFuZGxlciBjYWxsIG1hZGUgYnkgV29ya2Zsb3cgY29kZSwgdGhlbiBpdCBpcyBleGVjdXRlZCBhc1xuLy8gICAgcGFydCBvZiB0aGF0IGNhbGwgKHByZWVtcHRpbmcgV29ya2Zsb3cgY29kZSkuIFRoZXJlZm9yZSwgYSB1c2VyIGNhbiByZWx5XG4vLyAgICBvbiBTaWduYWwvVXBkYXRlIHNpZGUgZWZmZWN0cyBiZWluZyByZWZsZWN0ZWQgaW4gZS5nLiB0aGUgV29ya2Zsb3cgcmV0dXJuXG4vLyAgICB2YWx1ZSwgYW5kIGluIHRoZSB2YWx1ZSBwYXNzZWQgdG8gQ29udGludWUtQXMtTmV3LiBBY3RpdmF0aW9uIGpvYnMgYXJlXG4vLyAgICBwcm9jZXNzZWQgaW4gdGhlIG9yZGVyIHN1cHBsaWVkIGJ5IHNkay1jb3JlLCBpLmUuIFNpZ25hbHMsIHRoZW4gVXBkYXRlcyxcbi8vICAgIHRoZW4gb3RoZXIgam9icy4gV2l0aGluIGVhY2ggZ3JvdXAsIHRoZSBvcmRlciBzZW50IGJ5IHRoZSBzZXJ2ZXIgaXNcbi8vICAgIHByZXNlcnZlZC4gSWYgdGhlIGhhbmRsZXIgaXMgYXN5bmMsIGl0IGlzIGV4ZWN1dGVkIHVwIHRvIGl0cyBmaXJzdCB5aWVsZFxuLy8gICAgcG9pbnQuXG4vL1xuLy8gMy4gU2lnbmFsIGNhc2U6IElmIGEgaGFuZGxlciBkb2VzIG5vdCBiZWNvbWUgYXZhaWxhYmxlIGZvciBhIFNpZ25hbCBqb2IgdGhlblxuLy8gICAgdGhlIGpvYiByZW1haW5zIGluIHRoZSBidWZmZXIuIElmIGEgaGFuZGxlciBmb3IgdGhlIFNpZ25hbCBiZWNvbWVzXG4vLyAgICBhdmFpbGFibGUgaW4gYSBzdWJzZXF1ZW50IEFjdGl2YXRpb24gKG9mIHRoZSBzYW1lIG9yIGEgc3Vic2VxdWVudCBXRlQpXG4vLyAgICB0aGVuIHRoZSBoYW5kbGVyIHdpbGwgYmUgZXhlY3V0ZWQuIElmIG5vdCwgdGhlbiB0aGUgU2lnbmFsIHdpbGwgbmV2ZXIgYmVcbi8vICAgIHJlc3BvbmRlZCB0byBhbmQgdGhpcyBjYXVzZXMgbm8gZXJyb3IuXG4vL1xuLy8gICAgVXBkYXRlIGNhc2U6IElmIGEgaGFuZGxlciBkb2VzIG5vdCBiZWNvbWUgYXZhaWxhYmxlIGZvciBhbiBVcGRhdGUgam9iIHRoZW5cbi8vICAgIHRoZSBVcGRhdGUgaXMgcmVqZWN0ZWQgYXQgdGhlIGVuZCBvZiB0aGUgQWN0aXZhdGlvbi4gVGh1cywgaWYgYSB1c2VyIGRvZXNcbi8vICAgIG5vdCB3YW50IGFuIFVwZGF0ZSB0byBiZSByZWplY3RlZCBmb3IgdGhpcyByZWFzb24sIHRoZW4gaXQgaXMgdGhlaXJcbi8vICAgIHJlc3BvbnNpYmlsaXR5IHRvIGVuc3VyZSB0aGF0IHRoZWlyIGFwcGxpY2F0aW9uIGFuZCB3b3JrZmxvdyBjb2RlIGludGVyYWN0XG4vLyAgICBzdWNoIHRoYXQgYSBoYW5kbGVyIGlzIGF2YWlsYWJsZSBmb3IgdGhlIFVwZGF0ZSBkdXJpbmcgYW55IEFjdGl2YXRpb25cbi8vICAgIHdoaWNoIG1pZ2h0IGNvbnRhaW4gdGhlaXIgVXBkYXRlIGpvYi4gKE5vdGUgdGhhdCB0aGUgdXNlciBvZnRlbiBoYXNcbi8vICAgIHVuY2VydGFpbnR5IGFib3V0IHdoaWNoIFdGVCB0aGVpciBTaWduYWwvVXBkYXRlIHdpbGwgYXBwZWFyIGluLiBGb3Jcbi8vICAgIGV4YW1wbGUsIGlmIHRoZXkgY2FsbCBzdGFydFdvcmtmbG93KCkgZm9sbG93ZWQgYnkgc3RhcnRVcGRhdGUoKSwgdGhlbiB0aGV5XG4vLyAgICB3aWxsIHR5cGljYWxseSBub3Qga25vdyB3aGV0aGVyIHRoZXNlIHdpbGwgYmUgZGVsaXZlcmVkIGluIG9uZSBvciB0d29cbi8vICAgIFdGVHMuIE9uIHRoZSBvdGhlciBoYW5kIHRoZXJlIGFyZSBzaXR1YXRpb25zIHdoZXJlIHRoZXkgd291bGQgaGF2ZSByZWFzb25cbi8vICAgIHRvIGJlbGlldmUgdGhleSBhcmUgaW4gdGhlIHNhbWUgV0ZULCBmb3IgZXhhbXBsZSBpZiB0aGV5IGRvIG5vdCBzdGFydFxuLy8gICAgV29ya2VyIHBvbGxpbmcgdW50aWwgYWZ0ZXIgdGhleSBoYXZlIHZlcmlmaWVkIHRoYXQgYm90aCByZXF1ZXN0cyBoYXZlXG4vLyAgICBzdWNjZWVkZWQuKVxuLy9cbi8vIDUuIElmIGFuIFVwZGF0ZSBoYXMgYSB2YWxpZGF0aW9uIGZ1bmN0aW9uIHRoZW4gaXQgaXMgZXhlY3V0ZWQgaW1tZWRpYXRlbHlcbi8vICAgIHByaW9yIHRvIHRoZSBoYW5kbGVyLiAoTm90ZSB0aGF0IHRoZSB2YWxpZGF0aW9uIGZ1bmN0aW9uIGlzIHJlcXVpcmVkIHRvIGJlXG4vLyAgICBzeW5jaHJvbm91cykuXG5leHBvcnQgZnVuY3Rpb24gc2V0SGFuZGxlcjxcbiAgUmV0LFxuICBBcmdzIGV4dGVuZHMgYW55W10sXG4gIFQgZXh0ZW5kcyBVcGRhdGVEZWZpbml0aW9uPFJldCwgQXJncz4gfCBTaWduYWxEZWZpbml0aW9uPEFyZ3M+IHwgUXVlcnlEZWZpbml0aW9uPFJldCwgQXJncz4sXG4+KFxuICBkZWY6IFQsXG4gIGhhbmRsZXI6IEhhbmRsZXI8UmV0LCBBcmdzLCBUPiB8IHVuZGVmaW5lZCxcbiAgb3B0aW9ucz86IFF1ZXJ5SGFuZGxlck9wdGlvbnMgfCBTaWduYWxIYW5kbGVyT3B0aW9ucyB8IFVwZGF0ZUhhbmRsZXJPcHRpb25zPEFyZ3M+XG4pOiB2b2lkIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoJ1dvcmtmbG93LnNldEhhbmRsZXIoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJyk7XG4gIGNvbnN0IGRlc2NyaXB0aW9uID0gb3B0aW9ucz8uZGVzY3JpcHRpb247XG4gIGlmIChkZWYudHlwZSA9PT0gJ3VwZGF0ZScpIHtcbiAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnN0IHVwZGF0ZU9wdGlvbnMgPSBvcHRpb25zIGFzIFVwZGF0ZUhhbmRsZXJPcHRpb25zPEFyZ3M+IHwgdW5kZWZpbmVkO1xuICAgICAgY29uc3QgdmFsaWRhdG9yID0gdXBkYXRlT3B0aW9ucz8udmFsaWRhdG9yIGFzIFdvcmtmbG93VXBkYXRlVmFsaWRhdG9yVHlwZSB8IHVuZGVmaW5lZDtcbiAgICAgIGFjdGl2YXRvci51cGRhdGVIYW5kbGVycy5zZXQoZGVmLm5hbWUsIHsgaGFuZGxlciwgdmFsaWRhdG9yLCBkZXNjcmlwdGlvbiB9KTtcbiAgICAgIGFjdGl2YXRvci5kaXNwYXRjaEJ1ZmZlcmVkVXBkYXRlcygpO1xuICAgIH0gZWxzZSBpZiAoaGFuZGxlciA9PSBudWxsKSB7XG4gICAgICBhY3RpdmF0b3IudXBkYXRlSGFuZGxlcnMuZGVsZXRlKGRlZi5uYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgaGFuZGxlciB0byBiZSBlaXRoZXIgYSBmdW5jdGlvbiBvciAndW5kZWZpbmVkJy4gR290OiAnJHt0eXBlb2YgaGFuZGxlcn0nYCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGRlZi50eXBlID09PSAnc2lnbmFsJykge1xuICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYWN0aXZhdG9yLnNpZ25hbEhhbmRsZXJzLnNldChkZWYubmFtZSwgeyBoYW5kbGVyOiBoYW5kbGVyIGFzIGFueSwgZGVzY3JpcHRpb24gfSk7XG4gICAgICBhY3RpdmF0b3IuZGlzcGF0Y2hCdWZmZXJlZFNpZ25hbHMoKTtcbiAgICB9IGVsc2UgaWYgKGhhbmRsZXIgPT0gbnVsbCkge1xuICAgICAgYWN0aXZhdG9yLnNpZ25hbEhhbmRsZXJzLmRlbGV0ZShkZWYubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGhhbmRsZXIgdG8gYmUgZWl0aGVyIGEgZnVuY3Rpb24gb3IgJ3VuZGVmaW5lZCcuIEdvdDogJyR7dHlwZW9mIGhhbmRsZXJ9J2ApO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkZWYudHlwZSA9PT0gJ3F1ZXJ5Jykge1xuICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYWN0aXZhdG9yLnF1ZXJ5SGFuZGxlcnMuc2V0KGRlZi5uYW1lLCB7IGhhbmRsZXI6IGhhbmRsZXIgYXMgYW55LCBkZXNjcmlwdGlvbiB9KTtcbiAgICB9IGVsc2UgaWYgKGhhbmRsZXIgPT0gbnVsbCkge1xuICAgICAgYWN0aXZhdG9yLnF1ZXJ5SGFuZGxlcnMuZGVsZXRlKGRlZi5uYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgaGFuZGxlciB0byBiZSBlaXRoZXIgYSBmdW5jdGlvbiBvciAndW5kZWZpbmVkJy4gR290OiAnJHt0eXBlb2YgaGFuZGxlcn0nYCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEludmFsaWQgZGVmaW5pdGlvbiB0eXBlOiAkeyhkZWYgYXMgYW55KS50eXBlfWApO1xuICB9XG59XG5cbi8qKlxuICogU2V0IGEgc2lnbmFsIGhhbmRsZXIgZnVuY3Rpb24gdGhhdCB3aWxsIGhhbmRsZSBzaWduYWxzIGNhbGxzIGZvciBub24tcmVnaXN0ZXJlZCBzaWduYWwgbmFtZXMuXG4gKlxuICogU2lnbmFscyBhcmUgZGlzcGF0Y2hlZCB0byB0aGUgZGVmYXVsdCBzaWduYWwgaGFuZGxlciBpbiB0aGUgb3JkZXIgdGhhdCB0aGV5IHdlcmUgYWNjZXB0ZWQgYnkgdGhlIHNlcnZlci5cbiAqXG4gKiBJZiB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBmb3IgYSBnaXZlbiBzaWduYWwgb3IgcXVlcnkgbmFtZSB0aGUgbGFzdCBoYW5kbGVyIHdpbGwgb3ZlcndyaXRlIGFueSBwcmV2aW91cyBjYWxscy5cbiAqXG4gKiBAcGFyYW0gaGFuZGxlciBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBoYW5kbGUgc2lnbmFscyBmb3Igbm9uLXJlZ2lzdGVyZWQgc2lnbmFsIG5hbWVzLCBvciBgdW5kZWZpbmVkYCB0byB1bnNldCB0aGUgaGFuZGxlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldERlZmF1bHRTaWduYWxIYW5kbGVyKGhhbmRsZXI6IERlZmF1bHRTaWduYWxIYW5kbGVyIHwgdW5kZWZpbmVkKTogdm9pZCB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5zZXREZWZhdWx0U2lnbmFsSGFuZGxlciguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nXG4gICk7XG4gIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGFjdGl2YXRvci5kZWZhdWx0U2lnbmFsSGFuZGxlciA9IGhhbmRsZXI7XG4gICAgYWN0aXZhdG9yLmRpc3BhdGNoQnVmZmVyZWRTaWduYWxzKCk7XG4gIH0gZWxzZSBpZiAoaGFuZGxlciA9PSBudWxsKSB7XG4gICAgYWN0aXZhdG9yLmRlZmF1bHRTaWduYWxIYW5kbGVyID0gdW5kZWZpbmVkO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGhhbmRsZXIgdG8gYmUgZWl0aGVyIGEgZnVuY3Rpb24gb3IgJ3VuZGVmaW5lZCcuIEdvdDogJyR7dHlwZW9mIGhhbmRsZXJ9J2ApO1xuICB9XG59XG5cbi8qKlxuICogVXBkYXRlcyB0aGlzIFdvcmtmbG93J3MgU2VhcmNoIEF0dHJpYnV0ZXMgYnkgbWVyZ2luZyB0aGUgcHJvdmlkZWQgYHNlYXJjaEF0dHJpYnV0ZXNgIHdpdGggdGhlIGV4aXN0aW5nIFNlYXJjaFxuICogQXR0cmlidXRlcywgYHdvcmtmbG93SW5mbygpLnNlYXJjaEF0dHJpYnV0ZXNgLlxuICpcbiAqIEZvciBleGFtcGxlLCB0aGlzIFdvcmtmbG93IGNvZGU6XG4gKlxuICogYGBgdHNcbiAqIHVwc2VydFNlYXJjaEF0dHJpYnV0ZXMoe1xuICogICBDdXN0b21JbnRGaWVsZDogWzFdLFxuICogICBDdXN0b21Cb29sRmllbGQ6IFt0cnVlXVxuICogfSk7XG4gKiB1cHNlcnRTZWFyY2hBdHRyaWJ1dGVzKHtcbiAqICAgQ3VzdG9tSW50RmllbGQ6IFs0Ml0sXG4gKiAgIEN1c3RvbUtleXdvcmRGaWVsZDogWydkdXJhYmxlIGNvZGUnLCAnaXMgZ3JlYXQnXVxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiB3b3VsZCByZXN1bHQgaW4gdGhlIFdvcmtmbG93IGhhdmluZyB0aGVzZSBTZWFyY2ggQXR0cmlidXRlczpcbiAqXG4gKiBgYGB0c1xuICoge1xuICogICBDdXN0b21JbnRGaWVsZDogWzQyXSxcbiAqICAgQ3VzdG9tQm9vbEZpZWxkOiBbdHJ1ZV0sXG4gKiAgIEN1c3RvbUtleXdvcmRGaWVsZDogWydkdXJhYmxlIGNvZGUnLCAnaXMgZ3JlYXQnXVxuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIHNlYXJjaEF0dHJpYnV0ZXMgVGhlIFJlY29yZCB0byBtZXJnZS4gVXNlIGEgdmFsdWUgb2YgYFtdYCB0byBjbGVhciBhIFNlYXJjaCBBdHRyaWJ1dGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cHNlcnRTZWFyY2hBdHRyaWJ1dGVzKHNlYXJjaEF0dHJpYnV0ZXM6IFNlYXJjaEF0dHJpYnV0ZXMpOiB2b2lkIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LnVwc2VydFNlYXJjaEF0dHJpYnV0ZXMoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJ1xuICApO1xuXG4gIGlmIChzZWFyY2hBdHRyaWJ1dGVzID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlYXJjaEF0dHJpYnV0ZXMgbXVzdCBiZSBhIG5vbi1udWxsIFNlYXJjaEF0dHJpYnV0ZXMnKTtcbiAgfVxuXG4gIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgdXBzZXJ0V29ya2Zsb3dTZWFyY2hBdHRyaWJ1dGVzOiB7XG4gICAgICBzZWFyY2hBdHRyaWJ1dGVzOiBtYXBUb1BheWxvYWRzKHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIsIHNlYXJjaEF0dHJpYnV0ZXMpLFxuICAgIH0sXG4gIH0pO1xuXG4gIGFjdGl2YXRvci5tdXRhdGVXb3JrZmxvd0luZm8oKGluZm86IFdvcmtmbG93SW5mbyk6IFdvcmtmbG93SW5mbyA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmluZm8sXG4gICAgICBzZWFyY2hBdHRyaWJ1dGVzOiB7XG4gICAgICAgIC4uLmluZm8uc2VhcmNoQXR0cmlidXRlcyxcbiAgICAgICAgLi4uc2VhcmNoQXR0cmlidXRlcyxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSk7XG59XG5cbmV4cG9ydCBjb25zdCBzdGFja1RyYWNlUXVlcnkgPSBkZWZpbmVRdWVyeTxzdHJpbmc+KCdfX3N0YWNrX3RyYWNlJyk7XG5leHBvcnQgY29uc3QgZW5oYW5jZWRTdGFja1RyYWNlUXVlcnkgPSBkZWZpbmVRdWVyeTxFbmhhbmNlZFN0YWNrVHJhY2U+KCdfX2VuaGFuY2VkX3N0YWNrX3RyYWNlJyk7XG5leHBvcnQgY29uc3Qgd29ya2Zsb3dNZXRhZGF0YVF1ZXJ5ID0gZGVmaW5lUXVlcnk8dGVtcG9yYWwuYXBpLnNkay52MS5JV29ya2Zsb3dNZXRhZGF0YT4oJ19fdGVtcG9yYWxfd29ya2Zsb3dfbWV0YWRhdGEnKTtcbiIsImltcG9ydCB7XG4gIHByb3h5QWN0aXZpdGllcyxcbiAgcHJveHlMb2NhbEFjdGl2aXRpZXMsXG4gIGRlZmluZVNpZ25hbCxcbiAgc2V0SGFuZGxlcixcbiAgY29uZGl0aW9uLFxuICBsb2csXG4gIHN0YXJ0Q2hpbGQsXG4gIHNsZWVwLFxuICBnZXRFeHRlcm5hbFdvcmtmbG93SGFuZGxlLFxuICBkZWZpbmVRdWVyeSxcbiAgY29udGludWVBc05ldyxcbiAgUGFyZW50Q2xvc2VQb2xpY3ksXG4gIEFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZSxcbiAgQ2FuY2VsbGF0aW9uU2NvcGUsXG4gIGlzQ2FuY2VsbGF0aW9uLFxufSBmcm9tICdAdGVtcG9yYWxpby93b3JrZmxvdyc7XG5cbmltcG9ydCB7IGJ1aWxkR2FtZUFjdGl2aXRpZXMsIGJ1aWxkV29ya2VyQWN0aXZpdGllcywgYnVpbGRUcmFja2VyQWN0aXZpdGllcywgRXZlbnQgfSBmcm9tICcuL2FjdGl2aXRpZXMnO1xuaW1wb3J0IHsgR2FtZUNvbmZpZywgR2FtZSwgVGVhbXMsIFJvdW5kLCBTbmFrZSwgU25ha2VzLCBEaXJlY3Rpb24sIFBvaW50LCBTZWdtZW50IH0gZnJvbSAnLi90eXBlcyc7XG5cbmNvbnN0IFJPVU5EX1dGX0lEID0gJ1NuYWtlR2FtZVJvdW5kJztcbmNvbnN0IEFQUExFX1BPSU5UUyA9IDEwO1xuY29uc3QgU05BS0VfTU9WRVNfQkVGT1JFX0NBTiA9IDUwO1xuY29uc3QgU05BS0VfV09SS0VSX0RPV05fVElNRSA9ICcxIHNlY29uZHMnO1xuXG5jb25zdCB7IGVtaXQgfSA9IHByb3h5TG9jYWxBY3Rpdml0aWVzPFJldHVyblR5cGU8dHlwZW9mIGJ1aWxkR2FtZUFjdGl2aXRpZXM+Pih7XG4gIHN0YXJ0VG9DbG9zZVRpbWVvdXQ6ICcxIHNlY29uZHMnLFxufSk7XG5cbmNvbnN0IHsgc25ha2VXb3JrZXIgfSA9IHByb3h5QWN0aXZpdGllczxSZXR1cm5UeXBlPHR5cGVvZiBidWlsZFdvcmtlckFjdGl2aXRpZXM+Pih7XG4gIHRhc2tRdWV1ZTogJ3NuYWtlLXdvcmtlcnMnLFxuICBzdGFydFRvQ2xvc2VUaW1lb3V0OiAnMSBob3VyJyxcbiAgaGVhcnRiZWF0VGltZW91dDogNTAwLFxuICBjYW5jZWxsYXRpb25UeXBlOiBBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUuV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVELFxufSk7XG5cbmNvbnN0IHsgc25ha2VUcmFja2VyIH0gPSBwcm94eUFjdGl2aXRpZXM8UmV0dXJuVHlwZTx0eXBlb2YgYnVpbGRUcmFja2VyQWN0aXZpdGllcz4+KHtcbiAgaGVhcnRiZWF0VGltZW91dDogNTAwLFxuICBzdGFydFRvQ2xvc2VUaW1lb3V0OiAnMSBob3VyJyxcbiAgY2FuY2VsbGF0aW9uVHlwZTogQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlLldBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRCxcbiAgcmV0cnk6IHtcbiAgICBpbml0aWFsSW50ZXJ2YWw6IDEsXG4gICAgYmFja29mZkNvZWZmaWNpZW50OiAxLFxuICB9LFxufSk7XG5cbmZ1bmN0aW9uIHJhbmRvbURpcmVjdGlvbigpOiBEaXJlY3Rpb24ge1xuICBjb25zdCBkaXJlY3Rpb25zOiBEaXJlY3Rpb25bXSA9IFsndXAnLCAnZG93bicsICdsZWZ0JywgJ3JpZ2h0J107XG4gIHJldHVybiBkaXJlY3Rpb25zW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGRpcmVjdGlvbnMubGVuZ3RoKV07XG59XG5cbmZ1bmN0aW9uIG9wcG9zaXRlRGlyZWN0aW9uKGRpcmVjdGlvbjogRGlyZWN0aW9uKTogRGlyZWN0aW9uIHtcbiAgaWYgKGRpcmVjdGlvbiA9PT0gJ3VwJykge1xuICAgIHJldHVybiAnZG93bic7XG4gIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSAnZG93bicpIHtcbiAgICByZXR1cm4gJ3VwJztcbiAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09ICdsZWZ0Jykge1xuICAgIHJldHVybiAncmlnaHQnO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnbGVmdCc7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGdhbWVTdGF0ZVF1ZXJ5ID0gZGVmaW5lUXVlcnk8R2FtZT4oJ2dhbWVTdGF0ZScpO1xuZXhwb3J0IGNvbnN0IHJvdW5kU3RhdGVRdWVyeSA9IGRlZmluZVF1ZXJ5PFJvdW5kPigncm91bmRTdGF0ZScpO1xuXG5leHBvcnQgY29uc3QgZ2FtZUZpbmlzaFNpZ25hbCA9IGRlZmluZVNpZ25hbCgnZ2FtZUZpbmlzaCcpO1xuXG50eXBlIFJvdW5kU3RhcnRTaWduYWwgPSB7XG4gIHNuYWtlczogU25ha2VbXTtcbn1cbi8vIFVJIC0+IEdhbWVXb3JrZmxvdyB0byBzdGFydCByb3VuZFxuZXhwb3J0IGNvbnN0IHJvdW5kU3RhcnRTaWduYWwgPSBkZWZpbmVTaWduYWw8W1JvdW5kU3RhcnRTaWduYWxdPigncm91bmRTdGFydCcpO1xuXG4vLyBQbGF5ZXIgVUkgLT4gU25ha2VXb3JrZmxvdyB0byBjaGFuZ2UgZGlyZWN0aW9uXG5leHBvcnQgY29uc3Qgc25ha2VDaGFuZ2VEaXJlY3Rpb25TaWduYWwgPSBkZWZpbmVTaWduYWw8W0RpcmVjdGlvbl0+KCdzbmFrZUNoYW5nZURpcmVjdGlvbicpO1xuXG4vLyAoSW50ZXJuYWwpIFNuYWtlV29ya2Zsb3cgLT4gUm91bmQgdG8gdHJpZ2dlciBhIG1vdmVcbmV4cG9ydCBjb25zdCBzbmFrZU1vdmVTaWduYWwgPSBkZWZpbmVTaWduYWw8W3N0cmluZywgRGlyZWN0aW9uXT4oJ3NuYWtlTW92ZScpO1xuXG5leHBvcnQgY29uc3Qgd29ya2VyU3RvcFNpZ25hbCA9IGRlZmluZVNpZ25hbCgnd29ya2VyU3RvcCcpO1xuXG50eXBlIFdvcmtlclN0YXJ0ZWRTaWduYWwgPSB7XG4gIGlkZW50aXR5OiBzdHJpbmc7XG59O1xuZXhwb3J0IGNvbnN0IHdvcmtlclN0YXJ0ZWRTaWduYWwgPSBkZWZpbmVTaWduYWw8W1dvcmtlclN0YXJ0ZWRTaWduYWxdPignd29ya2VyU3RhcnRlZCcpO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR2FtZVdvcmtmbG93KGNvbmZpZzogR2FtZUNvbmZpZyk6IFByb21pc2U8dm9pZD4ge1xuICBsb2cuaW5mbygnU3RhcnRpbmcgZ2FtZScpO1xuXG4gIGNvbnN0IGdhbWU6IEdhbWUgPSB7XG4gICAgY29uZmlnLFxuICAgIHRlYW1zOiBjb25maWcudGVhbU5hbWVzLnJlZHVjZTxUZWFtcz4oKGFjYywgbmFtZSkgPT4ge1xuICAgICAgYWNjW25hbWVdID0geyBuYW1lLCBzY29yZTogMCB9O1xuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCB7fSksXG4gIH07XG4gIGxldCBmaW5pc2hlZCA9IGZhbHNlO1xuICBsZXQgcm91bmRTY29wZTogQ2FuY2VsbGF0aW9uU2NvcGU7XG5cbiAgc2V0SGFuZGxlcihnYW1lU3RhdGVRdWVyeSwgKCkgPT4ge1xuICAgIHJldHVybiBnYW1lO1xuICB9KTtcblxuICBzZXRIYW5kbGVyKGdhbWVGaW5pc2hTaWduYWwsICgpID0+IHtcbiAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgcm91bmRTY29wZT8uY2FuY2VsKCk7XG4gIH0pO1xuXG4gIGxldCBuZXdSb3VuZDogUm91bmRXb3JrZmxvd0lucHV0IHwgdW5kZWZpbmVkO1xuICBzZXRIYW5kbGVyKHJvdW5kU3RhcnRTaWduYWwsIGFzeW5jICh7IHNuYWtlcyB9KSA9PiB7XG4gICAgbmV3Um91bmQgPSB7IGNvbmZpZywgdGVhbXM6IGJ1aWxkUm91bmRUZWFtcyhnYW1lKSwgc25ha2VzIH07XG4gIH0pO1xuXG4gIHdoaWxlICghZmluaXNoZWQpIHtcbiAgICBhd2FpdCBjb25kaXRpb24oKCkgPT4gZmluaXNoZWQgfHwgbmV3Um91bmQgIT09IHVuZGVmaW5lZCk7XG4gICAgaWYgKGZpbmlzaGVkKSB7IGJyZWFrOyB9XG5cbiAgICByb3VuZFNjb3BlID0gbmV3IENhbmNlbGxhdGlvblNjb3BlKCk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgcm91bmRTY29wZS5ydW4oYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCByb3VuZFdmID0gYXdhaXQgc3RhcnRDaGlsZChSb3VuZFdvcmtmbG93LCB7XG4gICAgICAgICAgd29ya2Zsb3dJZDogUk9VTkRfV0ZfSUQsXG4gICAgICAgICAgYXJnczogW25ld1JvdW5kIV0sXG4gICAgICAgICAgcGFyZW50Q2xvc2VQb2xpY3k6IFBhcmVudENsb3NlUG9saWN5LlBBUkVOVF9DTE9TRV9QT0xJQ1lfUkVRVUVTVF9DQU5DRUwsXG4gICAgICAgIH0pO1xuICAgICAgICBuZXdSb3VuZCA9IHVuZGVmaW5lZDtcblxuICAgICAgICBjb25zdCByb3VuZCA9IGF3YWl0IHJvdW5kV2YucmVzdWx0KCk7XG4gICAgICAgIGZvciAoY29uc3QgdGVhbSBvZiBPYmplY3QudmFsdWVzKHJvdW5kLnRlYW1zKSkge1xuICAgICAgICAgIGdhbWUudGVhbXNbdGVhbS5uYW1lXS5zY29yZSArPSB0ZWFtLnNjb3JlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmICghaXNDYW5jZWxsYXRpb24oZXJyKSkgeyB0aHJvdyhlcnIpOyB9XG4gICAgfVxuICB9XG59XG5cbnR5cGUgUm91bmRXb3JrZmxvd0lucHV0ID0ge1xuICBjb25maWc6IEdhbWVDb25maWc7XG4gIHRlYW1zOiBUZWFtcztcbiAgc25ha2VzOiBTbmFrZVtdO1xufVxuXG50eXBlIFNuYWtlTW92ZSA9IHtcbiAgaWQ6IHN0cmluZztcbiAgZGlyZWN0aW9uOiBEaXJlY3Rpb247XG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUm91bmRXb3JrZmxvdyh7IGNvbmZpZywgdGVhbXMsIHNuYWtlcyB9OiBSb3VuZFdvcmtmbG93SW5wdXQpOiBQcm9taXNlPFJvdW5kPiB7XG4gIGxvZy5pbmZvKCdTdGFydGluZyByb3VuZCcsIHsgY29uZmlnLCB0ZWFtcywgc25ha2VzIH0pO1xuXG4gIGNvbnN0IHJvdW5kOiBSb3VuZCA9IHtcbiAgICBjb25maWc6IGNvbmZpZyxcbiAgICBkdXJhdGlvbjogY29uZmlnLnJvdW5kRHVyYXRpb24sXG4gICAgYXBwbGVzOiB7fSxcbiAgICB0ZWFtczogdGVhbXMsXG4gICAgc25ha2VzOiBzbmFrZXMucmVkdWNlPFNuYWtlcz4oKGFjYywgc25ha2UpID0+IHsgYWNjW3NuYWtlLmlkXSA9IHNuYWtlOyByZXR1cm4gYWNjOyB9LCB7fSksXG4gICAgZmluaXNoZWQ6IGZhbHNlLFxuICB9O1xuXG4gIGNvbnN0IHNuYWtlTW92ZXM6IFNuYWtlTW92ZVtdID0gW107XG4gIGNvbnN0IHdvcmtlcnNTdGFydGVkOiBzdHJpbmdbXSA9IFtdO1xuXG4gIHNldEhhbmRsZXIocm91bmRTdGF0ZVF1ZXJ5LCAoKSA9PiB7XG4gICAgcmV0dXJuIHJvdW5kO1xuICB9KTtcblxuICBzZXRIYW5kbGVyKHNuYWtlTW92ZVNpZ25hbCwgYXN5bmMgKGlkLCBkaXJlY3Rpb24pID0+IHtcbiAgICBpZiAocm91bmQuZmluaXNoZWQpIHsgcmV0dXJuOyB9XG4gICAgc25ha2VNb3Zlcy5wdXNoKHsgaWQsIGRpcmVjdGlvbiB9KTtcbiAgfSk7XG5cbiAgc2V0SGFuZGxlcih3b3JrZXJTdGFydGVkU2lnbmFsLCBhc3luYyAoeyBpZGVudGl0eSB9KSA9PiB7XG4gICAgaWYgKHJvdW5kLmZpbmlzaGVkKSB7IHJldHVybjsgfVxuICAgIHdvcmtlcnNTdGFydGVkLnB1c2goaWRlbnRpdHkpO1xuICB9KTtcblxuICBjb25zdCBwcm9jZXNzU2lnbmFscyA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBldmVudHM6IEV2ZW50W10gPSBbXTtcbiAgICBjb25zdCBhcHBsZXNFYXRlbjogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBzaWduYWxzID0gW107XG5cbiAgICBmb3IgKGNvbnN0IG1vdmUgb2Ygc25ha2VNb3Zlcykge1xuICAgICAgY29uc3Qgc25ha2UgPSByb3VuZC5zbmFrZXNbbW92ZS5pZF07XG4gICAgICBtb3ZlU25ha2Uocm91bmQsIHNuYWtlLCBtb3ZlLmRpcmVjdGlvbik7XG4gICAgICBldmVudHMucHVzaCh7IHR5cGU6ICdzbmFrZU1vdmVkJywgcGF5bG9hZDogeyBzbmFrZUlkOiBtb3ZlLmlkLCBzZWdtZW50czogc25ha2Uuc2VnbWVudHMgfSB9KTtcbiAgICAgIGlmIChzbmFrZS5hdGVBcHBsZUlkKSB7XG4gICAgICAgIGFwcGxlc0VhdGVuLnB1c2goc25ha2UuYXRlQXBwbGVJZCk7XG4gICAgICAgIHJvdW5kLnRlYW1zW3NuYWtlLnRlYW1OYW1lXS5zY29yZSArPSBBUFBMRV9QT0lOVFM7XG4gICAgICAgIHNuYWtlLmF0ZUFwcGxlSWQgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBhcHBsZUlkIG9mIGFwcGxlc0VhdGVuKSB7XG4gICAgICBpZiAoY29uZmlnLmtpbGxXb3JrZXJzKSB7XG4gICAgICAgIGNvbnN0IHdvcmtlciA9IGdldEV4dGVybmFsV29ya2Zsb3dIYW5kbGUoYXBwbGVJZCk7XG4gICAgICAgIHNpZ25hbHMucHVzaCh3b3JrZXIuc2lnbmFsKHdvcmtlclN0b3BTaWduYWwpKTtcbiAgICAgICAgZXZlbnRzLnB1c2goeyB0eXBlOiAnd29ya2VyOnN0b3AnLCBwYXlsb2FkOiB7IGlkZW50aXR5OiBhcHBsZUlkIH0gfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3b3JrZXJzU3RhcnRlZC5wdXNoKGFwcGxlSWQpO1xuICAgICAgfVxuICAgICAgZGVsZXRlIHJvdW5kLmFwcGxlc1thcHBsZUlkXTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHdvcmtlcklkIG9mIHdvcmtlcnNTdGFydGVkKSB7XG4gICAgICByb3VuZC5hcHBsZXNbd29ya2VySWRdID0gcmFuZG9tRW1wdHlQb2ludChyb3VuZCk7XG4gICAgICBldmVudHMucHVzaCh7IHR5cGU6ICd3b3JrZXI6c3RhcnQnLCBwYXlsb2FkOiB7IGlkZW50aXR5OiB3b3JrZXJJZCB9IH0pO1xuICAgIH1cblxuICAgIGlmIChhcHBsZXNFYXRlbi5sZW5ndGggfHwgd29ya2Vyc1N0YXJ0ZWQubGVuZ3RoKSB7XG4gICAgICBldmVudHMucHVzaCh7IHR5cGU6ICdyb3VuZFVwZGF0ZScsIHBheWxvYWQ6IHsgcm91bmQgfSB9KTtcbiAgICB9XG5cbiAgICBzbmFrZU1vdmVzLmxlbmd0aCA9IDA7XG4gICAgd29ya2Vyc1N0YXJ0ZWQubGVuZ3RoID0gMDtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKFtlbWl0KGV2ZW50cyksIC4uLnNpZ25hbHNdKTtcbiAgfVxuXG4gIHJhbmRvbWl6ZVJvdW5kKHJvdW5kKTtcblxuICBjb25zdCB3b3JrZXJDb3VudCA9IHNuYWtlcy5sZW5ndGggKiAyO1xuXG4gIHRyeSB7XG4gICAgYXdhaXQgc3RhcnRXb3JrZXJNYW5hZ2Vycyh3b3JrZXJDb3VudCk7XG4gICAgYXdhaXQgc3RhcnRTbmFrZVRyYWNrZXJzKHJvdW5kLnNuYWtlcyk7XG4gICAgYXdhaXQgc3RhcnRTbmFrZXMocm91bmQuY29uZmlnLCByb3VuZC5zbmFrZXMpO1xuICAgIGF3YWl0IGVtaXQoW3sgdHlwZTogJ3JvdW5kTG9hZGluZycsIHBheWxvYWQ6IHsgcm91bmQgfSB9XSk7XG5cbiAgICAvLyBXYWl0IGZvciBhbGwgd29ya2VycyB0byByZWdpc3RlclxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBhd2FpdCBjb25kaXRpb24oKCkgPT4gd29ya2Vyc1N0YXJ0ZWQubGVuZ3RoID4gMCk7XG4gICAgICBhd2FpdCBwcm9jZXNzU2lnbmFscygpO1xuICAgICAgaWYgKE9iamVjdC5rZXlzKHJvdW5kLmFwcGxlcykubGVuZ3RoID09PSB3b3JrZXJDb3VudCkgeyBicmVhazsgfVxuICAgIH1cblxuICAgIC8vIFN0YXJ0IHRoZSByb3VuZFxuICAgIHJvdW5kLnN0YXJ0ZWRBdCA9IERhdGUubm93KCk7XG5cbiAgICBQcm9taXNlLnJhY2UoW1xuICAgICAgc2xlZXAocm91bmQuZHVyYXRpb24gKiAxMDAwKSxcbiAgICAgIENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKS5jYW5jZWxSZXF1ZXN0ZWQsXG4gICAgXSlcbiAgICAudGhlbigoKSA9PiBsb2cuaW5mbygnUm91bmQgdGltZXIgZXhwaXJlZCcpKVxuICAgIC5jYXRjaCgoKSA9PiBsb2cuaW5mbygnUm91bmQgY2FuY2VsbGVkJykpXG4gICAgLmZpbmFsbHkoKCkgPT4gcm91bmQuZmluaXNoZWQgPSB0cnVlKTtcblxuICAgIGxvZy5pbmZvKCdSb3VuZCBzdGFydGVkJywgeyByb3VuZCB9KTtcbiAgICBhd2FpdCBlbWl0KFt7IHR5cGU6ICdyb3VuZFN0YXJ0ZWQnLCBwYXlsb2FkOiB7IHJvdW5kIH0gfV0pO1xuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGF3YWl0IGNvbmRpdGlvbigoKSA9PiByb3VuZC5maW5pc2hlZCB8fCBzbmFrZU1vdmVzLmxlbmd0aCA+IDAgfHwgd29ya2Vyc1N0YXJ0ZWQubGVuZ3RoID4gMCk7XG4gICAgICBpZiAocm91bmQuZmluaXNoZWQpIHsgYnJlYWs7IH1cblxuICAgICAgYXdhaXQgcHJvY2Vzc1NpZ25hbHMoKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmICghaXNDYW5jZWxsYXRpb24oZXJyKSkge1xuICAgICAgdGhyb3coZXJyKTtcbiAgICB9XG4gIH0gZmluYWxseSB7XG4gICAgcm91bmQuZmluaXNoZWQgPSB0cnVlO1xuICB9XG5cbiAgYXdhaXQgQ2FuY2VsbGF0aW9uU2NvcGUubm9uQ2FuY2VsbGFibGUoYXN5bmMgKCkgPT4ge1xuICAgIGF3YWl0IGVtaXQoW3sgdHlwZTogJ3JvdW5kRmluaXNoZWQnLCBwYXlsb2FkOiB7IHJvdW5kIH0gfV0pO1xuICB9KTtcblxuICBsb2cuaW5mbygnUm91bmQgZmluaXNoZWQnLCB7IHJvdW5kIH0pO1xuXG4gIHJldHVybiByb3VuZDtcbn1cblxudHlwZSBTbmFrZVdvcmtlcldvcmtmbG93SW5wdXQgPSB7XG4gIHJvdW5kSWQ6IHN0cmluZztcbiAgaWRlbnRpdHk6IHN0cmluZztcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBTbmFrZVdvcmtlcldvcmtmbG93KHsgcm91bmRJZCwgaWRlbnRpdHkgfTogU25ha2VXb3JrZXJXb3JrZmxvd0lucHV0KTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHJvdW5kID0gZ2V0RXh0ZXJuYWxXb3JrZmxvd0hhbmRsZShyb3VuZElkKTtcbiAgbGV0IHNjb3BlOiBDYW5jZWxsYXRpb25TY29wZSB8IHVuZGVmaW5lZDtcblxuICBzZXRIYW5kbGVyKHdvcmtlclN0b3BTaWduYWwsICgpID0+IHtcbiAgICBpZiAoc2NvcGUpIHsgc2NvcGUuY2FuY2VsKCkgfVxuICB9KTtcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIHRyeSB7XG4gICAgICBzY29wZSA9IG5ldyBDYW5jZWxsYXRpb25TY29wZSgpO1xuICAgICAgYXdhaXQgc2NvcGUucnVuKCgpID0+IHNuYWtlV29ya2VyKHJvdW5kSWQsIGlkZW50aXR5KSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGlzQ2FuY2VsbGF0aW9uKGUpKSB7XG4gICAgICAgIC8vIExldCB3b3JrZXJzIHN0YXJ0IGFnYWluIGZhc3RlciBmb3Igbm93LlxuICAgICAgICBhd2FpdCBzbGVlcChTTkFLRV9XT1JLRVJfRE9XTl9USU1FKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbnR5cGUgU25ha2VXb3JrZmxvd0lucHV0ID0ge1xuICByb3VuZElkOiBzdHJpbmc7XG4gIGlkOiBzdHJpbmc7XG4gIGRpcmVjdGlvbjogRGlyZWN0aW9uO1xuICBub21zUGVyTW92ZTogbnVtYmVyO1xuICBub21EdXJhdGlvbjogbnVtYmVyO1xufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFNuYWtlV29ya2Zsb3coeyByb3VuZElkLCBpZCwgZGlyZWN0aW9uLCBub21zUGVyTW92ZSwgbm9tRHVyYXRpb24gfTogU25ha2VXb3JrZmxvd0lucHV0KTogUHJvbWlzZTx2b2lkPiB7XG4gIHNldEhhbmRsZXIoc25ha2VDaGFuZ2VEaXJlY3Rpb25TaWduYWwsIChuZXdEaXJlY3Rpb24pID0+IHtcbiAgICBkaXJlY3Rpb24gPSBuZXdEaXJlY3Rpb247XG4gIH0pO1xuXG4gIGNvbnN0IHsgc25ha2VOb20gfSA9IHByb3h5QWN0aXZpdGllczxSZXR1cm5UeXBlIDx0eXBlb2YgYnVpbGRHYW1lQWN0aXZpdGllcz4+KHtcbiAgICBzdGFydFRvQ2xvc2VUaW1lb3V0OiBub21EdXJhdGlvbiAqIDIsXG4gICAgcmV0cnk6IHtcbiAgICAgIGluaXRpYWxJbnRlcnZhbDogMSxcbiAgICAgIGJhY2tvZmZDb2VmZmljaWVudDogMSxcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IHJvdW5kID0gZ2V0RXh0ZXJuYWxXb3JrZmxvd0hhbmRsZShyb3VuZElkKTtcbiAgY29uc3Qgbm9tcyA9IEFycmF5LmZyb20oeyBsZW5ndGg6IG5vbXNQZXJNb3ZlIH0pO1xuICBsZXQgbW92ZXMgPSAwO1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwobm9tcy5tYXAoKCkgPT4gc25ha2VOb20oaWQsIG5vbUR1cmF0aW9uKSkpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCByb3VuZC5zaWduYWwoc25ha2VNb3ZlU2lnbmFsLCBpZCwgZGlyZWN0aW9uKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZy5pbmZvKCdDYW5ub3Qgc2lnbmFsIHJvdW5kLCBleGl0aW5nJyk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKG1vdmVzKysgPiBTTkFLRV9NT1ZFU19CRUZPUkVfQ0FOKSB7XG4gICAgICBhd2FpdCBjb250aW51ZUFzTmV3PHR5cGVvZiBTbmFrZVdvcmtmbG93Pih7IHJvdW5kSWQsIGlkLCBkaXJlY3Rpb24sIG5vbXNQZXJNb3ZlLCBub21EdXJhdGlvbiB9KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbW92ZVNuYWtlKHJvdW5kOiBSb3VuZCwgc25ha2U6IFNuYWtlLCBkaXJlY3Rpb246IERpcmVjdGlvbikge1xuICBjb25zdCBjb25maWcgPSByb3VuZC5jb25maWc7XG5cbiAgbGV0IGhlYWRTZWdtZW50ID0gc25ha2Uuc2VnbWVudHNbMF07XG4gIGxldCB0YWlsU2VnbWVudCA9IHNuYWtlLnNlZ21lbnRzW3NuYWtlLnNlZ21lbnRzLmxlbmd0aCAtIDFdO1xuXG4gIGNvbnN0IGN1cnJlbnREaXJlY3Rpb24gPSBoZWFkU2VnbWVudC5kaXJlY3Rpb247XG4gIGxldCBuZXdEaXJlY3Rpb24gPSBkaXJlY3Rpb247XG5cbiAgLy8gWW91IGNhbid0IGdvIGJhY2sgb24geW91cnNlbGZcbiAgaWYgKG5ld0RpcmVjdGlvbiA9PT0gb3Bwb3NpdGVEaXJlY3Rpb24oY3VycmVudERpcmVjdGlvbikpIHtcbiAgICBuZXdEaXJlY3Rpb24gPSBjdXJyZW50RGlyZWN0aW9uO1xuICB9XG5cbiAgbGV0IGN1cnJlbnRIZWFkID0gaGVhZFNlZ21lbnQuaGVhZDtcblxuICAvLyBDcmVhdGUgYSBuZXcgc2VnbWVudCBpZiB3ZSdyZSBjaGFuZ2luZyBkaXJlY3Rpb24gb3IgaGl0dGluZyBhbiBlZGdlXG4gIGlmIChuZXdEaXJlY3Rpb24gIT09IGN1cnJlbnREaXJlY3Rpb24gfHwgYWdhaW5zdEFuRWRnZShyb3VuZCwgY3VycmVudEhlYWQsIGRpcmVjdGlvbikpIHtcbiAgICBoZWFkU2VnbWVudCA9IHsgaGVhZDogeyB4OiBjdXJyZW50SGVhZC54LCB5OiBjdXJyZW50SGVhZC55IH0sIGRpcmVjdGlvbjogbmV3RGlyZWN0aW9uLCBsZW5ndGg6IDAgfTtcbiAgICBzbmFrZS5zZWdtZW50cy51bnNoaWZ0KGhlYWRTZWdtZW50KTtcbiAgfVxuXG4gIGxldCBuZXdIZWFkOiBQb2ludCA9IHsgeDogY3VycmVudEhlYWQueCwgeTogY3VycmVudEhlYWQueSB9O1xuXG4gIC8vIE1vdmUgdGhlIGhlYWQgc2VnbWVudCwgd3JhcHBpbmcgYXJvdW5kIGlmIHdlIGFyZSBtb3ZpbmcgcGFzdCB0aGUgZWRnZVxuICBpZiAobmV3RGlyZWN0aW9uID09PSAndXAnKSB7XG4gICAgbmV3SGVhZC55ID0gbmV3SGVhZC55IDw9IDEgPyBjb25maWcuaGVpZ2h0IDogY3VycmVudEhlYWQueSAtIDE7XG4gIH0gZWxzZSBpZiAobmV3RGlyZWN0aW9uID09PSAnZG93bicpIHtcbiAgICBuZXdIZWFkLnkgPSBuZXdIZWFkLnkgPj0gY29uZmlnLmhlaWdodCA/IDEgOiBjdXJyZW50SGVhZC55ICsgMTtcbiAgfSBlbHNlIGlmIChuZXdEaXJlY3Rpb24gPT09ICdsZWZ0Jykge1xuICAgIG5ld0hlYWQueCA9IG5ld0hlYWQueCA8PSAxID8gY29uZmlnLndpZHRoIDogY3VycmVudEhlYWQueCAtIDE7XG4gIH0gZWxzZSBpZiAobmV3RGlyZWN0aW9uID09PSAncmlnaHQnKSB7XG4gICAgbmV3SGVhZC54ID0gbmV3SGVhZC54ID49IGNvbmZpZy53aWR0aCA/IDEgOiBjdXJyZW50SGVhZC54ICsgMTtcbiAgfVxuXG4gIC8vIENoZWNrIGlmIHdlJ3ZlIGhpdCBhbm90aGVyIHNuYWtlXG4gIGlmIChzbmFrZUF0KHJvdW5kLCBuZXdIZWFkKSkge1xuICAgIC8vIFRydW5jYXRlIHRoZSBzbmFrZSB0byBqdXN0IHRoZSBoZWFkLCBhbmQgaWdub3JlIHRoZSByZXF1ZXN0ZWQgbW92ZVxuICAgIGhlYWRTZWdtZW50Lmxlbmd0aCA9IDE7XG4gICAgc25ha2Uuc2VnbWVudHMgPSBbaGVhZFNlZ21lbnRdO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIENoZWNrIGlmIHdlJ3ZlIGhpdCBhbiBhcHBsZVxuICBjb25zdCBhcHBsZUlkID0gYXBwbGVBdChyb3VuZCwgbmV3SGVhZCk7XG4gIGlmIChhcHBsZUlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAvLyBTbmFrZSBhdGUgYW4gYXBwbGUsIHNldCBhcHBsZUlkXG4gICAgc25ha2UuYXRlQXBwbGVJZCA9IGFwcGxlSWQ7XG4gICAgdGFpbFNlZ21lbnQubGVuZ3RoICs9IDE7ICAvLyBHcm93IHRoZSBzbmFrZSBieSBpbmNyZWFzaW5nIHRoZSB0YWlsIGxlbmd0aFxuICB9XG5cbiAgaGVhZFNlZ21lbnQuaGVhZCA9IG5ld0hlYWQ7XG5cbiAgLy8gTWFuYWdlIHNuYWtlIHNlZ21lbnQgZ3Jvd3RoIGFuZCBzaHJpbmtpbmdcbiAgaWYgKHNuYWtlLnNlZ21lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICBoZWFkU2VnbWVudC5sZW5ndGggKz0gMTtcbiAgICB0YWlsU2VnbWVudC5sZW5ndGggLT0gMTtcblxuICAgIC8vIFJlbW92ZSB0aGUgdGFpbCBzZWdtZW50IGlmIGl0cyBsZW5ndGggcmVhY2hlcyAwXG4gICAgaWYgKHRhaWxTZWdtZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgc25ha2Uuc2VnbWVudHMucG9wKCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFnYWluc3RBbkVkZ2Uocm91bmQ6IFJvdW5kLCBwb2ludDogUG9pbnQsIGRpcmVjdGlvbjogRGlyZWN0aW9uKTogYm9vbGVhbiB7XG4gIGlmIChkaXJlY3Rpb24gPT09ICd1cCcpIHtcbiAgICByZXR1cm4gcG9pbnQueSA9PT0gMTtcbiAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09ICdkb3duJykge1xuICAgIHJldHVybiBwb2ludC55ID09PSByb3VuZC5jb25maWcuaGVpZ2h0O1xuICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gJ2xlZnQnKSB7XG4gICAgcmV0dXJuIHBvaW50LnggPT09IDE7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHBvaW50LnggPT09IHJvdW5kLmNvbmZpZy53aWR0aDtcbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBsZUF0KHJvdW5kOiBSb3VuZCwgcG9pbnQ6IFBvaW50KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgZm9yIChjb25zdCBbaWQsIGFwcGxlXSBvZiBPYmplY3QuZW50cmllcyhyb3VuZC5hcHBsZXMpKSB7XG4gICAgaWYgKGFwcGxlLnggPT09IHBvaW50LnggJiYgYXBwbGUueSA9PT0gcG9pbnQueSkge1xuICAgICAgcmV0dXJuIGlkO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVQb3NpdGlvbihzZWdtZW50OiBTZWdtZW50KTogeyB0OiBudW1iZXIsIGw6IG51bWJlciwgYjogbnVtYmVyLCByOiBudW1iZXIgfSB7XG4gIGNvbnN0IHsgZGlyZWN0aW9uLCBoZWFkOiBzdGFydCwgbGVuZ3RoIH0gPSBzZWdtZW50O1xuICBsZXQgW3QsIGJdID0gW3N0YXJ0LnksIHN0YXJ0LnldO1xuICBsZXQgW2wsIHJdID0gW3N0YXJ0LngsIHN0YXJ0LnhdO1xuXG4gIGlmIChkaXJlY3Rpb24gPT09ICd1cCcpIHtcbiAgICBiID0gdCArIChsZW5ndGggLSAxKTtcbiAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09ICdkb3duJykge1xuICAgIHQgPSBiIC0gKGxlbmd0aCAtIDEpO1xuICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gJ2xlZnQnKSB7XG4gICAgciA9IGwgKyAobGVuZ3RoIC0gMSk7XG4gIH0gZWxzZSB7XG4gICAgbCA9IHIgLSAobGVuZ3RoIC0gMSk7XG4gIH1cblxuICByZXR1cm4geyB0LCBsLCBiLCByIH07XG59XG5cbmZ1bmN0aW9uIHNuYWtlQXQocm91bmQ6IFJvdW5kLCBwb2ludDogUG9pbnQpOiBTbmFrZSB8IHVuZGVmaW5lZCB7XG4gIGZvciAoY29uc3Qgc25ha2Ugb2YgT2JqZWN0LnZhbHVlcyhyb3VuZC5zbmFrZXMpKSB7XG4gICAgZm9yIChjb25zdCBzZWdtZW50IG9mIHNuYWtlLnNlZ21lbnRzKSB7XG4gICAgICBjb25zdCBwb3MgPSBjYWxjdWxhdGVQb3NpdGlvbihzZWdtZW50KTtcblxuICAgICAgaWYgKHBvaW50LnggPj0gcG9zLmwgJiYgcG9pbnQueCA8PSBwb3MuciAmJiBwb2ludC55ID49IHBvcy50ICYmIHBvaW50LnkgPD0gcG9zLmIpIHtcbiAgICAgICAgcmV0dXJuIHNuYWtlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIHJhbmRvbUVtcHR5UG9pbnQocm91bmQ6IFJvdW5kKTogUG9pbnQge1xuICBsZXQgcG9pbnQgPSB7IHg6IE1hdGguY2VpbChNYXRoLnJhbmRvbSgpICogcm91bmQuY29uZmlnLndpZHRoKSwgeTogTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkgKiByb3VuZC5jb25maWcuaGVpZ2h0KSB9O1xuICAvLyBDaGVjayBpZiBhbnkgYXBwbGUgaXMgYXQgdGhlIHBvaW50XG4gIHdoaWxlIChhcHBsZUF0KHJvdW5kLCBwb2ludCkgfHwgc25ha2VBdChyb3VuZCwgcG9pbnQpKSB7XG4gICAgcG9pbnQgPSB7IHg6IE1hdGguY2VpbChNYXRoLnJhbmRvbSgpICogcm91bmQuY29uZmlnLndpZHRoKSwgeTogTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkgKiByb3VuZC5jb25maWcuaGVpZ2h0KSB9O1xuICB9XG4gIHJldHVybiBwb2ludDtcbn1cblxuZnVuY3Rpb24gYnVpbGRSb3VuZFRlYW1zKGdhbWU6IEdhbWUpOiBUZWFtcyB7XG4gIGNvbnN0IHRlYW1zOiBUZWFtcyA9IHt9O1xuXG4gIGZvciAoY29uc3QgdGVhbSBvZiBPYmplY3QudmFsdWVzKGdhbWUudGVhbXMpKSB7XG4gICAgdGVhbXNbdGVhbS5uYW1lXSA9IHsgbmFtZTogdGVhbS5uYW1lLCBzY29yZTogMCB9O1xuICB9XG5cbiAgcmV0dXJuIHRlYW1zO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzdGFydFdvcmtlck1hbmFnZXJzKGNvdW50OiBudW1iZXIpIHtcbiAgY29uc3Qgc25ha2VXb3JrZXJNYW5hZ2VycyA9IEFycmF5LmZyb20oeyBsZW5ndGg6IGNvdW50IH0pLm1hcCgoXywgaSkgPT4ge1xuICAgIGNvbnN0IGlkZW50aXR5ID0gYHNuYWtlLXdvcmtlci0ke2kgKyAxfWA7XG4gICAgcmV0dXJuIHN0YXJ0Q2hpbGQoU25ha2VXb3JrZXJXb3JrZmxvdywge1xuICAgICAgd29ya2Zsb3dJZDogaWRlbnRpdHksXG4gICAgICBhcmdzOiBbeyByb3VuZElkOiBST1VORF9XRl9JRCwgaWRlbnRpdHkgfV0sXG4gICAgfSk7XG4gIH0pXG4gIHRyeSB7XG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoc25ha2VXb3JrZXJNYW5hZ2Vycyk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGxvZy5lcnJvcignRmFpbGVkIHRvIHN0YXJ0IHdvcmtlciBtYW5hZ2VycycsIHsgZXJyb3I6IGVyciB9KTtcbiAgICB0aHJvdyhlcnIpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN0YXJ0U25ha2VUcmFja2VycyhzbmFrZXM6IFNuYWtlcykge1xuICBmb3IgKGNvbnN0IHNuYWtlIG9mIE9iamVjdC52YWx1ZXMoc25ha2VzKSkge1xuICAgIHNuYWtlVHJhY2tlcihzbmFrZS5pZCk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gc3RhcnRTbmFrZXMoY29uZmlnOiBHYW1lQ29uZmlnLCBzbmFrZXM6IFNuYWtlcykge1xuICBjb25zdCBjb21tYW5kcyA9IE9iamVjdC52YWx1ZXMoc25ha2VzKS5tYXAoKHNuYWtlKSA9PlxuICAgIHN0YXJ0Q2hpbGQoU25ha2VXb3JrZmxvdywge1xuICAgICAgd29ya2Zsb3dJZDogc25ha2UuaWQsXG4gICAgICB0YXNrUXVldWU6ICdzbmFrZXMnLFxuICAgICAgd29ya2Zsb3dUYXNrVGltZW91dDogNTAwLFxuICAgICAgYXJnczogW3tcbiAgICAgICAgcm91bmRJZDogUk9VTkRfV0ZfSUQsXG4gICAgICAgIGlkOiBzbmFrZS5pZCxcbiAgICAgICAgZGlyZWN0aW9uOiBzbmFrZS5zZWdtZW50c1swXS5kaXJlY3Rpb24sXG4gICAgICAgIG5vbXNQZXJNb3ZlOiBjb25maWcubm9tc1Blck1vdmUsXG4gICAgICAgIG5vbUR1cmF0aW9uOiBjb25maWcubm9tRHVyYXRpb24sXG4gICAgICB9XVxuICAgIH0pXG4gIClcblxuICB0cnkge1xuICAgIGF3YWl0IFByb21pc2UuYWxsKGNvbW1hbmRzKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgbG9nLmVycm9yKCdGYWlsZWQgdG8gc3RhcnQgc25ha2VzJywgeyBlcnJvcjogZXJyIH0pO1xuICAgIHRocm93KGVycik7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmFuZG9taXplUm91bmQocm91bmQ6IFJvdW5kKSB7XG4gIGZvciAoY29uc3Qgc25ha2Ugb2YgT2JqZWN0LnZhbHVlcyhyb3VuZC5zbmFrZXMpKSB7XG4gICAgc25ha2Uuc2VnbWVudHMgPSBbXG4gICAgICB7IGhlYWQ6IHJhbmRvbUVtcHR5UG9pbnQocm91bmQpLCBkaXJlY3Rpb246IHJhbmRvbURpcmVjdGlvbigpLCBsZW5ndGg6IDEgfVxuICAgIF1cbiAgfVxufVxuIiwiLyogKGlnbm9yZWQpICovIiwiLyogKGlnbm9yZWQpICovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vLyBIZWxwZXJzLlxuY29uc3QgcyA9IDEwMDA7XG5jb25zdCBtID0gcyAqIDYwO1xuY29uc3QgaCA9IG0gKiA2MDtcbmNvbnN0IGQgPSBoICogMjQ7XG5jb25zdCB3ID0gZCAqIDc7XG5jb25zdCB5ID0gZCAqIDM2NS4yNTtcbmZ1bmN0aW9uIG1zKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnM/LmxvbmcgPyBmbXRMb25nKHZhbHVlKSA6IGZtdFNob3J0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZhbHVlIGlzIG5vdCBhIHN0cmluZyBvciBudW1iZXIuJyk7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gaXNFcnJvcihlcnJvcilcbiAgICAgICAgICAgID8gYCR7ZXJyb3IubWVzc2FnZX0uIHZhbHVlPSR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfWBcbiAgICAgICAgICAgIDogJ0FuIHVua25vd24gZXJyb3IgaGFzIG9jY3VyZWQuJztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIH1cbn1cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGBzdHJgIGFuZCByZXR1cm4gbWlsbGlzZWNvbmRzLlxuICovXG5mdW5jdGlvbiBwYXJzZShzdHIpIHtcbiAgICBzdHIgPSBTdHJpbmcoc3RyKTtcbiAgICBpZiAoc3RyLmxlbmd0aCA+IDEwMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZhbHVlIGV4Y2VlZHMgdGhlIG1heGltdW0gbGVuZ3RoIG9mIDEwMCBjaGFyYWN0ZXJzLicpO1xuICAgIH1cbiAgICBjb25zdCBtYXRjaCA9IC9eKC0/KD86XFxkKyk/XFwuP1xcZCspICoobWlsbGlzZWNvbmRzP3xtc2Vjcz98bXN8c2Vjb25kcz98c2Vjcz98c3xtaW51dGVzP3xtaW5zP3xtfGhvdXJzP3xocnM/fGh8ZGF5cz98ZHx3ZWVrcz98d3x5ZWFycz98eXJzP3x5KT8kL2kuZXhlYyhzdHIpO1xuICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIE5hTjtcbiAgICB9XG4gICAgY29uc3QgbiA9IHBhcnNlRmxvYXQobWF0Y2hbMV0pO1xuICAgIGNvbnN0IHR5cGUgPSAobWF0Y2hbMl0gfHwgJ21zJykudG9Mb3dlckNhc2UoKTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAneWVhcnMnOlxuICAgICAgICBjYXNlICd5ZWFyJzpcbiAgICAgICAgY2FzZSAneXJzJzpcbiAgICAgICAgY2FzZSAneXInOlxuICAgICAgICBjYXNlICd5JzpcbiAgICAgICAgICAgIHJldHVybiBuICogeTtcbiAgICAgICAgY2FzZSAnd2Vla3MnOlxuICAgICAgICBjYXNlICd3ZWVrJzpcbiAgICAgICAgY2FzZSAndyc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIHc7XG4gICAgICAgIGNhc2UgJ2RheXMnOlxuICAgICAgICBjYXNlICdkYXknOlxuICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgIHJldHVybiBuICogZDtcbiAgICAgICAgY2FzZSAnaG91cnMnOlxuICAgICAgICBjYXNlICdob3VyJzpcbiAgICAgICAgY2FzZSAnaHJzJzpcbiAgICAgICAgY2FzZSAnaHInOlxuICAgICAgICBjYXNlICdoJzpcbiAgICAgICAgICAgIHJldHVybiBuICogaDtcbiAgICAgICAgY2FzZSAnbWludXRlcyc6XG4gICAgICAgIGNhc2UgJ21pbnV0ZSc6XG4gICAgICAgIGNhc2UgJ21pbnMnOlxuICAgICAgICBjYXNlICdtaW4nOlxuICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgIHJldHVybiBuICogbTtcbiAgICAgICAgY2FzZSAnc2Vjb25kcyc6XG4gICAgICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgICAgIGNhc2UgJ3NlY3MnOlxuICAgICAgICBjYXNlICdzZWMnOlxuICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICAgIHJldHVybiBuICogcztcbiAgICAgICAgY2FzZSAnbWlsbGlzZWNvbmRzJzpcbiAgICAgICAgY2FzZSAnbWlsbGlzZWNvbmQnOlxuICAgICAgICBjYXNlICdtc2Vjcyc6XG4gICAgICAgIGNhc2UgJ21zZWMnOlxuICAgICAgICBjYXNlICdtcyc6XG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIG5ldmVyIG9jY3VyLlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgdW5pdCAke3R5cGV9IHdhcyBtYXRjaGVkLCBidXQgbm8gbWF0Y2hpbmcgY2FzZSBleGlzdHMuYCk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gbXM7XG4vKipcbiAqIFNob3J0IGZvcm1hdCBmb3IgYG1zYC5cbiAqL1xuZnVuY3Rpb24gZm10U2hvcnQobXMpIHtcbiAgICBjb25zdCBtc0FicyA9IE1hdGguYWJzKG1zKTtcbiAgICBpZiAobXNBYnMgPj0gZCkge1xuICAgICAgICByZXR1cm4gYCR7TWF0aC5yb3VuZChtcyAvIGQpfWRgO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gaCkge1xuICAgICAgICByZXR1cm4gYCR7TWF0aC5yb3VuZChtcyAvIGgpfWhgO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gbSkge1xuICAgICAgICByZXR1cm4gYCR7TWF0aC5yb3VuZChtcyAvIG0pfW1gO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gcykge1xuICAgICAgICByZXR1cm4gYCR7TWF0aC5yb3VuZChtcyAvIHMpfXNgO1xuICAgIH1cbiAgICByZXR1cm4gYCR7bXN9bXNgO1xufVxuLyoqXG4gKiBMb25nIGZvcm1hdCBmb3IgYG1zYC5cbiAqL1xuZnVuY3Rpb24gZm10TG9uZyhtcykge1xuICAgIGNvbnN0IG1zQWJzID0gTWF0aC5hYnMobXMpO1xuICAgIGlmIChtc0FicyA+PSBkKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBkLCAnZGF5Jyk7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBoKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBoLCAnaG91cicpO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gbSkge1xuICAgICAgICByZXR1cm4gcGx1cmFsKG1zLCBtc0FicywgbSwgJ21pbnV0ZScpO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gcykge1xuICAgICAgICByZXR1cm4gcGx1cmFsKG1zLCBtc0FicywgcywgJ3NlY29uZCcpO1xuICAgIH1cbiAgICByZXR1cm4gYCR7bXN9IG1zYDtcbn1cbi8qKlxuICogUGx1cmFsaXphdGlvbiBoZWxwZXIuXG4gKi9cbmZ1bmN0aW9uIHBsdXJhbChtcywgbXNBYnMsIG4sIG5hbWUpIHtcbiAgICBjb25zdCBpc1BsdXJhbCA9IG1zQWJzID49IG4gKiAxLjU7XG4gICAgcmV0dXJuIGAke01hdGgucm91bmQobXMgLyBuKX0gJHtuYW1lfSR7aXNQbHVyYWwgPyAncycgOiAnJ31gO1xufVxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIGVycm9ycy5cbiAqL1xuZnVuY3Rpb24gaXNFcnJvcihlcnJvcikge1xuICAgIHJldHVybiB0eXBlb2YgZXJyb3IgPT09ICdvYmplY3QnICYmIGVycm9yICE9PSBudWxsICYmICdtZXNzYWdlJyBpbiBlcnJvcjtcbn1cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDtcbiIsIi8vIEdFTkVSQVRFRCBGSUxFLiBETyBOT1QgRURJVC5cbnZhciBMb25nID0gKGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIFxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxuICB9KTtcbiAgZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuICBcbiAgLyoqXG4gICAqIEBsaWNlbnNlXG4gICAqIENvcHlyaWdodCAyMDA5IFRoZSBDbG9zdXJlIExpYnJhcnkgQXV0aG9yc1xuICAgKiBDb3B5cmlnaHQgMjAyMCBEYW5pZWwgV2lydHogLyBUaGUgbG9uZy5qcyBBdXRob3JzLlxuICAgKlxuICAgKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAgKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gICAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICAgKlxuICAgKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gICAqXG4gICAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAgICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICAgKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAgICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICAgKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAgICpcbiAgICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAgICovXG4gIC8vIFdlYkFzc2VtYmx5IG9wdGltaXphdGlvbnMgdG8gZG8gbmF0aXZlIGk2NCBtdWx0aXBsaWNhdGlvbiBhbmQgZGl2aWRlXG4gIHZhciB3YXNtID0gbnVsbDtcbiAgXG4gIHRyeSB7XG4gICAgd2FzbSA9IG5ldyBXZWJBc3NlbWJseS5JbnN0YW5jZShuZXcgV2ViQXNzZW1ibHkuTW9kdWxlKG5ldyBVaW50OEFycmF5KFswLCA5NywgMTE1LCAxMDksIDEsIDAsIDAsIDAsIDEsIDEzLCAyLCA5NiwgMCwgMSwgMTI3LCA5NiwgNCwgMTI3LCAxMjcsIDEyNywgMTI3LCAxLCAxMjcsIDMsIDcsIDYsIDAsIDEsIDEsIDEsIDEsIDEsIDYsIDYsIDEsIDEyNywgMSwgNjUsIDAsIDExLCA3LCA1MCwgNiwgMywgMTA5LCAxMTcsIDEwOCwgMCwgMSwgNSwgMTAwLCAxMDUsIDExOCwgOTUsIDExNSwgMCwgMiwgNSwgMTAwLCAxMDUsIDExOCwgOTUsIDExNywgMCwgMywgNSwgMTE0LCAxMDEsIDEwOSwgOTUsIDExNSwgMCwgNCwgNSwgMTE0LCAxMDEsIDEwOSwgOTUsIDExNywgMCwgNSwgOCwgMTAzLCAxMDEsIDExNiwgOTUsIDEwNCwgMTA1LCAxMDMsIDEwNCwgMCwgMCwgMTAsIDE5MSwgMSwgNiwgNCwgMCwgMzUsIDAsIDExLCAzNiwgMSwgMSwgMTI2LCAzMiwgMCwgMTczLCAzMiwgMSwgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAzMiwgMiwgMTczLCAzMiwgMywgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAxMjYsIDM0LCA0LCA2NiwgMzIsIDEzNSwgMTY3LCAzNiwgMCwgMzIsIDQsIDE2NywgMTEsIDM2LCAxLCAxLCAxMjYsIDMyLCAwLCAxNzMsIDMyLCAxLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDMyLCAyLCAxNzMsIDMyLCAzLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDEyNywgMzQsIDQsIDY2LCAzMiwgMTM1LCAxNjcsIDM2LCAwLCAzMiwgNCwgMTY3LCAxMSwgMzYsIDEsIDEsIDEyNiwgMzIsIDAsIDE3MywgMzIsIDEsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMzIsIDIsIDE3MywgMzIsIDMsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMTI4LCAzNCwgNCwgNjYsIDMyLCAxMzUsIDE2NywgMzYsIDAsIDMyLCA0LCAxNjcsIDExLCAzNiwgMSwgMSwgMTI2LCAzMiwgMCwgMTczLCAzMiwgMSwgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAzMiwgMiwgMTczLCAzMiwgMywgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAxMjksIDM0LCA0LCA2NiwgMzIsIDEzNSwgMTY3LCAzNiwgMCwgMzIsIDQsIDE2NywgMTEsIDM2LCAxLCAxLCAxMjYsIDMyLCAwLCAxNzMsIDMyLCAxLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDMyLCAyLCAxNzMsIDMyLCAzLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDEzMCwgMzQsIDQsIDY2LCAzMiwgMTM1LCAxNjcsIDM2LCAwLCAzMiwgNCwgMTY3LCAxMV0pKSwge30pLmV4cG9ydHM7XG4gIH0gY2F0Y2ggKGUpIHsvLyBubyB3YXNtIHN1cHBvcnQgOihcbiAgfVxuICAvKipcbiAgICogQ29uc3RydWN0cyBhIDY0IGJpdCB0d28ncy1jb21wbGVtZW50IGludGVnZXIsIGdpdmVuIGl0cyBsb3cgYW5kIGhpZ2ggMzIgYml0IHZhbHVlcyBhcyAqc2lnbmVkKiBpbnRlZ2Vycy5cbiAgICogIFNlZSB0aGUgZnJvbSogZnVuY3Rpb25zIGJlbG93IGZvciBtb3JlIGNvbnZlbmllbnQgd2F5cyBvZiBjb25zdHJ1Y3RpbmcgTG9uZ3MuXG4gICAqIEBleHBvcnRzIExvbmdcbiAgICogQGNsYXNzIEEgTG9uZyBjbGFzcyBmb3IgcmVwcmVzZW50aW5nIGEgNjQgYml0IHR3bydzLWNvbXBsZW1lbnQgaW50ZWdlciB2YWx1ZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGxvdyBUaGUgbG93IChzaWduZWQpIDMyIGJpdHMgb2YgdGhlIGxvbmdcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhpZ2ggVGhlIGhpZ2ggKHNpZ25lZCkgMzIgYml0cyBvZiB0aGUgbG9uZ1xuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgXG4gIFxuICBmdW5jdGlvbiBMb25nKGxvdywgaGlnaCwgdW5zaWduZWQpIHtcbiAgICAvKipcbiAgICAgKiBUaGUgbG93IDMyIGJpdHMgYXMgYSBzaWduZWQgdmFsdWUuXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmxvdyA9IGxvdyB8IDA7XG4gICAgLyoqXG4gICAgICogVGhlIGhpZ2ggMzIgYml0cyBhcyBhIHNpZ25lZCB2YWx1ZS5cbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICBcbiAgICB0aGlzLmhpZ2ggPSBoaWdoIHwgMDtcbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdC5cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgXG4gICAgdGhpcy51bnNpZ25lZCA9ICEhdW5zaWduZWQ7XG4gIH0gLy8gVGhlIGludGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIGEgbG9uZyBpcyB0aGUgdHdvIGdpdmVuIHNpZ25lZCwgMzItYml0IHZhbHVlcy5cbiAgLy8gV2UgdXNlIDMyLWJpdCBwaWVjZXMgYmVjYXVzZSB0aGVzZSBhcmUgdGhlIHNpemUgb2YgaW50ZWdlcnMgb24gd2hpY2hcbiAgLy8gSmF2YXNjcmlwdCBwZXJmb3JtcyBiaXQtb3BlcmF0aW9ucy4gIEZvciBvcGVyYXRpb25zIGxpa2UgYWRkaXRpb24gYW5kXG4gIC8vIG11bHRpcGxpY2F0aW9uLCB3ZSBzcGxpdCBlYWNoIG51bWJlciBpbnRvIDE2IGJpdCBwaWVjZXMsIHdoaWNoIGNhbiBlYXNpbHkgYmVcbiAgLy8gbXVsdGlwbGllZCB3aXRoaW4gSmF2YXNjcmlwdCdzIGZsb2F0aW5nLXBvaW50IHJlcHJlc2VudGF0aW9uIHdpdGhvdXQgb3ZlcmZsb3dcbiAgLy8gb3IgY2hhbmdlIGluIHNpZ24uXG4gIC8vXG4gIC8vIEluIHRoZSBhbGdvcml0aG1zIGJlbG93LCB3ZSBmcmVxdWVudGx5IHJlZHVjZSB0aGUgbmVnYXRpdmUgY2FzZSB0byB0aGVcbiAgLy8gcG9zaXRpdmUgY2FzZSBieSBuZWdhdGluZyB0aGUgaW5wdXQocykgYW5kIHRoZW4gcG9zdC1wcm9jZXNzaW5nIHRoZSByZXN1bHQuXG4gIC8vIE5vdGUgdGhhdCB3ZSBtdXN0IEFMV0FZUyBjaGVjayBzcGVjaWFsbHkgd2hldGhlciB0aG9zZSB2YWx1ZXMgYXJlIE1JTl9WQUxVRVxuICAvLyAoLTJeNjMpIGJlY2F1c2UgLU1JTl9WQUxVRSA9PSBNSU5fVkFMVUUgKHNpbmNlIDJeNjMgY2Fubm90IGJlIHJlcHJlc2VudGVkIGFzXG4gIC8vIGEgcG9zaXRpdmUgbnVtYmVyLCBpdCBvdmVyZmxvd3MgYmFjayBpbnRvIGEgbmVnYXRpdmUpLiAgTm90IGhhbmRsaW5nIHRoaXNcbiAgLy8gY2FzZSB3b3VsZCBvZnRlbiByZXN1bHQgaW4gaW5maW5pdGUgcmVjdXJzaW9uLlxuICAvL1xuICAvLyBDb21tb24gY29uc3RhbnQgdmFsdWVzIFpFUk8sIE9ORSwgTkVHX09ORSwgZXRjLiBhcmUgZGVmaW5lZCBiZWxvdyB0aGUgZnJvbSpcbiAgLy8gbWV0aG9kcyBvbiB3aGljaCB0aGV5IGRlcGVuZC5cbiAgXG4gIC8qKlxuICAgKiBBbiBpbmRpY2F0b3IgdXNlZCB0byByZWxpYWJseSBkZXRlcm1pbmUgaWYgYW4gb2JqZWN0IGlzIGEgTG9uZyBvciBub3QuXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAY29uc3RcbiAgICogQHByaXZhdGVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5wcm90b3R5cGUuX19pc0xvbmdfXztcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KExvbmcucHJvdG90eXBlLCBcIl9faXNMb25nX19cIiwge1xuICAgIHZhbHVlOiB0cnVlXG4gIH0pO1xuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7Kn0gb2JqIE9iamVjdFxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgZnVuY3Rpb24gaXNMb25nKG9iaikge1xuICAgIHJldHVybiAob2JqICYmIG9ialtcIl9faXNMb25nX19cIl0pID09PSB0cnVlO1xuICB9XG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHsqfSB2YWx1ZSBudW1iZXJcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgXG4gIGZ1bmN0aW9uIGN0ejMyKHZhbHVlKSB7XG4gICAgdmFyIGMgPSBNYXRoLmNsejMyKHZhbHVlICYgLXZhbHVlKTtcbiAgICByZXR1cm4gdmFsdWUgPyAzMSAtIGMgOiBjO1xuICB9XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGUgc3BlY2lmaWVkIG9iamVjdCBpcyBhIExvbmcuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyp9IG9iaiBPYmplY3RcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmcuaXNMb25nID0gaXNMb25nO1xuICAvKipcbiAgICogQSBjYWNoZSBvZiB0aGUgTG9uZyByZXByZXNlbnRhdGlvbnMgb2Ygc21hbGwgaW50ZWdlciB2YWx1ZXMuXG4gICAqIEB0eXBlIHshT2JqZWN0fVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgSU5UX0NBQ0hFID0ge307XG4gIC8qKlxuICAgKiBBIGNhY2hlIG9mIHRoZSBMb25nIHJlcHJlc2VudGF0aW9ucyBvZiBzbWFsbCB1bnNpZ25lZCBpbnRlZ2VyIHZhbHVlcy5cbiAgICogQHR5cGUgeyFPYmplY3R9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBVSU5UX0NBQ0hFID0ge307XG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICBmdW5jdGlvbiBmcm9tSW50KHZhbHVlLCB1bnNpZ25lZCkge1xuICAgIHZhciBvYmosIGNhY2hlZE9iaiwgY2FjaGU7XG4gIFxuICAgIGlmICh1bnNpZ25lZCkge1xuICAgICAgdmFsdWUgPj4+PSAwO1xuICBcbiAgICAgIGlmIChjYWNoZSA9IDAgPD0gdmFsdWUgJiYgdmFsdWUgPCAyNTYpIHtcbiAgICAgICAgY2FjaGVkT2JqID0gVUlOVF9DQUNIRVt2YWx1ZV07XG4gICAgICAgIGlmIChjYWNoZWRPYmopIHJldHVybiBjYWNoZWRPYmo7XG4gICAgICB9XG4gIFxuICAgICAgb2JqID0gZnJvbUJpdHModmFsdWUsIDAsIHRydWUpO1xuICAgICAgaWYgKGNhY2hlKSBVSU5UX0NBQ0hFW3ZhbHVlXSA9IG9iajtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlIHw9IDA7XG4gIFxuICAgICAgaWYgKGNhY2hlID0gLTEyOCA8PSB2YWx1ZSAmJiB2YWx1ZSA8IDEyOCkge1xuICAgICAgICBjYWNoZWRPYmogPSBJTlRfQ0FDSEVbdmFsdWVdO1xuICAgICAgICBpZiAoY2FjaGVkT2JqKSByZXR1cm4gY2FjaGVkT2JqO1xuICAgICAgfVxuICBcbiAgICAgIG9iaiA9IGZyb21CaXRzKHZhbHVlLCB2YWx1ZSA8IDAgPyAtMSA6IDAsIGZhbHNlKTtcbiAgICAgIGlmIChjYWNoZSkgSU5UX0NBQ0hFW3ZhbHVlXSA9IG9iajtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgTG9uZyByZXByZXNlbnRpbmcgdGhlIGdpdmVuIDMyIGJpdCBpbnRlZ2VyIHZhbHVlLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIFRoZSAzMiBiaXQgaW50ZWdlciBpbiBxdWVzdGlvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21JbnQgPSBmcm9tSW50O1xuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgZnVuY3Rpb24gZnJvbU51bWJlcih2YWx1ZSwgdW5zaWduZWQpIHtcbiAgICBpZiAoaXNOYU4odmFsdWUpKSByZXR1cm4gdW5zaWduZWQgPyBVWkVSTyA6IFpFUk87XG4gIFxuICAgIGlmICh1bnNpZ25lZCkge1xuICAgICAgaWYgKHZhbHVlIDwgMCkgcmV0dXJuIFVaRVJPO1xuICAgICAgaWYgKHZhbHVlID49IFRXT19QV1JfNjRfREJMKSByZXR1cm4gTUFYX1VOU0lHTkVEX1ZBTFVFO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodmFsdWUgPD0gLVRXT19QV1JfNjNfREJMKSByZXR1cm4gTUlOX1ZBTFVFO1xuICAgICAgaWYgKHZhbHVlICsgMSA+PSBUV09fUFdSXzYzX0RCTCkgcmV0dXJuIE1BWF9WQUxVRTtcbiAgICB9XG4gIFxuICAgIGlmICh2YWx1ZSA8IDApIHJldHVybiBmcm9tTnVtYmVyKC12YWx1ZSwgdW5zaWduZWQpLm5lZygpO1xuICAgIHJldHVybiBmcm9tQml0cyh2YWx1ZSAlIFRXT19QV1JfMzJfREJMIHwgMCwgdmFsdWUgLyBUV09fUFdSXzMyX0RCTCB8IDAsIHVuc2lnbmVkKTtcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyBhIExvbmcgcmVwcmVzZW50aW5nIHRoZSBnaXZlbiB2YWx1ZSwgcHJvdmlkZWQgdGhhdCBpdCBpcyBhIGZpbml0ZSBudW1iZXIuIE90aGVyd2lzZSwgemVybyBpcyByZXR1cm5lZC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBUaGUgbnVtYmVyIGluIHF1ZXN0aW9uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbU51bWJlciA9IGZyb21OdW1iZXI7XG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gbG93Qml0c1xuICAgKiBAcGFyYW0ge251bWJlcn0gaGlnaEJpdHNcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICBmdW5jdGlvbiBmcm9tQml0cyhsb3dCaXRzLCBoaWdoQml0cywgdW5zaWduZWQpIHtcbiAgICByZXR1cm4gbmV3IExvbmcobG93Qml0cywgaGlnaEJpdHMsIHVuc2lnbmVkKTtcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyBhIExvbmcgcmVwcmVzZW50aW5nIHRoZSA2NCBiaXQgaW50ZWdlciB0aGF0IGNvbWVzIGJ5IGNvbmNhdGVuYXRpbmcgdGhlIGdpdmVuIGxvdyBhbmQgaGlnaCBiaXRzLiBFYWNoIGlzXG4gICAqICBhc3N1bWVkIHRvIHVzZSAzMiBiaXRzLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ9IGxvd0JpdHMgVGhlIGxvdyAzMiBiaXRzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoaWdoQml0cyBUaGUgaGlnaCAzMiBiaXRzXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbUJpdHMgPSBmcm9tQml0cztcbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcn0gYmFzZVxuICAgKiBAcGFyYW0ge251bWJlcn0gZXhwb25lbnRcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIHBvd19kYmwgPSBNYXRoLnBvdzsgLy8gVXNlZCA0IHRpbWVzICg0KjggdG8gMTUrNClcbiAgXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gICAqIEBwYXJhbSB7KGJvb2xlYW58bnVtYmVyKT19IHVuc2lnbmVkXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gcmFkaXhcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICBmdW5jdGlvbiBmcm9tU3RyaW5nKHN0ciwgdW5zaWduZWQsIHJhZGl4KSB7XG4gICAgaWYgKHN0ci5sZW5ndGggPT09IDApIHRocm93IEVycm9yKCdlbXB0eSBzdHJpbmcnKTtcbiAgXG4gICAgaWYgKHR5cGVvZiB1bnNpZ25lZCA9PT0gJ251bWJlcicpIHtcbiAgICAgIC8vIEZvciBnb29nLm1hdGgubG9uZyBjb21wYXRpYmlsaXR5XG4gICAgICByYWRpeCA9IHVuc2lnbmVkO1xuICAgICAgdW5zaWduZWQgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdW5zaWduZWQgPSAhIXVuc2lnbmVkO1xuICAgIH1cbiAgXG4gICAgaWYgKHN0ciA9PT0gXCJOYU5cIiB8fCBzdHIgPT09IFwiSW5maW5pdHlcIiB8fCBzdHIgPT09IFwiK0luZmluaXR5XCIgfHwgc3RyID09PSBcIi1JbmZpbml0eVwiKSByZXR1cm4gdW5zaWduZWQgPyBVWkVSTyA6IFpFUk87XG4gICAgcmFkaXggPSByYWRpeCB8fCAxMDtcbiAgICBpZiAocmFkaXggPCAyIHx8IDM2IDwgcmFkaXgpIHRocm93IFJhbmdlRXJyb3IoJ3JhZGl4Jyk7XG4gICAgdmFyIHA7XG4gICAgaWYgKChwID0gc3RyLmluZGV4T2YoJy0nKSkgPiAwKSB0aHJvdyBFcnJvcignaW50ZXJpb3IgaHlwaGVuJyk7ZWxzZSBpZiAocCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGZyb21TdHJpbmcoc3RyLnN1YnN0cmluZygxKSwgdW5zaWduZWQsIHJhZGl4KS5uZWcoKTtcbiAgICB9IC8vIERvIHNldmVyYWwgKDgpIGRpZ2l0cyBlYWNoIHRpbWUgdGhyb3VnaCB0aGUgbG9vcCwgc28gYXMgdG9cbiAgICAvLyBtaW5pbWl6ZSB0aGUgY2FsbHMgdG8gdGhlIHZlcnkgZXhwZW5zaXZlIGVtdWxhdGVkIGRpdi5cbiAgXG4gICAgdmFyIHJhZGl4VG9Qb3dlciA9IGZyb21OdW1iZXIocG93X2RibChyYWRpeCwgOCkpO1xuICAgIHZhciByZXN1bHQgPSBaRVJPO1xuICBcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkgKz0gOCkge1xuICAgICAgdmFyIHNpemUgPSBNYXRoLm1pbig4LCBzdHIubGVuZ3RoIC0gaSksXG4gICAgICAgICAgdmFsdWUgPSBwYXJzZUludChzdHIuc3Vic3RyaW5nKGksIGkgKyBzaXplKSwgcmFkaXgpO1xuICBcbiAgICAgIGlmIChzaXplIDwgOCkge1xuICAgICAgICB2YXIgcG93ZXIgPSBmcm9tTnVtYmVyKHBvd19kYmwocmFkaXgsIHNpemUpKTtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0Lm11bChwb3dlcikuYWRkKGZyb21OdW1iZXIodmFsdWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5tdWwocmFkaXhUb1Bvd2VyKTtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmFkZChmcm9tTnVtYmVyKHZhbHVlKSk7XG4gICAgICB9XG4gICAgfVxuICBcbiAgICByZXN1bHQudW5zaWduZWQgPSB1bnNpZ25lZDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgTG9uZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gc3RyaW5nLCB3cml0dGVuIHVzaW5nIHRoZSBzcGVjaWZpZWQgcmFkaXguXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyIFRoZSB0ZXh0dWFsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBMb25nXG4gICAqIEBwYXJhbSB7KGJvb2xlYW58bnVtYmVyKT19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHBhcmFtIHtudW1iZXI9fSByYWRpeCBUaGUgcmFkaXggaW4gd2hpY2ggdGhlIHRleHQgaXMgd3JpdHRlbiAoMi0zNiksIGRlZmF1bHRzIHRvIDEwXG4gICAqIEByZXR1cm5zIHshTG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21TdHJpbmcgPSBmcm9tU3RyaW5nO1xuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ3whe2xvdzogbnVtYmVyLCBoaWdoOiBudW1iZXIsIHVuc2lnbmVkOiBib29sZWFufX0gdmFsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgZnVuY3Rpb24gZnJvbVZhbHVlKHZhbCwgdW5zaWduZWQpIHtcbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHJldHVybiBmcm9tTnVtYmVyKHZhbCwgdW5zaWduZWQpO1xuICAgIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykgcmV0dXJuIGZyb21TdHJpbmcodmFsLCB1bnNpZ25lZCk7IC8vIFRocm93cyBmb3Igbm9uLW9iamVjdHMsIGNvbnZlcnRzIG5vbi1pbnN0YW5jZW9mIExvbmc6XG4gIFxuICAgIHJldHVybiBmcm9tQml0cyh2YWwubG93LCB2YWwuaGlnaCwgdHlwZW9mIHVuc2lnbmVkID09PSAnYm9vbGVhbicgPyB1bnNpZ25lZCA6IHZhbC51bnNpZ25lZCk7XG4gIH1cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoZSBzcGVjaWZpZWQgdmFsdWUgdG8gYSBMb25nIHVzaW5nIHRoZSBhcHByb3ByaWF0ZSBmcm9tKiBmdW5jdGlvbiBmb3IgaXRzIHR5cGUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd8IXtsb3c6IG51bWJlciwgaGlnaDogbnVtYmVyLCB1bnNpZ25lZDogYm9vbGVhbn19IHZhbCBWYWx1ZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tVmFsdWUgPSBmcm9tVmFsdWU7IC8vIE5PVEU6IHRoZSBjb21waWxlciBzaG91bGQgaW5saW5lIHRoZXNlIGNvbnN0YW50IHZhbHVlcyBiZWxvdyBhbmQgdGhlbiByZW1vdmUgdGhlc2UgdmFyaWFibGVzLCBzbyB0aGVyZSBzaG91bGQgYmVcbiAgLy8gbm8gcnVudGltZSBwZW5hbHR5IGZvciB0aGVzZS5cbiAgXG4gIC8qKlxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAY29uc3RcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFRXT19QV1JfMTZfREJMID0gMSA8PCAxNjtcbiAgLyoqXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBjb25zdFxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVFdPX1BXUl8yNF9EQkwgPSAxIDw8IDI0O1xuICAvKipcbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGNvbnN0XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBUV09fUFdSXzMyX0RCTCA9IFRXT19QV1JfMTZfREJMICogVFdPX1BXUl8xNl9EQkw7XG4gIC8qKlxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAY29uc3RcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFRXT19QV1JfNjRfREJMID0gVFdPX1BXUl8zMl9EQkwgKiBUV09fUFdSXzMyX0RCTDtcbiAgLyoqXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBjb25zdFxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVFdPX1BXUl82M19EQkwgPSBUV09fUFdSXzY0X0RCTCAvIDI7XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBjb25zdFxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVFdPX1BXUl8yNCA9IGZyb21JbnQoVFdPX1BXUl8yNF9EQkwpO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgWkVSTyA9IGZyb21JbnQoMCk7XG4gIC8qKlxuICAgKiBTaWduZWQgemVyby5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuWkVSTyA9IFpFUk87XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBVWkVSTyA9IGZyb21JbnQoMCwgdHJ1ZSk7XG4gIC8qKlxuICAgKiBVbnNpZ25lZCB6ZXJvLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5VWkVSTyA9IFVaRVJPO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgT05FID0gZnJvbUludCgxKTtcbiAgLyoqXG4gICAqIFNpZ25lZCBvbmUuXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLk9ORSA9IE9ORTtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFVPTkUgPSBmcm9tSW50KDEsIHRydWUpO1xuICAvKipcbiAgICogVW5zaWduZWQgb25lLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5VT05FID0gVU9ORTtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIE5FR19PTkUgPSBmcm9tSW50KC0xKTtcbiAgLyoqXG4gICAqIFNpZ25lZCBuZWdhdGl2ZSBvbmUuXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLk5FR19PTkUgPSBORUdfT05FO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgTUFYX1ZBTFVFID0gZnJvbUJpdHMoMHhGRkZGRkZGRiB8IDAsIDB4N0ZGRkZGRkYgfCAwLCBmYWxzZSk7XG4gIC8qKlxuICAgKiBNYXhpbXVtIHNpZ25lZCB2YWx1ZS5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuTUFYX1ZBTFVFID0gTUFYX1ZBTFVFO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgTUFYX1VOU0lHTkVEX1ZBTFVFID0gZnJvbUJpdHMoMHhGRkZGRkZGRiB8IDAsIDB4RkZGRkZGRkYgfCAwLCB0cnVlKTtcbiAgLyoqXG4gICAqIE1heGltdW0gdW5zaWduZWQgdmFsdWUuXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLk1BWF9VTlNJR05FRF9WQUxVRSA9IE1BWF9VTlNJR05FRF9WQUxVRTtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIE1JTl9WQUxVRSA9IGZyb21CaXRzKDAsIDB4ODAwMDAwMDAgfCAwLCBmYWxzZSk7XG4gIC8qKlxuICAgKiBNaW5pbXVtIHNpZ25lZCB2YWx1ZS5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuTUlOX1ZBTFVFID0gTUlOX1ZBTFVFO1xuICAvKipcbiAgICogQGFsaWFzIExvbmcucHJvdG90eXBlXG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBMb25nUHJvdG90eXBlID0gTG9uZy5wcm90b3R5cGU7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGUgTG9uZyB0byBhIDMyIGJpdCBpbnRlZ2VyLCBhc3N1bWluZyBpdCBpcyBhIDMyIGJpdCBpbnRlZ2VyLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS50b0ludCA9IGZ1bmN0aW9uIHRvSW50KCkge1xuICAgIHJldHVybiB0aGlzLnVuc2lnbmVkID8gdGhpcy5sb3cgPj4+IDAgOiB0aGlzLmxvdztcbiAgfTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoZSBMb25nIHRvIGEgdGhlIG5lYXJlc3QgZmxvYXRpbmctcG9pbnQgcmVwcmVzZW50YXRpb24gb2YgdGhpcyB2YWx1ZSAoZG91YmxlLCA1MyBiaXQgbWFudGlzc2EpLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUudG9OdW1iZXIgPSBmdW5jdGlvbiB0b051bWJlcigpIHtcbiAgICBpZiAodGhpcy51bnNpZ25lZCkgcmV0dXJuICh0aGlzLmhpZ2ggPj4+IDApICogVFdPX1BXUl8zMl9EQkwgKyAodGhpcy5sb3cgPj4+IDApO1xuICAgIHJldHVybiB0aGlzLmhpZ2ggKiBUV09fUFdSXzMyX0RCTCArICh0aGlzLmxvdyA+Pj4gMCk7XG4gIH07XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGUgTG9uZyB0byBhIHN0cmluZyB3cml0dGVuIGluIHRoZSBzcGVjaWZpZWQgcmFkaXguXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHtudW1iZXI9fSByYWRpeCBSYWRpeCAoMi0zNiksIGRlZmF1bHRzIHRvIDEwXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqIEBvdmVycmlkZVxuICAgKiBAdGhyb3dzIHtSYW5nZUVycm9yfSBJZiBgcmFkaXhgIGlzIG91dCBvZiByYW5nZVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcocmFkaXgpIHtcbiAgICByYWRpeCA9IHJhZGl4IHx8IDEwO1xuICAgIGlmIChyYWRpeCA8IDIgfHwgMzYgPCByYWRpeCkgdGhyb3cgUmFuZ2VFcnJvcigncmFkaXgnKTtcbiAgICBpZiAodGhpcy5pc1plcm8oKSkgcmV0dXJuICcwJztcbiAgXG4gICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpKSB7XG4gICAgICAvLyBVbnNpZ25lZCBMb25ncyBhcmUgbmV2ZXIgbmVnYXRpdmVcbiAgICAgIGlmICh0aGlzLmVxKE1JTl9WQUxVRSkpIHtcbiAgICAgICAgLy8gV2UgbmVlZCB0byBjaGFuZ2UgdGhlIExvbmcgdmFsdWUgYmVmb3JlIGl0IGNhbiBiZSBuZWdhdGVkLCBzbyB3ZSByZW1vdmVcbiAgICAgICAgLy8gdGhlIGJvdHRvbS1tb3N0IGRpZ2l0IGluIHRoaXMgYmFzZSBhbmQgdGhlbiByZWN1cnNlIHRvIGRvIHRoZSByZXN0LlxuICAgICAgICB2YXIgcmFkaXhMb25nID0gZnJvbU51bWJlcihyYWRpeCksXG4gICAgICAgICAgICBkaXYgPSB0aGlzLmRpdihyYWRpeExvbmcpLFxuICAgICAgICAgICAgcmVtMSA9IGRpdi5tdWwocmFkaXhMb25nKS5zdWIodGhpcyk7XG4gICAgICAgIHJldHVybiBkaXYudG9TdHJpbmcocmFkaXgpICsgcmVtMS50b0ludCgpLnRvU3RyaW5nKHJhZGl4KTtcbiAgICAgIH0gZWxzZSByZXR1cm4gJy0nICsgdGhpcy5uZWcoKS50b1N0cmluZyhyYWRpeCk7XG4gICAgfSAvLyBEbyBzZXZlcmFsICg2KSBkaWdpdHMgZWFjaCB0aW1lIHRocm91Z2ggdGhlIGxvb3AsIHNvIGFzIHRvXG4gICAgLy8gbWluaW1pemUgdGhlIGNhbGxzIHRvIHRoZSB2ZXJ5IGV4cGVuc2l2ZSBlbXVsYXRlZCBkaXYuXG4gIFxuICBcbiAgICB2YXIgcmFkaXhUb1Bvd2VyID0gZnJvbU51bWJlcihwb3dfZGJsKHJhZGl4LCA2KSwgdGhpcy51bnNpZ25lZCksXG4gICAgICAgIHJlbSA9IHRoaXM7XG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICBcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgdmFyIHJlbURpdiA9IHJlbS5kaXYocmFkaXhUb1Bvd2VyKSxcbiAgICAgICAgICBpbnR2YWwgPSByZW0uc3ViKHJlbURpdi5tdWwocmFkaXhUb1Bvd2VyKSkudG9JbnQoKSA+Pj4gMCxcbiAgICAgICAgICBkaWdpdHMgPSBpbnR2YWwudG9TdHJpbmcocmFkaXgpO1xuICAgICAgcmVtID0gcmVtRGl2O1xuICAgICAgaWYgKHJlbS5pc1plcm8oKSkgcmV0dXJuIGRpZ2l0cyArIHJlc3VsdDtlbHNlIHtcbiAgICAgICAgd2hpbGUgKGRpZ2l0cy5sZW5ndGggPCA2KSBkaWdpdHMgPSAnMCcgKyBkaWdpdHM7XG4gIFxuICAgICAgICByZXN1bHQgPSAnJyArIGRpZ2l0cyArIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIC8qKlxuICAgKiBHZXRzIHRoZSBoaWdoIDMyIGJpdHMgYXMgYSBzaWduZWQgaW50ZWdlci5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBTaWduZWQgaGlnaCBiaXRzXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZ2V0SGlnaEJpdHMgPSBmdW5jdGlvbiBnZXRIaWdoQml0cygpIHtcbiAgICByZXR1cm4gdGhpcy5oaWdoO1xuICB9O1xuICAvKipcbiAgICogR2V0cyB0aGUgaGlnaCAzMiBiaXRzIGFzIGFuIHVuc2lnbmVkIGludGVnZXIuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn0gVW5zaWduZWQgaGlnaCBiaXRzXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZ2V0SGlnaEJpdHNVbnNpZ25lZCA9IGZ1bmN0aW9uIGdldEhpZ2hCaXRzVW5zaWduZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGlnaCA+Pj4gMDtcbiAgfTtcbiAgLyoqXG4gICAqIEdldHMgdGhlIGxvdyAzMiBiaXRzIGFzIGEgc2lnbmVkIGludGVnZXIuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn0gU2lnbmVkIGxvdyBiaXRzXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZ2V0TG93Qml0cyA9IGZ1bmN0aW9uIGdldExvd0JpdHMoKSB7XG4gICAgcmV0dXJuIHRoaXMubG93O1xuICB9O1xuICAvKipcbiAgICogR2V0cyB0aGUgbG93IDMyIGJpdHMgYXMgYW4gdW5zaWduZWQgaW50ZWdlci5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBVbnNpZ25lZCBsb3cgYml0c1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmdldExvd0JpdHNVbnNpZ25lZCA9IGZ1bmN0aW9uIGdldExvd0JpdHNVbnNpZ25lZCgpIHtcbiAgICByZXR1cm4gdGhpcy5sb3cgPj4+IDA7XG4gIH07XG4gIC8qKlxuICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgYml0cyBuZWVkZWQgdG8gcmVwcmVzZW50IHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGlzIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5nZXROdW1CaXRzQWJzID0gZnVuY3Rpb24gZ2V0TnVtQml0c0FicygpIHtcbiAgICBpZiAodGhpcy5pc05lZ2F0aXZlKCkpIC8vIFVuc2lnbmVkIExvbmdzIGFyZSBuZXZlciBuZWdhdGl2ZVxuICAgICAgcmV0dXJuIHRoaXMuZXEoTUlOX1ZBTFVFKSA/IDY0IDogdGhpcy5uZWcoKS5nZXROdW1CaXRzQWJzKCk7XG4gICAgdmFyIHZhbCA9IHRoaXMuaGlnaCAhPSAwID8gdGhpcy5oaWdoIDogdGhpcy5sb3c7XG4gIFxuICAgIGZvciAodmFyIGJpdCA9IDMxOyBiaXQgPiAwOyBiaXQtLSkgaWYgKCh2YWwgJiAxIDw8IGJpdCkgIT0gMCkgYnJlYWs7XG4gIFxuICAgIHJldHVybiB0aGlzLmhpZ2ggIT0gMCA/IGJpdCArIDMzIDogYml0ICsgMTtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGVxdWFscyB6ZXJvLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmlzWmVybyA9IGZ1bmN0aW9uIGlzWmVybygpIHtcbiAgICByZXR1cm4gdGhpcy5oaWdoID09PSAwICYmIHRoaXMubG93ID09PSAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZXF1YWxzIHplcm8uIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjaXNaZXJvfS5cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZXF6ID0gTG9uZ1Byb3RvdHlwZS5pc1plcm87XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBuZWdhdGl2ZS5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmlzTmVnYXRpdmUgPSBmdW5jdGlvbiBpc05lZ2F0aXZlKCkge1xuICAgIHJldHVybiAhdGhpcy51bnNpZ25lZCAmJiB0aGlzLmhpZ2ggPCAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgcG9zaXRpdmUgb3IgemVyby5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5pc1Bvc2l0aXZlID0gZnVuY3Rpb24gaXNQb3NpdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy51bnNpZ25lZCB8fCB0aGlzLmhpZ2ggPj0gMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIG9kZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5pc09kZCA9IGZ1bmN0aW9uIGlzT2RkKCkge1xuICAgIHJldHVybiAodGhpcy5sb3cgJiAxKSA9PT0gMTtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGV2ZW4uXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuaXNFdmVuID0gZnVuY3Rpb24gaXNFdmVuKCkge1xuICAgIHJldHVybiAodGhpcy5sb3cgJiAxKSA9PT0gMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGVxdWFscyB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiBlcXVhbHMob3RoZXIpIHtcbiAgICBpZiAoIWlzTG9uZyhvdGhlcikpIG90aGVyID0gZnJvbVZhbHVlKG90aGVyKTtcbiAgICBpZiAodGhpcy51bnNpZ25lZCAhPT0gb3RoZXIudW5zaWduZWQgJiYgdGhpcy5oaWdoID4+PiAzMSA9PT0gMSAmJiBvdGhlci5oaWdoID4+PiAzMSA9PT0gMSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0aGlzLmhpZ2ggPT09IG90aGVyLmhpZ2ggJiYgdGhpcy5sb3cgPT09IG90aGVyLmxvdztcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGVxdWFscyB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjZXF1YWxzfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZXEgPSBMb25nUHJvdG90eXBlLmVxdWFscztcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGRpZmZlcnMgZnJvbSB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLm5vdEVxdWFscyA9IGZ1bmN0aW9uIG5vdEVxdWFscyhvdGhlcikge1xuICAgIHJldHVybiAhdGhpcy5lcShcbiAgICAvKiB2YWxpZGF0ZXMgKi9cbiAgICBvdGhlcik7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBkaWZmZXJzIGZyb20gdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI25vdEVxdWFsc30uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLm5lcSA9IExvbmdQcm90b3R5cGUubm90RXF1YWxzO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZGlmZmVycyBmcm9tIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNub3RFcXVhbHN9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLm5lID0gTG9uZ1Byb3RvdHlwZS5ub3RFcXVhbHM7XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBsZXNzIHRoYW4gdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5sZXNzVGhhbiA9IGZ1bmN0aW9uIGxlc3NUaGFuKG90aGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcChcbiAgICAvKiB2YWxpZGF0ZXMgKi9cbiAgICBvdGhlcikgPCAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgbGVzcyB0aGFuIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNsZXNzVGhhbn0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmx0ID0gTG9uZ1Byb3RvdHlwZS5sZXNzVGhhbjtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmxlc3NUaGFuT3JFcXVhbCA9IGZ1bmN0aW9uIGxlc3NUaGFuT3JFcXVhbChvdGhlcikge1xuICAgIHJldHVybiB0aGlzLmNvbXAoXG4gICAgLyogdmFsaWRhdGVzICovXG4gICAgb3RoZXIpIDw9IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2xlc3NUaGFuT3JFcXVhbH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmx0ZSA9IExvbmdQcm90b3R5cGUubGVzc1RoYW5PckVxdWFsO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNsZXNzVGhhbk9yRXF1YWx9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmxlID0gTG9uZ1Byb3RvdHlwZS5sZXNzVGhhbk9yRXF1YWw7XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5ncmVhdGVyVGhhbiA9IGZ1bmN0aW9uIGdyZWF0ZXJUaGFuKG90aGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcChcbiAgICAvKiB2YWxpZGF0ZXMgKi9cbiAgICBvdGhlcikgPiAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNncmVhdGVyVGhhbn0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmd0ID0gTG9uZ1Byb3RvdHlwZS5ncmVhdGVyVGhhbjtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmdyZWF0ZXJUaGFuT3JFcXVhbCA9IGZ1bmN0aW9uIGdyZWF0ZXJUaGFuT3JFcXVhbChvdGhlcikge1xuICAgIHJldHVybiB0aGlzLmNvbXAoXG4gICAgLyogdmFsaWRhdGVzICovXG4gICAgb3RoZXIpID49IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2dyZWF0ZXJUaGFuT3JFcXVhbH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmd0ZSA9IExvbmdQcm90b3R5cGUuZ3JlYXRlclRoYW5PckVxdWFsO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNncmVhdGVyVGhhbk9yRXF1YWx9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmdlID0gTG9uZ1Byb3RvdHlwZS5ncmVhdGVyVGhhbk9yRXF1YWw7XG4gIC8qKlxuICAgKiBDb21wYXJlcyB0aGlzIExvbmcncyB2YWx1ZSB3aXRoIHRoZSBzcGVjaWZpZWQncy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IDAgaWYgdGhleSBhcmUgdGhlIHNhbWUsIDEgaWYgdGhlIHRoaXMgaXMgZ3JlYXRlciBhbmQgLTFcbiAgICogIGlmIHRoZSBnaXZlbiBvbmUgaXMgZ3JlYXRlclxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUob3RoZXIpIHtcbiAgICBpZiAoIWlzTG9uZyhvdGhlcikpIG90aGVyID0gZnJvbVZhbHVlKG90aGVyKTtcbiAgICBpZiAodGhpcy5lcShvdGhlcikpIHJldHVybiAwO1xuICAgIHZhciB0aGlzTmVnID0gdGhpcy5pc05lZ2F0aXZlKCksXG4gICAgICAgIG90aGVyTmVnID0gb3RoZXIuaXNOZWdhdGl2ZSgpO1xuICAgIGlmICh0aGlzTmVnICYmICFvdGhlck5lZykgcmV0dXJuIC0xO1xuICAgIGlmICghdGhpc05lZyAmJiBvdGhlck5lZykgcmV0dXJuIDE7IC8vIEF0IHRoaXMgcG9pbnQgdGhlIHNpZ24gYml0cyBhcmUgdGhlIHNhbWVcbiAgXG4gICAgaWYgKCF0aGlzLnVuc2lnbmVkKSByZXR1cm4gdGhpcy5zdWIob3RoZXIpLmlzTmVnYXRpdmUoKSA/IC0xIDogMTsgLy8gQm90aCBhcmUgcG9zaXRpdmUgaWYgYXQgbGVhc3Qgb25lIGlzIHVuc2lnbmVkXG4gIFxuICAgIHJldHVybiBvdGhlci5oaWdoID4+PiAwID4gdGhpcy5oaWdoID4+PiAwIHx8IG90aGVyLmhpZ2ggPT09IHRoaXMuaGlnaCAmJiBvdGhlci5sb3cgPj4+IDAgPiB0aGlzLmxvdyA+Pj4gMCA/IC0xIDogMTtcbiAgfTtcbiAgLyoqXG4gICAqIENvbXBhcmVzIHRoaXMgTG9uZydzIHZhbHVlIHdpdGggdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2NvbXBhcmV9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSAwIGlmIHRoZXkgYXJlIHRoZSBzYW1lLCAxIGlmIHRoZSB0aGlzIGlzIGdyZWF0ZXIgYW5kIC0xXG4gICAqICBpZiB0aGUgZ2l2ZW4gb25lIGlzIGdyZWF0ZXJcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5jb21wID0gTG9uZ1Byb3RvdHlwZS5jb21wYXJlO1xuICAvKipcbiAgICogTmVnYXRlcyB0aGlzIExvbmcncyB2YWx1ZS5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUxvbmd9IE5lZ2F0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubmVnYXRlID0gZnVuY3Rpb24gbmVnYXRlKCkge1xuICAgIGlmICghdGhpcy51bnNpZ25lZCAmJiB0aGlzLmVxKE1JTl9WQUxVRSkpIHJldHVybiBNSU5fVkFMVUU7XG4gICAgcmV0dXJuIHRoaXMubm90KCkuYWRkKE9ORSk7XG4gIH07XG4gIC8qKlxuICAgKiBOZWdhdGVzIHRoaXMgTG9uZydzIHZhbHVlLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI25lZ2F0ZX0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcmV0dXJucyB7IUxvbmd9IE5lZ2F0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLm5lZyA9IExvbmdQcm90b3R5cGUubmVnYXRlO1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgc3VtIG9mIHRoaXMgYW5kIHRoZSBzcGVjaWZpZWQgTG9uZy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IGFkZGVuZCBBZGRlbmRcbiAgICogQHJldHVybnMgeyFMb25nfSBTdW1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIGFkZChhZGRlbmQpIHtcbiAgICBpZiAoIWlzTG9uZyhhZGRlbmQpKSBhZGRlbmQgPSBmcm9tVmFsdWUoYWRkZW5kKTsgLy8gRGl2aWRlIGVhY2ggbnVtYmVyIGludG8gNCBjaHVua3Mgb2YgMTYgYml0cywgYW5kIHRoZW4gc3VtIHRoZSBjaHVua3MuXG4gIFxuICAgIHZhciBhNDggPSB0aGlzLmhpZ2ggPj4+IDE2O1xuICAgIHZhciBhMzIgPSB0aGlzLmhpZ2ggJiAweEZGRkY7XG4gICAgdmFyIGExNiA9IHRoaXMubG93ID4+PiAxNjtcbiAgICB2YXIgYTAwID0gdGhpcy5sb3cgJiAweEZGRkY7XG4gICAgdmFyIGI0OCA9IGFkZGVuZC5oaWdoID4+PiAxNjtcbiAgICB2YXIgYjMyID0gYWRkZW5kLmhpZ2ggJiAweEZGRkY7XG4gICAgdmFyIGIxNiA9IGFkZGVuZC5sb3cgPj4+IDE2O1xuICAgIHZhciBiMDAgPSBhZGRlbmQubG93ICYgMHhGRkZGO1xuICAgIHZhciBjNDggPSAwLFxuICAgICAgICBjMzIgPSAwLFxuICAgICAgICBjMTYgPSAwLFxuICAgICAgICBjMDAgPSAwO1xuICAgIGMwMCArPSBhMDAgKyBiMDA7XG4gICAgYzE2ICs9IGMwMCA+Pj4gMTY7XG4gICAgYzAwICY9IDB4RkZGRjtcbiAgICBjMTYgKz0gYTE2ICsgYjE2O1xuICAgIGMzMiArPSBjMTYgPj4+IDE2O1xuICAgIGMxNiAmPSAweEZGRkY7XG4gICAgYzMyICs9IGEzMiArIGIzMjtcbiAgICBjNDggKz0gYzMyID4+PiAxNjtcbiAgICBjMzIgJj0gMHhGRkZGO1xuICAgIGM0OCArPSBhNDggKyBiNDg7XG4gICAgYzQ4ICY9IDB4RkZGRjtcbiAgICByZXR1cm4gZnJvbUJpdHMoYzE2IDw8IDE2IHwgYzAwLCBjNDggPDwgMTYgfCBjMzIsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgZGlmZmVyZW5jZSBvZiB0aGlzIGFuZCB0aGUgc3BlY2lmaWVkIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBzdWJ0cmFoZW5kIFN1YnRyYWhlbmRcbiAgICogQHJldHVybnMgeyFMb25nfSBEaWZmZXJlbmNlXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbiBzdWJ0cmFjdChzdWJ0cmFoZW5kKSB7XG4gICAgaWYgKCFpc0xvbmcoc3VidHJhaGVuZCkpIHN1YnRyYWhlbmQgPSBmcm9tVmFsdWUoc3VidHJhaGVuZCk7XG4gICAgcmV0dXJuIHRoaXMuYWRkKHN1YnRyYWhlbmQubmVnKCkpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgZGlmZmVyZW5jZSBvZiB0aGlzIGFuZCB0aGUgc3BlY2lmaWVkIExvbmcuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjc3VidHJhY3R9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBzdWJ0cmFoZW5kIFN1YnRyYWhlbmRcbiAgICogQHJldHVybnMgeyFMb25nfSBEaWZmZXJlbmNlXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuc3ViID0gTG9uZ1Byb3RvdHlwZS5zdWJ0cmFjdDtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHByb2R1Y3Qgb2YgdGhpcyBhbmQgdGhlIHNwZWNpZmllZCBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gbXVsdGlwbGllciBNdWx0aXBsaWVyXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUHJvZHVjdFxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubXVsdGlwbHkgPSBmdW5jdGlvbiBtdWx0aXBseShtdWx0aXBsaWVyKSB7XG4gICAgaWYgKHRoaXMuaXNaZXJvKCkpIHJldHVybiB0aGlzO1xuICAgIGlmICghaXNMb25nKG11bHRpcGxpZXIpKSBtdWx0aXBsaWVyID0gZnJvbVZhbHVlKG11bHRpcGxpZXIpOyAvLyB1c2Ugd2FzbSBzdXBwb3J0IGlmIHByZXNlbnRcbiAgXG4gICAgaWYgKHdhc20pIHtcbiAgICAgIHZhciBsb3cgPSB3YXNtW1wibXVsXCJdKHRoaXMubG93LCB0aGlzLmhpZ2gsIG11bHRpcGxpZXIubG93LCBtdWx0aXBsaWVyLmhpZ2gpO1xuICAgICAgcmV0dXJuIGZyb21CaXRzKGxvdywgd2FzbVtcImdldF9oaWdoXCJdKCksIHRoaXMudW5zaWduZWQpO1xuICAgIH1cbiAgXG4gICAgaWYgKG11bHRpcGxpZXIuaXNaZXJvKCkpIHJldHVybiB0aGlzLnVuc2lnbmVkID8gVVpFUk8gOiBaRVJPO1xuICAgIGlmICh0aGlzLmVxKE1JTl9WQUxVRSkpIHJldHVybiBtdWx0aXBsaWVyLmlzT2RkKCkgPyBNSU5fVkFMVUUgOiBaRVJPO1xuICAgIGlmIChtdWx0aXBsaWVyLmVxKE1JTl9WQUxVRSkpIHJldHVybiB0aGlzLmlzT2RkKCkgPyBNSU5fVkFMVUUgOiBaRVJPO1xuICBcbiAgICBpZiAodGhpcy5pc05lZ2F0aXZlKCkpIHtcbiAgICAgIGlmIChtdWx0aXBsaWVyLmlzTmVnYXRpdmUoKSkgcmV0dXJuIHRoaXMubmVnKCkubXVsKG11bHRpcGxpZXIubmVnKCkpO2Vsc2UgcmV0dXJuIHRoaXMubmVnKCkubXVsKG11bHRpcGxpZXIpLm5lZygpO1xuICAgIH0gZWxzZSBpZiAobXVsdGlwbGllci5pc05lZ2F0aXZlKCkpIHJldHVybiB0aGlzLm11bChtdWx0aXBsaWVyLm5lZygpKS5uZWcoKTsgLy8gSWYgYm90aCBsb25ncyBhcmUgc21hbGwsIHVzZSBmbG9hdCBtdWx0aXBsaWNhdGlvblxuICBcbiAgXG4gICAgaWYgKHRoaXMubHQoVFdPX1BXUl8yNCkgJiYgbXVsdGlwbGllci5sdChUV09fUFdSXzI0KSkgcmV0dXJuIGZyb21OdW1iZXIodGhpcy50b051bWJlcigpICogbXVsdGlwbGllci50b051bWJlcigpLCB0aGlzLnVuc2lnbmVkKTsgLy8gRGl2aWRlIGVhY2ggbG9uZyBpbnRvIDQgY2h1bmtzIG9mIDE2IGJpdHMsIGFuZCB0aGVuIGFkZCB1cCA0eDQgcHJvZHVjdHMuXG4gICAgLy8gV2UgY2FuIHNraXAgcHJvZHVjdHMgdGhhdCB3b3VsZCBvdmVyZmxvdy5cbiAgXG4gICAgdmFyIGE0OCA9IHRoaXMuaGlnaCA+Pj4gMTY7XG4gICAgdmFyIGEzMiA9IHRoaXMuaGlnaCAmIDB4RkZGRjtcbiAgICB2YXIgYTE2ID0gdGhpcy5sb3cgPj4+IDE2O1xuICAgIHZhciBhMDAgPSB0aGlzLmxvdyAmIDB4RkZGRjtcbiAgICB2YXIgYjQ4ID0gbXVsdGlwbGllci5oaWdoID4+PiAxNjtcbiAgICB2YXIgYjMyID0gbXVsdGlwbGllci5oaWdoICYgMHhGRkZGO1xuICAgIHZhciBiMTYgPSBtdWx0aXBsaWVyLmxvdyA+Pj4gMTY7XG4gICAgdmFyIGIwMCA9IG11bHRpcGxpZXIubG93ICYgMHhGRkZGO1xuICAgIHZhciBjNDggPSAwLFxuICAgICAgICBjMzIgPSAwLFxuICAgICAgICBjMTYgPSAwLFxuICAgICAgICBjMDAgPSAwO1xuICAgIGMwMCArPSBhMDAgKiBiMDA7XG4gICAgYzE2ICs9IGMwMCA+Pj4gMTY7XG4gICAgYzAwICY9IDB4RkZGRjtcbiAgICBjMTYgKz0gYTE2ICogYjAwO1xuICAgIGMzMiArPSBjMTYgPj4+IDE2O1xuICAgIGMxNiAmPSAweEZGRkY7XG4gICAgYzE2ICs9IGEwMCAqIGIxNjtcbiAgICBjMzIgKz0gYzE2ID4+PiAxNjtcbiAgICBjMTYgJj0gMHhGRkZGO1xuICAgIGMzMiArPSBhMzIgKiBiMDA7XG4gICAgYzQ4ICs9IGMzMiA+Pj4gMTY7XG4gICAgYzMyICY9IDB4RkZGRjtcbiAgICBjMzIgKz0gYTE2ICogYjE2O1xuICAgIGM0OCArPSBjMzIgPj4+IDE2O1xuICAgIGMzMiAmPSAweEZGRkY7XG4gICAgYzMyICs9IGEwMCAqIGIzMjtcbiAgICBjNDggKz0gYzMyID4+PiAxNjtcbiAgICBjMzIgJj0gMHhGRkZGO1xuICAgIGM0OCArPSBhNDggKiBiMDAgKyBhMzIgKiBiMTYgKyBhMTYgKiBiMzIgKyBhMDAgKiBiNDg7XG4gICAgYzQ4ICY9IDB4RkZGRjtcbiAgICByZXR1cm4gZnJvbUJpdHMoYzE2IDw8IDE2IHwgYzAwLCBjNDggPDwgMTYgfCBjMzIsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJvZHVjdCBvZiB0aGlzIGFuZCB0aGUgc3BlY2lmaWVkIExvbmcuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbXVsdGlwbHl9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBtdWx0aXBsaWVyIE11bHRpcGxpZXJcbiAgICogQHJldHVybnMgeyFMb25nfSBQcm9kdWN0XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUubXVsID0gTG9uZ1Byb3RvdHlwZS5tdWx0aXBseTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIGRpdmlkZWQgYnkgdGhlIHNwZWNpZmllZC4gVGhlIHJlc3VsdCBpcyBzaWduZWQgaWYgdGhpcyBMb25nIGlzIHNpZ25lZCBvclxuICAgKiAgdW5zaWduZWQgaWYgdGhpcyBMb25nIGlzIHVuc2lnbmVkLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gZGl2aXNvciBEaXZpc29yXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUXVvdGllbnRcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmRpdmlkZSA9IGZ1bmN0aW9uIGRpdmlkZShkaXZpc29yKSB7XG4gICAgaWYgKCFpc0xvbmcoZGl2aXNvcikpIGRpdmlzb3IgPSBmcm9tVmFsdWUoZGl2aXNvcik7XG4gICAgaWYgKGRpdmlzb3IuaXNaZXJvKCkpIHRocm93IEVycm9yKCdkaXZpc2lvbiBieSB6ZXJvJyk7IC8vIHVzZSB3YXNtIHN1cHBvcnQgaWYgcHJlc2VudFxuICBcbiAgICBpZiAod2FzbSkge1xuICAgICAgLy8gZ3VhcmQgYWdhaW5zdCBzaWduZWQgZGl2aXNpb24gb3ZlcmZsb3c6IHRoZSBsYXJnZXN0XG4gICAgICAvLyBuZWdhdGl2ZSBudW1iZXIgLyAtMSB3b3VsZCBiZSAxIGxhcmdlciB0aGFuIHRoZSBsYXJnZXN0XG4gICAgICAvLyBwb3NpdGl2ZSBudW1iZXIsIGR1ZSB0byB0d28ncyBjb21wbGVtZW50LlxuICAgICAgaWYgKCF0aGlzLnVuc2lnbmVkICYmIHRoaXMuaGlnaCA9PT0gLTB4ODAwMDAwMDAgJiYgZGl2aXNvci5sb3cgPT09IC0xICYmIGRpdmlzb3IuaGlnaCA9PT0gLTEpIHtcbiAgICAgICAgLy8gYmUgY29uc2lzdGVudCB3aXRoIG5vbi13YXNtIGNvZGUgcGF0aFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgXG4gICAgICB2YXIgbG93ID0gKHRoaXMudW5zaWduZWQgPyB3YXNtW1wiZGl2X3VcIl0gOiB3YXNtW1wiZGl2X3NcIl0pKHRoaXMubG93LCB0aGlzLmhpZ2gsIGRpdmlzb3IubG93LCBkaXZpc29yLmhpZ2gpO1xuICAgICAgcmV0dXJuIGZyb21CaXRzKGxvdywgd2FzbVtcImdldF9oaWdoXCJdKCksIHRoaXMudW5zaWduZWQpO1xuICAgIH1cbiAgXG4gICAgaWYgKHRoaXMuaXNaZXJvKCkpIHJldHVybiB0aGlzLnVuc2lnbmVkID8gVVpFUk8gOiBaRVJPO1xuICAgIHZhciBhcHByb3gsIHJlbSwgcmVzO1xuICBcbiAgICBpZiAoIXRoaXMudW5zaWduZWQpIHtcbiAgICAgIC8vIFRoaXMgc2VjdGlvbiBpcyBvbmx5IHJlbGV2YW50IGZvciBzaWduZWQgbG9uZ3MgYW5kIGlzIGRlcml2ZWQgZnJvbSB0aGVcbiAgICAgIC8vIGNsb3N1cmUgbGlicmFyeSBhcyBhIHdob2xlLlxuICAgICAgaWYgKHRoaXMuZXEoTUlOX1ZBTFVFKSkge1xuICAgICAgICBpZiAoZGl2aXNvci5lcShPTkUpIHx8IGRpdmlzb3IuZXEoTkVHX09ORSkpIHJldHVybiBNSU5fVkFMVUU7IC8vIHJlY2FsbCB0aGF0IC1NSU5fVkFMVUUgPT0gTUlOX1ZBTFVFXG4gICAgICAgIGVsc2UgaWYgKGRpdmlzb3IuZXEoTUlOX1ZBTFVFKSkgcmV0dXJuIE9ORTtlbHNlIHtcbiAgICAgICAgICAvLyBBdCB0aGlzIHBvaW50LCB3ZSBoYXZlIHxvdGhlcnwgPj0gMiwgc28gfHRoaXMvb3RoZXJ8IDwgfE1JTl9WQUxVRXwuXG4gICAgICAgICAgdmFyIGhhbGZUaGlzID0gdGhpcy5zaHIoMSk7XG4gICAgICAgICAgYXBwcm94ID0gaGFsZlRoaXMuZGl2KGRpdmlzb3IpLnNobCgxKTtcbiAgXG4gICAgICAgICAgaWYgKGFwcHJveC5lcShaRVJPKSkge1xuICAgICAgICAgICAgcmV0dXJuIGRpdmlzb3IuaXNOZWdhdGl2ZSgpID8gT05FIDogTkVHX09ORTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVtID0gdGhpcy5zdWIoZGl2aXNvci5tdWwoYXBwcm94KSk7XG4gICAgICAgICAgICByZXMgPSBhcHByb3guYWRkKHJlbS5kaXYoZGl2aXNvcikpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZGl2aXNvci5lcShNSU5fVkFMVUUpKSByZXR1cm4gdGhpcy51bnNpZ25lZCA/IFVaRVJPIDogWkVSTztcbiAgXG4gICAgICBpZiAodGhpcy5pc05lZ2F0aXZlKCkpIHtcbiAgICAgICAgaWYgKGRpdmlzb3IuaXNOZWdhdGl2ZSgpKSByZXR1cm4gdGhpcy5uZWcoKS5kaXYoZGl2aXNvci5uZWcoKSk7XG4gICAgICAgIHJldHVybiB0aGlzLm5lZygpLmRpdihkaXZpc29yKS5uZWcoKTtcbiAgICAgIH0gZWxzZSBpZiAoZGl2aXNvci5pc05lZ2F0aXZlKCkpIHJldHVybiB0aGlzLmRpdihkaXZpc29yLm5lZygpKS5uZWcoKTtcbiAgXG4gICAgICByZXMgPSBaRVJPO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgYWxnb3JpdGhtIGJlbG93IGhhcyBub3QgYmVlbiBtYWRlIGZvciB1bnNpZ25lZCBsb25ncy4gSXQncyB0aGVyZWZvcmVcbiAgICAgIC8vIHJlcXVpcmVkIHRvIHRha2Ugc3BlY2lhbCBjYXJlIG9mIHRoZSBNU0IgcHJpb3IgdG8gcnVubmluZyBpdC5cbiAgICAgIGlmICghZGl2aXNvci51bnNpZ25lZCkgZGl2aXNvciA9IGRpdmlzb3IudG9VbnNpZ25lZCgpO1xuICAgICAgaWYgKGRpdmlzb3IuZ3QodGhpcykpIHJldHVybiBVWkVSTztcbiAgICAgIGlmIChkaXZpc29yLmd0KHRoaXMuc2hydSgxKSkpIC8vIDE1ID4+PiAxID0gNyA7IHdpdGggZGl2aXNvciA9IDggOyB0cnVlXG4gICAgICAgIHJldHVybiBVT05FO1xuICAgICAgcmVzID0gVVpFUk87XG4gICAgfSAvLyBSZXBlYXQgdGhlIGZvbGxvd2luZyB1bnRpbCB0aGUgcmVtYWluZGVyIGlzIGxlc3MgdGhhbiBvdGhlcjogIGZpbmQgYVxuICAgIC8vIGZsb2F0aW5nLXBvaW50IHRoYXQgYXBwcm94aW1hdGVzIHJlbWFpbmRlciAvIG90aGVyICpmcm9tIGJlbG93KiwgYWRkIHRoaXNcbiAgICAvLyBpbnRvIHRoZSByZXN1bHQsIGFuZCBzdWJ0cmFjdCBpdCBmcm9tIHRoZSByZW1haW5kZXIuICBJdCBpcyBjcml0aWNhbCB0aGF0XG4gICAgLy8gdGhlIGFwcHJveGltYXRlIHZhbHVlIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgcmVhbCB2YWx1ZSBzbyB0aGF0IHRoZVxuICAgIC8vIHJlbWFpbmRlciBuZXZlciBiZWNvbWVzIG5lZ2F0aXZlLlxuICBcbiAgXG4gICAgcmVtID0gdGhpcztcbiAgXG4gICAgd2hpbGUgKHJlbS5ndGUoZGl2aXNvcikpIHtcbiAgICAgIC8vIEFwcHJveGltYXRlIHRoZSByZXN1bHQgb2YgZGl2aXNpb24uIFRoaXMgbWF5IGJlIGEgbGl0dGxlIGdyZWF0ZXIgb3JcbiAgICAgIC8vIHNtYWxsZXIgdGhhbiB0aGUgYWN0dWFsIHZhbHVlLlxuICAgICAgYXBwcm94ID0gTWF0aC5tYXgoMSwgTWF0aC5mbG9vcihyZW0udG9OdW1iZXIoKSAvIGRpdmlzb3IudG9OdW1iZXIoKSkpOyAvLyBXZSB3aWxsIHR3ZWFrIHRoZSBhcHByb3hpbWF0ZSByZXN1bHQgYnkgY2hhbmdpbmcgaXQgaW4gdGhlIDQ4LXRoIGRpZ2l0IG9yXG4gICAgICAvLyB0aGUgc21hbGxlc3Qgbm9uLWZyYWN0aW9uYWwgZGlnaXQsIHdoaWNoZXZlciBpcyBsYXJnZXIuXG4gIFxuICAgICAgdmFyIGxvZzIgPSBNYXRoLmNlaWwoTWF0aC5sb2coYXBwcm94KSAvIE1hdGguTE4yKSxcbiAgICAgICAgICBkZWx0YSA9IGxvZzIgPD0gNDggPyAxIDogcG93X2RibCgyLCBsb2cyIC0gNDgpLFxuICAgICAgICAgIC8vIERlY3JlYXNlIHRoZSBhcHByb3hpbWF0aW9uIHVudGlsIGl0IGlzIHNtYWxsZXIgdGhhbiB0aGUgcmVtYWluZGVyLiAgTm90ZVxuICAgICAgLy8gdGhhdCBpZiBpdCBpcyB0b28gbGFyZ2UsIHRoZSBwcm9kdWN0IG92ZXJmbG93cyBhbmQgaXMgbmVnYXRpdmUuXG4gICAgICBhcHByb3hSZXMgPSBmcm9tTnVtYmVyKGFwcHJveCksXG4gICAgICAgICAgYXBwcm94UmVtID0gYXBwcm94UmVzLm11bChkaXZpc29yKTtcbiAgXG4gICAgICB3aGlsZSAoYXBwcm94UmVtLmlzTmVnYXRpdmUoKSB8fCBhcHByb3hSZW0uZ3QocmVtKSkge1xuICAgICAgICBhcHByb3ggLT0gZGVsdGE7XG4gICAgICAgIGFwcHJveFJlcyA9IGZyb21OdW1iZXIoYXBwcm94LCB0aGlzLnVuc2lnbmVkKTtcbiAgICAgICAgYXBwcm94UmVtID0gYXBwcm94UmVzLm11bChkaXZpc29yKTtcbiAgICAgIH0gLy8gV2Uga25vdyB0aGUgYW5zd2VyIGNhbid0IGJlIHplcm8uLi4gYW5kIGFjdHVhbGx5LCB6ZXJvIHdvdWxkIGNhdXNlXG4gICAgICAvLyBpbmZpbml0ZSByZWN1cnNpb24gc2luY2Ugd2Ugd291bGQgbWFrZSBubyBwcm9ncmVzcy5cbiAgXG4gIFxuICAgICAgaWYgKGFwcHJveFJlcy5pc1plcm8oKSkgYXBwcm94UmVzID0gT05FO1xuICAgICAgcmVzID0gcmVzLmFkZChhcHByb3hSZXMpO1xuICAgICAgcmVtID0gcmVtLnN1YihhcHByb3hSZW0pO1xuICAgIH1cbiAgXG4gICAgcmV0dXJuIHJlcztcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIGRpdmlkZWQgYnkgdGhlIHNwZWNpZmllZC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNkaXZpZGV9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBkaXZpc29yIERpdmlzb3JcbiAgICogQHJldHVybnMgeyFMb25nfSBRdW90aWVudFxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmRpdiA9IExvbmdQcm90b3R5cGUuZGl2aWRlO1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgbW9kdWxvIHRoZSBzcGVjaWZpZWQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBkaXZpc29yIERpdmlzb3JcbiAgICogQHJldHVybnMgeyFMb25nfSBSZW1haW5kZXJcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLm1vZHVsbyA9IGZ1bmN0aW9uIG1vZHVsbyhkaXZpc29yKSB7XG4gICAgaWYgKCFpc0xvbmcoZGl2aXNvcikpIGRpdmlzb3IgPSBmcm9tVmFsdWUoZGl2aXNvcik7IC8vIHVzZSB3YXNtIHN1cHBvcnQgaWYgcHJlc2VudFxuICBcbiAgICBpZiAod2FzbSkge1xuICAgICAgdmFyIGxvdyA9ICh0aGlzLnVuc2lnbmVkID8gd2FzbVtcInJlbV91XCJdIDogd2FzbVtcInJlbV9zXCJdKSh0aGlzLmxvdywgdGhpcy5oaWdoLCBkaXZpc29yLmxvdywgZGl2aXNvci5oaWdoKTtcbiAgICAgIHJldHVybiBmcm9tQml0cyhsb3csIHdhc21bXCJnZXRfaGlnaFwiXSgpLCB0aGlzLnVuc2lnbmVkKTtcbiAgICB9XG4gIFxuICAgIHJldHVybiB0aGlzLnN1Yih0aGlzLmRpdihkaXZpc29yKS5tdWwoZGl2aXNvcikpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgbW9kdWxvIHRoZSBzcGVjaWZpZWQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbW9kdWxvfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gZGl2aXNvciBEaXZpc29yXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUmVtYWluZGVyXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUubW9kID0gTG9uZ1Byb3RvdHlwZS5tb2R1bG87XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyBtb2R1bG8gdGhlIHNwZWNpZmllZC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNtb2R1bG99LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBkaXZpc29yIERpdmlzb3JcbiAgICogQHJldHVybnMgeyFMb25nfSBSZW1haW5kZXJcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnJlbSA9IExvbmdQcm90b3R5cGUubW9kdWxvO1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgYml0d2lzZSBOT1Qgb2YgdGhpcyBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLm5vdCA9IGZ1bmN0aW9uIG5vdCgpIHtcbiAgICByZXR1cm4gZnJvbUJpdHMofnRoaXMubG93LCB+dGhpcy5oaWdoLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgY291bnQgbGVhZGluZyB6ZXJvcyBvZiB0aGlzIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFudW1iZXJ9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuY291bnRMZWFkaW5nWmVyb3MgPSBmdW5jdGlvbiBjb3VudExlYWRpbmdaZXJvcygpIHtcbiAgICByZXR1cm4gdGhpcy5oaWdoID8gTWF0aC5jbHozMih0aGlzLmhpZ2gpIDogTWF0aC5jbHozMih0aGlzLmxvdykgKyAzMjtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgY291bnQgbGVhZGluZyB6ZXJvcy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNjb3VudExlYWRpbmdaZXJvc30uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfVxuICAgKiBAcmV0dXJucyB7IW51bWJlcn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5jbHogPSBMb25nUHJvdG90eXBlLmNvdW50TGVhZGluZ1plcm9zO1xuICAvKipcbiAgICogUmV0dXJucyBjb3VudCB0cmFpbGluZyB6ZXJvcyBvZiB0aGlzIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFudW1iZXJ9XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5jb3VudFRyYWlsaW5nWmVyb3MgPSBmdW5jdGlvbiBjb3VudFRyYWlsaW5nWmVyb3MoKSB7XG4gICAgcmV0dXJuIHRoaXMubG93ID8gY3R6MzIodGhpcy5sb3cpIDogY3R6MzIodGhpcy5oaWdoKSArIDMyO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyBjb3VudCB0cmFpbGluZyB6ZXJvcy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNjb3VudFRyYWlsaW5nWmVyb3N9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFudW1iZXJ9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuY3R6ID0gTG9uZ1Byb3RvdHlwZS5jb3VudFRyYWlsaW5nWmVyb3M7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBiaXR3aXNlIEFORCBvZiB0aGlzIExvbmcgYW5kIHRoZSBzcGVjaWZpZWQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciBMb25nXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmFuZCA9IGZ1bmN0aW9uIGFuZChvdGhlcikge1xuICAgIGlmICghaXNMb25nKG90aGVyKSkgb3RoZXIgPSBmcm9tVmFsdWUob3RoZXIpO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyAmIG90aGVyLmxvdywgdGhpcy5oaWdoICYgb3RoZXIuaGlnaCwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBiaXR3aXNlIE9SIG9mIHRoaXMgTG9uZyBhbmQgdGhlIHNwZWNpZmllZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIExvbmdcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLm9yID0gZnVuY3Rpb24gb3Iob3RoZXIpIHtcbiAgICBpZiAoIWlzTG9uZyhvdGhlcikpIG90aGVyID0gZnJvbVZhbHVlKG90aGVyKTtcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgfCBvdGhlci5sb3csIHRoaXMuaGlnaCB8IG90aGVyLmhpZ2gsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgYml0d2lzZSBYT1Igb2YgdGhpcyBMb25nIGFuZCB0aGUgZ2l2ZW4gb25lLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgTG9uZ1xuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUueG9yID0gZnVuY3Rpb24geG9yKG90aGVyKSB7XG4gICAgaWYgKCFpc0xvbmcob3RoZXIpKSBvdGhlciA9IGZyb21WYWx1ZShvdGhlcik7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93IF4gb3RoZXIubG93LCB0aGlzLmhpZ2ggXiBvdGhlci5oaWdoLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBzaGlmdGVkIHRvIHRoZSBsZWZ0IGJ5IHRoZSBnaXZlbiBhbW91bnQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5zaGlmdExlZnQgPSBmdW5jdGlvbiBzaGlmdExlZnQobnVtQml0cykge1xuICAgIGlmIChpc0xvbmcobnVtQml0cykpIG51bUJpdHMgPSBudW1CaXRzLnRvSW50KCk7XG4gICAgaWYgKChudW1CaXRzICY9IDYzKSA9PT0gMCkgcmV0dXJuIHRoaXM7ZWxzZSBpZiAobnVtQml0cyA8IDMyKSByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgPDwgbnVtQml0cywgdGhpcy5oaWdoIDw8IG51bUJpdHMgfCB0aGlzLmxvdyA+Pj4gMzIgLSBudW1CaXRzLCB0aGlzLnVuc2lnbmVkKTtlbHNlIHJldHVybiBmcm9tQml0cygwLCB0aGlzLmxvdyA8PCBudW1CaXRzIC0gMzIsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIHNoaWZ0ZWQgdG8gdGhlIGxlZnQgYnkgdGhlIGdpdmVuIGFtb3VudC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNzaGlmdExlZnR9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5zaGwgPSBMb25nUHJvdG90eXBlLnNoaWZ0TGVmdDtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBhcml0aG1ldGljYWxseSBzaGlmdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5zaGlmdFJpZ2h0ID0gZnVuY3Rpb24gc2hpZnRSaWdodChudW1CaXRzKSB7XG4gICAgaWYgKGlzTG9uZyhudW1CaXRzKSkgbnVtQml0cyA9IG51bUJpdHMudG9JbnQoKTtcbiAgICBpZiAoKG51bUJpdHMgJj0gNjMpID09PSAwKSByZXR1cm4gdGhpcztlbHNlIGlmIChudW1CaXRzIDwgMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyA+Pj4gbnVtQml0cyB8IHRoaXMuaGlnaCA8PCAzMiAtIG51bUJpdHMsIHRoaXMuaGlnaCA+PiBudW1CaXRzLCB0aGlzLnVuc2lnbmVkKTtlbHNlIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2ggPj4gbnVtQml0cyAtIDMyLCB0aGlzLmhpZ2ggPj0gMCA/IDAgOiAtMSwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgYXJpdGhtZXRpY2FsbHkgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNzaGlmdFJpZ2h0fS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuc2hyID0gTG9uZ1Byb3RvdHlwZS5zaGlmdFJpZ2h0O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIGxvZ2ljYWxseSBzaGlmdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5zaGlmdFJpZ2h0VW5zaWduZWQgPSBmdW5jdGlvbiBzaGlmdFJpZ2h0VW5zaWduZWQobnVtQml0cykge1xuICAgIGlmIChpc0xvbmcobnVtQml0cykpIG51bUJpdHMgPSBudW1CaXRzLnRvSW50KCk7XG4gICAgaWYgKChudW1CaXRzICY9IDYzKSA9PT0gMCkgcmV0dXJuIHRoaXM7XG4gICAgaWYgKG51bUJpdHMgPCAzMikgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93ID4+PiBudW1CaXRzIHwgdGhpcy5oaWdoIDw8IDMyIC0gbnVtQml0cywgdGhpcy5oaWdoID4+PiBudW1CaXRzLCB0aGlzLnVuc2lnbmVkKTtcbiAgICBpZiAobnVtQml0cyA9PT0gMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2gsIDAsIHRoaXMudW5zaWduZWQpO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2ggPj4+IG51bUJpdHMgLSAzMiwgMCwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgbG9naWNhbGx5IHNoaWZ0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjc2hpZnRSaWdodFVuc2lnbmVkfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuc2hydSA9IExvbmdQcm90b3R5cGUuc2hpZnRSaWdodFVuc2lnbmVkO1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIGxvZ2ljYWxseSBzaGlmdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3NoaWZ0UmlnaHRVbnNpZ25lZH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuc2hyX3UgPSBMb25nUHJvdG90eXBlLnNoaWZ0UmlnaHRVbnNpZ25lZDtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyByb3RhdGVkIHRvIHRoZSBsZWZ0IGJ5IHRoZSBnaXZlbiBhbW91bnQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBSb3RhdGVkIExvbmdcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnJvdGF0ZUxlZnQgPSBmdW5jdGlvbiByb3RhdGVMZWZ0KG51bUJpdHMpIHtcbiAgICB2YXIgYjtcbiAgICBpZiAoaXNMb25nKG51bUJpdHMpKSBudW1CaXRzID0gbnVtQml0cy50b0ludCgpO1xuICAgIGlmICgobnVtQml0cyAmPSA2MykgPT09IDApIHJldHVybiB0aGlzO1xuICAgIGlmIChudW1CaXRzID09PSAzMikgcmV0dXJuIGZyb21CaXRzKHRoaXMuaGlnaCwgdGhpcy5sb3csIHRoaXMudW5zaWduZWQpO1xuICBcbiAgICBpZiAobnVtQml0cyA8IDMyKSB7XG4gICAgICBiID0gMzIgLSBudW1CaXRzO1xuICAgICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93IDw8IG51bUJpdHMgfCB0aGlzLmhpZ2ggPj4+IGIsIHRoaXMuaGlnaCA8PCBudW1CaXRzIHwgdGhpcy5sb3cgPj4+IGIsIHRoaXMudW5zaWduZWQpO1xuICAgIH1cbiAgXG4gICAgbnVtQml0cyAtPSAzMjtcbiAgICBiID0gMzIgLSBudW1CaXRzO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2ggPDwgbnVtQml0cyB8IHRoaXMubG93ID4+PiBiLCB0aGlzLmxvdyA8PCBudW1CaXRzIHwgdGhpcy5oaWdoID4+PiBiLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyByb3RhdGVkIHRvIHRoZSBsZWZ0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjcm90YXRlTGVmdH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFJvdGF0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnJvdGwgPSBMb25nUHJvdG90eXBlLnJvdGF0ZUxlZnQ7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgcm90YXRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFJvdGF0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUucm90YXRlUmlnaHQgPSBmdW5jdGlvbiByb3RhdGVSaWdodChudW1CaXRzKSB7XG4gICAgdmFyIGI7XG4gICAgaWYgKGlzTG9uZyhudW1CaXRzKSkgbnVtQml0cyA9IG51bUJpdHMudG9JbnQoKTtcbiAgICBpZiAoKG51bUJpdHMgJj0gNjMpID09PSAwKSByZXR1cm4gdGhpcztcbiAgICBpZiAobnVtQml0cyA9PT0gMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2gsIHRoaXMubG93LCB0aGlzLnVuc2lnbmVkKTtcbiAgXG4gICAgaWYgKG51bUJpdHMgPCAzMikge1xuICAgICAgYiA9IDMyIC0gbnVtQml0cztcbiAgICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2ggPDwgYiB8IHRoaXMubG93ID4+PiBudW1CaXRzLCB0aGlzLmxvdyA8PCBiIHwgdGhpcy5oaWdoID4+PiBudW1CaXRzLCB0aGlzLnVuc2lnbmVkKTtcbiAgICB9XG4gIFxuICAgIG51bUJpdHMgLT0gMzI7XG4gICAgYiA9IDMyIC0gbnVtQml0cztcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgPDwgYiB8IHRoaXMuaGlnaCA+Pj4gbnVtQml0cywgdGhpcy5oaWdoIDw8IGIgfCB0aGlzLmxvdyA+Pj4gbnVtQml0cywgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgcm90YXRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNyb3RhdGVSaWdodH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFJvdGF0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnJvdHIgPSBMb25nUHJvdG90eXBlLnJvdGF0ZVJpZ2h0O1xuICAvKipcbiAgICogQ29udmVydHMgdGhpcyBMb25nIHRvIHNpZ25lZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNpZ25lZCBsb25nXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS50b1NpZ25lZCA9IGZ1bmN0aW9uIHRvU2lnbmVkKCkge1xuICAgIGlmICghdGhpcy51bnNpZ25lZCkgcmV0dXJuIHRoaXM7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93LCB0aGlzLmhpZ2gsIGZhbHNlKTtcbiAgfTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoaXMgTG9uZyB0byB1bnNpZ25lZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFVuc2lnbmVkIGxvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS50b1Vuc2lnbmVkID0gZnVuY3Rpb24gdG9VbnNpZ25lZCgpIHtcbiAgICBpZiAodGhpcy51bnNpZ25lZCkgcmV0dXJuIHRoaXM7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93LCB0aGlzLmhpZ2gsIHRydWUpO1xuICB9O1xuICAvKipcbiAgICogQ29udmVydHMgdGhpcyBMb25nIHRvIGl0cyBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBsZSBXaGV0aGVyIGxpdHRsZSBvciBiaWcgZW5kaWFuLCBkZWZhdWx0cyB0byBiaWcgZW5kaWFuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFBcnJheS48bnVtYmVyPn0gQnl0ZSByZXByZXNlbnRhdGlvblxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnRvQnl0ZXMgPSBmdW5jdGlvbiB0b0J5dGVzKGxlKSB7XG4gICAgcmV0dXJuIGxlID8gdGhpcy50b0J5dGVzTEUoKSA6IHRoaXMudG9CeXRlc0JFKCk7XG4gIH07XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGlzIExvbmcgdG8gaXRzIGxpdHRsZSBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUFycmF5LjxudW1iZXI+fSBMaXR0bGUgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS50b0J5dGVzTEUgPSBmdW5jdGlvbiB0b0J5dGVzTEUoKSB7XG4gICAgdmFyIGhpID0gdGhpcy5oaWdoLFxuICAgICAgICBsbyA9IHRoaXMubG93O1xuICAgIHJldHVybiBbbG8gJiAweGZmLCBsbyA+Pj4gOCAmIDB4ZmYsIGxvID4+PiAxNiAmIDB4ZmYsIGxvID4+PiAyNCwgaGkgJiAweGZmLCBoaSA+Pj4gOCAmIDB4ZmYsIGhpID4+PiAxNiAmIDB4ZmYsIGhpID4+PiAyNF07XG4gIH07XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGlzIExvbmcgdG8gaXRzIGJpZyBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUFycmF5LjxudW1iZXI+fSBCaWcgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS50b0J5dGVzQkUgPSBmdW5jdGlvbiB0b0J5dGVzQkUoKSB7XG4gICAgdmFyIGhpID0gdGhpcy5oaWdoLFxuICAgICAgICBsbyA9IHRoaXMubG93O1xuICAgIHJldHVybiBbaGkgPj4+IDI0LCBoaSA+Pj4gMTYgJiAweGZmLCBoaSA+Pj4gOCAmIDB4ZmYsIGhpICYgMHhmZiwgbG8gPj4+IDI0LCBsbyA+Pj4gMTYgJiAweGZmLCBsbyA+Pj4gOCAmIDB4ZmYsIGxvICYgMHhmZl07XG4gIH07XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgTG9uZyBmcm9tIGl0cyBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcGFyYW0geyFBcnJheS48bnVtYmVyPn0gYnl0ZXMgQnl0ZSByZXByZXNlbnRhdGlvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGxlIFdoZXRoZXIgbGl0dGxlIG9yIGJpZyBlbmRpYW4sIGRlZmF1bHRzIHRvIGJpZyBlbmRpYW5cbiAgICogQHJldHVybnMge0xvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tQnl0ZXMgPSBmdW5jdGlvbiBmcm9tQnl0ZXMoYnl0ZXMsIHVuc2lnbmVkLCBsZSkge1xuICAgIHJldHVybiBsZSA/IExvbmcuZnJvbUJ5dGVzTEUoYnl0ZXMsIHVuc2lnbmVkKSA6IExvbmcuZnJvbUJ5dGVzQkUoYnl0ZXMsIHVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBMb25nIGZyb20gaXRzIGxpdHRsZSBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICogQHBhcmFtIHshQXJyYXkuPG51bWJlcj59IGJ5dGVzIExpdHRsZSBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEByZXR1cm5zIHtMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbUJ5dGVzTEUgPSBmdW5jdGlvbiBmcm9tQnl0ZXNMRShieXRlcywgdW5zaWduZWQpIHtcbiAgICByZXR1cm4gbmV3IExvbmcoYnl0ZXNbMF0gfCBieXRlc1sxXSA8PCA4IHwgYnl0ZXNbMl0gPDwgMTYgfCBieXRlc1szXSA8PCAyNCwgYnl0ZXNbNF0gfCBieXRlc1s1XSA8PCA4IHwgYnl0ZXNbNl0gPDwgMTYgfCBieXRlc1s3XSA8PCAyNCwgdW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogQ3JlYXRlcyBhIExvbmcgZnJvbSBpdHMgYmlnIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcGFyYW0geyFBcnJheS48bnVtYmVyPn0gYnl0ZXMgQmlnIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHJldHVybnMge0xvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tQnl0ZXNCRSA9IGZ1bmN0aW9uIGZyb21CeXRlc0JFKGJ5dGVzLCB1bnNpZ25lZCkge1xuICAgIHJldHVybiBuZXcgTG9uZyhieXRlc1s0XSA8PCAyNCB8IGJ5dGVzWzVdIDw8IDE2IHwgYnl0ZXNbNl0gPDwgOCB8IGJ5dGVzWzddLCBieXRlc1swXSA8PCAyNCB8IGJ5dGVzWzFdIDw8IDE2IHwgYnl0ZXNbMl0gPDwgOCB8IGJ5dGVzWzNdLCB1bnNpZ25lZCk7XG4gIH07XG4gIFxuICB2YXIgX2RlZmF1bHQgPSBMb25nO1xuICBleHBvcnRzLmRlZmF1bHQgPSBfZGVmYXVsdDtcbiAgcmV0dXJuIFwiZGVmYXVsdFwiIGluIGV4cG9ydHMgPyBleHBvcnRzLmRlZmF1bHQgOiBleHBvcnRzO1xufSkoe30pO1xuaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKFtdLCBmdW5jdGlvbigpIHsgcmV0dXJuIExvbmc7IH0pO1xuZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSBtb2R1bGUuZXhwb3J0cyA9IExvbmc7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiXG5jb25zdCBhcGkgPSByZXF1aXJlKCdAdGVtcG9yYWxpby93b3JrZmxvdy9saWIvd29ya2VyLWludGVyZmFjZS5qcycpO1xuZXhwb3J0cy5hcGkgPSBhcGk7XG5cbmNvbnN0IHsgb3ZlcnJpZGVHbG9iYWxzIH0gPSByZXF1aXJlKCdAdGVtcG9yYWxpby93b3JrZmxvdy9saWIvZ2xvYmFsLW92ZXJyaWRlcy5qcycpO1xub3ZlcnJpZGVHbG9iYWxzKCk7XG5cbmV4cG9ydHMuaW1wb3J0V29ya2Zsb3dzID0gZnVuY3Rpb24gaW1wb3J0V29ya2Zsb3dzKCkge1xuICByZXR1cm4gcmVxdWlyZSgvKiB3ZWJwYWNrTW9kZTogXCJlYWdlclwiICovIFwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvc3JjL3dvcmtmbG93cy50c1wiKTtcbn1cblxuZXhwb3J0cy5pbXBvcnRJbnRlcmNlcHRvcnMgPSBmdW5jdGlvbiBpbXBvcnRJbnRlcmNlcHRvcnMoKSB7XG4gIHJldHVybiBbXG4gICAgXG4gIF07XG59XG4iXSwibmFtZXMiOlsicHJveHlBY3Rpdml0aWVzIiwicHJveHlMb2NhbEFjdGl2aXRpZXMiLCJkZWZpbmVTaWduYWwiLCJzZXRIYW5kbGVyIiwiY29uZGl0aW9uIiwibG9nIiwic3RhcnRDaGlsZCIsInNsZWVwIiwiZ2V0RXh0ZXJuYWxXb3JrZmxvd0hhbmRsZSIsImRlZmluZVF1ZXJ5IiwiY29udGludWVBc05ldyIsIlBhcmVudENsb3NlUG9saWN5IiwiQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlIiwiQ2FuY2VsbGF0aW9uU2NvcGUiLCJpc0NhbmNlbGxhdGlvbiIsIlJPVU5EX1dGX0lEIiwiQVBQTEVfUE9JTlRTIiwiU05BS0VfTU9WRVNfQkVGT1JFX0NBTiIsIlNOQUtFX1dPUktFUl9ET1dOX1RJTUUiLCJlbWl0Iiwic3RhcnRUb0Nsb3NlVGltZW91dCIsInNuYWtlV29ya2VyIiwidGFza1F1ZXVlIiwiaGVhcnRiZWF0VGltZW91dCIsImNhbmNlbGxhdGlvblR5cGUiLCJXQUlUX0NBTkNFTExBVElPTl9DT01QTEVURUQiLCJzbmFrZVRyYWNrZXIiLCJyZXRyeSIsImluaXRpYWxJbnRlcnZhbCIsImJhY2tvZmZDb2VmZmljaWVudCIsInJhbmRvbURpcmVjdGlvbiIsImRpcmVjdGlvbnMiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJsZW5ndGgiLCJvcHBvc2l0ZURpcmVjdGlvbiIsImRpcmVjdGlvbiIsImdhbWVTdGF0ZVF1ZXJ5Iiwicm91bmRTdGF0ZVF1ZXJ5IiwiZ2FtZUZpbmlzaFNpZ25hbCIsInJvdW5kU3RhcnRTaWduYWwiLCJzbmFrZUNoYW5nZURpcmVjdGlvblNpZ25hbCIsInNuYWtlTW92ZVNpZ25hbCIsIndvcmtlclN0b3BTaWduYWwiLCJ3b3JrZXJTdGFydGVkU2lnbmFsIiwiR2FtZVdvcmtmbG93IiwiY29uZmlnIiwiaW5mbyIsImdhbWUiLCJ0ZWFtcyIsInRlYW1OYW1lcyIsInJlZHVjZSIsImFjYyIsIm5hbWUiLCJzY29yZSIsImZpbmlzaGVkIiwicm91bmRTY29wZSIsImNhbmNlbCIsIm5ld1JvdW5kIiwic25ha2VzIiwiYnVpbGRSb3VuZFRlYW1zIiwidW5kZWZpbmVkIiwicnVuIiwicm91bmRXZiIsIlJvdW5kV29ya2Zsb3ciLCJ3b3JrZmxvd0lkIiwiYXJncyIsInBhcmVudENsb3NlUG9saWN5IiwiUEFSRU5UX0NMT1NFX1BPTElDWV9SRVFVRVNUX0NBTkNFTCIsInJvdW5kIiwicmVzdWx0IiwidGVhbSIsIk9iamVjdCIsInZhbHVlcyIsImVyciIsImR1cmF0aW9uIiwicm91bmREdXJhdGlvbiIsImFwcGxlcyIsInNuYWtlIiwiaWQiLCJzbmFrZU1vdmVzIiwid29ya2Vyc1N0YXJ0ZWQiLCJwdXNoIiwiaWRlbnRpdHkiLCJwcm9jZXNzU2lnbmFscyIsImV2ZW50cyIsImFwcGxlc0VhdGVuIiwic2lnbmFscyIsIm1vdmUiLCJtb3ZlU25ha2UiLCJ0eXBlIiwicGF5bG9hZCIsInNuYWtlSWQiLCJzZWdtZW50cyIsImF0ZUFwcGxlSWQiLCJ0ZWFtTmFtZSIsImFwcGxlSWQiLCJraWxsV29ya2VycyIsIndvcmtlciIsInNpZ25hbCIsIndvcmtlcklkIiwicmFuZG9tRW1wdHlQb2ludCIsIlByb21pc2UiLCJhbGwiLCJyYW5kb21pemVSb3VuZCIsIndvcmtlckNvdW50Iiwic3RhcnRXb3JrZXJNYW5hZ2VycyIsInN0YXJ0U25ha2VUcmFja2VycyIsInN0YXJ0U25ha2VzIiwia2V5cyIsInN0YXJ0ZWRBdCIsIkRhdGUiLCJub3ciLCJyYWNlIiwiY3VycmVudCIsImNhbmNlbFJlcXVlc3RlZCIsInRoZW4iLCJjYXRjaCIsImZpbmFsbHkiLCJub25DYW5jZWxsYWJsZSIsIlNuYWtlV29ya2VyV29ya2Zsb3ciLCJyb3VuZElkIiwic2NvcGUiLCJlIiwiU25ha2VXb3JrZmxvdyIsIm5vbXNQZXJNb3ZlIiwibm9tRHVyYXRpb24iLCJuZXdEaXJlY3Rpb24iLCJzbmFrZU5vbSIsIm5vbXMiLCJBcnJheSIsImZyb20iLCJtb3ZlcyIsIm1hcCIsImhlYWRTZWdtZW50IiwidGFpbFNlZ21lbnQiLCJjdXJyZW50RGlyZWN0aW9uIiwiY3VycmVudEhlYWQiLCJoZWFkIiwiYWdhaW5zdEFuRWRnZSIsIngiLCJ5IiwidW5zaGlmdCIsIm5ld0hlYWQiLCJoZWlnaHQiLCJ3aWR0aCIsInNuYWtlQXQiLCJhcHBsZUF0IiwicG9wIiwicG9pbnQiLCJhcHBsZSIsImVudHJpZXMiLCJjYWxjdWxhdGVQb3NpdGlvbiIsInNlZ21lbnQiLCJzdGFydCIsInQiLCJiIiwibCIsInIiLCJwb3MiLCJjZWlsIiwiY291bnQiLCJzbmFrZVdvcmtlck1hbmFnZXJzIiwiXyIsImkiLCJlcnJvciIsImNvbW1hbmRzIiwid29ya2Zsb3dUYXNrVGltZW91dCJdLCJzb3VyY2VSb290IjoiIn0=