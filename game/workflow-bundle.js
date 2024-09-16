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
const SNAKE_MOVES_BEFORE_CAN = 20;
const SNAKE_WORKER_DOWN_TIME = '5 seconds';
const { emit } = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.proxyLocalActivities)({
    startToCloseTimeout: '1 seconds'
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
        finished: false,
        workerIds: []
    };
    const snakeMoves = [];
    const workersStarted = [];
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(roundStateQuery, ()=>{
        return round;
    });
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(snakeMoveSignal, async ({ id, direction })=>{
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
                const workerManager = workerManagers[appleId];
                signals.push(workerManager.signal(workerStopSignal));
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
    round.workerIds = createWorkerIds(snakes.length * 2);
    let workerManagers = {};
    try {
        workerManagers = await startWorkerManagers((0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.workflowInfo)().runId, round.workerIds);
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
    let scope;
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(workerStopSignal, ()=>{
        if (scope) {
            scope.cancel();
        }
    });
    let taskQueue;
    if (identity === 'snake-worker-1' || identity === 'snake-worker-2') {
        taskQueue = 'snake-workers-1';
    } else if (identity === 'snake-worker-3' || identity === 'snake-worker-4') {
        taskQueue = 'snake-workers-2';
    } else {
        taskQueue = 'snake-workers-3';
    }
    const { snakeWorker } = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.proxyActivities)({
        taskQueue,
        startToCloseTimeout: '1 year',
        heartbeatTimeout: 500,
        cancellationType: _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.ActivityCancellationType.WAIT_CANCELLATION_COMPLETED
    });
    while(true){
        try {
            scope = new _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.CancellationScope();
            await scope.run(()=>snakeWorker(roundId, identity));
        } catch (err) {
            if ((0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.isCancellation)(err)) {
                await (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.sleep)(SNAKE_WORKER_DOWN_TIME);
            } else {
                _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.log.error('SnakeWorker failure, retrying', {
                    error: err
                });
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
        taskQueue: 'game',
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
            await round.signal(snakeMoveSignal, {
                id,
                direction
            });
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
function createWorkerIds(count) {
    return Array.from({
        length: count
    }).map((_, i)=>{
        return `snake-worker-${i + 1}`;
    });
}
async function startWorkerManagers(runId, identities) {
    try {
        const handles = await Promise.all(identities.map((identity)=>(0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.startChild)(SnakeWorkerWorkflow, {
                workflowId: `${runId}-${identity}`,
                args: [
                    {
                        roundId: ROUND_WF_ID,
                        identity
                    }
                ]
            })));
        return Object.fromEntries(identities.map((identity, index)=>[
                identity,
                handles[index]
            ]));
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
            workflowTaskTimeout: '1 second',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2Zsb3ctYnVuZGxlLTE1MzEwNWE0Mjg4MGQ3ZWZhMmYxLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBRUEsMEhBQThDO0FBSTlDLDBFQUEwRTtBQUMxRSxpRUFBaUU7QUFDakUsSUFBWSx3QkFJWDtBQUpELFdBQVksd0JBQXdCO0lBQ2xDLG1GQUFjO0lBQ2QscUhBQStCO0lBQy9CLDZFQUFXO0FBQ2IsQ0FBQyxFQUpXLHdCQUF3Qix3Q0FBeEIsd0JBQXdCLFFBSW5DO0FBRUQsK0JBQVksR0FBZ0YsQ0FBQztBQUM3RiwrQkFBWSxHQUFnRixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNmN0YsbUpBQWdGO0FBRWhGLG1KQUFnRjtBQTREaEY7Ozs7R0FJRztBQUNVLCtCQUF1QixHQUFxQixJQUFJLDJDQUF1QixFQUFFLENBQUM7QUFFdkY7O0dBRUc7QUFDVSw0QkFBb0IsR0FBd0I7SUFDdkQsZ0JBQWdCLEVBQUUsMkNBQXVCO0lBQ3pDLGdCQUFnQixFQUFFLCtCQUF1QjtJQUN6QyxhQUFhLEVBQUUsRUFBRTtDQUNsQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUM1RUYsNEdBYW9CO0FBQ3BCLDJIQUEwQztBQUMxQyxtSkFBMkc7QUFFM0csU0FBUyxhQUFhLENBQUMsR0FBRyxPQUFpQjtJQUN6QyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDckUsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxxQkFBcUIsR0FBRyxhQUFhO0FBQ3pDLHlCQUF5QjtBQUN6Qix1RkFBdUY7QUFDdkYsMEJBQTBCO0FBQzFCLGtHQUFrRztBQUNsRyx1Q0FBdUM7QUFDdkMsMkRBQTJELENBQzVELENBQUM7QUFFRjs7O0dBR0c7QUFDSCxNQUFNLDZCQUE2QixHQUFHLGFBQWE7QUFDakQsZ0VBQWdF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LHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7O0FDTEEsWUFBWSxtQkFBTyxDQUFDLGlIQUE4QztBQUNsRSxXQUFXOztBQUVYLFFBQVEsa0JBQWtCLEVBQUUsbUJBQU8sQ0FBQyxpSEFBOEM7QUFDbEY7O0FBRUEsdUJBQXVCO0FBQ3ZCLFNBQVMsbUJBQU8sNEJBQTRCLDhDQUEwRjtBQUN0STs7QUFFQSwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2FjdGl2aXR5LW9wdGlvbnMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9jb252ZXJ0ZXIvZGF0YS1jb252ZXJ0ZXIudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9jb252ZXJ0ZXIvZmFpbHVyZS1jb252ZXJ0ZXIudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9jb252ZXJ0ZXIvcGF5bG9hZC1jb2RlYy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2NvbnZlcnRlci9wYXlsb2FkLWNvbnZlcnRlci50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2NvbnZlcnRlci90eXBlcy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2RlcHJlY2F0ZWQtdGltZS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2VuY29kaW5nLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvZXJyb3JzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvZmFpbHVyZS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2luZGV4LnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvaW50ZXJjZXB0b3JzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvaW50ZXJmYWNlcy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2xvZ2dlci50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL3JldHJ5LXBvbGljeS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL3RpbWUudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy90eXBlLWhlbHBlcnMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy92ZXJzaW9uaW5nLWludGVudC1lbnVtLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvdmVyc2lvbmluZy1pbnRlbnQudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy93b3JrZmxvdy1oYW5kbGUudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy93b3JrZmxvdy1vcHRpb25zLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9hbGVhLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9jYW5jZWxsYXRpb24tc2NvcGUudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2Vycm9ycy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvZmxhZ3MudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2dsb2JhbC1hdHRyaWJ1dGVzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9nbG9iYWwtb3ZlcnJpZGVzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9pbmRleC50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvaW50ZXJjZXB0b3JzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9pbnRlcmZhY2VzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9pbnRlcm5hbHMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2xvZ3MudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3BrZy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvc2lua3MudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3N0YWNrLWhlbHBlcnMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3RyaWdnZXIudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3dvcmtlci1pbnRlcmZhY2UudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3dvcmtmbG93LnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvc3JjL3dvcmtmbG93cy50cyIsImlnbm9yZWR8L1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L2xpYnxfX3RlbXBvcmFsX2N1c3RvbV9mYWlsdXJlX2NvbnZlcnRlciIsImlnbm9yZWR8L1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L2xpYnxfX3RlbXBvcmFsX2N1c3RvbV9wYXlsb2FkX2NvbnZlcnRlciIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9tcy9kaXN0L2luZGV4LmNqcyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9sb25nL3VtZC9pbmRleC5qcyIsIndlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL3NyYy93b3JrZmxvd3MtYXV0b2dlbmVyYXRlZC1lbnRyeXBvaW50LmNqcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBSZXRyeVBvbGljeSB9IGZyb20gJy4vcmV0cnktcG9saWN5JztcbmltcG9ydCB7IGNoZWNrRXh0ZW5kcyB9IGZyb20gJy4vdHlwZS1oZWxwZXJzJztcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSAnLi90aW1lJztcbmltcG9ydCB7IFZlcnNpb25pbmdJbnRlbnQgfSBmcm9tICcuL3ZlcnNpb25pbmctaW50ZW50JztcblxuLy8gQXZvaWQgaW1wb3J0aW5nIHRoZSBwcm90byBpbXBsZW1lbnRhdGlvbiB0byByZWR1Y2Ugd29ya2Zsb3cgYnVuZGxlIHNpemVcbi8vIENvcGllZCBmcm9tIGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlXG5leHBvcnQgZW51bSBBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUge1xuICBUUllfQ0FOQ0VMID0gMCxcbiAgV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEID0gMSxcbiAgQUJBTkRPTiA9IDIsXG59XG5cbmNoZWNrRXh0ZW5kczxjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLkFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZSwgQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlPigpO1xuY2hlY2tFeHRlbmRzPEFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZSwgY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5BY3Rpdml0eUNhbmNlbGxhdGlvblR5cGU+KCk7XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgcmVtb3RlIGFjdGl2aXR5IGludm9jYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBY3Rpdml0eU9wdGlvbnMge1xuICAvKipcbiAgICogSWRlbnRpZmllciB0byB1c2UgZm9yIHRyYWNraW5nIHRoZSBhY3Rpdml0eSBpbiBXb3JrZmxvdyBoaXN0b3J5LlxuICAgKiBUaGUgYGFjdGl2aXR5SWRgIGNhbiBiZSBhY2Nlc3NlZCBieSB0aGUgYWN0aXZpdHkgZnVuY3Rpb24uXG4gICAqIERvZXMgbm90IG5lZWQgdG8gYmUgdW5pcXVlLlxuICAgKlxuICAgKiBAZGVmYXVsdCBhbiBpbmNyZW1lbnRhbCBzZXF1ZW5jZSBudW1iZXJcbiAgICovXG4gIGFjdGl2aXR5SWQ/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRhc2sgcXVldWUgbmFtZS5cbiAgICpcbiAgICogQGRlZmF1bHQgY3VycmVudCB3b3JrZXIgdGFzayBxdWV1ZVxuICAgKi9cbiAgdGFza1F1ZXVlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBIZWFydGJlYXQgaW50ZXJ2YWwuIEFjdGl2aXR5IG11c3QgaGVhcnRiZWF0IGJlZm9yZSB0aGlzIGludGVydmFsIHBhc3NlcyBhZnRlciBhIGxhc3QgaGVhcnRiZWF0IG9yIGFjdGl2aXR5IHN0YXJ0LlxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIGhlYXJ0YmVhdFRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogUmV0cnlQb2xpY3kgdGhhdCBkZWZpbmUgaG93IGFjdGl2aXR5IGlzIHJldHJpZWQgaW4gY2FzZSBvZiBmYWlsdXJlLiBJZiB0aGlzIGlzIG5vdCBzZXQsIHRoZW4gdGhlIHNlcnZlci1kZWZpbmVkIGRlZmF1bHQgYWN0aXZpdHkgcmV0cnkgcG9saWN5IHdpbGwgYmUgdXNlZC4gVG8gZW5zdXJlIHplcm8gcmV0cmllcywgc2V0IG1heGltdW0gYXR0ZW1wdHMgdG8gMS5cbiAgICovXG4gIHJldHJ5PzogUmV0cnlQb2xpY3k7XG5cbiAgLyoqXG4gICAqIE1heGltdW0gdGltZSBvZiBhIHNpbmdsZSBBY3Rpdml0eSBleGVjdXRpb24gYXR0ZW1wdC4gTm90ZSB0aGF0IHRoZSBUZW1wb3JhbCBTZXJ2ZXIgZG9lc24ndCBkZXRlY3QgV29ya2VyIHByb2Nlc3NcbiAgICogZmFpbHVyZXMgZGlyZWN0bHkuIEl0IHJlbGllcyBvbiB0aGlzIHRpbWVvdXQgdG8gZGV0ZWN0IHRoYXQgYW4gQWN0aXZpdHkgdGhhdCBkaWRuJ3QgY29tcGxldGUgb24gdGltZS4gU28gdGhpc1xuICAgKiB0aW1lb3V0IHNob3VsZCBiZSBhcyBzaG9ydCBhcyB0aGUgbG9uZ2VzdCBwb3NzaWJsZSBleGVjdXRpb24gb2YgdGhlIEFjdGl2aXR5IGJvZHkuIFBvdGVudGlhbGx5IGxvbmcgcnVubmluZ1xuICAgKiBBY3Rpdml0aWVzIG11c3Qgc3BlY2lmeSB7QGxpbmsgaGVhcnRiZWF0VGltZW91dH0gYW5kIGNhbGwge0BsaW5rIGFjdGl2aXR5LkNvbnRleHQuaGVhcnRiZWF0fSBwZXJpb2RpY2FsbHkgZm9yXG4gICAqIHRpbWVseSBmYWlsdXJlIGRldGVjdGlvbi5cbiAgICpcbiAgICogRWl0aGVyIHRoaXMgb3B0aW9uIG9yIHtAbGluayBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0fSBpcyByZXF1aXJlZC5cbiAgICpcbiAgICogQGRlZmF1bHQgYHNjaGVkdWxlVG9DbG9zZVRpbWVvdXRgIG9yIHVubGltaXRlZFxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHN0YXJ0VG9DbG9zZVRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogVGltZSB0aGF0IHRoZSBBY3Rpdml0eSBUYXNrIGNhbiBzdGF5IGluIHRoZSBUYXNrIFF1ZXVlIGJlZm9yZSBpdCBpcyBwaWNrZWQgdXAgYnkgYSBXb3JrZXIuIERvIG5vdCBzcGVjaWZ5IHRoaXMgdGltZW91dCB1bmxlc3MgdXNpbmcgaG9zdCBzcGVjaWZpYyBUYXNrIFF1ZXVlcyBmb3IgQWN0aXZpdHkgVGFza3MgYXJlIGJlaW5nIHVzZWQgZm9yIHJvdXRpbmcuXG4gICAqIGBzY2hlZHVsZVRvU3RhcnRUaW1lb3V0YCBpcyBhbHdheXMgbm9uLXJldHJ5YWJsZS4gUmV0cnlpbmcgYWZ0ZXIgdGhpcyB0aW1lb3V0IGRvZXNuJ3QgbWFrZSBzZW5zZSBhcyBpdCB3b3VsZCBqdXN0IHB1dCB0aGUgQWN0aXZpdHkgVGFzayBiYWNrIGludG8gdGhlIHNhbWUgVGFzayBRdWV1ZS5cbiAgICpcbiAgICogQGRlZmF1bHQgYHNjaGVkdWxlVG9DbG9zZVRpbWVvdXRgIG9yIHVubGltaXRlZFxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHNjaGVkdWxlVG9TdGFydFRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogVG90YWwgdGltZSB0aGF0IGEgd29ya2Zsb3cgaXMgd2lsbGluZyB0byB3YWl0IGZvciBBY3Rpdml0eSB0byBjb21wbGV0ZS5cbiAgICogYHNjaGVkdWxlVG9DbG9zZVRpbWVvdXRgIGxpbWl0cyB0aGUgdG90YWwgdGltZSBvZiBhbiBBY3Rpdml0eSdzIGV4ZWN1dGlvbiBpbmNsdWRpbmcgcmV0cmllcyAodXNlIHtAbGluayBzdGFydFRvQ2xvc2VUaW1lb3V0fSB0byBsaW1pdCB0aGUgdGltZSBvZiBhIHNpbmdsZSBhdHRlbXB0KS5cbiAgICpcbiAgICogRWl0aGVyIHRoaXMgb3B0aW9uIG9yIHtAbGluayBzdGFydFRvQ2xvc2VUaW1lb3V0fSBpcyByZXF1aXJlZC5cbiAgICpcbiAgICogQGRlZmF1bHQgdW5saW1pdGVkXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc2NoZWR1bGVUb0Nsb3NlVGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoYXQgdGhlIFNESyBkb2VzIHdoZW4gdGhlIEFjdGl2aXR5IGlzIGNhbmNlbGxlZC5cbiAgICogLSBgVFJZX0NBTkNFTGAgLSBJbml0aWF0ZSBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IGFuZCBpbW1lZGlhdGVseSByZXBvcnQgY2FuY2VsbGF0aW9uIHRvIHRoZSB3b3JrZmxvdy5cbiAgICogLSBgV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEYCAtIFdhaXQgZm9yIGFjdGl2aXR5IGNhbmNlbGxhdGlvbiBjb21wbGV0aW9uLiBOb3RlIHRoYXQgYWN0aXZpdHkgbXVzdCBoZWFydGJlYXQgdG8gcmVjZWl2ZSBhXG4gICAqICAgY2FuY2VsbGF0aW9uIG5vdGlmaWNhdGlvbi4gVGhpcyBjYW4gYmxvY2sgdGhlIGNhbmNlbGxhdGlvbiBmb3IgYSBsb25nIHRpbWUgaWYgYWN0aXZpdHkgZG9lc24ndFxuICAgKiAgIGhlYXJ0YmVhdCBvciBjaG9vc2VzIHRvIGlnbm9yZSB0aGUgY2FuY2VsbGF0aW9uIHJlcXVlc3QuXG4gICAqIC0gYEFCQU5ET05gIC0gRG8gbm90IHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIHRoZSBhY3Rpdml0eSBhbmQgaW1tZWRpYXRlbHkgcmVwb3J0IGNhbmNlbGxhdGlvbiB0byB0aGUgd29ya2Zsb3cuXG4gICAqL1xuICBjYW5jZWxsYXRpb25UeXBlPzogQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlO1xuXG4gIC8qKlxuICAgKiBFYWdlciBkaXNwYXRjaCBpcyBhbiBvcHRpbWl6YXRpb24gdGhhdCBpbXByb3ZlcyB0aGUgdGhyb3VnaHB1dCBhbmQgbG9hZCBvbiB0aGUgc2VydmVyIGZvciBzY2hlZHVsaW5nIEFjdGl2aXRpZXMuXG4gICAqIFdoZW4gdXNlZCwgdGhlIHNlcnZlciB3aWxsIGhhbmQgb3V0IEFjdGl2aXR5IHRhc2tzIGJhY2sgdG8gdGhlIFdvcmtlciB3aGVuIGl0IGNvbXBsZXRlcyBhIFdvcmtmbG93IHRhc2suXG4gICAqIEl0IGlzIGF2YWlsYWJsZSBmcm9tIHNlcnZlciB2ZXJzaW9uIDEuMTcgYmVoaW5kIHRoZSBgc3lzdGVtLmVuYWJsZUFjdGl2aXR5RWFnZXJFeGVjdXRpb25gIGZlYXR1cmUgZmxhZy5cbiAgICpcbiAgICogRWFnZXIgZGlzcGF0Y2ggd2lsbCBvbmx5IGJlIHVzZWQgaWYgYGFsbG93RWFnZXJEaXNwYXRjaGAgaXMgZW5hYmxlZCAodGhlIGRlZmF1bHQpIGFuZCB7QGxpbmsgdGFza1F1ZXVlfSBpcyBlaXRoZXJcbiAgICogb21pdHRlZCBvciB0aGUgc2FtZSBhcyB0aGUgY3VycmVudCBXb3JrZmxvdy5cbiAgICpcbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgYWxsb3dFYWdlckRpc3BhdGNoPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogV2hlbiB1c2luZyB0aGUgV29ya2VyIFZlcnNpb25pbmcgZmVhdHVyZSwgc3BlY2lmaWVzIHdoZXRoZXIgdGhpcyBBY3Rpdml0eSBzaG91bGQgcnVuIG9uIGFcbiAgICogd29ya2VyIHdpdGggYSBjb21wYXRpYmxlIEJ1aWxkIElkIG9yIG5vdC4gU2VlIHtAbGluayBWZXJzaW9uaW5nSW50ZW50fS5cbiAgICpcbiAgICogQGRlZmF1bHQgJ0NPTVBBVElCTEUnXG4gICAqXG4gICAqIEBleHBlcmltZW50YWxcbiAgICovXG4gIHZlcnNpb25pbmdJbnRlbnQ/OiBWZXJzaW9uaW5nSW50ZW50O1xufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIGxvY2FsIGFjdGl2aXR5IGludm9jYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhbEFjdGl2aXR5T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBSZXRyeVBvbGljeSB0aGF0IGRlZmluZXMgaG93IGFuIGFjdGl2aXR5IGlzIHJldHJpZWQgaW4gY2FzZSBvZiBmYWlsdXJlLiBJZiB0aGlzIGlzIG5vdCBzZXQsIHRoZW4gdGhlIFNESy1kZWZpbmVkIGRlZmF1bHQgYWN0aXZpdHkgcmV0cnkgcG9saWN5IHdpbGwgYmUgdXNlZC5cbiAgICogTm90ZSB0aGF0IGxvY2FsIGFjdGl2aXRpZXMgYXJlIGFsd2F5cyBleGVjdXRlZCBhdCBsZWFzdCBvbmNlLCBldmVuIGlmIG1heGltdW0gYXR0ZW1wdHMgaXMgc2V0IHRvIDEgZHVlIHRvIFdvcmtmbG93IHRhc2sgcmV0cmllcy5cbiAgICovXG4gIHJldHJ5PzogUmV0cnlQb2xpY3k7XG5cbiAgLyoqXG4gICAqIE1heGltdW0gdGltZSB0aGUgbG9jYWwgYWN0aXZpdHkgaXMgYWxsb3dlZCB0byBleGVjdXRlIGFmdGVyIHRoZSB0YXNrIGlzIGRpc3BhdGNoZWQuIFRoaXNcbiAgICogdGltZW91dCBpcyBhbHdheXMgcmV0cnlhYmxlLlxuICAgKlxuICAgKiBFaXRoZXIgdGhpcyBvcHRpb24gb3Ige0BsaW5rIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXR9IGlzIHJlcXVpcmVkLlxuICAgKiBJZiBzZXQsIHRoaXMgbXVzdCBiZSA8PSB7QGxpbmsgc2NoZWR1bGVUb0Nsb3NlVGltZW91dH0sIG90aGVyd2lzZSwgaXQgd2lsbCBiZSBjbGFtcGVkIGRvd24uXG4gICAqXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc3RhcnRUb0Nsb3NlVGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBMaW1pdHMgdGltZSB0aGUgbG9jYWwgYWN0aXZpdHkgY2FuIGlkbGUgaW50ZXJuYWxseSBiZWZvcmUgYmVpbmcgZXhlY3V0ZWQuIFRoYXQgY2FuIGhhcHBlbiBpZlxuICAgKiB0aGUgd29ya2VyIGlzIGN1cnJlbnRseSBhdCBtYXggY29uY3VycmVudCBsb2NhbCBhY3Rpdml0eSBleGVjdXRpb25zLiBUaGlzIHRpbWVvdXQgaXMgYWx3YXlzXG4gICAqIG5vbiByZXRyeWFibGUgYXMgYWxsIGEgcmV0cnkgd291bGQgYWNoaWV2ZSBpcyB0byBwdXQgaXQgYmFjayBpbnRvIHRoZSBzYW1lIHF1ZXVlLiBEZWZhdWx0c1xuICAgKiB0byB7QGxpbmsgc2NoZWR1bGVUb0Nsb3NlVGltZW91dH0gaWYgbm90IHNwZWNpZmllZCBhbmQgdGhhdCBpcyBzZXQuIE11c3QgYmUgPD1cbiAgICoge0BsaW5rIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXR9IHdoZW4gc2V0LCBvdGhlcndpc2UsIGl0IHdpbGwgYmUgY2xhbXBlZCBkb3duLlxuICAgKlxuICAgKiBAZGVmYXVsdCB1bmxpbWl0ZWRcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBzY2hlZHVsZVRvU3RhcnRUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyBob3cgbG9uZyB0aGUgY2FsbGVyIGlzIHdpbGxpbmcgdG8gd2FpdCBmb3IgbG9jYWwgYWN0aXZpdHkgY29tcGxldGlvbi4gTGltaXRzIGhvd1xuICAgKiBsb25nIHJldHJpZXMgd2lsbCBiZSBhdHRlbXB0ZWQuXG4gICAqXG4gICAqIEVpdGhlciB0aGlzIG9wdGlvbiBvciB7QGxpbmsgc3RhcnRUb0Nsb3NlVGltZW91dH0gaXMgcmVxdWlyZWQuXG4gICAqXG4gICAqIEBkZWZhdWx0IHVubGltaXRlZFxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogSWYgdGhlIGFjdGl2aXR5IGlzIHJldHJ5aW5nIGFuZCBiYWNrb2ZmIHdvdWxkIGV4Y2VlZCB0aGlzIHZhbHVlLCBhIHNlcnZlciBzaWRlIHRpbWVyIHdpbGwgYmUgc2NoZWR1bGVkIGZvciB0aGUgbmV4dCBhdHRlbXB0LlxuICAgKiBPdGhlcndpc2UsIGJhY2tvZmYgd2lsbCBoYXBwZW4gaW50ZXJuYWxseSBpbiB0aGUgU0RLLlxuICAgKlxuICAgKiBAZGVmYXVsdCAxIG1pbnV0ZVxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICoqL1xuICBsb2NhbFJldHJ5VGhyZXNob2xkPzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hhdCB0aGUgU0RLIGRvZXMgd2hlbiB0aGUgQWN0aXZpdHkgaXMgY2FuY2VsbGVkLlxuICAgKiAtIGBUUllfQ0FOQ0VMYCAtIEluaXRpYXRlIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgYW5kIGltbWVkaWF0ZWx5IHJlcG9ydCBjYW5jZWxsYXRpb24gdG8gdGhlIHdvcmtmbG93LlxuICAgKiAtIGBXQUlUX0NBTkNFTExBVElPTl9DT01QTEVURURgIC0gV2FpdCBmb3IgYWN0aXZpdHkgY2FuY2VsbGF0aW9uIGNvbXBsZXRpb24uIE5vdGUgdGhhdCBhY3Rpdml0eSBtdXN0IGhlYXJ0YmVhdCB0byByZWNlaXZlIGFcbiAgICogICBjYW5jZWxsYXRpb24gbm90aWZpY2F0aW9uLiBUaGlzIGNhbiBibG9jayB0aGUgY2FuY2VsbGF0aW9uIGZvciBhIGxvbmcgdGltZSBpZiBhY3Rpdml0eSBkb2Vzbid0XG4gICAqICAgaGVhcnRiZWF0IG9yIGNob29zZXMgdG8gaWdub3JlIHRoZSBjYW5jZWxsYXRpb24gcmVxdWVzdC5cbiAgICogLSBgQUJBTkRPTmAgLSBEbyBub3QgcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgdGhlIGFjdGl2aXR5IGFuZCBpbW1lZGlhdGVseSByZXBvcnQgY2FuY2VsbGF0aW9uIHRvIHRoZSB3b3JrZmxvdy5cbiAgICovXG4gIGNhbmNlbGxhdGlvblR5cGU/OiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLkFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZTtcbn1cbiIsImltcG9ydCB7IERlZmF1bHRGYWlsdXJlQ29udmVydGVyLCBGYWlsdXJlQ29udmVydGVyIH0gZnJvbSAnLi9mYWlsdXJlLWNvbnZlcnRlcic7XG5pbXBvcnQgeyBQYXlsb2FkQ29kZWMgfSBmcm9tICcuL3BheWxvYWQtY29kZWMnO1xuaW1wb3J0IHsgZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIsIFBheWxvYWRDb252ZXJ0ZXIgfSBmcm9tICcuL3BheWxvYWQtY29udmVydGVyJztcblxuLyoqXG4gKiBXaGVuIHlvdXIgZGF0YSAoYXJndW1lbnRzIGFuZCByZXR1cm4gdmFsdWVzKSBpcyBzZW50IG92ZXIgdGhlIHdpcmUgYW5kIHN0b3JlZCBieSBUZW1wb3JhbCBTZXJ2ZXIsIGl0IGlzIGVuY29kZWQgaW5cbiAqIGJpbmFyeSBpbiBhIHtAbGluayBQYXlsb2FkfSBQcm90b2J1ZiBtZXNzYWdlLlxuICpcbiAqIFRoZSBkZWZhdWx0IGBEYXRhQ29udmVydGVyYCBzdXBwb3J0cyBgdW5kZWZpbmVkYCwgYFVpbnQ4QXJyYXlgLCBhbmQgSlNPTiBzZXJpYWxpemFibGVzIChzbyBpZlxuICoge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0pTT04vc3RyaW5naWZ5I2Rlc2NyaXB0aW9uIHwgYEpTT04uc3RyaW5naWZ5KHlvdXJBcmdPclJldHZhbClgfVxuICogd29ya3MsIHRoZSBkZWZhdWx0IGRhdGEgY29udmVydGVyIHdpbGwgd29yaykuIFByb3RvYnVmcyBhcmUgc3VwcG9ydGVkIHZpYVxuICoge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2RhdGEtY29udmVydGVycyNwcm90b2J1ZnMgfCB0aGlzIEFQSX0uXG4gKlxuICogVXNlIGEgY3VzdG9tIGBEYXRhQ29udmVydGVyYCB0byBjb250cm9sIHRoZSBjb250ZW50cyBvZiB5b3VyIHtAbGluayBQYXlsb2FkfXMuIENvbW1vbiByZWFzb25zIGZvciB1c2luZyBhIGN1c3RvbVxuICogYERhdGFDb252ZXJ0ZXJgIGFyZTpcbiAqIC0gQ29udmVydGluZyB2YWx1ZXMgdGhhdCBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgZGVmYXVsdCBgRGF0YUNvbnZlcnRlcmAgKGZvciBleGFtcGxlLCBgSlNPTi5zdHJpbmdpZnkoKWAgZG9lc24ndFxuICogICBoYW5kbGUgYEJpZ0ludGBzLCBzbyBpZiB5b3Ugd2FudCB0byByZXR1cm4gYHsgdG90YWw6IDEwMDBuIH1gIGZyb20gYSBXb3JrZmxvdywgU2lnbmFsLCBvciBBY3Rpdml0eSwgeW91IG5lZWQgeW91clxuICogICBvd24gYERhdGFDb252ZXJ0ZXJgKS5cbiAqIC0gRW5jcnlwdGluZyB2YWx1ZXMgdGhhdCBtYXkgY29udGFpbiBwcml2YXRlIGluZm9ybWF0aW9uIHRoYXQgeW91IGRvbid0IHdhbnQgc3RvcmVkIGluIHBsYWludGV4dCBpbiBUZW1wb3JhbCBTZXJ2ZXInc1xuICogICBkYXRhYmFzZS5cbiAqIC0gQ29tcHJlc3NpbmcgdmFsdWVzIHRvIHJlZHVjZSBkaXNrIG9yIG5ldHdvcmsgdXNhZ2UuXG4gKlxuICogVG8gdXNlIHlvdXIgY3VzdG9tIGBEYXRhQ29udmVydGVyYCwgcHJvdmlkZSBpdCB0byB0aGUge0BsaW5rIFdvcmtmbG93Q2xpZW50fSwge0BsaW5rIFdvcmtlcn0sIGFuZFxuICoge0BsaW5rIGJ1bmRsZVdvcmtmbG93Q29kZX0gKGlmIHlvdSB1c2UgaXQpOlxuICogLSBgbmV3IFdvcmtmbG93Q2xpZW50KHsgLi4uLCBkYXRhQ29udmVydGVyIH0pYFxuICogLSBgV29ya2VyLmNyZWF0ZSh7IC4uLiwgZGF0YUNvbnZlcnRlciB9KWBcbiAqIC0gYGJ1bmRsZVdvcmtmbG93Q29kZSh7IC4uLiwgcGF5bG9hZENvbnZlcnRlclBhdGggfSlgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGF0YUNvbnZlcnRlciB7XG4gIC8qKlxuICAgKiBQYXRoIG9mIGEgZmlsZSB0aGF0IGhhcyBhIGBwYXlsb2FkQ29udmVydGVyYCBuYW1lZCBleHBvcnQuXG4gICAqIGBwYXlsb2FkQ29udmVydGVyYCBzaG91bGQgYmUgYW4gb2JqZWN0IHRoYXQgaW1wbGVtZW50cyB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn0uXG4gICAqIElmIG5vIHBhdGggaXMgcHJvdmlkZWQsIHtAbGluayBkZWZhdWx0UGF5bG9hZENvbnZlcnRlcn0gaXMgdXNlZC5cbiAgICovXG4gIHBheWxvYWRDb252ZXJ0ZXJQYXRoPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBQYXRoIG9mIGEgZmlsZSB0aGF0IGhhcyBhIGBmYWlsdXJlQ29udmVydGVyYCBuYW1lZCBleHBvcnQuXG4gICAqIGBmYWlsdXJlQ29udmVydGVyYCBzaG91bGQgYmUgYW4gb2JqZWN0IHRoYXQgaW1wbGVtZW50cyB7QGxpbmsgRmFpbHVyZUNvbnZlcnRlcn0uXG4gICAqIElmIG5vIHBhdGggaXMgcHJvdmlkZWQsIHtAbGluayBkZWZhdWx0RmFpbHVyZUNvbnZlcnRlcn0gaXMgdXNlZC5cbiAgICovXG4gIGZhaWx1cmVDb252ZXJ0ZXJQYXRoPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiB7QGxpbmsgUGF5bG9hZENvZGVjfSBpbnN0YW5jZXMuXG4gICAqXG4gICAqIFBheWxvYWRzIGFyZSBlbmNvZGVkIGluIHRoZSBvcmRlciBvZiB0aGUgYXJyYXkgYW5kIGRlY29kZWQgaW4gdGhlIG9wcG9zaXRlIG9yZGVyLiBGb3IgZXhhbXBsZSwgaWYgeW91IGhhdmUgYVxuICAgKiBjb21wcmVzc2lvbiBjb2RlYyBhbmQgYW4gZW5jcnlwdGlvbiBjb2RlYywgdGhlbiB5b3Ugd2FudCBkYXRhIHRvIGJlIGVuY29kZWQgd2l0aCB0aGUgY29tcHJlc3Npb24gY29kZWMgZmlyc3QsIHNvXG4gICAqIHlvdSdkIGRvIGBwYXlsb2FkQ29kZWNzOiBbY29tcHJlc3Npb25Db2RlYywgZW5jcnlwdGlvbkNvZGVjXWAuXG4gICAqL1xuICBwYXlsb2FkQ29kZWNzPzogUGF5bG9hZENvZGVjW107XG59XG5cbi8qKlxuICogQSB7QGxpbmsgRGF0YUNvbnZlcnRlcn0gdGhhdCBoYXMgYmVlbiBsb2FkZWQgdmlhIHtAbGluayBsb2FkRGF0YUNvbnZlcnRlcn0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9hZGVkRGF0YUNvbnZlcnRlciB7XG4gIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXI7XG4gIGZhaWx1cmVDb252ZXJ0ZXI6IEZhaWx1cmVDb252ZXJ0ZXI7XG4gIHBheWxvYWRDb2RlY3M6IFBheWxvYWRDb2RlY1tdO1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHtAbGluayBGYWlsdXJlQ29udmVydGVyfSB1c2VkIGJ5IHRoZSBTREsuXG4gKlxuICogRXJyb3IgbWVzc2FnZXMgYW5kIHN0YWNrIHRyYWNlcyBhcmUgc2VyaXphbGl6ZWQgYXMgcGxhaW4gdGV4dC5cbiAqL1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRGYWlsdXJlQ29udmVydGVyOiBGYWlsdXJlQ29udmVydGVyID0gbmV3IERlZmF1bHRGYWlsdXJlQ29udmVydGVyKCk7XG5cbi8qKlxuICogQSBcImxvYWRlZFwiIGRhdGEgY29udmVydGVyIHRoYXQgdXNlcyB0aGUgZGVmYXVsdCBzZXQgb2YgZmFpbHVyZSBhbmQgcGF5bG9hZCBjb252ZXJ0ZXJzLlxuICovXG5leHBvcnQgY29uc3QgZGVmYXVsdERhdGFDb252ZXJ0ZXI6IExvYWRlZERhdGFDb252ZXJ0ZXIgPSB7XG4gIHBheWxvYWRDb252ZXJ0ZXI6IGRlZmF1bHRQYXlsb2FkQ29udmVydGVyLFxuICBmYWlsdXJlQ29udmVydGVyOiBkZWZhdWx0RmFpbHVyZUNvbnZlcnRlcixcbiAgcGF5bG9hZENvZGVjczogW10sXG59O1xuIiwiaW1wb3J0IHtcbiAgQWN0aXZpdHlGYWlsdXJlLFxuICBBcHBsaWNhdGlvbkZhaWx1cmUsXG4gIENhbmNlbGxlZEZhaWx1cmUsXG4gIENoaWxkV29ya2Zsb3dGYWlsdXJlLFxuICBGQUlMVVJFX1NPVVJDRSxcbiAgUHJvdG9GYWlsdXJlLFxuICBSZXRyeVN0YXRlLFxuICBTZXJ2ZXJGYWlsdXJlLFxuICBUZW1wb3JhbEZhaWx1cmUsXG4gIFRlcm1pbmF0ZWRGYWlsdXJlLFxuICBUaW1lb3V0RmFpbHVyZSxcbiAgVGltZW91dFR5cGUsXG59IGZyb20gJy4uL2ZhaWx1cmUnO1xuaW1wb3J0IHsgaXNFcnJvciB9IGZyb20gJy4uL3R5cGUtaGVscGVycyc7XG5pbXBvcnQgeyBhcnJheUZyb21QYXlsb2FkcywgZnJvbVBheWxvYWRzQXRJbmRleCwgUGF5bG9hZENvbnZlcnRlciwgdG9QYXlsb2FkcyB9IGZyb20gJy4vcGF5bG9hZC1jb252ZXJ0ZXInO1xuXG5mdW5jdGlvbiBjb21iaW5lUmVnRXhwKC4uLnJlZ2V4cHM6IFJlZ0V4cFtdKTogUmVnRXhwIHtcbiAgcmV0dXJuIG5ldyBSZWdFeHAocmVnZXhwcy5tYXAoKHgpID0+IGAoPzoke3guc291cmNlfSlgKS5qb2luKCd8JykpO1xufVxuXG4vKipcbiAqIFN0YWNrIHRyYWNlcyB3aWxsIGJlIGN1dG9mZiB3aGVuIG9uIG9mIHRoZXNlIHBhdHRlcm5zIGlzIG1hdGNoZWRcbiAqL1xuY29uc3QgQ1VUT0ZGX1NUQUNLX1BBVFRFUk5TID0gY29tYmluZVJlZ0V4cChcbiAgLyoqIEFjdGl2aXR5IGV4ZWN1dGlvbiAqL1xuICAvXFxzK2F0IEFjdGl2aXR5XFwuZXhlY3V0ZSBcXCguKltcXFxcL113b3JrZXJbXFxcXC9dKD86c3JjfGxpYilbXFxcXC9dYWN0aXZpdHlcXC5banRdczpcXGQrOlxcZCtcXCkvLFxuICAvKiogV29ya2Zsb3cgYWN0aXZhdGlvbiAqL1xuICAvXFxzK2F0IEFjdGl2YXRvclxcLlxcUytOZXh0SGFuZGxlciBcXCguKltcXFxcL113b3JrZmxvd1tcXFxcL10oPzpzcmN8bGliKVtcXFxcL11pbnRlcm5hbHNcXC5banRdczpcXGQrOlxcZCtcXCkvLFxuICAvKiogV29ya2Zsb3cgcnVuIGFueXRoaW5nIGluIGNvbnRleHQgKi9cbiAgL1xccythdCBTY3JpcHRcXC5ydW5JbkNvbnRleHQgXFwoKD86bm9kZTp2bXx2bVxcLmpzKTpcXGQrOlxcZCtcXCkvXG4pO1xuXG4vKipcbiAqIEFueSBzdGFjayB0cmFjZSBmcmFtZXMgdGhhdCBtYXRjaCBhbnkgb2YgdGhvc2Ugd2lsIGJlIGRvcHBlZC5cbiAqIFRoZSBcIm51bGwuXCIgcHJlZml4IG9uIHNvbWUgY2FzZXMgaXMgdG8gYXZvaWQgaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2lzc3Vlcy80MjQxN1xuICovXG5jb25zdCBEUk9QUEVEX1NUQUNLX0ZSQU1FU19QQVRURVJOUyA9IGNvbWJpbmVSZWdFeHAoXG4gIC8qKiBJbnRlcm5hbCBmdW5jdGlvbnMgdXNlZCB0byByZWN1cnNpdmVseSBjaGFpbiBpbnRlcmNlcHRvcnMgKi9cbiAgL1xccythdCAobnVsbFxcLik/bmV4dCBcXCguKltcXFxcL11jb21tb25bXFxcXC9dKD86c3JjfGxpYilbXFxcXC9daW50ZXJjZXB0b3JzXFwuW2p0XXM6XFxkKzpcXGQrXFwpLyxcbiAgLyoqIEludGVybmFsIGZ1bmN0aW9ucyB1c2VkIHRvIHJlY3Vyc2l2ZWx5IGNoYWluIGludGVyY2VwdG9ycyAqL1xuICAvXFxzK2F0IChudWxsXFwuKT9leGVjdXRlTmV4dEhhbmRsZXIgXFwoLipbXFxcXC9dd29ya2VyW1xcXFwvXSg/OnNyY3xsaWIpW1xcXFwvXWFjdGl2aXR5XFwuW2p0XXM6XFxkKzpcXGQrXFwpL1xuKTtcblxuLyoqXG4gKiBDdXRzIG91dCB0aGUgZnJhbWV3b3JrIHBhcnQgb2YgYSBzdGFjayB0cmFjZSwgbGVhdmluZyBvbmx5IHVzZXIgY29kZSBlbnRyaWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjdXRvZmZTdGFja1RyYWNlKHN0YWNrPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbGluZXMgPSAoc3RhY2sgPz8gJycpLnNwbGl0KC9cXHI/XFxuLyk7XG4gIGNvbnN0IGFjYyA9IEFycmF5PHN0cmluZz4oKTtcbiAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgaWYgKENVVE9GRl9TVEFDS19QQVRURVJOUy50ZXN0KGxpbmUpKSBicmVhaztcbiAgICBpZiAoIURST1BQRURfU1RBQ0tfRlJBTUVTX1BBVFRFUk5TLnRlc3QobGluZSkpIGFjYy5wdXNoKGxpbmUpO1xuICB9XG4gIHJldHVybiBhY2Muam9pbignXFxuJyk7XG59XG5cbi8qKlxuICogQSBgRmFpbHVyZUNvbnZlcnRlcmAgaXMgcmVzcG9uc2libGUgZm9yIGNvbnZlcnRpbmcgZnJvbSBwcm90byBgRmFpbHVyZWAgaW5zdGFuY2VzIHRvIEpTIGBFcnJvcnNgIGFuZCBiYWNrLlxuICpcbiAqIFdlIHJlY29tbWVuZGVkIHVzaW5nIHRoZSB7QGxpbmsgRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJ9IGluc3RlYWQgb2YgY3VzdG9taXppbmcgdGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gaW4gb3JkZXJcbiAqIHRvIG1haW50YWluIGNyb3NzLWxhbmd1YWdlIEZhaWx1cmUgc2VyaWFsaXphdGlvbiBjb21wYXRpYmlsaXR5LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEZhaWx1cmVDb252ZXJ0ZXIge1xuICAvKipcbiAgICogQ29udmVydHMgYSBjYXVnaHQgZXJyb3IgdG8gYSBGYWlsdXJlIHByb3RvIG1lc3NhZ2UuXG4gICAqL1xuICBlcnJvclRvRmFpbHVyZShlcnI6IHVua25vd24sIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBQcm90b0ZhaWx1cmU7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIEZhaWx1cmUgcHJvdG8gbWVzc2FnZSB0byBhIEpTIEVycm9yIG9iamVjdC5cbiAgICpcbiAgICogVGhlIHJldHVybmVkIGVycm9yIG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgYFRlbXBvcmFsRmFpbHVyZWAuXG4gICAqL1xuICBmYWlsdXJlVG9FcnJvcihlcnI6IFByb3RvRmFpbHVyZSwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFRlbXBvcmFsRmFpbHVyZTtcbn1cblxuLyoqXG4gKiBUaGUgXCJzaGFwZVwiIG9mIHRoZSBhdHRyaWJ1dGVzIHNldCBhcyB0aGUge0BsaW5rIFByb3RvRmFpbHVyZS5lbmNvZGVkQXR0cmlidXRlc30gcGF5bG9hZCBpbiBjYXNlXG4gKiB7QGxpbmsgRGVmYXVsdEVuY29kZWRGYWlsdXJlQXR0cmlidXRlcy5lbmNvZGVDb21tb25BdHRyaWJ1dGVzfSBpcyBzZXQgdG8gYHRydWVgLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIERlZmF1bHRFbmNvZGVkRmFpbHVyZUF0dHJpYnV0ZXMge1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIHN0YWNrX3RyYWNlOiBzdHJpbmc7XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgdGhlIHtAbGluayBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlcn0gY29uc3RydWN0b3IuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJPcHRpb25zIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gZW5jb2RlIGVycm9yIG1lc3NhZ2VzIGFuZCBzdGFjayB0cmFjZXMgKGZvciBlbmNyeXB0aW5nIHRoZXNlIGF0dHJpYnV0ZXMgdXNlIGEge0BsaW5rIFBheWxvYWRDb2RlY30pLlxuICAgKi9cbiAgZW5jb2RlQ29tbW9uQXR0cmlidXRlczogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBEZWZhdWx0LCBjcm9zcy1sYW5ndWFnZS1jb21wYXRpYmxlIEZhaWx1cmUgY29udmVydGVyLlxuICpcbiAqIEJ5IGRlZmF1bHQsIGl0IHdpbGwgbGVhdmUgZXJyb3IgbWVzc2FnZXMgYW5kIHN0YWNrIHRyYWNlcyBhcyBwbGFpbiB0ZXh0LiBJbiBvcmRlciB0byBlbmNyeXB0IHRoZW0sIHNldFxuICogYGVuY29kZUNvbW1vbkF0dHJpYnV0ZXNgIHRvIGB0cnVlYCBpbiB0aGUgY29uc3RydWN0b3Igb3B0aW9ucyBhbmQgdXNlIGEge0BsaW5rIFBheWxvYWRDb2RlY30gdGhhdCBjYW4gZW5jcnlwdCAvXG4gKiBkZWNyeXB0IFBheWxvYWRzIGluIHlvdXIge0BsaW5rIFdvcmtlck9wdGlvbnMuZGF0YUNvbnZlcnRlciB8IFdvcmtlcn0gYW5kXG4gKiB7QGxpbmsgQ2xpZW50T3B0aW9ucy5kYXRhQ29udmVydGVyIHwgQ2xpZW50IG9wdGlvbnN9LlxuICovXG5leHBvcnQgY2xhc3MgRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXIgaW1wbGVtZW50cyBGYWlsdXJlQ29udmVydGVyIHtcbiAgcHVibGljIHJlYWRvbmx5IG9wdGlvbnM6IERlZmF1bHRGYWlsdXJlQ29udmVydGVyT3B0aW9ucztcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zPzogUGFydGlhbDxEZWZhdWx0RmFpbHVyZUNvbnZlcnRlck9wdGlvbnM+KSB7XG4gICAgY29uc3QgeyBlbmNvZGVDb21tb25BdHRyaWJ1dGVzIH0gPSBvcHRpb25zID8/IHt9O1xuICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgIGVuY29kZUNvbW1vbkF0dHJpYnV0ZXM6IGVuY29kZUNvbW1vbkF0dHJpYnV0ZXMgPz8gZmFsc2UsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIEZhaWx1cmUgcHJvdG8gbWVzc2FnZSB0byBhIEpTIEVycm9yIG9iamVjdC5cbiAgICpcbiAgICogRG9lcyBub3Qgc2V0IGNvbW1vbiBwcm9wZXJ0aWVzLCB0aGF0IGlzIGRvbmUgaW4ge0BsaW5rIGZhaWx1cmVUb0Vycm9yfS5cbiAgICovXG4gIGZhaWx1cmVUb0Vycm9ySW5uZXIoZmFpbHVyZTogUHJvdG9GYWlsdXJlLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogVGVtcG9yYWxGYWlsdXJlIHtcbiAgICBpZiAoZmFpbHVyZS5hcHBsaWNhdGlvbkZhaWx1cmVJbmZvKSB7XG4gICAgICByZXR1cm4gbmV3IEFwcGxpY2F0aW9uRmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgZmFpbHVyZS5hcHBsaWNhdGlvbkZhaWx1cmVJbmZvLnR5cGUsXG4gICAgICAgIEJvb2xlYW4oZmFpbHVyZS5hcHBsaWNhdGlvbkZhaWx1cmVJbmZvLm5vblJldHJ5YWJsZSksXG4gICAgICAgIGFycmF5RnJvbVBheWxvYWRzKHBheWxvYWRDb252ZXJ0ZXIsIGZhaWx1cmUuYXBwbGljYXRpb25GYWlsdXJlSW5mby5kZXRhaWxzPy5wYXlsb2FkcyksXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS5zZXJ2ZXJGYWlsdXJlSW5mbykge1xuICAgICAgcmV0dXJuIG5ldyBTZXJ2ZXJGYWlsdXJlKFxuICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICBCb29sZWFuKGZhaWx1cmUuc2VydmVyRmFpbHVyZUluZm8ubm9uUmV0cnlhYmxlKSxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLnRpbWVvdXRGYWlsdXJlSW5mbykge1xuICAgICAgcmV0dXJuIG5ldyBUaW1lb3V0RmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgZnJvbVBheWxvYWRzQXRJbmRleChwYXlsb2FkQ29udmVydGVyLCAwLCBmYWlsdXJlLnRpbWVvdXRGYWlsdXJlSW5mby5sYXN0SGVhcnRiZWF0RGV0YWlscz8ucGF5bG9hZHMpLFxuICAgICAgICBmYWlsdXJlLnRpbWVvdXRGYWlsdXJlSW5mby50aW1lb3V0VHlwZSA/PyBUaW1lb3V0VHlwZS5USU1FT1VUX1RZUEVfVU5TUEVDSUZJRURcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLnRlcm1pbmF0ZWRGYWlsdXJlSW5mbykge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtaW5hdGVkRmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLmNhbmNlbGVkRmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgQ2FuY2VsbGVkRmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgYXJyYXlGcm9tUGF5bG9hZHMocGF5bG9hZENvbnZlcnRlciwgZmFpbHVyZS5jYW5jZWxlZEZhaWx1cmVJbmZvLmRldGFpbHM/LnBheWxvYWRzKSxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLnJlc2V0V29ya2Zsb3dGYWlsdXJlSW5mbykge1xuICAgICAgcmV0dXJuIG5ldyBBcHBsaWNhdGlvbkZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgICdSZXNldFdvcmtmbG93JyxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIGFycmF5RnJvbVBheWxvYWRzKHBheWxvYWRDb252ZXJ0ZXIsIGZhaWx1cmUucmVzZXRXb3JrZmxvd0ZhaWx1cmVJbmZvLmxhc3RIZWFydGJlYXREZXRhaWxzPy5wYXlsb2FkcyksXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS5jaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbHVyZUluZm8pIHtcbiAgICAgIGNvbnN0IHsgbmFtZXNwYWNlLCB3b3JrZmxvd1R5cGUsIHdvcmtmbG93RXhlY3V0aW9uLCByZXRyeVN0YXRlIH0gPSBmYWlsdXJlLmNoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsdXJlSW5mbztcbiAgICAgIGlmICghKHdvcmtmbG93VHlwZT8ubmFtZSAmJiB3b3JrZmxvd0V4ZWN1dGlvbikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBhdHRyaWJ1dGVzIG9uIGNoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsdXJlSW5mbycpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBDaGlsZFdvcmtmbG93RmFpbHVyZShcbiAgICAgICAgbmFtZXNwYWNlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgd29ya2Zsb3dFeGVjdXRpb24sXG4gICAgICAgIHdvcmtmbG93VHlwZS5uYW1lLFxuICAgICAgICByZXRyeVN0YXRlID8/IFJldHJ5U3RhdGUuUkVUUllfU1RBVEVfVU5TUEVDSUZJRUQsXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvKSB7XG4gICAgICBpZiAoIWZhaWx1cmUuYWN0aXZpdHlGYWlsdXJlSW5mby5hY3Rpdml0eVR5cGU/Lm5hbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBhY3Rpdml0eVR5cGU/Lm5hbWUgb24gYWN0aXZpdHlGYWlsdXJlSW5mbycpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBBY3Rpdml0eUZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIGZhaWx1cmUuYWN0aXZpdHlGYWlsdXJlSW5mby5hY3Rpdml0eVR5cGUubmFtZSxcbiAgICAgICAgZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvLmFjdGl2aXR5SWQgPz8gdW5kZWZpbmVkLFxuICAgICAgICBmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8ucmV0cnlTdGF0ZSA/PyBSZXRyeVN0YXRlLlJFVFJZX1NUQVRFX1VOU1BFQ0lGSUVELFxuICAgICAgICBmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8uaWRlbnRpdHkgPz8gdW5kZWZpbmVkLFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZW1wb3JhbEZhaWx1cmUoXG4gICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICApO1xuICB9XG5cbiAgZmFpbHVyZVRvRXJyb3IoZmFpbHVyZTogUHJvdG9GYWlsdXJlLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogVGVtcG9yYWxGYWlsdXJlIHtcbiAgICBpZiAoZmFpbHVyZS5lbmNvZGVkQXR0cmlidXRlcykge1xuICAgICAgY29uc3QgYXR0cnMgPSBwYXlsb2FkQ29udmVydGVyLmZyb21QYXlsb2FkPERlZmF1bHRFbmNvZGVkRmFpbHVyZUF0dHJpYnV0ZXM+KGZhaWx1cmUuZW5jb2RlZEF0dHJpYnV0ZXMpO1xuICAgICAgLy8gRG9uJ3QgYXBwbHkgZW5jb2RlZEF0dHJpYnV0ZXMgdW5sZXNzIHRoZXkgY29uZm9ybSB0byBhbiBleHBlY3RlZCBzY2hlbWFcbiAgICAgIGlmICh0eXBlb2YgYXR0cnMgPT09ICdvYmplY3QnICYmIGF0dHJzICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHsgbWVzc2FnZSwgc3RhY2tfdHJhY2UgfSA9IGF0dHJzO1xuICAgICAgICAvLyBBdm9pZCBtdXRhdGluZyB0aGUgYXJndW1lbnRcbiAgICAgICAgZmFpbHVyZSA9IHsgLi4uZmFpbHVyZSB9O1xuICAgICAgICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgZmFpbHVyZS5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHN0YWNrX3RyYWNlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGZhaWx1cmUuc3RhY2tUcmFjZSA9IHN0YWNrX3RyYWNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGVyciA9IHRoaXMuZmFpbHVyZVRvRXJyb3JJbm5lcihmYWlsdXJlLCBwYXlsb2FkQ29udmVydGVyKTtcbiAgICBlcnIuc3RhY2sgPSBmYWlsdXJlLnN0YWNrVHJhY2UgPz8gJyc7XG4gICAgZXJyLmZhaWx1cmUgPSBmYWlsdXJlO1xuICAgIHJldHVybiBlcnI7XG4gIH1cblxuICBlcnJvclRvRmFpbHVyZShlcnI6IHVua25vd24sIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBQcm90b0ZhaWx1cmUge1xuICAgIGNvbnN0IGZhaWx1cmUgPSB0aGlzLmVycm9yVG9GYWlsdXJlSW5uZXIoZXJyLCBwYXlsb2FkQ29udmVydGVyKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVuY29kZUNvbW1vbkF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IHsgbWVzc2FnZSwgc3RhY2tUcmFjZSB9ID0gZmFpbHVyZTtcbiAgICAgIGZhaWx1cmUubWVzc2FnZSA9ICdFbmNvZGVkIGZhaWx1cmUnO1xuICAgICAgZmFpbHVyZS5zdGFja1RyYWNlID0gJyc7XG4gICAgICBmYWlsdXJlLmVuY29kZWRBdHRyaWJ1dGVzID0gcGF5bG9hZENvbnZlcnRlci50b1BheWxvYWQoeyBtZXNzYWdlLCBzdGFja190cmFjZTogc3RhY2tUcmFjZSB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGZhaWx1cmU7XG4gIH1cblxuICBlcnJvclRvRmFpbHVyZUlubmVyKGVycjogdW5rbm93biwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFByb3RvRmFpbHVyZSB7XG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIFRlbXBvcmFsRmFpbHVyZSkge1xuICAgICAgaWYgKGVyci5mYWlsdXJlKSByZXR1cm4gZXJyLmZhaWx1cmU7XG4gICAgICBjb25zdCBiYXNlID0ge1xuICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgc3RhY2tUcmFjZTogY3V0b2ZmU3RhY2tUcmFjZShlcnIuc3RhY2spLFxuICAgICAgICBjYXVzZTogdGhpcy5vcHRpb25hbEVycm9yVG9PcHRpb25hbEZhaWx1cmUoZXJyLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKSxcbiAgICAgICAgc291cmNlOiBGQUlMVVJFX1NPVVJDRSxcbiAgICAgIH07XG5cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBBY3Rpdml0eUZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIGFjdGl2aXR5RmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIC4uLmVycixcbiAgICAgICAgICAgIGFjdGl2aXR5VHlwZTogeyBuYW1lOiBlcnIuYWN0aXZpdHlUeXBlIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBDaGlsZFdvcmtmbG93RmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgY2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWx1cmVJbmZvOiB7XG4gICAgICAgICAgICAuLi5lcnIsXG4gICAgICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvbjogZXJyLmV4ZWN1dGlvbixcbiAgICAgICAgICAgIHdvcmtmbG93VHlwZTogeyBuYW1lOiBlcnIud29ya2Zsb3dUeXBlIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBBcHBsaWNhdGlvbkZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIGFwcGxpY2F0aW9uRmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIHR5cGU6IGVyci50eXBlLFxuICAgICAgICAgICAgbm9uUmV0cnlhYmxlOiBlcnIubm9uUmV0cnlhYmxlLFxuICAgICAgICAgICAgZGV0YWlsczpcbiAgICAgICAgICAgICAgZXJyLmRldGFpbHMgJiYgZXJyLmRldGFpbHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgPyB7IHBheWxvYWRzOiB0b1BheWxvYWRzKHBheWxvYWRDb252ZXJ0ZXIsIC4uLmVyci5kZXRhaWxzKSB9XG4gICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBDYW5jZWxsZWRGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICBjYW5jZWxlZEZhaWx1cmVJbmZvOiB7XG4gICAgICAgICAgICBkZXRhaWxzOlxuICAgICAgICAgICAgICBlcnIuZGV0YWlscyAmJiBlcnIuZGV0YWlscy5sZW5ndGhcbiAgICAgICAgICAgICAgICA/IHsgcGF5bG9hZHM6IHRvUGF5bG9hZHMocGF5bG9hZENvbnZlcnRlciwgLi4uZXJyLmRldGFpbHMpIH1cbiAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIFRpbWVvdXRGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICB0aW1lb3V0RmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIHRpbWVvdXRUeXBlOiBlcnIudGltZW91dFR5cGUsXG4gICAgICAgICAgICBsYXN0SGVhcnRiZWF0RGV0YWlsczogZXJyLmxhc3RIZWFydGJlYXREZXRhaWxzXG4gICAgICAgICAgICAgID8geyBwYXlsb2FkczogdG9QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCBlcnIubGFzdEhlYXJ0YmVhdERldGFpbHMpIH1cbiAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBTZXJ2ZXJGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICBzZXJ2ZXJGYWlsdXJlSW5mbzogeyBub25SZXRyeWFibGU6IGVyci5ub25SZXRyeWFibGUgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBUZXJtaW5hdGVkRmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgdGVybWluYXRlZEZhaWx1cmVJbmZvOiB7fSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIC8vIEp1c3QgYSBUZW1wb3JhbEZhaWx1cmVcbiAgICAgIHJldHVybiBiYXNlO1xuICAgIH1cblxuICAgIGNvbnN0IGJhc2UgPSB7XG4gICAgICBzb3VyY2U6IEZBSUxVUkVfU09VUkNFLFxuICAgIH07XG5cbiAgICBpZiAoaXNFcnJvcihlcnIpKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5iYXNlLFxuICAgICAgICBtZXNzYWdlOiBTdHJpbmcoZXJyLm1lc3NhZ2UpID8/ICcnLFxuICAgICAgICBzdGFja1RyYWNlOiBjdXRvZmZTdGFja1RyYWNlKGVyci5zdGFjayksXG4gICAgICAgIGNhdXNlOiB0aGlzLm9wdGlvbmFsRXJyb3JUb09wdGlvbmFsRmFpbHVyZSgoZXJyIGFzIGFueSkuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCByZWNvbW1lbmRhdGlvbiA9IGAgW0Egbm9uLUVycm9yIHZhbHVlIHdhcyB0aHJvd24gZnJvbSB5b3VyIGNvZGUuIFdlIHJlY29tbWVuZCB0aHJvd2luZyBFcnJvciBvYmplY3RzIHNvIHRoYXQgd2UgY2FuIHByb3ZpZGUgYSBzdGFjayB0cmFjZV1gO1xuXG4gICAgaWYgKHR5cGVvZiBlcnIgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4geyAuLi5iYXNlLCBtZXNzYWdlOiBlcnIgKyByZWNvbW1lbmRhdGlvbiB9O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGVyciA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGxldCBtZXNzYWdlID0gJyc7XG4gICAgICB0cnkge1xuICAgICAgICBtZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkoZXJyKTtcbiAgICAgIH0gY2F0Y2ggKF9lcnIpIHtcbiAgICAgICAgbWVzc2FnZSA9IFN0cmluZyhlcnIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgLi4uYmFzZSwgbWVzc2FnZTogbWVzc2FnZSArIHJlY29tbWVuZGF0aW9uIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgLi4uYmFzZSwgbWVzc2FnZTogU3RyaW5nKGVycikgKyByZWNvbW1lbmRhdGlvbiB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgRmFpbHVyZSBwcm90byBtZXNzYWdlIHRvIGEgSlMgRXJyb3Igb2JqZWN0IGlmIGRlZmluZWQgb3IgcmV0dXJucyB1bmRlZmluZWQuXG4gICAqL1xuICBvcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoXG4gICAgZmFpbHVyZTogUHJvdG9GYWlsdXJlIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyXG4gICk6IFRlbXBvcmFsRmFpbHVyZSB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIGZhaWx1cmUgPyB0aGlzLmZhaWx1cmVUb0Vycm9yKGZhaWx1cmUsIHBheWxvYWRDb252ZXJ0ZXIpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGFuIGVycm9yIHRvIGEgRmFpbHVyZSBwcm90byBtZXNzYWdlIGlmIGRlZmluZWQgb3IgcmV0dXJucyB1bmRlZmluZWRcbiAgICovXG4gIG9wdGlvbmFsRXJyb3JUb09wdGlvbmFsRmFpbHVyZShlcnI6IHVua25vd24sIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBQcm90b0ZhaWx1cmUgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiBlcnIgPyB0aGlzLmVycm9yVG9GYWlsdXJlKGVyciwgcGF5bG9hZENvbnZlcnRlcikgOiB1bmRlZmluZWQ7XG4gIH1cbn1cbiIsImltcG9ydCB7IFBheWxvYWQgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcblxuLyoqXG4gKiBgUGF5bG9hZENvZGVjYCBpcyBhbiBvcHRpb25hbCBzdGVwIHRoYXQgaGFwcGVucyBiZXR3ZWVuIHRoZSB3aXJlIGFuZCB0aGUge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJ9OlxuICpcbiAqIFRlbXBvcmFsIFNlcnZlciA8LS0+IFdpcmUgPC0tPiBgUGF5bG9hZENvZGVjYCA8LS0+IGBQYXlsb2FkQ29udmVydGVyYCA8LS0+IFVzZXIgY29kZVxuICpcbiAqIEltcGxlbWVudCB0aGlzIHRvIHRyYW5zZm9ybSBhbiBhcnJheSBvZiB7QGxpbmsgUGF5bG9hZH1zIHRvL2Zyb20gdGhlIGZvcm1hdCBzZW50IG92ZXIgdGhlIHdpcmUgYW5kIHN0b3JlZCBieSBUZW1wb3JhbCBTZXJ2ZXIuXG4gKiBDb21tb24gdHJhbnNmb3JtYXRpb25zIGFyZSBlbmNyeXB0aW9uIGFuZCBjb21wcmVzc2lvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXlsb2FkQ29kZWMge1xuICAvKipcbiAgICogRW5jb2RlIGFuIGFycmF5IG9mIHtAbGluayBQYXlsb2FkfXMgZm9yIHNlbmRpbmcgb3ZlciB0aGUgd2lyZS5cbiAgICogQHBhcmFtIHBheWxvYWRzIE1heSBoYXZlIGxlbmd0aCAwLlxuICAgKi9cbiAgZW5jb2RlKHBheWxvYWRzOiBQYXlsb2FkW10pOiBQcm9taXNlPFBheWxvYWRbXT47XG5cbiAgLyoqXG4gICAqIERlY29kZSBhbiBhcnJheSBvZiB7QGxpbmsgUGF5bG9hZH1zIHJlY2VpdmVkIGZyb20gdGhlIHdpcmUuXG4gICAqL1xuICBkZWNvZGUocGF5bG9hZHM6IFBheWxvYWRbXSk6IFByb21pc2U8UGF5bG9hZFtdPjtcbn1cbiIsImltcG9ydCB7IGRlY29kZSwgZW5jb2RlIH0gZnJvbSAnLi4vZW5jb2RpbmcnO1xuaW1wb3J0IHsgUGF5bG9hZENvbnZlcnRlckVycm9yLCBWYWx1ZUVycm9yIH0gZnJvbSAnLi4vZXJyb3JzJztcbmltcG9ydCB7IFBheWxvYWQgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGVuY29kaW5nS2V5cywgZW5jb2RpbmdUeXBlcywgTUVUQURBVEFfRU5DT0RJTkdfS0VZIH0gZnJvbSAnLi90eXBlcyc7XG5cbi8qKlxuICogVXNlZCBieSB0aGUgZnJhbWV3b3JrIHRvIHNlcmlhbGl6ZS9kZXNlcmlhbGl6ZSBkYXRhIGxpa2UgcGFyYW1ldGVycyBhbmQgcmV0dXJuIHZhbHVlcy5cbiAqXG4gKiBUaGlzIGlzIGNhbGxlZCBpbnNpZGUgdGhlIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC9kZXRlcm1pbmlzbSB8IFdvcmtmbG93IGlzb2xhdGV9LlxuICogVG8gd3JpdGUgYXN5bmMgY29kZSBvciB1c2UgTm9kZSBBUElzIChvciB1c2UgcGFja2FnZXMgdGhhdCB1c2UgTm9kZSBBUElzKSwgdXNlIGEge0BsaW5rIFBheWxvYWRDb2RlY30uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGF5bG9hZENvbnZlcnRlciB7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHZhbHVlIHRvIGEge0BsaW5rIFBheWxvYWR9LlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuIEV4YW1wbGUgdmFsdWVzIGluY2x1ZGUgdGhlIFdvcmtmbG93IGFyZ3Mgc2VudCBmcm9tIHRoZSBDbGllbnQgYW5kIHRoZSB2YWx1ZXMgcmV0dXJuZWQgYnkgYSBXb3JrZmxvdyBvciBBY3Rpdml0eS5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIHtAbGluayBQYXlsb2FkfS5cbiAgICpcbiAgICogU2hvdWxkIHRocm93IHtAbGluayBWYWx1ZUVycm9yfSBpZiB1bmFibGUgdG8gY29udmVydC5cbiAgICovXG4gIHRvUGF5bG9hZDxUPih2YWx1ZTogVCk6IFBheWxvYWQ7XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEge0BsaW5rIFBheWxvYWR9IGJhY2sgdG8gYSB2YWx1ZS5cbiAgICovXG4gIGZyb21QYXlsb2FkPFQ+KHBheWxvYWQ6IFBheWxvYWQpOiBUO1xufVxuXG4vKipcbiAqIEltcGxlbWVudHMgY29udmVyc2lvbiBvZiBhIGxpc3Qgb2YgdmFsdWVzLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJcbiAqIEBwYXJhbSB2YWx1ZXMgSlMgdmFsdWVzIHRvIGNvbnZlcnQgdG8gUGF5bG9hZHNcbiAqIEByZXR1cm4gbGlzdCBvZiB7QGxpbmsgUGF5bG9hZH1zXG4gKiBAdGhyb3dzIHtAbGluayBWYWx1ZUVycm9yfSBpZiBjb252ZXJzaW9uIG9mIHRoZSB2YWx1ZSBwYXNzZWQgYXMgcGFyYW1ldGVyIGZhaWxlZCBmb3IgYW55XG4gKiAgICAgcmVhc29uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9QYXlsb2Fkcyhjb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIsIC4uLnZhbHVlczogdW5rbm93bltdKTogUGF5bG9hZFtdIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHZhbHVlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlcy5tYXAoKHZhbHVlKSA9PiBjb252ZXJ0ZXIudG9QYXlsb2FkKHZhbHVlKSk7XG59XG5cbi8qKlxuICogUnVuIHtAbGluayBQYXlsb2FkQ29udmVydGVyLnRvUGF5bG9hZH0gb24gZWFjaCB2YWx1ZSBpbiB0aGUgbWFwLlxuICpcbiAqIEB0aHJvd3Mge0BsaW5rIFZhbHVlRXJyb3J9IGlmIGNvbnZlcnNpb24gb2YgYW55IHZhbHVlIGluIHRoZSBtYXAgZmFpbHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hcFRvUGF5bG9hZHM8SyBleHRlbmRzIHN0cmluZz4oY29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyLCBtYXA6IFJlY29yZDxLLCBhbnk+KTogUmVjb3JkPEssIFBheWxvYWQ+IHtcbiAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICBPYmplY3QuZW50cmllcyhtYXApLm1hcCgoW2ssIHZdKTogW0ssIFBheWxvYWRdID0+IFtrIGFzIEssIGNvbnZlcnRlci50b1BheWxvYWQodildKVxuICApIGFzIFJlY29yZDxLLCBQYXlsb2FkPjtcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnRzIGNvbnZlcnNpb24gb2YgYW4gYXJyYXkgb2YgdmFsdWVzIG9mIGRpZmZlcmVudCB0eXBlcy4gVXNlZnVsIGZvciBkZXNlcmlhbGl6aW5nXG4gKiBhcmd1bWVudHMgb2YgZnVuY3Rpb24gaW52b2NhdGlvbnMuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlclxuICogQHBhcmFtIGluZGV4IGluZGV4IG9mIHRoZSB2YWx1ZSBpbiB0aGUgcGF5bG9hZHNcbiAqIEBwYXJhbSBwYXlsb2FkcyBzZXJpYWxpemVkIHZhbHVlIHRvIGNvbnZlcnQgdG8gSlMgdmFsdWVzLlxuICogQHJldHVybiBjb252ZXJ0ZWQgSlMgdmFsdWVcbiAqIEB0aHJvd3Mge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJFcnJvcn0gaWYgY29udmVyc2lvbiBvZiB0aGUgZGF0YSBwYXNzZWQgYXMgcGFyYW1ldGVyIGZhaWxlZCBmb3IgYW55XG4gKiAgICAgcmVhc29uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVBheWxvYWRzQXRJbmRleDxUPihjb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIsIGluZGV4OiBudW1iZXIsIHBheWxvYWRzPzogUGF5bG9hZFtdIHwgbnVsbCk6IFQge1xuICAvLyBUbyBtYWtlIGFkZGluZyBhcmd1bWVudHMgYSBiYWNrd2FyZHMgY29tcGF0aWJsZSBjaGFuZ2VcbiAgaWYgKHBheWxvYWRzID09PSB1bmRlZmluZWQgfHwgcGF5bG9hZHMgPT09IG51bGwgfHwgaW5kZXggPj0gcGF5bG9hZHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZCBhcyBhbnk7XG4gIH1cbiAgcmV0dXJuIGNvbnZlcnRlci5mcm9tUGF5bG9hZChwYXlsb2Fkc1tpbmRleF0pO1xufVxuXG4vKipcbiAqIFJ1biB7QGxpbmsgUGF5bG9hZENvbnZlcnRlci5mcm9tUGF5bG9hZH0gb24gZWFjaCB2YWx1ZSBpbiB0aGUgYXJyYXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcnJheUZyb21QYXlsb2Fkcyhjb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIsIHBheWxvYWRzPzogUGF5bG9hZFtdIHwgbnVsbCk6IHVua25vd25bXSB7XG4gIGlmICghcGF5bG9hZHMpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgcmV0dXJuIHBheWxvYWRzLm1hcCgocGF5bG9hZDogUGF5bG9hZCkgPT4gY29udmVydGVyLmZyb21QYXlsb2FkKHBheWxvYWQpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcEZyb21QYXlsb2FkczxLIGV4dGVuZHMgc3RyaW5nPihcbiAgY29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyLFxuICBtYXA/OiBSZWNvcmQ8SywgUGF5bG9hZD4gfCBudWxsIHwgdW5kZWZpbmVkXG4pOiBSZWNvcmQ8SywgdW5rbm93bj4gfCB1bmRlZmluZWQgfCBudWxsIHtcbiAgaWYgKG1hcCA9PSBudWxsKSByZXR1cm4gbWFwO1xuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKG1hcCkubWFwKChbaywgcGF5bG9hZF0pOiBbSywgdW5rbm93bl0gPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBjb252ZXJ0ZXIuZnJvbVBheWxvYWQocGF5bG9hZCBhcyBQYXlsb2FkKTtcbiAgICAgIHJldHVybiBbayBhcyBLLCB2YWx1ZV07XG4gICAgfSlcbiAgKSBhcyBSZWNvcmQ8SywgdW5rbm93bj47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZyB7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHZhbHVlIHRvIGEge0BsaW5rIFBheWxvYWR9LlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuIEV4YW1wbGUgdmFsdWVzIGluY2x1ZGUgdGhlIFdvcmtmbG93IGFyZ3Mgc2VudCBmcm9tIHRoZSBDbGllbnQgYW5kIHRoZSB2YWx1ZXMgcmV0dXJuZWQgYnkgYSBXb3JrZmxvdyBvciBBY3Rpdml0eS5cbiAgICogQHJldHVybnMgVGhlIHtAbGluayBQYXlsb2FkfSwgb3IgYHVuZGVmaW5lZGAgaWYgdW5hYmxlIHRvIGNvbnZlcnQuXG4gICAqL1xuICB0b1BheWxvYWQ8VD4odmFsdWU6IFQpOiBQYXlsb2FkIHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHtAbGluayBQYXlsb2FkfSBiYWNrIHRvIGEgdmFsdWUuXG4gICAqL1xuICBmcm9tUGF5bG9hZDxUPihwYXlsb2FkOiBQYXlsb2FkKTogVDtcblxuICByZWFkb25seSBlbmNvZGluZ1R5cGU6IHN0cmluZztcbn1cblxuLyoqXG4gKiBUcmllcyB0byBjb252ZXJ0IHZhbHVlcyB0byB7QGxpbmsgUGF5bG9hZH1zIHVzaW5nIHRoZSB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZ31zIHByb3ZpZGVkIHRvIHRoZSBjb25zdHJ1Y3RvciwgaW4gdGhlIG9yZGVyIHByb3ZpZGVkLlxuICpcbiAqIENvbnZlcnRzIFBheWxvYWRzIHRvIHZhbHVlcyBiYXNlZCBvbiB0aGUgYFBheWxvYWQubWV0YWRhdGEuZW5jb2RpbmdgIGZpZWxkLCB3aGljaCBtYXRjaGVzIHRoZSB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZy5lbmNvZGluZ1R5cGV9XG4gKiBvZiB0aGUgY29udmVydGVyIHRoYXQgY3JlYXRlZCB0aGUgUGF5bG9hZC5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvc2l0ZVBheWxvYWRDb252ZXJ0ZXIgaW1wbGVtZW50cyBQYXlsb2FkQ29udmVydGVyIHtcbiAgcmVhZG9ubHkgY29udmVydGVyczogUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZ1tdO1xuICByZWFkb25seSBjb252ZXJ0ZXJCeUVuY29kaW5nOiBNYXA8c3RyaW5nLCBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nPiA9IG5ldyBNYXAoKTtcblxuICBjb25zdHJ1Y3RvciguLi5jb252ZXJ0ZXJzOiBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nW10pIHtcbiAgICBpZiAoY29udmVydGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBQYXlsb2FkQ29udmVydGVyRXJyb3IoJ011c3QgcHJvdmlkZSBhdCBsZWFzdCBvbmUgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZycpO1xuICAgIH1cblxuICAgIHRoaXMuY29udmVydGVycyA9IGNvbnZlcnRlcnM7XG4gICAgZm9yIChjb25zdCBjb252ZXJ0ZXIgb2YgY29udmVydGVycykge1xuICAgICAgdGhpcy5jb252ZXJ0ZXJCeUVuY29kaW5nLnNldChjb252ZXJ0ZXIuZW5jb2RpbmdUeXBlLCBjb252ZXJ0ZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmllcyB0byBydW4gYC50b1BheWxvYWQodmFsdWUpYCBvbiBlYWNoIGNvbnZlcnRlciBpbiB0aGUgb3JkZXIgcHJvdmlkZWQgYXQgY29uc3RydWN0aW9uLlxuICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBzdWNjZXNzZnVsIHJlc3VsdCwgdGhyb3dzIHtAbGluayBWYWx1ZUVycm9yfSBpZiB0aGVyZSBpcyBubyBjb252ZXJ0ZXIgdGhhdCBjYW4gaGFuZGxlIHRoZSB2YWx1ZS5cbiAgICovXG4gIHB1YmxpYyB0b1BheWxvYWQ8VD4odmFsdWU6IFQpOiBQYXlsb2FkIHtcbiAgICBmb3IgKGNvbnN0IGNvbnZlcnRlciBvZiB0aGlzLmNvbnZlcnRlcnMpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbnZlcnRlci50b1BheWxvYWQodmFsdWUpO1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoYFVuYWJsZSB0byBjb252ZXJ0ICR7dmFsdWV9IHRvIHBheWxvYWRgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4ge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2RpbmcuZnJvbVBheWxvYWR9IGJhc2VkIG9uIHRoZSBgZW5jb2RpbmdgIG1ldGFkYXRhIG9mIHRoZSB7QGxpbmsgUGF5bG9hZH0uXG4gICAqL1xuICBwdWJsaWMgZnJvbVBheWxvYWQ8VD4ocGF5bG9hZDogUGF5bG9hZCk6IFQge1xuICAgIGlmIChwYXlsb2FkLm1ldGFkYXRhID09PSB1bmRlZmluZWQgfHwgcGF5bG9hZC5tZXRhZGF0YSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ01pc3NpbmcgcGF5bG9hZCBtZXRhZGF0YScpO1xuICAgIH1cbiAgICBjb25zdCBlbmNvZGluZyA9IGRlY29kZShwYXlsb2FkLm1ldGFkYXRhW01FVEFEQVRBX0VOQ09ESU5HX0tFWV0pO1xuICAgIGNvbnN0IGNvbnZlcnRlciA9IHRoaXMuY29udmVydGVyQnlFbmNvZGluZy5nZXQoZW5jb2RpbmcpO1xuICAgIGlmIChjb252ZXJ0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoYFVua25vd24gZW5jb2Rpbmc6ICR7ZW5jb2Rpbmd9YCk7XG4gICAgfVxuICAgIHJldHVybiBjb252ZXJ0ZXIuZnJvbVBheWxvYWQocGF5bG9hZCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBiZXR3ZWVuIEpTIHVuZGVmaW5lZCBhbmQgTlVMTCBQYXlsb2FkXG4gKi9cbmV4cG9ydCBjbGFzcyBVbmRlZmluZWRQYXlsb2FkQ29udmVydGVyIGltcGxlbWVudHMgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZyB7XG4gIHB1YmxpYyBlbmNvZGluZ1R5cGUgPSBlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX05VTEw7XG5cbiAgcHVibGljIHRvUGF5bG9hZCh2YWx1ZTogdW5rbm93bik6IFBheWxvYWQgfCB1bmRlZmluZWQge1xuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBbTUVUQURBVEFfRU5DT0RJTkdfS0VZXTogZW5jb2RpbmdLZXlzLk1FVEFEQVRBX0VOQ09ESU5HX05VTEwsXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgZnJvbVBheWxvYWQ8VD4oX2NvbnRlbnQ6IFBheWxvYWQpOiBUIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkIGFzIGFueTsgLy8gSnVzdCByZXR1cm4gdW5kZWZpbmVkXG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBiZXR3ZWVuIGJpbmFyeSBkYXRhIHR5cGVzIGFuZCBSQVcgUGF5bG9hZFxuICovXG5leHBvcnQgY2xhc3MgQmluYXJ5UGF5bG9hZENvbnZlcnRlciBpbXBsZW1lbnRzIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2Rpbmcge1xuICBwdWJsaWMgZW5jb2RpbmdUeXBlID0gZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19SQVc7XG5cbiAgcHVibGljIHRvUGF5bG9hZCh2YWx1ZTogdW5rbm93bik6IFBheWxvYWQgfCB1bmRlZmluZWQge1xuICAgIGlmICghKHZhbHVlIGluc3RhbmNlb2YgVWludDhBcnJheSkpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIFtNRVRBREFUQV9FTkNPRElOR19LRVldOiBlbmNvZGluZ0tleXMuTUVUQURBVEFfRU5DT0RJTkdfUkFXLFxuICAgICAgfSxcbiAgICAgIGRhdGE6IHZhbHVlLFxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgZnJvbVBheWxvYWQ8VD4oY29udGVudDogUGF5bG9hZCk6IFQge1xuICAgIHJldHVybiAoXG4gICAgICAvLyBXcmFwIHdpdGggVWludDhBcnJheSBmcm9tIHRoaXMgY29udGV4dCB0byBlbnN1cmUgYGluc3RhbmNlb2ZgIHdvcmtzXG4gICAgICAoXG4gICAgICAgIGNvbnRlbnQuZGF0YSA/IG5ldyBVaW50OEFycmF5KGNvbnRlbnQuZGF0YS5idWZmZXIsIGNvbnRlbnQuZGF0YS5ieXRlT2Zmc2V0LCBjb250ZW50LmRhdGEubGVuZ3RoKSA6IGNvbnRlbnQuZGF0YVxuICAgICAgKSBhcyBhbnlcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogQ29udmVydHMgYmV0d2VlbiBub24tdW5kZWZpbmVkIHZhbHVlcyBhbmQgc2VyaWFsaXplZCBKU09OIFBheWxvYWRcbiAqL1xuZXhwb3J0IGNsYXNzIEpzb25QYXlsb2FkQ29udmVydGVyIGltcGxlbWVudHMgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZyB7XG4gIHB1YmxpYyBlbmNvZGluZ1R5cGUgPSBlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX0pTT047XG5cbiAgcHVibGljIHRvUGF5bG9hZCh2YWx1ZTogdW5rbm93bik6IFBheWxvYWQgfCB1bmRlZmluZWQge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGxldCBqc29uO1xuICAgIHRyeSB7XG4gICAgICBqc29uID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgW01FVEFEQVRBX0VOQ09ESU5HX0tFWV06IGVuY29kaW5nS2V5cy5NRVRBREFUQV9FTkNPRElOR19KU09OLFxuICAgICAgfSxcbiAgICAgIGRhdGE6IGVuY29kZShqc29uKSxcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGZyb21QYXlsb2FkPFQ+KGNvbnRlbnQ6IFBheWxvYWQpOiBUIHtcbiAgICBpZiAoY29udGVudC5kYXRhID09PSB1bmRlZmluZWQgfHwgY29udGVudC5kYXRhID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignR290IHBheWxvYWQgd2l0aCBubyBkYXRhJyk7XG4gICAgfVxuICAgIHJldHVybiBKU09OLnBhcnNlKGRlY29kZShjb250ZW50LmRhdGEpKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIFNlYXJjaCBBdHRyaWJ1dGUgdmFsdWVzIHVzaW5nIEpzb25QYXlsb2FkQ29udmVydGVyXG4gKi9cbmV4cG9ydCBjbGFzcyBTZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyIGltcGxlbWVudHMgUGF5bG9hZENvbnZlcnRlciB7XG4gIGpzb25Db252ZXJ0ZXIgPSBuZXcgSnNvblBheWxvYWRDb252ZXJ0ZXIoKTtcbiAgdmFsaWROb25EYXRlVHlwZXMgPSBbJ3N0cmluZycsICdudW1iZXInLCAnYm9vbGVhbiddO1xuXG4gIHB1YmxpYyB0b1BheWxvYWQodmFsdWVzOiB1bmtub3duKTogUGF5bG9hZCB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlcykpIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKGBTZWFyY2hBdHRyaWJ1dGUgdmFsdWUgbXVzdCBiZSBhbiBhcnJheWApO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZmlyc3RWYWx1ZSA9IHZhbHVlc1swXTtcbiAgICAgIGNvbnN0IGZpcnN0VHlwZSA9IHR5cGVvZiBmaXJzdFZhbHVlO1xuICAgICAgaWYgKGZpcnN0VHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaWR4LCB2YWx1ZV0gb2YgdmFsdWVzLmVudHJpZXMoKSkge1xuICAgICAgICAgIGlmICghKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKFxuICAgICAgICAgICAgICBgU2VhcmNoQXR0cmlidXRlIHZhbHVlcyBtdXN0IGFycmF5cyBvZiBzdHJpbmdzLCBudW1iZXJzLCBib29sZWFucywgb3IgRGF0ZXMuIFRoZSB2YWx1ZSAke3ZhbHVlfSBhdCBpbmRleCAke2lkeH0gaXMgb2YgdHlwZSAke3R5cGVvZiB2YWx1ZX1gXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCF0aGlzLnZhbGlkTm9uRGF0ZVR5cGVzLmluY2x1ZGVzKGZpcnN0VHlwZSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihgU2VhcmNoQXR0cmlidXRlIGFycmF5IHZhbHVlcyBtdXN0IGJlOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHwgRGF0ZWApO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBbaWR4LCB2YWx1ZV0gb2YgdmFsdWVzLmVudHJpZXMoKSkge1xuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09IGZpcnN0VHlwZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoXG4gICAgICAgICAgICAgIGBBbGwgU2VhcmNoQXR0cmlidXRlIGFycmF5IHZhbHVlcyBtdXN0IGJlIG9mIHRoZSBzYW1lIHR5cGUuIFRoZSBmaXJzdCB2YWx1ZSAke2ZpcnN0VmFsdWV9IG9mIHR5cGUgJHtmaXJzdFR5cGV9IGRvZXNuJ3QgbWF0Y2ggdmFsdWUgJHt2YWx1ZX0gb2YgdHlwZSAke3R5cGVvZiB2YWx1ZX0gYXQgaW5kZXggJHtpZHh9YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBKU09OLnN0cmluZ2lmeSB0YWtlcyBjYXJlIG9mIGNvbnZlcnRpbmcgRGF0ZXMgdG8gSVNPIHN0cmluZ3NcbiAgICBjb25zdCByZXQgPSB0aGlzLmpzb25Db252ZXJ0ZXIudG9QYXlsb2FkKHZhbHVlcyk7XG4gICAgaWYgKHJldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignQ291bGQgbm90IGNvbnZlcnQgc2VhcmNoIGF0dHJpYnV0ZXMgdG8gcGF5bG9hZHMnKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEYXRldGltZSBTZWFyY2ggQXR0cmlidXRlIHZhbHVlcyBhcmUgY29udmVydGVkIHRvIGBEYXRlYHNcbiAgICovXG4gIHB1YmxpYyBmcm9tUGF5bG9hZDxUPihwYXlsb2FkOiBQYXlsb2FkKTogVCB7XG4gICAgaWYgKHBheWxvYWQubWV0YWRhdGEgPT09IHVuZGVmaW5lZCB8fCBwYXlsb2FkLm1ldGFkYXRhID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignTWlzc2luZyBwYXlsb2FkIG1ldGFkYXRhJyk7XG4gICAgfVxuXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLmpzb25Db252ZXJ0ZXIuZnJvbVBheWxvYWQocGF5bG9hZCk7XG4gICAgbGV0IGFycmF5V3JhcHBlZFZhbHVlID0gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IFt2YWx1ZV07XG5cbiAgICBjb25zdCBzZWFyY2hBdHRyaWJ1dGVUeXBlID0gZGVjb2RlKHBheWxvYWQubWV0YWRhdGEudHlwZSk7XG4gICAgaWYgKHNlYXJjaEF0dHJpYnV0ZVR5cGUgPT09ICdEYXRldGltZScpIHtcbiAgICAgIGFycmF5V3JhcHBlZFZhbHVlID0gYXJyYXlXcmFwcGVkVmFsdWUubWFwKChkYXRlU3RyaW5nKSA9PiBuZXcgRGF0ZShkYXRlU3RyaW5nKSk7XG4gICAgfVxuICAgIHJldHVybiBhcnJheVdyYXBwZWRWYWx1ZSBhcyB1bmtub3duIGFzIFQ7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIgPSBuZXcgU2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlcigpO1xuXG5leHBvcnQgY2xhc3MgRGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIgZXh0ZW5kcyBDb21wb3NpdGVQYXlsb2FkQ29udmVydGVyIHtcbiAgLy8gTWF0Y2ggdGhlIG9yZGVyIHVzZWQgaW4gb3RoZXIgU0RLcywgYnV0IGV4Y2x1ZGUgUHJvdG9idWYgY29udmVydGVycyBzbyB0aGF0IHRoZSBjb2RlLCBpbmNsdWRpbmdcbiAgLy8gYHByb3RvMy1qc29uLXNlcmlhbGl6ZXJgLCBkb2Vzbid0IHRha2Ugc3BhY2UgaW4gV29ya2Zsb3cgYnVuZGxlcyB0aGF0IGRvbid0IHVzZSBQcm90b2J1ZnMuIFRvIHVzZSBQcm90b2J1ZnMsIHVzZVxuICAvLyB7QGxpbmsgRGVmYXVsdFBheWxvYWRDb252ZXJ0ZXJXaXRoUHJvdG9idWZzfS5cbiAgLy9cbiAgLy8gR28gU0RLOlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9zZGstZ28vYmxvYi81ZTU2NDVmMGM1NTBkY2Y3MTdjMDk1YWUzMmM3NmE3MDg3ZDJlOTg1L2NvbnZlcnRlci9kZWZhdWx0X2RhdGFfY29udmVydGVyLmdvI0wyOFxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihuZXcgVW5kZWZpbmVkUGF5bG9hZENvbnZlcnRlcigpLCBuZXcgQmluYXJ5UGF5bG9hZENvbnZlcnRlcigpLCBuZXcgSnNvblBheWxvYWRDb252ZXJ0ZXIoKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn0gdXNlZCBieSB0aGUgU0RLLiBTdXBwb3J0cyBgVWludDhBcnJheWAgYW5kIEpTT04gc2VyaWFsaXphYmxlcyAoc28gaWZcbiAqIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9KU09OL3N0cmluZ2lmeSNkZXNjcmlwdGlvbiB8IGBKU09OLnN0cmluZ2lmeSh5b3VyQXJnT3JSZXR2YWwpYH1cbiAqIHdvcmtzLCB0aGUgZGVmYXVsdCBwYXlsb2FkIGNvbnZlcnRlciB3aWxsIHdvcmspLlxuICpcbiAqIFRvIGFsc28gc3VwcG9ydCBQcm90b2J1ZnMsIGNyZWF0ZSBhIGN1c3RvbSBwYXlsb2FkIGNvbnZlcnRlciB3aXRoIHtAbGluayBEZWZhdWx0UGF5bG9hZENvbnZlcnRlcn06XG4gKlxuICogYGNvbnN0IG15Q29udmVydGVyID0gbmV3IERlZmF1bHRQYXlsb2FkQ29udmVydGVyKHsgcHJvdG9idWZSb290IH0pYFxuICovXG5leHBvcnQgY29uc3QgZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIgPSBuZXcgRGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIoKTtcbiIsImltcG9ydCB7IGVuY29kZSB9IGZyb20gJy4uL2VuY29kaW5nJztcblxuZXhwb3J0IGNvbnN0IE1FVEFEQVRBX0VOQ09ESU5HX0tFWSA9ICdlbmNvZGluZyc7XG5leHBvcnQgY29uc3QgZW5jb2RpbmdUeXBlcyA9IHtcbiAgTUVUQURBVEFfRU5DT0RJTkdfTlVMTDogJ2JpbmFyeS9udWxsJyxcbiAgTUVUQURBVEFfRU5DT0RJTkdfUkFXOiAnYmluYXJ5L3BsYWluJyxcbiAgTUVUQURBVEFfRU5DT0RJTkdfSlNPTjogJ2pzb24vcGxhaW4nLFxuICBNRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRl9KU09OOiAnanNvbi9wcm90b2J1ZicsXG4gIE1FVEFEQVRBX0VOQ09ESU5HX1BST1RPQlVGOiAnYmluYXJ5L3Byb3RvYnVmJyxcbn0gYXMgY29uc3Q7XG5leHBvcnQgdHlwZSBFbmNvZGluZ1R5cGUgPSAodHlwZW9mIGVuY29kaW5nVHlwZXMpW2tleW9mIHR5cGVvZiBlbmNvZGluZ1R5cGVzXTtcblxuZXhwb3J0IGNvbnN0IGVuY29kaW5nS2V5cyA9IHtcbiAgTUVUQURBVEFfRU5DT0RJTkdfTlVMTDogZW5jb2RlKGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfTlVMTCksXG4gIE1FVEFEQVRBX0VOQ09ESU5HX1JBVzogZW5jb2RlKGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfUkFXKSxcbiAgTUVUQURBVEFfRU5DT0RJTkdfSlNPTjogZW5jb2RlKGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfSlNPTiksXG4gIE1FVEFEQVRBX0VOQ09ESU5HX1BST1RPQlVGX0pTT046IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX1BST1RPQlVGX0pTT04pLFxuICBNRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRjogZW5jb2RlKGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfUFJPVE9CVUYpLFxufSBhcyBjb25zdDtcblxuZXhwb3J0IGNvbnN0IE1FVEFEQVRBX01FU1NBR0VfVFlQRV9LRVkgPSAnbWVzc2FnZVR5cGUnO1xuIiwiaW1wb3J0ICogYXMgdGltZSBmcm9tICcuL3RpbWUnO1xuaW1wb3J0IHsgdHlwZSBUaW1lc3RhbXAsIER1cmF0aW9uIH0gZnJvbSAnLi90aW1lJztcblxuLyoqXG4gKiBMb3NzeSBjb252ZXJzaW9uIGZ1bmN0aW9uIGZyb20gVGltZXN0YW1wIHRvIG51bWJlciBkdWUgdG8gcG9zc2libGUgb3ZlcmZsb3cuXG4gKiBJZiB0cyBpcyBudWxsIG9yIHVuZGVmaW5lZCByZXR1cm5zIHVuZGVmaW5lZC5cbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gb3B0aW9uYWxUc1RvTXModHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICByZXR1cm4gdGltZS5vcHRpb25hbFRzVG9Ncyh0cyk7XG59XG5cbi8qKlxuICogTG9zc3kgY29udmVyc2lvbiBmdW5jdGlvbiBmcm9tIFRpbWVzdGFtcCB0byBudW1iZXIgZHVlIHRvIHBvc3NpYmxlIG92ZXJmbG93XG4gKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0c1RvTXModHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQpOiBudW1iZXIge1xuICByZXR1cm4gdGltZS50c1RvTXModHMpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtc051bWJlclRvVHMobWlsbGlzOiBudW1iZXIpOiBUaW1lc3RhbXAge1xuICByZXR1cm4gdGltZS5tc051bWJlclRvVHMobWlsbGlzKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gbXNUb1RzKHN0cjogRHVyYXRpb24pOiBUaW1lc3RhbXAge1xuICByZXR1cm4gdGltZS5tc1RvVHMoc3RyKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gbXNPcHRpb25hbFRvVHMoc3RyOiBEdXJhdGlvbiB8IHVuZGVmaW5lZCk6IFRpbWVzdGFtcCB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0aW1lLm1zT3B0aW9uYWxUb1RzKHN0cik7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1zT3B0aW9uYWxUb051bWJlcih2YWw6IER1cmF0aW9uIHwgdW5kZWZpbmVkKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHRpbWUubXNPcHRpb25hbFRvTnVtYmVyKHZhbCk7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1zVG9OdW1iZXIodmFsOiBEdXJhdGlvbik6IG51bWJlciB7XG4gIHJldHVybiB0aW1lLm1zVG9OdW1iZXIodmFsKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gdHNUb0RhdGUodHM6IFRpbWVzdGFtcCk6IERhdGUge1xuICByZXR1cm4gdGltZS50c1RvRGF0ZSh0cyk7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsVHNUb0RhdGUodHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQpOiBEYXRlIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHRpbWUub3B0aW9uYWxUc1RvRGF0ZSh0cyk7XG59XG4iLCIvLyBQYXN0ZWQgd2l0aCBtb2RpZmljYXRpb25zIGZyb206IGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9hbm9ueWNvL0Zhc3Rlc3RTbWFsbGVzdFRleHRFbmNvZGVyRGVjb2Rlci9tYXN0ZXIvRW5jb2RlckRlY29kZXJUb2dldGhlci5zcmMuanNcbi8qIGVzbGludCBuby1mYWxsdGhyb3VnaDogMCAqL1xuXG5jb25zdCBmcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuY29uc3QgZW5jb2RlclJlZ2V4cCA9IC9bXFx4ODAtXFx1RDdmZlxcdURDMDAtXFx1RkZGRl18W1xcdUQ4MDAtXFx1REJGRl1bXFx1REMwMC1cXHVERkZGXT8vZztcbmNvbnN0IHRtcEJ1ZmZlclUxNiA9IG5ldyBVaW50MTZBcnJheSgzMik7XG5cbmV4cG9ydCBjbGFzcyBUZXh0RGVjb2RlciB7XG4gIGRlY29kZShpbnB1dEFycmF5T3JCdWZmZXI6IFVpbnQ4QXJyYXkgfCBBcnJheUJ1ZmZlciB8IFNoYXJlZEFycmF5QnVmZmVyKTogc3RyaW5nIHtcbiAgICBjb25zdCBpbnB1dEFzOCA9IGlucHV0QXJyYXlPckJ1ZmZlciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPyBpbnB1dEFycmF5T3JCdWZmZXIgOiBuZXcgVWludDhBcnJheShpbnB1dEFycmF5T3JCdWZmZXIpO1xuXG4gICAgbGV0IHJlc3VsdGluZ1N0cmluZyA9ICcnLFxuICAgICAgdG1wU3RyID0gJycsXG4gICAgICBpbmRleCA9IDAsXG4gICAgICBuZXh0RW5kID0gMCxcbiAgICAgIGNwMCA9IDAsXG4gICAgICBjb2RlUG9pbnQgPSAwLFxuICAgICAgbWluQml0cyA9IDAsXG4gICAgICBjcDEgPSAwLFxuICAgICAgcG9zID0gMCxcbiAgICAgIHRtcCA9IC0xO1xuICAgIGNvbnN0IGxlbiA9IGlucHV0QXM4Lmxlbmd0aCB8IDA7XG4gICAgY29uc3QgbGVuTWludXMzMiA9IChsZW4gLSAzMikgfCAwO1xuICAgIC8vIE5vdGUgdGhhdCB0bXAgcmVwcmVzZW50cyB0aGUgMm5kIGhhbGYgb2YgYSBzdXJyb2dhdGUgcGFpciBpbmNhc2UgYSBzdXJyb2dhdGUgZ2V0cyBkaXZpZGVkIGJldHdlZW4gYmxvY2tzXG4gICAgZm9yICg7IGluZGV4IDwgbGVuOyApIHtcbiAgICAgIG5leHRFbmQgPSBpbmRleCA8PSBsZW5NaW51czMyID8gMzIgOiAobGVuIC0gaW5kZXgpIHwgMDtcbiAgICAgIGZvciAoOyBwb3MgPCBuZXh0RW5kOyBpbmRleCA9IChpbmRleCArIDEpIHwgMCwgcG9zID0gKHBvcyArIDEpIHwgMCkge1xuICAgICAgICBjcDAgPSBpbnB1dEFzOFtpbmRleF0gJiAweGZmO1xuICAgICAgICBzd2l0Y2ggKGNwMCA+PiA0KSB7XG4gICAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICAgIGNwMSA9IGlucHV0QXM4WyhpbmRleCA9IChpbmRleCArIDEpIHwgMCldICYgMHhmZjtcbiAgICAgICAgICAgIGlmIChjcDEgPj4gNiAhPT0gMGIxMCB8fCAwYjExMTEwMTExIDwgY3AwKSB7XG4gICAgICAgICAgICAgIGluZGV4ID0gKGluZGV4IC0gMSkgfCAwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvZGVQb2ludCA9ICgoY3AwICYgMGIxMTEpIDw8IDYpIHwgKGNwMSAmIDBiMDAxMTExMTEpO1xuICAgICAgICAgICAgbWluQml0cyA9IDU7IC8vIDIwIGVuc3VyZXMgaXQgbmV2ZXIgcGFzc2VzIC0+IGFsbCBpbnZhbGlkIHJlcGxhY2VtZW50c1xuICAgICAgICAgICAgY3AwID0gMHgxMDA7IC8vICBrZWVwIHRyYWNrIG9mIHRoIGJpdCBzaXplXG4gICAgICAgICAgY2FzZSAxNDpcbiAgICAgICAgICAgIGNwMSA9IGlucHV0QXM4WyhpbmRleCA9IChpbmRleCArIDEpIHwgMCldICYgMHhmZjtcbiAgICAgICAgICAgIGNvZGVQb2ludCA8PD0gNjtcbiAgICAgICAgICAgIGNvZGVQb2ludCB8PSAoKGNwMCAmIDBiMTExMSkgPDwgNikgfCAoY3AxICYgMGIwMDExMTExMSk7XG4gICAgICAgICAgICBtaW5CaXRzID0gY3AxID4+IDYgPT09IDBiMTAgPyAobWluQml0cyArIDQpIHwgMCA6IDI0OyAvLyAyNCBlbnN1cmVzIGl0IG5ldmVyIHBhc3NlcyAtPiBhbGwgaW52YWxpZCByZXBsYWNlbWVudHNcbiAgICAgICAgICAgIGNwMCA9IChjcDAgKyAweDEwMCkgJiAweDMwMDsgLy8ga2VlcCB0cmFjayBvZiB0aCBiaXQgc2l6ZVxuICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgIGNwMSA9IGlucHV0QXM4WyhpbmRleCA9IChpbmRleCArIDEpIHwgMCldICYgMHhmZjtcbiAgICAgICAgICAgIGNvZGVQb2ludCA8PD0gNjtcbiAgICAgICAgICAgIGNvZGVQb2ludCB8PSAoKGNwMCAmIDBiMTExMTEpIDw8IDYpIHwgKGNwMSAmIDBiMDAxMTExMTEpO1xuICAgICAgICAgICAgbWluQml0cyA9IChtaW5CaXRzICsgNykgfCAwO1xuXG4gICAgICAgICAgICAvLyBOb3csIHByb2Nlc3MgdGhlIGNvZGUgcG9pbnRcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGxlbiAmJiBjcDEgPj4gNiA9PT0gMGIxMCAmJiBjb2RlUG9pbnQgPj4gbWluQml0cyAmJiBjb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgICAgICAgICBjcDAgPSBjb2RlUG9pbnQ7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IChjb2RlUG9pbnQgLSAweDEwMDAwKSB8IDA7XG4gICAgICAgICAgICAgIGlmICgwIDw9IGNvZGVQb2ludCAvKjB4ZmZmZiA8IGNvZGVQb2ludCovKSB7XG4gICAgICAgICAgICAgICAgLy8gQk1QIGNvZGUgcG9pbnRcbiAgICAgICAgICAgICAgICAvL25leHRFbmQgPSBuZXh0RW5kIC0gMXwwO1xuXG4gICAgICAgICAgICAgICAgdG1wID0gKChjb2RlUG9pbnQgPj4gMTApICsgMHhkODAwKSB8IDA7IC8vIGhpZ2hTdXJyb2dhdGVcbiAgICAgICAgICAgICAgICBjcDAgPSAoKGNvZGVQb2ludCAmIDB4M2ZmKSArIDB4ZGMwMCkgfCAwOyAvLyBsb3dTdXJyb2dhdGUgKHdpbGwgYmUgaW5zZXJ0ZWQgbGF0ZXIgaW4gdGhlIHN3aXRjaC1zdGF0ZW1lbnQpXG5cbiAgICAgICAgICAgICAgICBpZiAocG9zIDwgMzEpIHtcbiAgICAgICAgICAgICAgICAgIC8vIG5vdGljZSAzMSBpbnN0ZWFkIG9mIDMyXG4gICAgICAgICAgICAgICAgICB0bXBCdWZmZXJVMTZbcG9zXSA9IHRtcDtcbiAgICAgICAgICAgICAgICAgIHBvcyA9IChwb3MgKyAxKSB8IDA7XG4gICAgICAgICAgICAgICAgICB0bXAgPSAtMTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgLy8gZWxzZSwgd2UgYXJlIGF0IHRoZSBlbmQgb2YgdGhlIGlucHV0QXM4IGFuZCBsZXQgdG1wMCBiZSBmaWxsZWQgaW4gbGF0ZXIgb25cbiAgICAgICAgICAgICAgICAgIC8vIE5PVEUgdGhhdCBjcDEgaXMgYmVpbmcgdXNlZCBhcyBhIHRlbXBvcmFyeSB2YXJpYWJsZSBmb3IgdGhlIHN3YXBwaW5nIG9mIHRtcCB3aXRoIGNwMFxuICAgICAgICAgICAgICAgICAgY3AxID0gdG1wO1xuICAgICAgICAgICAgICAgICAgdG1wID0gY3AwO1xuICAgICAgICAgICAgICAgICAgY3AwID0gY3AxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIG5leHRFbmQgPSAobmV4dEVuZCArIDEpIHwgMDsgLy8gYmVjYXVzZSB3ZSBhcmUgYWR2YW5jaW5nIGkgd2l0aG91dCBhZHZhbmNpbmcgcG9zXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBpbnZhbGlkIGNvZGUgcG9pbnQgbWVhbnMgcmVwbGFjaW5nIHRoZSB3aG9sZSB0aGluZyB3aXRoIG51bGwgcmVwbGFjZW1lbnQgY2hhcmFjdGVyc1xuICAgICAgICAgICAgICBjcDAgPj49IDg7XG4gICAgICAgICAgICAgIGluZGV4ID0gKGluZGV4IC0gY3AwIC0gMSkgfCAwOyAvLyByZXNldCBpbmRleCAgYmFjayB0byB3aGF0IGl0IHdhcyBiZWZvcmVcbiAgICAgICAgICAgICAgY3AwID0gMHhmZmZkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBGaW5hbGx5LCByZXNldCB0aGUgdmFyaWFibGVzIGZvciB0aGUgbmV4dCBnby1hcm91bmRcbiAgICAgICAgICAgIG1pbkJpdHMgPSAwO1xuICAgICAgICAgICAgY29kZVBvaW50ID0gMDtcbiAgICAgICAgICAgIG5leHRFbmQgPSBpbmRleCA8PSBsZW5NaW51czMyID8gMzIgOiAobGVuIC0gaW5kZXgpIHwgMDtcbiAgICAgICAgICAvKmNhc2UgMTE6XG4gICAgICAgIGNhc2UgMTA6XG4gICAgICAgIGNhc2UgOTpcbiAgICAgICAgY2FzZSA4OlxuICAgICAgICAgIGNvZGVQb2ludCA/IGNvZGVQb2ludCA9IDAgOiBjcDAgPSAweGZmZmQ7IC8vIGZpbGwgd2l0aCBpbnZhbGlkIHJlcGxhY2VtZW50IGNoYXJhY3RlclxuICAgICAgICBjYXNlIDc6XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgY2FzZSA1OlxuICAgICAgICBjYXNlIDQ6XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICBjYXNlIDE6XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICB0bXBCdWZmZXJVMTZbcG9zXSA9IGNwMDtcbiAgICAgICAgICBjb250aW51ZTsqL1xuICAgICAgICAgIGRlZmF1bHQ6IC8vIGZpbGwgd2l0aCBpbnZhbGlkIHJlcGxhY2VtZW50IGNoYXJhY3RlclxuICAgICAgICAgICAgdG1wQnVmZmVyVTE2W3Bvc10gPSBjcDA7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgfVxuICAgICAgICB0bXBCdWZmZXJVMTZbcG9zXSA9IDB4ZmZmZDsgLy8gZmlsbCB3aXRoIGludmFsaWQgcmVwbGFjZW1lbnQgY2hhcmFjdGVyXG4gICAgICB9XG4gICAgICB0bXBTdHIgKz0gZnJvbUNoYXJDb2RlKFxuICAgICAgICB0bXBCdWZmZXJVMTZbMF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzJdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbM10sXG4gICAgICAgIHRtcEJ1ZmZlclUxNls0XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzVdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbNl0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNls3XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzhdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbOV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxMF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxMV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxMl0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxM10sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxNF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxNV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxNl0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxN10sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxOF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxOV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyMF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyMV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyMl0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyM10sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyNF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyNV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyNl0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyN10sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyOF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyOV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlszMF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlszMV1cbiAgICAgICk7XG4gICAgICBpZiAocG9zIDwgMzIpIHRtcFN0ciA9IHRtcFN0ci5zbGljZSgwLCAocG9zIC0gMzIpIHwgMCk7IC8vLSgzMi1wb3MpKTtcbiAgICAgIGlmIChpbmRleCA8IGxlbikge1xuICAgICAgICAvL2Zyb21DaGFyQ29kZS5hcHBseSgwLCB0bXBCdWZmZXJVMTYgOiBVaW50OEFycmF5ID8gIHRtcEJ1ZmZlclUxNi5zdWJhcnJheSgwLHBvcykgOiB0bXBCdWZmZXJVMTYuc2xpY2UoMCxwb3MpKTtcbiAgICAgICAgdG1wQnVmZmVyVTE2WzBdID0gdG1wO1xuICAgICAgICBwb3MgPSB+dG1wID4+PiAzMTsgLy90bXAgIT09IC0xID8gMSA6IDA7XG4gICAgICAgIHRtcCA9IC0xO1xuXG4gICAgICAgIGlmICh0bXBTdHIubGVuZ3RoIDwgcmVzdWx0aW5nU3RyaW5nLmxlbmd0aCkgY29udGludWU7XG4gICAgICB9IGVsc2UgaWYgKHRtcCAhPT0gLTEpIHtcbiAgICAgICAgdG1wU3RyICs9IGZyb21DaGFyQ29kZSh0bXApO1xuICAgICAgfVxuXG4gICAgICByZXN1bHRpbmdTdHJpbmcgKz0gdG1wU3RyO1xuICAgICAgdG1wU3RyID0gJyc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdGluZ1N0cmluZztcbiAgfVxufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZnVuY3Rpb24gZW5jb2RlclJlcGxhY2VyKG5vbkFzY2lpQ2hhcnM6IHN0cmluZykge1xuICAvLyBtYWtlIHRoZSBVVEYgc3RyaW5nIGludG8gYSBiaW5hcnkgVVRGLTggZW5jb2RlZCBzdHJpbmdcbiAgbGV0IHBvaW50ID0gbm9uQXNjaWlDaGFycy5jaGFyQ29kZUF0KDApIHwgMDtcbiAgaWYgKDB4ZDgwMCA8PSBwb2ludCkge1xuICAgIGlmIChwb2ludCA8PSAweGRiZmYpIHtcbiAgICAgIGNvbnN0IG5leHRjb2RlID0gbm9uQXNjaWlDaGFycy5jaGFyQ29kZUF0KDEpIHwgMDsgLy8gZGVmYXVsdHMgdG8gMCB3aGVuIE5hTiwgY2F1c2luZyBudWxsIHJlcGxhY2VtZW50IGNoYXJhY3RlclxuXG4gICAgICBpZiAoMHhkYzAwIDw9IG5leHRjb2RlICYmIG5leHRjb2RlIDw9IDB4ZGZmZikge1xuICAgICAgICAvL3BvaW50ID0gKChwb2ludCAtIDB4RDgwMCk8PDEwKSArIG5leHRjb2RlIC0gMHhEQzAwICsgMHgxMDAwMHwwO1xuICAgICAgICBwb2ludCA9ICgocG9pbnQgPDwgMTApICsgbmV4dGNvZGUgLSAweDM1ZmRjMDApIHwgMDtcbiAgICAgICAgaWYgKHBvaW50ID4gMHhmZmZmKVxuICAgICAgICAgIHJldHVybiBmcm9tQ2hhckNvZGUoXG4gICAgICAgICAgICAoMHgxZSAvKjBiMTExMTAqLyA8PCAzKSB8IChwb2ludCA+PiAxOCksXG4gICAgICAgICAgICAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKChwb2ludCA+PiAxMikgJiAweDNmKSAvKjBiMDAxMTExMTEqLyxcbiAgICAgICAgICAgICgweDIgLyowYjEwKi8gPDwgNikgfCAoKHBvaW50ID4+IDYpICYgMHgzZikgLyowYjAwMTExMTExKi8sXG4gICAgICAgICAgICAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKHBvaW50ICYgMHgzZikgLyowYjAwMTExMTExKi9cbiAgICAgICAgICApO1xuICAgICAgfSBlbHNlIHBvaW50ID0gNjU1MzMgLyowYjExMTExMTExMTExMTExMDEqLzsgLy9yZXR1cm4gJ1xceEVGXFx4QkZcXHhCRCc7Ly9mcm9tQ2hhckNvZGUoMHhlZiwgMHhiZiwgMHhiZCk7XG4gICAgfSBlbHNlIGlmIChwb2ludCA8PSAweGRmZmYpIHtcbiAgICAgIHBvaW50ID0gNjU1MzMgLyowYjExMTExMTExMTExMTExMDEqLzsgLy9yZXR1cm4gJ1xceEVGXFx4QkZcXHhCRCc7Ly9mcm9tQ2hhckNvZGUoMHhlZiwgMHhiZiwgMHhiZCk7XG4gICAgfVxuICB9XG4gIC8qaWYgKHBvaW50IDw9IDB4MDA3ZikgcmV0dXJuIG5vbkFzY2lpQ2hhcnM7XG4gIGVsc2UgKi8gaWYgKHBvaW50IDw9IDB4MDdmZikge1xuICAgIHJldHVybiBmcm9tQ2hhckNvZGUoKDB4NiA8PCA1KSB8IChwb2ludCA+PiA2KSwgKDB4MiA8PCA2KSB8IChwb2ludCAmIDB4M2YpKTtcbiAgfSBlbHNlXG4gICAgcmV0dXJuIGZyb21DaGFyQ29kZShcbiAgICAgICgweGUgLyowYjExMTAqLyA8PCA0KSB8IChwb2ludCA+PiAxMiksXG4gICAgICAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKChwb2ludCA+PiA2KSAmIDB4M2YpIC8qMGIwMDExMTExMSovLFxuICAgICAgKDB4MiAvKjBiMTAqLyA8PCA2KSB8IChwb2ludCAmIDB4M2YpIC8qMGIwMDExMTExMSovXG4gICAgKTtcbn1cblxuZXhwb3J0IGNsYXNzIFRleHRFbmNvZGVyIHtcbiAgcHVibGljIGVuY29kZShpbnB1dFN0cmluZzogc3RyaW5nKTogVWludDhBcnJheSB7XG4gICAgLy8gMHhjMCA9PiAwYjExMDAwMDAwOyAweGZmID0+IDBiMTExMTExMTE7IDB4YzAtMHhmZiA9PiAwYjExeHh4eHh4XG4gICAgLy8gMHg4MCA9PiAwYjEwMDAwMDAwOyAweGJmID0+IDBiMTAxMTExMTE7IDB4ODAtMHhiZiA9PiAwYjEweHh4eHh4XG4gICAgY29uc3QgZW5jb2RlZFN0cmluZyA9IGlucHV0U3RyaW5nID09PSB2b2lkIDAgPyAnJyA6ICcnICsgaW5wdXRTdHJpbmcsXG4gICAgICBsZW4gPSBlbmNvZGVkU3RyaW5nLmxlbmd0aCB8IDA7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBVaW50OEFycmF5KCgobGVuIDw8IDEpICsgOCkgfCAwKTtcbiAgICBsZXQgdG1wUmVzdWx0OiBVaW50OEFycmF5O1xuICAgIGxldCBpID0gMCxcbiAgICAgIHBvcyA9IDAsXG4gICAgICBwb2ludCA9IDAsXG4gICAgICBuZXh0Y29kZSA9IDA7XG4gICAgbGV0IHVwZ3JhZGVkZWRBcnJheVNpemUgPSAhVWludDhBcnJheTsgLy8gbm9ybWFsIGFycmF5cyBhcmUgYXV0by1leHBhbmRpbmdcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpID0gKGkgKyAxKSB8IDAsIHBvcyA9IChwb3MgKyAxKSB8IDApIHtcbiAgICAgIHBvaW50ID0gZW5jb2RlZFN0cmluZy5jaGFyQ29kZUF0KGkpIHwgMDtcbiAgICAgIGlmIChwb2ludCA8PSAweDAwN2YpIHtcbiAgICAgICAgcmVzdWx0W3Bvc10gPSBwb2ludDtcbiAgICAgIH0gZWxzZSBpZiAocG9pbnQgPD0gMHgwN2ZmKSB7XG4gICAgICAgIHJlc3VsdFtwb3NdID0gKDB4NiA8PCA1KSB8IChwb2ludCA+PiA2KTtcbiAgICAgICAgcmVzdWx0Wyhwb3MgPSAocG9zICsgMSkgfCAwKV0gPSAoMHgyIDw8IDYpIHwgKHBvaW50ICYgMHgzZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aWRlbkNoZWNrOiB7XG4gICAgICAgICAgaWYgKDB4ZDgwMCA8PSBwb2ludCkge1xuICAgICAgICAgICAgaWYgKHBvaW50IDw9IDB4ZGJmZikge1xuICAgICAgICAgICAgICBuZXh0Y29kZSA9IGVuY29kZWRTdHJpbmcuY2hhckNvZGVBdCgoaSA9IChpICsgMSkgfCAwKSkgfCAwOyAvLyBkZWZhdWx0cyB0byAwIHdoZW4gTmFOLCBjYXVzaW5nIG51bGwgcmVwbGFjZW1lbnQgY2hhcmFjdGVyXG5cbiAgICAgICAgICAgICAgaWYgKDB4ZGMwMCA8PSBuZXh0Y29kZSAmJiBuZXh0Y29kZSA8PSAweGRmZmYpIHtcbiAgICAgICAgICAgICAgICAvL3BvaW50ID0gKChwb2ludCAtIDB4RDgwMCk8PDEwKSArIG5leHRjb2RlIC0gMHhEQzAwICsgMHgxMDAwMHwwO1xuICAgICAgICAgICAgICAgIHBvaW50ID0gKChwb2ludCA8PCAxMCkgKyBuZXh0Y29kZSAtIDB4MzVmZGMwMCkgfCAwO1xuICAgICAgICAgICAgICAgIGlmIChwb2ludCA+IDB4ZmZmZikge1xuICAgICAgICAgICAgICAgICAgcmVzdWx0W3Bvc10gPSAoMHgxZSAvKjBiMTExMTAqLyA8PCAzKSB8IChwb2ludCA+PiAxOCk7XG4gICAgICAgICAgICAgICAgICByZXN1bHRbKHBvcyA9IChwb3MgKyAxKSB8IDApXSA9ICgweDIgLyowYjEwKi8gPDwgNikgfCAoKHBvaW50ID4+IDEyKSAmIDB4M2YpIC8qMGIwMDExMTExMSovO1xuICAgICAgICAgICAgICAgICAgcmVzdWx0Wyhwb3MgPSAocG9zICsgMSkgfCAwKV0gPSAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKChwb2ludCA+PiA2KSAmIDB4M2YpIC8qMGIwMDExMTExMSovO1xuICAgICAgICAgICAgICAgICAgcmVzdWx0Wyhwb3MgPSAocG9zICsgMSkgfCAwKV0gPSAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKHBvaW50ICYgMHgzZikgLyowYjAwMTExMTExKi87XG4gICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWsgd2lkZW5DaGVjaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBwb2ludCA9IDY1NTMzIC8qMGIxMTExMTExMTExMTExMTAxKi87IC8vcmV0dXJuICdcXHhFRlxceEJGXFx4QkQnOy8vZnJvbUNoYXJDb2RlKDB4ZWYsIDB4YmYsIDB4YmQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwb2ludCA8PSAweGRmZmYpIHtcbiAgICAgICAgICAgICAgcG9pbnQgPSA2NTUzMyAvKjBiMTExMTExMTExMTExMTEwMSovOyAvL3JldHVybiAnXFx4RUZcXHhCRlxceEJEJzsvL2Zyb21DaGFyQ29kZSgweGVmLCAweGJmLCAweGJkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCF1cGdyYWRlZGVkQXJyYXlTaXplICYmIGkgPDwgMSA8IHBvcyAmJiBpIDw8IDEgPCAoKHBvcyAtIDcpIHwgMCkpIHtcbiAgICAgICAgICAgIHVwZ3JhZGVkZWRBcnJheVNpemUgPSB0cnVlO1xuICAgICAgICAgICAgdG1wUmVzdWx0ID0gbmV3IFVpbnQ4QXJyYXkobGVuICogMyk7XG4gICAgICAgICAgICB0bXBSZXN1bHQuc2V0KHJlc3VsdCk7XG4gICAgICAgICAgICByZXN1bHQgPSB0bXBSZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdFtwb3NdID0gKDB4ZSAvKjBiMTExMCovIDw8IDQpIHwgKHBvaW50ID4+IDEyKTtcbiAgICAgICAgcmVzdWx0Wyhwb3MgPSAocG9zICsgMSkgfCAwKV0gPSAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKChwb2ludCA+PiA2KSAmIDB4M2YpIC8qMGIwMDExMTExMSovO1xuICAgICAgICByZXN1bHRbKHBvcyA9IChwb3MgKyAxKSB8IDApXSA9ICgweDIgLyowYjEwKi8gPDwgNikgfCAocG9pbnQgJiAweDNmKSAvKjBiMDAxMTExMTEqLztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFVpbnQ4QXJyYXkgPyByZXN1bHQuc3ViYXJyYXkoMCwgcG9zKSA6IHJlc3VsdC5zbGljZSgwLCBwb3MpO1xuICB9XG5cbiAgcHVibGljIGVuY29kZUludG8oaW5wdXRTdHJpbmc6IHN0cmluZywgdThBcnI6IFVpbnQ4QXJyYXkpOiB7IHdyaXR0ZW46IG51bWJlcjsgcmVhZDogbnVtYmVyIH0ge1xuICAgIGNvbnN0IGVuY29kZWRTdHJpbmcgPSBpbnB1dFN0cmluZyA9PT0gdm9pZCAwID8gJycgOiAoJycgKyBpbnB1dFN0cmluZykucmVwbGFjZShlbmNvZGVyUmVnZXhwLCBlbmNvZGVyUmVwbGFjZXIpO1xuICAgIGxldCBsZW4gPSBlbmNvZGVkU3RyaW5nLmxlbmd0aCB8IDAsXG4gICAgICBpID0gMCxcbiAgICAgIGNoYXIgPSAwLFxuICAgICAgcmVhZCA9IDA7XG4gICAgY29uc3QgdThBcnJMZW4gPSB1OEFyci5sZW5ndGggfCAwO1xuICAgIGNvbnN0IGlucHV0TGVuZ3RoID0gaW5wdXRTdHJpbmcubGVuZ3RoIHwgMDtcbiAgICBpZiAodThBcnJMZW4gPCBsZW4pIGxlbiA9IHU4QXJyTGVuO1xuICAgIHB1dENoYXJzOiB7XG4gICAgICBmb3IgKDsgaSA8IGxlbjsgaSA9IChpICsgMSkgfCAwKSB7XG4gICAgICAgIGNoYXIgPSBlbmNvZGVkU3RyaW5nLmNoYXJDb2RlQXQoaSkgfCAwO1xuICAgICAgICBzd2l0Y2ggKGNoYXIgPj4gNCkge1xuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICByZWFkID0gKHJlYWQgKyAxKSB8IDA7XG4gICAgICAgICAgLy8gZXh0ZW5zaW9uIHBvaW50czpcbiAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICAgIGlmICgoKGkgKyAxKSB8IDApIDwgdThBcnJMZW4pIHtcbiAgICAgICAgICAgICAgcmVhZCA9IChyZWFkICsgMSkgfCAwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgICAgaWYgKCgoaSArIDIpIHwgMCkgPCB1OEFyckxlbikge1xuICAgICAgICAgICAgICAvL2lmICghKGNoYXIgPT09IDB4RUYgJiYgZW5jb2RlZFN0cmluZy5zdWJzdHIoaSsxfDAsMikgPT09IFwiXFx4QkZcXHhCRFwiKSlcbiAgICAgICAgICAgICAgcmVhZCA9IChyZWFkICsgMSkgfCAwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgICAgaWYgKCgoaSArIDMpIHwgMCkgPCB1OEFyckxlbikge1xuICAgICAgICAgICAgICByZWFkID0gKHJlYWQgKyAxKSB8IDA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhayBwdXRDaGFycztcbiAgICAgICAgfVxuICAgICAgICAvL3JlYWQgPSByZWFkICsgKChjaGFyID4+IDYpICE9PSAyKSB8MDtcbiAgICAgICAgdThBcnJbaV0gPSBjaGFyO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyB3cml0dGVuOiBpLCByZWFkOiBpbnB1dExlbmd0aCA8IHJlYWQgPyBpbnB1dExlbmd0aCA6IHJlYWQgfTtcbiAgfVxufVxuXG4vKipcbiAqIEVuY29kZSBhIFVURi04IHN0cmluZyBpbnRvIGEgVWludDhBcnJheVxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlKHM6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gVGV4dEVuY29kZXIucHJvdG90eXBlLmVuY29kZShzKTtcbn1cblxuLyoqXG4gKiBEZWNvZGUgYSBVaW50OEFycmF5IGludG8gYSBVVEYtOCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZShhOiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgcmV0dXJuIFRleHREZWNvZGVyLnByb3RvdHlwZS5kZWNvZGUoYSk7XG59XG4iLCJpbXBvcnQgeyBUZW1wb3JhbEZhaWx1cmUgfSBmcm9tICcuL2ZhaWx1cmUnO1xuaW1wb3J0IHsgU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IgfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5cbi8qKlxuICogVGhyb3duIGZyb20gY29kZSB0aGF0IHJlY2VpdmVzIGEgdmFsdWUgdGhhdCBpcyB1bmV4cGVjdGVkIG9yIHRoYXQgaXQncyB1bmFibGUgdG8gaGFuZGxlLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1ZhbHVlRXJyb3InKVxuZXhwb3J0IGNsYXNzIFZhbHVlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgY2F1c2U/OiB1bmtub3duXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gdW5kZWZpbmVkKTtcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgUGF5bG9hZCBDb252ZXJ0ZXIgaXMgbWlzY29uZmlndXJlZC5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdQYXlsb2FkQ29udmVydGVyRXJyb3InKVxuZXhwb3J0IGNsYXNzIFBheWxvYWRDb252ZXJ0ZXJFcnJvciBleHRlbmRzIFZhbHVlRXJyb3Ige31cblxuLyoqXG4gKiBVc2VkIGluIGRpZmZlcmVudCBwYXJ0cyBvZiB0aGUgU0RLIHRvIG5vdGUgdGhhdCBzb21ldGhpbmcgdW5leHBlY3RlZCBoYXMgaGFwcGVuZWQuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignSWxsZWdhbFN0YXRlRXJyb3InKVxuZXhwb3J0IGNsYXNzIElsbGVnYWxTdGF0ZUVycm9yIGV4dGVuZHMgRXJyb3Ige31cblxuLyoqXG4gKiBUaGlzIGV4Y2VwdGlvbiBpcyB0aHJvd24gaW4gdGhlIGZvbGxvd2luZyBjYXNlczpcbiAqICAtIFdvcmtmbG93IHdpdGggdGhlIHNhbWUgV29ya2Zsb3cgSWQgaXMgY3VycmVudGx5IHJ1bm5pbmdcbiAqICAtIFRoZXJlIGlzIGEgY2xvc2VkIFdvcmtmbG93IHdpdGggdGhlIHNhbWUgV29ya2Zsb3cgSWQgYW5kIHRoZSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLndvcmtmbG93SWRSZXVzZVBvbGljeX1cbiAqICAgIGlzIGBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfUkVKRUNUX0RVUExJQ0FURWBcbiAqICAtIFRoZXJlIGlzIGNsb3NlZCBXb3JrZmxvdyBpbiB0aGUgYENvbXBsZXRlZGAgc3RhdGUgd2l0aCB0aGUgc2FtZSBXb3JrZmxvdyBJZCBhbmQgdGhlIHtAbGluayBXb3JrZmxvd09wdGlvbnMud29ya2Zsb3dJZFJldXNlUG9saWN5fVxuICogICAgaXMgYFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9BTExPV19EVVBMSUNBVEVfRkFJTEVEX09OTFlgXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignV29ya2Zsb3dFeGVjdXRpb25BbHJlYWR5U3RhcnRlZEVycm9yJylcbmV4cG9ydCBjbGFzcyBXb3JrZmxvd0V4ZWN1dGlvbkFscmVhZHlTdGFydGVkRXJyb3IgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IHdvcmtmbG93SWQ6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgd29ya2Zsb3dUeXBlOiBzdHJpbmdcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIFdvcmtmbG93IHdpdGggdGhlIGdpdmVuIElkIGlzIG5vdCBrbm93biB0byBUZW1wb3JhbCBTZXJ2ZXIuXG4gKiBJdCBjb3VsZCBiZSBiZWNhdXNlOlxuICogLSBJZCBwYXNzZWQgaXMgaW5jb3JyZWN0XG4gKiAtIFdvcmtmbG93IGlzIGNsb3NlZCAoZm9yIHNvbWUgY2FsbHMsIGUuZy4gYHRlcm1pbmF0ZWApXG4gKiAtIFdvcmtmbG93IHdhcyBkZWxldGVkIGZyb20gdGhlIFNlcnZlciBhZnRlciByZWFjaGluZyBpdHMgcmV0ZW50aW9uIGxpbWl0XG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignV29ya2Zsb3dOb3RGb3VuZEVycm9yJylcbmV4cG9ydCBjbGFzcyBXb3JrZmxvd05vdEZvdW5kRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgd29ya2Zsb3dJZDogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSBydW5JZDogc3RyaW5nIHwgdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gdGhlIHNwZWNpZmllZCBuYW1lc3BhY2UgaXMgbm90IGtub3duIHRvIFRlbXBvcmFsIFNlcnZlci5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdOYW1lc3BhY2VOb3RGb3VuZEVycm9yJylcbmV4cG9ydCBjbGFzcyBOYW1lc3BhY2VOb3RGb3VuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgbmFtZXNwYWNlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihgTmFtZXNwYWNlIG5vdCBmb3VuZDogJyR7bmFtZXNwYWNlfSdgKTtcbiAgfVxufVxuIiwiaW1wb3J0IHR5cGUgeyB0ZW1wb3JhbCB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IGNoZWNrRXh0ZW5kcywgZXJyb3JNZXNzYWdlLCBpc1JlY29yZCwgU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IgfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5cbmV4cG9ydCBjb25zdCBGQUlMVVJFX1NPVVJDRSA9ICdUeXBlU2NyaXB0U0RLJztcbmV4cG9ydCB0eXBlIFByb3RvRmFpbHVyZSA9IHRlbXBvcmFsLmFwaS5mYWlsdXJlLnYxLklGYWlsdXJlO1xuXG4vLyBBdm9pZCBpbXBvcnRpbmcgdGhlIHByb3RvIGltcGxlbWVudGF0aW9uIHRvIHJlZHVjZSB3b3JrZmxvdyBidW5kbGUgc2l6ZVxuLy8gQ29waWVkIGZyb20gdGVtcG9yYWwuYXBpLmVudW1zLnYxLlRpbWVvdXRUeXBlXG5leHBvcnQgZW51bSBUaW1lb3V0VHlwZSB7XG4gIFRJTUVPVVRfVFlQRV9VTlNQRUNJRklFRCA9IDAsXG4gIFRJTUVPVVRfVFlQRV9TVEFSVF9UT19DTE9TRSA9IDEsXG4gIFRJTUVPVVRfVFlQRV9TQ0hFRFVMRV9UT19TVEFSVCA9IDIsXG4gIFRJTUVPVVRfVFlQRV9TQ0hFRFVMRV9UT19DTE9TRSA9IDMsXG4gIFRJTUVPVVRfVFlQRV9IRUFSVEJFQVQgPSA0LFxufVxuXG5jaGVja0V4dGVuZHM8dGVtcG9yYWwuYXBpLmVudW1zLnYxLlRpbWVvdXRUeXBlLCBUaW1lb3V0VHlwZT4oKTtcbmNoZWNrRXh0ZW5kczxUaW1lb3V0VHlwZSwgdGVtcG9yYWwuYXBpLmVudW1zLnYxLlRpbWVvdXRUeXBlPigpO1xuXG4vLyBBdm9pZCBpbXBvcnRpbmcgdGhlIHByb3RvIGltcGxlbWVudGF0aW9uIHRvIHJlZHVjZSB3b3JrZmxvdyBidW5kbGUgc2l6ZVxuLy8gQ29waWVkIGZyb20gdGVtcG9yYWwuYXBpLmVudW1zLnYxLlJldHJ5U3RhdGVcbmV4cG9ydCBlbnVtIFJldHJ5U3RhdGUge1xuICBSRVRSWV9TVEFURV9VTlNQRUNJRklFRCA9IDAsXG4gIFJFVFJZX1NUQVRFX0lOX1BST0dSRVNTID0gMSxcbiAgUkVUUllfU1RBVEVfTk9OX1JFVFJZQUJMRV9GQUlMVVJFID0gMixcbiAgUkVUUllfU1RBVEVfVElNRU9VVCA9IDMsXG4gIFJFVFJZX1NUQVRFX01BWElNVU1fQVRURU1QVFNfUkVBQ0hFRCA9IDQsXG4gIFJFVFJZX1NUQVRFX1JFVFJZX1BPTElDWV9OT1RfU0VUID0gNSxcbiAgUkVUUllfU1RBVEVfSU5URVJOQUxfU0VSVkVSX0VSUk9SID0gNixcbiAgUkVUUllfU1RBVEVfQ0FOQ0VMX1JFUVVFU1RFRCA9IDcsXG59XG5cbmNoZWNrRXh0ZW5kczx0ZW1wb3JhbC5hcGkuZW51bXMudjEuUmV0cnlTdGF0ZSwgUmV0cnlTdGF0ZT4oKTtcbmNoZWNrRXh0ZW5kczxSZXRyeVN0YXRlLCB0ZW1wb3JhbC5hcGkuZW51bXMudjEuUmV0cnlTdGF0ZT4oKTtcblxuZXhwb3J0IHR5cGUgV29ya2Zsb3dFeGVjdXRpb24gPSB0ZW1wb3JhbC5hcGkuY29tbW9uLnYxLklXb3JrZmxvd0V4ZWN1dGlvbjtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGZhaWx1cmVzIHRoYXQgY2FuIGNyb3NzIFdvcmtmbG93IGFuZCBBY3Rpdml0eSBib3VuZGFyaWVzLlxuICpcbiAqICoqTmV2ZXIgZXh0ZW5kIHRoaXMgY2xhc3Mgb3IgYW55IG9mIGl0cyBjaGlsZHJlbi4qKlxuICpcbiAqIFRoZSBvbmx5IGNoaWxkIGNsYXNzIHlvdSBzaG91bGQgZXZlciB0aHJvdyBmcm9tIHlvdXIgY29kZSBpcyB7QGxpbmsgQXBwbGljYXRpb25GYWlsdXJlfS5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdUZW1wb3JhbEZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIFRlbXBvcmFsRmFpbHVyZSBleHRlbmRzIEVycm9yIHtcbiAgLyoqXG4gICAqIFRoZSBvcmlnaW5hbCBmYWlsdXJlIHRoYXQgY29uc3RydWN0ZWQgdGhpcyBlcnJvci5cbiAgICpcbiAgICogT25seSBwcmVzZW50IGlmIHRoaXMgZXJyb3Igd2FzIGdlbmVyYXRlZCBmcm9tIGFuIGV4dGVybmFsIG9wZXJhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBmYWlsdXJlPzogUHJvdG9GYWlsdXJlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U/OiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIHB1YmxpYyByZWFkb25seSBjYXVzZT86IEVycm9yXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gdW5kZWZpbmVkKTtcbiAgfVxufVxuXG4vKiogRXhjZXB0aW9ucyBvcmlnaW5hdGVkIGF0IHRoZSBUZW1wb3JhbCBzZXJ2aWNlLiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdTZXJ2ZXJGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBTZXJ2ZXJGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSBub25SZXRyeWFibGU6IGJvb2xlYW4sXG4gICAgY2F1c2U/OiBFcnJvclxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlLCBjYXVzZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBgQXBwbGljYXRpb25GYWlsdXJlYHMgYXJlIHVzZWQgdG8gY29tbXVuaWNhdGUgYXBwbGljYXRpb24tc3BlY2lmaWMgZmFpbHVyZXMgaW4gV29ya2Zsb3dzIGFuZCBBY3Rpdml0aWVzLlxuICpcbiAqIFRoZSB7QGxpbmsgdHlwZX0gcHJvcGVydHkgaXMgbWF0Y2hlZCBhZ2FpbnN0IHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfSB0byBkZXRlcm1pbmUgaWYgYW4gaW5zdGFuY2VcbiAqIG9mIHRoaXMgZXJyb3IgaXMgcmV0cnlhYmxlLiBBbm90aGVyIHdheSB0byBhdm9pZCByZXRyeWluZyBpcyBieSBzZXR0aW5nIHRoZSB7QGxpbmsgbm9uUmV0cnlhYmxlfSBmbGFnIHRvIGB0cnVlYC5cbiAqXG4gKiBJbiBXb3JrZmxvd3MsIGlmIHlvdSB0aHJvdyBhIG5vbi1gQXBwbGljYXRpb25GYWlsdXJlYCwgdGhlIFdvcmtmbG93IFRhc2sgd2lsbCBmYWlsIGFuZCBiZSByZXRyaWVkLiBJZiB5b3UgdGhyb3cgYW5cbiAqIGBBcHBsaWNhdGlvbkZhaWx1cmVgLCB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uIHdpbGwgZmFpbC5cbiAqXG4gKiBJbiBBY3Rpdml0aWVzLCB5b3UgY2FuIGVpdGhlciB0aHJvdyBhbiBgQXBwbGljYXRpb25GYWlsdXJlYCBvciBhbm90aGVyIGBFcnJvcmAgdG8gZmFpbCB0aGUgQWN0aXZpdHkgVGFzay4gSW4gdGhlXG4gKiBsYXR0ZXIgY2FzZSwgdGhlIGBFcnJvcmAgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAuIFRoZSBjb252ZXJzaW9uIGlzIGRvbmUgYXMgZm9sbG93aW5nOlxuICpcbiAqIC0gYHR5cGVgIGlzIHNldCB0byBgZXJyb3IuY29uc3RydWN0b3I/Lm5hbWUgPz8gZXJyb3IubmFtZWBcbiAqIC0gYG1lc3NhZ2VgIGlzIHNldCB0byBgZXJyb3IubWVzc2FnZWBcbiAqIC0gYG5vblJldHJ5YWJsZWAgaXMgc2V0IHRvIGZhbHNlXG4gKiAtIGBkZXRhaWxzYCBhcmUgc2V0IHRvIG51bGxcbiAqIC0gc3RhY2sgdHJhY2UgaXMgY29waWVkIGZyb20gdGhlIG9yaWdpbmFsIGVycm9yXG4gKlxuICogV2hlbiBhbiB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2NvbmNlcHRzL3doYXQtaXMtYW4tYWN0aXZpdHktZXhlY3V0aW9uIHwgQWN0aXZpdHkgRXhlY3V0aW9ufSBmYWlscywgdGhlXG4gKiBgQXBwbGljYXRpb25GYWlsdXJlYCBmcm9tIHRoZSBsYXN0IEFjdGl2aXR5IFRhc2sgd2lsbCBiZSB0aGUgYGNhdXNlYCBvZiB0aGUge0BsaW5rIEFjdGl2aXR5RmFpbHVyZX0gdGhyb3duIGluIHRoZVxuICogV29ya2Zsb3cuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignQXBwbGljYXRpb25GYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBBcHBsaWNhdGlvbkZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICAvKipcbiAgICogQWx0ZXJuYXRpdmVseSwgdXNlIHtAbGluayBmcm9tRXJyb3J9IG9yIHtAbGluayBjcmVhdGV9LlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZT86IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgcHVibGljIHJlYWRvbmx5IHR5cGU/OiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIHB1YmxpYyByZWFkb25seSBub25SZXRyeWFibGU/OiBib29sZWFuIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgZGV0YWlscz86IHVua25vd25bXSB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgY2F1c2U/OiBFcnJvclxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlLCBjYXVzZSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBBcHBsaWNhdGlvbkZhaWx1cmVgIGZyb20gYW4gRXJyb3Igb2JqZWN0LlxuICAgKlxuICAgKiBGaXJzdCBjYWxscyB7QGxpbmsgZW5zdXJlQXBwbGljYXRpb25GYWlsdXJlIHwgYGVuc3VyZUFwcGxpY2F0aW9uRmFpbHVyZShlcnJvcilgfSBhbmQgdGhlbiBvdmVycmlkZXMgYW55IGZpZWxkc1xuICAgKiBwcm92aWRlZCBpbiBgb3ZlcnJpZGVzYC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbUVycm9yKGVycm9yOiBFcnJvciB8IHVua25vd24sIG92ZXJyaWRlcz86IEFwcGxpY2F0aW9uRmFpbHVyZU9wdGlvbnMpOiBBcHBsaWNhdGlvbkZhaWx1cmUge1xuICAgIGNvbnN0IGZhaWx1cmUgPSBlbnN1cmVBcHBsaWNhdGlvbkZhaWx1cmUoZXJyb3IpO1xuICAgIE9iamVjdC5hc3NpZ24oZmFpbHVyZSwgb3ZlcnJpZGVzKTtcbiAgICByZXR1cm4gZmFpbHVyZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYEFwcGxpY2F0aW9uRmFpbHVyZWAuXG4gICAqXG4gICAqIEJ5IGRlZmF1bHQsIHdpbGwgYmUgcmV0cnlhYmxlICh1bmxlc3MgaXRzIGB0eXBlYCBpcyBpbmNsdWRlZCBpbiB7QGxpbmsgUmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlc30pLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjcmVhdGUob3B0aW9uczogQXBwbGljYXRpb25GYWlsdXJlT3B0aW9ucyk6IEFwcGxpY2F0aW9uRmFpbHVyZSB7XG4gICAgY29uc3QgeyBtZXNzYWdlLCB0eXBlLCBub25SZXRyeWFibGUgPSBmYWxzZSwgZGV0YWlscywgY2F1c2UgfSA9IG9wdGlvbnM7XG4gICAgcmV0dXJuIG5ldyB0aGlzKG1lc3NhZ2UsIHR5cGUsIG5vblJldHJ5YWJsZSwgZGV0YWlscywgY2F1c2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIG5ldyBgQXBwbGljYXRpb25GYWlsdXJlYCB3aXRoIHRoZSB7QGxpbmsgbm9uUmV0cnlhYmxlfSBmbGFnIHNldCB0byBmYWxzZS4gTm90ZSB0aGF0IHRoaXMgZXJyb3Igd2lsbCBzdGlsbFxuICAgKiBub3QgYmUgcmV0cmllZCBpZiBpdHMgYHR5cGVgIGlzIGluY2x1ZGVkIGluIHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfS5cbiAgICpcbiAgICogQHBhcmFtIG1lc3NhZ2UgT3B0aW9uYWwgZXJyb3IgbWVzc2FnZVxuICAgKiBAcGFyYW0gdHlwZSBPcHRpb25hbCBlcnJvciB0eXBlICh1c2VkIGJ5IHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfSlcbiAgICogQHBhcmFtIGRldGFpbHMgT3B0aW9uYWwgZGV0YWlscyBhYm91dCB0aGUgZmFpbHVyZS4gU2VyaWFsaXplZCBieSB0aGUgV29ya2VyJ3Mge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJ9LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZXRyeWFibGUobWVzc2FnZT86IHN0cmluZyB8IG51bGwsIHR5cGU/OiBzdHJpbmcgfCBudWxsLCAuLi5kZXRhaWxzOiB1bmtub3duW10pOiBBcHBsaWNhdGlvbkZhaWx1cmUge1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlLCB0eXBlID8/ICdFcnJvcicsIGZhbHNlLCBkZXRhaWxzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBuZXcgYEFwcGxpY2F0aW9uRmFpbHVyZWAgd2l0aCB0aGUge0BsaW5rIG5vblJldHJ5YWJsZX0gZmxhZyBzZXQgdG8gdHJ1ZS5cbiAgICpcbiAgICogV2hlbiB0aHJvd24gZnJvbSBhbiBBY3Rpdml0eSBvciBXb3JrZmxvdywgdGhlIEFjdGl2aXR5IG9yIFdvcmtmbG93IHdpbGwgbm90IGJlIHJldHJpZWQgKGV2ZW4gaWYgYHR5cGVgIGlzIG5vdFxuICAgKiBsaXN0ZWQgaW4ge0BsaW5rIFJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXN9KS5cbiAgICpcbiAgICogQHBhcmFtIG1lc3NhZ2UgT3B0aW9uYWwgZXJyb3IgbWVzc2FnZVxuICAgKiBAcGFyYW0gdHlwZSBPcHRpb25hbCBlcnJvciB0eXBlXG4gICAqIEBwYXJhbSBkZXRhaWxzIE9wdGlvbmFsIGRldGFpbHMgYWJvdXQgdGhlIGZhaWx1cmUuIFNlcmlhbGl6ZWQgYnkgdGhlIFdvcmtlcidzIHtAbGluayBQYXlsb2FkQ29udmVydGVyfS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbm9uUmV0cnlhYmxlKG1lc3NhZ2U/OiBzdHJpbmcgfCBudWxsLCB0eXBlPzogc3RyaW5nIHwgbnVsbCwgLi4uZGV0YWlsczogdW5rbm93bltdKTogQXBwbGljYXRpb25GYWlsdXJlIHtcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSwgdHlwZSA/PyAnRXJyb3InLCB0cnVlLCBkZXRhaWxzKTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFwcGxpY2F0aW9uRmFpbHVyZU9wdGlvbnMge1xuICAvKipcbiAgICogRXJyb3IgbWVzc2FnZVxuICAgKi9cbiAgbWVzc2FnZT86IHN0cmluZztcblxuICAvKipcbiAgICogRXJyb3IgdHlwZSAodXNlZCBieSB7QGxpbmsgUmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlc30pXG4gICAqL1xuICB0eXBlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBjdXJyZW50IEFjdGl2aXR5IG9yIFdvcmtmbG93IGNhbiBiZSByZXRyaWVkXG4gICAqXG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBub25SZXRyeWFibGU/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBEZXRhaWxzIGFib3V0IHRoZSBmYWlsdXJlLiBTZXJpYWxpemVkIGJ5IHRoZSBXb3JrZXIncyB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn0uXG4gICAqL1xuICBkZXRhaWxzPzogdW5rbm93bltdO1xuXG4gIC8qKlxuICAgKiBDYXVzZSBvZiB0aGUgZmFpbHVyZVxuICAgKi9cbiAgY2F1c2U/OiBFcnJvcjtcbn1cblxuLyoqXG4gKiBUaGlzIGVycm9yIGlzIHRocm93biB3aGVuIENhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuIFRvIGFsbG93IENhbmNlbGxhdGlvbiB0byBoYXBwZW4sIGxldCBpdCBwcm9wYWdhdGUuIFRvXG4gKiBpZ25vcmUgQ2FuY2VsbGF0aW9uLCBjYXRjaCBpdCBhbmQgY29udGludWUgZXhlY3V0aW5nLiBOb3RlIHRoYXQgQ2FuY2VsbGF0aW9uIGNhbiBvbmx5IGJlIHJlcXVlc3RlZCBhIHNpbmdsZSB0aW1lLCBzb1xuICogeW91ciBXb3JrZmxvdy9BY3Rpdml0eSBFeGVjdXRpb24gd2lsbCBub3QgcmVjZWl2ZSBmdXJ0aGVyIENhbmNlbGxhdGlvbiByZXF1ZXN0cy5cbiAqXG4gKiBXaGVuIGEgV29ya2Zsb3cgb3IgQWN0aXZpdHkgaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGNhbmNlbGxlZCwgYSBgQ2FuY2VsbGVkRmFpbHVyZWAgd2lsbCBiZSB0aGUgYGNhdXNlYC5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdDYW5jZWxsZWRGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBDYW5jZWxsZWRGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSBkZXRhaWxzOiB1bmtub3duW10gPSBbXSxcbiAgICBjYXVzZT86IEVycm9yXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UsIGNhdXNlKTtcbiAgfVxufVxuXG4vKipcbiAqIFVzZWQgYXMgdGhlIGBjYXVzZWAgd2hlbiBhIFdvcmtmbG93IGhhcyBiZWVuIHRlcm1pbmF0ZWRcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdUZXJtaW5hdGVkRmFpbHVyZScpXG5leHBvcnQgY2xhc3MgVGVybWluYXRlZEZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsIGNhdXNlPzogRXJyb3IpIHtcbiAgICBzdXBlcihtZXNzYWdlLCBjYXVzZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBVc2VkIHRvIHJlcHJlc2VudCB0aW1lb3V0cyBvZiBBY3Rpdml0aWVzIGFuZCBXb3JrZmxvd3NcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdUaW1lb3V0RmFpbHVyZScpXG5leHBvcnQgY2xhc3MgVGltZW91dEZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcHVibGljIHJlYWRvbmx5IGxhc3RIZWFydGJlYXREZXRhaWxzOiB1bmtub3duLFxuICAgIHB1YmxpYyByZWFkb25seSB0aW1lb3V0VHlwZTogVGltZW91dFR5cGVcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCBhbiBBY3Rpdml0eSBmYWlsdXJlLiBBbHdheXMgY29udGFpbnMgdGhlIG9yaWdpbmFsIHJlYXNvbiBmb3IgdGhlIGZhaWx1cmUgYXMgaXRzIGBjYXVzZWAuXG4gKiBGb3IgZXhhbXBsZSwgaWYgYW4gQWN0aXZpdHkgdGltZWQgb3V0LCB0aGUgY2F1c2Ugd2lsbCBiZSBhIHtAbGluayBUaW1lb3V0RmFpbHVyZX0uXG4gKlxuICogVGhpcyBleGNlcHRpb24gaXMgZXhwZWN0ZWQgdG8gYmUgdGhyb3duIG9ubHkgYnkgdGhlIGZyYW1ld29yayBjb2RlLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0FjdGl2aXR5RmFpbHVyZScpXG5leHBvcnQgY2xhc3MgQWN0aXZpdHlGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgYWN0aXZpdHlUeXBlOiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IGFjdGl2aXR5SWQ6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgcmV0cnlTdGF0ZTogUmV0cnlTdGF0ZSxcbiAgICBwdWJsaWMgcmVhZG9ubHkgaWRlbnRpdHk6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBjYXVzZT86IEVycm9yXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UsIGNhdXNlKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IGEgQ2hpbGQgV29ya2Zsb3cgZmFpbHVyZS4gQWx3YXlzIGNvbnRhaW5zIHRoZSByZWFzb24gZm9yIHRoZSBmYWlsdXJlIGFzIGl0cyB7QGxpbmsgY2F1c2V9LlxuICogRm9yIGV4YW1wbGUsIGlmIHRoZSBDaGlsZCB3YXMgVGVybWluYXRlZCwgdGhlIGBjYXVzZWAgaXMgYSB7QGxpbmsgVGVybWluYXRlZEZhaWx1cmV9LlxuICpcbiAqIFRoaXMgZXhjZXB0aW9uIGlzIGV4cGVjdGVkIHRvIGJlIHRocm93biBvbmx5IGJ5IHRoZSBmcmFtZXdvcmsgY29kZS5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdDaGlsZFdvcmtmbG93RmFpbHVyZScpXG5leHBvcnQgY2xhc3MgQ2hpbGRXb3JrZmxvd0ZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHJlYWRvbmx5IG5hbWVzcGFjZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSBleGVjdXRpb246IFdvcmtmbG93RXhlY3V0aW9uLFxuICAgIHB1YmxpYyByZWFkb25seSB3b3JrZmxvd1R5cGU6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgcmV0cnlTdGF0ZTogUmV0cnlTdGF0ZSxcbiAgICBjYXVzZT86IEVycm9yXG4gICkge1xuICAgIHN1cGVyKCdDaGlsZCBXb3JrZmxvdyBleGVjdXRpb24gZmFpbGVkJywgY2F1c2UpO1xuICB9XG59XG5cbi8qKlxuICogSWYgYGVycm9yYCBpcyBhbHJlYWR5IGFuIGBBcHBsaWNhdGlvbkZhaWx1cmVgLCByZXR1cm5zIGBlcnJvcmAuXG4gKlxuICogT3RoZXJ3aXNlLCBjb252ZXJ0cyBgZXJyb3JgIGludG8gYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAgd2l0aDpcbiAqXG4gKiAtIGBtZXNzYWdlYDogYGVycm9yLm1lc3NhZ2VgIG9yIGBTdHJpbmcoZXJyb3IpYFxuICogLSBgdHlwZWA6IGBlcnJvci5jb25zdHJ1Y3Rvci5uYW1lYCBvciBgZXJyb3IubmFtZWBcbiAqIC0gYHN0YWNrYDogYGVycm9yLnN0YWNrYCBvciBgJydgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVBcHBsaWNhdGlvbkZhaWx1cmUoZXJyb3I6IHVua25vd24pOiBBcHBsaWNhdGlvbkZhaWx1cmUge1xuICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBBcHBsaWNhdGlvbkZhaWx1cmUpIHtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH1cblxuICBjb25zdCBtZXNzYWdlID0gKGlzUmVjb3JkKGVycm9yKSAmJiBTdHJpbmcoZXJyb3IubWVzc2FnZSkpIHx8IFN0cmluZyhlcnJvcik7XG4gIGNvbnN0IHR5cGUgPSAoaXNSZWNvcmQoZXJyb3IpICYmIChlcnJvci5jb25zdHJ1Y3Rvcj8ubmFtZSA/PyBlcnJvci5uYW1lKSkgfHwgdW5kZWZpbmVkO1xuICBjb25zdCBmYWlsdXJlID0gQXBwbGljYXRpb25GYWlsdXJlLmNyZWF0ZSh7IG1lc3NhZ2UsIHR5cGUsIG5vblJldHJ5YWJsZTogZmFsc2UgfSk7XG4gIGZhaWx1cmUuc3RhY2sgPSAoaXNSZWNvcmQoZXJyb3IpICYmIFN0cmluZyhlcnJvci5zdGFjaykpIHx8ICcnO1xuICByZXR1cm4gZmFpbHVyZTtcbn1cblxuLyoqXG4gKiBJZiBgZXJyYCBpcyBhbiBFcnJvciBpdCBpcyB0dXJuZWQgaW50byBhbiBgQXBwbGljYXRpb25GYWlsdXJlYC5cbiAqXG4gKiBJZiBgZXJyYCB3YXMgYWxyZWFkeSBhIGBUZW1wb3JhbEZhaWx1cmVgLCByZXR1cm5zIHRoZSBvcmlnaW5hbCBlcnJvci5cbiAqXG4gKiBPdGhlcndpc2UgcmV0dXJucyBhbiBgQXBwbGljYXRpb25GYWlsdXJlYCB3aXRoIGBTdHJpbmcoZXJyKWAgYXMgdGhlIG1lc3NhZ2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVUZW1wb3JhbEZhaWx1cmUoZXJyOiB1bmtub3duKTogVGVtcG9yYWxGYWlsdXJlIHtcbiAgaWYgKGVyciBpbnN0YW5jZW9mIFRlbXBvcmFsRmFpbHVyZSkge1xuICAgIHJldHVybiBlcnI7XG4gIH1cbiAgcmV0dXJuIGVuc3VyZUFwcGxpY2F0aW9uRmFpbHVyZShlcnIpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgcm9vdCBjYXVzZSBtZXNzYWdlIG9mIGdpdmVuIGBlcnJvcmAuXG4gKlxuICogSW4gY2FzZSBgZXJyb3JgIGlzIGEge0BsaW5rIFRlbXBvcmFsRmFpbHVyZX0sIHJlY3Vyc2UgdGhlIGBjYXVzZWAgY2hhaW4gYW5kIHJldHVybiB0aGUgcm9vdCBgY2F1c2UubWVzc2FnZWAuXG4gKiBPdGhlcndpc2UsIHJldHVybiBgZXJyb3IubWVzc2FnZWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb290Q2F1c2UoZXJyb3I6IHVua25vd24pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBUZW1wb3JhbEZhaWx1cmUpIHtcbiAgICByZXR1cm4gZXJyb3IuY2F1c2UgPyByb290Q2F1c2UoZXJyb3IuY2F1c2UpIDogZXJyb3IubWVzc2FnZTtcbiAgfVxuICByZXR1cm4gZXJyb3JNZXNzYWdlKGVycm9yKTtcbn1cbiIsIi8qKlxuICogQ29tbW9uIGxpYnJhcnkgZm9yIGNvZGUgdGhhdCdzIHVzZWQgYWNyb3NzIHRoZSBDbGllbnQsIFdvcmtlciwgYW5kL29yIFdvcmtmbG93XG4gKlxuICogQG1vZHVsZVxuICovXG5cbmltcG9ydCAqIGFzIGVuY29kaW5nIGZyb20gJy4vZW5jb2RpbmcnO1xuaW1wb3J0ICogYXMgaGVscGVycyBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5cbmV4cG9ydCAqIGZyb20gJy4vYWN0aXZpdHktb3B0aW9ucyc7XG5leHBvcnQgKiBmcm9tICcuL2NvbnZlcnRlci9kYXRhLWNvbnZlcnRlcic7XG5leHBvcnQgKiBmcm9tICcuL2NvbnZlcnRlci9mYWlsdXJlLWNvbnZlcnRlcic7XG5leHBvcnQgKiBmcm9tICcuL2NvbnZlcnRlci9wYXlsb2FkLWNvZGVjJztcbmV4cG9ydCAqIGZyb20gJy4vY29udmVydGVyL3BheWxvYWQtY29udmVydGVyJztcbmV4cG9ydCAqIGZyb20gJy4vY29udmVydGVyL3R5cGVzJztcbmV4cG9ydCAqIGZyb20gJy4vZGVwcmVjYXRlZC10aW1lJztcbmV4cG9ydCAqIGZyb20gJy4vZXJyb3JzJztcbmV4cG9ydCAqIGZyb20gJy4vZmFpbHVyZSc7XG5leHBvcnQgeyBIZWFkZXJzLCBOZXh0IH0gZnJvbSAnLi9pbnRlcmNlcHRvcnMnO1xuZXhwb3J0ICogZnJvbSAnLi9pbnRlcmZhY2VzJztcbmV4cG9ydCAqIGZyb20gJy4vbG9nZ2VyJztcbmV4cG9ydCAqIGZyb20gJy4vcmV0cnktcG9saWN5JztcbmV4cG9ydCB0eXBlIHsgVGltZXN0YW1wLCBEdXJhdGlvbiwgU3RyaW5nVmFsdWUgfSBmcm9tICcuL3RpbWUnO1xuZXhwb3J0ICogZnJvbSAnLi93b3JrZmxvdy1oYW5kbGUnO1xuZXhwb3J0ICogZnJvbSAnLi93b3JrZmxvdy1vcHRpb25zJztcbmV4cG9ydCAqIGZyb20gJy4vdmVyc2lvbmluZy1pbnRlbnQnO1xuXG4vKipcbiAqIEVuY29kZSBhIFVURi04IHN0cmluZyBpbnRvIGEgVWludDhBcnJheVxuICpcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1OChzOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIGVuY29kaW5nLmVuY29kZShzKTtcbn1cblxuLyoqXG4gKiBEZWNvZGUgYSBVaW50OEFycmF5IGludG8gYSBVVEYtOCBzdHJpbmdcbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyKGFycjogVWludDhBcnJheSk6IHN0cmluZyB7XG4gIHJldHVybiBlbmNvZGluZy5kZWNvZGUoYXJyKTtcbn1cblxuLyoqXG4gKiBHZXQgYGVycm9yLm1lc3NhZ2VgIChvciBgdW5kZWZpbmVkYCBpZiBub3QgcHJlc2VudClcbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JNZXNzYWdlKGVycm9yOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIGhlbHBlcnMuZXJyb3JNZXNzYWdlKGVycm9yKTtcbn1cblxuLyoqXG4gKiBHZXQgYGVycm9yLmNvZGVgIChvciBgdW5kZWZpbmVkYCBpZiBub3QgcHJlc2VudClcbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JDb2RlKGVycm9yOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIGhlbHBlcnMuZXJyb3JDb2RlKGVycm9yKTtcbn1cbiIsImltcG9ydCB7IEFueUZ1bmMsIE9taXRMYXN0UGFyYW0gfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5pbXBvcnQgeyBQYXlsb2FkIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuLyoqXG4gKiBUeXBlIG9mIHRoZSBuZXh0IGZ1bmN0aW9uIGZvciBhIGdpdmVuIGludGVyY2VwdG9yIGZ1bmN0aW9uXG4gKlxuICogQ2FsbGVkIGZyb20gYW4gaW50ZXJjZXB0b3IgdG8gY29udGludWUgdGhlIGludGVyY2VwdGlvbiBjaGFpblxuICovXG5leHBvcnQgdHlwZSBOZXh0PElGLCBGTiBleHRlbmRzIGtleW9mIElGPiA9IFJlcXVpcmVkPElGPltGTl0gZXh0ZW5kcyBBbnlGdW5jID8gT21pdExhc3RQYXJhbTxSZXF1aXJlZDxJRj5bRk5dPiA6IG5ldmVyO1xuXG4vKiogSGVhZGVycyBhcmUganVzdCBhIG1hcHBpbmcgb2YgaGVhZGVyIG5hbWUgdG8gUGF5bG9hZCAqL1xuZXhwb3J0IHR5cGUgSGVhZGVycyA9IFJlY29yZDxzdHJpbmcsIFBheWxvYWQ+O1xuXG4vKipcbiAqIENvbXBvc2UgYWxsIGludGVyY2VwdG9yIG1ldGhvZHMgaW50byBhIHNpbmdsZSBmdW5jdGlvbi5cbiAqXG4gKiBDYWxsaW5nIHRoZSBjb21wb3NlZCBmdW5jdGlvbiByZXN1bHRzIGluIGNhbGxpbmcgZWFjaCBvZiB0aGUgcHJvdmlkZWQgaW50ZXJjZXB0b3IsIGluIG9yZGVyIChmcm9tIHRoZSBmaXJzdCB0b1xuICogdGhlIGxhc3QpLCBmb2xsb3dlZCBieSB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gcHJvdmlkZWQgYXMgYXJndW1lbnQgdG8gYGNvbXBvc2VJbnRlcmNlcHRvcnMoKWAuXG4gKlxuICogQHBhcmFtIGludGVyY2VwdG9ycyBhIGxpc3Qgb2YgaW50ZXJjZXB0b3JzXG4gKiBAcGFyYW0gbWV0aG9kIHRoZSBuYW1lIG9mIHRoZSBpbnRlcmNlcHRvciBtZXRob2QgdG8gY29tcG9zZVxuICogQHBhcmFtIG5leHQgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIGF0IHRoZSBlbmQgb2YgdGhlIGludGVyY2VwdGlvbiBjaGFpblxuICovXG4vLyB0cy1wcnVuZS1pZ25vcmUtbmV4dCAoaW1wb3J0ZWQgdmlhIGxpYi9pbnRlcmNlcHRvcnMpXG5leHBvcnQgZnVuY3Rpb24gY29tcG9zZUludGVyY2VwdG9yczxJLCBNIGV4dGVuZHMga2V5b2YgST4oaW50ZXJjZXB0b3JzOiBJW10sIG1ldGhvZDogTSwgbmV4dDogTmV4dDxJLCBNPik6IE5leHQ8SSwgTT4ge1xuICBmb3IgKGxldCBpID0gaW50ZXJjZXB0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgY29uc3QgaW50ZXJjZXB0b3IgPSBpbnRlcmNlcHRvcnNbaV07XG4gICAgaWYgKGludGVyY2VwdG9yW21ldGhvZF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgcHJldiA9IG5leHQ7XG4gICAgICAvLyBXZSBsb3NlIHR5cGUgc2FmZXR5IGhlcmUgYmVjYXVzZSBUeXBlc2NyaXB0IGNhbid0IGRlZHVjZSB0aGF0IGludGVyY2VwdG9yW21ldGhvZF0gaXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnNcbiAgICAgIC8vIHRoZSBzYW1lIHR5cGUgYXMgTmV4dDxJLCBNPlxuICAgICAgbmV4dCA9ICgoaW5wdXQ6IGFueSkgPT4gKGludGVyY2VwdG9yW21ldGhvZF0gYXMgYW55KShpbnB1dCwgcHJldikpIGFzIGFueTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5leHQ7XG59XG4iLCJpbXBvcnQgdHlwZSB7IHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuXG5leHBvcnQgdHlwZSBQYXlsb2FkID0gdGVtcG9yYWwuYXBpLmNvbW1vbi52MS5JUGF5bG9hZDtcblxuLyoqIFR5cGUgdGhhdCBjYW4gYmUgcmV0dXJuZWQgZnJvbSBhIFdvcmtmbG93IGBleGVjdXRlYCBmdW5jdGlvbiAqL1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dSZXR1cm5UeXBlID0gUHJvbWlzZTxhbnk+O1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dVcGRhdGVUeXBlID0gKC4uLmFyZ3M6IGFueVtdKSA9PiBQcm9taXNlPGFueT4gfCBhbnk7XG5leHBvcnQgdHlwZSBXb3JrZmxvd1VwZGF0ZVZhbGlkYXRvclR5cGUgPSAoLi4uYXJnczogYW55W10pID0+IHZvaWQ7XG5leHBvcnQgdHlwZSBXb3JrZmxvd1VwZGF0ZUFubm90YXRlZFR5cGUgPSB7XG4gIGhhbmRsZXI6IFdvcmtmbG93VXBkYXRlVHlwZTtcbiAgdmFsaWRhdG9yPzogV29ya2Zsb3dVcGRhdGVWYWxpZGF0b3JUeXBlO1xuICBkZXNjcmlwdGlvbj86IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBXb3JrZmxvd1NpZ25hbFR5cGUgPSAoLi4uYXJnczogYW55W10pID0+IFByb21pc2U8dm9pZD4gfCB2b2lkO1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dTaWduYWxBbm5vdGF0ZWRUeXBlID0geyBoYW5kbGVyOiBXb3JrZmxvd1NpZ25hbFR5cGU7IGRlc2NyaXB0aW9uPzogc3RyaW5nIH07XG5leHBvcnQgdHlwZSBXb3JrZmxvd1F1ZXJ5VHlwZSA9ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55O1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dRdWVyeUFubm90YXRlZFR5cGUgPSB7IGhhbmRsZXI6IFdvcmtmbG93UXVlcnlUeXBlOyBkZXNjcmlwdGlvbj86IHN0cmluZyB9O1xuXG4vKipcbiAqIEJyb2FkIFdvcmtmbG93IGZ1bmN0aW9uIGRlZmluaXRpb24sIHNwZWNpZmljIFdvcmtmbG93cyB3aWxsIHR5cGljYWxseSB1c2UgYSBuYXJyb3dlciB0eXBlIGRlZmluaXRpb24sIGUuZzpcbiAqIGBgYHRzXG4gKiBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbXlXb3JrZmxvdyhhcmcxOiBudW1iZXIsIGFyZzI6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPjtcbiAqIGBgYFxuICovXG5leHBvcnQgdHlwZSBXb3JrZmxvdyA9ICguLi5hcmdzOiBhbnlbXSkgPT4gV29ya2Zsb3dSZXR1cm5UeXBlO1xuXG5kZWNsYXJlIGNvbnN0IGFyZ3NCcmFuZDogdW5pcXVlIHN5bWJvbDtcbmRlY2xhcmUgY29uc3QgcmV0QnJhbmQ6IHVuaXF1ZSBzeW1ib2w7XG5cbi8qKlxuICogQW4gaW50ZXJmYWNlIHJlcHJlc2VudGluZyBhIFdvcmtmbG93IHVwZGF0ZSBkZWZpbml0aW9uLCBhcyByZXR1cm5lZCBmcm9tIHtAbGluayBkZWZpbmVVcGRhdGV9XG4gKlxuICogQHJlbWFya3MgYEFyZ3NgIGNhbiBiZSB1c2VkIGZvciBwYXJhbWV0ZXIgdHlwZSBpbmZlcmVuY2UgaW4gaGFuZGxlciBmdW5jdGlvbnMgYW5kIFdvcmtmbG93SGFuZGxlIG1ldGhvZHMuXG4gKiBgTmFtZWAgY2FuIG9wdGlvbmFsbHkgYmUgc3BlY2lmaWVkIHdpdGggYSBzdHJpbmcgbGl0ZXJhbCB0eXBlIHRvIHByZXNlcnZlIHR5cGUtbGV2ZWwga25vd2xlZGdlIG9mIHRoZSB1cGRhdGUgbmFtZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBVcGRhdGVEZWZpbml0aW9uPFJldCwgQXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+IHtcbiAgdHlwZTogJ3VwZGF0ZSc7XG4gIG5hbWU6IE5hbWU7XG4gIC8qKlxuICAgKiBWaXJ0dWFsIHR5cGUgYnJhbmQgdG8gbWFpbnRhaW4gYSBkaXN0aW5jdGlvbiBiZXR3ZWVuIHtAbGluayBVcGRhdGVEZWZpbml0aW9ufSB0eXBlcyB3aXRoIGRpZmZlcmVudCBhcmdzLlxuICAgKiBUaGlzIGZpZWxkIGlzIG5vdCBwcmVzZW50IGF0IHJ1bi10aW1lLlxuICAgKi9cbiAgW2FyZ3NCcmFuZF06IEFyZ3M7XG4gIC8qKlxuICAgKiBWaXJ0dWFsIHR5cGUgYnJhbmQgdG8gbWFpbnRhaW4gYSBkaXN0aW5jdGlvbiBiZXR3ZWVuIHtAbGluayBVcGRhdGVEZWZpbml0aW9ufSB0eXBlcyB3aXRoIGRpZmZlcmVudCByZXR1cm4gdHlwZXMuXG4gICAqIFRoaXMgZmllbGQgaXMgbm90IHByZXNlbnQgYXQgcnVuLXRpbWUuXG4gICAqL1xuICBbcmV0QnJhbmRdOiBSZXQ7XG59XG5cbi8qKlxuICogQW4gaW50ZXJmYWNlIHJlcHJlc2VudGluZyBhIFdvcmtmbG93IHNpZ25hbCBkZWZpbml0aW9uLCBhcyByZXR1cm5lZCBmcm9tIHtAbGluayBkZWZpbmVTaWduYWx9XG4gKlxuICogQHJlbWFya3MgYEFyZ3NgIGNhbiBiZSB1c2VkIGZvciBwYXJhbWV0ZXIgdHlwZSBpbmZlcmVuY2UgaW4gaGFuZGxlciBmdW5jdGlvbnMgYW5kIFdvcmtmbG93SGFuZGxlIG1ldGhvZHMuXG4gKiBgTmFtZWAgY2FuIG9wdGlvbmFsbHkgYmUgc3BlY2lmaWVkIHdpdGggYSBzdHJpbmcgbGl0ZXJhbCB0eXBlIHRvIHByZXNlcnZlIHR5cGUtbGV2ZWwga25vd2xlZGdlIG9mIHRoZSBzaWduYWwgbmFtZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTaWduYWxEZWZpbml0aW9uPEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiB7XG4gIHR5cGU6ICdzaWduYWwnO1xuICBuYW1lOiBOYW1lO1xuICAvKipcbiAgICogVmlydHVhbCB0eXBlIGJyYW5kIHRvIG1haW50YWluIGEgZGlzdGluY3Rpb24gYmV0d2VlbiB7QGxpbmsgU2lnbmFsRGVmaW5pdGlvbn0gdHlwZXMgd2l0aCBkaWZmZXJlbnQgYXJncy5cbiAgICogVGhpcyBmaWVsZCBpcyBub3QgcHJlc2VudCBhdCBydW4tdGltZS5cbiAgICovXG4gIFthcmdzQnJhbmRdOiBBcmdzO1xufVxuXG4vKipcbiAqIEFuIGludGVyZmFjZSByZXByZXNlbnRpbmcgYSBXb3JrZmxvdyBxdWVyeSBkZWZpbml0aW9uIGFzIHJldHVybmVkIGZyb20ge0BsaW5rIGRlZmluZVF1ZXJ5fVxuICpcbiAqIEByZW1hcmtzIGBBcmdzYCBhbmQgYFJldGAgY2FuIGJlIHVzZWQgZm9yIHBhcmFtZXRlciB0eXBlIGluZmVyZW5jZSBpbiBoYW5kbGVyIGZ1bmN0aW9ucyBhbmQgV29ya2Zsb3dIYW5kbGUgbWV0aG9kcy5cbiAqIGBOYW1lYCBjYW4gb3B0aW9uYWxseSBiZSBzcGVjaWZpZWQgd2l0aCBhIHN0cmluZyBsaXRlcmFsIHR5cGUgdG8gcHJlc2VydmUgdHlwZS1sZXZlbCBrbm93bGVkZ2Ugb2YgdGhlIHF1ZXJ5IG5hbWUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUXVlcnlEZWZpbml0aW9uPFJldCwgQXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+IHtcbiAgdHlwZTogJ3F1ZXJ5JztcbiAgbmFtZTogTmFtZTtcbiAgLyoqXG4gICAqIFZpcnR1YWwgdHlwZSBicmFuZCB0byBtYWludGFpbiBhIGRpc3RpbmN0aW9uIGJldHdlZW4ge0BsaW5rIFF1ZXJ5RGVmaW5pdGlvbn0gdHlwZXMgd2l0aCBkaWZmZXJlbnQgYXJncy5cbiAgICogVGhpcyBmaWVsZCBpcyBub3QgcHJlc2VudCBhdCBydW4tdGltZS5cbiAgICovXG4gIFthcmdzQnJhbmRdOiBBcmdzO1xuICAvKipcbiAgICogVmlydHVhbCB0eXBlIGJyYW5kIHRvIG1haW50YWluIGEgZGlzdGluY3Rpb24gYmV0d2VlbiB7QGxpbmsgUXVlcnlEZWZpbml0aW9ufSB0eXBlcyB3aXRoIGRpZmZlcmVudCByZXR1cm4gdHlwZXMuXG4gICAqIFRoaXMgZmllbGQgaXMgbm90IHByZXNlbnQgYXQgcnVuLXRpbWUuXG4gICAqL1xuICBbcmV0QnJhbmRdOiBSZXQ7XG59XG5cbi8qKiBHZXQgdGhlIFwidW53cmFwcGVkXCIgcmV0dXJuIHR5cGUgKHdpdGhvdXQgUHJvbWlzZSkgb2YgdGhlIGV4ZWN1dGUgaGFuZGxlciBmcm9tIFdvcmtmbG93IHR5cGUgYFdgICovXG5leHBvcnQgdHlwZSBXb3JrZmxvd1Jlc3VsdFR5cGU8VyBleHRlbmRzIFdvcmtmbG93PiA9IFJldHVyblR5cGU8Vz4gZXh0ZW5kcyBQcm9taXNlPGluZmVyIFI+ID8gUiA6IG5ldmVyO1xuXG4vKipcbiAqIElmIGFub3RoZXIgU0RLIGNyZWF0ZXMgYSBTZWFyY2ggQXR0cmlidXRlIHRoYXQncyBub3QgYW4gYXJyYXksIHdlIHdyYXAgaXQgaW4gYW4gYXJyYXkuXG4gKlxuICogRGF0ZXMgYXJlIHNlcmlhbGl6ZWQgYXMgSVNPIHN0cmluZ3MuXG4gKi9cbmV4cG9ydCB0eXBlIFNlYXJjaEF0dHJpYnV0ZXMgPSBSZWNvcmQ8c3RyaW5nLCBTZWFyY2hBdHRyaWJ1dGVWYWx1ZSB8IFJlYWRvbmx5PFNlYXJjaEF0dHJpYnV0ZVZhbHVlPiB8IHVuZGVmaW5lZD47XG5leHBvcnQgdHlwZSBTZWFyY2hBdHRyaWJ1dGVWYWx1ZSA9IHN0cmluZ1tdIHwgbnVtYmVyW10gfCBib29sZWFuW10gfCBEYXRlW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZpdHlGdW5jdGlvbjxQIGV4dGVuZHMgYW55W10gPSBhbnlbXSwgUiA9IGFueT4ge1xuICAoLi4uYXJnczogUCk6IFByb21pc2U8Uj47XG59XG5cbi8qKlxuICogTWFwcGluZyBvZiBBY3Rpdml0eSBuYW1lIHRvIGZ1bmN0aW9uXG4gKiBAZGVwcmVjYXRlZCBub3QgcmVxdWlyZWQgYW55bW9yZSwgZm9yIHVudHlwZWQgYWN0aXZpdGllcyB1c2Uge0BsaW5rIFVudHlwZWRBY3Rpdml0aWVzfVxuICovXG5leHBvcnQgdHlwZSBBY3Rpdml0eUludGVyZmFjZSA9IFJlY29yZDxzdHJpbmcsIEFjdGl2aXR5RnVuY3Rpb24+O1xuXG4vKipcbiAqIE1hcHBpbmcgb2YgQWN0aXZpdHkgbmFtZSB0byBmdW5jdGlvblxuICovXG5leHBvcnQgdHlwZSBVbnR5cGVkQWN0aXZpdGllcyA9IFJlY29yZDxzdHJpbmcsIEFjdGl2aXR5RnVuY3Rpb24+O1xuXG4vKipcbiAqIEEgd29ya2Zsb3cncyBoaXN0b3J5IGFuZCBJRC4gVXNlZnVsIGZvciByZXBsYXkuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSGlzdG9yeUFuZFdvcmtmbG93SWQge1xuICB3b3JrZmxvd0lkOiBzdHJpbmc7XG4gIGhpc3Rvcnk6IHRlbXBvcmFsLmFwaS5oaXN0b3J5LnYxLkhpc3RvcnkgfCB1bmtub3duIHwgdW5kZWZpbmVkO1xufVxuIiwiZXhwb3J0IHR5cGUgTG9nTGV2ZWwgPSAnVFJBQ0UnIHwgJ0RFQlVHJyB8ICdJTkZPJyB8ICdXQVJOJyB8ICdFUlJPUic7XG5cbmV4cG9ydCB0eXBlIExvZ01ldGFkYXRhID0gUmVjb3JkPHN0cmluZyB8IHN5bWJvbCwgYW55PjtcblxuLyoqXG4gKiBJbXBsZW1lbnQgdGhpcyBpbnRlcmZhY2UgaW4gb3JkZXIgdG8gY3VzdG9taXplIHdvcmtlciBsb2dnaW5nXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyIHtcbiAgbG9nKGxldmVsOiBMb2dMZXZlbCwgbWVzc2FnZTogc3RyaW5nLCBtZXRhPzogTG9nTWV0YWRhdGEpOiBhbnk7XG4gIHRyYWNlKG1lc3NhZ2U6IHN0cmluZywgbWV0YT86IExvZ01ldGFkYXRhKTogYW55O1xuICBkZWJ1ZyhtZXNzYWdlOiBzdHJpbmcsIG1ldGE/OiBMb2dNZXRhZGF0YSk6IGFueTtcbiAgaW5mbyhtZXNzYWdlOiBzdHJpbmcsIG1ldGE/OiBMb2dNZXRhZGF0YSk6IGFueTtcbiAgd2FybihtZXNzYWdlOiBzdHJpbmcsIG1ldGE/OiBMb2dNZXRhZGF0YSk6IGFueTtcbiAgZXJyb3IobWVzc2FnZTogc3RyaW5nLCBtZXRhPzogTG9nTWV0YWRhdGEpOiBhbnk7XG59XG5cbi8qKlxuICogUG9zc2libGUgdmFsdWVzIG9mIHRoZSBgc2RrQ29tcG9uZW50YCBtZXRhIGF0dHJpYnV0ZXMgb24gbG9nIG1lc3NhZ2VzLiBUaGlzXG4gKiBhdHRyaWJ1dGUgaW5kaWNhdGVzIHdoaWNoIHN1YnN5c3RlbSBlbWl0dGVkIHRoZSBsb2cgbWVzc2FnZTsgdGhpcyBtYXkgZm9yXG4gKiBleGFtcGxlIGJlIHVzZWQgdG8gaW1wbGVtZW50IGZpbmUtZ3JhaW5lZCBmaWx0ZXJpbmcgb2YgbG9nIG1lc3NhZ2VzLlxuICpcbiAqIE5vdGUgdGhhdCB0aGVyZSBpcyBubyBndWFyYW50ZWUgdGhhdCB0aGlzIGxpc3Qgd2lsbCByZW1haW4gc3RhYmxlIGluIHRoZVxuICogZnV0dXJlOyB2YWx1ZXMgbWF5IGJlIGFkZGVkIG9yIHJlbW92ZWQsIGFuZCBtZXNzYWdlcyB0aGF0IGFyZSBjdXJyZW50bHlcbiAqIGVtaXR0ZWQgd2l0aCBzb21lIGBzZGtDb21wb25lbnRgIHZhbHVlIG1heSB1c2UgYSBkaWZmZXJlbnQgdmFsdWUgaW4gdGhlIGZ1dHVyZS5cbiAqL1xuZXhwb3J0IGVudW0gU2RrQ29tcG9uZW50IHtcbiAgLyoqXG4gICAqIENvbXBvbmVudCBuYW1lIGZvciBtZXNzYWdlcyBlbWl0ZWQgZnJvbSBXb3JrZmxvdyBjb2RlLCB1c2luZyB0aGUge0BsaW5rIFdvcmtmbG93IGNvbnRleHQgbG9nZ2VyfHdvcmtmbG93LmxvZ30uXG4gICAqIFRoZSBTREsgaXRzZWxmIG5ldmVyIHB1Ymxpc2hlcyBtZXNzYWdlcyB3aXRoIHRoaXMgY29tcG9uZW50IG5hbWUuXG4gICAqL1xuICB3b3JrZmxvdyA9ICd3b3JrZmxvdycsXG5cbiAgLyoqXG4gICAqIENvbXBvbmVudCBuYW1lIGZvciBtZXNzYWdlcyBlbWl0ZWQgZnJvbSBhbiBhY3Rpdml0eSwgdXNpbmcgdGhlIHtAbGluayBhY3Rpdml0eSBjb250ZXh0IGxvZ2dlcnxDb250ZXh0LmxvZ30uXG4gICAqIFRoZSBTREsgaXRzZWxmIG5ldmVyIHB1Ymxpc2hlcyBtZXNzYWdlcyB3aXRoIHRoaXMgY29tcG9uZW50IG5hbWUuXG4gICAqL1xuICBhY3Rpdml0eSA9ICdhY3Rpdml0eScsXG5cbiAgLyoqXG4gICAqIENvbXBvbmVudCBuYW1lIGZvciBtZXNzYWdlcyBlbWl0ZWQgZnJvbSBhIFRlbXBvcmFsIFdvcmtlciBpbnN0YW5jZS5cbiAgICpcbiAgICogVGhpcyBub3RhYmx5IGluY2x1ZGVzOlxuICAgKiAtIElzc3VlcyB3aXRoIFdvcmtlciBvciBydW50aW1lIGNvbmZpZ3VyYXRpb24sIG9yIHRoZSBKUyBleGVjdXRpb24gZW52aXJvbm1lbnQ7XG4gICAqIC0gV29ya2VyJ3MsIEFjdGl2aXR5J3MsIGFuZCBXb3JrZmxvdydzIGxpZmVjeWNsZSBldmVudHM7XG4gICAqIC0gV29ya2Zsb3cgQWN0aXZhdGlvbiBhbmQgQWN0aXZpdHkgVGFzayBwcm9jZXNzaW5nIGV2ZW50cztcbiAgICogLSBXb3JrZmxvdyBidW5kbGluZyBtZXNzYWdlcztcbiAgICogLSBTaW5rIHByb2Nlc3NpbmcgaXNzdWVzLlxuICAgKi9cbiAgd29ya2VyID0gJ3dvcmtlcicsXG5cbiAgLyoqXG4gICAqIENvbXBvbmVudCBuYW1lIGZvciBhbGwgbWVzc2FnZXMgZW1pdHRlZCBieSB0aGUgUnVzdCBDb3JlIFNESyBsaWJyYXJ5LlxuICAgKi9cbiAgY29yZSA9ICdjb3JlJyxcbn1cbiIsImltcG9ydCB0eXBlIHsgdGVtcG9yYWwgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBWYWx1ZUVycm9yIH0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHsgRHVyYXRpb24sIG1zT3B0aW9uYWxUb051bWJlciwgbXNPcHRpb25hbFRvVHMsIG1zVG9OdW1iZXIsIG1zVG9Ucywgb3B0aW9uYWxUc1RvTXMgfSBmcm9tICcuL3RpbWUnO1xuXG4vKipcbiAqIE9wdGlvbnMgZm9yIHJldHJ5aW5nIFdvcmtmbG93cyBhbmQgQWN0aXZpdGllc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFJldHJ5UG9saWN5IHtcbiAgLyoqXG4gICAqIENvZWZmaWNpZW50IHVzZWQgdG8gY2FsY3VsYXRlIHRoZSBuZXh0IHJldHJ5IGludGVydmFsLlxuICAgKiBUaGUgbmV4dCByZXRyeSBpbnRlcnZhbCBpcyBwcmV2aW91cyBpbnRlcnZhbCBtdWx0aXBsaWVkIGJ5IHRoaXMgY29lZmZpY2llbnQuXG4gICAqIEBtaW5pbXVtIDFcbiAgICogQGRlZmF1bHQgMlxuICAgKi9cbiAgYmFja29mZkNvZWZmaWNpZW50PzogbnVtYmVyO1xuICAvKipcbiAgICogSW50ZXJ2YWwgb2YgdGhlIGZpcnN0IHJldHJ5LlxuICAgKiBJZiBjb2VmZmljaWVudCBpcyAxIHRoZW4gaXQgaXMgdXNlZCBmb3IgYWxsIHJldHJpZXNcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqIEBkZWZhdWx0IDEgc2Vjb25kXG4gICAqL1xuICBpbml0aWFsSW50ZXJ2YWw/OiBEdXJhdGlvbjtcbiAgLyoqXG4gICAqIE1heGltdW0gbnVtYmVyIG9mIGF0dGVtcHRzLiBXaGVuIGV4Y2VlZGVkLCByZXRyaWVzIHN0b3AgKGV2ZW4gaWYge0BsaW5rIEFjdGl2aXR5T3B0aW9ucy5zY2hlZHVsZVRvQ2xvc2VUaW1lb3V0fVxuICAgKiBoYXNuJ3QgYmVlbiByZWFjaGVkKS5cbiAgICpcbiAgICogQGRlZmF1bHQgSW5maW5pdHlcbiAgICovXG4gIG1heGltdW1BdHRlbXB0cz86IG51bWJlcjtcbiAgLyoqXG4gICAqIE1heGltdW0gaW50ZXJ2YWwgYmV0d2VlbiByZXRyaWVzLlxuICAgKiBFeHBvbmVudGlhbCBiYWNrb2ZmIGxlYWRzIHRvIGludGVydmFsIGluY3JlYXNlLlxuICAgKiBUaGlzIHZhbHVlIGlzIHRoZSBjYXAgb2YgdGhlIGluY3JlYXNlLlxuICAgKlxuICAgKiBAZGVmYXVsdCAxMDB4IG9mIHtAbGluayBpbml0aWFsSW50ZXJ2YWx9XG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgbWF4aW11bUludGVydmFsPzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIExpc3Qgb2YgYXBwbGljYXRpb24gZmFpbHVyZXMgdHlwZXMgdG8gbm90IHJldHJ5LlxuICAgKi9cbiAgbm9uUmV0cnlhYmxlRXJyb3JUeXBlcz86IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIFR1cm4gYSBUUyBSZXRyeVBvbGljeSBpbnRvIGEgcHJvdG8gY29tcGF0aWJsZSBSZXRyeVBvbGljeVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZVJldHJ5UG9saWN5KHJldHJ5UG9saWN5OiBSZXRyeVBvbGljeSk6IHRlbXBvcmFsLmFwaS5jb21tb24udjEuSVJldHJ5UG9saWN5IHtcbiAgaWYgKHJldHJ5UG9saWN5LmJhY2tvZmZDb2VmZmljaWVudCAhPSBudWxsICYmIHJldHJ5UG9saWN5LmJhY2tvZmZDb2VmZmljaWVudCA8PSAwKSB7XG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5LmJhY2tvZmZDb2VmZmljaWVudCBtdXN0IGJlIGdyZWF0ZXIgdGhhbiAwJyk7XG4gIH1cbiAgaWYgKHJldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyAhPSBudWxsKSB7XG4gICAgaWYgKHJldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyA9PT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSB7XG4gICAgICAvLyBkcm9wIGZpZWxkIChJbmZpbml0eSBpcyB0aGUgZGVmYXVsdClcbiAgICAgIGNvbnN0IHsgbWF4aW11bUF0dGVtcHRzOiBfLCAuLi53aXRob3V0IH0gPSByZXRyeVBvbGljeTtcbiAgICAgIHJldHJ5UG9saWN5ID0gd2l0aG91dDtcbiAgICB9IGVsc2UgaWYgKHJldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyA8PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignUmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyJyk7XG4gICAgfSBlbHNlIGlmICghTnVtYmVyLmlzSW50ZWdlcihyZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMpKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignUmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzIG11c3QgYmUgYW4gaW50ZWdlcicpO1xuICAgIH1cbiAgfVxuICBjb25zdCBtYXhpbXVtSW50ZXJ2YWwgPSBtc09wdGlvbmFsVG9OdW1iZXIocmV0cnlQb2xpY3kubWF4aW11bUludGVydmFsKTtcbiAgY29uc3QgaW5pdGlhbEludGVydmFsID0gbXNUb051bWJlcihyZXRyeVBvbGljeS5pbml0aWFsSW50ZXJ2YWwgPz8gMTAwMCk7XG4gIGlmIChtYXhpbXVtSW50ZXJ2YWwgPT09IDApIHtcbiAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignUmV0cnlQb2xpY3kubWF4aW11bUludGVydmFsIGNhbm5vdCBiZSAwJyk7XG4gIH1cbiAgaWYgKGluaXRpYWxJbnRlcnZhbCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5pbml0aWFsSW50ZXJ2YWwgY2Fubm90IGJlIDAnKTtcbiAgfVxuICBpZiAobWF4aW11bUludGVydmFsICE9IG51bGwgJiYgbWF4aW11bUludGVydmFsIDwgaW5pdGlhbEludGVydmFsKSB7XG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5Lm1heGltdW1JbnRlcnZhbCBjYW5ub3QgYmUgbGVzcyB0aGFuIGl0cyBpbml0aWFsSW50ZXJ2YWwnKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIG1heGltdW1BdHRlbXB0czogcmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzLFxuICAgIGluaXRpYWxJbnRlcnZhbDogbXNUb1RzKGluaXRpYWxJbnRlcnZhbCksXG4gICAgbWF4aW11bUludGVydmFsOiBtc09wdGlvbmFsVG9UcyhtYXhpbXVtSW50ZXJ2YWwpLFxuICAgIGJhY2tvZmZDb2VmZmljaWVudDogcmV0cnlQb2xpY3kuYmFja29mZkNvZWZmaWNpZW50LFxuICAgIG5vblJldHJ5YWJsZUVycm9yVHlwZXM6IHJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXMsXG4gIH07XG59XG5cbi8qKlxuICogVHVybiBhIHByb3RvIGNvbXBhdGlibGUgUmV0cnlQb2xpY3kgaW50byBhIFRTIFJldHJ5UG9saWN5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvbXBpbGVSZXRyeVBvbGljeShcbiAgcmV0cnlQb2xpY3k/OiB0ZW1wb3JhbC5hcGkuY29tbW9uLnYxLklSZXRyeVBvbGljeSB8IG51bGxcbik6IFJldHJ5UG9saWN5IHwgdW5kZWZpbmVkIHtcbiAgaWYgKCFyZXRyeVBvbGljeSkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGJhY2tvZmZDb2VmZmljaWVudDogcmV0cnlQb2xpY3kuYmFja29mZkNvZWZmaWNpZW50ID8/IHVuZGVmaW5lZCxcbiAgICBtYXhpbXVtQXR0ZW1wdHM6IHJldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyA/PyB1bmRlZmluZWQsXG4gICAgbWF4aW11bUludGVydmFsOiBvcHRpb25hbFRzVG9NcyhyZXRyeVBvbGljeS5tYXhpbXVtSW50ZXJ2YWwpLFxuICAgIGluaXRpYWxJbnRlcnZhbDogb3B0aW9uYWxUc1RvTXMocmV0cnlQb2xpY3kuaW5pdGlhbEludGVydmFsKSxcbiAgICBub25SZXRyeWFibGVFcnJvclR5cGVzOiByZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzID8/IHVuZGVmaW5lZCxcbiAgfTtcbn1cbiIsImltcG9ydCBMb25nIGZyb20gJ2xvbmcnOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGltcG9ydC9uby1uYW1lZC1hcy1kZWZhdWx0XG5pbXBvcnQgbXMsIHsgU3RyaW5nVmFsdWUgfSBmcm9tICdtcyc7XG5pbXBvcnQgdHlwZSB7IGdvb2dsZSB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IFZhbHVlRXJyb3IgfSBmcm9tICcuL2Vycm9ycyc7XG5cbi8vIE5PVEU6IHRoZXNlIGFyZSB0aGUgc2FtZSBpbnRlcmZhY2UgaW4gSlNcbi8vIGdvb2dsZS5wcm90b2J1Zi5JRHVyYXRpb247XG4vLyBnb29nbGUucHJvdG9idWYuSVRpbWVzdGFtcDtcbi8vIFRoZSBjb252ZXJzaW9uIGZ1bmN0aW9ucyBiZWxvdyBzaG91bGQgd29yayBmb3IgYm90aFxuXG5leHBvcnQgdHlwZSBUaW1lc3RhbXAgPSBnb29nbGUucHJvdG9idWYuSVRpbWVzdGFtcDtcblxuLyoqXG4gKiBBIGR1cmF0aW9uLCBleHByZXNzZWQgZWl0aGVyIGFzIGEgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcywgb3IgYXMgYSB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfS5cbiAqL1xuZXhwb3J0IHR5cGUgRHVyYXRpb24gPSBTdHJpbmdWYWx1ZSB8IG51bWJlcjtcblxuZXhwb3J0IHR5cGUgeyBTdHJpbmdWYWx1ZSB9IGZyb20gJ21zJztcblxuLyoqXG4gKiBMb3NzeSBjb252ZXJzaW9uIGZ1bmN0aW9uIGZyb20gVGltZXN0YW1wIHRvIG51bWJlciBkdWUgdG8gcG9zc2libGUgb3ZlcmZsb3cuXG4gKiBJZiB0cyBpcyBudWxsIG9yIHVuZGVmaW5lZCByZXR1cm5zIHVuZGVmaW5lZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsVHNUb01zKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHRzID09PSB1bmRlZmluZWQgfHwgdHMgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiB0c1RvTXModHMpO1xufVxuXG4vKipcbiAqIExvc3N5IGNvbnZlcnNpb24gZnVuY3Rpb24gZnJvbSBUaW1lc3RhbXAgdG8gbnVtYmVyIGR1ZSB0byBwb3NzaWJsZSBvdmVyZmxvd1xuICovXG5leHBvcnQgZnVuY3Rpb24gdHNUb01zKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHtcbiAgaWYgKHRzID09PSB1bmRlZmluZWQgfHwgdHMgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIHRpbWVzdGFtcCwgZ290ICR7dHN9YCk7XG4gIH1cbiAgY29uc3QgeyBzZWNvbmRzLCBuYW5vcyB9ID0gdHM7XG4gIHJldHVybiAoc2Vjb25kcyB8fCBMb25nLlVaRVJPKVxuICAgIC5tdWwoMTAwMClcbiAgICAuYWRkKE1hdGguZmxvb3IoKG5hbm9zIHx8IDApIC8gMTAwMDAwMCkpXG4gICAgLnRvTnVtYmVyKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtc051bWJlclRvVHMobWlsbGlzOiBudW1iZXIpOiBUaW1lc3RhbXAge1xuICBjb25zdCBzZWNvbmRzID0gTWF0aC5mbG9vcihtaWxsaXMgLyAxMDAwKTtcbiAgY29uc3QgbmFub3MgPSAobWlsbGlzICUgMTAwMCkgKiAxMDAwMDAwO1xuICBpZiAoTnVtYmVyLmlzTmFOKHNlY29uZHMpIHx8IE51bWJlci5pc05hTihuYW5vcykpIHtcbiAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihgSW52YWxpZCBtaWxsaXMgJHttaWxsaXN9YCk7XG4gIH1cbiAgcmV0dXJuIHsgc2Vjb25kczogTG9uZy5mcm9tTnVtYmVyKHNlY29uZHMpLCBuYW5vcyB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbXNUb1RzKHN0cjogRHVyYXRpb24pOiBUaW1lc3RhbXAge1xuICByZXR1cm4gbXNOdW1iZXJUb1RzKG1zVG9OdW1iZXIoc3RyKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtc09wdGlvbmFsVG9UcyhzdHI6IER1cmF0aW9uIHwgdW5kZWZpbmVkKTogVGltZXN0YW1wIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHN0ciA/IG1zVG9UcyhzdHIpIDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbXNPcHRpb25hbFRvTnVtYmVyKHZhbDogRHVyYXRpb24gfCB1bmRlZmluZWQpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICBpZiAodmFsID09PSB1bmRlZmluZWQpIHJldHVybiB1bmRlZmluZWQ7XG4gIHJldHVybiBtc1RvTnVtYmVyKHZhbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtc1RvTnVtYmVyKHZhbDogRHVyYXRpb24pOiBudW1iZXIge1xuICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG4gIHJldHVybiBtc1dpdGhWYWxpZGF0aW9uKHZhbCk7XG59XG5cbmZ1bmN0aW9uIG1zV2l0aFZhbGlkYXRpb24oc3RyOiBTdHJpbmdWYWx1ZSk6IG51bWJlciB7XG4gIGNvbnN0IG1pbGxpcyA9IG1zKHN0cik7XG4gIGlmIChtaWxsaXMgPT0gbnVsbCB8fCBpc05hTihtaWxsaXMpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgSW52YWxpZCBkdXJhdGlvbiBzdHJpbmc6ICcke3N0cn0nYCk7XG4gIH1cbiAgcmV0dXJuIG1pbGxpcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRzVG9EYXRlKHRzOiBUaW1lc3RhbXApOiBEYXRlIHtcbiAgcmV0dXJuIG5ldyBEYXRlKHRzVG9Ncyh0cykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0aW9uYWxUc1RvRGF0ZSh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCk6IERhdGUgfCB1bmRlZmluZWQge1xuICBpZiAodHMgPT09IHVuZGVmaW5lZCB8fCB0cyA9PT0gbnVsbCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIG5ldyBEYXRlKHRzVG9Ncyh0cykpO1xufVxuXG4vLyB0cy1wcnVuZS1pZ25vcmUtbmV4dCAoaW1wb3J0ZWQgdmlhIHNjaGVkdWxlLWhlbHBlcnMudHMpXG5leHBvcnQgZnVuY3Rpb24gb3B0aW9uYWxEYXRlVG9UcyhkYXRlOiBEYXRlIHwgbnVsbCB8IHVuZGVmaW5lZCk6IFRpbWVzdGFtcCB8IHVuZGVmaW5lZCB7XG4gIGlmIChkYXRlID09PSB1bmRlZmluZWQgfHwgZGF0ZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIG1zVG9UcyhkYXRlLmdldFRpbWUoKSk7XG59XG4iLCIvKiogU2hvcnRoYW5kIGFsaWFzICovXG5leHBvcnQgdHlwZSBBbnlGdW5jID0gKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnk7XG4vKiogQSB0dXBsZSB3aXRob3V0IGl0cyBsYXN0IGVsZW1lbnQgKi9cbmV4cG9ydCB0eXBlIE9taXRMYXN0PFQ+ID0gVCBleHRlbmRzIFsuLi5pbmZlciBSRVNULCBhbnldID8gUkVTVCA6IG5ldmVyO1xuLyoqIEYgd2l0aCBhbGwgYXJndW1lbnRzIGJ1dCB0aGUgbGFzdCAqL1xuZXhwb3J0IHR5cGUgT21pdExhc3RQYXJhbTxGIGV4dGVuZHMgQW55RnVuYz4gPSAoLi4uYXJnczogT21pdExhc3Q8UGFyYW1ldGVyczxGPj4pID0+IFJldHVyblR5cGU8Rj47XG4vKiogUmVxdWlyZSB0aGF0IFQgaGFzIGF0IGxlYXN0IG9uZSBvZiB0aGUgcHJvdmlkZWQgcHJvcGVydGllcyBkZWZpbmVkICovXG5leHBvcnQgdHlwZSBSZXF1aXJlQXRMZWFzdE9uZTxULCBLZXlzIGV4dGVuZHMga2V5b2YgVCA9IGtleW9mIFQ+ID0gUGljazxULCBFeGNsdWRlPGtleW9mIFQsIEtleXM+PiAmXG4gIHtcbiAgICBbSyBpbiBLZXlzXS0/OiBSZXF1aXJlZDxQaWNrPFQsIEs+PiAmIFBhcnRpYWw8UGljazxULCBFeGNsdWRlPEtleXMsIEs+Pj47XG4gIH1bS2V5c107XG5cbi8qKiBWZXJpZnkgdGhhdCBhbiB0eXBlIF9Db3B5IGV4dGVuZHMgX09yaWcgKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0V4dGVuZHM8X09yaWcsIF9Db3B5IGV4dGVuZHMgX09yaWc+KCk6IHZvaWQge1xuICAvLyBub29wLCBqdXN0IHR5cGUgY2hlY2tcbn1cblxuZXhwb3J0IHR5cGUgUmVwbGFjZTxCYXNlLCBOZXc+ID0gT21pdDxCYXNlLCBrZXlvZiBOZXc+ICYgTmV3O1xuXG5leHBvcnQgZnVuY3Rpb24gaXNSZWNvcmQodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzT3duUHJvcGVydHk8WCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBZIGV4dGVuZHMgUHJvcGVydHlLZXk+KFxuICByZWNvcmQ6IFgsXG4gIHByb3A6IFlcbik6IHJlY29yZCBpcyBYICYgUmVjb3JkPFksIHVua25vd24+IHtcbiAgcmV0dXJuIHByb3AgaW4gcmVjb3JkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzT3duUHJvcGVydGllczxYIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIFkgZXh0ZW5kcyBQcm9wZXJ0eUtleT4oXG4gIHJlY29yZDogWCxcbiAgcHJvcHM6IFlbXVxuKTogcmVjb3JkIGlzIFggJiBSZWNvcmQ8WSwgdW5rbm93bj4ge1xuICByZXR1cm4gcHJvcHMuZXZlcnkoKHByb3ApID0+IHByb3AgaW4gcmVjb3JkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRXJyb3IoZXJyb3I6IHVua25vd24pOiBlcnJvciBpcyBFcnJvciB7XG4gIHJldHVybiAoXG4gICAgaXNSZWNvcmQoZXJyb3IpICYmXG4gICAgdHlwZW9mIGVycm9yLm5hbWUgPT09ICdzdHJpbmcnICYmXG4gICAgdHlwZW9mIGVycm9yLm1lc3NhZ2UgPT09ICdzdHJpbmcnICYmXG4gICAgKGVycm9yLnN0YWNrID09IG51bGwgfHwgdHlwZW9mIGVycm9yLnN0YWNrID09PSAnc3RyaW5nJylcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQWJvcnRFcnJvcihlcnJvcjogdW5rbm93bik6IGVycm9yIGlzIEVycm9yICYgeyBuYW1lOiAnQWJvcnRFcnJvcicgfSB7XG4gIHJldHVybiBpc0Vycm9yKGVycm9yKSAmJiBlcnJvci5uYW1lID09PSAnQWJvcnRFcnJvcic7XG59XG5cbi8qKlxuICogR2V0IGBlcnJvci5tZXNzYWdlYCAob3IgYHVuZGVmaW5lZGAgaWYgbm90IHByZXNlbnQpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcnJvck1lc3NhZ2UoZXJyb3I6IHVua25vd24pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICBpZiAoaXNFcnJvcihlcnJvcikpIHtcbiAgICByZXR1cm4gZXJyb3IubWVzc2FnZTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXJyb3IgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGVycm9yO1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmludGVyZmFjZSBFcnJvcldpdGhDb2RlIHtcbiAgY29kZTogc3RyaW5nO1xufVxuXG5mdW5jdGlvbiBpc0Vycm9yV2l0aENvZGUoZXJyb3I6IHVua25vd24pOiBlcnJvciBpcyBFcnJvcldpdGhDb2RlIHtcbiAgcmV0dXJuIGlzUmVjb3JkKGVycm9yKSAmJiB0eXBlb2YgZXJyb3IuY29kZSA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogR2V0IGBlcnJvci5jb2RlYCAob3IgYHVuZGVmaW5lZGAgaWYgbm90IHByZXNlbnQpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcnJvckNvZGUoZXJyb3I6IHVua25vd24pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICBpZiAoaXNFcnJvcldpdGhDb2RlKGVycm9yKSkge1xuICAgIHJldHVybiBlcnJvci5jb2RlO1xuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBBc3NlcnRzIHRoYXQgc29tZSB0eXBlIGlzIHRoZSBuZXZlciB0eXBlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROZXZlcihtc2c6IHN0cmluZywgeDogbmV2ZXIpOiBuZXZlciB7XG4gIHRocm93IG5ldyBUeXBlRXJyb3IobXNnICsgJzogJyArIHgpO1xufVxuXG5leHBvcnQgdHlwZSBDbGFzczxFIGV4dGVuZHMgRXJyb3I+ID0ge1xuICBuZXcgKC4uLmFyZ3M6IGFueVtdKTogRTtcbiAgcHJvdG90eXBlOiBFO1xufTtcblxuLyoqXG4gKiBBIGRlY29yYXRvciB0byBiZSB1c2VkIG9uIGVycm9yIGNsYXNzZXMuIEl0IGFkZHMgdGhlICduYW1lJyBwcm9wZXJ0eSBBTkQgcHJvdmlkZXMgYSBjdXN0b21cbiAqICdpbnN0YW5jZW9mJyBoYW5kbGVyIHRoYXQgd29ya3MgY29ycmVjdGx5IGFjcm9zcyBleGVjdXRpb24gY29udGV4dHMuXG4gKlxuICogIyMjIERldGFpbHMgIyMjXG4gKlxuICogQWNjb3JkaW5nIHRvIHRoZSBFY21hU2NyaXB0J3Mgc3BlYywgdGhlIGRlZmF1bHQgYmVoYXZpb3Igb2YgSmF2YVNjcmlwdCdzIGB4IGluc3RhbmNlb2YgWWAgb3BlcmF0b3IgaXMgdG8gd2FsayB1cCB0aGVcbiAqIHByb3RvdHlwZSBjaGFpbiBvZiBvYmplY3QgJ3gnLCBjaGVja2luZyBpZiBhbnkgY29uc3RydWN0b3IgaW4gdGhhdCBoaWVyYXJjaHkgaXMgX2V4YWN0bHkgdGhlIHNhbWUgb2JqZWN0XyBhcyB0aGVcbiAqIGNvbnN0cnVjdG9yIGZ1bmN0aW9uICdZJy5cbiAqXG4gKiBVbmZvcnR1bmF0ZWx5LCBpdCBoYXBwZW5zIGluIHZhcmlvdXMgc2l0dWF0aW9ucyB0aGF0IGRpZmZlcmVudCBjb25zdHJ1Y3RvciBmdW5jdGlvbiBvYmplY3RzIGdldCBjcmVhdGVkIGZvciB3aGF0XG4gKiBhcHBlYXJzIHRvIGJlIHRoZSB2ZXJ5IHNhbWUgY2xhc3MuIFRoaXMgbGVhZHMgdG8gc3VycHJpc2luZyBiZWhhdmlvciB3aGVyZSBgaW5zdGFuY2VvZmAgcmV0dXJucyBmYWxzZSB0aG91Z2ggaXQgaXNcbiAqIGtub3duIHRoYXQgdGhlIG9iamVjdCBpcyBpbmRlZWQgYW4gaW5zdGFuY2Ugb2YgdGhhdCBjbGFzcy4gT25lIHBhcnRpY3VsYXIgY2FzZSB3aGVyZSB0aGlzIGhhcHBlbnMgaXMgd2hlbiBjb25zdHJ1Y3RvclxuICogJ1knIGJlbG9uZ3MgdG8gYSBkaWZmZXJlbnQgcmVhbG0gdGhhbiB0aGUgY29uc3R1Y3RvciB3aXRoIHdoaWNoICd4JyB3YXMgaW5zdGFudGlhdGVkLiBBbm90aGVyIGNhc2UgaXMgd2hlbiB0d28gY29waWVzXG4gKiBvZiB0aGUgc2FtZSBsaWJyYXJ5IGdldHMgbG9hZGVkIGluIHRoZSBzYW1lIHJlYWxtLlxuICpcbiAqIEluIHByYWN0aWNlLCB0aGlzIHRlbmRzIHRvIGNhdXNlIGlzc3VlcyB3aGVuIGNyb3NzaW5nIHRoZSB3b3JrZmxvdy1zYW5kYm94aW5nIGJvdW5kYXJ5IChzaW5jZSBOb2RlJ3Mgdm0gbW9kdWxlXG4gKiByZWFsbHkgY3JlYXRlcyBuZXcgZXhlY3V0aW9uIHJlYWxtcyksIGFzIHdlbGwgYXMgd2hlbiBydW5uaW5nIHRlc3RzIHVzaW5nIEplc3QgKHNlZSBodHRwczovL2dpdGh1Yi5jb20vamVzdGpzL2plc3QvaXNzdWVzLzI1NDlcbiAqIGZvciBzb21lIGRldGFpbHMgb24gdGhhdCBvbmUpLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gaW5qZWN0cyBhIGN1c3RvbSAnaW5zdGFuY2VvZicgaGFuZGxlciBpbnRvIHRoZSBwcm90b3R5cGUgb2YgJ2NsYXp6Jywgd2hpY2ggaXMgYm90aCBjcm9zcy1yZWFsbSBzYWZlIGFuZFxuICogY3Jvc3MtY29waWVzLW9mLXRoZS1zYW1lLWxpYiBzYWZlLiBJdCB3b3JrcyBieSBhZGRpbmcgYSBzcGVjaWFsIHN5bWJvbCBwcm9wZXJ0eSB0byB0aGUgcHJvdG90eXBlIG9mICdjbGF6eicsIGFuZCB0aGVuXG4gKiBjaGVja2luZyBmb3IgdGhlIHByZXNlbmNlIG9mIHRoYXQgc3ltYm9sLlxuICovXG5leHBvcnQgZnVuY3Rpb24gU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3I8RSBleHRlbmRzIEVycm9yPihtYXJrZXJOYW1lOiBzdHJpbmcpOiAoY2xheno6IENsYXNzPEU+KSA9PiB2b2lkIHtcbiAgcmV0dXJuIChjbGF6ejogQ2xhc3M8RT4pOiB2b2lkID0+IHtcbiAgICBjb25zdCBtYXJrZXIgPSBTeW1ib2wuZm9yKGBfX3RlbXBvcmFsX2lzJHttYXJrZXJOYW1lfWApO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNsYXp6LnByb3RvdHlwZSwgJ25hbWUnLCB7IHZhbHVlOiBtYXJrZXJOYW1lLCBlbnVtZXJhYmxlOiB0cnVlIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbGF6ei5wcm90b3R5cGUsIG1hcmtlciwgeyB2YWx1ZTogdHJ1ZSwgZW51bWVyYWJsZTogZmFsc2UgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNsYXp6LCBTeW1ib2wuaGFzSW5zdGFuY2UsIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBvYmplY3Qtc2hvcnRoYW5kXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gKHRoaXM6IGFueSwgZXJyb3I6IG9iamVjdCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcyA9PT0gY2xhenopIHtcbiAgICAgICAgICByZXR1cm4gaXNSZWNvcmQoZXJyb3IpICYmIChlcnJvciBhcyBhbnkpW21hcmtlcl0gPT09IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gJ3RoaXMnIG11c3QgYmUgYSBfc3ViY2xhc3NfIG9mIGNsYXp6IHRoYXQgZG9lc24ndCByZWRlZmluZWQgW1N5bWJvbC5oYXNJbnN0YW5jZV0sIHNvIHRoYXQgaXQgaW5oZXJpdGVkXG4gICAgICAgICAgLy8gZnJvbSBjbGF6eidzIFtTeW1ib2wuaGFzSW5zdGFuY2VdLiBJZiB3ZSBkb24ndCBoYW5kbGUgdGhpcyBwYXJ0aWN1bGFyIHNpdHVhdGlvbiwgdGhlblxuICAgICAgICAgIC8vIGB4IGluc3RhbmNlb2YgU3ViY2xhc3NPZlBhcmVudGAgd291bGQgcmV0dXJuIHRydWUgZm9yIGFueSBpbnN0YW5jZSBvZiAnUGFyZW50Jywgd2hpY2ggaXMgY2xlYXJseSB3cm9uZy5cbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIElkZWFsbHksIGl0J2QgYmUgcHJlZmVyYWJsZSB0byBhdm9pZCB0aGlzIGNhc2UgZW50aXJlbHksIGJ5IG1ha2luZyBzdXJlIHRoYXQgYWxsIHN1YmNsYXNzZXMgb2YgJ2NsYXp6J1xuICAgICAgICAgIC8vIHJlZGVmaW5lIFtTeW1ib2wuaGFzSW5zdGFuY2VdLCBidXQgd2UgY2FuJ3QgZW5mb3JjZSB0aGF0LiBXZSB0aGVyZWZvcmUgZmFsbGJhY2sgdG8gdGhlIGRlZmF1bHQgaW5zdGFuY2VvZlxuICAgICAgICAgIC8vIGJlaGF2aW9yICh3aGljaCBpcyBOT1QgY3Jvc3MtcmVhbG0gc2FmZSkuXG4gICAgICAgICAgcmV0dXJuIHRoaXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoZXJyb3IpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuICB9O1xufVxuXG4vLyBUaGFua3MgTUROOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvZnJlZXplXG5leHBvcnQgZnVuY3Rpb24gZGVlcEZyZWV6ZTxUPihvYmplY3Q6IFQpOiBUIHtcbiAgLy8gUmV0cmlldmUgdGhlIHByb3BlcnR5IG5hbWVzIGRlZmluZWQgb24gb2JqZWN0XG4gIGNvbnN0IHByb3BOYW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iamVjdCk7XG5cbiAgLy8gRnJlZXplIHByb3BlcnRpZXMgYmVmb3JlIGZyZWV6aW5nIHNlbGZcbiAgZm9yIChjb25zdCBuYW1lIG9mIHByb3BOYW1lcykge1xuICAgIGNvbnN0IHZhbHVlID0gKG9iamVjdCBhcyBhbnkpW25hbWVdO1xuXG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRlZXBGcmVlemUodmFsdWUpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgb2theSwgdGhlcmUgYXJlIHNvbWUgdHlwZWQgYXJyYXlzIHRoYXQgY2Fubm90IGJlIGZyb3plbiAoZW5jb2RpbmdLZXlzKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBPYmplY3QuZnJlZXplKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmZyZWV6ZShvYmplY3QpO1xufVxuIiwiaW1wb3J0IHR5cGUgeyBjb3Jlc2RrIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHR5cGUgeyBWZXJzaW9uaW5nSW50ZW50IGFzIFZlcnNpb25pbmdJbnRlbnRTdHJpbmcgfSBmcm9tICcuL3ZlcnNpb25pbmctaW50ZW50JztcbmltcG9ydCB7IGFzc2VydE5ldmVyLCBjaGVja0V4dGVuZHMgfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5cbi8vIEF2b2lkIGltcG9ydGluZyB0aGUgcHJvdG8gaW1wbGVtZW50YXRpb24gdG8gcmVkdWNlIHdvcmtmbG93IGJ1bmRsZSBzaXplXG4vLyBDb3BpZWQgZnJvbSBjb3Jlc2RrLmNvbW1vbi5WZXJzaW9uaW5nSW50ZW50XG4vKipcbiAqIFByb3RvYnVmIGVudW0gcmVwcmVzZW50YXRpb24gb2Yge0BsaW5rIFZlcnNpb25pbmdJbnRlbnRTdHJpbmd9LlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGVudW0gVmVyc2lvbmluZ0ludGVudCB7XG4gIFVOU1BFQ0lGSUVEID0gMCxcbiAgQ09NUEFUSUJMRSA9IDEsXG4gIERFRkFVTFQgPSAyLFxufVxuXG5jaGVja0V4dGVuZHM8Y29yZXNkay5jb21tb24uVmVyc2lvbmluZ0ludGVudCwgVmVyc2lvbmluZ0ludGVudD4oKTtcbmNoZWNrRXh0ZW5kczxWZXJzaW9uaW5nSW50ZW50LCBjb3Jlc2RrLmNvbW1vbi5WZXJzaW9uaW5nSW50ZW50PigpO1xuXG5leHBvcnQgZnVuY3Rpb24gdmVyc2lvbmluZ0ludGVudFRvUHJvdG8oaW50ZW50OiBWZXJzaW9uaW5nSW50ZW50U3RyaW5nIHwgdW5kZWZpbmVkKTogVmVyc2lvbmluZ0ludGVudCB7XG4gIHN3aXRjaCAoaW50ZW50KSB7XG4gICAgY2FzZSAnREVGQVVMVCc6XG4gICAgICByZXR1cm4gVmVyc2lvbmluZ0ludGVudC5ERUZBVUxUO1xuICAgIGNhc2UgJ0NPTVBBVElCTEUnOlxuICAgICAgcmV0dXJuIFZlcnNpb25pbmdJbnRlbnQuQ09NUEFUSUJMRTtcbiAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgIHJldHVybiBWZXJzaW9uaW5nSW50ZW50LlVOU1BFQ0lGSUVEO1xuICAgIGRlZmF1bHQ6XG4gICAgICBhc3NlcnROZXZlcignVW5leHBlY3RlZCBWZXJzaW9uaW5nSW50ZW50JywgaW50ZW50KTtcbiAgfVxufVxuIiwiLyoqXG4gKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgdXNlciBpbnRlbmRzIGNlcnRhaW4gY29tbWFuZHMgdG8gYmUgcnVuIG9uIGEgY29tcGF0aWJsZSB3b3JrZXIgQnVpbGQgSWQgdmVyc2lvbiBvciBub3QuXG4gKlxuICogYENPTVBBVElCTEVgIGluZGljYXRlcyB0aGF0IHRoZSBjb21tYW5kIHNob3VsZCBydW4gb24gYSB3b3JrZXIgd2l0aCBjb21wYXRpYmxlIHZlcnNpb24gaWYgcG9zc2libGUuIEl0IG1heSBub3QgYmVcbiAqIHBvc3NpYmxlIGlmIHRoZSB0YXJnZXQgdGFzayBxdWV1ZSBkb2VzIG5vdCBhbHNvIGhhdmUga25vd2xlZGdlIG9mIHRoZSBjdXJyZW50IHdvcmtlcidzIEJ1aWxkIElkLlxuICpcbiAqIGBERUZBVUxUYCBpbmRpY2F0ZXMgdGhhdCB0aGUgY29tbWFuZCBzaG91bGQgcnVuIG9uIHRoZSB0YXJnZXQgdGFzayBxdWV1ZSdzIGN1cnJlbnQgb3ZlcmFsbC1kZWZhdWx0IEJ1aWxkIElkLlxuICpcbiAqIFdoZXJlIHRoaXMgdHlwZSBpcyBhY2NlcHRlZCBvcHRpb25hbGx5LCBhbiB1bnNldCB2YWx1ZSBpbmRpY2F0ZXMgdGhhdCB0aGUgU0RLIHNob3VsZCBjaG9vc2UgdGhlIG1vc3Qgc2Vuc2libGUgZGVmYXVsdFxuICogYmVoYXZpb3IgZm9yIHRoZSB0eXBlIG9mIGNvbW1hbmQsIGFjY291bnRpbmcgZm9yIHdoZXRoZXIgdGhlIGNvbW1hbmQgd2lsbCBiZSBydW4gb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyB0aGVcbiAqIGN1cnJlbnQgd29ya2VyLiBUaGUgZGVmYXVsdCBiZWhhdmlvciBmb3Igc3RhcnRpbmcgV29ya2Zsb3dzIGlzIGBERUZBVUxUYC4gVGhlIGRlZmF1bHQgYmVoYXZpb3IgZm9yIFdvcmtmbG93cyBzdGFydGluZ1xuICogQWN0aXZpdGllcywgc3RhcnRpbmcgQ2hpbGQgV29ya2Zsb3dzLCBvciBDb250aW51aW5nIEFzIE5ldyBpcyBgQ09NUEFUSUJMRWAuXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgdHlwZSBWZXJzaW9uaW5nSW50ZW50ID0gJ0NPTVBBVElCTEUnIHwgJ0RFRkFVTFQnO1xuIiwiaW1wb3J0IHsgV29ya2Zsb3csIFdvcmtmbG93UmVzdWx0VHlwZSwgU2lnbmFsRGVmaW5pdGlvbiB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbi8qKlxuICogQmFzZSBXb3JrZmxvd0hhbmRsZSBpbnRlcmZhY2UsIGV4dGVuZGVkIGluIHdvcmtmbG93IGFuZCBjbGllbnQgbGlicy5cbiAqXG4gKiBUcmFuc2Zvcm1zIGEgd29ya2Zsb3cgaW50ZXJmYWNlIGBUYCBpbnRvIGEgY2xpZW50IGludGVyZmFjZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBCYXNlV29ya2Zsb3dIYW5kbGU8VCBleHRlbmRzIFdvcmtmbG93PiB7XG4gIC8qKlxuICAgKiBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBXb3JrZmxvdyBleGVjdXRpb24gY29tcGxldGVzXG4gICAqL1xuICByZXN1bHQoKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+O1xuXG4gIC8qKlxuICAgKiBTaWduYWwgYSBydW5uaW5nIFdvcmtmbG93LlxuICAgKlxuICAgKiBAcGFyYW0gZGVmIGEgc2lnbmFsIGRlZmluaXRpb24gYXMgcmV0dXJuZWQgZnJvbSB7QGxpbmsgZGVmaW5lU2lnbmFsfVxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGB0c1xuICAgKiBhd2FpdCBoYW5kbGUuc2lnbmFsKGluY3JlbWVudFNpZ25hbCwgMyk7XG4gICAqIGBgYFxuICAgKi9cbiAgc2lnbmFsPEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPihcbiAgICBkZWY6IFNpZ25hbERlZmluaXRpb248QXJncywgTmFtZT4gfCBzdHJpbmcsXG4gICAgLi4uYXJnczogQXJnc1xuICApOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBUaGUgd29ya2Zsb3dJZCBvZiB0aGUgY3VycmVudCBXb3JrZmxvd1xuICAgKi9cbiAgcmVhZG9ubHkgd29ya2Zsb3dJZDogc3RyaW5nO1xufVxuIiwiaW1wb3J0IHR5cGUgeyB0ZW1wb3JhbCB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IFNlYXJjaEF0dHJpYnV0ZXMsIFdvcmtmbG93IH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFJldHJ5UG9saWN5IH0gZnJvbSAnLi9yZXRyeS1wb2xpY3knO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tICcuL3RpbWUnO1xuaW1wb3J0IHsgY2hlY2tFeHRlbmRzIH0gZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuXG4vLyBBdm9pZCBpbXBvcnRpbmcgdGhlIHByb3RvIGltcGxlbWVudGF0aW9uIHRvIHJlZHVjZSB3b3JrZmxvdyBidW5kbGUgc2l6ZVxuLy8gQ29waWVkIGZyb20gdGVtcG9yYWwuYXBpLmVudW1zLnYxLldvcmtmbG93SWRSZXVzZVBvbGljeVxuLyoqXG4gKiBDb25jZXB0OiB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2NvbmNlcHRzL3doYXQtaXMtYS13b3JrZmxvdy1pZC1yZXVzZS1wb2xpY3kvIHwgV29ya2Zsb3cgSWQgUmV1c2UgUG9saWN5fVxuICpcbiAqIFdoZXRoZXIgYSBXb3JrZmxvdyBjYW4gYmUgc3RhcnRlZCB3aXRoIGEgV29ya2Zsb3cgSWQgb2YgYSBDbG9zZWQgV29ya2Zsb3cuXG4gKlxuICogKk5vdGU6IEEgV29ya2Zsb3cgY2FuIG5ldmVyIGJlIHN0YXJ0ZWQgd2l0aCBhIFdvcmtmbG93IElkIG9mIGEgUnVubmluZyBXb3JrZmxvdy4qXG4gKi9cbmV4cG9ydCBlbnVtIFdvcmtmbG93SWRSZXVzZVBvbGljeSB7XG4gIC8qKlxuICAgKiBObyBuZWVkIHRvIHVzZSB0aGlzLlxuICAgKlxuICAgKiAoSWYgYSBgV29ya2Zsb3dJZFJldXNlUG9saWN5YCBpcyBzZXQgdG8gdGhpcywgb3IgaXMgbm90IHNldCBhdCBhbGwsIHRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZC4pXG4gICAqL1xuICBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfVU5TUEVDSUZJRUQgPSAwLFxuXG4gIC8qKlxuICAgKiBUaGUgV29ya2Zsb3cgY2FuIGJlIHN0YXJ0ZWQgaWYgdGhlIHByZXZpb3VzIFdvcmtmbG93IGlzIGluIGEgQ2xvc2VkIHN0YXRlLlxuICAgKiBAZGVmYXVsdFxuICAgKi9cbiAgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX0FMTE9XX0RVUExJQ0FURSA9IDEsXG5cbiAgLyoqXG4gICAqIFRoZSBXb3JrZmxvdyBjYW4gYmUgc3RhcnRlZCBpZiB0aGUgcHJldmlvdXMgV29ya2Zsb3cgaXMgaW4gYSBDbG9zZWQgc3RhdGUgdGhhdCBpcyBub3QgQ29tcGxldGVkLlxuICAgKi9cbiAgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX0FMTE9XX0RVUExJQ0FURV9GQUlMRURfT05MWSA9IDIsXG5cbiAgLyoqXG4gICAqIFRoZSBXb3JrZmxvdyBjYW5ub3QgYmUgc3RhcnRlZC5cbiAgICovXG4gIFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9SRUpFQ1RfRFVQTElDQVRFID0gMyxcblxuICAvKipcbiAgICogVGVybWluYXRlIHRoZSBjdXJyZW50IHdvcmtmbG93IGlmIG9uZSBpcyBhbHJlYWR5IHJ1bm5pbmcuXG4gICAqL1xuICBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfVEVSTUlOQVRFX0lGX1JVTk5JTkcgPSA0LFxufVxuXG5jaGVja0V4dGVuZHM8dGVtcG9yYWwuYXBpLmVudW1zLnYxLldvcmtmbG93SWRSZXVzZVBvbGljeSwgV29ya2Zsb3dJZFJldXNlUG9saWN5PigpO1xuY2hlY2tFeHRlbmRzPFdvcmtmbG93SWRSZXVzZVBvbGljeSwgdGVtcG9yYWwuYXBpLmVudW1zLnYxLldvcmtmbG93SWRSZXVzZVBvbGljeT4oKTtcblxuZXhwb3J0IGludGVyZmFjZSBCYXNlV29ya2Zsb3dPcHRpb25zIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgYSBXb3JrZmxvdyBjYW4gYmUgc3RhcnRlZCB3aXRoIGEgV29ya2Zsb3cgSWQgb2YgYSBDbG9zZWQgV29ya2Zsb3cuXG4gICAqXG4gICAqICpOb3RlOiBBIFdvcmtmbG93IGNhbiBuZXZlciBiZSBzdGFydGVkIHdpdGggYSBXb3JrZmxvdyBJZCBvZiBhIFJ1bm5pbmcgV29ya2Zsb3cuKlxuICAgKlxuICAgKiBAZGVmYXVsdCB7QGxpbmsgV29ya2Zsb3dJZFJldXNlUG9saWN5LldPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9BTExPV19EVVBMSUNBVEV9XG4gICAqL1xuICB3b3JrZmxvd0lkUmV1c2VQb2xpY3k/OiBXb3JrZmxvd0lkUmV1c2VQb2xpY3k7XG5cbiAgLyoqXG4gICAqIENvbnRyb2xzIGhvdyBhIFdvcmtmbG93IEV4ZWN1dGlvbiBpcyByZXRyaWVkLlxuICAgKlxuICAgKiBCeSBkZWZhdWx0LCBXb3JrZmxvdyBFeGVjdXRpb25zIGFyZSBub3QgcmV0cmllZC4gRG8gbm90IG92ZXJyaWRlIHRoaXMgYmVoYXZpb3IgdW5sZXNzIHlvdSBrbm93IHdoYXQgeW91J3JlIGRvaW5nLlxuICAgKiB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2NvbmNlcHRzL3doYXQtaXMtYS1yZXRyeS1wb2xpY3kvIHwgTW9yZSBpbmZvcm1hdGlvbn0uXG4gICAqL1xuICByZXRyeT86IFJldHJ5UG9saWN5O1xuXG4gIC8qKlxuICAgKiBPcHRpb25hbCBjcm9uIHNjaGVkdWxlIGZvciBXb3JrZmxvdy4gSWYgYSBjcm9uIHNjaGVkdWxlIGlzIHNwZWNpZmllZCwgdGhlIFdvcmtmbG93IHdpbGwgcnVuIGFzIGEgY3JvbiBiYXNlZCBvbiB0aGVcbiAgICogc2NoZWR1bGUuIFRoZSBzY2hlZHVsaW5nIHdpbGwgYmUgYmFzZWQgb24gVVRDIHRpbWUuIFRoZSBzY2hlZHVsZSBmb3IgdGhlIG5leHQgcnVuIG9ubHkgaGFwcGVucyBhZnRlciB0aGUgY3VycmVudFxuICAgKiBydW4gaXMgY29tcGxldGVkL2ZhaWxlZC90aW1lb3V0LiBJZiBhIFJldHJ5UG9saWN5IGlzIGFsc28gc3VwcGxpZWQsIGFuZCB0aGUgV29ya2Zsb3cgZmFpbGVkIG9yIHRpbWVkIG91dCwgdGhlXG4gICAqIFdvcmtmbG93IHdpbGwgYmUgcmV0cmllZCBiYXNlZCBvbiB0aGUgcmV0cnkgcG9saWN5LiBXaGlsZSB0aGUgV29ya2Zsb3cgaXMgcmV0cnlpbmcsIGl0IHdvbid0IHNjaGVkdWxlIGl0cyBuZXh0IHJ1bi5cbiAgICogSWYgdGhlIG5leHQgc2NoZWR1bGUgaXMgZHVlIHdoaWxlIHRoZSBXb3JrZmxvdyBpcyBydW5uaW5nIChvciByZXRyeWluZyksIHRoZW4gaXQgd2lsbCBza2lwIHRoYXQgc2NoZWR1bGUuIENyb25cbiAgICogV29ya2Zsb3cgd2lsbCBub3Qgc3RvcCB1bnRpbCBpdCBpcyB0ZXJtaW5hdGVkIG9yIGNhbmNlbGxlZCAoYnkgcmV0dXJuaW5nIHRlbXBvcmFsLkNhbmNlbGVkRXJyb3IpLlxuICAgKiBodHRwczovL2Nyb250YWIuZ3VydS8gaXMgdXNlZnVsIGZvciB0ZXN0aW5nIHlvdXIgY3JvbiBleHByZXNzaW9ucy5cbiAgICovXG4gIGNyb25TY2hlZHVsZT86IHN0cmluZztcblxuICAvKipcbiAgICogU3BlY2lmaWVzIGFkZGl0aW9uYWwgbm9uLWluZGV4ZWQgaW5mb3JtYXRpb24gdG8gYXR0YWNoIHRvIHRoZSBXb3JrZmxvdyBFeGVjdXRpb24uIFRoZSB2YWx1ZXMgY2FuIGJlIGFueXRoaW5nIHRoYXRcbiAgICogaXMgc2VyaWFsaXphYmxlIGJ5IHtAbGluayBEYXRhQ29udmVydGVyfS5cbiAgICovXG4gIG1lbW8/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICAvKipcbiAgICogU3BlY2lmaWVzIGFkZGl0aW9uYWwgaW5kZXhlZCBpbmZvcm1hdGlvbiB0byBhdHRhY2ggdG8gdGhlIFdvcmtmbG93IEV4ZWN1dGlvbi4gTW9yZSBpbmZvOlxuICAgKiBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vZG9jcy90eXBlc2NyaXB0L3NlYXJjaC1hdHRyaWJ1dGVzXG4gICAqXG4gICAqIFZhbHVlcyBhcmUgYWx3YXlzIGNvbnZlcnRlZCB1c2luZyB7QGxpbmsgSnNvblBheWxvYWRDb252ZXJ0ZXJ9LCBldmVuIHdoZW4gYSBjdXN0b20gZGF0YSBjb252ZXJ0ZXIgaXMgcHJvdmlkZWQuXG4gICAqL1xuICBzZWFyY2hBdHRyaWJ1dGVzPzogU2VhcmNoQXR0cmlidXRlcztcbn1cblxuZXhwb3J0IHR5cGUgV2l0aFdvcmtmbG93QXJnczxXIGV4dGVuZHMgV29ya2Zsb3csIFQ+ID0gVCAmXG4gIChQYXJhbWV0ZXJzPFc+IGV4dGVuZHMgW2FueSwgLi4uYW55W11dXG4gICAgPyB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgV29ya2Zsb3dcbiAgICAgICAgICovXG4gICAgICAgIGFyZ3M6IFBhcmFtZXRlcnM8Vz4gfCBSZWFkb25seTxQYXJhbWV0ZXJzPFc+PjtcbiAgICAgIH1cbiAgICA6IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBXb3JrZmxvd1xuICAgICAgICAgKi9cbiAgICAgICAgYXJncz86IFBhcmFtZXRlcnM8Vz4gfCBSZWFkb25seTxQYXJhbWV0ZXJzPFc+PjtcbiAgICAgIH0pO1xuXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93RHVyYXRpb25PcHRpb25zIHtcbiAgLyoqXG4gICAqIFRoZSB0aW1lIGFmdGVyIHdoaWNoIHdvcmtmbG93IHJ1biBpcyBhdXRvbWF0aWNhbGx5IHRlcm1pbmF0ZWQgYnkgVGVtcG9yYWwgc2VydmljZS4gRG8gbm90XG4gICAqIHJlbHkgb24gcnVuIHRpbWVvdXQgZm9yIGJ1c2luZXNzIGxldmVsIHRpbWVvdXRzLiBJdCBpcyBwcmVmZXJyZWQgdG8gdXNlIGluIHdvcmtmbG93IHRpbWVyc1xuICAgKiBmb3IgdGhpcyBwdXJwb3NlLlxuICAgKlxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHdvcmtmbG93UnVuVGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKlxuICAgKiBUaGUgdGltZSBhZnRlciB3aGljaCB3b3JrZmxvdyBleGVjdXRpb24gKHdoaWNoIGluY2x1ZGVzIHJ1biByZXRyaWVzIGFuZCBjb250aW51ZSBhcyBuZXcpIGlzXG4gICAqIGF1dG9tYXRpY2FsbHkgdGVybWluYXRlZCBieSBUZW1wb3JhbCBzZXJ2aWNlLiBEbyBub3QgcmVseSBvbiBleGVjdXRpb24gdGltZW91dCBmb3IgYnVzaW5lc3NcbiAgICogbGV2ZWwgdGltZW91dHMuIEl0IGlzIHByZWZlcnJlZCB0byB1c2UgaW4gd29ya2Zsb3cgdGltZXJzIGZvciB0aGlzIHB1cnBvc2UuXG4gICAqXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgd29ya2Zsb3dFeGVjdXRpb25UaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIE1heGltdW0gZXhlY3V0aW9uIHRpbWUgb2YgYSBzaW5nbGUgd29ya2Zsb3cgdGFzay4gRGVmYXVsdCBpcyAxMCBzZWNvbmRzLlxuICAgKlxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHdvcmtmbG93VGFza1RpbWVvdXQ/OiBEdXJhdGlvbjtcbn1cblxuZXhwb3J0IHR5cGUgQ29tbW9uV29ya2Zsb3dPcHRpb25zID0gQmFzZVdvcmtmbG93T3B0aW9ucyAmIFdvcmtmbG93RHVyYXRpb25PcHRpb25zO1xuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFdvcmtmbG93VHlwZTxUIGV4dGVuZHMgV29ya2Zsb3c+KHdvcmtmbG93VHlwZU9yRnVuYzogc3RyaW5nIHwgVCk6IHN0cmluZyB7XG4gIGlmICh0eXBlb2Ygd29ya2Zsb3dUeXBlT3JGdW5jID09PSAnc3RyaW5nJykgcmV0dXJuIHdvcmtmbG93VHlwZU9yRnVuYyBhcyBzdHJpbmc7XG4gIGlmICh0eXBlb2Ygd29ya2Zsb3dUeXBlT3JGdW5jID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaWYgKHdvcmtmbG93VHlwZU9yRnVuYz8ubmFtZSkgcmV0dXJuIHdvcmtmbG93VHlwZU9yRnVuYy5uYW1lO1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgd29ya2Zsb3cgdHlwZTogdGhlIHdvcmtmbG93IGZ1bmN0aW9uIGlzIGFub255bW91cycpO1xuICB9XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgYEludmFsaWQgd29ya2Zsb3cgdHlwZTogZXhwZWN0ZWQgZWl0aGVyIGEgc3RyaW5nIG9yIGEgZnVuY3Rpb24sIGdvdCAnJHt0eXBlb2Ygd29ya2Zsb3dUeXBlT3JGdW5jfSdgXG4gICk7XG59XG4iLCIvLyBBIHBvcnQgb2YgYW4gYWxnb3JpdGhtIGJ5IEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2UuY29tPiwgMjAxMFxuLy8gaHR0cDovL2JhYWdvZS5jb20vZW4vUmFuZG9tTXVzaW5ncy9qYXZhc2NyaXB0L1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL25xdWlubGFuL2JldHRlci1yYW5kb20tbnVtYmVycy1mb3ItamF2YXNjcmlwdC1taXJyb3Jcbi8vIE9yaWdpbmFsIHdvcmsgaXMgdW5kZXIgTUlUIGxpY2Vuc2UgLVxuXG4vLyBDb3B5cmlnaHQgKEMpIDIwMTAgYnkgSm9oYW5uZXMgQmFhZ8O4ZSA8YmFhZ29lQGJhYWdvZS5vcmc+XG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLy8gVGFrZW4gYW5kIG1vZGlmaWVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2RhdmlkYmF1L3NlZWRyYW5kb20vYmxvYi9yZWxlYXNlZC9saWIvYWxlYS5qc1xuXG5jbGFzcyBBbGVhIHtcbiAgcHVibGljIGM6IG51bWJlcjtcbiAgcHVibGljIHMwOiBudW1iZXI7XG4gIHB1YmxpYyBzMTogbnVtYmVyO1xuICBwdWJsaWMgczI6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihzZWVkOiBudW1iZXJbXSkge1xuICAgIGNvbnN0IG1hc2ggPSBuZXcgTWFzaCgpO1xuICAgIC8vIEFwcGx5IHRoZSBzZWVkaW5nIGFsZ29yaXRobSBmcm9tIEJhYWdvZS5cbiAgICB0aGlzLmMgPSAxO1xuICAgIHRoaXMuczAgPSBtYXNoLm1hc2goWzMyXSk7XG4gICAgdGhpcy5zMSA9IG1hc2gubWFzaChbMzJdKTtcbiAgICB0aGlzLnMyID0gbWFzaC5tYXNoKFszMl0pO1xuICAgIHRoaXMuczAgLT0gbWFzaC5tYXNoKHNlZWQpO1xuICAgIGlmICh0aGlzLnMwIDwgMCkge1xuICAgICAgdGhpcy5zMCArPSAxO1xuICAgIH1cbiAgICB0aGlzLnMxIC09IG1hc2gubWFzaChzZWVkKTtcbiAgICBpZiAodGhpcy5zMSA8IDApIHtcbiAgICAgIHRoaXMuczEgKz0gMTtcbiAgICB9XG4gICAgdGhpcy5zMiAtPSBtYXNoLm1hc2goc2VlZCk7XG4gICAgaWYgKHRoaXMuczIgPCAwKSB7XG4gICAgICB0aGlzLnMyICs9IDE7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIG5leHQoKTogbnVtYmVyIHtcbiAgICBjb25zdCB0ID0gMjA5MTYzOSAqIHRoaXMuczAgKyB0aGlzLmMgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICAgIHRoaXMuczAgPSB0aGlzLnMxO1xuICAgIHRoaXMuczEgPSB0aGlzLnMyO1xuICAgIHJldHVybiAodGhpcy5zMiA9IHQgLSAodGhpcy5jID0gdCB8IDApKTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBSTkcgPSAoKSA9PiBudW1iZXI7XG5cbmV4cG9ydCBmdW5jdGlvbiBhbGVhKHNlZWQ6IG51bWJlcltdKTogUk5HIHtcbiAgY29uc3QgeGcgPSBuZXcgQWxlYShzZWVkKTtcbiAgcmV0dXJuIHhnLm5leHQuYmluZCh4Zyk7XG59XG5cbmV4cG9ydCBjbGFzcyBNYXNoIHtcbiAgcHJpdmF0ZSBuID0gMHhlZmM4MjQ5ZDtcblxuICBwdWJsaWMgbWFzaChkYXRhOiBudW1iZXJbXSk6IG51bWJlciB7XG4gICAgbGV0IHsgbiB9ID0gdGhpcztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIG4gKz0gZGF0YVtpXTtcbiAgICAgIGxldCBoID0gMC4wMjUxOTYwMzI4MjQxNjkzOCAqIG47XG4gICAgICBuID0gaCA+Pj4gMDtcbiAgICAgIGggLT0gbjtcbiAgICAgIGggKj0gbjtcbiAgICAgIG4gPSBoID4+PiAwO1xuICAgICAgaCAtPSBuO1xuICAgICAgbiArPSBoICogMHgxMDAwMDAwMDA7IC8vIDJeMzJcbiAgICB9XG4gICAgdGhpcy5uID0gbjtcbiAgICByZXR1cm4gKG4gPj4+IDApICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgfVxufVxuIiwiaW1wb3J0IHR5cGUgeyBBc3luY0xvY2FsU3RvcmFnZSBhcyBBTFMgfSBmcm9tICdub2RlOmFzeW5jX2hvb2tzJztcbmltcG9ydCB7IENhbmNlbGxlZEZhaWx1cmUsIER1cmF0aW9uLCBJbGxlZ2FsU3RhdGVFcnJvciB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyBtc09wdGlvbmFsVG9OdW1iZXIgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3RpbWUnO1xuaW1wb3J0IHsgdW50cmFja1Byb21pc2UgfSBmcm9tICcuL3N0YWNrLWhlbHBlcnMnO1xuaW1wb3J0IHsgZ2V0QWN0aXZhdG9yIH0gZnJvbSAnLi9nbG9iYWwtYXR0cmlidXRlcyc7XG5pbXBvcnQgeyBTZGtGbGFncyB9IGZyb20gJy4vZmxhZ3MnO1xuXG4vLyBBc3luY0xvY2FsU3RvcmFnZSBpcyBpbmplY3RlZCB2aWEgdm0gbW9kdWxlIGludG8gZ2xvYmFsIHNjb3BlLlxuLy8gSW4gY2FzZSBXb3JrZmxvdyBjb2RlIGlzIGltcG9ydGVkIGluIE5vZGUuanMgY29udGV4dCwgcmVwbGFjZSB3aXRoIGFuIGVtcHR5IGNsYXNzLlxuZXhwb3J0IGNvbnN0IEFzeW5jTG9jYWxTdG9yYWdlOiBuZXcgPFQ+KCkgPT4gQUxTPFQ+ID0gKGdsb2JhbFRoaXMgYXMgYW55KS5Bc3luY0xvY2FsU3RvcmFnZSA/PyBjbGFzcyB7fTtcblxuLyoqIE1hZ2ljIHN5bWJvbCB1c2VkIHRvIGNyZWF0ZSB0aGUgcm9vdCBzY29wZSAtIGludGVudGlvbmFsbHkgbm90IGV4cG9ydGVkICovXG5jb25zdCBOT19QQVJFTlQgPSBTeW1ib2woJ05PX1BBUkVOVCcpO1xuXG4vKipcbiAqIE9wdGlvbiBmb3IgY29uc3RydWN0aW5nIGEgQ2FuY2VsbGF0aW9uU2NvcGVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDYW5jZWxsYXRpb25TY29wZU9wdGlvbnMge1xuICAvKipcbiAgICogVGltZSBpbiBtaWxsaXNlY29uZHMgYmVmb3JlIHRoZSBzY29wZSBjYW5jZWxsYXRpb24gaXMgYXV0b21hdGljYWxseSByZXF1ZXN0ZWRcbiAgICovXG4gIHRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogSWYgZmFsc2UsIHByZXZlbnQgb3V0ZXIgY2FuY2VsbGF0aW9uIGZyb20gcHJvcGFnYXRpbmcgdG8gaW5uZXIgc2NvcGVzLCBBY3Rpdml0aWVzLCB0aW1lcnMsIGFuZCBUcmlnZ2VycywgZGVmYXVsdHMgdG8gdHJ1ZS5cbiAgICogKFNjb3BlIHN0aWxsIHByb3BhZ2F0ZXMgQ2FuY2VsbGVkRmFpbHVyZSB0aHJvd24gZnJvbSB3aXRoaW4pLlxuICAgKi9cbiAgY2FuY2VsbGFibGU6IGJvb2xlYW47XG4gIC8qKlxuICAgKiBBbiBvcHRpb25hbCBDYW5jZWxsYXRpb25TY29wZSAodXNlZnVsIGZvciBydW5uaW5nIGJhY2tncm91bmQgdGFza3MpLlxuICAgKiBUaGUgYE5PX1BBUkVOVGAgc3ltYm9sIGlzIHJlc2VydmVkIGZvciB0aGUgcm9vdCBzY29wZS5cbiAgICovXG4gIHBhcmVudD86IENhbmNlbGxhdGlvblNjb3BlIHwgdHlwZW9mIE5PX1BBUkVOVDtcbn1cblxuLyoqXG4gKiBDYW5jZWxsYXRpb24gU2NvcGVzIHByb3ZpZGUgdGhlIG1lY2hhbmljIGJ5IHdoaWNoIGEgV29ya2Zsb3cgbWF5IGdyYWNlZnVsbHkgaGFuZGxlIGluY29taW5nIHJlcXVlc3RzIGZvciBjYW5jZWxsYXRpb25cbiAqIChlLmcuIGluIHJlc3BvbnNlIHRvIHtAbGluayBXb3JrZmxvd0hhbmRsZS5jYW5jZWx9IG9yIHRocm91Z2ggdGhlIFVJIG9yIENMSSksIGFzIHdlbGwgYXMgcmVxdWVzdCBjYW5jZWxhdGlvbiBvZlxuICogY2FuY2VsbGFibGUgb3BlcmF0aW9ucyBpdCBvd25zIChlLmcuIEFjdGl2aXRpZXMsIFRpbWVycywgQ2hpbGQgV29ya2Zsb3dzLCBldGMpLlxuICpcbiAqIENhbmNlbGxhdGlvbiBTY29wZXMgZm9ybSBhIHRyZWUsIHdpdGggdGhlIFdvcmtmbG93J3MgbWFpbiBmdW5jdGlvbiBydW5uaW5nIGluIHRoZSByb290IHNjb3BlIG9mIHRoYXQgdHJlZS5cbiAqIEJ5IGRlZmF1bHQsIGNhbmNlbGxhdGlvbiBwcm9wYWdhdGVzIGRvd24gZnJvbSBhIHBhcmVudCBzY29wZSB0byBpdHMgY2hpbGRyZW4gYW5kIGl0cyBjYW5jZWxsYWJsZSBvcGVyYXRpb25zLlxuICogQSBub24tY2FuY2VsbGFibGUgc2NvcGUgY2FuIHJlY2VpdmUgY2FuY2VsbGF0aW9uIHJlcXVlc3RzLCBidXQgaXMgbmV2ZXIgZWZmZWN0aXZlbHkgY29uc2lkZXJlZCBhcyBjYW5jZWxsZWQsXG4gKiB0aHVzIHNoaWVsZGRpbmcgaXRzIGNoaWxkcmVuIGFuZCBjYW5jZWxsYWJsZSBvcGVyYXRpb25zIGZyb20gcHJvcGFnYXRpb24gb2YgY2FuY2VsbGF0aW9uIHJlcXVlc3RzIGl0IHJlY2VpdmVzLlxuICpcbiAqIFNjb3BlcyBhcmUgY3JlYXRlZCB1c2luZyB0aGUgYENhbmNlbGxhdGlvblNjb3BlYCBjb25zdHJ1Y3RvciBvciB0aGUgc3RhdGljIGhlbHBlciBtZXRob2RzIHtAbGluayBjYW5jZWxsYWJsZX0sXG4gKiB7QGxpbmsgbm9uQ2FuY2VsbGFibGV9IGFuZCB7QGxpbmsgd2l0aFRpbWVvdXR9LiBgd2l0aFRpbWVvdXRgIGNyZWF0ZXMgYSBzY29wZSB0aGF0IGF1dG9tYXRpY2FsbHkgY2FuY2VscyBpdHNlbGYgYWZ0ZXJcbiAqIHNvbWUgZHVyYXRpb24uXG4gKlxuICogQ2FuY2VsbGF0aW9uIG9mIGEgY2FuY2VsbGFibGUgc2NvcGUgcmVzdWx0cyBpbiBhbGwgb3BlcmF0aW9ucyBjcmVhdGVkIGRpcmVjdGx5IGluIHRoYXQgc2NvcGUgdG8gdGhyb3cgYVxuICoge0BsaW5rIENhbmNlbGxlZEZhaWx1cmV9IChlaXRoZXIgZGlyZWN0bHksIG9yIGFzIHRoZSBgY2F1c2VgIG9mIGFuIHtAbGluayBBY3Rpdml0eUZhaWx1cmV9IG9yIGFcbiAqIHtAbGluayBDaGlsZFdvcmtmbG93RmFpbHVyZX0pLiBGdXJ0aGVyIGF0dGVtcHQgdG8gY3JlYXRlIG5ldyBjYW5jZWxsYWJsZSBzY29wZXMgb3IgY2FuY2VsbGFibGUgb3BlcmF0aW9ucyB3aXRoaW4gYVxuICogc2NvcGUgdGhhdCBoYXMgYWxyZWFkeSBiZWVuIGNhbmNlbGxlZCB3aWxsIGFsc28gaW1tZWRpYXRlbHkgdGhyb3cgYSB7QGxpbmsgQ2FuY2VsbGVkRmFpbHVyZX0gZXhjZXB0aW9uLiBJdCBpcyBob3dldmVyXG4gKiBwb3NzaWJsZSB0byBjcmVhdGUgYSBub24tY2FuY2VsbGFibGUgc2NvcGUgYXQgdGhhdCBwb2ludDsgdGhpcyBpcyBvZnRlbiB1c2VkIHRvIGV4ZWN1dGUgcm9sbGJhY2sgb3IgY2xlYW51cFxuICogb3BlcmF0aW9ucy4gRm9yIGV4YW1wbGU6XG4gKlxuICogYGBgdHNcbiAqIGFzeW5jIGZ1bmN0aW9uIG15V29ya2Zsb3coLi4uKTogUHJvbWlzZTx2b2lkPiB7XG4gKiAgIHRyeSB7XG4gKiAgICAgLy8gVGhpcyBhY3Rpdml0eSBydW5zIGluIHRoZSByb290IGNhbmNlbGxhdGlvbiBzY29wZS4gVGhlcmVmb3JlLCBhIGNhbmNlbGF0aW9uIHJlcXVlc3Qgb25cbiAqICAgICAvLyB0aGUgV29ya2Zsb3cgZXhlY3V0aW9uIChlLmcuIHRocm91Z2ggdGhlIFVJIG9yIENMSSkgYXV0b21hdGljYWxseSBwcm9wYWdhdGVzIHRvIHRoaXNcbiAqICAgICAvLyBhY3Rpdml0eS4gQXNzdW1pbmcgdGhhdCB0aGUgYWN0aXZpdHkgcHJvcGVybHkgaGFuZGxlIHRoZSBjYW5jZWxsYXRpb24gcmVxdWVzdCwgdGhlbiB0aGVcbiAqICAgICAvLyBjYWxsIGJlbG93IHdpbGwgdGhyb3cgYW4gYEFjdGl2aXR5RmFpbHVyZWAgZXhjZXB0aW9uLCB3aXRoIGBjYXVzZWAgc2V0cyB0byBhblxuICogICAgIC8vIGluc3RhbmNlIG9mIGBDYW5jZWxsZWRGYWlsdXJlYC5cbiAqICAgICBhd2FpdCBzb21lQWN0aXZpdHkoKTtcbiAqICAgfSBjYXRjaCAoZSkge1xuICogICAgIGlmIChpc0NhbmNlbGxhdGlvbihlKSkge1xuICogICAgICAgLy8gUnVuIGNsZWFudXAgYWN0aXZpdHkgaW4gYSBub24tY2FuY2VsbGFibGUgc2NvcGVcbiAqICAgICAgIGF3YWl0IENhbmNlbGxhdGlvblNjb3BlLm5vbkNhbmNlbGxhYmxlKGFzeW5jICgpID0+IHtcbiAqICAgICAgICAgYXdhaXQgY2xlYW51cEFjdGl2aXR5KCk7XG4gKiAgICAgICB9XG4gKiAgICAgfSBlbHNlIHtcbiAqICAgICAgIHRocm93IGU7XG4gKiAgICAgfVxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBBIGNhbmNlbGxhYmxlIHNjb3BlIG1heSBiZSBwcm9ncmFtYXRpY2FsbHkgY2FuY2VsbGVkIGJ5IGNhbGxpbmcge0BsaW5rIGNhbmNlbHxgc2NvcGUuY2FuY2VsKClgfWAuIFRoaXMgbWF5IGJlIHVzZWQsXG4gKiBmb3IgZXhhbXBsZSwgdG8gZXhwbGljaXRseSByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiBhbiBBY3Rpdml0eSBvciBDaGlsZCBXb3JrZmxvdzpcbiAqXG4gKiBgYGB0c1xuICogY29uc3QgY2FuY2VsbGFibGVBY3Rpdml0eVNjb3BlID0gbmV3IENhbmNlbGxhdGlvblNjb3BlKCk7XG4gKiBjb25zdCBhY3Rpdml0eVByb21pc2UgPSBjYW5jZWxsYWJsZUFjdGl2aXR5U2NvcGUucnVuKCgpID0+IHNvbWVBY3Rpdml0eSgpKTtcbiAqIGNhbmNlbGxhYmxlQWN0aXZpdHlTY29wZS5jYW5jZWwoKTsgLy8gQ2FuY2VscyB0aGUgYWN0aXZpdHlcbiAqIGF3YWl0IGFjdGl2aXR5UHJvbWlzZTsgLy8gVGhyb3dzIGBBY3Rpdml0eUZhaWx1cmVgIHdpdGggYGNhdXNlYCBzZXQgdG8gYENhbmNlbGxlZEZhaWx1cmVgXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIENhbmNlbGxhdGlvblNjb3BlIHtcbiAgLyoqXG4gICAqIFRpbWUgaW4gbWlsbGlzZWNvbmRzIGJlZm9yZSB0aGUgc2NvcGUgY2FuY2VsbGF0aW9uIGlzIGF1dG9tYXRpY2FsbHkgcmVxdWVzdGVkXG4gICAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgdGltZW91dD86IG51bWJlcjtcblxuICAvKipcbiAgICogSWYgZmFsc2UsIHRoZW4gdGhpcyBzY29wZSB3aWxsIG5ldmVyIGJlIGNvbnNpZGVyZWQgY2FuY2VsbGVkLCBldmVuIGlmIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgaXMgcmVjZWl2ZWQgKGVpdGhlclxuICAgKiBkaXJlY3RseSBieSBjYWxsaW5nIGBzY29wZS5jYW5jZWwoKWAgb3IgaW5kaXJlY3RseSBieSBjYW5jZWxsaW5nIGEgY2FuY2VsbGFibGUgcGFyZW50IHNjb3BlKS4gVGhpcyBlZmZlY3RpdmVseVxuICAgKiBzaGllbGRzIHRoZSBzY29wZSdzIGNoaWxkcmVuIGFuZCBjYW5jZWxsYWJsZSBvcGVyYXRpb25zIGZyb20gcHJvcGFnYXRpb24gb2YgY2FuY2VsbGF0aW9uIHJlcXVlc3RzIG1hZGUgb24gdGhlXG4gICAqIG5vbi1jYW5jZWxsYWJsZSBzY29wZS5cbiAgICpcbiAgICogTm90ZSB0aGF0IHRoZSBQcm9taXNlIHJldHVybmVkIGJ5IHRoZSBgcnVuYCBmdW5jdGlvbiBvZiBub24tY2FuY2VsbGFibGUgc2NvcGUgbWF5IHN0aWxsIHRocm93IGEgYENhbmNlbGxlZEZhaWx1cmVgXG4gICAqIGlmIHN1Y2ggYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIHdpdGhpbiB0aGF0IHNjb3BlIChlLmcuIGJ5IGRpcmVjdGx5IGNhbmNlbGxpbmcgYSBjYW5jZWxsYWJsZSBjaGlsZCBzY29wZSkuXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgY2FuY2VsbGFibGU6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEFuIG9wdGlvbmFsIENhbmNlbGxhdGlvblNjb3BlICh1c2VmdWwgZm9yIHJ1bm5pbmcgYmFja2dyb3VuZCB0YXNrcyksIGRlZmF1bHRzIHRvIHtAbGluayBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50fSgpXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgcGFyZW50PzogQ2FuY2VsbGF0aW9uU2NvcGU7XG5cbiAgLyoqXG4gICAqIEEgUHJvbWlzZSB0aGF0IHRocm93cyB3aGVuIGEgY2FuY2VsbGFibGUgc2NvcGUgcmVjZWl2ZXMgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCwgZWl0aGVyIGRpcmVjdGx5XG4gICAqIChpLmUuIGBzY29wZS5jYW5jZWwoKWApLCBvciBpbmRpcmVjdGx5IChieSBjYW5jZWxsaW5nIGEgY2FuY2VsbGFibGUgcGFyZW50IHNjb3BlKS5cbiAgICpcbiAgICogTm90ZSB0aGF0IGEgbm9uLWNhbmNlbGxhYmxlIHNjb3BlIG1heSByZWNlaXZlIGNhbmNlbGxhdGlvbiByZXF1ZXN0cywgcmVzdWx0aW5nIGluIHRoZSBgY2FuY2VsUmVxdWVzdGVkYCBwcm9taXNlIGZvclxuICAgKiB0aGF0IHNjb3BlIHRvIHRocm93LCB0aG91Z2ggdGhlIHNjb3BlIHdpbGwgbm90IGVmZmVjdGl2ZWx5IGdldCBjYW5jZWxsZWQgKGkuZS4gYGNvbnNpZGVyZWRDYW5jZWxsZWRgIHdpbGwgc3RpbGxcbiAgICogcmV0dXJuIGBmYWxzZWAsIGFuZCBjYW5jZWxsYXRpb24gd2lsbCBub3QgYmUgcHJvcGFnYXRlZCB0byBjaGlsZCBzY29wZXMgYW5kIGNvbnRhaW5lZCBvcGVyYXRpb25zKS5cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBjYW5jZWxSZXF1ZXN0ZWQ6IFByb21pc2U8bmV2ZXI+O1xuXG4gICNjYW5jZWxSZXF1ZXN0ZWQgPSBmYWxzZTtcblxuICAvLyBUeXBlc2NyaXB0IGRvZXMgbm90IHVuZGVyc3RhbmQgdGhhdCB0aGUgUHJvbWlzZSBleGVjdXRvciBydW5zIHN5bmNocm9ub3VzbHkgaW4gdGhlIGNvbnN0cnVjdG9yXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgLy8gQHRzLWlnbm9yZVxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgcmVqZWN0OiAocmVhc29uPzogYW55KSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM/OiBDYW5jZWxsYXRpb25TY29wZU9wdGlvbnMpIHtcbiAgICB0aGlzLnRpbWVvdXQgPSBtc09wdGlvbmFsVG9OdW1iZXIob3B0aW9ucz8udGltZW91dCk7XG4gICAgdGhpcy5jYW5jZWxsYWJsZSA9IG9wdGlvbnM/LmNhbmNlbGxhYmxlID8/IHRydWU7XG4gICAgdGhpcy5jYW5jZWxSZXF1ZXN0ZWQgPSBuZXcgUHJvbWlzZSgoXywgcmVqZWN0KSA9PiB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRTQyBkb2Vzbid0IHVuZGVyc3RhbmQgdGhhdCB0aGUgUHJvbWlzZSBleGVjdXRvciBydW5zIHN5bmNocm9ub3VzbHlcbiAgICAgIHRoaXMucmVqZWN0ID0gKGVycikgPT4ge1xuICAgICAgICB0aGlzLiNjYW5jZWxSZXF1ZXN0ZWQgPSB0cnVlO1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH07XG4gICAgfSk7XG4gICAgdW50cmFja1Byb21pc2UodGhpcy5jYW5jZWxSZXF1ZXN0ZWQpO1xuICAgIC8vIEF2b2lkIHVuaGFuZGxlZCByZWplY3Rpb25zXG4gICAgdW50cmFja1Byb21pc2UodGhpcy5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKCkgPT4gdW5kZWZpbmVkKSk7XG4gICAgaWYgKG9wdGlvbnM/LnBhcmVudCAhPT0gTk9fUEFSRU5UKSB7XG4gICAgICB0aGlzLnBhcmVudCA9IG9wdGlvbnM/LnBhcmVudCB8fCBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMucGFyZW50LmNhbmNlbGxhYmxlIHx8XG4gICAgICAgICh0aGlzLnBhcmVudC4jY2FuY2VsUmVxdWVzdGVkICYmXG4gICAgICAgICAgIWdldEFjdGl2YXRvcigpLmhhc0ZsYWcoU2RrRmxhZ3MuTm9uQ2FuY2VsbGFibGVTY29wZXNBcmVTaGllbGRlZEZyb21Qcm9wYWdhdGlvbikpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy4jY2FuY2VsUmVxdWVzdGVkID0gdGhpcy5wYXJlbnQuI2NhbmNlbFJlcXVlc3RlZDtcbiAgICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgICAgdGhpcy5wYXJlbnQuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVqZWN0KGVycik7XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICAgIHRoaXMucGFyZW50LmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWdldEFjdGl2YXRvcigpLmhhc0ZsYWcoU2RrRmxhZ3MuTm9uQ2FuY2VsbGFibGVTY29wZXNBcmVTaGllbGRlZEZyb21Qcm9wYWdhdGlvbikpIHtcbiAgICAgICAgICAgICAgdGhpcy5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBzY29wZSB3YXMgZWZmZWN0aXZlbHkgY2FuY2VsbGVkLiBBIG5vbi1jYW5jZWxsYWJsZSBzY29wZSBjYW4gbmV2ZXIgYmUgY29uc2lkZXJlZCBjYW5jZWxsZWQuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGNvbnNpZGVyZWRDYW5jZWxsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuI2NhbmNlbFJlcXVlc3RlZCAmJiB0aGlzLmNhbmNlbGxhYmxlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlIHRoZSBzY29wZSBhcyBjdXJyZW50IGFuZCBydW4gIGBmbmBcbiAgICpcbiAgICogQW55IHRpbWVycywgQWN0aXZpdGllcywgVHJpZ2dlcnMgYW5kIENhbmNlbGxhdGlvblNjb3BlcyBjcmVhdGVkIGluIHRoZSBib2R5IG9mIGBmbmBcbiAgICogYXV0b21hdGljYWxseSBsaW5rIHRoZWlyIGNhbmNlbGxhdGlvbiB0byB0aGlzIHNjb3BlLlxuICAgKlxuICAgKiBAcmV0dXJuIHRoZSByZXN1bHQgb2YgYGZuYFxuICAgKi9cbiAgcnVuPFQ+KGZuOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIHN0b3JhZ2UucnVuKHRoaXMsIHRoaXMucnVuSW5Db250ZXh0LmJpbmQodGhpcywgZm4pIGFzICgpID0+IFByb21pc2U8VD4pO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ldGhvZCB0aGF0IHJ1bnMgYSBmdW5jdGlvbiBpbiBBc3luY0xvY2FsU3RvcmFnZSBjb250ZXh0LlxuICAgKlxuICAgKiBDb3VsZCBoYXZlIGJlZW4gd3JpdHRlbiBhcyBhbm9ueW1vdXMgZnVuY3Rpb24sIG1hZGUgaW50byBhIG1ldGhvZCBmb3IgaW1wcm92ZWQgc3RhY2sgdHJhY2VzLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHJ1bkluQ29udGV4dDxUPihmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIGxldCB0aW1lclNjb3BlOiBDYW5jZWxsYXRpb25TY29wZSB8IHVuZGVmaW5lZDtcbiAgICBpZiAodGhpcy50aW1lb3V0KSB7XG4gICAgICB0aW1lclNjb3BlID0gbmV3IENhbmNlbGxhdGlvblNjb3BlKCk7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgdGltZXJTY29wZVxuICAgICAgICAgIC5ydW4oKCkgPT4gc2xlZXAodGhpcy50aW1lb3V0IGFzIG51bWJlcikpXG4gICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAoKSA9PiB0aGlzLmNhbmNlbCgpLFxuICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAvLyBzY29wZSB3YXMgYWxyZWFkeSBjYW5jZWxsZWQsIGlnbm9yZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgZm4oKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKFxuICAgICAgICB0aW1lclNjb3BlICYmXG4gICAgICAgICF0aW1lclNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQgJiZcbiAgICAgICAgZ2V0QWN0aXZhdG9yKCkuaGFzRmxhZyhTZGtGbGFncy5Ob25DYW5jZWxsYWJsZVNjb3Blc0FyZVNoaWVsZGVkRnJvbVByb3BhZ2F0aW9uKVxuICAgICAgKSB7XG4gICAgICAgIHRpbWVyU2NvcGUuY2FuY2VsKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVlc3QgdG8gY2FuY2VsIHRoZSBzY29wZSBhbmQgbGlua2VkIGNoaWxkcmVuXG4gICAqL1xuICBjYW5jZWwoKTogdm9pZCB7XG4gICAgdGhpcy5yZWplY3QobmV3IENhbmNlbGxlZEZhaWx1cmUoJ0NhbmNlbGxhdGlvbiBzY29wZSBjYW5jZWxsZWQnKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IFwiYWN0aXZlXCIgc2NvcGVcbiAgICovXG4gIHN0YXRpYyBjdXJyZW50KCk6IENhbmNlbGxhdGlvblNjb3BlIHtcbiAgICAvLyBVc2luZyBnbG9iYWxzIGRpcmVjdGx5IGluc3RlYWQgb2YgYSBoZWxwZXIgZnVuY3Rpb24gdG8gYXZvaWQgY2lyY3VsYXIgaW1wb3J0XG4gICAgcmV0dXJuIHN0b3JhZ2UuZ2V0U3RvcmUoKSA/PyAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fVEVNUE9SQUxfQUNUSVZBVE9SX18ucm9vdFNjb3BlO1xuICB9XG5cbiAgLyoqIEFsaWFzIHRvIGBuZXcgQ2FuY2VsbGF0aW9uU2NvcGUoeyBjYW5jZWxsYWJsZTogdHJ1ZSB9KS5ydW4oZm4pYCAqL1xuICBzdGF0aWMgY2FuY2VsbGFibGU8VD4oZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gbmV3IHRoaXMoeyBjYW5jZWxsYWJsZTogdHJ1ZSB9KS5ydW4oZm4pO1xuICB9XG5cbiAgLyoqIEFsaWFzIHRvIGBuZXcgQ2FuY2VsbGF0aW9uU2NvcGUoeyBjYW5jZWxsYWJsZTogZmFsc2UgfSkucnVuKGZuKWAgKi9cbiAgc3RhdGljIG5vbkNhbmNlbGxhYmxlPFQ+KGZuOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHsgY2FuY2VsbGFibGU6IGZhbHNlIH0pLnJ1bihmbik7XG4gIH1cblxuICAvKiogQWxpYXMgdG8gYG5ldyBDYW5jZWxsYXRpb25TY29wZSh7IGNhbmNlbGxhYmxlOiB0cnVlLCB0aW1lb3V0IH0pLnJ1bihmbilgICovXG4gIHN0YXRpYyB3aXRoVGltZW91dDxUPih0aW1lb3V0OiBEdXJhdGlvbiwgZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gbmV3IHRoaXMoeyBjYW5jZWxsYWJsZTogdHJ1ZSwgdGltZW91dCB9KS5ydW4oZm4pO1xuICB9XG59XG5cbmNvbnN0IHN0b3JhZ2UgPSBuZXcgQXN5bmNMb2NhbFN0b3JhZ2U8Q2FuY2VsbGF0aW9uU2NvcGU+KCk7XG5cbi8qKlxuICogQXZvaWQgZXhwb3NpbmcgdGhlIHN0b3JhZ2UgZGlyZWN0bHkgc28gaXQgZG9lc24ndCBnZXQgZnJvemVuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNhYmxlU3RvcmFnZSgpOiB2b2lkIHtcbiAgc3RvcmFnZS5kaXNhYmxlKCk7XG59XG5cbmV4cG9ydCBjbGFzcyBSb290Q2FuY2VsbGF0aW9uU2NvcGUgZXh0ZW5kcyBDYW5jZWxsYXRpb25TY29wZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKHsgY2FuY2VsbGFibGU6IHRydWUsIHBhcmVudDogTk9fUEFSRU5UIH0pO1xuICB9XG5cbiAgY2FuY2VsKCk6IHZvaWQge1xuICAgIHRoaXMucmVqZWN0KG5ldyBDYW5jZWxsZWRGYWlsdXJlKCdXb3JrZmxvdyBjYW5jZWxsZWQnKSk7XG4gIH1cbn1cblxuLyoqIFRoaXMgZnVuY3Rpb24gaXMgaGVyZSB0byBhdm9pZCBhIGNpcmN1bGFyIGRlcGVuZGVuY3kgYmV0d2VlbiB0aGlzIG1vZHVsZSBhbmQgd29ya2Zsb3cudHMgKi9cbmxldCBzbGVlcCA9IChfOiBEdXJhdGlvbik6IFByb21pc2U8dm9pZD4gPT4ge1xuICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1dvcmtmbG93IGhhcyBub3QgYmVlbiBwcm9wZXJseSBpbml0aWFsaXplZCcpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyU2xlZXBJbXBsZW1lbnRhdGlvbihmbjogdHlwZW9mIHNsZWVwKTogdm9pZCB7XG4gIHNsZWVwID0gZm47XG59XG4iLCJpbXBvcnQgeyBBY3Rpdml0eUZhaWx1cmUsIENhbmNlbGxlZEZhaWx1cmUsIENoaWxkV29ya2Zsb3dGYWlsdXJlIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHsgY29yZXNkayB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBhbGwgd29ya2Zsb3cgZXJyb3JzXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignV29ya2Zsb3dFcnJvcicpXG5leHBvcnQgY2xhc3MgV29ya2Zsb3dFcnJvciBleHRlbmRzIEVycm9yIHt9XG5cbi8qKlxuICogVGhyb3duIGluIHdvcmtmbG93IHdoZW4gaXQgdHJpZXMgdG8gZG8gc29tZXRoaW5nIHRoYXQgbm9uLWRldGVybWluaXN0aWMgc3VjaCBhcyBjb25zdHJ1Y3QgYSBXZWFrUmVmKClcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yJylcbmV4cG9ydCBjbGFzcyBEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yIGV4dGVuZHMgV29ya2Zsb3dFcnJvciB7fVxuXG4vKipcbiAqIEEgY2xhc3MgdGhhdCBhY3RzIGFzIGEgbWFya2VyIGZvciB0aGlzIHNwZWNpYWwgcmVzdWx0IHR5cGVcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdMb2NhbEFjdGl2aXR5RG9CYWNrb2ZmJylcbmV4cG9ydCBjbGFzcyBMb2NhbEFjdGl2aXR5RG9CYWNrb2ZmIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgYmFja29mZjogY29yZXNkay5hY3Rpdml0eV9yZXN1bHQuSURvQmFja29mZikge1xuICAgIHN1cGVyKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgcHJvdmlkZWQgYGVycmAgaXMgY2F1c2VkIGJ5IGNhbmNlbGxhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDYW5jZWxsYXRpb24oZXJyOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgZXJyIGluc3RhbmNlb2YgQ2FuY2VsbGVkRmFpbHVyZSB8fFxuICAgICgoZXJyIGluc3RhbmNlb2YgQWN0aXZpdHlGYWlsdXJlIHx8IGVyciBpbnN0YW5jZW9mIENoaWxkV29ya2Zsb3dGYWlsdXJlKSAmJiBlcnIuY2F1c2UgaW5zdGFuY2VvZiBDYW5jZWxsZWRGYWlsdXJlKVxuICApO1xufVxuIiwiZXhwb3J0IHR5cGUgU2RrRmxhZyA9IHtcbiAgZ2V0IGlkKCk6IG51bWJlcjtcbiAgZ2V0IGRlZmF1bHQoKTogYm9vbGVhbjtcbn07XG5cbmNvbnN0IGZsYWdzUmVnaXN0cnk6IE1hcDxudW1iZXIsIFNka0ZsYWc+ID0gbmV3IE1hcCgpO1xuXG5leHBvcnQgY29uc3QgU2RrRmxhZ3MgPSB7XG4gIC8qKlxuICAgKiBUaGlzIGZsYWcgZ2F0ZXMgbXVsdGlwbGUgZml4ZXMgcmVsYXRlZCB0byBjYW5jZWxsYXRpb24gc2NvcGVzIGFuZCB0aW1lcnMgaW50cm9kdWNlZCBpbiAxLjEwLjIvMS4xMS4wOlxuICAgKiAtIENhbmNlbGxhdGlvbiBvZiBhIG5vbi1jYW5jZWxsYWJsZSBzY29wZSBubyBsb25nZXIgcHJvcGFnYXRlcyB0byBjaGlsZHJlbiBzY29wZXNcbiAgICogICAoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3Nkay10eXBlc2NyaXB0L2lzc3Vlcy8xNDIzKS5cbiAgICogLSBDYW5jZWxsYXRpb25TY29wZS53aXRoVGltZW91dChmbikgbm93IGNhbmNlbCB0aGUgdGltZXIgaWYgYGZuYCBjb21wbGV0ZXMgYmVmb3JlIGV4cGlyYXRpb25cbiAgICogICBvZiB0aGUgdGltZW91dCwgc2ltaWxhciB0byBob3cgYGNvbmRpdGlvbihmbiwgdGltZW91dClgIHdvcmtzLlxuICAgKiAtIFRpbWVycyBjcmVhdGVkIHVzaW5nIHNldFRpbWVvdXQgY2FuIG5vdyBiZSBpbnRlcmNlcHRlZC5cbiAgICpcbiAgICogQHNpbmNlIEludHJvZHVjZWQgaW4gMS4xMC4yLzEuMTEuMC5cbiAgICovXG4gIE5vbkNhbmNlbGxhYmxlU2NvcGVzQXJlU2hpZWxkZWRGcm9tUHJvcGFnYXRpb246IGRlZmluZUZsYWcoMSwgZmFsc2UpLFxufSBhcyBjb25zdDtcblxuZnVuY3Rpb24gZGVmaW5lRmxhZyhpZDogbnVtYmVyLCBkZWY6IGJvb2xlYW4pOiBTZGtGbGFnIHtcbiAgY29uc3QgZmxhZyA9IHsgaWQsIGRlZmF1bHQ6IGRlZiB9O1xuICBmbGFnc1JlZ2lzdHJ5LnNldChpZCwgZmxhZyk7XG4gIHJldHVybiBmbGFnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0VmFsaWRGbGFnKGlkOiBudW1iZXIpOiB2b2lkIHtcbiAgaWYgKCFmbGFnc1JlZ2lzdHJ5LmhhcyhpZCkpIHRocm93IG5ldyBUeXBlRXJyb3IoYFVua25vd24gU0RLIGZsYWc6ICR7aWR9YCk7XG59XG4iLCJpbXBvcnQgeyBJbGxlZ2FsU3RhdGVFcnJvciB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyB0eXBlIEFjdGl2YXRvciB9IGZyb20gJy4vaW50ZXJuYWxzJztcblxuZXhwb3J0IGZ1bmN0aW9uIG1heWJlR2V0QWN0aXZhdG9yVW50eXBlZCgpOiB1bmtub3duIHtcbiAgcmV0dXJuIChnbG9iYWxUaGlzIGFzIGFueSkuX19URU1QT1JBTF9BQ1RJVkFUT1JfXztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEFjdGl2YXRvclVudHlwZWQoYWN0aXZhdG9yOiB1bmtub3duKTogdm9pZCB7XG4gIChnbG9iYWxUaGlzIGFzIGFueSkuX19URU1QT1JBTF9BQ1RJVkFUT1JfXyA9IGFjdGl2YXRvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1heWJlR2V0QWN0aXZhdG9yKCk6IEFjdGl2YXRvciB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBtYXliZUdldEFjdGl2YXRvclVudHlwZWQoKSBhcyBBY3RpdmF0b3IgfCB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRJbldvcmtmbG93Q29udGV4dChtZXNzYWdlOiBzdHJpbmcpOiBBY3RpdmF0b3Ige1xuICBjb25zdCBhY3RpdmF0b3IgPSBtYXliZUdldEFjdGl2YXRvcigpO1xuICBpZiAoYWN0aXZhdG9yID09IG51bGwpIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcihtZXNzYWdlKTtcbiAgcmV0dXJuIGFjdGl2YXRvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFjdGl2YXRvcigpOiBBY3RpdmF0b3Ige1xuICBjb25zdCBhY3RpdmF0b3IgPSBtYXliZUdldEFjdGl2YXRvcigpO1xuICBpZiAoYWN0aXZhdG9yID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1dvcmtmbG93IHVuaW5pdGlhbGl6ZWQnKTtcbiAgfVxuICByZXR1cm4gYWN0aXZhdG9yO1xufVxuIiwiLyoqXG4gKiBPdmVycmlkZXMgc29tZSBnbG9iYWwgb2JqZWN0cyB0byBtYWtlIHRoZW0gZGV0ZXJtaW5pc3RpYy5cbiAqXG4gKiBAbW9kdWxlXG4gKi9cbmltcG9ydCB7IG1zVG9UcyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvdGltZSc7XG5pbXBvcnQgeyBDYW5jZWxsYXRpb25TY29wZSB9IGZyb20gJy4vY2FuY2VsbGF0aW9uLXNjb3BlJztcbmltcG9ydCB7IERldGVybWluaXNtVmlvbGF0aW9uRXJyb3IgfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQgeyBnZXRBY3RpdmF0b3IgfSBmcm9tICcuL2dsb2JhbC1hdHRyaWJ1dGVzJztcbmltcG9ydCB7IFNka0ZsYWdzIH0gZnJvbSAnLi9mbGFncyc7XG5pbXBvcnQgeyBzbGVlcCB9IGZyb20gJy4vd29ya2Zsb3cnO1xuaW1wb3J0IHsgdW50cmFja1Byb21pc2UgfSBmcm9tICcuL3N0YWNrLWhlbHBlcnMnO1xuXG5jb25zdCBnbG9iYWwgPSBnbG9iYWxUaGlzIGFzIGFueTtcbmNvbnN0IE9yaWdpbmFsRGF0ZSA9IGdsb2JhbFRoaXMuRGF0ZTtcblxuZXhwb3J0IGZ1bmN0aW9uIG92ZXJyaWRlR2xvYmFscygpOiB2b2lkIHtcbiAgLy8gTW9jayBhbnkgd2VhayByZWZlcmVuY2UgYmVjYXVzZSBHQyBpcyBub24tZGV0ZXJtaW5pc3RpYyBhbmQgdGhlIGVmZmVjdCBpcyBvYnNlcnZhYmxlIGZyb20gdGhlIFdvcmtmbG93LlxuICAvLyBXb3JrZmxvdyBkZXZlbG9wZXIgd2lsbCBnZXQgYSBtZWFuaW5nZnVsIGV4Y2VwdGlvbiBpZiB0aGV5IHRyeSB0byB1c2UgdGhlc2UuXG4gIGdsb2JhbC5XZWFrUmVmID0gZnVuY3Rpb24gKCkge1xuICAgIHRocm93IG5ldyBEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yKCdXZWFrUmVmIGNhbm5vdCBiZSB1c2VkIGluIFdvcmtmbG93cyBiZWNhdXNlIHY4IEdDIGlzIG5vbi1kZXRlcm1pbmlzdGljJyk7XG4gIH07XG4gIGdsb2JhbC5GaW5hbGl6YXRpb25SZWdpc3RyeSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aHJvdyBuZXcgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvcihcbiAgICAgICdGaW5hbGl6YXRpb25SZWdpc3RyeSBjYW5ub3QgYmUgdXNlZCBpbiBXb3JrZmxvd3MgYmVjYXVzZSB2OCBHQyBpcyBub24tZGV0ZXJtaW5pc3RpYydcbiAgICApO1xuICB9O1xuXG4gIGdsb2JhbC5EYXRlID0gZnVuY3Rpb24gKC4uLmFyZ3M6IHVua25vd25bXSkge1xuICAgIGlmIChhcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBuZXcgKE9yaWdpbmFsRGF0ZSBhcyBhbnkpKC4uLmFyZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IE9yaWdpbmFsRGF0ZShnZXRBY3RpdmF0b3IoKS5ub3cpO1xuICB9O1xuXG4gIGdsb2JhbC5EYXRlLm5vdyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZ2V0QWN0aXZhdG9yKCkubm93O1xuICB9O1xuXG4gIGdsb2JhbC5EYXRlLnBhcnNlID0gT3JpZ2luYWxEYXRlLnBhcnNlLmJpbmQoT3JpZ2luYWxEYXRlKTtcbiAgZ2xvYmFsLkRhdGUuVVRDID0gT3JpZ2luYWxEYXRlLlVUQy5iaW5kKE9yaWdpbmFsRGF0ZSk7XG5cbiAgZ2xvYmFsLkRhdGUucHJvdG90eXBlID0gT3JpZ2luYWxEYXRlLnByb3RvdHlwZTtcblxuICBjb25zdCB0aW1lb3V0Q2FuY2VsYXRpb25TY29wZXMgPSBuZXcgTWFwPG51bWJlciwgQ2FuY2VsbGF0aW9uU2NvcGU+KCk7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBtcyBzbGVlcCBkdXJhdGlvbiAtICBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLiBJZiBnaXZlbiBhIG5lZ2F0aXZlIG51bWJlciwgdmFsdWUgd2lsbCBiZSBzZXQgdG8gMS5cbiAgICovXG4gIGdsb2JhbC5zZXRUaW1lb3V0ID0gZnVuY3Rpb24gKGNiOiAoLi4uYXJnczogYW55W10pID0+IGFueSwgbXM6IG51bWJlciwgLi4uYXJnczogYW55W10pOiBudW1iZXIge1xuICAgIG1zID0gTWF0aC5tYXgoMSwgbXMpO1xuICAgIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICAgIGlmIChhY3RpdmF0b3IuaGFzRmxhZyhTZGtGbGFncy5Ob25DYW5jZWxsYWJsZVNjb3Blc0FyZVNoaWVsZGVkRnJvbVByb3BhZ2F0aW9uKSkge1xuICAgICAgLy8gQ2FwdHVyZSB0aGUgc2VxdWVuY2UgbnVtYmVyIHRoYXQgc2xlZXAgd2lsbCBhbGxvY2F0ZVxuICAgICAgY29uc3Qgc2VxID0gYWN0aXZhdG9yLm5leHRTZXFzLnRpbWVyO1xuICAgICAgY29uc3QgdGltZXJTY29wZSA9IG5ldyBDYW5jZWxsYXRpb25TY29wZSh7IGNhbmNlbGxhYmxlOiB0cnVlIH0pO1xuICAgICAgY29uc3Qgc2xlZXBQcm9taXNlID0gdGltZXJTY29wZS5ydW4oKCkgPT4gc2xlZXAobXMpKTtcbiAgICAgIHNsZWVwUHJvbWlzZS50aGVuKFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgdGltZW91dENhbmNlbGF0aW9uU2NvcGVzLmRlbGV0ZShzZXEpO1xuICAgICAgICAgIGNiKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgdGltZW91dENhbmNlbGF0aW9uU2NvcGVzLmRlbGV0ZShzZXEpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgICAgdW50cmFja1Byb21pc2Uoc2xlZXBQcm9taXNlKTtcbiAgICAgIHRpbWVvdXRDYW5jZWxhdGlvblNjb3Blcy5zZXQoc2VxLCB0aW1lclNjb3BlKTtcbiAgICAgIHJldHVybiBzZXE7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy50aW1lcisrO1xuICAgICAgLy8gQ3JlYXRlIGEgUHJvbWlzZSBmb3IgQXN5bmNMb2NhbFN0b3JhZ2UgdG8gYmUgYWJsZSB0byB0cmFjayB0aGlzIGNvbXBsZXRpb24gdXNpbmcgcHJvbWlzZSBob29rcy5cbiAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLnRpbWVyLnNldChzZXEsIHsgcmVzb2x2ZSwgcmVqZWN0IH0pO1xuICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICAgIHN0YXJ0VGltZXI6IHtcbiAgICAgICAgICAgIHNlcSxcbiAgICAgICAgICAgIHN0YXJ0VG9GaXJlVGltZW91dDogbXNUb1RzKG1zKSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH0pLnRoZW4oXG4gICAgICAgICgpID0+IGNiKC4uLmFyZ3MpLFxuICAgICAgICAoKSA9PiB1bmRlZmluZWQgLyogaWdub3JlIGNhbmNlbGxhdGlvbiAqL1xuICAgICAgKTtcbiAgICAgIHJldHVybiBzZXE7XG4gICAgfVxuICB9O1xuXG4gIGdsb2JhbC5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbiAoaGFuZGxlOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgICBjb25zdCB0aW1lclNjb3BlID0gdGltZW91dENhbmNlbGF0aW9uU2NvcGVzLmdldChoYW5kbGUpO1xuICAgIGlmICh0aW1lclNjb3BlKSB7XG4gICAgICB0aW1lb3V0Q2FuY2VsYXRpb25TY29wZXMuZGVsZXRlKGhhbmRsZSk7XG4gICAgICB0aW1lclNjb3BlLmNhbmNlbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhY3RpdmF0b3IubmV4dFNlcXMudGltZXIrKzsgLy8gU2hvdWxkbid0IGluY3JlYXNlIHNlcSBudW1iZXIsIGJ1dCB0aGF0J3MgdGhlIGxlZ2FjeSBiZWhhdmlvclxuICAgICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLnRpbWVyLmRlbGV0ZShoYW5kbGUpO1xuICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgY2FuY2VsVGltZXI6IHtcbiAgICAgICAgICBzZXE6IGhhbmRsZSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAvLyBhY3RpdmF0b3IucmFuZG9tIGlzIG11dGFibGUsIGRvbid0IGhhcmRjb2RlIGl0cyByZWZlcmVuY2VcbiAgTWF0aC5yYW5kb20gPSAoKSA9PiBnZXRBY3RpdmF0b3IoKS5yYW5kb20oKTtcbn1cbiIsIi8qKlxuICogVGhpcyBsaWJyYXJ5IHByb3ZpZGVzIHRvb2xzIHJlcXVpcmVkIGZvciBhdXRob3Jpbmcgd29ya2Zsb3dzLlxuICpcbiAqICMjIFVzYWdlXG4gKiBTZWUgdGhlIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC9oZWxsby13b3JsZCN3b3JrZmxvd3MgfCB0dXRvcmlhbH0gZm9yIHdyaXRpbmcgeW91ciBmaXJzdCB3b3JrZmxvdy5cbiAqXG4gKiAjIyMgVGltZXJzXG4gKlxuICogVGhlIHJlY29tbWVuZGVkIHdheSBvZiBzY2hlZHVsaW5nIHRpbWVycyBpcyBieSB1c2luZyB0aGUge0BsaW5rIHNsZWVwfSBmdW5jdGlvbi4gV2UndmUgcmVwbGFjZWQgYHNldFRpbWVvdXRgIGFuZFxuICogYGNsZWFyVGltZW91dGAgd2l0aCBkZXRlcm1pbmlzdGljIHZlcnNpb25zIHNvIHRoZXNlIGFyZSBhbHNvIHVzYWJsZSBidXQgaGF2ZSBhIGxpbWl0YXRpb24gdGhhdCB0aGV5IGRvbid0IHBsYXkgd2VsbFxuICogd2l0aCB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvY2FuY2VsbGF0aW9uLXNjb3BlcyB8IGNhbmNlbGxhdGlvbiBzY29wZXN9LlxuICpcbiAqIDwhLS1TTklQU1RBUlQgdHlwZXNjcmlwdC1zbGVlcC13b3JrZmxvdy0tPlxuICogPCEtLVNOSVBFTkQtLT5cbiAqXG4gKiAjIyMgQWN0aXZpdGllc1xuICpcbiAqIFRvIHNjaGVkdWxlIEFjdGl2aXRpZXMsIHVzZSB7QGxpbmsgcHJveHlBY3Rpdml0aWVzfSB0byBvYnRhaW4gYW4gQWN0aXZpdHkgZnVuY3Rpb24gYW5kIGNhbGwuXG4gKlxuICogPCEtLVNOSVBTVEFSVCB0eXBlc2NyaXB0LXNjaGVkdWxlLWFjdGl2aXR5LXdvcmtmbG93LS0+XG4gKiA8IS0tU05JUEVORC0tPlxuICpcbiAqICMjIyBVcGRhdGVzLCBTaWduYWxzIGFuZCBRdWVyaWVzXG4gKlxuICogVXNlIHtAbGluayBzZXRIYW5kbGVyfSB0byBzZXQgaGFuZGxlcnMgZm9yIFVwZGF0ZXMsIFNpZ25hbHMsIGFuZCBRdWVyaWVzLlxuICpcbiAqIFVwZGF0ZSBhbmQgU2lnbmFsIGhhbmRsZXJzIGNhbiBiZSBlaXRoZXIgYXN5bmMgb3Igbm9uLWFzeW5jIGZ1bmN0aW9ucy4gVXBkYXRlIGhhbmRsZXJzIG1heSByZXR1cm4gYSB2YWx1ZSwgYnV0IHNpZ25hbFxuICogaGFuZGxlcnMgbWF5IG5vdCAocmV0dXJuIGB2b2lkYCBvciBgUHJvbWlzZTx2b2lkPmApLiBZb3UgbWF5IHVzZSBBY3Rpdml0aWVzLCBUaW1lcnMsIGNoaWxkIFdvcmtmbG93cywgZXRjIGluIFVwZGF0ZVxuICogYW5kIFNpZ25hbCBoYW5kbGVycywgYnV0IHRoaXMgc2hvdWxkIGJlIGRvbmUgY2F1dGlvdXNseTogZm9yIGV4YW1wbGUsIG5vdGUgdGhhdCBpZiB5b3UgYXdhaXQgYXN5bmMgb3BlcmF0aW9ucyBzdWNoIGFzXG4gKiB0aGVzZSBpbiBhbiBVcGRhdGUgb3IgU2lnbmFsIGhhbmRsZXIsIHRoZW4geW91IGFyZSByZXNwb25zaWJsZSBmb3IgZW5zdXJpbmcgdGhhdCB0aGUgd29ya2Zsb3cgZG9lcyBub3QgY29tcGxldGUgZmlyc3QuXG4gKlxuICogUXVlcnkgaGFuZGxlcnMgbWF5ICoqbm90KiogYmUgYXN5bmMgZnVuY3Rpb25zLCBhbmQgbWF5ICoqbm90KiogbXV0YXRlIGFueSB2YXJpYWJsZXMgb3IgdXNlIEFjdGl2aXRpZXMsIFRpbWVycyxcbiAqIGNoaWxkIFdvcmtmbG93cywgZXRjLlxuICpcbiAqICMjIyMgSW1wbGVtZW50YXRpb25cbiAqXG4gKiA8IS0tU05JUFNUQVJUIHR5cGVzY3JpcHQtd29ya2Zsb3ctdXBkYXRlLXNpZ25hbC1xdWVyeS1leGFtcGxlLS0+XG4gKiA8IS0tU05JUEVORC0tPlxuICpcbiAqICMjIyBNb3JlXG4gKlxuICogLSBbRGV0ZXJtaW5pc3RpYyBidWlsdC1pbnNdKGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2RldGVybWluaXNtI3NvdXJjZXMtb2Ytbm9uLWRldGVybWluaXNtKVxuICogLSBbQ2FuY2VsbGF0aW9uIGFuZCBzY29wZXNdKGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2NhbmNlbGxhdGlvbi1zY29wZXMpXG4gKiAgIC0ge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfVxuICogICAtIHtAbGluayBUcmlnZ2VyfVxuICogLSBbU2lua3NdKGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9hcHBsaWNhdGlvbi1kZXZlbG9wbWVudC9vYnNlcnZhYmlsaXR5Lz9sYW5nPXRzI2xvZ2dpbmcpXG4gKiAgIC0ge0BsaW5rIFNpbmtzfVxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5leHBvcnQge1xuICBBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUsXG4gIEFjdGl2aXR5RmFpbHVyZSxcbiAgQWN0aXZpdHlPcHRpb25zLFxuICBBcHBsaWNhdGlvbkZhaWx1cmUsXG4gIENhbmNlbGxlZEZhaWx1cmUsXG4gIENoaWxkV29ya2Zsb3dGYWlsdXJlLFxuICBkZWZhdWx0UGF5bG9hZENvbnZlcnRlcixcbiAgUGF5bG9hZENvbnZlcnRlcixcbiAgUmV0cnlQb2xpY3ksXG4gIHJvb3RDYXVzZSxcbiAgU2VydmVyRmFpbHVyZSxcbiAgVGVtcG9yYWxGYWlsdXJlLFxuICBUZXJtaW5hdGVkRmFpbHVyZSxcbiAgVGltZW91dEZhaWx1cmUsXG59IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5leHBvcnQgKiBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL2Vycm9ycyc7XG5leHBvcnQge1xuICBBY3Rpdml0eUZ1bmN0aW9uLFxuICBBY3Rpdml0eUludGVyZmFjZSwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBkZXByZWNhdGlvbi9kZXByZWNhdGlvblxuICBQYXlsb2FkLFxuICBRdWVyeURlZmluaXRpb24sXG4gIFNlYXJjaEF0dHJpYnV0ZXMsXG4gIFNlYXJjaEF0dHJpYnV0ZVZhbHVlLFxuICBTaWduYWxEZWZpbml0aW9uLFxuICBVbnR5cGVkQWN0aXZpdGllcyxcbiAgV29ya2Zsb3csXG4gIFdvcmtmbG93UXVlcnlUeXBlLFxuICBXb3JrZmxvd1Jlc3VsdFR5cGUsXG4gIFdvcmtmbG93UmV0dXJuVHlwZSxcbiAgV29ya2Zsb3dTaWduYWxUeXBlLFxufSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL2ludGVyZmFjZXMnO1xuZXhwb3J0ICogZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi93b3JrZmxvdy1oYW5kbGUnO1xuZXhwb3J0ICogZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi93b3JrZmxvdy1vcHRpb25zJztcbmV4cG9ydCB7IEFzeW5jTG9jYWxTdG9yYWdlLCBDYW5jZWxsYXRpb25TY29wZSwgQ2FuY2VsbGF0aW9uU2NvcGVPcHRpb25zIH0gZnJvbSAnLi9jYW5jZWxsYXRpb24tc2NvcGUnO1xuZXhwb3J0ICogZnJvbSAnLi9lcnJvcnMnO1xuZXhwb3J0ICogZnJvbSAnLi9pbnRlcmNlcHRvcnMnO1xuZXhwb3J0IHtcbiAgQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUsXG4gIENoaWxkV29ya2Zsb3dPcHRpb25zLFxuICBDb250aW51ZUFzTmV3LFxuICBDb250aW51ZUFzTmV3T3B0aW9ucyxcbiAgRW5oYW5jZWRTdGFja1RyYWNlLFxuICBGaWxlTG9jYXRpb24sXG4gIEZpbGVTbGljZSxcbiAgUGFyZW50Q2xvc2VQb2xpY3ksXG4gIFBhcmVudFdvcmtmbG93SW5mbyxcbiAgU0RLSW5mbyxcbiAgU3RhY2tUcmFjZSxcbiAgVW5zYWZlV29ya2Zsb3dJbmZvLFxuICBXb3JrZmxvd0luZm8sXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5leHBvcnQgeyBwcm94eVNpbmtzLCBTaW5rLCBTaW5rQ2FsbCwgU2lua0Z1bmN0aW9uLCBTaW5rcyB9IGZyb20gJy4vc2lua3MnO1xuZXhwb3J0IHsgbG9nIH0gZnJvbSAnLi9sb2dzJztcbmV4cG9ydCB7IFRyaWdnZXIgfSBmcm9tICcuL3RyaWdnZXInO1xuZXhwb3J0ICogZnJvbSAnLi93b3JrZmxvdyc7XG5leHBvcnQgeyBDaGlsZFdvcmtmbG93SGFuZGxlLCBFeHRlcm5hbFdvcmtmbG93SGFuZGxlIH0gZnJvbSAnLi93b3JrZmxvdy1oYW5kbGUnO1xuXG4vLyBBbnl0aGluZyBiZWxvdyB0aGlzIGxpbmUgaXMgZGVwcmVjYXRlZFxuXG5leHBvcnQge1xuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgRG8gbm90IHVzZSBMb2dnZXJTaW5rcyBkaXJlY3RseS4gVG8gbG9nIGZyb20gV29ya2Zsb3cgY29kZSwgdXNlIHRoZSBgbG9nYCBvYmplY3RcbiAgICogICAgICAgICAgICAgZXhwb3J0ZWQgYnkgdGhlIGBAdGVtcG9yYWxpby93b3JrZmxvd2AgcGFja2FnZS4gVG8gY2FwdHVyZSBsb2cgbWVzc2FnZXMgZW1pdHRlZFxuICAgKiAgICAgICAgICAgICBieSBXb3JrZmxvdyBjb2RlLCBzZXQgdGhlIHtAbGluayBSdW50aW1lLmxvZ2dlcn0gcHJvcGVydHkuXG4gICAqL1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb25cbiAgTG9nZ2VyU2lua3NEZXByZWNhdGVkIGFzIExvZ2dlclNpbmtzLFxufSBmcm9tICcuL2xvZ3MnO1xuIiwiLyoqXG4gKiBUeXBlIGRlZmluaXRpb25zIGFuZCBnZW5lcmljIGhlbHBlcnMgZm9yIGludGVyY2VwdG9ycy5cbiAqXG4gKiBUaGUgV29ya2Zsb3cgc3BlY2lmaWMgaW50ZXJjZXB0b3JzIGFyZSBkZWZpbmVkIGhlcmUuXG4gKlxuICogQG1vZHVsZVxuICovXG5cbmltcG9ydCB7IEFjdGl2aXR5T3B0aW9ucywgSGVhZGVycywgTG9jYWxBY3Rpdml0eU9wdGlvbnMsIE5leHQsIFRpbWVzdGFtcCwgV29ya2Zsb3dFeGVjdXRpb24gfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHR5cGUgeyBjb3Jlc2RrIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgQ2hpbGRXb3JrZmxvd09wdGlvbnNXaXRoRGVmYXVsdHMsIENvbnRpbnVlQXNOZXdPcHRpb25zIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuZXhwb3J0IHsgTmV4dCwgSGVhZGVycyB9O1xuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3IuZXhlY3V0ZSAqL1xuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0V4ZWN1dGVJbnB1dCB7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yLmhhbmRsZVVwZGF0ZSBhbmRcbiAqIFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3IudmFsaWRhdGVVcGRhdGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVXBkYXRlSW5wdXQge1xuICByZWFkb25seSB1cGRhdGVJZDogc3RyaW5nO1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yLmhhbmRsZVNpZ25hbCAqL1xuZXhwb3J0IGludGVyZmFjZSBTaWduYWxJbnB1dCB7XG4gIHJlYWRvbmx5IHNpZ25hbE5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3IuaGFuZGxlUXVlcnkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUXVlcnlJbnB1dCB7XG4gIHJlYWRvbmx5IHF1ZXJ5SWQ6IHN0cmluZztcbiAgcmVhZG9ubHkgcXVlcnlOYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnQgYW55IG9mIHRoZXNlIG1ldGhvZHMgdG8gaW50ZXJjZXB0IFdvcmtmbG93IGluYm91bmQgY2FsbHMgbGlrZSBleGVjdXRpb24sIGFuZCBzaWduYWwgYW5kIHF1ZXJ5IGhhbmRsaW5nLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3Ige1xuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgZXhlY3V0ZSBtZXRob2QgaXMgY2FsbGVkXG4gICAqXG4gICAqIEByZXR1cm4gcmVzdWx0IG9mIHRoZSBXb3JrZmxvdyBleGVjdXRpb25cbiAgICovXG4gIGV4ZWN1dGU/OiAoaW5wdXQ6IFdvcmtmbG93RXhlY3V0ZUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdleGVjdXRlJz4pID0+IFByb21pc2U8dW5rbm93bj47XG5cbiAgLyoqIENhbGxlZCB3aGVuIFVwZGF0ZSBoYW5kbGVyIGlzIGNhbGxlZFxuICAgKlxuICAgKiBAcmV0dXJuIHJlc3VsdCBvZiB0aGUgVXBkYXRlXG4gICAqL1xuICBoYW5kbGVVcGRhdGU/OiAoaW5wdXQ6IFVwZGF0ZUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdoYW5kbGVVcGRhdGUnPikgPT4gUHJvbWlzZTx1bmtub3duPjtcblxuICAvKiogQ2FsbGVkIHdoZW4gdXBkYXRlIHZhbGlkYXRvciBjYWxsZWQgKi9cbiAgdmFsaWRhdGVVcGRhdGU/OiAoaW5wdXQ6IFVwZGF0ZUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICd2YWxpZGF0ZVVwZGF0ZSc+KSA9PiB2b2lkO1xuXG4gIC8qKiBDYWxsZWQgd2hlbiBzaWduYWwgaXMgZGVsaXZlcmVkIHRvIGEgV29ya2Zsb3cgZXhlY3V0aW9uICovXG4gIGhhbmRsZVNpZ25hbD86IChpbnB1dDogU2lnbmFsSW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2hhbmRsZVNpZ25hbCc+KSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIFdvcmtmbG93IGlzIHF1ZXJpZWRcbiAgICpcbiAgICogQHJldHVybiByZXN1bHQgb2YgdGhlIHF1ZXJ5XG4gICAqL1xuICBoYW5kbGVRdWVyeT86IChpbnB1dDogUXVlcnlJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnaGFuZGxlUXVlcnknPikgPT4gUHJvbWlzZTx1bmtub3duPjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5zY2hlZHVsZUFjdGl2aXR5ICovXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2aXR5SW5wdXQge1xuICByZWFkb25seSBhY3Rpdml0eVR5cGU6IHN0cmluZztcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBvcHRpb25zOiBBY3Rpdml0eU9wdGlvbnM7XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG4gIHJlYWRvbmx5IHNlcTogbnVtYmVyO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yLnNjaGVkdWxlTG9jYWxBY3Rpdml0eSAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhbEFjdGl2aXR5SW5wdXQge1xuICByZWFkb25seSBhY3Rpdml0eVR5cGU6IHN0cmluZztcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBvcHRpb25zOiBMb2NhbEFjdGl2aXR5T3B0aW9ucztcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbiAgcmVhZG9ubHkgc2VxOiBudW1iZXI7XG4gIHJlYWRvbmx5IG9yaWdpbmFsU2NoZWR1bGVUaW1lPzogVGltZXN0YW1wO1xuICByZWFkb25seSBhdHRlbXB0OiBudW1iZXI7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Iuc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uICovXG5leHBvcnQgaW50ZXJmYWNlIFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbklucHV0IHtcbiAgcmVhZG9ubHkgd29ya2Zsb3dUeXBlOiBzdHJpbmc7XG4gIHJlYWRvbmx5IG9wdGlvbnM6IENoaWxkV29ya2Zsb3dPcHRpb25zV2l0aERlZmF1bHRzO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xuICByZWFkb25seSBzZXE6IG51bWJlcjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5zdGFydFRpbWVyICovXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVySW5wdXQge1xuICByZWFkb25seSBkdXJhdGlvbk1zOiBudW1iZXI7XG4gIHJlYWRvbmx5IHNlcTogbnVtYmVyO1xufVxuXG4vKipcbiAqIFNhbWUgYXMgQ29udGludWVBc05ld09wdGlvbnMgYnV0IHdvcmtmbG93VHlwZSBtdXN0IGJlIGRlZmluZWRcbiAqL1xuZXhwb3J0IHR5cGUgQ29udGludWVBc05ld0lucHV0T3B0aW9ucyA9IENvbnRpbnVlQXNOZXdPcHRpb25zICYgUmVxdWlyZWQ8UGljazxDb250aW51ZUFzTmV3T3B0aW9ucywgJ3dvcmtmbG93VHlwZSc+PjtcblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5jb250aW51ZUFzTmV3ICovXG5leHBvcnQgaW50ZXJmYWNlIENvbnRpbnVlQXNOZXdJbnB1dCB7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbiAgcmVhZG9ubHkgb3B0aW9uczogQ29udGludWVBc05ld0lucHV0T3B0aW9ucztcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5zaWduYWxXb3JrZmxvdyAqL1xuZXhwb3J0IGludGVyZmFjZSBTaWduYWxXb3JrZmxvd0lucHV0IHtcbiAgcmVhZG9ubHkgc2VxOiBudW1iZXI7XG4gIHJlYWRvbmx5IHNpZ25hbE5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xuICByZWFkb25seSB0YXJnZXQ6XG4gICAgfCB7XG4gICAgICAgIHJlYWRvbmx5IHR5cGU6ICdleHRlcm5hbCc7XG4gICAgICAgIHJlYWRvbmx5IHdvcmtmbG93RXhlY3V0aW9uOiBXb3JrZmxvd0V4ZWN1dGlvbjtcbiAgICAgIH1cbiAgICB8IHtcbiAgICAgICAgcmVhZG9ubHkgdHlwZTogJ2NoaWxkJztcbiAgICAgICAgcmVhZG9ubHkgY2hpbGRXb3JrZmxvd0lkOiBzdHJpbmc7XG4gICAgICB9O1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yLmdldExvZ0F0dHJpYnV0ZXMgKi9cbmV4cG9ydCB0eXBlIEdldExvZ0F0dHJpYnV0ZXNJbnB1dCA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4vKipcbiAqIEltcGxlbWVudCBhbnkgb2YgdGhlc2UgbWV0aG9kcyB0byBpbnRlcmNlcHQgV29ya2Zsb3cgY29kZSBjYWxscyB0byB0aGUgVGVtcG9yYWwgQVBJcywgbGlrZSBzY2hlZHVsaW5nIGFuIGFjdGl2aXR5IGFuZCBzdGFydGluZyBhIHRpbWVyXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Ige1xuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgc2NoZWR1bGVzIGFuIEFjdGl2aXR5XG4gICAqXG4gICAqIEByZXR1cm4gcmVzdWx0IG9mIHRoZSBhY3Rpdml0eSBleGVjdXRpb25cbiAgICovXG4gIHNjaGVkdWxlQWN0aXZpdHk/OiAoaW5wdXQ6IEFjdGl2aXR5SW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ3NjaGVkdWxlQWN0aXZpdHknPikgPT4gUHJvbWlzZTx1bmtub3duPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgc2NoZWR1bGVzIGEgbG9jYWwgQWN0aXZpdHlcbiAgICpcbiAgICogQHJldHVybiByZXN1bHQgb2YgdGhlIGFjdGl2aXR5IGV4ZWN1dGlvblxuICAgKi9cbiAgc2NoZWR1bGVMb2NhbEFjdGl2aXR5PzogKGlucHV0OiBMb2NhbEFjdGl2aXR5SW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ3NjaGVkdWxlTG9jYWxBY3Rpdml0eSc+KSA9PiBQcm9taXNlPHVua25vd24+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBzdGFydHMgYSB0aW1lclxuICAgKi9cbiAgc3RhcnRUaW1lcj86IChpbnB1dDogVGltZXJJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnc3RhcnRUaW1lcic+KSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBjYWxscyBjb250aW51ZUFzTmV3XG4gICAqL1xuICBjb250aW51ZUFzTmV3PzogKGlucHV0OiBDb250aW51ZUFzTmV3SW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2NvbnRpbnVlQXNOZXcnPikgPT4gUHJvbWlzZTxuZXZlcj47XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IHNpZ25hbHMgYSBjaGlsZCBvciBleHRlcm5hbCBXb3JrZmxvd1xuICAgKi9cbiAgc2lnbmFsV29ya2Zsb3c/OiAoaW5wdXQ6IFNpZ25hbFdvcmtmbG93SW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ3NpZ25hbFdvcmtmbG93Jz4pID0+IFByb21pc2U8dm9pZD47XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IHN0YXJ0cyBhIGNoaWxkIHdvcmtmbG93IGV4ZWN1dGlvbiwgdGhlIGludGVyY2VwdG9yIGZ1bmN0aW9uIHJldHVybnMgMiBwcm9taXNlczpcbiAgICpcbiAgICogLSBUaGUgZmlyc3QgcmVzb2x2ZXMgd2l0aCB0aGUgYHJ1bklkYCB3aGVuIHRoZSBjaGlsZCB3b3JrZmxvdyBoYXMgc3RhcnRlZCBvciByZWplY3RzIGlmIGZhaWxlZCB0byBzdGFydC5cbiAgICogLSBUaGUgc2Vjb25kIHJlc29sdmVzIHdpdGggdGhlIHdvcmtmbG93IHJlc3VsdCB3aGVuIHRoZSBjaGlsZCB3b3JrZmxvdyBjb21wbGV0ZXMgb3IgcmVqZWN0cyBvbiBmYWlsdXJlLlxuICAgKi9cbiAgc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uPzogKFxuICAgIGlucHV0OiBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25JbnB1dCxcbiAgICBuZXh0OiBOZXh0PHRoaXMsICdzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb24nPlxuICApID0+IFByb21pc2U8W1Byb21pc2U8c3RyaW5nPiwgUHJvbWlzZTx1bmtub3duPl0+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgb24gZWFjaCBpbnZvY2F0aW9uIG9mIHRoZSBgd29ya2Zsb3cubG9nYCBtZXRob2RzLlxuICAgKlxuICAgKiBUaGUgYXR0cmlidXRlcyByZXR1cm5lZCBpbiB0aGlzIGNhbGwgYXJlIGF0dGFjaGVkIHRvIGV2ZXJ5IGxvZyBtZXNzYWdlLlxuICAgKi9cbiAgZ2V0TG9nQXR0cmlidXRlcz86IChpbnB1dDogR2V0TG9nQXR0cmlidXRlc0lucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdnZXRMb2dBdHRyaWJ1dGVzJz4pID0+IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3IuY29uY2x1ZGVBY3RpdmF0aW9uICovXG5leHBvcnQgaW50ZXJmYWNlIENvbmNsdWRlQWN0aXZhdGlvbklucHV0IHtcbiAgY29tbWFuZHM6IGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuSVdvcmtmbG93Q29tbWFuZFtdO1xufVxuXG4vKiogT3V0cHV0IGZvciBXb3JrZmxvd0ludGVybmFsc0ludGVyY2VwdG9yLmNvbmNsdWRlQWN0aXZhdGlvbiAqL1xuZXhwb3J0IHR5cGUgQ29uY2x1ZGVBY3RpdmF0aW9uT3V0cHV0ID0gQ29uY2x1ZGVBY3RpdmF0aW9uSW5wdXQ7XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvci5hY3RpdmF0ZSAqL1xuZXhwb3J0IGludGVyZmFjZSBBY3RpdmF0ZUlucHV0IHtcbiAgYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklXb3JrZmxvd0FjdGl2YXRpb247XG4gIGJhdGNoSW5kZXg6IG51bWJlcjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0ludGVybmFsc0ludGVyY2VwdG9yLmRpc3Bvc2UgKi9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZW1wdHktaW50ZXJmYWNlXG5leHBvcnQgaW50ZXJmYWNlIERpc3Bvc2VJbnB1dCB7fVxuXG4vKipcbiAqIEludGVyY2VwdG9yIGZvciB0aGUgaW50ZXJuYWxzIG9mIHRoZSBXb3JrZmxvdyBydW50aW1lLlxuICpcbiAqIFVzZSB0byBtYW5pcHVsYXRlIG9yIHRyYWNlIFdvcmtmbG93IGFjdGl2YXRpb25zLlxuICpcbiAqIEBleHBlcmltZW50YWwgVGhpcyBBUEkgaXMgZm9yIGFkdmFuY2VkIHVzZSBjYXNlcyBhbmQgbWF5IGNoYW5nZSBpbiB0aGUgZnV0dXJlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3Ige1xuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIFdvcmtmbG93IHJ1bnRpbWUgcnVucyBhIFdvcmtmbG93QWN0aXZhdGlvbkpvYi5cbiAgICovXG4gIGFjdGl2YXRlPyhpbnB1dDogQWN0aXZhdGVJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnYWN0aXZhdGUnPik6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIENhbGxlZCBhZnRlciBhbGwgYFdvcmtmbG93QWN0aXZhdGlvbkpvYmBzIGhhdmUgYmVlbiBwcm9jZXNzZWQgZm9yIGFuIGFjdGl2YXRpb24uXG4gICAqXG4gICAqIENhbiBtYW5pcHVsYXRlIHRoZSBjb21tYW5kcyBnZW5lcmF0ZWQgYnkgdGhlIFdvcmtmbG93XG4gICAqL1xuICBjb25jbHVkZUFjdGl2YXRpb24/KGlucHV0OiBDb25jbHVkZUFjdGl2YXRpb25JbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnY29uY2x1ZGVBY3RpdmF0aW9uJz4pOiBDb25jbHVkZUFjdGl2YXRpb25PdXRwdXQ7XG5cbiAgLyoqXG4gICAqIENhbGxlZCBiZWZvcmUgZGlzcG9zaW5nIHRoZSBXb3JrZmxvdyBpc29sYXRlIGNvbnRleHQuXG4gICAqXG4gICAqIEltcGxlbWVudCB0aGlzIG1ldGhvZCB0byBwZXJmb3JtIGFueSByZXNvdXJjZSBjbGVhbnVwLlxuICAgKi9cbiAgZGlzcG9zZT8oaW5wdXQ6IERpc3Bvc2VJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnZGlzcG9zZSc+KTogdm9pZDtcbn1cblxuLyoqXG4gKiBBIG1hcHBpbmcgZnJvbSBpbnRlcmNlcHRvciB0eXBlIHRvIGFuIG9wdGlvbmFsIGxpc3Qgb2YgaW50ZXJjZXB0b3IgaW1wbGVtZW50YXRpb25zXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dJbnRlcmNlcHRvcnMge1xuICBpbmJvdW5kPzogV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvcltdO1xuICBvdXRib3VuZD86IFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yW107XG4gIGludGVybmFscz86IFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3JbXTtcbn1cblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB7QGxpbmsgV29ya2Zsb3dJbnRlcmNlcHRvcnN9IGFuZCB0YWtlcyBubyBhcmd1bWVudHMuXG4gKlxuICogV29ya2Zsb3cgaW50ZXJjZXB0b3IgbW9kdWxlcyBzaG91bGQgZXhwb3J0IGFuIGBpbnRlcmNlcHRvcnNgIGZ1bmN0aW9uIG9mIHRoaXMgdHlwZS5cbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIGBgYHRzXG4gKiBleHBvcnQgZnVuY3Rpb24gaW50ZXJjZXB0b3JzKCk6IFdvcmtmbG93SW50ZXJjZXB0b3JzIHtcbiAqICAgcmV0dXJuIHtcbiAqICAgICBpbmJvdW5kOiBbXSwgICAvLyBQb3B1bGF0ZSB3aXRoIGxpc3Qgb2YgaW50ZXJjZXB0b3IgaW1wbGVtZW50YXRpb25zXG4gKiAgICAgb3V0Ym91bmQ6IFtdLCAgLy8gUG9wdWxhdGUgd2l0aCBsaXN0IG9mIGludGVyY2VwdG9yIGltcGxlbWVudGF0aW9uc1xuICogICAgIGludGVybmFsczogW10sIC8vIFBvcHVsYXRlIHdpdGggbGlzdCBvZiBpbnRlcmNlcHRvciBpbXBsZW1lbnRhdGlvbnNcbiAqICAgfTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgdHlwZSBXb3JrZmxvd0ludGVyY2VwdG9yc0ZhY3RvcnkgPSAoKSA9PiBXb3JrZmxvd0ludGVyY2VwdG9ycztcbiIsImltcG9ydCB0eXBlIHsgUmF3U291cmNlTWFwIH0gZnJvbSAnc291cmNlLW1hcCc7XG5pbXBvcnQge1xuICBSZXRyeVBvbGljeSxcbiAgVGVtcG9yYWxGYWlsdXJlLFxuICBDb21tb25Xb3JrZmxvd09wdGlvbnMsXG4gIFNlYXJjaEF0dHJpYnV0ZXMsXG4gIFNpZ25hbERlZmluaXRpb24sXG4gIFVwZGF0ZURlZmluaXRpb24sXG4gIFF1ZXJ5RGVmaW5pdGlvbixcbiAgRHVyYXRpb24sXG4gIFZlcnNpb25pbmdJbnRlbnQsXG59IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyBjaGVja0V4dGVuZHMsIFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHR5cGUgeyBjb3Jlc2RrIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuXG4vKipcbiAqIFdvcmtmbG93IEV4ZWN1dGlvbiBpbmZvcm1hdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93SW5mbyB7XG4gIC8qKlxuICAgKiBJRCBvZiB0aGUgV29ya2Zsb3csIHRoaXMgY2FuIGJlIHNldCBieSB0aGUgY2xpZW50IGR1cmluZyBXb3JrZmxvdyBjcmVhdGlvbi5cbiAgICogQSBzaW5nbGUgV29ya2Zsb3cgbWF5IHJ1biBtdWx0aXBsZSB0aW1lcyBlLmcuIHdoZW4gc2NoZWR1bGVkIHdpdGggY3Jvbi5cbiAgICovXG4gIHJlYWRvbmx5IHdvcmtmbG93SWQ6IHN0cmluZztcblxuICAvKipcbiAgICogSUQgb2YgYSBzaW5nbGUgV29ya2Zsb3cgcnVuXG4gICAqL1xuICByZWFkb25seSBydW5JZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBXb3JrZmxvdyBmdW5jdGlvbidzIG5hbWVcbiAgICovXG4gIHJlYWRvbmx5IHdvcmtmbG93VHlwZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBJbmRleGVkIGluZm9ybWF0aW9uIGF0dGFjaGVkIHRvIHRoZSBXb3JrZmxvdyBFeGVjdXRpb25cbiAgICpcbiAgICogVGhpcyB2YWx1ZSBtYXkgY2hhbmdlIGR1cmluZyB0aGUgbGlmZXRpbWUgb2YgYW4gRXhlY3V0aW9uLlxuICAgKi9cbiAgcmVhZG9ubHkgc2VhcmNoQXR0cmlidXRlczogU2VhcmNoQXR0cmlidXRlcztcblxuICAvKipcbiAgICogTm9uLWluZGV4ZWQgaW5mb3JtYXRpb24gYXR0YWNoZWQgdG8gdGhlIFdvcmtmbG93IEV4ZWN1dGlvblxuICAgKi9cbiAgcmVhZG9ubHkgbWVtbz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIC8qKlxuICAgKiBQYXJlbnQgV29ya2Zsb3cgaW5mbyAocHJlc2VudCBpZiB0aGlzIGlzIGEgQ2hpbGQgV29ya2Zsb3cpXG4gICAqL1xuICByZWFkb25seSBwYXJlbnQ/OiBQYXJlbnRXb3JrZmxvd0luZm87XG5cbiAgLyoqXG4gICAqIFJlc3VsdCBmcm9tIHRoZSBwcmV2aW91cyBSdW4gKHByZXNlbnQgaWYgdGhpcyBpcyBhIENyb24gV29ya2Zsb3cgb3Igd2FzIENvbnRpbnVlZCBBcyBOZXcpLlxuICAgKlxuICAgKiBBbiBhcnJheSBvZiB2YWx1ZXMsIHNpbmNlIG90aGVyIFNES3MgbWF5IHJldHVybiBtdWx0aXBsZSB2YWx1ZXMgZnJvbSBhIFdvcmtmbG93LlxuICAgKi9cbiAgcmVhZG9ubHkgbGFzdFJlc3VsdD86IHVua25vd247XG5cbiAgLyoqXG4gICAqIEZhaWx1cmUgZnJvbSB0aGUgcHJldmlvdXMgUnVuIChwcmVzZW50IHdoZW4gdGhpcyBSdW4gaXMgYSByZXRyeSwgb3IgdGhlIGxhc3QgUnVuIG9mIGEgQ3JvbiBXb3JrZmxvdyBmYWlsZWQpXG4gICAqL1xuICByZWFkb25seSBsYXN0RmFpbHVyZT86IFRlbXBvcmFsRmFpbHVyZTtcblxuICAvKipcbiAgICogTGVuZ3RoIG9mIFdvcmtmbG93IGhpc3RvcnkgdXAgdW50aWwgdGhlIGN1cnJlbnQgV29ya2Zsb3cgVGFzay5cbiAgICpcbiAgICogVGhpcyB2YWx1ZSBjaGFuZ2VzIGR1cmluZyB0aGUgbGlmZXRpbWUgb2YgYW4gRXhlY3V0aW9uLlxuICAgKlxuICAgKiBZb3UgbWF5IHNhZmVseSB1c2UgdGhpcyBpbmZvcm1hdGlvbiB0byBkZWNpZGUgd2hlbiB0byB7QGxpbmsgY29udGludWVBc05ld30uXG4gICAqL1xuICByZWFkb25seSBoaXN0b3J5TGVuZ3RoOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFNpemUgb2YgV29ya2Zsb3cgaGlzdG9yeSBpbiBieXRlcyB1bnRpbCB0aGUgY3VycmVudCBXb3JrZmxvdyBUYXNrLlxuICAgKlxuICAgKiBUaGlzIHZhbHVlIGNoYW5nZXMgZHVyaW5nIHRoZSBsaWZldGltZSBvZiBhbiBFeGVjdXRpb24uXG4gICAqXG4gICAqIFN1cHBvcnRlZCBvbmx5IG9uIFRlbXBvcmFsIFNlcnZlciAxLjIwKywgYWx3YXlzIHplcm8gb24gb2xkZXIgc2VydmVycy5cbiAgICpcbiAgICogWW91IG1heSBzYWZlbHkgdXNlIHRoaXMgaW5mb3JtYXRpb24gdG8gZGVjaWRlIHdoZW4gdG8ge0BsaW5rIGNvbnRpbnVlQXNOZXd9LlxuICAgKi9cbiAgcmVhZG9ubHkgaGlzdG9yeVNpemU6IG51bWJlcjtcblxuICAvKipcbiAgICogQSBoaW50IHByb3ZpZGVkIGJ5IHRoZSBjdXJyZW50IFdvcmtmbG93VGFza1N0YXJ0ZWQgZXZlbnQgcmVjb21tZW5kaW5nIHdoZXRoZXIgdG9cbiAgICoge0BsaW5rIGNvbnRpbnVlQXNOZXd9LlxuICAgKlxuICAgKiBUaGlzIHZhbHVlIGNoYW5nZXMgZHVyaW5nIHRoZSBsaWZldGltZSBvZiBhbiBFeGVjdXRpb24uXG4gICAqXG4gICAqIFN1cHBvcnRlZCBvbmx5IG9uIFRlbXBvcmFsIFNlcnZlciAxLjIwKywgYWx3YXlzIGBmYWxzZWAgb24gb2xkZXIgc2VydmVycy5cbiAgICovXG4gIHJlYWRvbmx5IGNvbnRpbnVlQXNOZXdTdWdnZXN0ZWQ6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFRhc2sgcXVldWUgdGhpcyBXb3JrZmxvdyBpcyBleGVjdXRpbmcgb25cbiAgICovXG4gIHJlYWRvbmx5IHRhc2tRdWV1ZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBOYW1lc3BhY2UgdGhpcyBXb3JrZmxvdyBpcyBleGVjdXRpbmcgaW5cbiAgICovXG4gIHJlYWRvbmx5IG5hbWVzcGFjZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBSdW4gSWQgb2YgdGhlIGZpcnN0IFJ1biBpbiB0aGlzIEV4ZWN1dGlvbiBDaGFpblxuICAgKi9cbiAgcmVhZG9ubHkgZmlyc3RFeGVjdXRpb25SdW5JZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgbGFzdCBSdW4gSWQgaW4gdGhpcyBFeGVjdXRpb24gQ2hhaW5cbiAgICovXG4gIHJlYWRvbmx5IGNvbnRpbnVlZEZyb21FeGVjdXRpb25SdW5JZD86IHN0cmluZztcblxuICAvKipcbiAgICogVGltZSBhdCB3aGljaCB0aGlzIFtXb3JrZmxvdyBFeGVjdXRpb24gQ2hhaW5dKGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby93b3JrZmxvd3Mjd29ya2Zsb3ctZXhlY3V0aW9uLWNoYWluKSB3YXMgc3RhcnRlZFxuICAgKi9cbiAgcmVhZG9ubHkgc3RhcnRUaW1lOiBEYXRlO1xuXG4gIC8qKlxuICAgKiBUaW1lIGF0IHdoaWNoIHRoZSBjdXJyZW50IFdvcmtmbG93IFJ1biBzdGFydGVkXG4gICAqL1xuICByZWFkb25seSBydW5TdGFydFRpbWU6IERhdGU7XG5cbiAgLyoqXG4gICAqIE1pbGxpc2Vjb25kcyBhZnRlciB3aGljaCB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uIGlzIGF1dG9tYXRpY2FsbHkgdGVybWluYXRlZCBieSBUZW1wb3JhbCBTZXJ2ZXIuIFNldCB2aWEge0BsaW5rIFdvcmtmbG93T3B0aW9ucy53b3JrZmxvd0V4ZWN1dGlvblRpbWVvdXR9LlxuICAgKi9cbiAgcmVhZG9ubHkgZXhlY3V0aW9uVGltZW91dE1zPzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaW1lIGF0IHdoaWNoIHRoZSBXb3JrZmxvdyBFeGVjdXRpb24gZXhwaXJlc1xuICAgKi9cbiAgcmVhZG9ubHkgZXhlY3V0aW9uRXhwaXJhdGlvblRpbWU/OiBEYXRlO1xuXG4gIC8qKlxuICAgKiBNaWxsaXNlY29uZHMgYWZ0ZXIgd2hpY2ggdGhlIFdvcmtmbG93IFJ1biBpcyBhdXRvbWF0aWNhbGx5IHRlcm1pbmF0ZWQgYnkgVGVtcG9yYWwgU2VydmVyLiBTZXQgdmlhIHtAbGluayBXb3JrZmxvd09wdGlvbnMud29ya2Zsb3dSdW5UaW1lb3V0fS5cbiAgICovXG4gIHJlYWRvbmx5IHJ1blRpbWVvdXRNcz86IG51bWJlcjtcblxuICAvKipcbiAgICogTWF4aW11bSBleGVjdXRpb24gdGltZSBvZiBhIFdvcmtmbG93IFRhc2sgaW4gbWlsbGlzZWNvbmRzLiBTZXQgdmlhIHtAbGluayBXb3JrZmxvd09wdGlvbnMud29ya2Zsb3dUYXNrVGltZW91dH0uXG4gICAqL1xuICByZWFkb25seSB0YXNrVGltZW91dE1zOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFJldHJ5IFBvbGljeSBmb3IgdGhpcyBFeGVjdXRpb24uIFNldCB2aWEge0BsaW5rIFdvcmtmbG93T3B0aW9ucy5yZXRyeX0uXG4gICAqL1xuICByZWFkb25seSByZXRyeVBvbGljeT86IFJldHJ5UG9saWN5O1xuXG4gIC8qKlxuICAgKiBTdGFydHMgYXQgMSBhbmQgaW5jcmVtZW50cyBmb3IgZXZlcnkgcmV0cnkgaWYgdGhlcmUgaXMgYSBgcmV0cnlQb2xpY3lgXG4gICAqL1xuICByZWFkb25seSBhdHRlbXB0OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIENyb24gU2NoZWR1bGUgZm9yIHRoaXMgRXhlY3V0aW9uLiBTZXQgdmlhIHtAbGluayBXb3JrZmxvd09wdGlvbnMuY3JvblNjaGVkdWxlfS5cbiAgICovXG4gIHJlYWRvbmx5IGNyb25TY2hlZHVsZT86IHN0cmluZztcblxuICAvKipcbiAgICogTWlsbGlzZWNvbmRzIGJldHdlZW4gQ3JvbiBSdW5zXG4gICAqL1xuICByZWFkb25seSBjcm9uU2NoZWR1bGVUb1NjaGVkdWxlSW50ZXJ2YWw/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBCdWlsZCBJRCBvZiB0aGUgd29ya2VyIHdoaWNoIGV4ZWN1dGVkIHRoZSBjdXJyZW50IFdvcmtmbG93IFRhc2suIE1heSBiZSB1bmRlZmluZWQgaWYgdGhlXG4gICAqIHRhc2sgd2FzIGNvbXBsZXRlZCBieSBhIHdvcmtlciB3aXRob3V0IGEgQnVpbGQgSUQuIElmIHRoaXMgd29ya2VyIGlzIHRoZSBvbmUgZXhlY3V0aW5nIHRoaXNcbiAgICogdGFzayBmb3IgdGhlIGZpcnN0IHRpbWUgYW5kIGhhcyBhIEJ1aWxkIElEIHNldCwgdGhlbiBpdHMgSUQgd2lsbCBiZSB1c2VkLiBUaGlzIHZhbHVlIG1heSBjaGFuZ2VcbiAgICogb3ZlciB0aGUgbGlmZXRpbWUgb2YgdGhlIHdvcmtmbG93IHJ1biwgYnV0IGlzIGRldGVybWluaXN0aWMgYW5kIHNhZmUgdG8gdXNlIGZvciBicmFuY2hpbmcuXG4gICAqL1xuICByZWFkb25seSBjdXJyZW50QnVpbGRJZD86IHN0cmluZztcblxuICByZWFkb25seSB1bnNhZmU6IFVuc2FmZVdvcmtmbG93SW5mbztcbn1cblxuLyoqXG4gKiBVbnNhZmUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgV29ya2Zsb3cgRXhlY3V0aW9uLlxuICpcbiAqIE5ldmVyIHJlbHkgb24gdGhpcyBpbmZvcm1hdGlvbiBpbiBXb3JrZmxvdyBsb2dpYyBhcyBpdCB3aWxsIGNhdXNlIG5vbi1kZXRlcm1pbmlzdGljIGJlaGF2aW9yLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFVuc2FmZVdvcmtmbG93SW5mbyB7XG4gIC8qKlxuICAgKiBDdXJyZW50IHN5c3RlbSB0aW1lIGluIG1pbGxpc2Vjb25kc1xuICAgKlxuICAgKiBUaGUgc2FmZSB2ZXJzaW9uIG9mIHRpbWUgaXMgYG5ldyBEYXRlKClgIGFuZCBgRGF0ZS5ub3coKWAsIHdoaWNoIGFyZSBzZXQgb24gdGhlIGZpcnN0IGludm9jYXRpb24gb2YgYSBXb3JrZmxvd1xuICAgKiBUYXNrIGFuZCBzdGF5IGNvbnN0YW50IGZvciB0aGUgZHVyYXRpb24gb2YgdGhlIFRhc2sgYW5kIGR1cmluZyByZXBsYXkuXG4gICAqL1xuICByZWFkb25seSBub3c6ICgpID0+IG51bWJlcjtcblxuICByZWFkb25seSBpc1JlcGxheWluZzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYXJlbnRXb3JrZmxvd0luZm8ge1xuICB3b3JrZmxvd0lkOiBzdHJpbmc7XG4gIHJ1bklkOiBzdHJpbmc7XG4gIG5hbWVzcGFjZTogc3RyaW5nO1xufVxuXG4vKipcbiAqIE5vdCBhbiBhY3R1YWwgZXJyb3IsIHVzZWQgYnkgdGhlIFdvcmtmbG93IHJ1bnRpbWUgdG8gYWJvcnQgZXhlY3V0aW9uIHdoZW4ge0BsaW5rIGNvbnRpbnVlQXNOZXd9IGlzIGNhbGxlZFxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0NvbnRpbnVlQXNOZXcnKVxuZXhwb3J0IGNsYXNzIENvbnRpbnVlQXNOZXcgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSBjb21tYW5kOiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLklDb250aW51ZUFzTmV3V29ya2Zsb3dFeGVjdXRpb24pIHtcbiAgICBzdXBlcignV29ya2Zsb3cgY29udGludWVkIGFzIG5ldycpO1xuICB9XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgY29udGludWluZyBhIFdvcmtmbG93IGFzIG5ld1xuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbnRpbnVlQXNOZXdPcHRpb25zIHtcbiAgLyoqXG4gICAqIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgV29ya2Zsb3cgdHlwZSBuYW1lLCBlLmcuIHRoZSBmaWxlbmFtZSBpbiB0aGUgTm9kZS5qcyBTREsgb3IgY2xhc3MgbmFtZSBpbiBKYXZhXG4gICAqL1xuICB3b3JrZmxvd1R5cGU/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUYXNrIHF1ZXVlIHRvIGNvbnRpbnVlIHRoZSBXb3JrZmxvdyBpblxuICAgKi9cbiAgdGFza1F1ZXVlPzogc3RyaW5nO1xuICAvKipcbiAgICogVGltZW91dCBmb3IgdGhlIGVudGlyZSBXb3JrZmxvdyBydW5cbiAgICogQGZvcm1hdCB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgd29ya2Zsb3dSdW5UaW1lb3V0PzogRHVyYXRpb247XG4gIC8qKlxuICAgKiBUaW1lb3V0IGZvciBhIHNpbmdsZSBXb3JrZmxvdyB0YXNrXG4gICAqIEBmb3JtYXQge0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHdvcmtmbG93VGFza1RpbWVvdXQ/OiBEdXJhdGlvbjtcbiAgLyoqXG4gICAqIE5vbi1zZWFyY2hhYmxlIGF0dHJpYnV0ZXMgdG8gYXR0YWNoIHRvIG5leHQgV29ya2Zsb3cgcnVuXG4gICAqL1xuICBtZW1vPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIC8qKlxuICAgKiBTZWFyY2hhYmxlIGF0dHJpYnV0ZXMgdG8gYXR0YWNoIHRvIG5leHQgV29ya2Zsb3cgcnVuXG4gICAqL1xuICBzZWFyY2hBdHRyaWJ1dGVzPzogU2VhcmNoQXR0cmlidXRlcztcbiAgLyoqXG4gICAqIFdoZW4gdXNpbmcgdGhlIFdvcmtlciBWZXJzaW9uaW5nIGZlYXR1cmUsIHNwZWNpZmllcyB3aGV0aGVyIHRoaXMgV29ya2Zsb3cgc2hvdWxkXG4gICAqIENvbnRpbnVlLWFzLU5ldyBvbnRvIGEgd29ya2VyIHdpdGggYSBjb21wYXRpYmxlIEJ1aWxkIElkIG9yIG5vdC4gU2VlIHtAbGluayBWZXJzaW9uaW5nSW50ZW50fS5cbiAgICpcbiAgICogQGRlZmF1bHQgJ0NPTVBBVElCTEUnXG4gICAqXG4gICAqIEBleHBlcmltZW50YWxcbiAgICovXG4gIHZlcnNpb25pbmdJbnRlbnQ/OiBWZXJzaW9uaW5nSW50ZW50O1xufVxuXG4vKipcbiAqIFNwZWNpZmllczpcbiAqIC0gd2hldGhlciBjYW5jZWxsYXRpb24gcmVxdWVzdHMgYXJlIHNlbnQgdG8gdGhlIENoaWxkXG4gKiAtIHdoZXRoZXIgYW5kIHdoZW4gYSB7QGxpbmsgQ2FuY2VsZWRGYWlsdXJlfSBpcyB0aHJvd24gZnJvbSB7QGxpbmsgZXhlY3V0ZUNoaWxkfSBvclxuICogICB7QGxpbmsgQ2hpbGRXb3JrZmxvd0hhbmRsZS5yZXN1bHR9XG4gKlxuICogQGRlZmF1bHQge0BsaW5rIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLldBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRH1cbiAqL1xuZXhwb3J0IGVudW0gQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUge1xuICAvKipcbiAgICogRG9uJ3Qgc2VuZCBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IHRvIHRoZSBDaGlsZC5cbiAgICovXG4gIEFCQU5ET04gPSAwLFxuXG4gIC8qKlxuICAgKiBTZW5kIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgdG8gdGhlIENoaWxkLiBJbW1lZGlhdGVseSB0aHJvdyB0aGUgZXJyb3IuXG4gICAqL1xuICBUUllfQ0FOQ0VMID0gMSxcblxuICAvKipcbiAgICogU2VuZCBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IHRvIHRoZSBDaGlsZC4gVGhlIENoaWxkIG1heSByZXNwZWN0IGNhbmNlbGxhdGlvbiwgaW4gd2hpY2ggY2FzZSBhbiBlcnJvciB3aWxsIGJlIHRocm93blxuICAgKiB3aGVuIGNhbmNlbGxhdGlvbiBoYXMgY29tcGxldGVkLCBhbmQge0BsaW5rIGlzQ2FuY2VsbGF0aW9ufShlcnJvcikgd2lsbCBiZSB0cnVlLiBPbiB0aGUgb3RoZXIgaGFuZCwgdGhlIENoaWxkIG1heVxuICAgKiBpZ25vcmUgdGhlIGNhbmNlbGxhdGlvbiByZXF1ZXN0LCBpbiB3aGljaCBjYXNlIGFuIGVycm9yIG1pZ2h0IGJlIHRocm93biB3aXRoIGEgZGlmZmVyZW50IGNhdXNlLCBvciB0aGUgQ2hpbGQgbWF5XG4gICAqIGNvbXBsZXRlIHN1Y2Nlc3NmdWxseS5cbiAgICpcbiAgICogQGRlZmF1bHRcbiAgICovXG4gIFdBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRCA9IDIsXG5cbiAgLyoqXG4gICAqIFNlbmQgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCB0byB0aGUgQ2hpbGQuIFRocm93IHRoZSBlcnJvciBvbmNlIHRoZSBTZXJ2ZXIgcmVjZWl2ZXMgdGhlIENoaWxkIGNhbmNlbGxhdGlvbiByZXF1ZXN0LlxuICAgKi9cbiAgV0FJVF9DQU5DRUxMQVRJT05fUkVRVUVTVEVEID0gMyxcbn1cblxuY2hlY2tFeHRlbmRzPGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUsIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlPigpO1xuY2hlY2tFeHRlbmRzPENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLCBjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LkNoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlPigpO1xuXG4vKipcbiAqIEhvdyBhIENoaWxkIFdvcmtmbG93IHJlYWN0cyB0byB0aGUgUGFyZW50IFdvcmtmbG93IHJlYWNoaW5nIGEgQ2xvc2VkIHN0YXRlLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9jb25jZXB0cy93aGF0LWlzLWEtcGFyZW50LWNsb3NlLXBvbGljeS8gfCBQYXJlbnQgQ2xvc2UgUG9saWN5fVxuICovXG5leHBvcnQgZW51bSBQYXJlbnRDbG9zZVBvbGljeSB7XG4gIC8qKlxuICAgKiBJZiBhIGBQYXJlbnRDbG9zZVBvbGljeWAgaXMgc2V0IHRvIHRoaXMsIG9yIGlzIG5vdCBzZXQgYXQgYWxsLCB0aGUgc2VydmVyIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkLlxuICAgKi9cbiAgUEFSRU5UX0NMT1NFX1BPTElDWV9VTlNQRUNJRklFRCA9IDAsXG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIFBhcmVudCBpcyBDbG9zZWQsIHRoZSBDaGlsZCBpcyBUZXJtaW5hdGVkLlxuICAgKlxuICAgKiBAZGVmYXVsdFxuICAgKi9cbiAgUEFSRU5UX0NMT1NFX1BPTElDWV9URVJNSU5BVEUgPSAxLFxuXG4gIC8qKlxuICAgKiBXaGVuIHRoZSBQYXJlbnQgaXMgQ2xvc2VkLCBub3RoaW5nIGlzIGRvbmUgdG8gdGhlIENoaWxkLlxuICAgKi9cbiAgUEFSRU5UX0NMT1NFX1BPTElDWV9BQkFORE9OID0gMixcblxuICAvKipcbiAgICogV2hlbiB0aGUgUGFyZW50IGlzIENsb3NlZCwgdGhlIENoaWxkIGlzIENhbmNlbGxlZC5cbiAgICovXG4gIFBBUkVOVF9DTE9TRV9QT0xJQ1lfUkVRVUVTVF9DQU5DRUwgPSAzLFxufVxuXG5jaGVja0V4dGVuZHM8Y29yZXNkay5jaGlsZF93b3JrZmxvdy5QYXJlbnRDbG9zZVBvbGljeSwgUGFyZW50Q2xvc2VQb2xpY3k+KCk7XG5jaGVja0V4dGVuZHM8UGFyZW50Q2xvc2VQb2xpY3ksIGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuUGFyZW50Q2xvc2VQb2xpY3k+KCk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hpbGRXb3JrZmxvd09wdGlvbnMgZXh0ZW5kcyBDb21tb25Xb3JrZmxvd09wdGlvbnMge1xuICAvKipcbiAgICogV29ya2Zsb3cgaWQgdG8gdXNlIHdoZW4gc3RhcnRpbmcuIElmIG5vdCBzcGVjaWZpZWQgYSBVVUlEIGlzIGdlbmVyYXRlZC4gTm90ZSB0aGF0IGl0IGlzXG4gICAqIGRhbmdlcm91cyBhcyBpbiBjYXNlIG9mIGNsaWVudCBzaWRlIHJldHJpZXMgbm8gZGVkdXBsaWNhdGlvbiB3aWxsIGhhcHBlbiBiYXNlZCBvbiB0aGVcbiAgICogZ2VuZXJhdGVkIGlkLiBTbyBwcmVmZXIgYXNzaWduaW5nIGJ1c2luZXNzIG1lYW5pbmdmdWwgaWRzIGlmIHBvc3NpYmxlLlxuICAgKi9cbiAgd29ya2Zsb3dJZD86IHN0cmluZztcblxuICAvKipcbiAgICogVGFzayBxdWV1ZSB0byB1c2UgZm9yIFdvcmtmbG93IHRhc2tzLiBJdCBzaG91bGQgbWF0Y2ggYSB0YXNrIHF1ZXVlIHNwZWNpZmllZCB3aGVuIGNyZWF0aW5nIGFcbiAgICogYFdvcmtlcmAgdGhhdCBob3N0cyB0aGUgV29ya2Zsb3cgY29kZS5cbiAgICovXG4gIHRhc2tRdWV1ZT86IHN0cmluZztcblxuICAvKipcbiAgICogU3BlY2lmaWVzOlxuICAgKiAtIHdoZXRoZXIgY2FuY2VsbGF0aW9uIHJlcXVlc3RzIGFyZSBzZW50IHRvIHRoZSBDaGlsZFxuICAgKiAtIHdoZXRoZXIgYW5kIHdoZW4gYW4gZXJyb3IgaXMgdGhyb3duIGZyb20ge0BsaW5rIGV4ZWN1dGVDaGlsZH0gb3JcbiAgICogICB7QGxpbmsgQ2hpbGRXb3JrZmxvd0hhbmRsZS5yZXN1bHR9XG4gICAqXG4gICAqIEBkZWZhdWx0IHtAbGluayBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZS5XQUlUX0NBTkNFTExBVElPTl9DT01QTEVURUR9XG4gICAqL1xuICBjYW5jZWxsYXRpb25UeXBlPzogQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGU7XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBob3cgdGhlIENoaWxkIHJlYWN0cyB0byB0aGUgUGFyZW50IFdvcmtmbG93IHJlYWNoaW5nIGEgQ2xvc2VkIHN0YXRlLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7QGxpbmsgUGFyZW50Q2xvc2VQb2xpY3kuUEFSRU5UX0NMT1NFX1BPTElDWV9URVJNSU5BVEV9XG4gICAqL1xuICBwYXJlbnRDbG9zZVBvbGljeT86IFBhcmVudENsb3NlUG9saWN5O1xuXG4gIC8qKlxuICAgKiBXaGVuIHVzaW5nIHRoZSBXb3JrZXIgVmVyc2lvbmluZyBmZWF0dXJlLCBzcGVjaWZpZXMgd2hldGhlciB0aGlzIENoaWxkIFdvcmtmbG93IHNob3VsZCBydW4gb25cbiAgICogYSB3b3JrZXIgd2l0aCBhIGNvbXBhdGlibGUgQnVpbGQgSWQgb3Igbm90LiBTZWUge0BsaW5rIFZlcnNpb25pbmdJbnRlbnR9LlxuICAgKlxuICAgKiBAZGVmYXVsdCAnQ09NUEFUSUJMRSdcbiAgICpcbiAgICogQGV4cGVyaW1lbnRhbFxuICAgKi9cbiAgdmVyc2lvbmluZ0ludGVudD86IFZlcnNpb25pbmdJbnRlbnQ7XG59XG5cbmV4cG9ydCB0eXBlIFJlcXVpcmVkQ2hpbGRXb3JrZmxvd09wdGlvbnMgPSBSZXF1aXJlZDxQaWNrPENoaWxkV29ya2Zsb3dPcHRpb25zLCAnd29ya2Zsb3dJZCcgfCAnY2FuY2VsbGF0aW9uVHlwZSc+PiAmIHtcbiAgYXJnczogdW5rbm93bltdO1xufTtcblxuZXhwb3J0IHR5cGUgQ2hpbGRXb3JrZmxvd09wdGlvbnNXaXRoRGVmYXVsdHMgPSBDaGlsZFdvcmtmbG93T3B0aW9ucyAmIFJlcXVpcmVkQ2hpbGRXb3JrZmxvd09wdGlvbnM7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU0RLSW5mbyB7XG4gIG5hbWU6IHN0cmluZztcbiAgdmVyc2lvbjogc3RyaW5nO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBzbGljZSBvZiBhIGZpbGUgc3RhcnRpbmcgYXQgbGluZU9mZnNldFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVTbGljZSB7XG4gIC8qKlxuICAgKiBzbGljZSBvZiBhIGZpbGUgd2l0aCBgXFxuYCAobmV3bGluZSkgbGluZSB0ZXJtaW5hdG9yLlxuICAgKi9cbiAgY29udGVudDogc3RyaW5nO1xuICAvKipcbiAgICogT25seSB1c2VkIHBvc3NpYmxlIHRvIHRyaW0gdGhlIGZpbGUgd2l0aG91dCBicmVha2luZyBzeW50YXggaGlnaGxpZ2h0aW5nLlxuICAgKi9cbiAgbGluZU9mZnNldDogbnVtYmVyO1xufVxuXG4vKipcbiAqIEEgcG9pbnRlciB0byBhIGxvY2F0aW9uIGluIGEgZmlsZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVMb2NhdGlvbiB7XG4gIC8qKlxuICAgKiBQYXRoIHRvIHNvdXJjZSBmaWxlIChhYnNvbHV0ZSBvciByZWxhdGl2ZSkuXG4gICAqIFdoZW4gdXNpbmcgYSByZWxhdGl2ZSBwYXRoLCBtYWtlIHN1cmUgYWxsIHBhdGhzIGFyZSByZWxhdGl2ZSB0byB0aGUgc2FtZSByb290LlxuICAgKi9cbiAgZmlsZVBhdGg/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBJZiBwb3NzaWJsZSwgU0RLIHNob3VsZCBzZW5kIHRoaXMsIHJlcXVpcmVkIGZvciBkaXNwbGF5aW5nIHRoZSBjb2RlIGxvY2F0aW9uLlxuICAgKi9cbiAgbGluZT86IG51bWJlcjtcbiAgLyoqXG4gICAqIElmIHBvc3NpYmxlLCBTREsgc2hvdWxkIHNlbmQgdGhpcy5cbiAgICovXG4gIGNvbHVtbj86IG51bWJlcjtcbiAgLyoqXG4gICAqIEZ1bmN0aW9uIG5hbWUgdGhpcyBsaW5lIGJlbG9uZ3MgdG8gKGlmIGFwcGxpY2FibGUpLlxuICAgKiBVc2VkIGZvciBmYWxsaW5nIGJhY2sgdG8gc3RhY2sgdHJhY2Ugdmlldy5cbiAgICovXG4gIGZ1bmN0aW9uTmFtZT86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdGFja1RyYWNlIHtcbiAgbG9jYXRpb25zOiBGaWxlTG9jYXRpb25bXTtcbn1cblxuLyoqXG4gKiBVc2VkIGFzIHRoZSByZXN1bHQgZm9yIHRoZSBlbmhhbmNlZCBzdGFjayB0cmFjZSBxdWVyeVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVuaGFuY2VkU3RhY2tUcmFjZSB7XG4gIHNkazogU0RLSW5mbztcbiAgLyoqXG4gICAqIE1hcHBpbmcgb2YgZmlsZSBwYXRoIHRvIGZpbGUgY29udGVudHMuXG4gICAqIFNESyBtYXkgY2hvb3NlIHRvIHNlbmQgbm8sIHNvbWUgb3IgYWxsIHNvdXJjZXMuXG4gICAqIFNvdXJjZXMgbWlnaHQgYmUgdHJpbW1lZCwgYW5kIHNvbWUgdGltZSBvbmx5IHRoZSBmaWxlKHMpIG9mIHRoZSB0b3AgZWxlbWVudCBvZiB0aGUgdHJhY2Ugd2lsbCBiZSBzZW50LlxuICAgKi9cbiAgc291cmNlczogUmVjb3JkPHN0cmluZywgRmlsZVNsaWNlW10+O1xuICBzdGFja3M6IFN0YWNrVHJhY2VbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0NyZWF0ZU9wdGlvbnMge1xuICBpbmZvOiBXb3JrZmxvd0luZm87XG4gIHJhbmRvbW5lc3NTZWVkOiBudW1iZXJbXTtcbiAgbm93OiBudW1iZXI7XG4gIHBhdGNoZXM6IHN0cmluZ1tdO1xuICBzaG93U3RhY2tUcmFjZVNvdXJjZXM6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dDcmVhdGVPcHRpb25zSW50ZXJuYWwgZXh0ZW5kcyBXb3JrZmxvd0NyZWF0ZU9wdGlvbnMge1xuICBzb3VyY2VNYXA6IFJhd1NvdXJjZU1hcDtcbiAgcmVnaXN0ZXJlZEFjdGl2aXR5TmFtZXM6IFNldDxzdHJpbmc+O1xuICBnZXRUaW1lT2ZEYXkoKTogYmlnaW50O1xufVxuXG4vKipcbiAqIEEgaGFuZGxlciBmdW5jdGlvbiBjYXBhYmxlIG9mIGFjY2VwdGluZyB0aGUgYXJndW1lbnRzIGZvciBhIGdpdmVuIFVwZGF0ZURlZmluaXRpb24sIFNpZ25hbERlZmluaXRpb24gb3IgUXVlcnlEZWZpbml0aW9uLlxuICovXG5leHBvcnQgdHlwZSBIYW5kbGVyPFxuICBSZXQsXG4gIEFyZ3MgZXh0ZW5kcyBhbnlbXSxcbiAgVCBleHRlbmRzIFVwZGF0ZURlZmluaXRpb248UmV0LCBBcmdzPiB8IFNpZ25hbERlZmluaXRpb248QXJncz4gfCBRdWVyeURlZmluaXRpb248UmV0LCBBcmdzPixcbj4gPSBUIGV4dGVuZHMgVXBkYXRlRGVmaW5pdGlvbjxpbmZlciBSLCBpbmZlciBBPlxuICA/ICguLi5hcmdzOiBBKSA9PiBSIHwgUHJvbWlzZTxSPlxuICA6IFQgZXh0ZW5kcyBTaWduYWxEZWZpbml0aW9uPGluZmVyIEE+XG4gICAgPyAoLi4uYXJnczogQSkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD5cbiAgICA6IFQgZXh0ZW5kcyBRdWVyeURlZmluaXRpb248aW5mZXIgUiwgaW5mZXIgQT5cbiAgICAgID8gKC4uLmFyZ3M6IEEpID0+IFJcbiAgICAgIDogbmV2ZXI7XG5cbi8qKlxuICogQSBoYW5kbGVyIGZ1bmN0aW9uIGFjY2VwdGluZyBzaWduYWwgY2FsbHMgZm9yIG5vbi1yZWdpc3RlcmVkIHNpZ25hbCBuYW1lcy5cbiAqL1xuZXhwb3J0IHR5cGUgRGVmYXVsdFNpZ25hbEhhbmRsZXIgPSAoc2lnbmFsTmFtZTogc3RyaW5nLCAuLi5hcmdzOiB1bmtub3duW10pID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xuXG4vKipcbiAqIEEgdmFsaWRhdGlvbiBmdW5jdGlvbiBjYXBhYmxlIG9mIGFjY2VwdGluZyB0aGUgYXJndW1lbnRzIGZvciBhIGdpdmVuIFVwZGF0ZURlZmluaXRpb24uXG4gKi9cbmV4cG9ydCB0eXBlIFVwZGF0ZVZhbGlkYXRvcjxBcmdzIGV4dGVuZHMgYW55W10+ID0gKC4uLmFyZ3M6IEFyZ3MpID0+IHZvaWQ7XG5cbi8qKlxuICogQSBkZXNjcmlwdGlvbiBvZiBhIHF1ZXJ5IGhhbmRsZXIuXG4gKi9cbmV4cG9ydCB0eXBlIFF1ZXJ5SGFuZGxlck9wdGlvbnMgPSB7IGRlc2NyaXB0aW9uPzogc3RyaW5nIH07XG5cbi8qKlxuICogQSBkZXNjcmlwdGlvbiBvZiBhIHNpZ25hbCBoYW5kbGVyLlxuICovXG5leHBvcnQgdHlwZSBTaWduYWxIYW5kbGVyT3B0aW9ucyA9IHsgZGVzY3JpcHRpb24/OiBzdHJpbmcgfTtcblxuLyoqXG4gKiBBIHZhbGlkYXRvciBhbmQgZGVzY3JpcHRpb24gb2YgYW4gdXBkYXRlIGhhbmRsZXIuXG4gKi9cbmV4cG9ydCB0eXBlIFVwZGF0ZUhhbmRsZXJPcHRpb25zPEFyZ3MgZXh0ZW5kcyBhbnlbXT4gPSB7IHZhbGlkYXRvcj86IFVwZGF0ZVZhbGlkYXRvcjxBcmdzPjsgZGVzY3JpcHRpb24/OiBzdHJpbmcgfTtcblxuZXhwb3J0IGludGVyZmFjZSBBY3RpdmF0aW9uQ29tcGxldGlvbiB7XG4gIGNvbW1hbmRzOiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLklXb3JrZmxvd0NvbW1hbmRbXTtcbiAgdXNlZEludGVybmFsRmxhZ3M6IG51bWJlcltdO1xufVxuIiwiaW1wb3J0IHR5cGUgeyBSYXdTb3VyY2VNYXAgfSBmcm9tICdzb3VyY2UtbWFwJztcbmltcG9ydCB7XG4gIGRlZmF1bHRGYWlsdXJlQ29udmVydGVyLFxuICBGYWlsdXJlQ29udmVydGVyLFxuICBQYXlsb2FkQ29udmVydGVyLFxuICBhcnJheUZyb21QYXlsb2FkcyxcbiAgZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIsXG4gIGVuc3VyZVRlbXBvcmFsRmFpbHVyZSxcbiAgSWxsZWdhbFN0YXRlRXJyb3IsXG4gIFRlbXBvcmFsRmFpbHVyZSxcbiAgV29ya2Zsb3csXG4gIFdvcmtmbG93RXhlY3V0aW9uQWxyZWFkeVN0YXJ0ZWRFcnJvcixcbiAgV29ya2Zsb3dRdWVyeUFubm90YXRlZFR5cGUsXG4gIFdvcmtmbG93U2lnbmFsQW5ub3RhdGVkVHlwZSxcbiAgV29ya2Zsb3dVcGRhdGVBbm5vdGF0ZWRUeXBlLFxuICBQcm90b0ZhaWx1cmUsXG4gIEFwcGxpY2F0aW9uRmFpbHVyZSxcbn0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IGNvbXBvc2VJbnRlcmNlcHRvcnMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQgeyBjaGVja0V4dGVuZHMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3R5cGUtaGVscGVycyc7XG5pbXBvcnQgdHlwZSB7IGNvcmVzZGssIHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgYWxlYSwgUk5HIH0gZnJvbSAnLi9hbGVhJztcbmltcG9ydCB7IFJvb3RDYW5jZWxsYXRpb25TY29wZSB9IGZyb20gJy4vY2FuY2VsbGF0aW9uLXNjb3BlJztcbmltcG9ydCB7IERldGVybWluaXNtVmlvbGF0aW9uRXJyb3IsIExvY2FsQWN0aXZpdHlEb0JhY2tvZmYsIGlzQ2FuY2VsbGF0aW9uIH0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHsgUXVlcnlJbnB1dCwgU2lnbmFsSW5wdXQsIFVwZGF0ZUlucHV0LCBXb3JrZmxvd0V4ZWN1dGVJbnB1dCwgV29ya2Zsb3dJbnRlcmNlcHRvcnMgfSBmcm9tICcuL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQge1xuICBDb250aW51ZUFzTmV3LFxuICBEZWZhdWx0U2lnbmFsSGFuZGxlcixcbiAgU0RLSW5mbyxcbiAgRmlsZVNsaWNlLFxuICBFbmhhbmNlZFN0YWNrVHJhY2UsXG4gIEZpbGVMb2NhdGlvbixcbiAgV29ya2Zsb3dJbmZvLFxuICBXb3JrZmxvd0NyZWF0ZU9wdGlvbnNJbnRlcm5hbCxcbiAgQWN0aXZhdGlvbkNvbXBsZXRpb24sXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyB0eXBlIFNpbmtDYWxsIH0gZnJvbSAnLi9zaW5rcyc7XG5pbXBvcnQgeyB1bnRyYWNrUHJvbWlzZSB9IGZyb20gJy4vc3RhY2staGVscGVycyc7XG5pbXBvcnQgcGtnIGZyb20gJy4vcGtnJztcbmltcG9ydCB7IGV4ZWN1dGVXaXRoTGlmZWN5Y2xlTG9nZ2luZyB9IGZyb20gJy4vbG9ncyc7XG5pbXBvcnQgeyBTZGtGbGFnLCBhc3NlcnRWYWxpZEZsYWcgfSBmcm9tICcuL2ZsYWdzJztcblxuZW51bSBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZSB7XG4gIFNUQVJUX0NISUxEX1dPUktGTE9XX0VYRUNVVElPTl9GQUlMRURfQ0FVU0VfVU5TUEVDSUZJRUQgPSAwLFxuICBTVEFSVF9DSElMRF9XT1JLRkxPV19FWEVDVVRJT05fRkFJTEVEX0NBVVNFX1dPUktGTE9XX0FMUkVBRFlfRVhJU1RTID0gMSxcbn1cblxuY2hlY2tFeHRlbmRzPGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2UsIFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlPigpO1xuY2hlY2tFeHRlbmRzPFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlLCBjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LlN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlPigpO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN0YWNrIHtcbiAgZm9ybWF0dGVkOiBzdHJpbmc7XG4gIHN0cnVjdHVyZWQ6IEZpbGVMb2NhdGlvbltdO1xufVxuXG4vKipcbiAqIEdsb2JhbCBzdG9yZSB0byB0cmFjayBwcm9taXNlIHN0YWNrcyBmb3Igc3RhY2sgdHJhY2UgcXVlcnlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQcm9taXNlU3RhY2tTdG9yZSB7XG4gIGNoaWxkVG9QYXJlbnQ6IE1hcDxQcm9taXNlPHVua25vd24+LCBTZXQ8UHJvbWlzZTx1bmtub3duPj4+O1xuICBwcm9taXNlVG9TdGFjazogTWFwPFByb21pc2U8dW5rbm93bj4sIFN0YWNrPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21wbGV0aW9uIHtcbiAgcmVzb2x2ZSh2YWw6IHVua25vd24pOiB1bmtub3duO1xuICByZWplY3QocmVhc29uOiB1bmtub3duKTogdW5rbm93bjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb25kaXRpb24ge1xuICBmbigpOiBib29sZWFuO1xuICByZXNvbHZlKCk6IHZvaWQ7XG59XG5cbmV4cG9ydCB0eXBlIEFjdGl2YXRpb25IYW5kbGVyRnVuY3Rpb248SyBleHRlbmRzIGtleW9mIGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JV29ya2Zsb3dBY3RpdmF0aW9uSm9iPiA9IChcbiAgYWN0aXZhdGlvbjogTm9uTnVsbGFibGU8Y29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklXb3JrZmxvd0FjdGl2YXRpb25Kb2JbS10+XG4pID0+IHZvaWQ7XG5cbi8qKlxuICogVmVyaWZpZXMgYWxsIGFjdGl2YXRpb24gam9iIGhhbmRsaW5nIG1ldGhvZHMgYXJlIGltcGxlbWVudGVkXG4gKi9cbmV4cG9ydCB0eXBlIEFjdGl2YXRpb25IYW5kbGVyID0ge1xuICBbUCBpbiBrZXlvZiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbkpvYl06IEFjdGl2YXRpb25IYW5kbGVyRnVuY3Rpb248UD47XG59O1xuXG4vKipcbiAqIEtlZXBzIGFsbCBvZiB0aGUgV29ya2Zsb3cgcnVudGltZSBzdGF0ZSBsaWtlIHBlbmRpbmcgY29tcGxldGlvbnMgZm9yIGFjdGl2aXRpZXMgYW5kIHRpbWVycy5cbiAqXG4gKiBJbXBsZW1lbnRzIGhhbmRsZXJzIGZvciBhbGwgd29ya2Zsb3cgYWN0aXZhdGlvbiBqb2JzLlxuICovXG5leHBvcnQgY2xhc3MgQWN0aXZhdG9yIGltcGxlbWVudHMgQWN0aXZhdGlvbkhhbmRsZXIge1xuICAvKipcbiAgICogQ2FjaGUgZm9yIG1vZHVsZXMgLSByZWZlcmVuY2VkIGluIHJldXNhYmxlLXZtLnRzXG4gICAqL1xuICByZWFkb25seSBtb2R1bGVDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCB1bmtub3duPigpO1xuICAvKipcbiAgICogTWFwIG9mIHRhc2sgc2VxdWVuY2UgdG8gYSBDb21wbGV0aW9uXG4gICAqL1xuICByZWFkb25seSBjb21wbGV0aW9ucyA9IHtcbiAgICB0aW1lcjogbmV3IE1hcDxudW1iZXIsIENvbXBsZXRpb24+KCksXG4gICAgYWN0aXZpdHk6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICAgIGNoaWxkV29ya2Zsb3dTdGFydDogbmV3IE1hcDxudW1iZXIsIENvbXBsZXRpb24+KCksXG4gICAgY2hpbGRXb3JrZmxvd0NvbXBsZXRlOiBuZXcgTWFwPG51bWJlciwgQ29tcGxldGlvbj4oKSxcbiAgICBzaWduYWxXb3JrZmxvdzogbmV3IE1hcDxudW1iZXIsIENvbXBsZXRpb24+KCksXG4gICAgY2FuY2VsV29ya2Zsb3c6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICB9O1xuXG4gIC8qKlxuICAgKiBIb2xkcyBidWZmZXJlZCBVcGRhdGUgY2FsbHMgdW50aWwgYSBoYW5kbGVyIGlzIHJlZ2lzdGVyZWRcbiAgICovXG4gIHJlYWRvbmx5IGJ1ZmZlcmVkVXBkYXRlcyA9IEFycmF5PGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JRG9VcGRhdGU+KCk7XG5cbiAgLyoqXG4gICAqIEhvbGRzIGJ1ZmZlcmVkIHNpZ25hbCBjYWxscyB1bnRpbCBhIGhhbmRsZXIgaXMgcmVnaXN0ZXJlZFxuICAgKi9cbiAgcmVhZG9ubHkgYnVmZmVyZWRTaWduYWxzID0gQXJyYXk8Y29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklTaWduYWxXb3JrZmxvdz4oKTtcblxuICAvKipcbiAgICogSG9sZHMgYnVmZmVyZWQgcXVlcnkgY2FsbHMgdW50aWwgYSBoYW5kbGVyIGlzIHJlZ2lzdGVyZWQuXG4gICAqXG4gICAqICoqSU1QT1JUQU5UKiogcXVlcmllcyBhcmUgb25seSBidWZmZXJlZCB1bnRpbCB3b3JrZmxvdyBpcyBzdGFydGVkLlxuICAgKiBUaGlzIGlzIHJlcXVpcmVkIGJlY2F1c2UgYXN5bmMgaW50ZXJjZXB0b3JzIG1pZ2h0IGJsb2NrIHdvcmtmbG93IGZ1bmN0aW9uIGludm9jYXRpb25cbiAgICogd2hpY2ggZGVsYXlzIHF1ZXJ5IGhhbmRsZXIgcmVnaXN0cmF0aW9uLlxuICAgKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGJ1ZmZlcmVkUXVlcmllcyA9IEFycmF5PGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JUXVlcnlXb3JrZmxvdz4oKTtcblxuICAvKipcbiAgICogTWFwcGluZyBvZiB1cGRhdGUgbmFtZSB0byBoYW5kbGVyIGFuZCB2YWxpZGF0b3JcbiAgICovXG4gIHJlYWRvbmx5IHVwZGF0ZUhhbmRsZXJzID0gbmV3IE1hcDxzdHJpbmcsIFdvcmtmbG93VXBkYXRlQW5ub3RhdGVkVHlwZT4oKTtcblxuICAvKipcbiAgICogTWFwcGluZyBvZiBzaWduYWwgbmFtZSB0byBoYW5kbGVyXG4gICAqL1xuICByZWFkb25seSBzaWduYWxIYW5kbGVycyA9IG5ldyBNYXA8c3RyaW5nLCBXb3JrZmxvd1NpZ25hbEFubm90YXRlZFR5cGU+KCk7XG5cbiAgLyoqXG4gICAqIEEgc2lnbmFsIGhhbmRsZXIgdGhhdCBjYXRjaGVzIGNhbGxzIGZvciBub24tcmVnaXN0ZXJlZCBzaWduYWwgbmFtZXMuXG4gICAqL1xuICBkZWZhdWx0U2lnbmFsSGFuZGxlcj86IERlZmF1bHRTaWduYWxIYW5kbGVyO1xuXG4gIC8qKlxuICAgKiBTb3VyY2UgbWFwIGZpbGUgZm9yIGxvb2tpbmcgdXAgdGhlIHNvdXJjZSBmaWxlcyBpbiByZXNwb25zZSB0byBfX2VuaGFuY2VkX3N0YWNrX3RyYWNlXG4gICAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgc291cmNlTWFwOiBSYXdTb3VyY2VNYXA7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgb3Igbm90IHRvIHNlbmQgdGhlIHNvdXJjZXMgaW4gZW5oYW5jZWQgc3RhY2sgdHJhY2UgcXVlcnkgcmVzcG9uc2VzXG4gICAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgc2hvd1N0YWNrVHJhY2VTb3VyY2VzO1xuXG4gIHJlYWRvbmx5IHByb21pc2VTdGFja1N0b3JlOiBQcm9taXNlU3RhY2tTdG9yZSA9IHtcbiAgICBwcm9taXNlVG9TdGFjazogbmV3IE1hcCgpLFxuICAgIGNoaWxkVG9QYXJlbnQ6IG5ldyBNYXAoKSxcbiAgfTtcblxuICBwdWJsaWMgcmVhZG9ubHkgcm9vdFNjb3BlID0gbmV3IFJvb3RDYW5jZWxsYXRpb25TY29wZSgpO1xuXG4gIC8qKlxuICAgKiBNYXBwaW5nIG9mIHF1ZXJ5IG5hbWUgdG8gaGFuZGxlclxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IHF1ZXJ5SGFuZGxlcnMgPSBuZXcgTWFwPHN0cmluZywgV29ya2Zsb3dRdWVyeUFubm90YXRlZFR5cGU+KFtcbiAgICBbXG4gICAgICAnX19zdGFja190cmFjZScsXG4gICAgICB7XG4gICAgICAgIGhhbmRsZXI6ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTdGFja1RyYWNlcygpXG4gICAgICAgICAgICAubWFwKChzKSA9PiBzLmZvcm1hdHRlZClcbiAgICAgICAgICAgIC5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZXR1cm5zIGEgc2Vuc2libGUgc3RhY2sgdHJhY2UuJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBbXG4gICAgICAnX19lbmhhbmNlZF9zdGFja190cmFjZScsXG4gICAgICB7XG4gICAgICAgIGhhbmRsZXI6ICgpOiBFbmhhbmNlZFN0YWNrVHJhY2UgPT4ge1xuICAgICAgICAgIGNvbnN0IHsgc291cmNlTWFwIH0gPSB0aGlzO1xuICAgICAgICAgIGNvbnN0IHNkazogU0RLSW5mbyA9IHsgbmFtZTogJ3R5cGVzY3JpcHQnLCB2ZXJzaW9uOiBwa2cudmVyc2lvbiB9O1xuICAgICAgICAgIGNvbnN0IHN0YWNrcyA9IHRoaXMuZ2V0U3RhY2tUcmFjZXMoKS5tYXAoKHsgc3RydWN0dXJlZDogbG9jYXRpb25zIH0pID0+ICh7IGxvY2F0aW9ucyB9KSk7XG4gICAgICAgICAgY29uc3Qgc291cmNlczogUmVjb3JkPHN0cmluZywgRmlsZVNsaWNlW10+ID0ge307XG4gICAgICAgICAgaWYgKHRoaXMuc2hvd1N0YWNrVHJhY2VTb3VyY2VzKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgbG9jYXRpb25zIH0gb2Ygc3RhY2tzKSB7XG4gICAgICAgICAgICAgIGZvciAoY29uc3QgeyBmaWxlUGF0aCB9IG9mIGxvY2F0aW9ucykge1xuICAgICAgICAgICAgICAgIGlmICghZmlsZVBhdGgpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBzb3VyY2VNYXA/LnNvdXJjZXNDb250ZW50Py5bc291cmNlTWFwPy5zb3VyY2VzLmluZGV4T2YoZmlsZVBhdGgpXTtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbnRlbnQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIHNvdXJjZXNbZmlsZVBhdGhdID0gW1xuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgICAgICAgICBsaW5lT2Zmc2V0OiAwLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7IHNkaywgc3RhY2tzLCBzb3VyY2VzIH07XG4gICAgICAgIH0sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmV0dXJucyBhIHN0YWNrIHRyYWNlIGFubm90YXRlZCB3aXRoIHNvdXJjZSBpbmZvcm1hdGlvbi4nLFxuICAgICAgfSxcbiAgICBdLFxuICAgIFtcbiAgICAgICdfX3RlbXBvcmFsX3dvcmtmbG93X21ldGFkYXRhJyxcbiAgICAgIHtcbiAgICAgICAgaGFuZGxlcjogKCk6IHRlbXBvcmFsLmFwaS5zZGsudjEuSVdvcmtmbG93TWV0YWRhdGEgPT4ge1xuICAgICAgICAgIGNvbnN0IHdvcmtmbG93VHlwZSA9IHRoaXMuaW5mby53b3JrZmxvd1R5cGU7XG4gICAgICAgICAgY29uc3QgcXVlcnlEZWZpbml0aW9ucyA9IEFycmF5LmZyb20odGhpcy5xdWVyeUhhbmRsZXJzLmVudHJpZXMoKSkubWFwKChbbmFtZSwgdmFsdWVdKSA9PiAoe1xuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB2YWx1ZS5kZXNjcmlwdGlvbixcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgY29uc3Qgc2lnbmFsRGVmaW5pdGlvbnMgPSBBcnJheS5mcm9tKHRoaXMuc2lnbmFsSGFuZGxlcnMuZW50cmllcygpKS5tYXAoKFtuYW1lLCB2YWx1ZV0pID0+ICh7XG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHZhbHVlLmRlc2NyaXB0aW9uLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBjb25zdCB1cGRhdGVEZWZpbml0aW9ucyA9IEFycmF5LmZyb20odGhpcy51cGRhdGVIYW5kbGVycy5lbnRyaWVzKCkpLm1hcCgoW25hbWUsIHZhbHVlXSkgPT4gKHtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogdmFsdWUuZGVzY3JpcHRpb24sXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgICAgICAgIHR5cGU6IHdvcmtmbG93VHlwZSxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG51bGwsIC8vIEZvciBub3csIGRvIG5vdCBzZXQgdGhlIHdvcmtmbG93IGRlc2NyaXB0aW9uIGluIHRoZSBUUyBTREsuXG4gICAgICAgICAgICAgIHF1ZXJ5RGVmaW5pdGlvbnMsXG4gICAgICAgICAgICAgIHNpZ25hbERlZmluaXRpb25zLFxuICAgICAgICAgICAgICB1cGRhdGVEZWZpbml0aW9ucyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZXR1cm5zIG1ldGFkYXRhIGFzc29jaWF0ZWQgd2l0aCB0aGlzIHdvcmtmbG93LicsXG4gICAgICB9LFxuICAgIF0sXG4gIF0pO1xuXG4gIC8qKlxuICAgKiBMb2FkZWQgaW4ge0BsaW5rIGluaXRSdW50aW1lfVxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGludGVyY2VwdG9yczogUmVxdWlyZWQ8V29ya2Zsb3dJbnRlcmNlcHRvcnM+ID0geyBpbmJvdW5kOiBbXSwgb3V0Ym91bmQ6IFtdLCBpbnRlcm5hbHM6IFtdIH07XG5cbiAgLyoqXG4gICAqIEJ1ZmZlciB0aGF0IHN0b3JlcyBhbGwgZ2VuZXJhdGVkIGNvbW1hbmRzLCByZXNldCBhZnRlciBlYWNoIGFjdGl2YXRpb25cbiAgICovXG4gIHByb3RlY3RlZCBjb21tYW5kczogY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5JV29ya2Zsb3dDb21tYW5kW10gPSBbXTtcblxuICAvKipcbiAgICogU3RvcmVzIGFsbCB7QGxpbmsgY29uZGl0aW9ufXMgdGhhdCBoYXZlbid0IGJlZW4gdW5ibG9ja2VkIHlldFxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGJsb2NrZWRDb25kaXRpb25zID0gbmV3IE1hcDxudW1iZXIsIENvbmRpdGlvbj4oKTtcblxuICAvKipcbiAgICogSXMgdGhpcyBXb3JrZmxvdyBjb21wbGV0ZWQ/XG4gICAqXG4gICAqIEEgV29ya2Zsb3cgd2lsbCBiZSBjb25zaWRlcmVkIGNvbXBsZXRlZCBpZiBpdCBnZW5lcmF0ZXMgYSBjb21tYW5kIHRoYXQgdGhlXG4gICAqIHN5c3RlbSBjb25zaWRlcnMgYXMgYSBmaW5hbCBXb3JrZmxvdyBjb21tYW5kIChlLmcuXG4gICAqIGNvbXBsZXRlV29ya2Zsb3dFeGVjdXRpb24gb3IgZmFpbFdvcmtmbG93RXhlY3V0aW9uKS5cbiAgICovXG4gIHB1YmxpYyBjb21wbGV0ZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogV2FzIHRoaXMgV29ya2Zsb3cgY2FuY2VsbGVkP1xuICAgKi9cbiAgcHJvdGVjdGVkIGNhbmNlbGxlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBUaGlzIGlzIHRyYWNrZWQgdG8gYWxsb3cgYnVmZmVyaW5nIHF1ZXJpZXMgdW50aWwgYSB3b3JrZmxvdyBmdW5jdGlvbiBpcyBjYWxsZWQuXG4gICAqIFRPRE8oYmVyZ3VuZHkpOiBJIGRvbid0IHRoaW5rIHRoaXMgbWFrZXMgc2Vuc2Ugc2luY2UgcXVlcmllcyBydW4gbGFzdCBpbiBhbiBhY3RpdmF0aW9uIGFuZCBtdXN0IGJlIHJlc3BvbmRlZCB0byBpblxuICAgKiB0aGUgc2FtZSBhY3RpdmF0aW9uLlxuICAgKi9cbiAgcHJvdGVjdGVkIHdvcmtmbG93RnVuY3Rpb25XYXNDYWxsZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogVGhlIG5leHQgKGluY3JlbWVudGFsKSBzZXF1ZW5jZSB0byBhc3NpZ24gd2hlbiBnZW5lcmF0aW5nIGNvbXBsZXRhYmxlIGNvbW1hbmRzXG4gICAqL1xuICBwdWJsaWMgbmV4dFNlcXMgPSB7XG4gICAgdGltZXI6IDEsXG4gICAgYWN0aXZpdHk6IDEsXG4gICAgY2hpbGRXb3JrZmxvdzogMSxcbiAgICBzaWduYWxXb3JrZmxvdzogMSxcbiAgICBjYW5jZWxXb3JrZmxvdzogMSxcbiAgICBjb25kaXRpb246IDEsXG4gICAgLy8gVXNlZCBpbnRlcm5hbGx5IHRvIGtlZXAgdHJhY2sgb2YgYWN0aXZlIHN0YWNrIHRyYWNlc1xuICAgIHN0YWNrOiAxLFxuICB9O1xuXG4gIC8qKlxuICAgKiBUaGlzIGlzIHNldCBldmVyeSB0aW1lIHRoZSB3b3JrZmxvdyBleGVjdXRlcyBhbiBhY3RpdmF0aW9uXG4gICAqL1xuICBub3c6IG51bWJlcjtcblxuICAvKipcbiAgICogUmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IFdvcmtmbG93LCBpbml0aWFsaXplZCB3aGVuIGEgV29ya2Zsb3cgaXMgc3RhcnRlZFxuICAgKi9cbiAgcHVibGljIHdvcmtmbG93PzogV29ya2Zsb3c7XG5cbiAgLyoqXG4gICAqIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50IFdvcmtmbG93XG4gICAqL1xuICBwdWJsaWMgaW5mbzogV29ya2Zsb3dJbmZvO1xuXG4gIC8qKlxuICAgKiBBIGRldGVybWluaXN0aWMgUk5HLCB1c2VkIGJ5IHRoZSBpc29sYXRlJ3Mgb3ZlcnJpZGRlbiBNYXRoLnJhbmRvbVxuICAgKi9cbiAgcHVibGljIHJhbmRvbTogUk5HO1xuXG4gIHB1YmxpYyBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyID0gZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXI7XG4gIHB1YmxpYyBmYWlsdXJlQ29udmVydGVyOiBGYWlsdXJlQ29udmVydGVyID0gZGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXI7XG5cbiAgLyoqXG4gICAqIFBhdGNoZXMgd2Uga25vdyB0aGUgc3RhdHVzIG9mIGZvciB0aGlzIHdvcmtmbG93LCBhcyBpbiB7QGxpbmsgcGF0Y2hlZH1cbiAgICovXG4gIHByaXZhdGUgcmVhZG9ubHkga25vd25QcmVzZW50UGF0Y2hlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIC8qKlxuICAgKiBQYXRjaGVzIHdlIHNlbnQgdG8gY29yZSB7QGxpbmsgcGF0Y2hlZH1cbiAgICovXG4gIHByaXZhdGUgcmVhZG9ubHkgc2VudFBhdGNoZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBwcml2YXRlIHJlYWRvbmx5IGtub3duRmxhZ3MgPSBuZXcgU2V0PG51bWJlcj4oKTtcblxuICAvKipcbiAgICogQnVmZmVyZWQgc2luayBjYWxscyBwZXIgYWN0aXZhdGlvblxuICAgKi9cbiAgc2lua0NhbGxzID0gQXJyYXk8U2lua0NhbGw+KCk7XG5cbiAgLyoqXG4gICAqIEEgbmFub3NlY29uZCByZXNvbHV0aW9uIHRpbWUgZnVuY3Rpb24sIGV4dGVybmFsbHkgaW5qZWN0ZWRcbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBnZXRUaW1lT2ZEYXk6ICgpID0+IGJpZ2ludDtcblxuICBwdWJsaWMgcmVhZG9ubHkgcmVnaXN0ZXJlZEFjdGl2aXR5TmFtZXM6IFNldDxzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKHtcbiAgICBpbmZvLFxuICAgIG5vdyxcbiAgICBzaG93U3RhY2tUcmFjZVNvdXJjZXMsXG4gICAgc291cmNlTWFwLFxuICAgIGdldFRpbWVPZkRheSxcbiAgICByYW5kb21uZXNzU2VlZCxcbiAgICBwYXRjaGVzLFxuICAgIHJlZ2lzdGVyZWRBY3Rpdml0eU5hbWVzLFxuICB9OiBXb3JrZmxvd0NyZWF0ZU9wdGlvbnNJbnRlcm5hbCkge1xuICAgIHRoaXMuZ2V0VGltZU9mRGF5ID0gZ2V0VGltZU9mRGF5O1xuICAgIHRoaXMuaW5mbyA9IGluZm87XG4gICAgdGhpcy5ub3cgPSBub3c7XG4gICAgdGhpcy5zaG93U3RhY2tUcmFjZVNvdXJjZXMgPSBzaG93U3RhY2tUcmFjZVNvdXJjZXM7XG4gICAgdGhpcy5zb3VyY2VNYXAgPSBzb3VyY2VNYXA7XG4gICAgdGhpcy5yYW5kb20gPSBhbGVhKHJhbmRvbW5lc3NTZWVkKTtcbiAgICB0aGlzLnJlZ2lzdGVyZWRBY3Rpdml0eU5hbWVzID0gcmVnaXN0ZXJlZEFjdGl2aXR5TmFtZXM7XG5cbiAgICBpZiAoaW5mby51bnNhZmUuaXNSZXBsYXlpbmcpIHtcbiAgICAgIGZvciAoY29uc3QgcGF0Y2hJZCBvZiBwYXRjaGVzKSB7XG4gICAgICAgIHRoaXMubm90aWZ5SGFzUGF0Y2goeyBwYXRjaElkIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG11dGF0ZVdvcmtmbG93SW5mbyhmbjogKGluZm86IFdvcmtmbG93SW5mbykgPT4gV29ya2Zsb3dJbmZvKTogdm9pZCB7XG4gICAgdGhpcy5pbmZvID0gZm4odGhpcy5pbmZvKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRTdGFja1RyYWNlcygpOiBTdGFja1tdIHtcbiAgICBjb25zdCB7IGNoaWxkVG9QYXJlbnQsIHByb21pc2VUb1N0YWNrIH0gPSB0aGlzLnByb21pc2VTdGFja1N0b3JlO1xuICAgIGNvbnN0IGludGVybmFsTm9kZXMgPSBbLi4uY2hpbGRUb1BhcmVudC52YWx1ZXMoKV0ucmVkdWNlKChhY2MsIGN1cnIpID0+IHtcbiAgICAgIGZvciAoY29uc3QgcCBvZiBjdXJyKSB7XG4gICAgICAgIGFjYy5hZGQocCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYWNjO1xuICAgIH0sIG5ldyBTZXQoKSk7XG4gICAgY29uc3Qgc3RhY2tzID0gbmV3IE1hcDxzdHJpbmcsIFN0YWNrPigpO1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRUb1BhcmVudC5rZXlzKCkpIHtcbiAgICAgIGlmICghaW50ZXJuYWxOb2Rlcy5oYXMoY2hpbGQpKSB7XG4gICAgICAgIGNvbnN0IHN0YWNrID0gcHJvbWlzZVRvU3RhY2suZ2V0KGNoaWxkKTtcbiAgICAgICAgaWYgKCFzdGFjayB8fCAhc3RhY2suZm9ybWF0dGVkKSBjb250aW51ZTtcbiAgICAgICAgc3RhY2tzLnNldChzdGFjay5mb3JtYXR0ZWQsIHN0YWNrKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gTm90IDEwMCUgc3VyZSB3aGVyZSB0aGlzIGNvbWVzIGZyb20sIGp1c3QgZmlsdGVyIGl0IG91dFxuICAgIHN0YWNrcy5kZWxldGUoJyAgICBhdCBQcm9taXNlLnRoZW4gKDxhbm9ueW1vdXM+KScpO1xuICAgIHN0YWNrcy5kZWxldGUoJyAgICBhdCBQcm9taXNlLnRoZW4gKDxhbm9ueW1vdXM+KVxcbicpO1xuICAgIHJldHVybiBbLi4uc3RhY2tzXS5tYXAoKFtfLCBzdGFja10pID0+IHN0YWNrKTtcbiAgfVxuXG4gIGdldEFuZFJlc2V0U2lua0NhbGxzKCk6IFNpbmtDYWxsW10ge1xuICAgIGNvbnN0IHsgc2lua0NhbGxzIH0gPSB0aGlzO1xuICAgIHRoaXMuc2lua0NhbGxzID0gW107XG4gICAgcmV0dXJuIHNpbmtDYWxscztcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWZmZXIgYSBXb3JrZmxvdyBjb21tYW5kIHRvIGJlIGNvbGxlY3RlZCBhdCB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IGFjdGl2YXRpb24uXG4gICAqXG4gICAqIFByZXZlbnRzIGNvbW1hbmRzIGZyb20gYmVpbmcgYWRkZWQgYWZ0ZXIgV29ya2Zsb3cgY29tcGxldGlvbi5cbiAgICovXG4gIHB1c2hDb21tYW5kKGNtZDogY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5JV29ya2Zsb3dDb21tYW5kLCBjb21wbGV0ZSA9IGZhbHNlKTogdm9pZCB7XG4gICAgLy8gT25seSBxdWVyeSByZXNwb25zZXMgbWF5IGJlIHNlbnQgYWZ0ZXIgY29tcGxldGlvblxuICAgIGlmICh0aGlzLmNvbXBsZXRlZCAmJiAhY21kLnJlc3BvbmRUb1F1ZXJ5KSByZXR1cm47XG4gICAgdGhpcy5jb21tYW5kcy5wdXNoKGNtZCk7XG4gICAgaWYgKGNvbXBsZXRlKSB7XG4gICAgICB0aGlzLmNvbXBsZXRlZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgY29uY2x1ZGVBY3RpdmF0aW9uKCk6IEFjdGl2YXRpb25Db21wbGV0aW9uIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29tbWFuZHM6IHRoaXMuY29tbWFuZHMuc3BsaWNlKDApLFxuICAgICAgdXNlZEludGVybmFsRmxhZ3M6IFsuLi50aGlzLmtub3duRmxhZ3NdLFxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc3RhcnRXb3JrZmxvd05leHRIYW5kbGVyKHsgYXJncyB9OiBXb3JrZmxvd0V4ZWN1dGVJbnB1dCk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgeyB3b3JrZmxvdyB9ID0gdGhpcztcbiAgICBpZiAod29ya2Zsb3cgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdXb3JrZmxvdyB1bmluaXRpYWxpemVkJyk7XG4gICAgfVxuICAgIGxldCBwcm9taXNlOiBQcm9taXNlPGFueT47XG4gICAgdHJ5IHtcbiAgICAgIHByb21pc2UgPSB3b3JrZmxvdyguLi5hcmdzKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgLy8gUXVlcmllcyBtdXN0IGJlIGhhbmRsZWQgZXZlbiBpZiB0aGVyZSB3YXMgYW4gZXhjZXB0aW9uIHdoZW4gaW52b2tpbmcgdGhlIFdvcmtmbG93IGZ1bmN0aW9uLlxuICAgICAgdGhpcy53b3JrZmxvd0Z1bmN0aW9uV2FzQ2FsbGVkID0gdHJ1ZTtcbiAgICAgIC8vIEVtcHR5IHRoZSBidWZmZXJcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMuYnVmZmVyZWRRdWVyaWVzLnNwbGljZSgwKTtcbiAgICAgIGZvciAoY29uc3QgYWN0aXZhdGlvbiBvZiBidWZmZXIpIHtcbiAgICAgICAgdGhpcy5xdWVyeVdvcmtmbG93KGFjdGl2YXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXdhaXQgcHJvbWlzZTtcbiAgfVxuXG4gIHB1YmxpYyBzdGFydFdvcmtmbG93KGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JU3RhcnRXb3JrZmxvdyk6IHZvaWQge1xuICAgIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKHRoaXMuaW50ZXJjZXB0b3JzLmluYm91bmQsICdleGVjdXRlJywgdGhpcy5zdGFydFdvcmtmbG93TmV4dEhhbmRsZXIuYmluZCh0aGlzKSk7XG5cbiAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgIGV4ZWN1dGVXaXRoTGlmZWN5Y2xlTG9nZ2luZygoKSA9PlxuICAgICAgICBleGVjdXRlKHtcbiAgICAgICAgICBoZWFkZXJzOiBhY3RpdmF0aW9uLmhlYWRlcnMgPz8ge30sXG4gICAgICAgICAgYXJnczogYXJyYXlGcm9tUGF5bG9hZHModGhpcy5wYXlsb2FkQ29udmVydGVyLCBhY3RpdmF0aW9uLmFyZ3VtZW50cyksXG4gICAgICAgIH0pXG4gICAgICApLnRoZW4odGhpcy5jb21wbGV0ZVdvcmtmbG93LmJpbmQodGhpcyksIHRoaXMuaGFuZGxlV29ya2Zsb3dGYWlsdXJlLmJpbmQodGhpcykpXG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBjYW5jZWxXb3JrZmxvdyhfYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklDYW5jZWxXb3JrZmxvdyk6IHZvaWQge1xuICAgIHRoaXMuY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICB0aGlzLnJvb3RTY29wZS5jYW5jZWwoKTtcbiAgfVxuXG4gIHB1YmxpYyBmaXJlVGltZXIoYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklGaXJlVGltZXIpOiB2b2lkIHtcbiAgICAvLyBUaW1lcnMgYXJlIGEgc3BlY2lhbCBjYXNlIHdoZXJlIHRoZWlyIGNvbXBsZXRpb24gbWlnaHQgbm90IGJlIGluIFdvcmtmbG93IHN0YXRlLFxuICAgIC8vIHRoaXMgaXMgZHVlIHRvIGltbWVkaWF0ZSB0aW1lciBjYW5jZWxsYXRpb24gdGhhdCBkb2Vzbid0IGdvIHdhaXQgZm9yIENvcmUuXG4gICAgY29uc3QgY29tcGxldGlvbiA9IHRoaXMubWF5YmVDb25zdW1lQ29tcGxldGlvbigndGltZXInLCBnZXRTZXEoYWN0aXZhdGlvbikpO1xuICAgIGNvbXBsZXRpb24/LnJlc29sdmUodW5kZWZpbmVkKTtcbiAgfVxuXG4gIHB1YmxpYyByZXNvbHZlQWN0aXZpdHkoYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklSZXNvbHZlQWN0aXZpdHkpOiB2b2lkIHtcbiAgICBpZiAoIWFjdGl2YXRpb24ucmVzdWx0KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgUmVzb2x2ZUFjdGl2aXR5IGFjdGl2YXRpb24gd2l0aCBubyByZXN1bHQnKTtcbiAgICB9XG4gICAgY29uc3QgeyByZXNvbHZlLCByZWplY3QgfSA9IHRoaXMuY29uc3VtZUNvbXBsZXRpb24oJ2FjdGl2aXR5JywgZ2V0U2VxKGFjdGl2YXRpb24pKTtcbiAgICBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuY29tcGxldGVkKSB7XG4gICAgICBjb25zdCBjb21wbGV0ZWQgPSBhY3RpdmF0aW9uLnJlc3VsdC5jb21wbGV0ZWQ7XG4gICAgICBjb25zdCByZXN1bHQgPSBjb21wbGV0ZWQucmVzdWx0ID8gdGhpcy5wYXlsb2FkQ29udmVydGVyLmZyb21QYXlsb2FkKGNvbXBsZXRlZC5yZXN1bHQpIDogdW5kZWZpbmVkO1xuICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuZmFpbGVkKSB7XG4gICAgICBjb25zdCB7IGZhaWx1cmUgfSA9IGFjdGl2YXRpb24ucmVzdWx0LmZhaWxlZDtcbiAgICAgIGNvbnN0IGVyciA9IGZhaWx1cmUgPyB0aGlzLmZhaWx1cmVUb0Vycm9yKGZhaWx1cmUpIDogdW5kZWZpbmVkO1xuICAgICAgcmVqZWN0KGVycik7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5jYW5jZWxsZWQpIHtcbiAgICAgIGNvbnN0IHsgZmFpbHVyZSB9ID0gYWN0aXZhdGlvbi5yZXN1bHQuY2FuY2VsbGVkO1xuICAgICAgY29uc3QgZXJyID0gZmFpbHVyZSA/IHRoaXMuZmFpbHVyZVRvRXJyb3IoZmFpbHVyZSkgOiB1bmRlZmluZWQ7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmJhY2tvZmYpIHtcbiAgICAgIHJlamVjdChuZXcgTG9jYWxBY3Rpdml0eURvQmFja29mZihhY3RpdmF0aW9uLnJlc3VsdC5iYWNrb2ZmKSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uU3RhcnQoXG4gICAgYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklSZXNvbHZlQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvblN0YXJ0XG4gICk6IHZvaWQge1xuICAgIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0IH0gPSB0aGlzLmNvbnN1bWVDb21wbGV0aW9uKCdjaGlsZFdvcmtmbG93U3RhcnQnLCBnZXRTZXEoYWN0aXZhdGlvbikpO1xuICAgIGlmIChhY3RpdmF0aW9uLnN1Y2NlZWRlZCkge1xuICAgICAgcmVzb2x2ZShhY3RpdmF0aW9uLnN1Y2NlZWRlZC5ydW5JZCk7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLmZhaWxlZCkge1xuICAgICAgaWYgKFxuICAgICAgICBhY3RpdmF0aW9uLmZhaWxlZC5jYXVzZSAhPT1cbiAgICAgICAgU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2UuU1RBUlRfQ0hJTERfV09SS0ZMT1dfRVhFQ1VUSU9OX0ZBSUxFRF9DQVVTRV9XT1JLRkxPV19BTFJFQURZX0VYSVNUU1xuICAgICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcignR290IHVua25vd24gU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2UnKTtcbiAgICAgIH1cbiAgICAgIGlmICghKGFjdGl2YXRpb24uc2VxICYmIGFjdGl2YXRpb24uZmFpbGVkLndvcmtmbG93SWQgJiYgYWN0aXZhdGlvbi5mYWlsZWQud29ya2Zsb3dUeXBlKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGF0dHJpYnV0ZXMgaW4gYWN0aXZhdGlvbiBqb2InKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChcbiAgICAgICAgbmV3IFdvcmtmbG93RXhlY3V0aW9uQWxyZWFkeVN0YXJ0ZWRFcnJvcihcbiAgICAgICAgICAnV29ya2Zsb3cgZXhlY3V0aW9uIGFscmVhZHkgc3RhcnRlZCcsXG4gICAgICAgICAgYWN0aXZhdGlvbi5mYWlsZWQud29ya2Zsb3dJZCxcbiAgICAgICAgICBhY3RpdmF0aW9uLmZhaWxlZC53b3JrZmxvd1R5cGVcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24uY2FuY2VsbGVkKSB7XG4gICAgICBpZiAoIWFjdGl2YXRpb24uY2FuY2VsbGVkLmZhaWx1cmUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IG5vIGZhaWx1cmUgaW4gY2FuY2VsbGVkIHZhcmlhbnQnKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdCh0aGlzLmZhaWx1cmVUb0Vycm9yKGFjdGl2YXRpb24uY2FuY2VsbGVkLmZhaWx1cmUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IFJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uU3RhcnQgd2l0aCBubyBzdGF0dXMnKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVzb2x2ZUNoaWxkV29ya2Zsb3dFeGVjdXRpb24oYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklSZXNvbHZlQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvbik6IHZvaWQge1xuICAgIGlmICghYWN0aXZhdGlvbi5yZXN1bHQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBSZXNvbHZlQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvbiBhY3RpdmF0aW9uIHdpdGggbm8gcmVzdWx0Jyk7XG4gICAgfVxuICAgIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0IH0gPSB0aGlzLmNvbnN1bWVDb21wbGV0aW9uKCdjaGlsZFdvcmtmbG93Q29tcGxldGUnLCBnZXRTZXEoYWN0aXZhdGlvbikpO1xuICAgIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5jb21wbGV0ZWQpIHtcbiAgICAgIGNvbnN0IGNvbXBsZXRlZCA9IGFjdGl2YXRpb24ucmVzdWx0LmNvbXBsZXRlZDtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBsZXRlZC5yZXN1bHQgPyB0aGlzLnBheWxvYWRDb252ZXJ0ZXIuZnJvbVBheWxvYWQoY29tcGxldGVkLnJlc3VsdCkgOiB1bmRlZmluZWQ7XG4gICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5mYWlsZWQpIHtcbiAgICAgIGNvbnN0IHsgZmFpbHVyZSB9ID0gYWN0aXZhdGlvbi5yZXN1bHQuZmFpbGVkO1xuICAgICAgaWYgKGZhaWx1cmUgPT09IHVuZGVmaW5lZCB8fCBmYWlsdXJlID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBmYWlsZWQgcmVzdWx0IHdpdGggbm8gZmFpbHVyZSBhdHRyaWJ1dGUnKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdCh0aGlzLmZhaWx1cmVUb0Vycm9yKGZhaWx1cmUpKTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmNhbmNlbGxlZCkge1xuICAgICAgY29uc3QgeyBmYWlsdXJlIH0gPSBhY3RpdmF0aW9uLnJlc3VsdC5jYW5jZWxsZWQ7XG4gICAgICBpZiAoZmFpbHVyZSA9PT0gdW5kZWZpbmVkIHx8IGZhaWx1cmUgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IGNhbmNlbGxlZCByZXN1bHQgd2l0aCBubyBmYWlsdXJlIGF0dHJpYnV0ZScpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KHRoaXMuZmFpbHVyZVRvRXJyb3IoZmFpbHVyZSkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEludGVudGlvbmFsbHkgbm9uLWFzeW5jIGZ1bmN0aW9uIHNvIHRoaXMgaGFuZGxlciBkb2Vzbid0IHNob3cgdXAgaW4gdGhlIHN0YWNrIHRyYWNlXG4gIHByb3RlY3RlZCBxdWVyeVdvcmtmbG93TmV4dEhhbmRsZXIoeyBxdWVyeU5hbWUsIGFyZ3MgfTogUXVlcnlJbnB1dCk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IGZuID0gdGhpcy5xdWVyeUhhbmRsZXJzLmdldChxdWVyeU5hbWUpPy5oYW5kbGVyO1xuICAgIGlmIChmbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBrbm93blF1ZXJ5VHlwZXMgPSBbLi4udGhpcy5xdWVyeUhhbmRsZXJzLmtleXMoKV0uam9pbignICcpO1xuICAgICAgLy8gRmFpbCB0aGUgcXVlcnlcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChcbiAgICAgICAgbmV3IFJlZmVyZW5jZUVycm9yKFxuICAgICAgICAgIGBXb3JrZmxvdyBkaWQgbm90IHJlZ2lzdGVyIGEgaGFuZGxlciBmb3IgJHtxdWVyeU5hbWV9LiBSZWdpc3RlcmVkIHF1ZXJpZXM6IFske2tub3duUXVlcnlUeXBlc31dYFxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmV0ID0gZm4oLi4uYXJncyk7XG4gICAgICBpZiAocmV0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IERldGVybWluaXNtVmlvbGF0aW9uRXJyb3IoJ1F1ZXJ5IGhhbmRsZXJzIHNob3VsZCBub3QgcmV0dXJuIGEgUHJvbWlzZScpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmV0KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBxdWVyeVdvcmtmbG93KGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JUXVlcnlXb3JrZmxvdyk6IHZvaWQge1xuICAgIGlmICghdGhpcy53b3JrZmxvd0Z1bmN0aW9uV2FzQ2FsbGVkKSB7XG4gICAgICB0aGlzLmJ1ZmZlcmVkUXVlcmllcy5wdXNoKGFjdGl2YXRpb24pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgcXVlcnlUeXBlLCBxdWVyeUlkLCBoZWFkZXJzIH0gPSBhY3RpdmF0aW9uO1xuICAgIGlmICghKHF1ZXJ5VHlwZSAmJiBxdWVyeUlkKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBxdWVyeSBhY3RpdmF0aW9uIGF0dHJpYnV0ZXMnKTtcbiAgICB9XG5cbiAgICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICAgIHRoaXMuaW50ZXJjZXB0b3JzLmluYm91bmQsXG4gICAgICAnaGFuZGxlUXVlcnknLFxuICAgICAgdGhpcy5xdWVyeVdvcmtmbG93TmV4dEhhbmRsZXIuYmluZCh0aGlzKVxuICAgICk7XG4gICAgZXhlY3V0ZSh7XG4gICAgICBxdWVyeU5hbWU6IHF1ZXJ5VHlwZSxcbiAgICAgIGFyZ3M6IGFycmF5RnJvbVBheWxvYWRzKHRoaXMucGF5bG9hZENvbnZlcnRlciwgYWN0aXZhdGlvbi5hcmd1bWVudHMpLFxuICAgICAgcXVlcnlJZCxcbiAgICAgIGhlYWRlcnM6IGhlYWRlcnMgPz8ge30sXG4gICAgfSkudGhlbihcbiAgICAgIChyZXN1bHQpID0+IHRoaXMuY29tcGxldGVRdWVyeShxdWVyeUlkLCByZXN1bHQpLFxuICAgICAgKHJlYXNvbikgPT4gdGhpcy5mYWlsUXVlcnkocXVlcnlJZCwgcmVhc29uKVxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgZG9VcGRhdGUoYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklEb1VwZGF0ZSk6IHZvaWQge1xuICAgIGNvbnN0IHsgaWQ6IHVwZGF0ZUlkLCBwcm90b2NvbEluc3RhbmNlSWQsIG5hbWUsIGhlYWRlcnMsIHJ1blZhbGlkYXRvciB9ID0gYWN0aXZhdGlvbjtcbiAgICBpZiAoIXVwZGF0ZUlkKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGFjdGl2YXRpb24gdXBkYXRlIGlkJyk7XG4gICAgfVxuICAgIGlmICghbmFtZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBhY3RpdmF0aW9uIHVwZGF0ZSBuYW1lJyk7XG4gICAgfVxuICAgIGlmICghcHJvdG9jb2xJbnN0YW5jZUlkKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGFjdGl2YXRpb24gdXBkYXRlIHByb3RvY29sSW5zdGFuY2VJZCcpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMudXBkYXRlSGFuZGxlcnMuaGFzKG5hbWUpKSB7XG4gICAgICB0aGlzLmJ1ZmZlcmVkVXBkYXRlcy5wdXNoKGFjdGl2YXRpb24pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG1ha2VJbnB1dCA9ICgpOiBVcGRhdGVJbnB1dCA9PiAoe1xuICAgICAgdXBkYXRlSWQsXG4gICAgICBhcmdzOiBhcnJheUZyb21QYXlsb2Fkcyh0aGlzLnBheWxvYWRDb252ZXJ0ZXIsIGFjdGl2YXRpb24uaW5wdXQpLFxuICAgICAgbmFtZSxcbiAgICAgIGhlYWRlcnM6IGhlYWRlcnMgPz8ge30sXG4gICAgfSk7XG5cbiAgICAvLyBUaGUgaW1wbGVtZW50YXRpb24gYmVsb3cgaXMgcmVzcG9uc2libGUgZm9yIHVwaG9sZGluZywgYW5kIGNvbnN0cmFpbmVkXG4gICAgLy8gYnksIHRoZSBmb2xsb3dpbmcgY29udHJhY3Q6XG4gICAgLy9cbiAgICAvLyAxLiBJZiBubyB2YWxpZGF0b3IgaXMgcHJlc2VudCB0aGVuIHZhbGlkYXRpb24gaW50ZXJjZXB0b3JzIHdpbGwgbm90IGJlIHJ1bi5cbiAgICAvL1xuICAgIC8vIDIuIER1cmluZyB2YWxpZGF0aW9uLCBhbnkgZXJyb3IgbXVzdCBmYWlsIHRoZSBVcGRhdGU7IGR1cmluZyB0aGUgVXBkYXRlXG4gICAgLy8gICAgaXRzZWxmLCBUZW1wb3JhbCBlcnJvcnMgZmFpbCB0aGUgVXBkYXRlIHdoZXJlYXMgb3RoZXIgZXJyb3JzIGZhaWwgdGhlXG4gICAgLy8gICAgYWN0aXZhdGlvbi5cbiAgICAvL1xuICAgIC8vIDMuIFRoZSBoYW5kbGVyIG11c3Qgbm90IHNlZSBhbnkgbXV0YXRpb25zIG9mIHRoZSBhcmd1bWVudHMgbWFkZSBieSB0aGVcbiAgICAvLyAgICB2YWxpZGF0b3IuXG4gICAgLy9cbiAgICAvLyA0LiBBbnkgZXJyb3Igd2hlbiBkZWNvZGluZy9kZXNlcmlhbGl6aW5nIGlucHV0IG11c3QgYmUgY2F1Z2h0IGFuZCByZXN1bHRcbiAgICAvLyAgICBpbiByZWplY3Rpb24gb2YgdGhlIFVwZGF0ZSBiZWZvcmUgaXQgaXMgYWNjZXB0ZWQsIGV2ZW4gaWYgdGhlcmUgaXMgbm9cbiAgICAvLyAgICB2YWxpZGF0b3IuXG4gICAgLy9cbiAgICAvLyA1LiBUaGUgaW5pdGlhbCBzeW5jaHJvbm91cyBwb3J0aW9uIG9mIHRoZSAoYXN5bmMpIFVwZGF0ZSBoYW5kbGVyIHNob3VsZFxuICAgIC8vICAgIGJlIGV4ZWN1dGVkIGFmdGVyIHRoZSAoc3luYykgdmFsaWRhdG9yIGNvbXBsZXRlcyBzdWNoIHRoYXQgdGhlcmUgaXNcbiAgICAvLyAgICBtaW5pbWFsIG9wcG9ydHVuaXR5IGZvciBhIGRpZmZlcmVudCBjb25jdXJyZW50IHRhc2sgdG8gYmUgc2NoZWR1bGVkXG4gICAgLy8gICAgYmV0d2VlbiB0aGVtLlxuICAgIC8vXG4gICAgLy8gNi4gVGhlIHN0YWNrIHRyYWNlIHZpZXcgcHJvdmlkZWQgaW4gdGhlIFRlbXBvcmFsIFVJIG11c3Qgbm90IGJlIHBvbGx1dGVkXG4gICAgLy8gICAgYnkgcHJvbWlzZXMgdGhhdCBkbyBub3QgZGVyaXZlIGZyb20gdXNlciBjb2RlLiBUaGlzIGltcGxpZXMgdGhhdFxuICAgIC8vICAgIGFzeW5jL2F3YWl0IHN5bnRheCBtYXkgbm90IGJlIHVzZWQuXG4gICAgLy9cbiAgICAvLyBOb3RlIHRoYXQgdGhlcmUgaXMgYSBkZWxpYmVyYXRlbHkgdW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uIGJlbG93LlxuICAgIC8vIFRoZXNlIGFyZSBjYXVnaHQgZWxzZXdoZXJlIGFuZCBmYWlsIHRoZSBjb3JyZXNwb25kaW5nIGFjdGl2YXRpb24uXG4gICAgbGV0IGlucHV0OiBVcGRhdGVJbnB1dDtcbiAgICB0cnkge1xuICAgICAgaWYgKHJ1blZhbGlkYXRvciAmJiB0aGlzLnVwZGF0ZUhhbmRsZXJzLmdldChuYW1lKT8udmFsaWRhdG9yKSB7XG4gICAgICAgIGNvbnN0IHZhbGlkYXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICAgICAgICB0aGlzLmludGVyY2VwdG9ycy5pbmJvdW5kLFxuICAgICAgICAgICd2YWxpZGF0ZVVwZGF0ZScsXG4gICAgICAgICAgdGhpcy52YWxpZGF0ZVVwZGF0ZU5leHRIYW5kbGVyLmJpbmQodGhpcylcbiAgICAgICAgKTtcbiAgICAgICAgdmFsaWRhdGUobWFrZUlucHV0KCkpO1xuICAgICAgfVxuICAgICAgaW5wdXQgPSBtYWtlSW5wdXQoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5yZWplY3RVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkLCBlcnJvcik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKHRoaXMuaW50ZXJjZXB0b3JzLmluYm91bmQsICdoYW5kbGVVcGRhdGUnLCB0aGlzLnVwZGF0ZU5leHRIYW5kbGVyLmJpbmQodGhpcykpO1xuICAgIHRoaXMuYWNjZXB0VXBkYXRlKHByb3RvY29sSW5zdGFuY2VJZCk7XG4gICAgdW50cmFja1Byb21pc2UoXG4gICAgICBleGVjdXRlKGlucHV0KVxuICAgICAgICAudGhlbigocmVzdWx0KSA9PiB0aGlzLmNvbXBsZXRlVXBkYXRlKHByb3RvY29sSW5zdGFuY2VJZCwgcmVzdWx0KSlcbiAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFRlbXBvcmFsRmFpbHVyZSkge1xuICAgICAgICAgICAgdGhpcy5yZWplY3RVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkLCBlcnJvcik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIHVwZGF0ZU5leHRIYW5kbGVyKHsgbmFtZSwgYXJncyB9OiBVcGRhdGVJbnB1dCk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy51cGRhdGVIYW5kbGVycy5nZXQobmFtZSk7XG4gICAgaWYgKCFlbnRyeSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBJbGxlZ2FsU3RhdGVFcnJvcihgTm8gcmVnaXN0ZXJlZCB1cGRhdGUgaGFuZGxlciBmb3IgdXBkYXRlOiAke25hbWV9YCkpO1xuICAgIH1cbiAgICBjb25zdCB7IGhhbmRsZXIgfSA9IGVudHJ5O1xuICAgIHJldHVybiBhd2FpdCBoYW5kbGVyKC4uLmFyZ3MpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHZhbGlkYXRlVXBkYXRlTmV4dEhhbmRsZXIoeyBuYW1lLCBhcmdzIH06IFVwZGF0ZUlucHV0KTogdm9pZCB7XG4gICAgY29uc3QgeyB2YWxpZGF0b3IgfSA9IHRoaXMudXBkYXRlSGFuZGxlcnMuZ2V0KG5hbWUpID8/IHt9O1xuICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgIHZhbGlkYXRvciguLi5hcmdzKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZGlzcGF0Y2hCdWZmZXJlZFVwZGF0ZXMoKTogdm9pZCB7XG4gICAgY29uc3QgYnVmZmVyZWRVcGRhdGVzID0gdGhpcy5idWZmZXJlZFVwZGF0ZXM7XG4gICAgd2hpbGUgKGJ1ZmZlcmVkVXBkYXRlcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGZvdW5kSW5kZXggPSBidWZmZXJlZFVwZGF0ZXMuZmluZEluZGV4KCh1cGRhdGUpID0+IHRoaXMudXBkYXRlSGFuZGxlcnMuaGFzKHVwZGF0ZS5uYW1lIGFzIHN0cmluZykpO1xuICAgICAgaWYgKGZvdW5kSW5kZXggPT09IC0xKSB7XG4gICAgICAgIC8vIE5vIGJ1ZmZlcmVkIFVwZGF0ZXMgaGF2ZSBhIGhhbmRsZXIgeWV0LlxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNvbnN0IFt1cGRhdGVdID0gYnVmZmVyZWRVcGRhdGVzLnNwbGljZShmb3VuZEluZGV4LCAxKTtcbiAgICAgIHRoaXMuZG9VcGRhdGUodXBkYXRlKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVqZWN0QnVmZmVyZWRVcGRhdGVzKCk6IHZvaWQge1xuICAgIHdoaWxlICh0aGlzLmJ1ZmZlcmVkVXBkYXRlcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHVwZGF0ZSA9IHRoaXMuYnVmZmVyZWRVcGRhdGVzLnNoaWZ0KCk7XG4gICAgICBpZiAodXBkYXRlKSB7XG4gICAgICAgIHRoaXMucmVqZWN0VXBkYXRlKFxuICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb24gKi9cbiAgICAgICAgICB1cGRhdGUucHJvdG9jb2xJbnN0YW5jZUlkISxcbiAgICAgICAgICBBcHBsaWNhdGlvbkZhaWx1cmUubm9uUmV0cnlhYmxlKGBObyByZWdpc3RlcmVkIGhhbmRsZXIgZm9yIHVwZGF0ZTogJHt1cGRhdGUubmFtZX1gKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzaWduYWxXb3JrZmxvd05leHRIYW5kbGVyKHsgc2lnbmFsTmFtZSwgYXJncyB9OiBTaWduYWxJbnB1dCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGZuID0gdGhpcy5zaWduYWxIYW5kbGVycy5nZXQoc2lnbmFsTmFtZSk/LmhhbmRsZXI7XG4gICAgaWYgKGZuKSB7XG4gICAgICByZXR1cm4gYXdhaXQgZm4oLi4uYXJncyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRTaWduYWxIYW5kbGVyKSB7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5kZWZhdWx0U2lnbmFsSGFuZGxlcihzaWduYWxOYW1lLCAuLi5hcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKGBObyByZWdpc3RlcmVkIHNpZ25hbCBoYW5kbGVyIGZvciBzaWduYWw6ICR7c2lnbmFsTmFtZX1gKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc2lnbmFsV29ya2Zsb3coYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklTaWduYWxXb3JrZmxvdyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2lnbmFsTmFtZSwgaGVhZGVycyB9ID0gYWN0aXZhdGlvbjtcbiAgICBpZiAoIXNpZ25hbE5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYWN0aXZhdGlvbiBzaWduYWxOYW1lJyk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnNpZ25hbEhhbmRsZXJzLmhhcyhzaWduYWxOYW1lKSAmJiAhdGhpcy5kZWZhdWx0U2lnbmFsSGFuZGxlcikge1xuICAgICAgdGhpcy5idWZmZXJlZFNpZ25hbHMucHVzaChhY3RpdmF0aW9uKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICAgIHRoaXMuaW50ZXJjZXB0b3JzLmluYm91bmQsXG4gICAgICAnaGFuZGxlU2lnbmFsJyxcbiAgICAgIHRoaXMuc2lnbmFsV29ya2Zsb3dOZXh0SGFuZGxlci5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICBleGVjdXRlKHtcbiAgICAgIGFyZ3M6IGFycmF5RnJvbVBheWxvYWRzKHRoaXMucGF5bG9hZENvbnZlcnRlciwgYWN0aXZhdGlvbi5pbnB1dCksXG4gICAgICBzaWduYWxOYW1lLFxuICAgICAgaGVhZGVyczogaGVhZGVycyA/PyB7fSxcbiAgICB9KS5jYXRjaCh0aGlzLmhhbmRsZVdvcmtmbG93RmFpbHVyZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIHB1YmxpYyBkaXNwYXRjaEJ1ZmZlcmVkU2lnbmFscygpOiB2b2lkIHtcbiAgICBjb25zdCBidWZmZXJlZFNpZ25hbHMgPSB0aGlzLmJ1ZmZlcmVkU2lnbmFscztcbiAgICB3aGlsZSAoYnVmZmVyZWRTaWduYWxzLmxlbmd0aCkge1xuICAgICAgaWYgKHRoaXMuZGVmYXVsdFNpZ25hbEhhbmRsZXIpIHtcbiAgICAgICAgLy8gV2UgaGF2ZSBhIGRlZmF1bHQgc2lnbmFsIGhhbmRsZXIsIHNvIGFsbCBzaWduYWxzIGFyZSBkaXNwYXRjaGFibGVcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgICAgICAgdGhpcy5zaWduYWxXb3JrZmxvdyhidWZmZXJlZFNpZ25hbHMuc2hpZnQoKSEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZm91bmRJbmRleCA9IGJ1ZmZlcmVkU2lnbmFscy5maW5kSW5kZXgoKHNpZ25hbCkgPT4gdGhpcy5zaWduYWxIYW5kbGVycy5oYXMoc2lnbmFsLnNpZ25hbE5hbWUgYXMgc3RyaW5nKSk7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ID09PSAtMSkgYnJlYWs7XG4gICAgICAgIGNvbnN0IFtzaWduYWxdID0gYnVmZmVyZWRTaWduYWxzLnNwbGljZShmb3VuZEluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5zaWduYWxXb3JrZmxvdyhzaWduYWwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZXNvbHZlU2lnbmFsRXh0ZXJuYWxXb3JrZmxvdyhhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVJlc29sdmVTaWduYWxFeHRlcm5hbFdvcmtmbG93KTogdm9pZCB7XG4gICAgY29uc3QgeyByZXNvbHZlLCByZWplY3QgfSA9IHRoaXMuY29uc3VtZUNvbXBsZXRpb24oJ3NpZ25hbFdvcmtmbG93JywgZ2V0U2VxKGFjdGl2YXRpb24pKTtcbiAgICBpZiAoYWN0aXZhdGlvbi5mYWlsdXJlKSB7XG4gICAgICByZWplY3QodGhpcy5mYWlsdXJlVG9FcnJvcihhY3RpdmF0aW9uLmZhaWx1cmUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZXNvbHZlUmVxdWVzdENhbmNlbEV4dGVybmFsV29ya2Zsb3coXG4gICAgYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklSZXNvbHZlUmVxdWVzdENhbmNlbEV4dGVybmFsV29ya2Zsb3dcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgeyByZXNvbHZlLCByZWplY3QgfSA9IHRoaXMuY29uc3VtZUNvbXBsZXRpb24oJ2NhbmNlbFdvcmtmbG93JywgZ2V0U2VxKGFjdGl2YXRpb24pKTtcbiAgICBpZiAoYWN0aXZhdGlvbi5mYWlsdXJlKSB7XG4gICAgICByZWplY3QodGhpcy5mYWlsdXJlVG9FcnJvcihhY3RpdmF0aW9uLmZhaWx1cmUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyB1cGRhdGVSYW5kb21TZWVkKGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JVXBkYXRlUmFuZG9tU2VlZCk6IHZvaWQge1xuICAgIGlmICghYWN0aXZhdGlvbi5yYW5kb21uZXNzU2VlZCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYWN0aXZhdGlvbiB3aXRoIHJhbmRvbW5lc3NTZWVkIGF0dHJpYnV0ZScpO1xuICAgIH1cbiAgICB0aGlzLnJhbmRvbSA9IGFsZWEoYWN0aXZhdGlvbi5yYW5kb21uZXNzU2VlZC50b0J5dGVzKCkpO1xuICB9XG5cbiAgcHVibGljIG5vdGlmeUhhc1BhdGNoKGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JTm90aWZ5SGFzUGF0Y2gpOiB2b2lkIHtcbiAgICBpZiAoIWFjdGl2YXRpb24ucGF0Y2hJZCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTm90aWZ5IGhhcyBwYXRjaCBtaXNzaW5nIHBhdGNoIG5hbWUnKTtcbiAgICB9XG4gICAgdGhpcy5rbm93blByZXNlbnRQYXRjaGVzLmFkZChhY3RpdmF0aW9uLnBhdGNoSWQpO1xuICB9XG5cbiAgcHVibGljIHBhdGNoSW50ZXJuYWwocGF0Y2hJZDogc3RyaW5nLCBkZXByZWNhdGVkOiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMud29ya2Zsb3cgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdQYXRjaGVzIGNhbm5vdCBiZSB1c2VkIGJlZm9yZSBXb3JrZmxvdyBzdGFydHMnKTtcbiAgICB9XG4gICAgY29uc3QgdXNlUGF0Y2ggPSAhdGhpcy5pbmZvLnVuc2FmZS5pc1JlcGxheWluZyB8fCB0aGlzLmtub3duUHJlc2VudFBhdGNoZXMuaGFzKHBhdGNoSWQpO1xuICAgIC8vIEF2b2lkIHNlbmRpbmcgY29tbWFuZHMgZm9yIHBhdGNoZXMgY29yZSBhbHJlYWR5IGtub3dzIGFib3V0LlxuICAgIC8vIFRoaXMgb3B0aW1pemF0aW9uIGVuYWJsZXMgZGV2ZWxvcG1lbnQgb2YgYXV0b21hdGljIHBhdGNoaW5nIHRvb2xzLlxuICAgIGlmICh1c2VQYXRjaCAmJiAhdGhpcy5zZW50UGF0Y2hlcy5oYXMocGF0Y2hJZCkpIHtcbiAgICAgIHRoaXMucHVzaENvbW1hbmQoe1xuICAgICAgICBzZXRQYXRjaE1hcmtlcjogeyBwYXRjaElkLCBkZXByZWNhdGVkIH0sXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2VudFBhdGNoZXMuYWRkKHBhdGNoSWQpO1xuICAgIH1cbiAgICByZXR1cm4gdXNlUGF0Y2g7XG4gIH1cblxuICAvLyBDYWxsZWQgZWFybHkgd2hpbGUgaGFuZGxpbmcgYW4gYWN0aXZhdGlvbiB0byByZWdpc3RlciBrbm93biBmbGFnc1xuICBwdWJsaWMgYWRkS25vd25GbGFncyhmbGFnczogbnVtYmVyW10pOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGZsYWcgb2YgZmxhZ3MpIHtcbiAgICAgIGFzc2VydFZhbGlkRmxhZyhmbGFnKTtcbiAgICAgIHRoaXMua25vd25GbGFncy5hZGQoZmxhZyk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGhhc0ZsYWcoZmxhZzogU2RrRmxhZyk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmtub3duRmxhZ3MuaGFzKGZsYWcuaWQpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmluZm8udW5zYWZlLmlzUmVwbGF5aW5nICYmIGZsYWcuZGVmYXVsdCkge1xuICAgICAgdGhpcy5rbm93bkZsYWdzLmFkZChmbGFnLmlkKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwdWJsaWMgcmVtb3ZlRnJvbUNhY2hlKCk6IHZvaWQge1xuICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcigncmVtb3ZlRnJvbUNhY2hlIGFjdGl2YXRpb24gam9iIHNob3VsZCBub3QgcmVhY2ggd29ya2Zsb3cnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIGZhaWx1cmVzIGludG8gYSBjb21tYW5kIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlci5cbiAgICogVXNlZCB0byBoYW5kbGUgYW55IGZhaWx1cmUgZW1pdHRlZCBieSB0aGUgV29ya2Zsb3cuXG4gICAqL1xuICBhc3luYyBoYW5kbGVXb3JrZmxvd0ZhaWx1cmUoZXJyb3I6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5jYW5jZWxsZWQgJiYgaXNDYW5jZWxsYXRpb24oZXJyb3IpKSB7XG4gICAgICB0aGlzLnB1c2hDb21tYW5kKHsgY2FuY2VsV29ya2Zsb3dFeGVjdXRpb246IHt9IH0sIHRydWUpO1xuICAgIH0gZWxzZSBpZiAoZXJyb3IgaW5zdGFuY2VvZiBDb250aW51ZUFzTmV3KSB7XG4gICAgICB0aGlzLnB1c2hDb21tYW5kKHsgY29udGludWVBc05ld1dvcmtmbG93RXhlY3V0aW9uOiBlcnJvci5jb21tYW5kIH0sIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIFRlbXBvcmFsRmFpbHVyZSkpIHtcbiAgICAgICAgLy8gVGhpcyByZXN1bHRzIGluIGFuIHVuaGFuZGxlZCByZWplY3Rpb24gd2hpY2ggd2lsbCBmYWlsIHRoZSBhY3RpdmF0aW9uXG4gICAgICAgIC8vIHByZXZlbnRpbmcgaXQgZnJvbSBjb21wbGV0aW5nLlxuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wdXNoQ29tbWFuZChcbiAgICAgICAge1xuICAgICAgICAgIGZhaWxXb3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICAgICAgZmFpbHVyZTogdGhpcy5lcnJvclRvRmFpbHVyZShlcnJvciksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNvbXBsZXRlUXVlcnkocXVlcnlJZDogc3RyaW5nLCByZXN1bHQ6IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hDb21tYW5kKHtcbiAgICAgIHJlc3BvbmRUb1F1ZXJ5OiB7IHF1ZXJ5SWQsIHN1Y2NlZWRlZDogeyByZXNwb25zZTogdGhpcy5wYXlsb2FkQ29udmVydGVyLnRvUGF5bG9hZChyZXN1bHQpIH0gfSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgZmFpbFF1ZXJ5KHF1ZXJ5SWQ6IHN0cmluZywgZXJyb3I6IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hDb21tYW5kKHtcbiAgICAgIHJlc3BvbmRUb1F1ZXJ5OiB7XG4gICAgICAgIHF1ZXJ5SWQsXG4gICAgICAgIGZhaWxlZDogdGhpcy5lcnJvclRvRmFpbHVyZShlbnN1cmVUZW1wb3JhbEZhaWx1cmUoZXJyb3IpKSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFjY2VwdFVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucHVzaENvbW1hbmQoeyB1cGRhdGVSZXNwb25zZTogeyBwcm90b2NvbEluc3RhbmNlSWQsIGFjY2VwdGVkOiB7fSB9IH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBjb21wbGV0ZVVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQ6IHN0cmluZywgcmVzdWx0OiB1bmtub3duKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoQ29tbWFuZCh7XG4gICAgICB1cGRhdGVSZXNwb25zZTogeyBwcm90b2NvbEluc3RhbmNlSWQsIGNvbXBsZXRlZDogdGhpcy5wYXlsb2FkQ29udmVydGVyLnRvUGF5bG9hZChyZXN1bHQpIH0sXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHJlamVjdFVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQ6IHN0cmluZywgZXJyb3I6IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hDb21tYW5kKHtcbiAgICAgIHVwZGF0ZVJlc3BvbnNlOiB7XG4gICAgICAgIHByb3RvY29sSW5zdGFuY2VJZCxcbiAgICAgICAgcmVqZWN0ZWQ6IHRoaXMuZXJyb3JUb0ZhaWx1cmUoZW5zdXJlVGVtcG9yYWxGYWlsdXJlKGVycm9yKSksXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIENvbnN1bWUgYSBjb21wbGV0aW9uIGlmIGl0IGV4aXN0cyBpbiBXb3JrZmxvdyBzdGF0ZSAqL1xuICBwcml2YXRlIG1heWJlQ29uc3VtZUNvbXBsZXRpb24odHlwZToga2V5b2YgQWN0aXZhdG9yWydjb21wbGV0aW9ucyddLCB0YXNrU2VxOiBudW1iZXIpOiBDb21wbGV0aW9uIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBjb21wbGV0aW9uID0gdGhpcy5jb21wbGV0aW9uc1t0eXBlXS5nZXQodGFza1NlcSk7XG4gICAgaWYgKGNvbXBsZXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5jb21wbGV0aW9uc1t0eXBlXS5kZWxldGUodGFza1NlcSk7XG4gICAgfVxuICAgIHJldHVybiBjb21wbGV0aW9uO1xuICB9XG5cbiAgLyoqIENvbnN1bWUgYSBjb21wbGV0aW9uIGlmIGl0IGV4aXN0cyBpbiBXb3JrZmxvdyBzdGF0ZSwgdGhyb3dzIGlmIGl0IGRvZXNuJ3QgKi9cbiAgcHJpdmF0ZSBjb25zdW1lQ29tcGxldGlvbih0eXBlOiBrZXlvZiBBY3RpdmF0b3JbJ2NvbXBsZXRpb25zJ10sIHRhc2tTZXE6IG51bWJlcik6IENvbXBsZXRpb24ge1xuICAgIGNvbnN0IGNvbXBsZXRpb24gPSB0aGlzLm1heWJlQ29uc3VtZUNvbXBsZXRpb24odHlwZSwgdGFza1NlcSk7XG4gICAgaWYgKGNvbXBsZXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKGBObyBjb21wbGV0aW9uIGZvciB0YXNrU2VxICR7dGFza1NlcX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBsZXRpb247XG4gIH1cblxuICBwcml2YXRlIGNvbXBsZXRlV29ya2Zsb3cocmVzdWx0OiB1bmtub3duKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoQ29tbWFuZChcbiAgICAgIHtcbiAgICAgICAgY29tcGxldGVXb3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICAgIHJlc3VsdDogdGhpcy5wYXlsb2FkQ29udmVydGVyLnRvUGF5bG9hZChyZXN1bHQpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHRydWVcbiAgICApO1xuICB9XG5cbiAgZXJyb3JUb0ZhaWx1cmUoZXJyOiB1bmtub3duKTogUHJvdG9GYWlsdXJlIHtcbiAgICByZXR1cm4gdGhpcy5mYWlsdXJlQ29udmVydGVyLmVycm9yVG9GYWlsdXJlKGVyciwgdGhpcy5wYXlsb2FkQ29udmVydGVyKTtcbiAgfVxuXG4gIGZhaWx1cmVUb0Vycm9yKGZhaWx1cmU6IFByb3RvRmFpbHVyZSk6IEVycm9yIHtcbiAgICByZXR1cm4gdGhpcy5mYWlsdXJlQ29udmVydGVyLmZhaWx1cmVUb0Vycm9yKGZhaWx1cmUsIHRoaXMucGF5bG9hZENvbnZlcnRlcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0U2VxPFQgZXh0ZW5kcyB7IHNlcT86IG51bWJlciB8IG51bGwgfT4oYWN0aXZhdGlvbjogVCk6IG51bWJlciB7XG4gIGNvbnN0IHNlcSA9IGFjdGl2YXRpb24uc2VxO1xuICBpZiAoc2VxID09PSB1bmRlZmluZWQgfHwgc2VxID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgR290IGFjdGl2YXRpb24gd2l0aCBubyBzZXEgYXR0cmlidXRlYCk7XG4gIH1cbiAgcmV0dXJuIHNlcTtcbn1cbiIsImltcG9ydCB7IGNvbXBvc2VJbnRlcmNlcHRvcnMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQgeyBTZGtDb21wb25lbnQgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgdW50cmFja1Byb21pc2UgfSBmcm9tICcuL3N0YWNrLWhlbHBlcnMnO1xuaW1wb3J0IHsgdHlwZSBTaW5rLCB0eXBlIFNpbmtzLCBwcm94eVNpbmtzIH0gZnJvbSAnLi9zaW5rcyc7XG5pbXBvcnQgeyBpc0NhbmNlbGxhdGlvbiB9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7IFdvcmtmbG93SW5mbywgQ29udGludWVBc05ldyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBhc3NlcnRJbldvcmtmbG93Q29udGV4dCB9IGZyb20gJy4vZ2xvYmFsLWF0dHJpYnV0ZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93TG9nZ2VyIGV4dGVuZHMgU2luayB7XG4gIHRyYWNlKG1lc3NhZ2U6IHN0cmluZywgYXR0cnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQ7XG4gIGRlYnVnKG1lc3NhZ2U6IHN0cmluZywgYXR0cnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQ7XG4gIGluZm8obWVzc2FnZTogc3RyaW5nLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZDtcbiAgd2FybihtZXNzYWdlOiBzdHJpbmcsIGF0dHJzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkO1xuICBlcnJvcihtZXNzYWdlOiBzdHJpbmcsIGF0dHJzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkO1xufVxuXG4vKipcbiAqIFNpbmsgaW50ZXJmYWNlIGZvciBmb3J3YXJkaW5nIGxvZ3MgZnJvbSB0aGUgV29ya2Zsb3cgc2FuZGJveCB0byB0aGUgV29ya2VyXG4gKlxuICogQGRlcHJlY2F0ZWQgRG8gbm90IHVzZSBMb2dnZXJTaW5rcyBkaXJlY3RseS4gVG8gbG9nIGZyb20gV29ya2Zsb3cgY29kZSwgdXNlIHRoZSBgbG9nYCBvYmplY3RcbiAqICAgICAgICAgICAgIGV4cG9ydGVkIGJ5IHRoZSBgQHRlbXBvcmFsaW8vd29ya2Zsb3dgIHBhY2thZ2UuIFRvIGNhcHR1cmUgbG9nIG1lc3NhZ2VzIGVtaXR0ZWRcbiAqICAgICAgICAgICAgIGJ5IFdvcmtmbG93IGNvZGUsIHNldCB0aGUge0BsaW5rIFJ1bnRpbWUubG9nZ2VyfSBwcm9wZXJ0eS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2dnZXJTaW5rc0RlcHJlY2F0ZWQgZXh0ZW5kcyBTaW5rcyB7XG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBEbyBub3QgdXNlIExvZ2dlclNpbmtzIGRpcmVjdGx5LiBUbyBsb2cgZnJvbSBXb3JrZmxvdyBjb2RlLCB1c2UgdGhlIGBsb2dgIG9iamVjdFxuICAgKiAgICAgICAgICAgICBleHBvcnRlZCBieSB0aGUgYEB0ZW1wb3JhbGlvL3dvcmtmbG93YCBwYWNrYWdlLiBUbyBjYXB0dXJlIGxvZyBtZXNzYWdlcyBlbWl0dGVkXG4gICAqICAgICAgICAgICAgIGJ5IFdvcmtmbG93IGNvZGUsIHNldCB0aGUge0BsaW5rIFJ1bnRpbWUubG9nZ2VyfSBwcm9wZXJ0eS5cbiAgICovXG4gIGRlZmF1bHRXb3JrZXJMb2dnZXI6IFdvcmtmbG93TG9nZ2VyO1xufVxuXG4vKipcbiAqIFNpbmsgaW50ZXJmYWNlIGZvciBmb3J3YXJkaW5nIGxvZ3MgZnJvbSB0aGUgV29ya2Zsb3cgc2FuZGJveCB0byB0aGUgV29ya2VyXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyU2lua3NJbnRlcm5hbCBleHRlbmRzIFNpbmtzIHtcbiAgX190ZW1wb3JhbF9sb2dnZXI6IFdvcmtmbG93TG9nZ2VyO1xufVxuXG5jb25zdCBsb2dnZXJTaW5rID0gcHJveHlTaW5rczxMb2dnZXJTaW5rc0ludGVybmFsPigpLl9fdGVtcG9yYWxfbG9nZ2VyO1xuXG4vKipcbiAqIFN5bWJvbCB1c2VkIGJ5IHRoZSBTREsgbG9nZ2VyIHRvIGV4dHJhY3QgYSB0aW1lc3RhbXAgZnJvbSBsb2cgYXR0cmlidXRlcy5cbiAqIEFsc28gZGVmaW5lZCBpbiBgd29ya2VyL2xvZ2dlci50c2AgLSBpbnRlbnRpb25hbGx5IG5vdCBzaGFyZWQuXG4gKi9cbmNvbnN0IExvZ1RpbWVzdGFtcCA9IFN5bWJvbC5mb3IoJ2xvZ190aW1lc3RhbXAnKTtcblxuLyoqXG4gKiBEZWZhdWx0IHdvcmtmbG93IGxvZ2dlci5cbiAqXG4gKiBUaGlzIGxvZ2dlciBpcyByZXBsYXktYXdhcmUgYW5kIHdpbGwgb21pdCBsb2cgbWVzc2FnZXMgb24gd29ya2Zsb3cgcmVwbGF5LiBNZXNzYWdlcyBlbWl0dGVkIGJ5IHRoaXMgbG9nZ2VyIGFyZVxuICogZnVubmVsbGVkIHRocm91Z2ggYSBzaW5rIHRoYXQgZm9yd2FyZHMgdGhlbSB0byB0aGUgbG9nZ2VyIHJlZ2lzdGVyZWQgb24ge0BsaW5rIFJ1bnRpbWUubG9nZ2VyfS5cbiAqXG4gKiBBdHRyaWJ1dGVzIGZyb20gdGhlIGN1cnJlbnQgV29ya2Zsb3cgRXhlY3V0aW9uIGNvbnRleHQgYXJlIGF1dG9tYXRpY2FsbHkgaW5jbHVkZWQgYXMgbWV0YWRhdGEgb24gZXZlcnkgbG9nXG4gKiBlbnRyaWVzLiBBbiBleHRyYSBgc2RrQ29tcG9uZW50YCBtZXRhZGF0YSBhdHRyaWJ1dGUgaXMgYWxzbyBhZGRlZCwgd2l0aCB2YWx1ZSBgd29ya2Zsb3dgOyB0aGlzIGNhbiBiZSB1c2VkIGZvclxuICogZmluZS1ncmFpbmVkIGZpbHRlcmluZyBvZiBsb2cgZW50cmllcyBmdXJ0aGVyIGRvd25zdHJlYW0uXG4gKlxuICogVG8gY3VzdG9taXplIGxvZyBhdHRyaWJ1dGVzLCByZWdpc3RlciBhIHtAbGluayBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvcn0gdGhhdCBpbnRlcmNlcHRzIHRoZVxuICogYGdldExvZ0F0dHJpYnV0ZXMoKWAgbWV0aG9kLlxuICpcbiAqIE5vdGljZSB0aGF0IHNpbmNlIHNpbmtzIGFyZSB1c2VkIHRvIHBvd2VyIHRoaXMgbG9nZ2VyLCBhbnkgbG9nIGF0dHJpYnV0ZXMgbXVzdCBiZSB0cmFuc2ZlcmFibGUgdmlhIHRoZVxuICoge0BsaW5rIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvd29ya2VyX3RocmVhZHMuaHRtbCN3b3JrZXJfdGhyZWFkc19wb3J0X3Bvc3RtZXNzYWdlX3ZhbHVlX3RyYW5zZmVybGlzdCB8IHBvc3RNZXNzYWdlfVxuICogQVBJLlxuICpcbiAqIE5PVEU6IFNwZWNpZnlpbmcgYSBjdXN0b20gbG9nZ2VyIHRocm91Z2gge0BsaW5rIGRlZmF1bHRTaW5rfSBvciBieSBtYW51YWxseSByZWdpc3RlcmluZyBhIHNpbmsgbmFtZWRcbiAqIGBkZWZhdWx0V29ya2VyTG9nZ2VyYCBoYXMgYmVlbiBkZXByZWNhdGVkLiBQbGVhc2UgdXNlIHtAbGluayBSdW50aW1lLmxvZ2dlcn0gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGxvZzogV29ya2Zsb3dMb2dnZXIgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gIChbJ3RyYWNlJywgJ2RlYnVnJywgJ2luZm8nLCAnd2FybicsICdlcnJvciddIGFzIEFycmF5PGtleW9mIFdvcmtmbG93TG9nZ2VyPikubWFwKChsZXZlbCkgPT4ge1xuICAgIHJldHVybiBbXG4gICAgICBsZXZlbCxcbiAgICAgIChtZXNzYWdlOiBzdHJpbmcsIGF0dHJzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHtcbiAgICAgICAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoJ1dvcmtmbG93LmxvZyguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSB3b3JrZmxvdyBjb250ZXh0LicpO1xuICAgICAgICBjb25zdCBnZXRMb2dBdHRyaWJ1dGVzID0gY29tcG9zZUludGVyY2VwdG9ycyhhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLCAnZ2V0TG9nQXR0cmlidXRlcycsIChhKSA9PiBhKTtcbiAgICAgICAgcmV0dXJuIGxvZ2dlclNpbmtbbGV2ZWxdKG1lc3NhZ2UsIHtcbiAgICAgICAgICAvLyBJbmplY3QgdGhlIGNhbGwgdGltZSBpbiBuYW5vc2Vjb25kIHJlc29sdXRpb24gYXMgZXhwZWN0ZWQgYnkgdGhlIHdvcmtlciBsb2dnZXIuXG4gICAgICAgICAgW0xvZ1RpbWVzdGFtcF06IGFjdGl2YXRvci5nZXRUaW1lT2ZEYXkoKSxcbiAgICAgICAgICBzZGtDb21wb25lbnQ6IFNka0NvbXBvbmVudC53b3JrZmxvdyxcbiAgICAgICAgICAuLi5nZXRMb2dBdHRyaWJ1dGVzKHdvcmtmbG93TG9nQXR0cmlidXRlcyhhY3RpdmF0b3IuaW5mbykpLFxuICAgICAgICAgIC4uLmF0dHJzLFxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgXTtcbiAgfSlcbikgYXMgYW55O1xuXG5leHBvcnQgZnVuY3Rpb24gZXhlY3V0ZVdpdGhMaWZlY3ljbGVMb2dnaW5nKGZuOiAoKSA9PiBQcm9taXNlPHVua25vd24+KTogUHJvbWlzZTx1bmtub3duPiB7XG4gIGxvZy5kZWJ1ZygnV29ya2Zsb3cgc3RhcnRlZCcsIHsgc2RrQ29tcG9uZW50OiBTZGtDb21wb25lbnQud29ya2VyIH0pO1xuICBjb25zdCBwID0gZm4oKS50aGVuKFxuICAgIChyZXMpID0+IHtcbiAgICAgIGxvZy5kZWJ1ZygnV29ya2Zsb3cgY29tcGxldGVkJywgeyBzZGtDb21wb25lbnQ6IFNka0NvbXBvbmVudC53b3JrZXIgfSk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0sXG4gICAgKGVycm9yKSA9PiB7XG4gICAgICAvLyBBdm9pZCB1c2luZyBpbnN0YW5jZW9mIGNoZWNrcyBpbiBjYXNlIHRoZSBtb2R1bGVzIHRoZXkncmUgZGVmaW5lZCBpbiBsb2FkZWQgbW9yZSB0aGFuIG9uY2UsXG4gICAgICAvLyBlLmcuIGJ5IGplc3Qgb3Igd2hlbiBtdWx0aXBsZSB2ZXJzaW9ucyBhcmUgaW5zdGFsbGVkLlxuICAgICAgaWYgKHR5cGVvZiBlcnJvciA9PT0gJ29iamVjdCcgJiYgZXJyb3IgIT0gbnVsbCkge1xuICAgICAgICBpZiAoaXNDYW5jZWxsYXRpb24oZXJyb3IpKSB7XG4gICAgICAgICAgbG9nLmRlYnVnKCdXb3JrZmxvdyBjb21wbGV0ZWQgYXMgY2FuY2VsbGVkJywgeyBzZGtDb21wb25lbnQ6IFNka0NvbXBvbmVudC53b3JrZXIgfSk7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH0gZWxzZSBpZiAoZXJyb3IgaW5zdGFuY2VvZiBDb250aW51ZUFzTmV3KSB7XG4gICAgICAgICAgbG9nLmRlYnVnKCdXb3JrZmxvdyBjb250aW51ZWQgYXMgbmV3JywgeyBzZGtDb21wb25lbnQ6IFNka0NvbXBvbmVudC53b3JrZXIgfSk7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxvZy53YXJuKCdXb3JrZmxvdyBmYWlsZWQnLCB7IGVycm9yLCBzZGtDb21wb25lbnQ6IFNka0NvbXBvbmVudC53b3JrZXIgfSk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICk7XG4gIC8vIEF2b2lkIHNob3dpbmcgdGhpcyBpbnRlcmNlcHRvciBpbiBzdGFjayB0cmFjZSBxdWVyeVxuICB1bnRyYWNrUHJvbWlzZShwKTtcbiAgcmV0dXJuIHA7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIG1hcCBvZiBhdHRyaWJ1dGVzIHRvIGJlIHNldCBfYnkgZGVmYXVsdF8gb24gbG9nIG1lc3NhZ2VzIGZvciBhIGdpdmVuIFdvcmtmbG93LlxuICogTm90ZSB0aGF0IHRoaXMgZnVuY3Rpb24gbWF5IGJlIGNhbGxlZCBmcm9tIG91dHNpZGUgb2YgdGhlIFdvcmtmbG93IGNvbnRleHQgKGVnLiBieSB0aGUgd29ya2VyIGl0c2VsZikuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3b3JrZmxvd0xvZ0F0dHJpYnV0ZXMoaW5mbzogV29ya2Zsb3dJbmZvKTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICByZXR1cm4ge1xuICAgIG5hbWVzcGFjZTogaW5mby5uYW1lc3BhY2UsXG4gICAgdGFza1F1ZXVlOiBpbmZvLnRhc2tRdWV1ZSxcbiAgICB3b3JrZmxvd0lkOiBpbmZvLndvcmtmbG93SWQsXG4gICAgcnVuSWQ6IGluZm8ucnVuSWQsXG4gICAgd29ya2Zsb3dUeXBlOiBpbmZvLndvcmtmbG93VHlwZSxcbiAgfTtcbn1cbiIsIi8vIC4uL3BhY2thZ2UuanNvbiBpcyBvdXRzaWRlIG9mIHRoZSBUUyBwcm9qZWN0IHJvb3REaXIgd2hpY2ggY2F1c2VzIFRTIHRvIGNvbXBsYWluIGFib3V0IHRoaXMgaW1wb3J0LlxuLy8gV2UgZG8gbm90IHdhbnQgdG8gY2hhbmdlIHRoZSByb290RGlyIGJlY2F1c2UgaXQgbWVzc2VzIHVwIHRoZSBvdXRwdXQgc3RydWN0dXJlLlxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHBrZyBmcm9tICcuLi9wYWNrYWdlLmpzb24nO1xuXG5leHBvcnQgZGVmYXVsdCBwa2cgYXMgeyBuYW1lOiBzdHJpbmc7IHZlcnNpb246IHN0cmluZyB9O1xuIiwiLyoqXG4gKiBUeXBlIGRlZmluaXRpb25zIGZvciB0aGUgV29ya2Zsb3cgZW5kIG9mIHRoZSBzaW5rcyBtZWNoYW5pc20uXG4gKlxuICogU2lua3MgYXJlIGEgbWVjaGFuaXNtIGZvciBleHBvcnRpbmcgZGF0YSBmcm9tIHRoZSBXb3JrZmxvdyBpc29sYXRlIHRvIHRoZVxuICogTm9kZS5qcyBlbnZpcm9ubWVudCwgdGhleSBhcmUgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlIFdvcmtmbG93IGhhcyBubyB3YXkgdG9cbiAqIGNvbW11bmljYXRlIHdpdGggdGhlIG91dHNpZGUgV29ybGQuXG4gKlxuICogU2lua3MgYXJlIHR5cGljYWxseSB1c2VkIGZvciBleHBvcnRpbmcgbG9ncywgbWV0cmljcyBhbmQgdHJhY2VzIG91dCBmcm9tIHRoZVxuICogV29ya2Zsb3cuXG4gKlxuICogU2luayBmdW5jdGlvbnMgbWF5IG5vdCByZXR1cm4gdmFsdWVzIHRvIHRoZSBXb3JrZmxvdyBpbiBvcmRlciB0byBwcmV2ZW50XG4gKiBicmVha2luZyBkZXRlcm1pbmlzbS5cbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuaW1wb3J0IHsgV29ya2Zsb3dJbmZvIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGFzc2VydEluV29ya2Zsb3dDb250ZXh0IH0gZnJvbSAnLi9nbG9iYWwtYXR0cmlidXRlcyc7XG5cbi8qKlxuICogQW55IGZ1bmN0aW9uIHNpZ25hdHVyZSBjYW4gYmUgdXNlZCBmb3IgU2luayBmdW5jdGlvbnMgYXMgbG9uZyBhcyB0aGUgcmV0dXJuIHR5cGUgaXMgYHZvaWRgLlxuICpcbiAqIFdoZW4gY2FsbGluZyBhIFNpbmsgZnVuY3Rpb24sIGFyZ3VtZW50cyBhcmUgY29waWVkIGZyb20gdGhlIFdvcmtmbG93IGlzb2xhdGUgdG8gdGhlIE5vZGUuanMgZW52aXJvbm1lbnQgdXNpbmdcbiAqIHtAbGluayBodHRwczovL25vZGVqcy5vcmcvYXBpL3dvcmtlcl90aHJlYWRzLmh0bWwjd29ya2VyX3RocmVhZHNfcG9ydF9wb3N0bWVzc2FnZV92YWx1ZV90cmFuc2Zlcmxpc3QgfCBwb3N0TWVzc2FnZX0uXG5cbiAqIFRoaXMgY29uc3RyYWlucyB0aGUgYXJndW1lbnQgdHlwZXMgdG8gcHJpbWl0aXZlcyAoZXhjbHVkaW5nIFN5bWJvbHMpLlxuICovXG5leHBvcnQgdHlwZSBTaW5rRnVuY3Rpb24gPSAoLi4uYXJnczogYW55W10pID0+IHZvaWQ7XG5cbi8qKiBBIG1hcHBpbmcgb2YgbmFtZSB0byBmdW5jdGlvbiwgZGVmaW5lcyBhIHNpbmdsZSBzaW5rIChlLmcuIGxvZ2dlcikgKi9cbmV4cG9ydCB0eXBlIFNpbmsgPSBSZWNvcmQ8c3RyaW5nLCBTaW5rRnVuY3Rpb24+O1xuLyoqXG4gKiBXb3JrZmxvdyBTaW5rIGFyZSBhIG1hcHBpbmcgb2YgbmFtZSB0byB7QGxpbmsgU2lua31cbiAqL1xuZXhwb3J0IHR5cGUgU2lua3MgPSBSZWNvcmQ8c3RyaW5nLCBTaW5rPjtcblxuLyoqXG4gKiBDYWxsIGluZm9ybWF0aW9uIGZvciBhIFNpbmtcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTaW5rQ2FsbCB7XG4gIGlmYWNlTmFtZTogc3RyaW5nO1xuICBmbk5hbWU6IHN0cmluZztcbiAgYXJnczogYW55W107XG4gIHdvcmtmbG93SW5mbzogV29ya2Zsb3dJbmZvO1xufVxuXG4vKipcbiAqIEdldCBhIHJlZmVyZW5jZSB0byBTaW5rcyBmb3IgZXhwb3J0aW5nIGRhdGEgb3V0IG9mIHRoZSBXb3JrZmxvdy5cbiAqXG4gKiBUaGVzZSBTaW5rcyAqKm11c3QqKiBiZSByZWdpc3RlcmVkIHdpdGggdGhlIFdvcmtlciBpbiBvcmRlciBmb3IgdGhpc1xuICogbWVjaGFuaXNtIHRvIHdvcmsuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwcm94eVNpbmtzLCBTaW5rcyB9IGZyb20gJ0B0ZW1wb3JhbGlvL3dvcmtmbG93JztcbiAqXG4gKiBpbnRlcmZhY2UgTXlTaW5rcyBleHRlbmRzIFNpbmtzIHtcbiAqICAgbG9nZ2VyOiB7XG4gKiAgICAgaW5mbyhtZXNzYWdlOiBzdHJpbmcpOiB2b2lkO1xuICogICAgIGVycm9yKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQ7XG4gKiAgIH07XG4gKiB9XG4gKlxuICogY29uc3QgeyBsb2dnZXIgfSA9IHByb3h5U2lua3M8TXlEZXBlbmRlbmNpZXM+KCk7XG4gKiBsb2dnZXIuaW5mbygnc2V0dGluZyB1cCcpO1xuICpcbiAqIGV4cG9ydCBmdW5jdGlvbiBteVdvcmtmbG93KCkge1xuICogICByZXR1cm4ge1xuICogICAgIGFzeW5jIGV4ZWN1dGUoKSB7XG4gKiAgICAgICBsb2dnZXIuaW5mbyhcImhleSBob1wiKTtcbiAqICAgICAgIGxvZ2dlci5lcnJvcihcImxldHMgZ29cIik7XG4gKiAgICAgfVxuICogICB9O1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm94eVNpbmtzPFQgZXh0ZW5kcyBTaW5rcz4oKTogVCB7XG4gIHJldHVybiBuZXcgUHJveHkoXG4gICAge30sXG4gICAge1xuICAgICAgZ2V0KF8sIGlmYWNlTmFtZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb3h5KFxuICAgICAgICAgIHt9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGdldChfLCBmbk5hbWUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICAgICAgICAgICAgICAgJ1Byb3hpZWQgc2lua3MgZnVuY3Rpb25zIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBhY3RpdmF0b3Iuc2lua0NhbGxzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgaWZhY2VOYW1lOiBpZmFjZU5hbWUgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgZm5OYW1lOiBmbk5hbWUgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgLy8gU2luayBmdW5jdGlvbiBkb2Vzbid0IGdldCBjYWxsZWQgaW1tZWRpYXRlbHkuIE1ha2UgYSBjbG9uZSBvZiB0aGUgc2luaydzIGFyZ3MsIHNvIHRoYXQgZnVydGhlciBtdXRhdGlvbnNcbiAgICAgICAgICAgICAgICAgIC8vIHRvIHRoZXNlIG9iamVjdHMgZG9uJ3QgY29ycnVwdCB0aGUgYXJncyB0aGF0IHRoZSBzaW5rIGZ1bmN0aW9uIHdpbGwgcmVjZWl2ZS4gT25seSBhdmFpbGFibGUgZnJvbSBub2RlIDE3LlxuICAgICAgICAgICAgICAgICAgYXJnczogKGdsb2JhbFRoaXMgYXMgYW55KS5zdHJ1Y3R1cmVkQ2xvbmUgPyAoZ2xvYmFsVGhpcyBhcyBhbnkpLnN0cnVjdHVyZWRDbG9uZShhcmdzKSA6IGFyZ3MsXG4gICAgICAgICAgICAgICAgICAvLyBhY3RpdmF0b3IuaW5mbyBpcyBpbnRlcm5hbGx5IGNvcHktb24td3JpdGUuIFRoaXMgZW5zdXJlIHRoYXQgYW55IGZ1cnRoZXIgbXV0YXRpb25zXG4gICAgICAgICAgICAgICAgICAvLyB0byB0aGUgd29ya2Zsb3cgc3RhdGUgaW4gdGhlIGNvbnRleHQgb2YgdGhlIHByZXNlbnQgYWN0aXZhdGlvbiB3aWxsIG5vdCBjb3JydXB0IHRoZVxuICAgICAgICAgICAgICAgICAgLy8gd29ya2Zsb3dJbmZvIHN0YXRlIHRoYXQgZ2V0cyBwYXNzZWQgd2hlbiB0aGUgc2luayBmdW5jdGlvbiBhY3R1YWxseSBnZXRzIGNhbGxlZC5cbiAgICAgICAgICAgICAgICAgIHdvcmtmbG93SW5mbzogYWN0aXZhdG9yLmluZm8sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgfVxuICApIGFzIGFueTtcbn1cbiIsImltcG9ydCB7IG1heWJlR2V0QWN0aXZhdG9yVW50eXBlZCB9IGZyb20gJy4vZ2xvYmFsLWF0dHJpYnV0ZXMnO1xuaW1wb3J0IHR5cGUgeyBQcm9taXNlU3RhY2tTdG9yZSB9IGZyb20gJy4vaW50ZXJuYWxzJztcblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gcmVtb3ZlIGEgcHJvbWlzZSBmcm9tIGJlaW5nIHRyYWNrZWQgZm9yIHN0YWNrIHRyYWNlIHF1ZXJ5IHB1cnBvc2VzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bnRyYWNrUHJvbWlzZShwcm9taXNlOiBQcm9taXNlPHVua25vd24+KTogdm9pZCB7XG4gIGNvbnN0IHN0b3JlID0gKG1heWJlR2V0QWN0aXZhdG9yVW50eXBlZCgpIGFzIGFueSk/LnByb21pc2VTdGFja1N0b3JlIGFzIFByb21pc2VTdGFja1N0b3JlIHwgdW5kZWZpbmVkO1xuICBpZiAoIXN0b3JlKSByZXR1cm47XG4gIHN0b3JlLmNoaWxkVG9QYXJlbnQuZGVsZXRlKHByb21pc2UpO1xuICBzdG9yZS5wcm9taXNlVG9TdGFjay5kZWxldGUocHJvbWlzZSk7XG59XG4iLCJpbXBvcnQgeyBDYW5jZWxsYXRpb25TY29wZSB9IGZyb20gJy4vY2FuY2VsbGF0aW9uLXNjb3BlJztcbmltcG9ydCB7IHVudHJhY2tQcm9taXNlIH0gZnJvbSAnLi9zdGFjay1oZWxwZXJzJztcblxuLyoqXG4gKiBBIGBQcm9taXNlTGlrZWAgaGVscGVyIHdoaWNoIGV4cG9zZXMgaXRzIGByZXNvbHZlYCBhbmQgYHJlamVjdGAgbWV0aG9kcy5cbiAqXG4gKiBUcmlnZ2VyIGlzIENhbmNlbGxhdGlvblNjb3BlLWF3YXJlOiBpdCBpcyBsaW5rZWQgdG8gdGhlIGN1cnJlbnQgc2NvcGUgb25cbiAqIGNvbnN0cnVjdGlvbiBhbmQgdGhyb3dzIHdoZW4gdGhhdCBzY29wZSBpcyBjYW5jZWxsZWQuXG4gKlxuICogVXNlZnVsIGZvciBlLmcuIHdhaXRpbmcgZm9yIHVuYmxvY2tpbmcgYSBXb3JrZmxvdyBmcm9tIGEgU2lnbmFsLlxuICpcbiAqIEBleGFtcGxlXG4gKiA8IS0tU05JUFNUQVJUIHR5cGVzY3JpcHQtdHJpZ2dlci13b3JrZmxvdy0tPlxuICogPCEtLVNOSVBFTkQtLT5cbiAqL1xuZXhwb3J0IGNsYXNzIFRyaWdnZXI8VD4gaW1wbGVtZW50cyBQcm9taXNlTGlrZTxUPiB7XG4gIC8vIFR5cGVzY3JpcHQgZG9lcyBub3QgcmVhbGl6ZSB0aGF0IHRoZSBwcm9taXNlIGV4ZWN1dG9yIGlzIHJ1biBzeW5jaHJvbm91c2x5IGluIHRoZSBjb25zdHJ1Y3RvclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gIC8vIEB0cy1pZ25vcmVcbiAgcHVibGljIHJlYWRvbmx5IHJlc29sdmU6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkO1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gIC8vIEB0cy1pZ25vcmVcbiAgcHVibGljIHJlYWRvbmx5IHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZDtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHByb21pc2U6IFByb21pc2U8VD47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgICAgdW50cmFja1Byb21pc2Uoc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKHJlamVjdCkpO1xuICAgICAgfVxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHRoaXMucmVqZWN0ID0gcmVqZWN0O1xuICAgIH0pO1xuICAgIC8vIEF2b2lkIHVuaGFuZGxlZCByZWplY3Rpb25zXG4gICAgdW50cmFja1Byb21pc2UodGhpcy5wcm9taXNlLmNhdGNoKCgpID0+IHVuZGVmaW5lZCkpO1xuICB9XG5cbiAgdGhlbjxUUmVzdWx0MSA9IFQsIFRSZXN1bHQyID0gbmV2ZXI+KFxuICAgIG9uZnVsZmlsbGVkPzogKCh2YWx1ZTogVCkgPT4gVFJlc3VsdDEgfCBQcm9taXNlTGlrZTxUUmVzdWx0MT4pIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBvbnJlamVjdGVkPzogKChyZWFzb246IGFueSkgPT4gVFJlc3VsdDIgfCBQcm9taXNlTGlrZTxUUmVzdWx0Mj4pIHwgdW5kZWZpbmVkIHwgbnVsbFxuICApOiBQcm9taXNlTGlrZTxUUmVzdWx0MSB8IFRSZXN1bHQyPiB7XG4gICAgcmV0dXJuIHRoaXMucHJvbWlzZS50aGVuKG9uZnVsZmlsbGVkLCBvbnJlamVjdGVkKTtcbiAgfVxufVxuIiwiLyoqXG4gKiBFeHBvcnRlZCBmdW5jdGlvbnMgZm9yIHRoZSBXb3JrZXIgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgV29ya2Zsb3cgaXNvbGF0ZVxuICpcbiAqIEBtb2R1bGVcbiAqL1xuaW1wb3J0IHsgSWxsZWdhbFN0YXRlRXJyb3IgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgdHNUb01zIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90aW1lJztcbmltcG9ydCB7IGNvbXBvc2VJbnRlcmNlcHRvcnMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQgeyBjb3Jlc2RrIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgZGlzYWJsZVN0b3JhZ2UgfSBmcm9tICcuL2NhbmNlbGxhdGlvbi1zY29wZSc7XG5pbXBvcnQgeyBXb3JrZmxvd0ludGVyY2VwdG9yc0ZhY3RvcnkgfSBmcm9tICcuL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQgeyBXb3JrZmxvd0NyZWF0ZU9wdGlvbnNJbnRlcm5hbCB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBBY3RpdmF0b3IgfSBmcm9tICcuL2ludGVybmFscyc7XG5pbXBvcnQgeyBzZXRBY3RpdmF0b3JVbnR5cGVkLCBnZXRBY3RpdmF0b3IgfSBmcm9tICcuL2dsb2JhbC1hdHRyaWJ1dGVzJztcbmltcG9ydCB7IHR5cGUgU2lua0NhbGwgfSBmcm9tICcuL3NpbmtzJztcblxuLy8gRXhwb3J0IHRoZSB0eXBlIGZvciB1c2Ugb24gdGhlIFwid29ya2VyXCIgc2lkZVxuZXhwb3J0IHsgUHJvbWlzZVN0YWNrU3RvcmUgfSBmcm9tICcuL2ludGVybmFscyc7XG5cbmNvbnN0IGdsb2JhbCA9IGdsb2JhbFRoaXMgYXMgYW55O1xuY29uc3QgT3JpZ2luYWxEYXRlID0gZ2xvYmFsVGhpcy5EYXRlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIGlzb2xhdGUgcnVudGltZS5cbiAqXG4gKiBTZXRzIHJlcXVpcmVkIGludGVybmFsIHN0YXRlIGFuZCBpbnN0YW50aWF0ZXMgdGhlIHdvcmtmbG93IGFuZCBpbnRlcmNlcHRvcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbml0UnVudGltZShvcHRpb25zOiBXb3JrZmxvd0NyZWF0ZU9wdGlvbnNJbnRlcm5hbCk6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBuZXcgQWN0aXZhdG9yKHtcbiAgICAuLi5vcHRpb25zLFxuICAgIGluZm86IGZpeFByb3RvdHlwZXMoe1xuICAgICAgLi4ub3B0aW9ucy5pbmZvLFxuICAgICAgdW5zYWZlOiB7IC4uLm9wdGlvbnMuaW5mby51bnNhZmUsIG5vdzogT3JpZ2luYWxEYXRlLm5vdyB9LFxuICAgIH0pLFxuICB9KTtcbiAgLy8gVGhlcmUncyBvbiBhY3RpdmF0b3IgcGVyIHdvcmtmbG93IGluc3RhbmNlLCBzZXQgaXQgZ2xvYmFsbHkgb24gdGhlIGNvbnRleHQuXG4gIC8vIFdlIGRvIHRoaXMgYmVmb3JlIGltcG9ydGluZyBhbnkgdXNlciBjb2RlIHNvIHVzZXIgY29kZSBjYW4gc3RhdGljYWxseSByZWZlcmVuY2UgQHRlbXBvcmFsaW8vd29ya2Zsb3cgZnVuY3Rpb25zXG4gIC8vIGFzIHdlbGwgYXMgRGF0ZSBhbmQgTWF0aC5yYW5kb20uXG4gIHNldEFjdGl2YXRvclVudHlwZWQoYWN0aXZhdG9yKTtcblxuICAvLyB3ZWJwYWNrIGFsaWFzIHRvIHBheWxvYWRDb252ZXJ0ZXJQYXRoXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzXG4gIGNvbnN0IGN1c3RvbVBheWxvYWRDb252ZXJ0ZXIgPSByZXF1aXJlKCdfX3RlbXBvcmFsX2N1c3RvbV9wYXlsb2FkX2NvbnZlcnRlcicpLnBheWxvYWRDb252ZXJ0ZXI7XG4gIC8vIFRoZSBgcGF5bG9hZENvbnZlcnRlcmAgZXhwb3J0IGlzIHZhbGlkYXRlZCBpbiB0aGUgV29ya2VyXG4gIGlmIChjdXN0b21QYXlsb2FkQ29udmVydGVyICE9IG51bGwpIHtcbiAgICBhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciA9IGN1c3RvbVBheWxvYWRDb252ZXJ0ZXI7XG4gIH1cbiAgLy8gd2VicGFjayBhbGlhcyB0byBmYWlsdXJlQ29udmVydGVyUGF0aFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuICBjb25zdCBjdXN0b21GYWlsdXJlQ29udmVydGVyID0gcmVxdWlyZSgnX190ZW1wb3JhbF9jdXN0b21fZmFpbHVyZV9jb252ZXJ0ZXInKS5mYWlsdXJlQ29udmVydGVyO1xuICAvLyBUaGUgYGZhaWx1cmVDb252ZXJ0ZXJgIGV4cG9ydCBpcyB2YWxpZGF0ZWQgaW4gdGhlIFdvcmtlclxuICBpZiAoY3VzdG9tRmFpbHVyZUNvbnZlcnRlciAhPSBudWxsKSB7XG4gICAgYWN0aXZhdG9yLmZhaWx1cmVDb252ZXJ0ZXIgPSBjdXN0b21GYWlsdXJlQ29udmVydGVyO1xuICB9XG5cbiAgY29uc3QgeyBpbXBvcnRXb3JrZmxvd3MsIGltcG9ydEludGVyY2VwdG9ycyB9ID0gZ2xvYmFsLl9fVEVNUE9SQUxfXztcbiAgaWYgKGltcG9ydFdvcmtmbG93cyA9PT0gdW5kZWZpbmVkIHx8IGltcG9ydEludGVyY2VwdG9ycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdXb3JrZmxvdyBidW5kbGUgZGlkIG5vdCByZWdpc3RlciBpbXBvcnQgaG9va3MnKTtcbiAgfVxuXG4gIGNvbnN0IGludGVyY2VwdG9ycyA9IGltcG9ydEludGVyY2VwdG9ycygpO1xuICBmb3IgKGNvbnN0IG1vZCBvZiBpbnRlcmNlcHRvcnMpIHtcbiAgICBjb25zdCBmYWN0b3J5OiBXb3JrZmxvd0ludGVyY2VwdG9yc0ZhY3RvcnkgPSBtb2QuaW50ZXJjZXB0b3JzO1xuICAgIGlmIChmYWN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0eXBlb2YgZmFjdG9yeSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBGYWlsZWQgdG8gaW5pdGlhbGl6ZSB3b3JrZmxvd3MgaW50ZXJjZXB0b3JzOiBleHBlY3RlZCBhIGZ1bmN0aW9uLCBidXQgZ290OiAnJHtmYWN0b3J5fSdgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGludGVyY2VwdG9ycyA9IGZhY3RvcnkoKTtcbiAgICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMuaW5ib3VuZC5wdXNoKC4uLihpbnRlcmNlcHRvcnMuaW5ib3VuZCA/PyBbXSkpO1xuICAgICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZC5wdXNoKC4uLihpbnRlcmNlcHRvcnMub3V0Ym91bmQgPz8gW10pKTtcbiAgICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMuaW50ZXJuYWxzLnB1c2goLi4uKGludGVyY2VwdG9ycy5pbnRlcm5hbHMgPz8gW10pKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBtb2QgPSBpbXBvcnRXb3JrZmxvd3MoKTtcbiAgY29uc3Qgd29ya2Zsb3dGbiA9IG1vZFthY3RpdmF0b3IuaW5mby53b3JrZmxvd1R5cGVdO1xuICBjb25zdCBkZWZhdWx0V29ya2Zsb3dGbiA9IG1vZFsnZGVmYXVsdCddO1xuXG4gIGlmICh0eXBlb2Ygd29ya2Zsb3dGbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGFjdGl2YXRvci53b3JrZmxvdyA9IHdvcmtmbG93Rm47XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmF1bHRXb3JrZmxvd0ZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgYWN0aXZhdG9yLndvcmtmbG93ID0gZGVmYXVsdFdvcmtmbG93Rm47XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZGV0YWlscyA9XG4gICAgICB3b3JrZmxvd0ZuID09PSB1bmRlZmluZWRcbiAgICAgICAgPyAnbm8gc3VjaCBmdW5jdGlvbiBpcyBleHBvcnRlZCBieSB0aGUgd29ya2Zsb3cgYnVuZGxlJ1xuICAgICAgICA6IGBleHBlY3RlZCBhIGZ1bmN0aW9uLCBidXQgZ290OiAnJHt0eXBlb2Ygd29ya2Zsb3dGbn0nYDtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBGYWlsZWQgdG8gaW5pdGlhbGl6ZSB3b3JrZmxvdyBvZiB0eXBlICcke2FjdGl2YXRvci5pbmZvLndvcmtmbG93VHlwZX0nOiAke2RldGFpbHN9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBPYmplY3RzIHRyYW5zZmVyZWQgdG8gdGhlIFZNIGZyb20gb3V0c2lkZSBoYXZlIHByb3RvdHlwZXMgYmVsb25naW5nIHRvIHRoZVxuICogb3V0ZXIgY29udGV4dCwgd2hpY2ggbWVhbnMgdGhhdCBpbnN0YW5jZW9mIHdvbid0IHdvcmsgaW5zaWRlIHRoZSBWTS4gVGhpc1xuICogZnVuY3Rpb24gcmVjdXJzaXZlbHkgd2Fsa3Mgb3ZlciB0aGUgY29udGVudCBvZiBhbiBvYmplY3QsIGFuZCByZWNyZWF0ZSBzb21lXG4gKiBvZiB0aGVzZSBvYmplY3RzIChub3RhYmx5IEFycmF5LCBEYXRlIGFuZCBPYmplY3RzKS5cbiAqL1xuZnVuY3Rpb24gZml4UHJvdG90eXBlczxYPihvYmo6IFgpOiBYIHtcbiAgaWYgKG9iaiAhPSBudWxsICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgc3dpdGNoIChPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKT8uY29uc3RydWN0b3I/Lm5hbWUpIHtcbiAgICAgIGNhc2UgJ0FycmF5JzpcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oKG9iaiBhcyBBcnJheTx1bmtub3duPikubWFwKGZpeFByb3RvdHlwZXMpKSBhcyBYO1xuICAgICAgY2FzZSAnRGF0ZSc6XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShvYmogYXMgdW5rbm93biBhcyBEYXRlKSBhcyBYO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhPYmplY3QuZW50cmllcyhvYmopLm1hcCgoW2ssIHZdKTogW3N0cmluZywgYW55XSA9PiBbaywgZml4UHJvdG90eXBlcyh2KV0pKSBhcyBYO1xuICAgIH1cbiAgfSBlbHNlIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogUnVuIGEgY2h1bmsgb2YgYWN0aXZhdGlvbiBqb2JzXG4gKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIGpvYiB3YXMgcHJvY2Vzc2VkIG9yIGlnbm9yZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5Xb3JrZmxvd0FjdGl2YXRpb24sIGJhdGNoSW5kZXg6IG51bWJlcik6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgY29uc3QgaW50ZXJjZXB0ID0gY29tcG9zZUludGVyY2VwdG9ycyhhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLmludGVybmFscywgJ2FjdGl2YXRlJywgKHsgYWN0aXZhdGlvbiwgYmF0Y2hJbmRleCB9KSA9PiB7XG4gICAgaWYgKGJhdGNoSW5kZXggPT09IDApIHtcbiAgICAgIGlmICghYWN0aXZhdGlvbi5qb2JzKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBhY3RpdmF0aW9uIHdpdGggbm8gam9icycpO1xuICAgICAgfVxuICAgICAgaWYgKGFjdGl2YXRpb24udGltZXN0YW1wICE9IG51bGwpIHtcbiAgICAgICAgLy8gdGltZXN0YW1wIHdpbGwgbm90IGJlIHVwZGF0ZWQgZm9yIGFjdGl2YXRpb24gdGhhdCBjb250YWluIG9ubHkgcXVlcmllc1xuICAgICAgICBhY3RpdmF0b3Iubm93ID0gdHNUb01zKGFjdGl2YXRpb24udGltZXN0YW1wKTtcbiAgICAgIH1cbiAgICAgIGFjdGl2YXRvci5hZGRLbm93bkZsYWdzKGFjdGl2YXRpb24uYXZhaWxhYmxlSW50ZXJuYWxGbGFncyA/PyBbXSk7XG5cbiAgICAgIC8vIFRoZSBSdXN0IENvcmUgZW5zdXJlcyB0aGF0IHRoZXNlIGFjdGl2YXRpb24gZmllbGRzIGFyZSBub3QgbnVsbFxuICAgICAgYWN0aXZhdG9yLm11dGF0ZVdvcmtmbG93SW5mbygoaW5mbykgPT4gKHtcbiAgICAgICAgLi4uaW5mbyxcbiAgICAgICAgaGlzdG9yeUxlbmd0aDogYWN0aXZhdGlvbi5oaXN0b3J5TGVuZ3RoIGFzIG51bWJlcixcbiAgICAgICAgLy8gRXhhY3QgdHJ1bmNhdGlvbiBmb3IgbXVsdGktcGV0YWJ5dGUgaGlzdG9yaWVzXG4gICAgICAgIC8vIGhpc3RvcnlTaXplID09PSAwIG1lYW5zIFdGVCB3YXMgZ2VuZXJhdGVkIGJ5IHByZS0xLjIwLjAgc2VydmVyLCBhbmQgdGhlIGhpc3Rvcnkgc2l6ZSBpcyB1bmtub3duXG4gICAgICAgIGhpc3RvcnlTaXplOiBhY3RpdmF0aW9uLmhpc3RvcnlTaXplQnl0ZXM/LnRvTnVtYmVyKCkgfHwgMCxcbiAgICAgICAgY29udGludWVBc05ld1N1Z2dlc3RlZDogYWN0aXZhdGlvbi5jb250aW51ZUFzTmV3U3VnZ2VzdGVkID8/IGZhbHNlLFxuICAgICAgICBjdXJyZW50QnVpbGRJZDogYWN0aXZhdGlvbi5idWlsZElkRm9yQ3VycmVudFRhc2sgPz8gdW5kZWZpbmVkLFxuICAgICAgICB1bnNhZmU6IHtcbiAgICAgICAgICAuLi5pbmZvLnVuc2FmZSxcbiAgICAgICAgICBpc1JlcGxheWluZzogYWN0aXZhdGlvbi5pc1JlcGxheWluZyA/PyBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgIH0pKTtcbiAgICB9XG5cbiAgICAvLyBDYXN0IGZyb20gdGhlIGludGVyZmFjZSB0byB0aGUgY2xhc3Mgd2hpY2ggaGFzIHRoZSBgdmFyaWFudGAgYXR0cmlidXRlLlxuICAgIC8vIFRoaXMgaXMgc2FmZSBiZWNhdXNlIHdlIGtub3cgdGhhdCBhY3RpdmF0aW9uIGlzIGEgcHJvdG8gY2xhc3MuXG4gICAgY29uc3Qgam9icyA9IGFjdGl2YXRpb24uam9icyBhcyBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uV29ya2Zsb3dBY3RpdmF0aW9uSm9iW107XG5cbiAgICBmb3IgKGNvbnN0IGpvYiBvZiBqb2JzKSB7XG4gICAgICBpZiAoam9iLnZhcmlhbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBqb2IudmFyaWFudCB0byBiZSBkZWZpbmVkJyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHZhcmlhbnQgPSBqb2Jbam9iLnZhcmlhbnRdO1xuICAgICAgaWYgKCF2YXJpYW50KSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGpvYi4ke2pvYi52YXJpYW50fSB0byBiZSBzZXRgKTtcbiAgICAgIH1cbiAgICAgIC8vIFRoZSBvbmx5IGpvYiB0aGF0IGNhbiBiZSBleGVjdXRlZCBvbiBhIGNvbXBsZXRlZCB3b3JrZmxvdyBpcyBhIHF1ZXJ5LlxuICAgICAgLy8gV2UgbWlnaHQgZ2V0IG90aGVyIGpvYnMgYWZ0ZXIgY29tcGxldGlvbiBmb3IgaW5zdGFuY2Ugd2hlbiBhIHNpbmdsZVxuICAgICAgLy8gYWN0aXZhdGlvbiBjb250YWlucyBtdWx0aXBsZSBqb2JzIGFuZCB0aGUgZmlyc3Qgb25lIGNvbXBsZXRlcyB0aGUgd29ya2Zsb3cuXG4gICAgICBpZiAoYWN0aXZhdG9yLmNvbXBsZXRlZCAmJiBqb2IudmFyaWFudCAhPT0gJ3F1ZXJ5V29ya2Zsb3cnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGFjdGl2YXRvcltqb2IudmFyaWFudF0odmFyaWFudCBhcyBhbnkgLyogVFMgY2FuJ3QgaW5mZXIgdGhpcyB0eXBlICovKTtcbiAgICAgIGlmIChzaG91bGRVbmJsb2NrQ29uZGl0aW9ucyhqb2IpKSB7XG4gICAgICAgIHRyeVVuYmxvY2tDb25kaXRpb25zKCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgaW50ZXJjZXB0KHtcbiAgICBhY3RpdmF0aW9uLFxuICAgIGJhdGNoSW5kZXgsXG4gIH0pO1xufVxuXG4vKipcbiAqIENvbmNsdWRlIGEgc2luZ2xlIGFjdGl2YXRpb24uXG4gKiBTaG91bGQgYmUgY2FsbGVkIGFmdGVyIHByb2Nlc3NpbmcgYWxsIGFjdGl2YXRpb24gam9icyBhbmQgcXVldWVkIG1pY3JvdGFza3MuXG4gKlxuICogQWN0aXZhdGlvbiBmYWlsdXJlcyBhcmUgaGFuZGxlZCBpbiB0aGUgbWFpbiBOb2RlLmpzIGlzb2xhdGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25jbHVkZUFjdGl2YXRpb24oKTogY29yZXNkay53b3JrZmxvd19jb21wbGV0aW9uLklXb3JrZmxvd0FjdGl2YXRpb25Db21wbGV0aW9uIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIGFjdGl2YXRvci5yZWplY3RCdWZmZXJlZFVwZGF0ZXMoKTtcbiAgY29uc3QgaW50ZXJjZXB0ID0gY29tcG9zZUludGVyY2VwdG9ycyhhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLmludGVybmFscywgJ2NvbmNsdWRlQWN0aXZhdGlvbicsIChpbnB1dCkgPT4gaW5wdXQpO1xuICBjb25zdCB7IGluZm8gfSA9IGFjdGl2YXRvcjtcbiAgY29uc3QgYWN0aXZhdGlvbkNvbXBsZXRpb24gPSBhY3RpdmF0b3IuY29uY2x1ZGVBY3RpdmF0aW9uKCk7XG4gIGNvbnN0IHsgY29tbWFuZHMgfSA9IGludGVyY2VwdCh7IGNvbW1hbmRzOiBhY3RpdmF0aW9uQ29tcGxldGlvbi5jb21tYW5kcyB9KTtcblxuICByZXR1cm4ge1xuICAgIHJ1bklkOiBpbmZvLnJ1bklkLFxuICAgIHN1Y2Nlc3NmdWw6IHsgLi4uYWN0aXZhdGlvbkNvbXBsZXRpb24sIGNvbW1hbmRzIH0sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbmRSZXNldFNpbmtDYWxscygpOiBTaW5rQ2FsbFtdIHtcbiAgcmV0dXJuIGdldEFjdGl2YXRvcigpLmdldEFuZFJlc2V0U2lua0NhbGxzKCk7XG59XG5cbi8qKlxuICogTG9vcCB0aHJvdWdoIGFsbCBibG9ja2VkIGNvbmRpdGlvbnMsIGV2YWx1YXRlIGFuZCB1bmJsb2NrIGlmIHBvc3NpYmxlLlxuICpcbiAqIEByZXR1cm5zIG51bWJlciBvZiB1bmJsb2NrZWQgY29uZGl0aW9ucy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyeVVuYmxvY2tDb25kaXRpb25zKCk6IG51bWJlciB7XG4gIGxldCBudW1VbmJsb2NrZWQgPSAwO1xuICBmb3IgKDs7KSB7XG4gICAgY29uc3QgcHJldlVuYmxvY2tlZCA9IG51bVVuYmxvY2tlZDtcbiAgICBmb3IgKGNvbnN0IFtzZXEsIGNvbmRdIG9mIGdldEFjdGl2YXRvcigpLmJsb2NrZWRDb25kaXRpb25zLmVudHJpZXMoKSkge1xuICAgICAgaWYgKGNvbmQuZm4oKSkge1xuICAgICAgICBjb25kLnJlc29sdmUoKTtcbiAgICAgICAgbnVtVW5ibG9ja2VkKys7XG4gICAgICAgIC8vIEl0IGlzIHNhZmUgdG8gZGVsZXRlIGVsZW1lbnRzIGR1cmluZyBtYXAgaXRlcmF0aW9uXG4gICAgICAgIGdldEFjdGl2YXRvcigpLmJsb2NrZWRDb25kaXRpb25zLmRlbGV0ZShzZXEpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocHJldlVuYmxvY2tlZCA9PT0gbnVtVW5ibG9ja2VkKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bVVuYmxvY2tlZDtcbn1cblxuLyoqXG4gKiBQcmVkaWNhdGUgdXNlZCB0byBwcmV2ZW50IHRyaWdnZXJpbmcgY29uZGl0aW9ucyBmb3Igbm9uLXF1ZXJ5IGFuZCBub24tcGF0Y2ggam9icy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3VsZFVuYmxvY2tDb25kaXRpb25zKGpvYjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklXb3JrZmxvd0FjdGl2YXRpb25Kb2IpOiBib29sZWFuIHtcbiAgcmV0dXJuICFqb2IucXVlcnlXb3JrZmxvdyAmJiAham9iLm5vdGlmeUhhc1BhdGNoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzcG9zZSgpOiB2b2lkIHtcbiAgY29uc3QgZGlzcG9zZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoZ2V0QWN0aXZhdG9yKCkuaW50ZXJjZXB0b3JzLmludGVybmFscywgJ2Rpc3Bvc2UnLCBhc3luYyAoKSA9PiB7XG4gICAgZGlzYWJsZVN0b3JhZ2UoKTtcbiAgfSk7XG4gIGRpc3Bvc2Uoe30pO1xufVxuIiwiaW1wb3J0IHtcbiAgQWN0aXZpdHlGdW5jdGlvbixcbiAgQWN0aXZpdHlPcHRpb25zLFxuICBjb21waWxlUmV0cnlQb2xpY3ksXG4gIGV4dHJhY3RXb3JrZmxvd1R5cGUsXG4gIExvY2FsQWN0aXZpdHlPcHRpb25zLFxuICBtYXBUb1BheWxvYWRzLFxuICBRdWVyeURlZmluaXRpb24sXG4gIHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIsXG4gIFNlYXJjaEF0dHJpYnV0ZXMsXG4gIFNpZ25hbERlZmluaXRpb24sXG4gIHRvUGF5bG9hZHMsXG4gIFVudHlwZWRBY3Rpdml0aWVzLFxuICBVcGRhdGVEZWZpbml0aW9uLFxuICBXaXRoV29ya2Zsb3dBcmdzLFxuICBXb3JrZmxvdyxcbiAgV29ya2Zsb3dSZXN1bHRUeXBlLFxuICBXb3JrZmxvd1JldHVyblR5cGUsXG4gIFdvcmtmbG93VXBkYXRlVmFsaWRhdG9yVHlwZSxcbn0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IHZlcnNpb25pbmdJbnRlbnRUb1Byb3RvIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi92ZXJzaW9uaW5nLWludGVudC1lbnVtJztcbmltcG9ydCB7IER1cmF0aW9uLCBtc09wdGlvbmFsVG9UcywgbXNUb051bWJlciwgbXNUb1RzLCB0c1RvTXMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3RpbWUnO1xuaW1wb3J0IHsgY29tcG9zZUludGVyY2VwdG9ycyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7IHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgQ2FuY2VsbGF0aW9uU2NvcGUsIHJlZ2lzdGVyU2xlZXBJbXBsZW1lbnRhdGlvbiB9IGZyb20gJy4vY2FuY2VsbGF0aW9uLXNjb3BlJztcbmltcG9ydCB7XG4gIEFjdGl2aXR5SW5wdXQsXG4gIExvY2FsQWN0aXZpdHlJbnB1dCxcbiAgU2lnbmFsV29ya2Zsb3dJbnB1dCxcbiAgU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uSW5wdXQsXG4gIFRpbWVySW5wdXQsXG59IGZyb20gJy4vaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7XG4gIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLFxuICBDaGlsZFdvcmtmbG93T3B0aW9ucyxcbiAgQ2hpbGRXb3JrZmxvd09wdGlvbnNXaXRoRGVmYXVsdHMsXG4gIENvbnRpbnVlQXNOZXcsXG4gIENvbnRpbnVlQXNOZXdPcHRpb25zLFxuICBEZWZhdWx0U2lnbmFsSGFuZGxlcixcbiAgRW5oYW5jZWRTdGFja1RyYWNlLFxuICBIYW5kbGVyLFxuICBRdWVyeUhhbmRsZXJPcHRpb25zLFxuICBTaWduYWxIYW5kbGVyT3B0aW9ucyxcbiAgVXBkYXRlSGFuZGxlck9wdGlvbnMsXG4gIFdvcmtmbG93SW5mbyxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IExvY2FsQWN0aXZpdHlEb0JhY2tvZmYgfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQgeyBhc3NlcnRJbldvcmtmbG93Q29udGV4dCwgZ2V0QWN0aXZhdG9yLCBtYXliZUdldEFjdGl2YXRvciB9IGZyb20gJy4vZ2xvYmFsLWF0dHJpYnV0ZXMnO1xuaW1wb3J0IHsgdW50cmFja1Byb21pc2UgfSBmcm9tICcuL3N0YWNrLWhlbHBlcnMnO1xuaW1wb3J0IHsgQ2hpbGRXb3JrZmxvd0hhbmRsZSwgRXh0ZXJuYWxXb3JrZmxvd0hhbmRsZSB9IGZyb20gJy4vd29ya2Zsb3ctaGFuZGxlJztcblxuLy8gQXZvaWQgYSBjaXJjdWxhciBkZXBlbmRlbmN5XG5yZWdpc3RlclNsZWVwSW1wbGVtZW50YXRpb24oc2xlZXApO1xuXG4vKipcbiAqIEFkZHMgZGVmYXVsdCB2YWx1ZXMgdG8gYHdvcmtmbG93SWRgIGFuZCBgd29ya2Zsb3dJZFJldXNlUG9saWN5YCB0byBnaXZlbiB3b3JrZmxvdyBvcHRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkRGVmYXVsdFdvcmtmbG93T3B0aW9uczxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICBvcHRzOiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogQ2hpbGRXb3JrZmxvd09wdGlvbnNXaXRoRGVmYXVsdHMge1xuICBjb25zdCB7IGFyZ3MsIHdvcmtmbG93SWQsIC4uLnJlc3QgfSA9IG9wdHM7XG4gIHJldHVybiB7XG4gICAgd29ya2Zsb3dJZDogd29ya2Zsb3dJZCA/PyB1dWlkNCgpLFxuICAgIGFyZ3M6IChhcmdzID8/IFtdKSBhcyB1bmtub3duW10sXG4gICAgY2FuY2VsbGF0aW9uVHlwZTogQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUuV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVELFxuICAgIC4uLnJlc3QsXG4gIH07XG59XG5cbi8qKlxuICogUHVzaCBhIHN0YXJ0VGltZXIgY29tbWFuZCBpbnRvIHN0YXRlIGFjY3VtdWxhdG9yIGFuZCByZWdpc3RlciBjb21wbGV0aW9uXG4gKi9cbmZ1bmN0aW9uIHRpbWVyTmV4dEhhbmRsZXIoaW5wdXQ6IFRpbWVySW5wdXQpIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoIWFjdGl2YXRvci5jb21wbGV0aW9ucy50aW1lci5kZWxldGUoaW5wdXQuc2VxKSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBBbHJlYWR5IHJlc29sdmVkIG9yIG5ldmVyIHNjaGVkdWxlZFxuICAgICAgICAgIH1cbiAgICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICAgICAgY2FuY2VsVGltZXI6IHtcbiAgICAgICAgICAgICAgc2VxOiBpbnB1dC5zZXEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHN0YXJ0VGltZXI6IHtcbiAgICAgICAgc2VxOiBpbnB1dC5zZXEsXG4gICAgICAgIHN0YXJ0VG9GaXJlVGltZW91dDogbXNUb1RzKGlucHV0LmR1cmF0aW9uTXMpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMudGltZXIuc2V0KGlucHV0LnNlcSwge1xuICAgICAgcmVzb2x2ZSxcbiAgICAgIHJlamVjdCxcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogQXN5bmNocm9ub3VzIHNsZWVwLlxuICpcbiAqIFNjaGVkdWxlcyBhIHRpbWVyIG9uIHRoZSBUZW1wb3JhbCBzZXJ2aWNlLlxuICpcbiAqIEBwYXJhbSBtcyBzbGVlcCBkdXJhdGlvbiAtIG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ30uXG4gKiBJZiBnaXZlbiBhIG5lZ2F0aXZlIG51bWJlciBvciAwLCB2YWx1ZSB3aWxsIGJlIHNldCB0byAxLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2xlZXAobXM6IER1cmF0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy5zbGVlcCguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbicpO1xuICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMudGltZXIrKztcblxuICBjb25zdCBkdXJhdGlvbk1zID0gTWF0aC5tYXgoMSwgbXNUb051bWJlcihtcykpO1xuXG4gIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsICdzdGFydFRpbWVyJywgdGltZXJOZXh0SGFuZGxlcik7XG5cbiAgcmV0dXJuIGV4ZWN1dGUoe1xuICAgIGR1cmF0aW9uTXMsXG4gICAgc2VxLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVBY3Rpdml0eU9wdGlvbnMob3B0aW9uczogQWN0aXZpdHlPcHRpb25zKTogdm9pZCB7XG4gIGlmIChvcHRpb25zLnNjaGVkdWxlVG9DbG9zZVRpbWVvdXQgPT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLnN0YXJ0VG9DbG9zZVRpbWVvdXQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1JlcXVpcmVkIGVpdGhlciBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0IG9yIHN0YXJ0VG9DbG9zZVRpbWVvdXQnKTtcbiAgfVxufVxuXG4vLyBVc2Ugc2FtZSB2YWxpZGF0aW9uIHdlIHVzZSBmb3Igbm9ybWFsIGFjdGl2aXRpZXNcbmNvbnN0IHZhbGlkYXRlTG9jYWxBY3Rpdml0eU9wdGlvbnMgPSB2YWxpZGF0ZUFjdGl2aXR5T3B0aW9ucztcblxuLyoqXG4gKiBQdXNoIGEgc2NoZWR1bGVBY3Rpdml0eSBjb21tYW5kIGludG8gYWN0aXZhdG9yIGFjY3VtdWxhdG9yIGFuZCByZWdpc3RlciBjb21wbGV0aW9uXG4gKi9cbmZ1bmN0aW9uIHNjaGVkdWxlQWN0aXZpdHlOZXh0SGFuZGxlcih7IG9wdGlvbnMsIGFyZ3MsIGhlYWRlcnMsIHNlcSwgYWN0aXZpdHlUeXBlIH06IEFjdGl2aXR5SW5wdXQpOiBQcm9taXNlPHVua25vd24+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIHZhbGlkYXRlQWN0aXZpdHlPcHRpb25zKG9wdGlvbnMpO1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFhY3RpdmF0b3IuY29tcGxldGlvbnMuYWN0aXZpdHkuaGFzKHNlcSkpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gQWxyZWFkeSByZXNvbHZlZCBvciBuZXZlciBzY2hlZHVsZWRcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICAgIHJlcXVlc3RDYW5jZWxBY3Rpdml0eToge1xuICAgICAgICAgICAgICBzZXEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHNjaGVkdWxlQWN0aXZpdHk6IHtcbiAgICAgICAgc2VxLFxuICAgICAgICBhY3Rpdml0eUlkOiBvcHRpb25zLmFjdGl2aXR5SWQgPz8gYCR7c2VxfWAsXG4gICAgICAgIGFjdGl2aXR5VHlwZSxcbiAgICAgICAgYXJndW1lbnRzOiB0b1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCAuLi5hcmdzKSxcbiAgICAgICAgcmV0cnlQb2xpY3k6IG9wdGlvbnMucmV0cnkgPyBjb21waWxlUmV0cnlQb2xpY3kob3B0aW9ucy5yZXRyeSkgOiB1bmRlZmluZWQsXG4gICAgICAgIHRhc2tRdWV1ZTogb3B0aW9ucy50YXNrUXVldWUgfHwgYWN0aXZhdG9yLmluZm8udGFza1F1ZXVlLFxuICAgICAgICBoZWFydGJlYXRUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLmhlYXJ0YmVhdFRpbWVvdXQpLFxuICAgICAgICBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnNjaGVkdWxlVG9DbG9zZVRpbWVvdXQpLFxuICAgICAgICBzdGFydFRvQ2xvc2VUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnN0YXJ0VG9DbG9zZVRpbWVvdXQpLFxuICAgICAgICBzY2hlZHVsZVRvU3RhcnRUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnNjaGVkdWxlVG9TdGFydFRpbWVvdXQpLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBjYW5jZWxsYXRpb25UeXBlOiBvcHRpb25zLmNhbmNlbGxhdGlvblR5cGUsXG4gICAgICAgIGRvTm90RWFnZXJseUV4ZWN1dGU6ICEob3B0aW9ucy5hbGxvd0VhZ2VyRGlzcGF0Y2ggPz8gdHJ1ZSksXG4gICAgICAgIHZlcnNpb25pbmdJbnRlbnQ6IHZlcnNpb25pbmdJbnRlbnRUb1Byb3RvKG9wdGlvbnMudmVyc2lvbmluZ0ludGVudCksXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy5hY3Rpdml0eS5zZXQoc2VxLCB7XG4gICAgICByZXNvbHZlLFxuICAgICAgcmVqZWN0LFxuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBQdXNoIGEgc2NoZWR1bGVBY3Rpdml0eSBjb21tYW5kIGludG8gc3RhdGUgYWNjdW11bGF0b3IgYW5kIHJlZ2lzdGVyIGNvbXBsZXRpb25cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2NoZWR1bGVMb2NhbEFjdGl2aXR5TmV4dEhhbmRsZXIoe1xuICBvcHRpb25zLFxuICBhcmdzLFxuICBoZWFkZXJzLFxuICBzZXEsXG4gIGFjdGl2aXR5VHlwZSxcbiAgYXR0ZW1wdCxcbiAgb3JpZ2luYWxTY2hlZHVsZVRpbWUsXG59OiBMb2NhbEFjdGl2aXR5SW5wdXQpOiBQcm9taXNlPHVua25vd24+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIC8vIEVhZ2VybHkgZmFpbCB0aGUgbG9jYWwgYWN0aXZpdHkgKHdoaWNoIHdpbGwgaW4gdHVybiBmYWlsIHRoZSB3b3JrZmxvdyB0YXNrLlxuICAvLyBEbyBub3QgZmFpbCBvbiByZXBsYXkgd2hlcmUgdGhlIGxvY2FsIGFjdGl2aXRpZXMgbWF5IG5vdCBiZSByZWdpc3RlcmVkIG9uIHRoZSByZXBsYXkgd29ya2VyLlxuICBpZiAoIWFjdGl2YXRvci5pbmZvLnVuc2FmZS5pc1JlcGxheWluZyAmJiAhYWN0aXZhdG9yLnJlZ2lzdGVyZWRBY3Rpdml0eU5hbWVzLmhhcyhhY3Rpdml0eVR5cGUpKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBMb2NhbCBhY3Rpdml0eSBvZiB0eXBlICcke2FjdGl2aXR5VHlwZX0nIG5vdCByZWdpc3RlcmVkIG9uIHdvcmtlcmApO1xuICB9XG4gIHZhbGlkYXRlTG9jYWxBY3Rpdml0eU9wdGlvbnMob3B0aW9ucyk7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICBpZiAoc2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCkge1xuICAgICAgdW50cmFja1Byb21pc2Uoc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKHJlamVjdCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIGlmICghYWN0aXZhdG9yLmNvbXBsZXRpb25zLmFjdGl2aXR5LmhhcyhzZXEpKSB7XG4gICAgICAgICAgICByZXR1cm47IC8vIEFscmVhZHkgcmVzb2x2ZWQgb3IgbmV2ZXIgc2NoZWR1bGVkXG4gICAgICAgICAgfVxuICAgICAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgICAgICByZXF1ZXN0Q2FuY2VsTG9jYWxBY3Rpdml0eToge1xuICAgICAgICAgICAgICBzZXEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHNjaGVkdWxlTG9jYWxBY3Rpdml0eToge1xuICAgICAgICBzZXEsXG4gICAgICAgIGF0dGVtcHQsXG4gICAgICAgIG9yaWdpbmFsU2NoZWR1bGVUaW1lLFxuICAgICAgICAvLyBJbnRlbnRpb25hbGx5IG5vdCBleHBvc2luZyBhY3Rpdml0eUlkIGFzIGFuIG9wdGlvblxuICAgICAgICBhY3Rpdml0eUlkOiBgJHtzZXF9YCxcbiAgICAgICAgYWN0aXZpdHlUeXBlLFxuICAgICAgICBhcmd1bWVudHM6IHRvUGF5bG9hZHMoYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsIC4uLmFyZ3MpLFxuICAgICAgICByZXRyeVBvbGljeTogb3B0aW9ucy5yZXRyeSA/IGNvbXBpbGVSZXRyeVBvbGljeShvcHRpb25zLnJldHJ5KSA6IHVuZGVmaW5lZCxcbiAgICAgICAgc2NoZWR1bGVUb0Nsb3NlVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5zY2hlZHVsZVRvQ2xvc2VUaW1lb3V0KSxcbiAgICAgICAgc3RhcnRUb0Nsb3NlVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5zdGFydFRvQ2xvc2VUaW1lb3V0KSxcbiAgICAgICAgc2NoZWR1bGVUb1N0YXJ0VGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5zY2hlZHVsZVRvU3RhcnRUaW1lb3V0KSxcbiAgICAgICAgbG9jYWxSZXRyeVRocmVzaG9sZDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5sb2NhbFJldHJ5VGhyZXNob2xkKSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgY2FuY2VsbGF0aW9uVHlwZTogb3B0aW9ucy5jYW5jZWxsYXRpb25UeXBlLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuYWN0aXZpdHkuc2V0KHNlcSwge1xuICAgICAgcmVzb2x2ZSxcbiAgICAgIHJlamVjdCxcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogU2NoZWR1bGUgYW4gYWN0aXZpdHkgYW5kIHJ1biBvdXRib3VuZCBpbnRlcmNlcHRvcnNcbiAqIEBoaWRkZW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjaGVkdWxlQWN0aXZpdHk8Uj4oYWN0aXZpdHlUeXBlOiBzdHJpbmcsIGFyZ3M6IGFueVtdLCBvcHRpb25zOiBBY3Rpdml0eU9wdGlvbnMpOiBQcm9taXNlPFI+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LnNjaGVkdWxlQWN0aXZpdHkoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24nXG4gICk7XG4gIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgZW1wdHkgYWN0aXZpdHkgb3B0aW9ucycpO1xuICB9XG4gIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy5hY3Rpdml0eSsrO1xuICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLCAnc2NoZWR1bGVBY3Rpdml0eScsIHNjaGVkdWxlQWN0aXZpdHlOZXh0SGFuZGxlcik7XG5cbiAgcmV0dXJuIGV4ZWN1dGUoe1xuICAgIGFjdGl2aXR5VHlwZSxcbiAgICBoZWFkZXJzOiB7fSxcbiAgICBvcHRpb25zLFxuICAgIGFyZ3MsXG4gICAgc2VxLFxuICB9KSBhcyBQcm9taXNlPFI+O1xufVxuXG4vKipcbiAqIFNjaGVkdWxlIGFuIGFjdGl2aXR5IGFuZCBydW4gb3V0Ym91bmQgaW50ZXJjZXB0b3JzXG4gKiBAaGlkZGVuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzY2hlZHVsZUxvY2FsQWN0aXZpdHk8Uj4oXG4gIGFjdGl2aXR5VHlwZTogc3RyaW5nLFxuICBhcmdzOiBhbnlbXSxcbiAgb3B0aW9uczogTG9jYWxBY3Rpdml0eU9wdGlvbnNcbik6IFByb21pc2U8Uj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuc2NoZWR1bGVMb2NhbEFjdGl2aXR5KC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uJ1xuICApO1xuICBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IGVtcHR5IGFjdGl2aXR5IG9wdGlvbnMnKTtcbiAgfVxuXG4gIGxldCBhdHRlbXB0ID0gMTtcbiAgbGV0IG9yaWdpbmFsU2NoZWR1bGVUaW1lID0gdW5kZWZpbmVkO1xuXG4gIGZvciAoOzspIHtcbiAgICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMuYWN0aXZpdHkrKztcbiAgICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsXG4gICAgICAnc2NoZWR1bGVMb2NhbEFjdGl2aXR5JyxcbiAgICAgIHNjaGVkdWxlTG9jYWxBY3Rpdml0eU5leHRIYW5kbGVyXG4gICAgKTtcblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gKGF3YWl0IGV4ZWN1dGUoe1xuICAgICAgICBhY3Rpdml0eVR5cGUsXG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgICBvcHRpb25zLFxuICAgICAgICBhcmdzLFxuICAgICAgICBzZXEsXG4gICAgICAgIGF0dGVtcHQsXG4gICAgICAgIG9yaWdpbmFsU2NoZWR1bGVUaW1lLFxuICAgICAgfSkpIGFzIFByb21pc2U8Uj47XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgTG9jYWxBY3Rpdml0eURvQmFja29mZikge1xuICAgICAgICBhd2FpdCBzbGVlcCh0c1RvTXMoZXJyLmJhY2tvZmYuYmFja29mZkR1cmF0aW9uKSk7XG4gICAgICAgIGlmICh0eXBlb2YgZXJyLmJhY2tvZmYuYXR0ZW1wdCAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGJhY2tvZmYgYXR0ZW1wdCB0eXBlJyk7XG4gICAgICAgIH1cbiAgICAgICAgYXR0ZW1wdCA9IGVyci5iYWNrb2ZmLmF0dGVtcHQ7XG4gICAgICAgIG9yaWdpbmFsU2NoZWR1bGVUaW1lID0gZXJyLmJhY2tvZmYub3JpZ2luYWxTY2hlZHVsZVRpbWUgPz8gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25OZXh0SGFuZGxlcih7XG4gIG9wdGlvbnMsXG4gIGhlYWRlcnMsXG4gIHdvcmtmbG93VHlwZSxcbiAgc2VxLFxufTogU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uSW5wdXQpOiBQcm9taXNlPFtQcm9taXNlPHN0cmluZz4sIFByb21pc2U8dW5rbm93bj5dPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICBjb25zdCB3b3JrZmxvd0lkID0gb3B0aW9ucy53b3JrZmxvd0lkID8/IHV1aWQ0KCk7XG4gIGNvbnN0IHN0YXJ0UHJvbWlzZSA9IG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgY29uc3QgY29tcGxldGUgPSAhYWN0aXZhdG9yLmNvbXBsZXRpb25zLmNoaWxkV29ya2Zsb3dDb21wbGV0ZS5oYXMoc2VxKTtcblxuICAgICAgICAgIGlmICghY29tcGxldGUpIHtcbiAgICAgICAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgICAgICAgIGNhbmNlbENoaWxkV29ya2Zsb3dFeGVjdXRpb246IHsgY2hpbGRXb3JrZmxvd1NlcTogc2VxIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gTm90aGluZyB0byBjYW5jZWwgb3RoZXJ3aXNlXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgIHNlcSxcbiAgICAgICAgd29ya2Zsb3dJZCxcbiAgICAgICAgd29ya2Zsb3dUeXBlLFxuICAgICAgICBpbnB1dDogdG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgLi4ub3B0aW9ucy5hcmdzKSxcbiAgICAgICAgcmV0cnlQb2xpY3k6IG9wdGlvbnMucmV0cnkgPyBjb21waWxlUmV0cnlQb2xpY3kob3B0aW9ucy5yZXRyeSkgOiB1bmRlZmluZWQsXG4gICAgICAgIHRhc2tRdWV1ZTogb3B0aW9ucy50YXNrUXVldWUgfHwgYWN0aXZhdG9yLmluZm8udGFza1F1ZXVlLFxuICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvblRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMud29ya2Zsb3dFeGVjdXRpb25UaW1lb3V0KSxcbiAgICAgICAgd29ya2Zsb3dSdW5UaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLndvcmtmbG93UnVuVGltZW91dCksXG4gICAgICAgIHdvcmtmbG93VGFza1RpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMud29ya2Zsb3dUYXNrVGltZW91dCksXG4gICAgICAgIG5hbWVzcGFjZTogYWN0aXZhdG9yLmluZm8ubmFtZXNwYWNlLCAvLyBOb3QgY29uZmlndXJhYmxlXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIGNhbmNlbGxhdGlvblR5cGU6IG9wdGlvbnMuY2FuY2VsbGF0aW9uVHlwZSxcbiAgICAgICAgd29ya2Zsb3dJZFJldXNlUG9saWN5OiBvcHRpb25zLndvcmtmbG93SWRSZXVzZVBvbGljeSxcbiAgICAgICAgcGFyZW50Q2xvc2VQb2xpY3k6IG9wdGlvbnMucGFyZW50Q2xvc2VQb2xpY3ksXG4gICAgICAgIGNyb25TY2hlZHVsZTogb3B0aW9ucy5jcm9uU2NoZWR1bGUsXG4gICAgICAgIHNlYXJjaEF0dHJpYnV0ZXM6IG9wdGlvbnMuc2VhcmNoQXR0cmlidXRlc1xuICAgICAgICAgID8gbWFwVG9QYXlsb2FkcyhzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyLCBvcHRpb25zLnNlYXJjaEF0dHJpYnV0ZXMpXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIG1lbW86IG9wdGlvbnMubWVtbyAmJiBtYXBUb1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCBvcHRpb25zLm1lbW8pLFxuICAgICAgICB2ZXJzaW9uaW5nSW50ZW50OiB2ZXJzaW9uaW5nSW50ZW50VG9Qcm90byhvcHRpb25zLnZlcnNpb25pbmdJbnRlbnQpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuY2hpbGRXb3JrZmxvd1N0YXJ0LnNldChzZXEsIHtcbiAgICAgIHJlc29sdmUsXG4gICAgICByZWplY3QsXG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIFdlIGNvbnN0cnVjdCBhIFByb21pc2UgZm9yIHRoZSBjb21wbGV0aW9uIG9mIHRoZSBjaGlsZCBXb3JrZmxvdyBiZWZvcmUgd2Uga25vd1xuICAvLyBpZiB0aGUgV29ya2Zsb3cgY29kZSB3aWxsIGF3YWl0IGl0IHRvIGNhcHR1cmUgdGhlIHJlc3VsdCBpbiBjYXNlIGl0IGRvZXMuXG4gIGNvbnN0IGNvbXBsZXRlUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAvLyBDaGFpbiBzdGFydCBQcm9taXNlIHJlamVjdGlvbiB0byB0aGUgY29tcGxldGUgUHJvbWlzZS5cbiAgICB1bnRyYWNrUHJvbWlzZShzdGFydFByb21pc2UuY2F0Y2gocmVqZWN0KSk7XG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLmNoaWxkV29ya2Zsb3dDb21wbGV0ZS5zZXQoc2VxLCB7XG4gICAgICByZXNvbHZlLFxuICAgICAgcmVqZWN0LFxuICAgIH0pO1xuICB9KTtcbiAgdW50cmFja1Byb21pc2Uoc3RhcnRQcm9taXNlKTtcbiAgdW50cmFja1Byb21pc2UoY29tcGxldGVQcm9taXNlKTtcbiAgLy8gUHJldmVudCB1bmhhbmRsZWQgcmVqZWN0aW9uIGJlY2F1c2UgdGhlIGNvbXBsZXRpb24gbWlnaHQgbm90IGJlIGF3YWl0ZWRcbiAgdW50cmFja1Byb21pc2UoY29tcGxldGVQcm9taXNlLmNhdGNoKCgpID0+IHVuZGVmaW5lZCkpO1xuICBjb25zdCByZXQgPSBuZXcgUHJvbWlzZTxbUHJvbWlzZTxzdHJpbmc+LCBQcm9taXNlPHVua25vd24+XT4oKHJlc29sdmUpID0+IHJlc29sdmUoW3N0YXJ0UHJvbWlzZSwgY29tcGxldGVQcm9taXNlXSkpO1xuICB1bnRyYWNrUHJvbWlzZShyZXQpO1xuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBzaWduYWxXb3JrZmxvd05leHRIYW5kbGVyKHsgc2VxLCBzaWduYWxOYW1lLCBhcmdzLCB0YXJnZXQsIGhlYWRlcnMgfTogU2lnbmFsV29ya2Zsb3dJbnB1dCkge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICBpZiAoIWFjdGl2YXRvci5jb21wbGV0aW9ucy5zaWduYWxXb3JrZmxvdy5oYXMoc2VxKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoeyBjYW5jZWxTaWduYWxXb3JrZmxvdzogeyBzZXEgfSB9KTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICBzaWduYWxFeHRlcm5hbFdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgIHNlcSxcbiAgICAgICAgYXJnczogdG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgLi4uYXJncyksXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIHNpZ25hbE5hbWUsXG4gICAgICAgIC4uLih0YXJnZXQudHlwZSA9PT0gJ2V4dGVybmFsJ1xuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogYWN0aXZhdG9yLmluZm8ubmFtZXNwYWNlLFxuICAgICAgICAgICAgICAgIC4uLnRhcmdldC53b3JrZmxvd0V4ZWN1dGlvbixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgY2hpbGRXb3JrZmxvd0lkOiB0YXJnZXQuY2hpbGRXb3JrZmxvd0lkLFxuICAgICAgICAgICAgfSksXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLnNpZ25hbFdvcmtmbG93LnNldChzZXEsIHsgcmVzb2x2ZSwgcmVqZWN0IH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBTeW1ib2wgdXNlZCBpbiB0aGUgcmV0dXJuIHR5cGUgb2YgcHJveHkgbWV0aG9kcyB0byBtYXJrIHRoYXQgYW4gYXR0cmlidXRlIG9uIHRoZSBzb3VyY2UgdHlwZSBpcyBub3QgYSBtZXRob2QuXG4gKlxuICogQHNlZSB7QGxpbmsgQWN0aXZpdHlJbnRlcmZhY2VGb3J9XG4gKiBAc2VlIHtAbGluayBwcm94eUFjdGl2aXRpZXN9XG4gKiBAc2VlIHtAbGluayBwcm94eUxvY2FsQWN0aXZpdGllc31cbiAqL1xuZXhwb3J0IGNvbnN0IE5vdEFuQWN0aXZpdHlNZXRob2QgPSBTeW1ib2wuZm9yKCdfX1RFTVBPUkFMX05PVF9BTl9BQ1RJVklUWV9NRVRIT0QnKTtcblxuLyoqXG4gKiBUeXBlIGhlbHBlciB0aGF0IHRha2VzIGEgdHlwZSBgVGAgYW5kIHRyYW5zZm9ybXMgYXR0cmlidXRlcyB0aGF0IGFyZSBub3Qge0BsaW5rIEFjdGl2aXR5RnVuY3Rpb259IHRvXG4gKiB7QGxpbmsgTm90QW5BY3Rpdml0eU1ldGhvZH0uXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiBVc2VkIGJ5IHtAbGluayBwcm94eUFjdGl2aXRpZXN9IHRvIGdldCB0aGlzIGNvbXBpbGUtdGltZSBlcnJvcjpcbiAqXG4gKiBgYGB0c1xuICogaW50ZXJmYWNlIE15QWN0aXZpdGllcyB7XG4gKiAgIHZhbGlkKGlucHV0OiBudW1iZXIpOiBQcm9taXNlPG51bWJlcj47XG4gKiAgIGludmFsaWQoaW5wdXQ6IG51bWJlcik6IG51bWJlcjtcbiAqIH1cbiAqXG4gKiBjb25zdCBhY3QgPSBwcm94eUFjdGl2aXRpZXM8TXlBY3Rpdml0aWVzPih7IHN0YXJ0VG9DbG9zZVRpbWVvdXQ6ICc1bScgfSk7XG4gKlxuICogYXdhaXQgYWN0LnZhbGlkKHRydWUpO1xuICogYXdhaXQgYWN0LmludmFsaWQoKTtcbiAqIC8vIF4gVFMgY29tcGxhaW5zIHdpdGg6XG4gKiAvLyAocHJvcGVydHkpIGludmFsaWREZWZpbml0aW9uOiB0eXBlb2YgTm90QW5BY3Rpdml0eU1ldGhvZFxuICogLy8gVGhpcyBleHByZXNzaW9uIGlzIG5vdCBjYWxsYWJsZS5cbiAqIC8vIFR5cGUgJ1N5bWJvbCcgaGFzIG5vIGNhbGwgc2lnbmF0dXJlcy4oMjM0OSlcbiAqIGBgYFxuICovXG5leHBvcnQgdHlwZSBBY3Rpdml0eUludGVyZmFjZUZvcjxUPiA9IHtcbiAgW0sgaW4ga2V5b2YgVF06IFRbS10gZXh0ZW5kcyBBY3Rpdml0eUZ1bmN0aW9uID8gVFtLXSA6IHR5cGVvZiBOb3RBbkFjdGl2aXR5TWV0aG9kO1xufTtcblxuLyoqXG4gKiBDb25maWd1cmUgQWN0aXZpdHkgZnVuY3Rpb25zIHdpdGggZ2l2ZW4ge0BsaW5rIEFjdGl2aXR5T3B0aW9uc30uXG4gKlxuICogVGhpcyBtZXRob2QgbWF5IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB0byBzZXR1cCBBY3Rpdml0aWVzIHdpdGggZGlmZmVyZW50IG9wdGlvbnMuXG4gKlxuICogQHJldHVybiBhIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Qcm94eSB8IFByb3h5fSBmb3JcbiAqICAgICAgICAgd2hpY2ggZWFjaCBhdHRyaWJ1dGUgaXMgYSBjYWxsYWJsZSBBY3Rpdml0eSBmdW5jdGlvblxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcHJveHlBY3Rpdml0aWVzIH0gZnJvbSAnQHRlbXBvcmFsaW8vd29ya2Zsb3cnO1xuICogaW1wb3J0ICogYXMgYWN0aXZpdGllcyBmcm9tICcuLi9hY3Rpdml0aWVzJztcbiAqXG4gKiAvLyBTZXR1cCBBY3Rpdml0aWVzIGZyb20gbW9kdWxlIGV4cG9ydHNcbiAqIGNvbnN0IHsgaHR0cEdldCwgb3RoZXJBY3Rpdml0eSB9ID0gcHJveHlBY3Rpdml0aWVzPHR5cGVvZiBhY3Rpdml0aWVzPih7XG4gKiAgIHN0YXJ0VG9DbG9zZVRpbWVvdXQ6ICczMCBtaW51dGVzJyxcbiAqIH0pO1xuICpcbiAqIC8vIFNldHVwIEFjdGl2aXRpZXMgZnJvbSBhbiBleHBsaWNpdCBpbnRlcmZhY2UgKGUuZy4gd2hlbiBkZWZpbmVkIGJ5IGFub3RoZXIgU0RLKVxuICogaW50ZXJmYWNlIEphdmFBY3Rpdml0aWVzIHtcbiAqICAgaHR0cEdldEZyb21KYXZhKHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+XG4gKiAgIHNvbWVPdGhlckphdmFBY3Rpdml0eShhcmcxOiBudW1iZXIsIGFyZzI6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPjtcbiAqIH1cbiAqXG4gKiBjb25zdCB7XG4gKiAgIGh0dHBHZXRGcm9tSmF2YSxcbiAqICAgc29tZU90aGVySmF2YUFjdGl2aXR5XG4gKiB9ID0gcHJveHlBY3Rpdml0aWVzPEphdmFBY3Rpdml0aWVzPih7XG4gKiAgIHRhc2tRdWV1ZTogJ2phdmEtd29ya2VyLXRhc2tRdWV1ZScsXG4gKiAgIHN0YXJ0VG9DbG9zZVRpbWVvdXQ6ICc1bScsXG4gKiB9KTtcbiAqXG4gKiBleHBvcnQgZnVuY3Rpb24gZXhlY3V0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAqICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBodHRwR2V0KFwiaHR0cDovL2V4YW1wbGUuY29tXCIpO1xuICogICAvLyAuLi5cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJveHlBY3Rpdml0aWVzPEEgPSBVbnR5cGVkQWN0aXZpdGllcz4ob3B0aW9uczogQWN0aXZpdHlPcHRpb25zKTogQWN0aXZpdHlJbnRlcmZhY2VGb3I8QT4ge1xuICBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9ucyBtdXN0IGJlIGRlZmluZWQnKTtcbiAgfVxuICAvLyBWYWxpZGF0ZSBhcyBlYXJseSBhcyBwb3NzaWJsZSBmb3IgaW1tZWRpYXRlIHVzZXIgZmVlZGJhY2tcbiAgdmFsaWRhdGVBY3Rpdml0eU9wdGlvbnMob3B0aW9ucyk7XG4gIHJldHVybiBuZXcgUHJveHkoXG4gICAge30sXG4gICAge1xuICAgICAgZ2V0KF8sIGFjdGl2aXR5VHlwZSkge1xuICAgICAgICBpZiAodHlwZW9mIGFjdGl2aXR5VHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBPbmx5IHN0cmluZ3MgYXJlIHN1cHBvcnRlZCBmb3IgQWN0aXZpdHkgdHlwZXMsIGdvdDogJHtTdHJpbmcoYWN0aXZpdHlUeXBlKX1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gYWN0aXZpdHlQcm94eUZ1bmN0aW9uKC4uLmFyZ3M6IHVua25vd25bXSk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgICAgICAgIHJldHVybiBzY2hlZHVsZUFjdGl2aXR5KGFjdGl2aXR5VHlwZSwgYXJncywgb3B0aW9ucyk7XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgIH1cbiAgKSBhcyBhbnk7XG59XG5cbi8qKlxuICogQ29uZmlndXJlIExvY2FsIEFjdGl2aXR5IGZ1bmN0aW9ucyB3aXRoIGdpdmVuIHtAbGluayBMb2NhbEFjdGl2aXR5T3B0aW9uc30uXG4gKlxuICogVGhpcyBtZXRob2QgbWF5IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB0byBzZXR1cCBBY3Rpdml0aWVzIHdpdGggZGlmZmVyZW50IG9wdGlvbnMuXG4gKlxuICogQHJldHVybiBhIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Qcm94eSB8IFByb3h5fVxuICogICAgICAgICBmb3Igd2hpY2ggZWFjaCBhdHRyaWJ1dGUgaXMgYSBjYWxsYWJsZSBBY3Rpdml0eSBmdW5jdGlvblxuICpcbiAqIEBzZWUge0BsaW5rIHByb3h5QWN0aXZpdGllc30gZm9yIGV4YW1wbGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm94eUxvY2FsQWN0aXZpdGllczxBID0gVW50eXBlZEFjdGl2aXRpZXM+KG9wdGlvbnM6IExvY2FsQWN0aXZpdHlPcHRpb25zKTogQWN0aXZpdHlJbnRlcmZhY2VGb3I8QT4ge1xuICBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9ucyBtdXN0IGJlIGRlZmluZWQnKTtcbiAgfVxuICAvLyBWYWxpZGF0ZSBhcyBlYXJseSBhcyBwb3NzaWJsZSBmb3IgaW1tZWRpYXRlIHVzZXIgZmVlZGJhY2tcbiAgdmFsaWRhdGVMb2NhbEFjdGl2aXR5T3B0aW9ucyhvcHRpb25zKTtcbiAgcmV0dXJuIG5ldyBQcm94eShcbiAgICB7fSxcbiAgICB7XG4gICAgICBnZXQoXywgYWN0aXZpdHlUeXBlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYWN0aXZpdHlUeXBlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYE9ubHkgc3RyaW5ncyBhcmUgc3VwcG9ydGVkIGZvciBBY3Rpdml0eSB0eXBlcywgZ290OiAke1N0cmluZyhhY3Rpdml0eVR5cGUpfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBsb2NhbEFjdGl2aXR5UHJveHlGdW5jdGlvbiguLi5hcmdzOiB1bmtub3duW10pIHtcbiAgICAgICAgICByZXR1cm4gc2NoZWR1bGVMb2NhbEFjdGl2aXR5KGFjdGl2aXR5VHlwZSwgYXJncywgb3B0aW9ucyk7XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgIH1cbiAgKSBhcyBhbnk7XG59XG5cbi8vIFRPRE86IGRlcHJlY2F0ZSB0aGlzIHBhdGNoIGFmdGVyIFwiZW5vdWdoXCIgdGltZSBoYXMgcGFzc2VkXG5jb25zdCBFWFRFUk5BTF9XRl9DQU5DRUxfUEFUQ0ggPSAnX190ZW1wb3JhbF9pbnRlcm5hbF9jb25uZWN0X2V4dGVybmFsX2hhbmRsZV9jYW5jZWxfdG9fc2NvcGUnO1xuLy8gVGhlIG5hbWUgb2YgdGhpcyBwYXRjaCBjb21lcyBmcm9tIGFuIGF0dGVtcHQgdG8gYnVpbGQgYSBnZW5lcmljIGludGVybmFsIHBhdGNoaW5nIG1lY2hhbmlzbS5cbi8vIFRoYXQgZWZmb3J0IGhhcyBiZWVuIGFiYW5kb25lZCBpbiBmYXZvciBvZiBhIG5ld2VyIFdvcmtmbG93VGFza0NvbXBsZXRlZE1ldGFkYXRhIGJhc2VkIG1lY2hhbmlzbS5cbmNvbnN0IENPTkRJVElPTl8wX1BBVENIID0gJ19fc2RrX2ludGVybmFsX3BhdGNoX251bWJlcjoxJztcblxuLyoqXG4gKiBSZXR1cm5zIGEgY2xpZW50LXNpZGUgaGFuZGxlIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2lnbmFsIGFuZCBjYW5jZWwgYW4gZXhpc3RpbmcgV29ya2Zsb3cgZXhlY3V0aW9uLlxuICogSXQgdGFrZXMgYSBXb3JrZmxvdyBJRCBhbmQgb3B0aW9uYWwgcnVuIElELlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXh0ZXJuYWxXb3JrZmxvd0hhbmRsZSh3b3JrZmxvd0lkOiBzdHJpbmcsIHJ1bklkPzogc3RyaW5nKTogRXh0ZXJuYWxXb3JrZmxvd0hhbmRsZSB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5nZXRFeHRlcm5hbFdvcmtmbG93SGFuZGxlKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLiBDb25zaWRlciB1c2luZyBDbGllbnQud29ya2Zsb3cuZ2V0SGFuZGxlKC4uLikgaW5zdGVhZC4pJ1xuICApO1xuICByZXR1cm4ge1xuICAgIHdvcmtmbG93SWQsXG4gICAgcnVuSWQsXG4gICAgY2FuY2VsKCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgLy8gQ29ubmVjdCB0aGlzIGNhbmNlbCBvcGVyYXRpb24gdG8gdGhlIGN1cnJlbnQgY2FuY2VsbGF0aW9uIHNjb3BlLlxuICAgICAgICAvLyBUaGlzIGlzIGJlaGF2aW9yIHdhcyBpbnRyb2R1Y2VkIGFmdGVyIHYwLjIyLjAgYW5kIGlzIGluY29tcGF0aWJsZVxuICAgICAgICAvLyB3aXRoIGhpc3RvcmllcyBnZW5lcmF0ZWQgd2l0aCBwcmV2aW91cyBTREsgdmVyc2lvbnMgYW5kIHRodXMgcmVxdWlyZXNcbiAgICAgICAgLy8gcGF0Y2hpbmcuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFdlIHRyeSB0byBkZWxheSBwYXRjaGluZyBhcyBtdWNoIGFzIHBvc3NpYmxlIHRvIGF2b2lkIHBvbGx1dGluZ1xuICAgICAgICAvLyBoaXN0b3JpZXMgdW5sZXNzIHN0cmljdGx5IHJlcXVpcmVkLlxuICAgICAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICAgICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICBpZiAocGF0Y2hlZChFWFRFUk5BTF9XRl9DQU5DRUxfUEFUQ0gpKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCkge1xuICAgICAgICAgIGlmIChwYXRjaGVkKEVYVEVSTkFMX1dGX0NBTkNFTF9QQVRDSCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMuY2FuY2VsV29ya2Zsb3crKztcbiAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICByZXF1ZXN0Q2FuY2VsRXh0ZXJuYWxXb3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICAgICAgc2VxLFxuICAgICAgICAgICAgd29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgICAgICAgbmFtZXNwYWNlOiBhY3RpdmF0b3IuaW5mby5uYW1lc3BhY2UsXG4gICAgICAgICAgICAgIHdvcmtmbG93SWQsXG4gICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLmNhbmNlbFdvcmtmbG93LnNldChzZXEsIHsgcmVzb2x2ZSwgcmVqZWN0IH0pO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBzaWduYWw8QXJncyBleHRlbmRzIGFueVtdPihkZWY6IFNpZ25hbERlZmluaXRpb248QXJncz4gfCBzdHJpbmcsIC4uLmFyZ3M6IEFyZ3MpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgIHJldHVybiBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLFxuICAgICAgICAnc2lnbmFsV29ya2Zsb3cnLFxuICAgICAgICBzaWduYWxXb3JrZmxvd05leHRIYW5kbGVyXG4gICAgICApKHtcbiAgICAgICAgc2VxOiBhY3RpdmF0b3IubmV4dFNlcXMuc2lnbmFsV29ya2Zsb3crKyxcbiAgICAgICAgc2lnbmFsTmFtZTogdHlwZW9mIGRlZiA9PT0gJ3N0cmluZycgPyBkZWYgOiBkZWYubmFtZSxcbiAgICAgICAgYXJncyxcbiAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgdHlwZTogJ2V4dGVybmFsJyxcbiAgICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvbjogeyB3b3JrZmxvd0lkLCBydW5JZCB9LFxuICAgICAgICB9LFxuICAgICAgICBoZWFkZXJzOiB7fSxcbiAgICAgIH0pO1xuICAgIH0sXG4gIH07XG59XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb25cbiAqXG4gKiAtIFJldHVybnMgYSBjbGllbnQtc2lkZSBoYW5kbGUgdGhhdCBpbXBsZW1lbnRzIGEgY2hpbGQgV29ya2Zsb3cgaW50ZXJmYWNlLlxuICogLSBCeSBkZWZhdWx0LCBhIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqXG4gKiBBIGNoaWxkIFdvcmtmbG93IGhhbmRsZSBzdXBwb3J0cyBhd2FpdGluZyBjb21wbGV0aW9uLCBzaWduYWxpbmcgYW5kIGNhbmNlbGxhdGlvbiB2aWEge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKiBJbiBvcmRlciB0byBxdWVyeSB0aGUgY2hpbGQsIHVzZSBhIHtAbGluayBXb3JrZmxvd0NsaWVudH0gZnJvbSBhbiBBY3Rpdml0eS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0Q2hpbGQ8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgd29ya2Zsb3dUeXBlOiBzdHJpbmcsXG4gIG9wdGlvbnM6IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPENoaWxkV29ya2Zsb3dIYW5kbGU8VD4+O1xuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uXG4gKlxuICogLSBSZXR1cm5zIGEgY2xpZW50LXNpZGUgaGFuZGxlIHRoYXQgaW1wbGVtZW50cyBhIGNoaWxkIFdvcmtmbG93IGludGVyZmFjZS5cbiAqIC0gRGVkdWNlcyB0aGUgV29ya2Zsb3cgdHlwZSBhbmQgc2lnbmF0dXJlIGZyb20gcHJvdmlkZWQgV29ya2Zsb3cgZnVuY3Rpb24uXG4gKiAtIEJ5IGRlZmF1bHQsIGEgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICpcbiAqIEEgY2hpbGQgV29ya2Zsb3cgaGFuZGxlIHN1cHBvcnRzIGF3YWl0aW5nIGNvbXBsZXRpb24sIHNpZ25hbGluZyBhbmQgY2FuY2VsbGF0aW9uIHZpYSB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqIEluIG9yZGVyIHRvIHF1ZXJ5IHRoZSBjaGlsZCwgdXNlIGEge0BsaW5rIFdvcmtmbG93Q2xpZW50fSBmcm9tIGFuIEFjdGl2aXR5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd0Z1bmM6IFQsXG4gIG9wdGlvbnM6IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPENoaWxkV29ya2Zsb3dIYW5kbGU8VD4+O1xuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uXG4gKlxuICogKipPdmVycmlkZSBmb3IgV29ya2Zsb3dzIHRoYXQgYWNjZXB0IG5vIGFyZ3VtZW50cyoqLlxuICpcbiAqIC0gUmV0dXJucyBhIGNsaWVudC1zaWRlIGhhbmRsZSB0aGF0IGltcGxlbWVudHMgYSBjaGlsZCBXb3JrZmxvdyBpbnRlcmZhY2UuXG4gKiAtIFRoZSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKlxuICogQSBjaGlsZCBXb3JrZmxvdyBoYW5kbGUgc3VwcG9ydHMgYXdhaXRpbmcgY29tcGxldGlvbiwgc2lnbmFsaW5nIGFuZCBjYW5jZWxsYXRpb24gdmlhIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICogSW4gb3JkZXIgdG8gcXVlcnkgdGhlIGNoaWxkLCB1c2UgYSB7QGxpbmsgV29ya2Zsb3dDbGllbnR9IGZyb20gYW4gQWN0aXZpdHkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydENoaWxkPFQgZXh0ZW5kcyAoKSA9PiBQcm9taXNlPGFueT4+KHdvcmtmbG93VHlwZTogc3RyaW5nKTogUHJvbWlzZTxDaGlsZFdvcmtmbG93SGFuZGxlPFQ+PjtcblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvblxuICpcbiAqICoqT3ZlcnJpZGUgZm9yIFdvcmtmbG93cyB0aGF0IGFjY2VwdCBubyBhcmd1bWVudHMqKi5cbiAqXG4gKiAtIFJldHVybnMgYSBjbGllbnQtc2lkZSBoYW5kbGUgdGhhdCBpbXBsZW1lbnRzIGEgY2hpbGQgV29ya2Zsb3cgaW50ZXJmYWNlLlxuICogLSBEZWR1Y2VzIHRoZSBXb3JrZmxvdyB0eXBlIGFuZCBzaWduYXR1cmUgZnJvbSBwcm92aWRlZCBXb3JrZmxvdyBmdW5jdGlvbi5cbiAqIC0gVGhlIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqXG4gKiBBIGNoaWxkIFdvcmtmbG93IGhhbmRsZSBzdXBwb3J0cyBhd2FpdGluZyBjb21wbGV0aW9uLCBzaWduYWxpbmcgYW5kIGNhbmNlbGxhdGlvbiB2aWEge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKiBJbiBvcmRlciB0byBxdWVyeSB0aGUgY2hpbGQsIHVzZSBhIHtAbGluayBXb3JrZmxvd0NsaWVudH0gZnJvbSBhbiBBY3Rpdml0eS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0Q2hpbGQ8VCBleHRlbmRzICgpID0+IFByb21pc2U8YW55Pj4od29ya2Zsb3dGdW5jOiBUKTogUHJvbWlzZTxDaGlsZFdvcmtmbG93SGFuZGxlPFQ+PjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0Q2hpbGQ8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgd29ya2Zsb3dUeXBlT3JGdW5jOiBzdHJpbmcgfCBULFxuICBvcHRpb25zPzogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IFByb21pc2U8Q2hpbGRXb3JrZmxvd0hhbmRsZTxUPj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuc3RhcnRDaGlsZCguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4gQ29uc2lkZXIgdXNpbmcgQ2xpZW50LndvcmtmbG93LnN0YXJ0KC4uLikgaW5zdGVhZC4pJ1xuICApO1xuICBjb25zdCBvcHRpb25zV2l0aERlZmF1bHRzID0gYWRkRGVmYXVsdFdvcmtmbG93T3B0aW9ucyhvcHRpb25zID8/ICh7fSBhcyBhbnkpKTtcbiAgY29uc3Qgd29ya2Zsb3dUeXBlID0gZXh0cmFjdFdvcmtmbG93VHlwZSh3b3JrZmxvd1R5cGVPckZ1bmMpO1xuICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLFxuICAgICdzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb24nLFxuICAgIHN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbk5leHRIYW5kbGVyXG4gICk7XG4gIGNvbnN0IFtzdGFydGVkLCBjb21wbGV0ZWRdID0gYXdhaXQgZXhlY3V0ZSh7XG4gICAgc2VxOiBhY3RpdmF0b3IubmV4dFNlcXMuY2hpbGRXb3JrZmxvdysrLFxuICAgIG9wdGlvbnM6IG9wdGlvbnNXaXRoRGVmYXVsdHMsXG4gICAgaGVhZGVyczoge30sXG4gICAgd29ya2Zsb3dUeXBlLFxuICB9KTtcbiAgY29uc3QgZmlyc3RFeGVjdXRpb25SdW5JZCA9IGF3YWl0IHN0YXJ0ZWQ7XG5cbiAgcmV0dXJuIHtcbiAgICB3b3JrZmxvd0lkOiBvcHRpb25zV2l0aERlZmF1bHRzLndvcmtmbG93SWQsXG4gICAgZmlyc3RFeGVjdXRpb25SdW5JZCxcbiAgICBhc3luYyByZXN1bHQoKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+IHtcbiAgICAgIHJldHVybiAoYXdhaXQgY29tcGxldGVkKSBhcyBhbnk7XG4gICAgfSxcbiAgICBhc3luYyBzaWduYWw8QXJncyBleHRlbmRzIGFueVtdPihkZWY6IFNpZ25hbERlZmluaXRpb248QXJncz4gfCBzdHJpbmcsIC4uLmFyZ3M6IEFyZ3MpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgIHJldHVybiBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLFxuICAgICAgICAnc2lnbmFsV29ya2Zsb3cnLFxuICAgICAgICBzaWduYWxXb3JrZmxvd05leHRIYW5kbGVyXG4gICAgICApKHtcbiAgICAgICAgc2VxOiBhY3RpdmF0b3IubmV4dFNlcXMuc2lnbmFsV29ya2Zsb3crKyxcbiAgICAgICAgc2lnbmFsTmFtZTogdHlwZW9mIGRlZiA9PT0gJ3N0cmluZycgPyBkZWYgOiBkZWYubmFtZSxcbiAgICAgICAgYXJncyxcbiAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgdHlwZTogJ2NoaWxkJyxcbiAgICAgICAgICBjaGlsZFdvcmtmbG93SWQ6IG9wdGlvbnNXaXRoRGVmYXVsdHMud29ya2Zsb3dJZCxcbiAgICAgICAgfSxcbiAgICAgICAgaGVhZGVyczoge30sXG4gICAgICB9KTtcbiAgICB9LFxuICB9O1xufVxuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uIGFuZCBhd2FpdCBpdHMgY29tcGxldGlvbi5cbiAqXG4gKiAtIEJ5IGRlZmF1bHQsIGEgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICogLSBUaGlzIG9wZXJhdGlvbiBpcyBjYW5jZWxsYWJsZSB1c2luZyB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqXG4gKiBAcmV0dXJuIFRoZSByZXN1bHQgb2YgdGhlIGNoaWxkIFdvcmtmbG93LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93VHlwZTogc3RyaW5nLFxuICBvcHRpb25zOiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+O1xuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uIGFuZCBhd2FpdCBpdHMgY29tcGxldGlvbi5cbiAqXG4gKiAtIEJ5IGRlZmF1bHQsIGEgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICogLSBEZWR1Y2VzIHRoZSBXb3JrZmxvdyB0eXBlIGFuZCBzaWduYXR1cmUgZnJvbSBwcm92aWRlZCBXb3JrZmxvdyBmdW5jdGlvbi5cbiAqIC0gVGhpcyBvcGVyYXRpb24gaXMgY2FuY2VsbGFibGUgdXNpbmcge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKlxuICogQHJldHVybiBUaGUgcmVzdWx0IG9mIHRoZSBjaGlsZCBXb3JrZmxvdy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd0Z1bmM6IFQsXG4gIG9wdGlvbnM6IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb24gYW5kIGF3YWl0IGl0cyBjb21wbGV0aW9uLlxuICpcbiAqICoqT3ZlcnJpZGUgZm9yIFdvcmtmbG93cyB0aGF0IGFjY2VwdCBubyBhcmd1bWVudHMqKi5cbiAqXG4gKiAtIFRoZSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKiAtIFRoaXMgb3BlcmF0aW9uIGlzIGNhbmNlbGxhYmxlIHVzaW5nIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICpcbiAqIEByZXR1cm4gVGhlIHJlc3VsdCBvZiB0aGUgY2hpbGQgV29ya2Zsb3cuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlQ2hpbGQ8VCBleHRlbmRzICgpID0+IFdvcmtmbG93UmV0dXJuVHlwZT4oXG4gIHdvcmtmbG93VHlwZTogc3RyaW5nXG4pOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb24gYW5kIGF3YWl0IGl0cyBjb21wbGV0aW9uLlxuICpcbiAqICoqT3ZlcnJpZGUgZm9yIFdvcmtmbG93cyB0aGF0IGFjY2VwdCBubyBhcmd1bWVudHMqKi5cbiAqXG4gKiAtIFRoZSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKiAtIERlZHVjZXMgdGhlIFdvcmtmbG93IHR5cGUgYW5kIHNpZ25hdHVyZSBmcm9tIHByb3ZpZGVkIFdvcmtmbG93IGZ1bmN0aW9uLlxuICogLSBUaGlzIG9wZXJhdGlvbiBpcyBjYW5jZWxsYWJsZSB1c2luZyB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqXG4gKiBAcmV0dXJuIFRoZSByZXN1bHQgb2YgdGhlIGNoaWxkIFdvcmtmbG93LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNoaWxkPFQgZXh0ZW5kcyAoKSA9PiBXb3JrZmxvd1JldHVyblR5cGU+KHdvcmtmbG93RnVuYzogVCk6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd1R5cGVPckZ1bmM6IHN0cmluZyB8IFQsXG4gIG9wdGlvbnM/OiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LmV4ZWN1dGVDaGlsZCguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4gQ29uc2lkZXIgdXNpbmcgQ2xpZW50LndvcmtmbG93LmV4ZWN1dGUoLi4uKSBpbnN0ZWFkLidcbiAgKTtcbiAgY29uc3Qgb3B0aW9uc1dpdGhEZWZhdWx0cyA9IGFkZERlZmF1bHRXb3JrZmxvd09wdGlvbnMob3B0aW9ucyA/PyAoe30gYXMgYW55KSk7XG4gIGNvbnN0IHdvcmtmbG93VHlwZSA9IGV4dHJhY3RXb3JrZmxvd1R5cGUod29ya2Zsb3dUeXBlT3JGdW5jKTtcbiAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCxcbiAgICAnc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uJyxcbiAgICBzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25OZXh0SGFuZGxlclxuICApO1xuICBjb25zdCBleGVjUHJvbWlzZSA9IGV4ZWN1dGUoe1xuICAgIHNlcTogYWN0aXZhdG9yLm5leHRTZXFzLmNoaWxkV29ya2Zsb3crKyxcbiAgICBvcHRpb25zOiBvcHRpb25zV2l0aERlZmF1bHRzLFxuICAgIGhlYWRlcnM6IHt9LFxuICAgIHdvcmtmbG93VHlwZSxcbiAgfSk7XG4gIHVudHJhY2tQcm9taXNlKGV4ZWNQcm9taXNlKTtcbiAgY29uc3QgY29tcGxldGVkUHJvbWlzZSA9IGV4ZWNQcm9taXNlLnRoZW4oKFtfc3RhcnRlZCwgY29tcGxldGVkXSkgPT4gY29tcGxldGVkKTtcbiAgdW50cmFja1Byb21pc2UoY29tcGxldGVkUHJvbWlzZSk7XG4gIHJldHVybiBjb21wbGV0ZWRQcm9taXNlIGFzIFByb21pc2U8YW55Pjtcbn1cblxuLyoqXG4gKiBHZXQgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgV29ya2Zsb3cuXG4gKlxuICogV0FSTklORzogVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgZnJvemVuIGNvcHkgb2YgV29ya2Zsb3dJbmZvLCBhdCB0aGUgcG9pbnQgd2hlcmUgdGhpcyBtZXRob2QgaGFzIGJlZW4gY2FsbGVkLlxuICogQ2hhbmdlcyBoYXBwZW5pbmcgYXQgbGF0ZXIgcG9pbnQgaW4gd29ya2Zsb3cgZXhlY3V0aW9uIHdpbGwgbm90IGJlIHJlZmxlY3RlZCBpbiB0aGUgcmV0dXJuZWQgb2JqZWN0LlxuICpcbiAqIEZvciB0aGlzIHJlYXNvbiwgd2UgcmVjb21tZW5kIGNhbGxpbmcgYHdvcmtmbG93SW5mbygpYCBvbiBldmVyeSBhY2Nlc3MgdG8ge0BsaW5rIFdvcmtmbG93SW5mb30ncyBmaWVsZHMsXG4gKiByYXRoZXIgdGhhbiBjYWNoaW5nIHRoZSBgV29ya2Zsb3dJbmZvYCBvYmplY3QgKG9yIHBhcnQgb2YgaXQpIGluIGEgbG9jYWwgdmFyaWFibGUuIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYHRzXG4gKiAvLyBHT09EXG4gKiBmdW5jdGlvbiBteVdvcmtmbG93KCkge1xuICogICBkb1NvbWV0aGluZyh3b3JrZmxvd0luZm8oKS5zZWFyY2hBdHRyaWJ1dGVzKVxuICogICAuLi5cbiAqICAgZG9Tb21ldGhpbmdFbHNlKHdvcmtmbG93SW5mbygpLnNlYXJjaEF0dHJpYnV0ZXMpXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiB2c1xuICpcbiAqIGBgYHRzXG4gKiAvLyBCQURcbiAqIGZ1bmN0aW9uIG15V29ya2Zsb3coKSB7XG4gKiAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB3b3JrZmxvd0luZm8oKS5zZWFyY2hBdHRyaWJ1dGVzXG4gKiAgIGRvU29tZXRoaW5nKGF0dHJpYnV0ZXMpXG4gKiAgIC4uLlxuICogICBkb1NvbWV0aGluZ0Vsc2UoYXR0cmlidXRlcylcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gd29ya2Zsb3dJbmZvKCk6IFdvcmtmbG93SW5mbyB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy53b3JrZmxvd0luZm8oLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJyk7XG4gIHJldHVybiBhY3RpdmF0b3IuaW5mbztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IGNvZGUgaXMgZXhlY3V0aW5nIGluIHdvcmtmbG93IGNvbnRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluV29ya2Zsb3dDb250ZXh0KCk6IGJvb2xlYW4ge1xuICByZXR1cm4gbWF5YmVHZXRBY3RpdmF0b3IoKSAhPT0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBmdW5jdGlvbiBgZmAgdGhhdCB3aWxsIGNhdXNlIHRoZSBjdXJyZW50IFdvcmtmbG93IHRvIENvbnRpbnVlQXNOZXcgd2hlbiBjYWxsZWQuXG4gKlxuICogYGZgIHRha2VzIHRoZSBzYW1lIGFyZ3VtZW50cyBhcyB0aGUgV29ya2Zsb3cgZnVuY3Rpb24gc3VwcGxpZWQgdG8gdHlwZXBhcmFtIGBGYC5cbiAqXG4gKiBPbmNlIGBmYCBpcyBjYWxsZWQsIFdvcmtmbG93IEV4ZWN1dGlvbiBpbW1lZGlhdGVseSBjb21wbGV0ZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQ29udGludWVBc05ld0Z1bmM8RiBleHRlbmRzIFdvcmtmbG93PihcbiAgb3B0aW9ucz86IENvbnRpbnVlQXNOZXdPcHRpb25zXG4pOiAoLi4uYXJnczogUGFyYW1ldGVyczxGPikgPT4gUHJvbWlzZTxuZXZlcj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuY29udGludWVBc05ldyguLi4pIGFuZCBXb3JrZmxvdy5tYWtlQ29udGludWVBc05ld0Z1bmMoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJ1xuICApO1xuICBjb25zdCBpbmZvID0gYWN0aXZhdG9yLmluZm87XG4gIGNvbnN0IHsgd29ya2Zsb3dUeXBlLCB0YXNrUXVldWUsIC4uLnJlc3QgfSA9IG9wdGlvbnMgPz8ge307XG4gIGNvbnN0IHJlcXVpcmVkT3B0aW9ucyA9IHtcbiAgICB3b3JrZmxvd1R5cGU6IHdvcmtmbG93VHlwZSA/PyBpbmZvLndvcmtmbG93VHlwZSxcbiAgICB0YXNrUXVldWU6IHRhc2tRdWV1ZSA/PyBpbmZvLnRhc2tRdWV1ZSxcbiAgICAuLi5yZXN0LFxuICB9O1xuXG4gIHJldHVybiAoLi4uYXJnczogUGFyYW1ldGVyczxGPik6IFByb21pc2U8bmV2ZXI+ID0+IHtcbiAgICBjb25zdCBmbiA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCwgJ2NvbnRpbnVlQXNOZXcnLCBhc3luYyAoaW5wdXQpID0+IHtcbiAgICAgIGNvbnN0IHsgaGVhZGVycywgYXJncywgb3B0aW9ucyB9ID0gaW5wdXQ7XG4gICAgICB0aHJvdyBuZXcgQ29udGludWVBc05ldyh7XG4gICAgICAgIHdvcmtmbG93VHlwZTogb3B0aW9ucy53b3JrZmxvd1R5cGUsXG4gICAgICAgIGFyZ3VtZW50czogdG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgLi4uYXJncyksXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIHRhc2tRdWV1ZTogb3B0aW9ucy50YXNrUXVldWUsXG4gICAgICAgIG1lbW86IG9wdGlvbnMubWVtbyAmJiBtYXBUb1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCBvcHRpb25zLm1lbW8pLFxuICAgICAgICBzZWFyY2hBdHRyaWJ1dGVzOiBvcHRpb25zLnNlYXJjaEF0dHJpYnV0ZXNcbiAgICAgICAgICA/IG1hcFRvUGF5bG9hZHMoc2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlciwgb3B0aW9ucy5zZWFyY2hBdHRyaWJ1dGVzKVxuICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICB3b3JrZmxvd1J1blRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMud29ya2Zsb3dSdW5UaW1lb3V0KSxcbiAgICAgICAgd29ya2Zsb3dUYXNrVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy53b3JrZmxvd1Rhc2tUaW1lb3V0KSxcbiAgICAgICAgdmVyc2lvbmluZ0ludGVudDogdmVyc2lvbmluZ0ludGVudFRvUHJvdG8ob3B0aW9ucy52ZXJzaW9uaW5nSW50ZW50KSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBmbih7XG4gICAgICBhcmdzLFxuICAgICAgaGVhZGVyczoge30sXG4gICAgICBvcHRpb25zOiByZXF1aXJlZE9wdGlvbnMsXG4gICAgfSk7XG4gIH07XG59XG5cbi8qKlxuICoge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9jb25jZXB0cy93aGF0LWlzLWNvbnRpbnVlLWFzLW5ldy8gfCBDb250aW51ZXMtQXMtTmV3fSB0aGUgY3VycmVudCBXb3JrZmxvdyBFeGVjdXRpb25cbiAqIHdpdGggZGVmYXVsdCBvcHRpb25zLlxuICpcbiAqIFNob3J0aGFuZCBmb3IgYG1ha2VDb250aW51ZUFzTmV3RnVuYzxGPigpKC4uLmFyZ3MpYC4gKFNlZToge0BsaW5rIG1ha2VDb250aW51ZUFzTmV3RnVuY30uKVxuICpcbiAqIEBleGFtcGxlXG4gKlxuICpgYGB0c1xuICppbXBvcnQgeyBjb250aW51ZUFzTmV3IH0gZnJvbSAnQHRlbXBvcmFsaW8vd29ya2Zsb3cnO1xuICpcbiAqZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG15V29ya2Zsb3cobjogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gKiAgLy8gLi4uIFdvcmtmbG93IGxvZ2ljXG4gKiAgYXdhaXQgY29udGludWVBc05ldzx0eXBlb2YgbXlXb3JrZmxvdz4obiArIDEpO1xuICp9XG4gKmBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udGludWVBc05ldzxGIGV4dGVuZHMgV29ya2Zsb3c+KC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rj4pOiBQcm9taXNlPG5ldmVyPiB7XG4gIHJldHVybiBtYWtlQ29udGludWVBc05ld0Z1bmMoKSguLi5hcmdzKTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSBhbiBSRkMgY29tcGxpYW50IFY0IHV1aWQuXG4gKiBVc2VzIHRoZSB3b3JrZmxvdydzIGRldGVybWluaXN0aWMgUFJORyBtYWtpbmcgaXQgc2FmZSBmb3IgdXNlIHdpdGhpbiBhIHdvcmtmbG93LlxuICogVGhpcyBmdW5jdGlvbiBpcyBjcnlwdG9ncmFwaGljYWxseSBpbnNlY3VyZS5cbiAqIFNlZSB0aGUge0BsaW5rIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEwNTAzNC9ob3ctdG8tY3JlYXRlLWEtZ3VpZC11dWlkIHwgc3RhY2tvdmVyZmxvdyBkaXNjdXNzaW9ufS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHV1aWQ0KCk6IHN0cmluZyB7XG4gIC8vIFJldHVybiB0aGUgaGV4YWRlY2ltYWwgdGV4dCByZXByZXNlbnRhdGlvbiBvZiBudW1iZXIgYG5gLCBwYWRkZWQgd2l0aCB6ZXJvZXMgdG8gYmUgb2YgbGVuZ3RoIGBwYFxuICBjb25zdCBobyA9IChuOiBudW1iZXIsIHA6IG51bWJlcikgPT4gbi50b1N0cmluZygxNikucGFkU3RhcnQocCwgJzAnKTtcbiAgLy8gQ3JlYXRlIGEgdmlldyBiYWNrZWQgYnkgYSAxNi1ieXRlIGJ1ZmZlclxuICBjb25zdCB2aWV3ID0gbmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcigxNikpO1xuICAvLyBGaWxsIGJ1ZmZlciB3aXRoIHJhbmRvbSB2YWx1ZXNcbiAgdmlldy5zZXRVaW50MzIoMCwgKE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMCkgPj4+IDApO1xuICB2aWV3LnNldFVpbnQzMig0LCAoTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwKSA+Pj4gMCk7XG4gIHZpZXcuc2V0VWludDMyKDgsIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDApID4+PiAwKTtcbiAgdmlldy5zZXRVaW50MzIoMTIsIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDApID4+PiAwKTtcbiAgLy8gUGF0Y2ggdGhlIDZ0aCBieXRlIHRvIHJlZmxlY3QgYSB2ZXJzaW9uIDQgVVVJRFxuICB2aWV3LnNldFVpbnQ4KDYsICh2aWV3LmdldFVpbnQ4KDYpICYgMHhmKSB8IDB4NDApO1xuICAvLyBQYXRjaCB0aGUgOHRoIGJ5dGUgdG8gcmVmbGVjdCBhIHZhcmlhbnQgMSBVVUlEICh2ZXJzaW9uIDQgVVVJRHMgYXJlKVxuICB2aWV3LnNldFVpbnQ4KDgsICh2aWV3LmdldFVpbnQ4KDgpICYgMHgzZikgfCAweDgwKTtcbiAgLy8gQ29tcGlsZSB0aGUgY2Fub25pY2FsIHRleHR1YWwgZm9ybSBmcm9tIHRoZSBhcnJheSBkYXRhXG4gIHJldHVybiBgJHtobyh2aWV3LmdldFVpbnQzMigwKSwgOCl9LSR7aG8odmlldy5nZXRVaW50MTYoNCksIDQpfS0ke2hvKHZpZXcuZ2V0VWludDE2KDYpLCA0KX0tJHtobyhcbiAgICB2aWV3LmdldFVpbnQxNig4KSxcbiAgICA0XG4gICl9LSR7aG8odmlldy5nZXRVaW50MzIoMTApLCA4KX0ke2hvKHZpZXcuZ2V0VWludDE2KDE0KSwgNCl9YDtcbn1cblxuLyoqXG4gKiBQYXRjaCBvciB1cGdyYWRlIHdvcmtmbG93IGNvZGUgYnkgY2hlY2tpbmcgb3Igc3RhdGluZyB0aGF0IHRoaXMgd29ya2Zsb3cgaGFzIGEgY2VydGFpbiBwYXRjaC5cbiAqXG4gKiBTZWUge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L3ZlcnNpb25pbmcgfCBkb2NzIHBhZ2V9IGZvciBpbmZvLlxuICpcbiAqIElmIHRoZSB3b3JrZmxvdyBpcyByZXBsYXlpbmcgYW4gZXhpc3RpbmcgaGlzdG9yeSwgdGhlbiB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZSBpZiB0aGF0XG4gKiBoaXN0b3J5IHdhcyBwcm9kdWNlZCBieSBhIHdvcmtlciB3aGljaCBhbHNvIGhhZCBhIGBwYXRjaGVkYCBjYWxsIHdpdGggdGhlIHNhbWUgYHBhdGNoSWRgLlxuICogSWYgdGhlIGhpc3Rvcnkgd2FzIHByb2R1Y2VkIGJ5IGEgd29ya2VyICp3aXRob3V0KiBzdWNoIGEgY2FsbCwgdGhlbiBpdCB3aWxsIHJldHVybiBmYWxzZS5cbiAqXG4gKiBJZiB0aGUgd29ya2Zsb3cgaXMgbm90IGN1cnJlbnRseSByZXBsYXlpbmcsIHRoZW4gdGhpcyBjYWxsICphbHdheXMqIHJldHVybnMgdHJ1ZS5cbiAqXG4gKiBZb3VyIHdvcmtmbG93IGNvZGUgc2hvdWxkIHJ1biB0aGUgXCJuZXdcIiBjb2RlIGlmIHRoaXMgcmV0dXJucyB0cnVlLCBpZiBpdCByZXR1cm5zIGZhbHNlLCB5b3VcbiAqIHNob3VsZCBydW4gdGhlIFwib2xkXCIgY29kZS4gQnkgZG9pbmcgdGhpcywgeW91IGNhbiBtYWludGFpbiBkZXRlcm1pbmlzbS5cbiAqXG4gKiBAcGFyYW0gcGF0Y2hJZCBBbiBpZGVudGlmaWVyIHRoYXQgc2hvdWxkIGJlIHVuaXF1ZSB0byB0aGlzIHBhdGNoLiBJdCBpcyBPSyB0byB1c2UgbXVsdGlwbGVcbiAqIGNhbGxzIHdpdGggdGhlIHNhbWUgSUQsIHdoaWNoIG1lYW5zIGFsbCBzdWNoIGNhbGxzIHdpbGwgYWx3YXlzIHJldHVybiB0aGUgc2FtZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhdGNoZWQocGF0Y2hJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5wYXRjaCguLi4pIGFuZCBXb3JrZmxvdy5kZXByZWNhdGVQYXRjaCBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJ1xuICApO1xuICByZXR1cm4gYWN0aXZhdG9yLnBhdGNoSW50ZXJuYWwocGF0Y2hJZCwgZmFsc2UpO1xufVxuXG4vKipcbiAqIEluZGljYXRlIHRoYXQgYSBwYXRjaCBpcyBiZWluZyBwaGFzZWQgb3V0LlxuICpcbiAqIFNlZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvdmVyc2lvbmluZyB8IGRvY3MgcGFnZX0gZm9yIGluZm8uXG4gKlxuICogV29ya2Zsb3dzIHdpdGggdGhpcyBjYWxsIG1heSBiZSBkZXBsb3llZCBhbG9uZ3NpZGUgd29ya2Zsb3dzIHdpdGggYSB7QGxpbmsgcGF0Y2hlZH0gY2FsbCwgYnV0XG4gKiB0aGV5IG11c3QgKm5vdCogYmUgZGVwbG95ZWQgd2hpbGUgYW55IHdvcmtlcnMgc3RpbGwgZXhpc3QgcnVubmluZyBvbGQgY29kZSB3aXRob3V0IGFcbiAqIHtAbGluayBwYXRjaGVkfSBjYWxsLCBvciBhbnkgcnVucyB3aXRoIGhpc3RvcmllcyBwcm9kdWNlZCBieSBzdWNoIHdvcmtlcnMgZXhpc3QuIElmIGVpdGhlciBraW5kXG4gKiBvZiB3b3JrZXIgZW5jb3VudGVycyBhIGhpc3RvcnkgcHJvZHVjZWQgYnkgdGhlIG90aGVyLCB0aGVpciBiZWhhdmlvciBpcyB1bmRlZmluZWQuXG4gKlxuICogT25jZSBhbGwgbGl2ZSB3b3JrZmxvdyBydW5zIGhhdmUgYmVlbiBwcm9kdWNlZCBieSB3b3JrZXJzIHdpdGggdGhpcyBjYWxsLCB5b3UgY2FuIGRlcGxveSB3b3JrZXJzXG4gKiB3aGljaCBhcmUgZnJlZSBvZiBlaXRoZXIga2luZCBvZiBwYXRjaCBjYWxsIGZvciB0aGlzIElELiBXb3JrZXJzIHdpdGggYW5kIHdpdGhvdXQgdGhpcyBjYWxsXG4gKiBtYXkgY29leGlzdCwgYXMgbG9uZyBhcyB0aGV5IGFyZSBib3RoIHJ1bm5pbmcgdGhlIFwibmV3XCIgY29kZS5cbiAqXG4gKiBAcGFyYW0gcGF0Y2hJZCBBbiBpZGVudGlmaWVyIHRoYXQgc2hvdWxkIGJlIHVuaXF1ZSB0byB0aGlzIHBhdGNoLiBJdCBpcyBPSyB0byB1c2UgbXVsdGlwbGVcbiAqIGNhbGxzIHdpdGggdGhlIHNhbWUgSUQsIHdoaWNoIG1lYW5zIGFsbCBzdWNoIGNhbGxzIHdpbGwgYWx3YXlzIHJldHVybiB0aGUgc2FtZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlcHJlY2F0ZVBhdGNoKHBhdGNoSWQ6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cucGF0Y2goLi4uKSBhbmQgV29ya2Zsb3cuZGVwcmVjYXRlUGF0Y2ggbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLidcbiAgKTtcbiAgYWN0aXZhdG9yLnBhdGNoSW50ZXJuYWwocGF0Y2hJZCwgdHJ1ZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIGBmbmAgZXZhbHVhdGVzIHRvIGB0cnVlYCBvciBgdGltZW91dGAgZXhwaXJlcy5cbiAqXG4gKiBAcGFyYW0gdGltZW91dCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gKlxuICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgY29uZGl0aW9uIHdhcyB0cnVlIGJlZm9yZSB0aGUgdGltZW91dCBleHBpcmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25kaXRpb24oZm46ICgpID0+IGJvb2xlYW4sIHRpbWVvdXQ6IER1cmF0aW9uKTogUHJvbWlzZTxib29sZWFuPjtcblxuLyoqXG4gKiBSZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gYGZuYCBldmFsdWF0ZXMgdG8gYHRydWVgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uZGl0aW9uKGZuOiAoKSA9PiBib29sZWFuKTogUHJvbWlzZTx2b2lkPjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbmRpdGlvbihmbjogKCkgPT4gYm9vbGVhbiwgdGltZW91dD86IER1cmF0aW9uKTogUHJvbWlzZTx2b2lkIHwgYm9vbGVhbj4ge1xuICBhc3NlcnRJbldvcmtmbG93Q29udGV4dCgnV29ya2Zsb3cuY29uZGl0aW9uKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLicpO1xuICAvLyBQcmlvciB0byAxLjUuMCwgYGNvbmRpdGlvbihmbiwgMClgIHdhcyB0cmVhdGVkIGFzIGVxdWl2YWxlbnQgdG8gYGNvbmRpdGlvbihmbiwgdW5kZWZpbmVkKWBcbiAgaWYgKHRpbWVvdXQgPT09IDAgJiYgIXBhdGNoZWQoQ09ORElUSU9OXzBfUEFUQ0gpKSB7XG4gICAgcmV0dXJuIGNvbmRpdGlvbklubmVyKGZuKTtcbiAgfVxuICBpZiAodHlwZW9mIHRpbWVvdXQgPT09ICdudW1iZXInIHx8IHR5cGVvZiB0aW1lb3V0ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBDYW5jZWxsYXRpb25TY29wZS5jYW5jZWxsYWJsZShhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5yYWNlKFtzbGVlcCh0aW1lb3V0KS50aGVuKCgpID0+IGZhbHNlKSwgY29uZGl0aW9uSW5uZXIoZm4pLnRoZW4oKCkgPT4gdHJ1ZSldKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKS5jYW5jZWwoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICByZXR1cm4gY29uZGl0aW9uSW5uZXIoZm4pO1xufVxuXG5mdW5jdGlvbiBjb25kaXRpb25Jbm5lcihmbjogKCkgPT4gYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICBpZiAoc2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCkge1xuICAgICAgdW50cmFja1Byb21pc2Uoc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKHJlamVjdCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy5jb25kaXRpb24rKztcbiAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGFjdGl2YXRvci5ibG9ja2VkQ29uZGl0aW9ucy5kZWxldGUoc2VxKTtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gRWFnZXIgZXZhbHVhdGlvblxuICAgIGlmIChmbigpKSB7XG4gICAgICByZXNvbHZlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYWN0aXZhdG9yLmJsb2NrZWRDb25kaXRpb25zLnNldChzZXEsIHsgZm4sIHJlc29sdmUgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIERlZmluZSBhbiB1cGRhdGUgbWV0aG9kIGZvciBhIFdvcmtmbG93LlxuICpcbiAqIERlZmluaXRpb25zIGFyZSB1c2VkIHRvIHJlZ2lzdGVyIGhhbmRsZXIgaW4gdGhlIFdvcmtmbG93IHZpYSB7QGxpbmsgc2V0SGFuZGxlcn0gYW5kIHRvIHVwZGF0ZSBXb3JrZmxvd3MgdXNpbmcgYSB7QGxpbmsgV29ya2Zsb3dIYW5kbGV9LCB7QGxpbmsgQ2hpbGRXb3JrZmxvd0hhbmRsZX0gb3Ige0BsaW5rIEV4dGVybmFsV29ya2Zsb3dIYW5kbGV9LlxuICogRGVmaW5pdGlvbnMgY2FuIGJlIHJldXNlZCBpbiBtdWx0aXBsZSBXb3JrZmxvd3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVVcGRhdGU8UmV0LCBBcmdzIGV4dGVuZHMgYW55W10gPSBbXSwgTmFtZSBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4oXG4gIG5hbWU6IE5hbWVcbik6IFVwZGF0ZURlZmluaXRpb248UmV0LCBBcmdzLCBOYW1lPiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ3VwZGF0ZScsXG4gICAgbmFtZSxcbiAgfSBhcyBVcGRhdGVEZWZpbml0aW9uPFJldCwgQXJncywgTmFtZT47XG59XG5cbi8qKlxuICogRGVmaW5lIGEgc2lnbmFsIG1ldGhvZCBmb3IgYSBXb3JrZmxvdy5cbiAqXG4gKiBEZWZpbml0aW9ucyBhcmUgdXNlZCB0byByZWdpc3RlciBoYW5kbGVyIGluIHRoZSBXb3JrZmxvdyB2aWEge0BsaW5rIHNldEhhbmRsZXJ9IGFuZCB0byBzaWduYWwgV29ya2Zsb3dzIHVzaW5nIGEge0BsaW5rIFdvcmtmbG93SGFuZGxlfSwge0BsaW5rIENoaWxkV29ya2Zsb3dIYW5kbGV9IG9yIHtAbGluayBFeHRlcm5hbFdvcmtmbG93SGFuZGxlfS5cbiAqIERlZmluaXRpb25zIGNhbiBiZSByZXVzZWQgaW4gbXVsdGlwbGUgV29ya2Zsb3dzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lU2lnbmFsPEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPihcbiAgbmFtZTogTmFtZVxuKTogU2lnbmFsRGVmaW5pdGlvbjxBcmdzLCBOYW1lPiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ3NpZ25hbCcsXG4gICAgbmFtZSxcbiAgfSBhcyBTaWduYWxEZWZpbml0aW9uPEFyZ3MsIE5hbWU+O1xufVxuXG4vKipcbiAqIERlZmluZSBhIHF1ZXJ5IG1ldGhvZCBmb3IgYSBXb3JrZmxvdy5cbiAqXG4gKiBEZWZpbml0aW9ucyBhcmUgdXNlZCB0byByZWdpc3RlciBoYW5kbGVyIGluIHRoZSBXb3JrZmxvdyB2aWEge0BsaW5rIHNldEhhbmRsZXJ9IGFuZCB0byBxdWVyeSBXb3JrZmxvd3MgdXNpbmcgYSB7QGxpbmsgV29ya2Zsb3dIYW5kbGV9LlxuICogRGVmaW5pdGlvbnMgY2FuIGJlIHJldXNlZCBpbiBtdWx0aXBsZSBXb3JrZmxvd3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVRdWVyeTxSZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPihcbiAgbmFtZTogTmFtZVxuKTogUXVlcnlEZWZpbml0aW9uPFJldCwgQXJncywgTmFtZT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdxdWVyeScsXG4gICAgbmFtZSxcbiAgfSBhcyBRdWVyeURlZmluaXRpb248UmV0LCBBcmdzLCBOYW1lPjtcbn1cblxuLyoqXG4gKiBTZXQgYSBoYW5kbGVyIGZ1bmN0aW9uIGZvciBhIFdvcmtmbG93IHVwZGF0ZSwgc2lnbmFsLCBvciBxdWVyeS5cbiAqXG4gKiBJZiB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBmb3IgYSBnaXZlbiB1cGRhdGUsIHNpZ25hbCwgb3IgcXVlcnkgbmFtZSB0aGUgbGFzdCBoYW5kbGVyIHdpbGwgb3ZlcndyaXRlIGFueSBwcmV2aW91cyBjYWxscy5cbiAqXG4gKiBAcGFyYW0gZGVmIGFuIHtAbGluayBVcGRhdGVEZWZpbml0aW9ufSwge0BsaW5rIFNpZ25hbERlZmluaXRpb259LCBvciB7QGxpbmsgUXVlcnlEZWZpbml0aW9ufSBhcyByZXR1cm5lZCBieSB7QGxpbmsgZGVmaW5lVXBkYXRlfSwge0BsaW5rIGRlZmluZVNpZ25hbH0sIG9yIHtAbGluayBkZWZpbmVRdWVyeX0gcmVzcGVjdGl2ZWx5LlxuICogQHBhcmFtIGhhbmRsZXIgYSBjb21wYXRpYmxlIGhhbmRsZXIgZnVuY3Rpb24gZm9yIHRoZSBnaXZlbiBkZWZpbml0aW9uIG9yIGB1bmRlZmluZWRgIHRvIHVuc2V0IHRoZSBoYW5kbGVyLlxuICogQHBhcmFtIG9wdGlvbnMgYW4gb3B0aW9uYWwgYGRlc2NyaXB0aW9uYCBvZiB0aGUgaGFuZGxlciBhbmQgYW4gb3B0aW9uYWwgdXBkYXRlIGB2YWxpZGF0b3JgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0SGFuZGxlcjxSZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSwgVCBleHRlbmRzIFF1ZXJ5RGVmaW5pdGlvbjxSZXQsIEFyZ3M+PihcbiAgZGVmOiBULFxuICBoYW5kbGVyOiBIYW5kbGVyPFJldCwgQXJncywgVD4gfCB1bmRlZmluZWQsXG4gIG9wdGlvbnM/OiBRdWVyeUhhbmRsZXJPcHRpb25zXG4pOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIHNldEhhbmRsZXI8UmV0LCBBcmdzIGV4dGVuZHMgYW55W10sIFQgZXh0ZW5kcyBTaWduYWxEZWZpbml0aW9uPEFyZ3M+PihcbiAgZGVmOiBULFxuICBoYW5kbGVyOiBIYW5kbGVyPFJldCwgQXJncywgVD4gfCB1bmRlZmluZWQsXG4gIG9wdGlvbnM/OiBTaWduYWxIYW5kbGVyT3B0aW9uc1xuKTogdm9pZDtcbmV4cG9ydCBmdW5jdGlvbiBzZXRIYW5kbGVyPFJldCwgQXJncyBleHRlbmRzIGFueVtdLCBUIGV4dGVuZHMgVXBkYXRlRGVmaW5pdGlvbjxSZXQsIEFyZ3M+PihcbiAgZGVmOiBULFxuICBoYW5kbGVyOiBIYW5kbGVyPFJldCwgQXJncywgVD4gfCB1bmRlZmluZWQsXG4gIG9wdGlvbnM/OiBVcGRhdGVIYW5kbGVyT3B0aW9uczxBcmdzPlxuKTogdm9pZDtcblxuLy8gRm9yIFVwZGF0ZXMgYW5kIFNpZ25hbHMgd2Ugd2FudCB0byBtYWtlIGEgcHVibGljIGd1YXJhbnRlZSBzb21ldGhpbmcgbGlrZSB0aGVcbi8vIGZvbGxvd2luZzpcbi8vXG4vLyAgIFwiSWYgYSBXRlQgY29udGFpbnMgYSBTaWduYWwvVXBkYXRlLCBhbmQgaWYgYSBoYW5kbGVyIGlzIGF2YWlsYWJsZSBmb3IgdGhhdFxuLy8gICBTaWduYWwvVXBkYXRlLCB0aGVuIHRoZSBoYW5kbGVyIHdpbGwgYmUgZXhlY3V0ZWQuXCJcIlxuLy9cbi8vIEhvd2V2ZXIsIHRoYXQgc3RhdGVtZW50IGlzIG5vdCB3ZWxsLWRlZmluZWQsIGxlYXZpbmcgc2V2ZXJhbCBxdWVzdGlvbnMgb3Blbjpcbi8vXG4vLyAxLiBXaGF0IGRvZXMgaXQgbWVhbiBmb3IgYSBoYW5kbGVyIHRvIGJlIFwiYXZhaWxhYmxlXCI/IFdoYXQgaGFwcGVucyBpZiB0aGVcbi8vICAgIGhhbmRsZXIgaXMgbm90IHByZXNlbnQgaW5pdGlhbGx5IGJ1dCBpcyBzZXQgYXQgc29tZSBwb2ludCBkdXJpbmcgdGhlXG4vLyAgICBXb3JrZmxvdyBjb2RlIHRoYXQgaXMgZXhlY3V0ZWQgaW4gdGhhdCBXRlQ/IFdoYXQgaGFwcGVucyBpZiB0aGUgaGFuZGxlciBpc1xuLy8gICAgc2V0IGFuZCB0aGVuIGRlbGV0ZWQsIG9yIHJlcGxhY2VkIHdpdGggYSBkaWZmZXJlbnQgaGFuZGxlcj9cbi8vXG4vLyAyLiBXaGVuIGlzIHRoZSBoYW5kbGVyIGV4ZWN1dGVkPyAoV2hlbiBpdCBmaXJzdCBiZWNvbWVzIGF2YWlsYWJsZT8gQXQgdGhlIGVuZFxuLy8gICAgb2YgdGhlIGFjdGl2YXRpb24/KSBXaGF0IGFyZSB0aGUgZXhlY3V0aW9uIHNlbWFudGljcyBvZiBXb3JrZmxvdyBhbmRcbi8vICAgIFNpZ25hbC9VcGRhdGUgaGFuZGxlciBjb2RlIGdpdmVuIHRoYXQgdGhleSBhcmUgY29uY3VycmVudD8gQ2FuIHRoZSB1c2VyXG4vLyAgICByZWx5IG9uIFNpZ25hbC9VcGRhdGUgc2lkZSBlZmZlY3RzIGJlaW5nIHJlZmxlY3RlZCBpbiB0aGUgV29ya2Zsb3cgcmV0dXJuXG4vLyAgICB2YWx1ZSwgb3IgaW4gdGhlIHZhbHVlIHBhc3NlZCB0byBDb250aW51ZS1Bcy1OZXc/IElmIHRoZSBoYW5kbGVyIGlzIGFuXG4vLyAgICBhc3luYyBmdW5jdGlvbiAvIGNvcm91dGluZSwgaG93IG11Y2ggb2YgaXQgaXMgZXhlY3V0ZWQgYW5kIHdoZW4gaXMgdGhlXG4vLyAgICByZXN0IGV4ZWN1dGVkP1xuLy9cbi8vIDMuIFdoYXQgaGFwcGVucyBpZiB0aGUgaGFuZGxlciBpcyBub3QgZXhlY3V0ZWQ/IChpLmUuIGJlY2F1c2UgaXQgd2Fzbid0XG4vLyAgICBhdmFpbGFibGUgaW4gdGhlIHNlbnNlIGRlZmluZWQgYnkgKDEpKVxuLy9cbi8vIDQuIEluIHRoZSBjYXNlIG9mIFVwZGF0ZSwgd2hlbiBpcyB0aGUgdmFsaWRhdGlvbiBmdW5jdGlvbiBleGVjdXRlZD9cbi8vXG4vLyBUaGUgaW1wbGVtZW50YXRpb24gZm9yIFR5cGVzY3JpcHQgaXMgYXMgZm9sbG93czpcbi8vXG4vLyAxLiBzZGstY29yZSBzb3J0cyBTaWduYWwgYW5kIFVwZGF0ZSBqb2JzIChhbmQgUGF0Y2hlcykgYWhlYWQgb2YgYWxsIG90aGVyXG4vLyAgICBqb2JzLiBUaHVzIGlmIHRoZSBoYW5kbGVyIGlzIGF2YWlsYWJsZSBhdCB0aGUgc3RhcnQgb2YgdGhlIEFjdGl2YXRpb24gdGhlblxuLy8gICAgdGhlIFNpZ25hbC9VcGRhdGUgd2lsbCBiZSBleGVjdXRlZCBiZWZvcmUgV29ya2Zsb3cgY29kZSBpcyBleGVjdXRlZC4gSWYgaXRcbi8vICAgIGlzIG5vdCwgdGhlbiB0aGUgU2lnbmFsL1VwZGF0ZSBjYWxscyBpcyBwdXNoZWQgdG8gYSBidWZmZXIuXG4vL1xuLy8gMi4gT24gZWFjaCBjYWxsIHRvIHNldEhhbmRsZXIgZm9yIGEgZ2l2ZW4gU2lnbmFsL1VwZGF0ZSwgd2UgbWFrZSBhIHBhc3Ncbi8vICAgIHRocm91Z2ggdGhlIGJ1ZmZlciBsaXN0LiBJZiBhIGJ1ZmZlcmVkIGpvYiBpcyBhc3NvY2lhdGVkIHdpdGggdGhlIGp1c3Qtc2V0XG4vLyAgICBoYW5kbGVyLCB0aGVuIHRoZSBqb2IgaXMgcmVtb3ZlZCBmcm9tIHRoZSBidWZmZXIgYW5kIHRoZSBpbml0aWFsXG4vLyAgICBzeW5jaHJvbm91cyBwb3J0aW9uIG9mIHRoZSBoYW5kbGVyIGlzIGludm9rZWQgb24gdGhhdCBpbnB1dCAoaS5lLlxuLy8gICAgcHJlZW1wdGluZyB3b3JrZmxvdyBjb2RlKS5cbi8vXG4vLyBUaHVzIGluIHRoZSBjYXNlIG9mIFR5cGVzY3JpcHQgdGhlIHF1ZXN0aW9ucyBhYm92ZSBhcmUgYW5zd2VyZWQgYXMgZm9sbG93czpcbi8vXG4vLyAxLiBBIGhhbmRsZXIgaXMgXCJhdmFpbGFibGVcIiBpZiBpdCBpcyBzZXQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBBY3RpdmF0aW9uIG9yXG4vLyAgICBiZWNvbWVzIHNldCBhdCBhbnkgcG9pbnQgZHVyaW5nIHRoZSBBY3RpdmF0aW9uLiBJZiB0aGUgaGFuZGxlciBpcyBub3Qgc2V0XG4vLyAgICBpbml0aWFsbHkgdGhlbiBpdCBpcyBleGVjdXRlZCBhcyBzb29uIGFzIGl0IGlzIHNldC4gU3Vic2VxdWVudCBkZWxldGlvbiBvclxuLy8gICAgcmVwbGFjZW1lbnQgYnkgYSBkaWZmZXJlbnQgaGFuZGxlciBoYXMgbm8gaW1wYWN0IGJlY2F1c2UgdGhlIGpvYnMgaXQgd2FzXG4vLyAgICBoYW5kbGluZyBoYXZlIGFscmVhZHkgYmVlbiBoYW5kbGVkIGFuZCBhcmUgbm8gbG9uZ2VyIGluIHRoZSBidWZmZXIuXG4vL1xuLy8gMi4gVGhlIGhhbmRsZXIgaXMgZXhlY3V0ZWQgYXMgc29vbiBhcyBpdCBiZWNvbWVzIGF2YWlsYWJsZS4gSS5lLiBpZiB0aGVcbi8vICAgIGhhbmRsZXIgaXMgc2V0IGF0IHRoZSBzdGFydCBvZiB0aGUgQWN0aXZhdGlvbiB0aGVuIGl0IGlzIGV4ZWN1dGVkIHdoZW5cbi8vICAgIGZpcnN0IGF0dGVtcHRpbmcgdG8gcHJvY2VzcyB0aGUgU2lnbmFsL1VwZGF0ZSBqb2I7IGFsdGVybmF0aXZlbHksIGlmIGl0IGlzXG4vLyAgICBzZXQgYnkgYSBzZXRIYW5kbGVyIGNhbGwgbWFkZSBieSBXb3JrZmxvdyBjb2RlLCB0aGVuIGl0IGlzIGV4ZWN1dGVkIGFzXG4vLyAgICBwYXJ0IG9mIHRoYXQgY2FsbCAocHJlZW1wdGluZyBXb3JrZmxvdyBjb2RlKS4gVGhlcmVmb3JlLCBhIHVzZXIgY2FuIHJlbHlcbi8vICAgIG9uIFNpZ25hbC9VcGRhdGUgc2lkZSBlZmZlY3RzIGJlaW5nIHJlZmxlY3RlZCBpbiBlLmcuIHRoZSBXb3JrZmxvdyByZXR1cm5cbi8vICAgIHZhbHVlLCBhbmQgaW4gdGhlIHZhbHVlIHBhc3NlZCB0byBDb250aW51ZS1Bcy1OZXcuIEFjdGl2YXRpb24gam9icyBhcmVcbi8vICAgIHByb2Nlc3NlZCBpbiB0aGUgb3JkZXIgc3VwcGxpZWQgYnkgc2RrLWNvcmUsIGkuZS4gU2lnbmFscywgdGhlbiBVcGRhdGVzLFxuLy8gICAgdGhlbiBvdGhlciBqb2JzLiBXaXRoaW4gZWFjaCBncm91cCwgdGhlIG9yZGVyIHNlbnQgYnkgdGhlIHNlcnZlciBpc1xuLy8gICAgcHJlc2VydmVkLiBJZiB0aGUgaGFuZGxlciBpcyBhc3luYywgaXQgaXMgZXhlY3V0ZWQgdXAgdG8gaXRzIGZpcnN0IHlpZWxkXG4vLyAgICBwb2ludC5cbi8vXG4vLyAzLiBTaWduYWwgY2FzZTogSWYgYSBoYW5kbGVyIGRvZXMgbm90IGJlY29tZSBhdmFpbGFibGUgZm9yIGEgU2lnbmFsIGpvYiB0aGVuXG4vLyAgICB0aGUgam9iIHJlbWFpbnMgaW4gdGhlIGJ1ZmZlci4gSWYgYSBoYW5kbGVyIGZvciB0aGUgU2lnbmFsIGJlY29tZXNcbi8vICAgIGF2YWlsYWJsZSBpbiBhIHN1YnNlcXVlbnQgQWN0aXZhdGlvbiAob2YgdGhlIHNhbWUgb3IgYSBzdWJzZXF1ZW50IFdGVClcbi8vICAgIHRoZW4gdGhlIGhhbmRsZXIgd2lsbCBiZSBleGVjdXRlZC4gSWYgbm90LCB0aGVuIHRoZSBTaWduYWwgd2lsbCBuZXZlciBiZVxuLy8gICAgcmVzcG9uZGVkIHRvIGFuZCB0aGlzIGNhdXNlcyBubyBlcnJvci5cbi8vXG4vLyAgICBVcGRhdGUgY2FzZTogSWYgYSBoYW5kbGVyIGRvZXMgbm90IGJlY29tZSBhdmFpbGFibGUgZm9yIGFuIFVwZGF0ZSBqb2IgdGhlblxuLy8gICAgdGhlIFVwZGF0ZSBpcyByZWplY3RlZCBhdCB0aGUgZW5kIG9mIHRoZSBBY3RpdmF0aW9uLiBUaHVzLCBpZiBhIHVzZXIgZG9lc1xuLy8gICAgbm90IHdhbnQgYW4gVXBkYXRlIHRvIGJlIHJlamVjdGVkIGZvciB0aGlzIHJlYXNvbiwgdGhlbiBpdCBpcyB0aGVpclxuLy8gICAgcmVzcG9uc2liaWxpdHkgdG8gZW5zdXJlIHRoYXQgdGhlaXIgYXBwbGljYXRpb24gYW5kIHdvcmtmbG93IGNvZGUgaW50ZXJhY3Rcbi8vICAgIHN1Y2ggdGhhdCBhIGhhbmRsZXIgaXMgYXZhaWxhYmxlIGZvciB0aGUgVXBkYXRlIGR1cmluZyBhbnkgQWN0aXZhdGlvblxuLy8gICAgd2hpY2ggbWlnaHQgY29udGFpbiB0aGVpciBVcGRhdGUgam9iLiAoTm90ZSB0aGF0IHRoZSB1c2VyIG9mdGVuIGhhc1xuLy8gICAgdW5jZXJ0YWludHkgYWJvdXQgd2hpY2ggV0ZUIHRoZWlyIFNpZ25hbC9VcGRhdGUgd2lsbCBhcHBlYXIgaW4uIEZvclxuLy8gICAgZXhhbXBsZSwgaWYgdGhleSBjYWxsIHN0YXJ0V29ya2Zsb3coKSBmb2xsb3dlZCBieSBzdGFydFVwZGF0ZSgpLCB0aGVuIHRoZXlcbi8vICAgIHdpbGwgdHlwaWNhbGx5IG5vdCBrbm93IHdoZXRoZXIgdGhlc2Ugd2lsbCBiZSBkZWxpdmVyZWQgaW4gb25lIG9yIHR3b1xuLy8gICAgV0ZUcy4gT24gdGhlIG90aGVyIGhhbmQgdGhlcmUgYXJlIHNpdHVhdGlvbnMgd2hlcmUgdGhleSB3b3VsZCBoYXZlIHJlYXNvblxuLy8gICAgdG8gYmVsaWV2ZSB0aGV5IGFyZSBpbiB0aGUgc2FtZSBXRlQsIGZvciBleGFtcGxlIGlmIHRoZXkgZG8gbm90IHN0YXJ0XG4vLyAgICBXb3JrZXIgcG9sbGluZyB1bnRpbCBhZnRlciB0aGV5IGhhdmUgdmVyaWZpZWQgdGhhdCBib3RoIHJlcXVlc3RzIGhhdmVcbi8vICAgIHN1Y2NlZWRlZC4pXG4vL1xuLy8gNS4gSWYgYW4gVXBkYXRlIGhhcyBhIHZhbGlkYXRpb24gZnVuY3Rpb24gdGhlbiBpdCBpcyBleGVjdXRlZCBpbW1lZGlhdGVseVxuLy8gICAgcHJpb3IgdG8gdGhlIGhhbmRsZXIuIChOb3RlIHRoYXQgdGhlIHZhbGlkYXRpb24gZnVuY3Rpb24gaXMgcmVxdWlyZWQgdG8gYmVcbi8vICAgIHN5bmNocm9ub3VzKS5cbmV4cG9ydCBmdW5jdGlvbiBzZXRIYW5kbGVyPFxuICBSZXQsXG4gIEFyZ3MgZXh0ZW5kcyBhbnlbXSxcbiAgVCBleHRlbmRzIFVwZGF0ZURlZmluaXRpb248UmV0LCBBcmdzPiB8IFNpZ25hbERlZmluaXRpb248QXJncz4gfCBRdWVyeURlZmluaXRpb248UmV0LCBBcmdzPixcbj4oXG4gIGRlZjogVCxcbiAgaGFuZGxlcjogSGFuZGxlcjxSZXQsIEFyZ3MsIFQ+IHwgdW5kZWZpbmVkLFxuICBvcHRpb25zPzogUXVlcnlIYW5kbGVyT3B0aW9ucyB8IFNpZ25hbEhhbmRsZXJPcHRpb25zIHwgVXBkYXRlSGFuZGxlck9wdGlvbnM8QXJncz5cbik6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dCgnV29ya2Zsb3cuc2V0SGFuZGxlciguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nKTtcbiAgY29uc3QgZGVzY3JpcHRpb24gPSBvcHRpb25zPy5kZXNjcmlwdGlvbjtcbiAgaWYgKGRlZi50eXBlID09PSAndXBkYXRlJykge1xuICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc3QgdXBkYXRlT3B0aW9ucyA9IG9wdGlvbnMgYXMgVXBkYXRlSGFuZGxlck9wdGlvbnM8QXJncz4gfCB1bmRlZmluZWQ7XG4gICAgICBjb25zdCB2YWxpZGF0b3IgPSB1cGRhdGVPcHRpb25zPy52YWxpZGF0b3IgYXMgV29ya2Zsb3dVcGRhdGVWYWxpZGF0b3JUeXBlIHwgdW5kZWZpbmVkO1xuICAgICAgYWN0aXZhdG9yLnVwZGF0ZUhhbmRsZXJzLnNldChkZWYubmFtZSwgeyBoYW5kbGVyLCB2YWxpZGF0b3IsIGRlc2NyaXB0aW9uIH0pO1xuICAgICAgYWN0aXZhdG9yLmRpc3BhdGNoQnVmZmVyZWRVcGRhdGVzKCk7XG4gICAgfSBlbHNlIGlmIChoYW5kbGVyID09IG51bGwpIHtcbiAgICAgIGFjdGl2YXRvci51cGRhdGVIYW5kbGVycy5kZWxldGUoZGVmLm5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBoYW5kbGVyIHRvIGJlIGVpdGhlciBhIGZ1bmN0aW9uIG9yICd1bmRlZmluZWQnLiBHb3Q6ICcke3R5cGVvZiBoYW5kbGVyfSdgKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGVmLnR5cGUgPT09ICdzaWduYWwnKSB7XG4gICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhY3RpdmF0b3Iuc2lnbmFsSGFuZGxlcnMuc2V0KGRlZi5uYW1lLCB7IGhhbmRsZXI6IGhhbmRsZXIgYXMgYW55LCBkZXNjcmlwdGlvbiB9KTtcbiAgICAgIGFjdGl2YXRvci5kaXNwYXRjaEJ1ZmZlcmVkU2lnbmFscygpO1xuICAgIH0gZWxzZSBpZiAoaGFuZGxlciA9PSBudWxsKSB7XG4gICAgICBhY3RpdmF0b3Iuc2lnbmFsSGFuZGxlcnMuZGVsZXRlKGRlZi5uYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgaGFuZGxlciB0byBiZSBlaXRoZXIgYSBmdW5jdGlvbiBvciAndW5kZWZpbmVkJy4gR290OiAnJHt0eXBlb2YgaGFuZGxlcn0nYCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGRlZi50eXBlID09PSAncXVlcnknKSB7XG4gICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhY3RpdmF0b3IucXVlcnlIYW5kbGVycy5zZXQoZGVmLm5hbWUsIHsgaGFuZGxlcjogaGFuZGxlciBhcyBhbnksIGRlc2NyaXB0aW9uIH0pO1xuICAgIH0gZWxzZSBpZiAoaGFuZGxlciA9PSBudWxsKSB7XG4gICAgICBhY3RpdmF0b3IucXVlcnlIYW5kbGVycy5kZWxldGUoZGVmLm5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBoYW5kbGVyIHRvIGJlIGVpdGhlciBhIGZ1bmN0aW9uIG9yICd1bmRlZmluZWQnLiBHb3Q6ICcke3R5cGVvZiBoYW5kbGVyfSdgKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgSW52YWxpZCBkZWZpbml0aW9uIHR5cGU6ICR7KGRlZiBhcyBhbnkpLnR5cGV9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBTZXQgYSBzaWduYWwgaGFuZGxlciBmdW5jdGlvbiB0aGF0IHdpbGwgaGFuZGxlIHNpZ25hbHMgY2FsbHMgZm9yIG5vbi1yZWdpc3RlcmVkIHNpZ25hbCBuYW1lcy5cbiAqXG4gKiBTaWduYWxzIGFyZSBkaXNwYXRjaGVkIHRvIHRoZSBkZWZhdWx0IHNpZ25hbCBoYW5kbGVyIGluIHRoZSBvcmRlciB0aGF0IHRoZXkgd2VyZSBhY2NlcHRlZCBieSB0aGUgc2VydmVyLlxuICpcbiAqIElmIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIG11bHRpcGxlIHRpbWVzIGZvciBhIGdpdmVuIHNpZ25hbCBvciBxdWVyeSBuYW1lIHRoZSBsYXN0IGhhbmRsZXIgd2lsbCBvdmVyd3JpdGUgYW55IHByZXZpb3VzIGNhbGxzLlxuICpcbiAqIEBwYXJhbSBoYW5kbGVyIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGhhbmRsZSBzaWduYWxzIGZvciBub24tcmVnaXN0ZXJlZCBzaWduYWwgbmFtZXMsIG9yIGB1bmRlZmluZWRgIHRvIHVuc2V0IHRoZSBoYW5kbGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0RGVmYXVsdFNpZ25hbEhhbmRsZXIoaGFuZGxlcjogRGVmYXVsdFNpZ25hbEhhbmRsZXIgfCB1bmRlZmluZWQpOiB2b2lkIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LnNldERlZmF1bHRTaWduYWxIYW5kbGVyKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLidcbiAgKTtcbiAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgYWN0aXZhdG9yLmRlZmF1bHRTaWduYWxIYW5kbGVyID0gaGFuZGxlcjtcbiAgICBhY3RpdmF0b3IuZGlzcGF0Y2hCdWZmZXJlZFNpZ25hbHMoKTtcbiAgfSBlbHNlIGlmIChoYW5kbGVyID09IG51bGwpIHtcbiAgICBhY3RpdmF0b3IuZGVmYXVsdFNpZ25hbEhhbmRsZXIgPSB1bmRlZmluZWQ7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgaGFuZGxlciB0byBiZSBlaXRoZXIgYSBmdW5jdGlvbiBvciAndW5kZWZpbmVkJy4gR290OiAnJHt0eXBlb2YgaGFuZGxlcn0nYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBVcGRhdGVzIHRoaXMgV29ya2Zsb3cncyBTZWFyY2ggQXR0cmlidXRlcyBieSBtZXJnaW5nIHRoZSBwcm92aWRlZCBgc2VhcmNoQXR0cmlidXRlc2Agd2l0aCB0aGUgZXhpc3RpbmcgU2VhcmNoXG4gKiBBdHRyaWJ1dGVzLCBgd29ya2Zsb3dJbmZvKCkuc2VhcmNoQXR0cmlidXRlc2AuXG4gKlxuICogRm9yIGV4YW1wbGUsIHRoaXMgV29ya2Zsb3cgY29kZTpcbiAqXG4gKiBgYGB0c1xuICogdXBzZXJ0U2VhcmNoQXR0cmlidXRlcyh7XG4gKiAgIEN1c3RvbUludEZpZWxkOiBbMV0sXG4gKiAgIEN1c3RvbUJvb2xGaWVsZDogW3RydWVdXG4gKiB9KTtcbiAqIHVwc2VydFNlYXJjaEF0dHJpYnV0ZXMoe1xuICogICBDdXN0b21JbnRGaWVsZDogWzQyXSxcbiAqICAgQ3VzdG9tS2V5d29yZEZpZWxkOiBbJ2R1cmFibGUgY29kZScsICdpcyBncmVhdCddXG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIHdvdWxkIHJlc3VsdCBpbiB0aGUgV29ya2Zsb3cgaGF2aW5nIHRoZXNlIFNlYXJjaCBBdHRyaWJ1dGVzOlxuICpcbiAqIGBgYHRzXG4gKiB7XG4gKiAgIEN1c3RvbUludEZpZWxkOiBbNDJdLFxuICogICBDdXN0b21Cb29sRmllbGQ6IFt0cnVlXSxcbiAqICAgQ3VzdG9tS2V5d29yZEZpZWxkOiBbJ2R1cmFibGUgY29kZScsICdpcyBncmVhdCddXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc2VhcmNoQXR0cmlidXRlcyBUaGUgUmVjb3JkIHRvIG1lcmdlLiBVc2UgYSB2YWx1ZSBvZiBgW11gIHRvIGNsZWFyIGEgU2VhcmNoIEF0dHJpYnV0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwc2VydFNlYXJjaEF0dHJpYnV0ZXMoc2VhcmNoQXR0cmlidXRlczogU2VhcmNoQXR0cmlidXRlcyk6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cudXBzZXJ0U2VhcmNoQXR0cmlidXRlcyguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nXG4gICk7XG5cbiAgaWYgKHNlYXJjaEF0dHJpYnV0ZXMgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VhcmNoQXR0cmlidXRlcyBtdXN0IGJlIGEgbm9uLW51bGwgU2VhcmNoQXR0cmlidXRlcycpO1xuICB9XG5cbiAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICB1cHNlcnRXb3JrZmxvd1NlYXJjaEF0dHJpYnV0ZXM6IHtcbiAgICAgIHNlYXJjaEF0dHJpYnV0ZXM6IG1hcFRvUGF5bG9hZHMoc2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlciwgc2VhcmNoQXR0cmlidXRlcyksXG4gICAgfSxcbiAgfSk7XG5cbiAgYWN0aXZhdG9yLm11dGF0ZVdvcmtmbG93SW5mbygoaW5mbzogV29ya2Zsb3dJbmZvKTogV29ya2Zsb3dJbmZvID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uaW5mbyxcbiAgICAgIHNlYXJjaEF0dHJpYnV0ZXM6IHtcbiAgICAgICAgLi4uaW5mby5zZWFyY2hBdHRyaWJ1dGVzLFxuICAgICAgICAuLi5zZWFyY2hBdHRyaWJ1dGVzLFxuICAgICAgfSxcbiAgICB9O1xuICB9KTtcbn1cblxuZXhwb3J0IGNvbnN0IHN0YWNrVHJhY2VRdWVyeSA9IGRlZmluZVF1ZXJ5PHN0cmluZz4oJ19fc3RhY2tfdHJhY2UnKTtcbmV4cG9ydCBjb25zdCBlbmhhbmNlZFN0YWNrVHJhY2VRdWVyeSA9IGRlZmluZVF1ZXJ5PEVuaGFuY2VkU3RhY2tUcmFjZT4oJ19fZW5oYW5jZWRfc3RhY2tfdHJhY2UnKTtcbmV4cG9ydCBjb25zdCB3b3JrZmxvd01ldGFkYXRhUXVlcnkgPSBkZWZpbmVRdWVyeTx0ZW1wb3JhbC5hcGkuc2RrLnYxLklXb3JrZmxvd01ldGFkYXRhPignX190ZW1wb3JhbF93b3JrZmxvd19tZXRhZGF0YScpO1xuIiwiaW1wb3J0IHtcbiAgcHJveHlBY3Rpdml0aWVzLFxuICBwcm94eUxvY2FsQWN0aXZpdGllcyxcbiAgZGVmaW5lU2lnbmFsLFxuICBzZXRIYW5kbGVyLFxuICBjb25kaXRpb24sXG4gIGxvZyxcbiAgc3RhcnRDaGlsZCxcbiAgc2xlZXAsXG4gIGdldEV4dGVybmFsV29ya2Zsb3dIYW5kbGUsXG4gIGRlZmluZVF1ZXJ5LFxuICBjb250aW51ZUFzTmV3LFxuICBQYXJlbnRDbG9zZVBvbGljeSxcbiAgQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlLFxuICBDYW5jZWxsYXRpb25TY29wZSxcbiAgaXNDYW5jZWxsYXRpb24sXG4gIENoaWxkV29ya2Zsb3dIYW5kbGUsXG4gIHdvcmtmbG93SW5mbyxcbn0gZnJvbSAnQHRlbXBvcmFsaW8vd29ya2Zsb3cnO1xuXG5pbXBvcnQgeyBidWlsZEdhbWVBY3Rpdml0aWVzLCBidWlsZFdvcmtlckFjdGl2aXRpZXMsIGJ1aWxkVHJhY2tlckFjdGl2aXRpZXMsIEV2ZW50IH0gZnJvbSAnLi9hY3Rpdml0aWVzJztcbmltcG9ydCB7IEdhbWVDb25maWcsIEdhbWUsIFRlYW1zLCBSb3VuZCwgU25ha2UsIFNuYWtlcywgRGlyZWN0aW9uLCBQb2ludCwgU2VnbWVudCB9IGZyb20gJy4vdHlwZXMnO1xuXG5jb25zdCBST1VORF9XRl9JRCA9ICdTbmFrZUdhbWVSb3VuZCc7XG5jb25zdCBBUFBMRV9QT0lOVFMgPSAxMDtcbmNvbnN0IFNOQUtFX01PVkVTX0JFRk9SRV9DQU4gPSAyMDtcbmNvbnN0IFNOQUtFX1dPUktFUl9ET1dOX1RJTUUgPSAnNSBzZWNvbmRzJztcblxuY29uc3QgeyBlbWl0IH0gPSBwcm94eUxvY2FsQWN0aXZpdGllczxSZXR1cm5UeXBlPHR5cGVvZiBidWlsZEdhbWVBY3Rpdml0aWVzPj4oe1xuICBzdGFydFRvQ2xvc2VUaW1lb3V0OiAnMSBzZWNvbmRzJyxcbn0pO1xuXG5jb25zdCB7IHNuYWtlVHJhY2tlciB9ID0gcHJveHlBY3Rpdml0aWVzPFJldHVyblR5cGU8dHlwZW9mIGJ1aWxkVHJhY2tlckFjdGl2aXRpZXM+Pih7XG4gIGhlYXJ0YmVhdFRpbWVvdXQ6IDUwMCxcbiAgc3RhcnRUb0Nsb3NlVGltZW91dDogJzEgaG91cicsXG4gIGNhbmNlbGxhdGlvblR5cGU6IEFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZS5XQUlUX0NBTkNFTExBVElPTl9DT01QTEVURUQsXG4gIHJldHJ5OiB7XG4gICAgaW5pdGlhbEludGVydmFsOiAxLFxuICAgIGJhY2tvZmZDb2VmZmljaWVudDogMSxcbiAgfSxcbn0pO1xuXG5mdW5jdGlvbiByYW5kb21EaXJlY3Rpb24oKTogRGlyZWN0aW9uIHtcbiAgY29uc3QgZGlyZWN0aW9uczogRGlyZWN0aW9uW10gPSBbJ3VwJywgJ2Rvd24nLCAnbGVmdCcsICdyaWdodCddO1xuICByZXR1cm4gZGlyZWN0aW9uc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBkaXJlY3Rpb25zLmxlbmd0aCldO1xufVxuXG5mdW5jdGlvbiBvcHBvc2l0ZURpcmVjdGlvbihkaXJlY3Rpb246IERpcmVjdGlvbik6IERpcmVjdGlvbiB7XG4gIGlmIChkaXJlY3Rpb24gPT09ICd1cCcpIHtcbiAgICByZXR1cm4gJ2Rvd24nO1xuICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gJ2Rvd24nKSB7XG4gICAgcmV0dXJuICd1cCc7XG4gIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSAnbGVmdCcpIHtcbiAgICByZXR1cm4gJ3JpZ2h0JztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJ2xlZnQnO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBnYW1lU3RhdGVRdWVyeSA9IGRlZmluZVF1ZXJ5PEdhbWU+KCdnYW1lU3RhdGUnKTtcbmV4cG9ydCBjb25zdCByb3VuZFN0YXRlUXVlcnkgPSBkZWZpbmVRdWVyeTxSb3VuZD4oJ3JvdW5kU3RhdGUnKTtcblxuZXhwb3J0IGNvbnN0IGdhbWVGaW5pc2hTaWduYWwgPSBkZWZpbmVTaWduYWwoJ2dhbWVGaW5pc2gnKTtcblxudHlwZSBSb3VuZFN0YXJ0U2lnbmFsID0ge1xuICBzbmFrZXM6IFNuYWtlW107XG59XG4vLyBVSSAtPiBHYW1lV29ya2Zsb3cgdG8gc3RhcnQgcm91bmRcbmV4cG9ydCBjb25zdCByb3VuZFN0YXJ0U2lnbmFsID0gZGVmaW5lU2lnbmFsPFtSb3VuZFN0YXJ0U2lnbmFsXT4oJ3JvdW5kU3RhcnQnKTtcblxuLy8gUGxheWVyIFVJIC0+IFNuYWtlV29ya2Zsb3cgdG8gY2hhbmdlIGRpcmVjdGlvblxuZXhwb3J0IGNvbnN0IHNuYWtlQ2hhbmdlRGlyZWN0aW9uU2lnbmFsID0gZGVmaW5lU2lnbmFsPFtEaXJlY3Rpb25dPignc25ha2VDaGFuZ2VEaXJlY3Rpb24nKTtcblxuLy8gKEludGVybmFsKSBTbmFrZVdvcmtmbG93IC0+IFJvdW5kIHRvIHRyaWdnZXIgYSBtb3ZlXG50eXBlIFNuYWtlTW92ZVNpZ25hbCA9IHtcbiAgaWQ6IHN0cmluZztcbiAgZGlyZWN0aW9uOiBEaXJlY3Rpb247XG59O1xuZXhwb3J0IGNvbnN0IHNuYWtlTW92ZVNpZ25hbCA9IGRlZmluZVNpZ25hbDxbU25ha2VNb3ZlU2lnbmFsXT4oJ3NuYWtlTW92ZScpO1xuXG5leHBvcnQgY29uc3Qgd29ya2VyU3RvcFNpZ25hbCA9IGRlZmluZVNpZ25hbCgnd29ya2VyU3RvcCcpO1xuXG50eXBlIFdvcmtlclN0YXJ0ZWRTaWduYWwgPSB7XG4gIGlkZW50aXR5OiBzdHJpbmc7XG59O1xuZXhwb3J0IGNvbnN0IHdvcmtlclN0YXJ0ZWRTaWduYWwgPSBkZWZpbmVTaWduYWw8W1dvcmtlclN0YXJ0ZWRTaWduYWxdPignd29ya2VyU3RhcnRlZCcpO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR2FtZVdvcmtmbG93KGNvbmZpZzogR2FtZUNvbmZpZyk6IFByb21pc2U8dm9pZD4ge1xuICBsb2cuaW5mbygnU3RhcnRpbmcgZ2FtZScpO1xuXG4gIGNvbnN0IGdhbWU6IEdhbWUgPSB7XG4gICAgY29uZmlnLFxuICAgIHRlYW1zOiBjb25maWcudGVhbU5hbWVzLnJlZHVjZTxUZWFtcz4oKGFjYywgbmFtZSkgPT4ge1xuICAgICAgYWNjW25hbWVdID0geyBuYW1lLCBzY29yZTogMCB9O1xuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCB7fSksXG4gIH07XG4gIGxldCBmaW5pc2hlZCA9IGZhbHNlO1xuICBsZXQgcm91bmRTY29wZTogQ2FuY2VsbGF0aW9uU2NvcGU7XG5cbiAgc2V0SGFuZGxlcihnYW1lU3RhdGVRdWVyeSwgKCkgPT4ge1xuICAgIHJldHVybiBnYW1lO1xuICB9KTtcblxuICBzZXRIYW5kbGVyKGdhbWVGaW5pc2hTaWduYWwsICgpID0+IHtcbiAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgcm91bmRTY29wZT8uY2FuY2VsKCk7XG4gIH0pO1xuXG4gIGxldCBuZXdSb3VuZDogUm91bmRXb3JrZmxvd0lucHV0IHwgdW5kZWZpbmVkO1xuICBzZXRIYW5kbGVyKHJvdW5kU3RhcnRTaWduYWwsIGFzeW5jICh7IHNuYWtlcyB9KSA9PiB7XG4gICAgbmV3Um91bmQgPSB7IGNvbmZpZywgdGVhbXM6IGJ1aWxkUm91bmRUZWFtcyhnYW1lKSwgc25ha2VzIH07XG4gIH0pO1xuXG4gIHdoaWxlICghZmluaXNoZWQpIHtcbiAgICBhd2FpdCBjb25kaXRpb24oKCkgPT4gZmluaXNoZWQgfHwgbmV3Um91bmQgIT09IHVuZGVmaW5lZCk7XG4gICAgaWYgKGZpbmlzaGVkKSB7IGJyZWFrOyB9XG5cbiAgICByb3VuZFNjb3BlID0gbmV3IENhbmNlbGxhdGlvblNjb3BlKCk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgcm91bmRTY29wZS5ydW4oYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCByb3VuZFdmID0gYXdhaXQgc3RhcnRDaGlsZChSb3VuZFdvcmtmbG93LCB7XG4gICAgICAgICAgd29ya2Zsb3dJZDogUk9VTkRfV0ZfSUQsXG4gICAgICAgICAgYXJnczogW25ld1JvdW5kIV0sXG4gICAgICAgICAgcGFyZW50Q2xvc2VQb2xpY3k6IFBhcmVudENsb3NlUG9saWN5LlBBUkVOVF9DTE9TRV9QT0xJQ1lfUkVRVUVTVF9DQU5DRUwsXG4gICAgICAgIH0pO1xuICAgICAgICBuZXdSb3VuZCA9IHVuZGVmaW5lZDtcblxuICAgICAgICBjb25zdCByb3VuZCA9IGF3YWl0IHJvdW5kV2YucmVzdWx0KCk7XG4gICAgICAgIGZvciAoY29uc3QgdGVhbSBvZiBPYmplY3QudmFsdWVzKHJvdW5kLnRlYW1zKSkge1xuICAgICAgICAgIGdhbWUudGVhbXNbdGVhbS5uYW1lXS5zY29yZSArPSB0ZWFtLnNjb3JlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmICghaXNDYW5jZWxsYXRpb24oZXJyKSkgeyB0aHJvdyhlcnIpOyB9XG4gICAgfVxuICB9XG59XG5cbnR5cGUgUm91bmRXb3JrZmxvd0lucHV0ID0ge1xuICBjb25maWc6IEdhbWVDb25maWc7XG4gIHRlYW1zOiBUZWFtcztcbiAgc25ha2VzOiBTbmFrZVtdO1xufVxuXG50eXBlIFNuYWtlTW92ZSA9IHtcbiAgaWQ6IHN0cmluZztcbiAgZGlyZWN0aW9uOiBEaXJlY3Rpb247XG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUm91bmRXb3JrZmxvdyh7IGNvbmZpZywgdGVhbXMsIHNuYWtlcyB9OiBSb3VuZFdvcmtmbG93SW5wdXQpOiBQcm9taXNlPFJvdW5kPiB7XG4gIGxvZy5pbmZvKCdTdGFydGluZyByb3VuZCcsIHsgY29uZmlnLCB0ZWFtcywgc25ha2VzIH0pO1xuXG4gIGNvbnN0IHJvdW5kOiBSb3VuZCA9IHtcbiAgICBjb25maWc6IGNvbmZpZyxcbiAgICBkdXJhdGlvbjogY29uZmlnLnJvdW5kRHVyYXRpb24sXG4gICAgYXBwbGVzOiB7fSxcbiAgICB0ZWFtczogdGVhbXMsXG4gICAgc25ha2VzOiBzbmFrZXMucmVkdWNlPFNuYWtlcz4oKGFjYywgc25ha2UpID0+IHsgYWNjW3NuYWtlLmlkXSA9IHNuYWtlOyByZXR1cm4gYWNjOyB9LCB7fSksXG4gICAgZmluaXNoZWQ6IGZhbHNlLFxuICAgIHdvcmtlcklkczogW10sXG4gIH07XG5cbiAgY29uc3Qgc25ha2VNb3ZlczogU25ha2VNb3ZlW10gPSBbXTtcbiAgY29uc3Qgd29ya2Vyc1N0YXJ0ZWQ6IHN0cmluZ1tdID0gW107XG5cbiAgc2V0SGFuZGxlcihyb3VuZFN0YXRlUXVlcnksICgpID0+IHtcbiAgICByZXR1cm4gcm91bmQ7XG4gIH0pO1xuXG4gIHNldEhhbmRsZXIoc25ha2VNb3ZlU2lnbmFsLCBhc3luYyAoeyBpZCwgZGlyZWN0aW9uIH0pID0+IHtcbiAgICBpZiAocm91bmQuZmluaXNoZWQpIHsgcmV0dXJuOyB9XG4gICAgc25ha2VNb3Zlcy5wdXNoKHsgaWQsIGRpcmVjdGlvbiB9KTtcbiAgfSk7XG5cbiAgc2V0SGFuZGxlcih3b3JrZXJTdGFydGVkU2lnbmFsLCBhc3luYyAoeyBpZGVudGl0eSB9KSA9PiB7XG4gICAgaWYgKHJvdW5kLmZpbmlzaGVkKSB7IHJldHVybjsgfVxuICAgIHdvcmtlcnNTdGFydGVkLnB1c2goaWRlbnRpdHkpO1xuICB9KTtcblxuICBjb25zdCBwcm9jZXNzU2lnbmFscyA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBldmVudHM6IEV2ZW50W10gPSBbXTtcbiAgICBjb25zdCBhcHBsZXNFYXRlbjogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBzaWduYWxzID0gW107XG5cbiAgICBmb3IgKGNvbnN0IG1vdmUgb2Ygc25ha2VNb3Zlcykge1xuICAgICAgY29uc3Qgc25ha2UgPSByb3VuZC5zbmFrZXNbbW92ZS5pZF07XG4gICAgICBtb3ZlU25ha2Uocm91bmQsIHNuYWtlLCBtb3ZlLmRpcmVjdGlvbik7XG4gICAgICBldmVudHMucHVzaCh7IHR5cGU6ICdzbmFrZU1vdmVkJywgcGF5bG9hZDogeyBzbmFrZUlkOiBtb3ZlLmlkLCBzZWdtZW50czogc25ha2Uuc2VnbWVudHMgfSB9KTtcbiAgICAgIGlmIChzbmFrZS5hdGVBcHBsZUlkKSB7XG4gICAgICAgIGFwcGxlc0VhdGVuLnB1c2goc25ha2UuYXRlQXBwbGVJZCk7XG4gICAgICAgIHJvdW5kLnRlYW1zW3NuYWtlLnRlYW1OYW1lXS5zY29yZSArPSBBUFBMRV9QT0lOVFM7XG4gICAgICAgIHNuYWtlLmF0ZUFwcGxlSWQgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBhcHBsZUlkIG9mIGFwcGxlc0VhdGVuKSB7XG4gICAgICBpZiAoY29uZmlnLmtpbGxXb3JrZXJzKSB7XG4gICAgICAgIGNvbnN0IHdvcmtlck1hbmFnZXIgPSB3b3JrZXJNYW5hZ2Vyc1thcHBsZUlkXTtcbiAgICAgICAgc2lnbmFscy5wdXNoKHdvcmtlck1hbmFnZXIuc2lnbmFsKHdvcmtlclN0b3BTaWduYWwpKTtcbiAgICAgICAgZXZlbnRzLnB1c2goeyB0eXBlOiAnd29ya2VyOnN0b3AnLCBwYXlsb2FkOiB7IGlkZW50aXR5OiBhcHBsZUlkIH0gfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3b3JrZXJzU3RhcnRlZC5wdXNoKGFwcGxlSWQpO1xuICAgICAgfVxuICAgICAgZGVsZXRlIHJvdW5kLmFwcGxlc1thcHBsZUlkXTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHdvcmtlcklkIG9mIHdvcmtlcnNTdGFydGVkKSB7XG4gICAgICByb3VuZC5hcHBsZXNbd29ya2VySWRdID0gcmFuZG9tRW1wdHlQb2ludChyb3VuZCk7XG4gICAgICBldmVudHMucHVzaCh7IHR5cGU6ICd3b3JrZXI6c3RhcnQnLCBwYXlsb2FkOiB7IGlkZW50aXR5OiB3b3JrZXJJZCB9IH0pO1xuICAgIH1cblxuICAgIGlmIChhcHBsZXNFYXRlbi5sZW5ndGggfHwgd29ya2Vyc1N0YXJ0ZWQubGVuZ3RoKSB7XG4gICAgICBldmVudHMucHVzaCh7IHR5cGU6ICdyb3VuZFVwZGF0ZScsIHBheWxvYWQ6IHsgcm91bmQgfSB9KTtcbiAgICB9XG5cbiAgICBzbmFrZU1vdmVzLmxlbmd0aCA9IDA7XG4gICAgd29ya2Vyc1N0YXJ0ZWQubGVuZ3RoID0gMDtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKFtlbWl0KGV2ZW50cyksIC4uLnNpZ25hbHNdKTtcbiAgfVxuXG4gIHJhbmRvbWl6ZVJvdW5kKHJvdW5kKTtcblxuICByb3VuZC53b3JrZXJJZHMgPSBjcmVhdGVXb3JrZXJJZHMoc25ha2VzLmxlbmd0aCAqIDIpO1xuICBsZXQgd29ya2VyTWFuYWdlcnM6IFJlY29yZDxzdHJpbmcsIENoaWxkV29ya2Zsb3dIYW5kbGU8dHlwZW9mIFNuYWtlV29ya2VyV29ya2Zsb3c+PiA9IHt9O1xuXG4gIHRyeSB7XG4gICAgd29ya2VyTWFuYWdlcnMgPSBhd2FpdCBzdGFydFdvcmtlck1hbmFnZXJzKHdvcmtmbG93SW5mbygpLnJ1bklkLCByb3VuZC53b3JrZXJJZHMpO1xuICAgIGF3YWl0IHN0YXJ0U25ha2VUcmFja2Vycyhyb3VuZC5zbmFrZXMpO1xuICAgIGF3YWl0IHN0YXJ0U25ha2VzKHJvdW5kLmNvbmZpZywgcm91bmQuc25ha2VzKTtcbiAgICBhd2FpdCBlbWl0KFt7IHR5cGU6ICdyb3VuZExvYWRpbmcnLCBwYXlsb2FkOiB7IHJvdW5kIH0gfV0pO1xuXG4gICAgLy8gU3RhcnQgdGhlIHJvdW5kXG4gICAgcm91bmQuc3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcblxuICAgIFByb21pc2UucmFjZShbXG4gICAgICBzbGVlcChyb3VuZC5kdXJhdGlvbiAqIDEwMDApLFxuICAgICAgQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpLmNhbmNlbFJlcXVlc3RlZCxcbiAgICBdKVxuICAgIC50aGVuKCgpID0+IGxvZy5pbmZvKCdSb3VuZCB0aW1lciBleHBpcmVkJykpXG4gICAgLmNhdGNoKCgpID0+IGxvZy5pbmZvKCdSb3VuZCBjYW5jZWxsZWQnKSlcbiAgICAuZmluYWxseSgoKSA9PiByb3VuZC5maW5pc2hlZCA9IHRydWUpO1xuXG4gICAgbG9nLmluZm8oJ1JvdW5kIHN0YXJ0ZWQnLCB7IHJvdW5kIH0pO1xuICAgIGF3YWl0IGVtaXQoW3sgdHlwZTogJ3JvdW5kU3RhcnRlZCcsIHBheWxvYWQ6IHsgcm91bmQgfSB9XSk7XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgYXdhaXQgY29uZGl0aW9uKCgpID0+IHJvdW5kLmZpbmlzaGVkIHx8IHNuYWtlTW92ZXMubGVuZ3RoID4gMCB8fCB3b3JrZXJzU3RhcnRlZC5sZW5ndGggPiAwKTtcbiAgICAgIGlmIChyb3VuZC5maW5pc2hlZCkgeyBicmVhazsgfVxuXG4gICAgICBhd2FpdCBwcm9jZXNzU2lnbmFscygpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKCFpc0NhbmNlbGxhdGlvbihlcnIpKSB7XG4gICAgICB0aHJvdyhlcnIpO1xuICAgIH1cbiAgfSBmaW5hbGx5IHtcbiAgICByb3VuZC5maW5pc2hlZCA9IHRydWU7XG4gIH1cblxuICBhd2FpdCBDYW5jZWxsYXRpb25TY29wZS5ub25DYW5jZWxsYWJsZShhc3luYyAoKSA9PiB7XG4gICAgYXdhaXQgZW1pdChbeyB0eXBlOiAncm91bmRGaW5pc2hlZCcsIHBheWxvYWQ6IHsgcm91bmQgfSB9XSk7XG4gIH0pO1xuXG4gIGxvZy5pbmZvKCdSb3VuZCBmaW5pc2hlZCcsIHsgcm91bmQgfSk7XG5cbiAgcmV0dXJuIHJvdW5kO1xufVxuXG50eXBlIFNuYWtlV29ya2VyV29ya2Zsb3dJbnB1dCA9IHtcbiAgcm91bmRJZDogc3RyaW5nO1xuICBpZGVudGl0eTogc3RyaW5nO1xufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFNuYWtlV29ya2VyV29ya2Zsb3coeyByb3VuZElkLCBpZGVudGl0eSB9OiBTbmFrZVdvcmtlcldvcmtmbG93SW5wdXQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgbGV0IHNjb3BlOiBDYW5jZWxsYXRpb25TY29wZSB8IHVuZGVmaW5lZDtcblxuICBzZXRIYW5kbGVyKHdvcmtlclN0b3BTaWduYWwsICgpID0+IHtcbiAgICBpZiAoc2NvcGUpIHsgc2NvcGUuY2FuY2VsKCkgfVxuICB9KTtcblxuICBsZXQgdGFza1F1ZXVlOiBzdHJpbmc7XG4gIGlmIChpZGVudGl0eSA9PT0gJ3NuYWtlLXdvcmtlci0xJyB8fCBpZGVudGl0eSA9PT0gJ3NuYWtlLXdvcmtlci0yJykge1xuICAgIHRhc2tRdWV1ZSA9ICdzbmFrZS13b3JrZXJzLTEnO1xuICB9IGVsc2UgaWYgKGlkZW50aXR5ID09PSAnc25ha2Utd29ya2VyLTMnIHx8IGlkZW50aXR5ID09PSAnc25ha2Utd29ya2VyLTQnKSB7XG4gICAgdGFza1F1ZXVlID0gJ3NuYWtlLXdvcmtlcnMtMic7XG4gIH0gZWxzZSB7XG4gICAgdGFza1F1ZXVlID0gJ3NuYWtlLXdvcmtlcnMtMyc7XG4gIH1cblxuICBjb25zdCB7IHNuYWtlV29ya2VyIH0gPSBwcm94eUFjdGl2aXRpZXM8UmV0dXJuVHlwZTx0eXBlb2YgYnVpbGRXb3JrZXJBY3Rpdml0aWVzPj4oe1xuICAgIHRhc2tRdWV1ZSxcbiAgICBzdGFydFRvQ2xvc2VUaW1lb3V0OiAnMSB5ZWFyJyxcbiAgICBoZWFydGJlYXRUaW1lb3V0OiA1MDAsXG4gICAgY2FuY2VsbGF0aW9uVHlwZTogQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlLldBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRCxcbiAgfSk7XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICB0cnkge1xuICAgICAgc2NvcGUgPSBuZXcgQ2FuY2VsbGF0aW9uU2NvcGUoKTtcbiAgICAgIGF3YWl0IHNjb3BlLnJ1bigoKSA9PiBzbmFrZVdvcmtlcihyb3VuZElkLCBpZGVudGl0eSkpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKGlzQ2FuY2VsbGF0aW9uKGVycikpIHtcbiAgICAgICAgYXdhaXQgc2xlZXAoU05BS0VfV09SS0VSX0RPV05fVElNRSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2cuZXJyb3IoJ1NuYWtlV29ya2VyIGZhaWx1cmUsIHJldHJ5aW5nJywgeyBlcnJvcjogZXJyIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG50eXBlIFNuYWtlV29ya2Zsb3dJbnB1dCA9IHtcbiAgcm91bmRJZDogc3RyaW5nO1xuICBpZDogc3RyaW5nO1xuICBkaXJlY3Rpb246IERpcmVjdGlvbjtcbiAgbm9tc1Blck1vdmU6IG51bWJlcjtcbiAgbm9tRHVyYXRpb246IG51bWJlcjtcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBTbmFrZVdvcmtmbG93KHsgcm91bmRJZCwgaWQsIGRpcmVjdGlvbiwgbm9tc1Blck1vdmUsIG5vbUR1cmF0aW9uIH06IFNuYWtlV29ya2Zsb3dJbnB1dCk6IFByb21pc2U8dm9pZD4ge1xuICBzZXRIYW5kbGVyKHNuYWtlQ2hhbmdlRGlyZWN0aW9uU2lnbmFsLCAobmV3RGlyZWN0aW9uKSA9PiB7XG4gICAgZGlyZWN0aW9uID0gbmV3RGlyZWN0aW9uO1xuICB9KTtcblxuICBjb25zdCB7IHNuYWtlTm9tIH0gPSBwcm94eUFjdGl2aXRpZXM8UmV0dXJuVHlwZSA8dHlwZW9mIGJ1aWxkR2FtZUFjdGl2aXRpZXM+Pih7XG4gICAgc3RhcnRUb0Nsb3NlVGltZW91dDogbm9tRHVyYXRpb24gKiAyLFxuICAgIHRhc2tRdWV1ZTogJ2dhbWUnLFxuICAgIHJldHJ5OiB7XG4gICAgICBpbml0aWFsSW50ZXJ2YWw6IDEsXG4gICAgICBiYWNrb2ZmQ29lZmZpY2llbnQ6IDEsXG4gICAgfVxuICB9KTtcblxuICBjb25zdCByb3VuZCA9IGdldEV4dGVybmFsV29ya2Zsb3dIYW5kbGUocm91bmRJZCk7XG4gIGNvbnN0IG5vbXMgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiBub21zUGVyTW92ZSB9KTtcbiAgbGV0IG1vdmVzID0gMDtcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIGF3YWl0IFByb21pc2UuYWxsKG5vbXMubWFwKCgpID0+IHNuYWtlTm9tKGlkLCBub21EdXJhdGlvbikpKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgcm91bmQuc2lnbmFsKHNuYWtlTW92ZVNpZ25hbCwgeyBpZCwgZGlyZWN0aW9uIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nLmluZm8oJ0Nhbm5vdCBzaWduYWwgcm91bmQsIGV4aXRpbmcnKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAobW92ZXMrKyA+IFNOQUtFX01PVkVTX0JFRk9SRV9DQU4pIHtcbiAgICAgIGF3YWl0IGNvbnRpbnVlQXNOZXc8dHlwZW9mIFNuYWtlV29ya2Zsb3c+KHsgcm91bmRJZCwgaWQsIGRpcmVjdGlvbiwgbm9tc1Blck1vdmUsIG5vbUR1cmF0aW9uIH0pO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBtb3ZlU25ha2Uocm91bmQ6IFJvdW5kLCBzbmFrZTogU25ha2UsIGRpcmVjdGlvbjogRGlyZWN0aW9uKSB7XG4gIGNvbnN0IGNvbmZpZyA9IHJvdW5kLmNvbmZpZztcblxuICBsZXQgaGVhZFNlZ21lbnQgPSBzbmFrZS5zZWdtZW50c1swXTtcbiAgbGV0IHRhaWxTZWdtZW50ID0gc25ha2Uuc2VnbWVudHNbc25ha2Uuc2VnbWVudHMubGVuZ3RoIC0gMV07XG5cbiAgY29uc3QgY3VycmVudERpcmVjdGlvbiA9IGhlYWRTZWdtZW50LmRpcmVjdGlvbjtcbiAgbGV0IG5ld0RpcmVjdGlvbiA9IGRpcmVjdGlvbjtcblxuICAvLyBZb3UgY2FuJ3QgZ28gYmFjayBvbiB5b3Vyc2VsZlxuICBpZiAobmV3RGlyZWN0aW9uID09PSBvcHBvc2l0ZURpcmVjdGlvbihjdXJyZW50RGlyZWN0aW9uKSkge1xuICAgIG5ld0RpcmVjdGlvbiA9IGN1cnJlbnREaXJlY3Rpb247XG4gIH1cblxuICBsZXQgY3VycmVudEhlYWQgPSBoZWFkU2VnbWVudC5oZWFkO1xuXG4gIC8vIENyZWF0ZSBhIG5ldyBzZWdtZW50IGlmIHdlJ3JlIGNoYW5naW5nIGRpcmVjdGlvbiBvciBoaXR0aW5nIGFuIGVkZ2VcbiAgaWYgKG5ld0RpcmVjdGlvbiAhPT0gY3VycmVudERpcmVjdGlvbiB8fCBhZ2FpbnN0QW5FZGdlKHJvdW5kLCBjdXJyZW50SGVhZCwgZGlyZWN0aW9uKSkge1xuICAgIGhlYWRTZWdtZW50ID0geyBoZWFkOiB7IHg6IGN1cnJlbnRIZWFkLngsIHk6IGN1cnJlbnRIZWFkLnkgfSwgZGlyZWN0aW9uOiBuZXdEaXJlY3Rpb24sIGxlbmd0aDogMCB9O1xuICAgIHNuYWtlLnNlZ21lbnRzLnVuc2hpZnQoaGVhZFNlZ21lbnQpO1xuICB9XG5cbiAgbGV0IG5ld0hlYWQ6IFBvaW50ID0geyB4OiBjdXJyZW50SGVhZC54LCB5OiBjdXJyZW50SGVhZC55IH07XG5cbiAgLy8gTW92ZSB0aGUgaGVhZCBzZWdtZW50LCB3cmFwcGluZyBhcm91bmQgaWYgd2UgYXJlIG1vdmluZyBwYXN0IHRoZSBlZGdlXG4gIGlmIChuZXdEaXJlY3Rpb24gPT09ICd1cCcpIHtcbiAgICBuZXdIZWFkLnkgPSBuZXdIZWFkLnkgPD0gMSA/IGNvbmZpZy5oZWlnaHQgOiBjdXJyZW50SGVhZC55IC0gMTtcbiAgfSBlbHNlIGlmIChuZXdEaXJlY3Rpb24gPT09ICdkb3duJykge1xuICAgIG5ld0hlYWQueSA9IG5ld0hlYWQueSA+PSBjb25maWcuaGVpZ2h0ID8gMSA6IGN1cnJlbnRIZWFkLnkgKyAxO1xuICB9IGVsc2UgaWYgKG5ld0RpcmVjdGlvbiA9PT0gJ2xlZnQnKSB7XG4gICAgbmV3SGVhZC54ID0gbmV3SGVhZC54IDw9IDEgPyBjb25maWcud2lkdGggOiBjdXJyZW50SGVhZC54IC0gMTtcbiAgfSBlbHNlIGlmIChuZXdEaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcbiAgICBuZXdIZWFkLnggPSBuZXdIZWFkLnggPj0gY29uZmlnLndpZHRoID8gMSA6IGN1cnJlbnRIZWFkLnggKyAxO1xuICB9XG5cbiAgLy8gQ2hlY2sgaWYgd2UndmUgaGl0IGFub3RoZXIgc25ha2VcbiAgaWYgKHNuYWtlQXQocm91bmQsIG5ld0hlYWQpKSB7XG4gICAgLy8gVHJ1bmNhdGUgdGhlIHNuYWtlIHRvIGp1c3QgdGhlIGhlYWQsIGFuZCBpZ25vcmUgdGhlIHJlcXVlc3RlZCBtb3ZlXG4gICAgaGVhZFNlZ21lbnQubGVuZ3RoID0gMTtcbiAgICBzbmFrZS5zZWdtZW50cyA9IFtoZWFkU2VnbWVudF07XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gQ2hlY2sgaWYgd2UndmUgaGl0IGFuIGFwcGxlXG4gIGNvbnN0IGFwcGxlSWQgPSBhcHBsZUF0KHJvdW5kLCBuZXdIZWFkKTtcbiAgaWYgKGFwcGxlSWQgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIFNuYWtlIGF0ZSBhbiBhcHBsZSwgc2V0IGFwcGxlSWRcbiAgICBzbmFrZS5hdGVBcHBsZUlkID0gYXBwbGVJZDtcbiAgICB0YWlsU2VnbWVudC5sZW5ndGggKz0gMTsgIC8vIEdyb3cgdGhlIHNuYWtlIGJ5IGluY3JlYXNpbmcgdGhlIHRhaWwgbGVuZ3RoXG4gIH1cblxuICBoZWFkU2VnbWVudC5oZWFkID0gbmV3SGVhZDtcblxuICAvLyBNYW5hZ2Ugc25ha2Ugc2VnbWVudCBncm93dGggYW5kIHNocmlua2luZ1xuICBpZiAoc25ha2Uuc2VnbWVudHMubGVuZ3RoID4gMSkge1xuICAgIGhlYWRTZWdtZW50Lmxlbmd0aCArPSAxO1xuICAgIHRhaWxTZWdtZW50Lmxlbmd0aCAtPSAxO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSB0YWlsIHNlZ21lbnQgaWYgaXRzIGxlbmd0aCByZWFjaGVzIDBcbiAgICBpZiAodGFpbFNlZ21lbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICBzbmFrZS5zZWdtZW50cy5wb3AoKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYWdhaW5zdEFuRWRnZShyb3VuZDogUm91bmQsIHBvaW50OiBQb2ludCwgZGlyZWN0aW9uOiBEaXJlY3Rpb24pOiBib29sZWFuIHtcbiAgaWYgKGRpcmVjdGlvbiA9PT0gJ3VwJykge1xuICAgIHJldHVybiBwb2ludC55ID09PSAxO1xuICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gJ2Rvd24nKSB7XG4gICAgcmV0dXJuIHBvaW50LnkgPT09IHJvdW5kLmNvbmZpZy5oZWlnaHQ7XG4gIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSAnbGVmdCcpIHtcbiAgICByZXR1cm4gcG9pbnQueCA9PT0gMTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcG9pbnQueCA9PT0gcm91bmQuY29uZmlnLndpZHRoO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGxlQXQocm91bmQ6IFJvdW5kLCBwb2ludDogUG9pbnQpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICBmb3IgKGNvbnN0IFtpZCwgYXBwbGVdIG9mIE9iamVjdC5lbnRyaWVzKHJvdW5kLmFwcGxlcykpIHtcbiAgICBpZiAoYXBwbGUueCA9PT0gcG9pbnQueCAmJiBhcHBsZS55ID09PSBwb2ludC55KSB7XG4gICAgICByZXR1cm4gaWQ7XG4gICAgfVxuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZVBvc2l0aW9uKHNlZ21lbnQ6IFNlZ21lbnQpOiB7IHQ6IG51bWJlciwgbDogbnVtYmVyLCBiOiBudW1iZXIsIHI6IG51bWJlciB9IHtcbiAgY29uc3QgeyBkaXJlY3Rpb24sIGhlYWQ6IHN0YXJ0LCBsZW5ndGggfSA9IHNlZ21lbnQ7XG4gIGxldCBbdCwgYl0gPSBbc3RhcnQueSwgc3RhcnQueV07XG4gIGxldCBbbCwgcl0gPSBbc3RhcnQueCwgc3RhcnQueF07XG5cbiAgaWYgKGRpcmVjdGlvbiA9PT0gJ3VwJykge1xuICAgIGIgPSB0ICsgKGxlbmd0aCAtIDEpO1xuICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gJ2Rvd24nKSB7XG4gICAgdCA9IGIgLSAobGVuZ3RoIC0gMSk7XG4gIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSAnbGVmdCcpIHtcbiAgICByID0gbCArIChsZW5ndGggLSAxKTtcbiAgfSBlbHNlIHtcbiAgICBsID0gciAtIChsZW5ndGggLSAxKTtcbiAgfVxuXG4gIHJldHVybiB7IHQsIGwsIGIsIHIgfTtcbn1cblxuZnVuY3Rpb24gc25ha2VBdChyb3VuZDogUm91bmQsIHBvaW50OiBQb2ludCk6IFNuYWtlIHwgdW5kZWZpbmVkIHtcbiAgZm9yIChjb25zdCBzbmFrZSBvZiBPYmplY3QudmFsdWVzKHJvdW5kLnNuYWtlcykpIHtcbiAgICBmb3IgKGNvbnN0IHNlZ21lbnQgb2Ygc25ha2Uuc2VnbWVudHMpIHtcbiAgICAgIGNvbnN0IHBvcyA9IGNhbGN1bGF0ZVBvc2l0aW9uKHNlZ21lbnQpO1xuXG4gICAgICBpZiAocG9pbnQueCA+PSBwb3MubCAmJiBwb2ludC54IDw9IHBvcy5yICYmIHBvaW50LnkgPj0gcG9zLnQgJiYgcG9pbnQueSA8PSBwb3MuYikge1xuICAgICAgICByZXR1cm4gc25ha2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gcmFuZG9tRW1wdHlQb2ludChyb3VuZDogUm91bmQpOiBQb2ludCB7XG4gIGxldCBwb2ludCA9IHsgeDogTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkgKiByb3VuZC5jb25maWcud2lkdGgpLCB5OiBNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIHJvdW5kLmNvbmZpZy5oZWlnaHQpIH07XG4gIC8vIENoZWNrIGlmIGFueSBhcHBsZSBpcyBhdCB0aGUgcG9pbnRcbiAgd2hpbGUgKGFwcGxlQXQocm91bmQsIHBvaW50KSB8fCBzbmFrZUF0KHJvdW5kLCBwb2ludCkpIHtcbiAgICBwb2ludCA9IHsgeDogTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkgKiByb3VuZC5jb25maWcud2lkdGgpLCB5OiBNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIHJvdW5kLmNvbmZpZy5oZWlnaHQpIH07XG4gIH1cbiAgcmV0dXJuIHBvaW50O1xufVxuXG5mdW5jdGlvbiBidWlsZFJvdW5kVGVhbXMoZ2FtZTogR2FtZSk6IFRlYW1zIHtcbiAgY29uc3QgdGVhbXM6IFRlYW1zID0ge307XG5cbiAgZm9yIChjb25zdCB0ZWFtIG9mIE9iamVjdC52YWx1ZXMoZ2FtZS50ZWFtcykpIHtcbiAgICB0ZWFtc1t0ZWFtLm5hbWVdID0geyBuYW1lOiB0ZWFtLm5hbWUsIHNjb3JlOiAwIH07XG4gIH1cblxuICByZXR1cm4gdGVhbXM7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVdvcmtlcklkcyhjb3VudDogbnVtYmVyKTogc3RyaW5nW10ge1xuICByZXR1cm4gQXJyYXkuZnJvbSh7IGxlbmd0aDogY291bnQgfSkubWFwKChfLCBpKSA9PiB7XG4gICAgcmV0dXJuIGBzbmFrZS13b3JrZXItJHtpICsgMX1gO1xuICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc3RhcnRXb3JrZXJNYW5hZ2VycyhydW5JZDogc3RyaW5nLCBpZGVudGl0aWVzOiBzdHJpbmdbXSk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgQ2hpbGRXb3JrZmxvd0hhbmRsZTx0eXBlb2YgU25ha2VXb3JrZXJXb3JrZmxvdz4+PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgaGFuZGxlcyA9IGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgaWRlbnRpdGllcy5tYXAoaWRlbnRpdHkgPT5cbiAgICAgICAgc3RhcnRDaGlsZChTbmFrZVdvcmtlcldvcmtmbG93LCB7XG4gICAgICAgICAgd29ya2Zsb3dJZDogYCR7cnVuSWR9LSR7aWRlbnRpdHl9YCxcbiAgICAgICAgICBhcmdzOiBbeyByb3VuZElkOiBST1VORF9XRl9JRCwgaWRlbnRpdHkgfV0sXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgKTtcblxuICAgIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICBpZGVudGl0aWVzLm1hcCgoaWRlbnRpdHksIGluZGV4KSA9PiBbaWRlbnRpdHksIGhhbmRsZXNbaW5kZXhdXSlcbiAgICApO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBsb2cuZXJyb3IoJ0ZhaWxlZCB0byBzdGFydCB3b3JrZXIgbWFuYWdlcnMnLCB7IGVycm9yOiBlcnIgfSk7XG4gICAgdGhyb3cgZXJyO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN0YXJ0U25ha2VUcmFja2VycyhzbmFrZXM6IFNuYWtlcykge1xuICBmb3IgKGNvbnN0IHNuYWtlIG9mIE9iamVjdC52YWx1ZXMoc25ha2VzKSkge1xuICAgIHNuYWtlVHJhY2tlcihzbmFrZS5pZCk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gc3RhcnRTbmFrZXMoY29uZmlnOiBHYW1lQ29uZmlnLCBzbmFrZXM6IFNuYWtlcykge1xuICBjb25zdCBjb21tYW5kcyA9IE9iamVjdC52YWx1ZXMoc25ha2VzKS5tYXAoKHNuYWtlKSA9PlxuICAgIHN0YXJ0Q2hpbGQoU25ha2VXb3JrZmxvdywge1xuICAgICAgd29ya2Zsb3dJZDogc25ha2UuaWQsXG4gICAgICB0YXNrUXVldWU6ICdzbmFrZXMnLFxuICAgICAgd29ya2Zsb3dUYXNrVGltZW91dDogJzEgc2Vjb25kJyxcbiAgICAgIGFyZ3M6IFt7XG4gICAgICAgIHJvdW5kSWQ6IFJPVU5EX1dGX0lELFxuICAgICAgICBpZDogc25ha2UuaWQsXG4gICAgICAgIGRpcmVjdGlvbjogc25ha2Uuc2VnbWVudHNbMF0uZGlyZWN0aW9uLFxuICAgICAgICBub21zUGVyTW92ZTogY29uZmlnLm5vbXNQZXJNb3ZlLFxuICAgICAgICBub21EdXJhdGlvbjogY29uZmlnLm5vbUR1cmF0aW9uLFxuICAgICAgfV1cbiAgICB9KVxuICApXG5cbiAgdHJ5IHtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChjb21tYW5kcyk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGxvZy5lcnJvcignRmFpbGVkIHRvIHN0YXJ0IHNuYWtlcycsIHsgZXJyb3I6IGVyciB9KTtcbiAgICB0aHJvdyhlcnIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJhbmRvbWl6ZVJvdW5kKHJvdW5kOiBSb3VuZCkge1xuICBmb3IgKGNvbnN0IHNuYWtlIG9mIE9iamVjdC52YWx1ZXMocm91bmQuc25ha2VzKSkge1xuICAgIHNuYWtlLnNlZ21lbnRzID0gW1xuICAgICAgeyBoZWFkOiByYW5kb21FbXB0eVBvaW50KHJvdW5kKSwgZGlyZWN0aW9uOiByYW5kb21EaXJlY3Rpb24oKSwgbGVuZ3RoOiAxIH1cbiAgICBdXG4gIH1cbn1cbiIsIi8qIChpZ25vcmVkKSAqLyIsIi8qIChpZ25vcmVkKSAqLyIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLy8gSGVscGVycy5cbmNvbnN0IHMgPSAxMDAwO1xuY29uc3QgbSA9IHMgKiA2MDtcbmNvbnN0IGggPSBtICogNjA7XG5jb25zdCBkID0gaCAqIDI0O1xuY29uc3QgdyA9IGQgKiA3O1xuY29uc3QgeSA9IGQgKiAzNjUuMjU7XG5mdW5jdGlvbiBtcyh2YWx1ZSwgb3B0aW9ucykge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zPy5sb25nID8gZm10TG9uZyh2YWx1ZSkgOiBmbXRTaG9ydCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdWYWx1ZSBpcyBub3QgYSBzdHJpbmcgb3IgbnVtYmVyLicpO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGlzRXJyb3IoZXJyb3IpXG4gICAgICAgICAgICA/IGAke2Vycm9yLm1lc3NhZ2V9LiB2YWx1ZT0ke0pTT04uc3RyaW5naWZ5KHZhbHVlKX1gXG4gICAgICAgICAgICA6ICdBbiB1bmtub3duIGVycm9yIGhhcyBvY2N1cmVkLic7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICB9XG59XG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBgc3RyYCBhbmQgcmV0dXJuIG1pbGxpc2Vjb25kcy5cbiAqL1xuZnVuY3Rpb24gcGFyc2Uoc3RyKSB7XG4gICAgc3RyID0gU3RyaW5nKHN0cik7XG4gICAgaWYgKHN0ci5sZW5ndGggPiAxMDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdWYWx1ZSBleGNlZWRzIHRoZSBtYXhpbXVtIGxlbmd0aCBvZiAxMDAgY2hhcmFjdGVycy4nKTtcbiAgICB9XG4gICAgY29uc3QgbWF0Y2ggPSAvXigtPyg/OlxcZCspP1xcLj9cXGQrKSAqKG1pbGxpc2Vjb25kcz98bXNlY3M/fG1zfHNlY29uZHM/fHNlY3M/fHN8bWludXRlcz98bWlucz98bXxob3Vycz98aHJzP3xofGRheXM/fGR8d2Vla3M/fHd8eWVhcnM/fHlycz98eSk/JC9pLmV4ZWMoc3RyKTtcbiAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIHJldHVybiBOYU47XG4gICAgfVxuICAgIGNvbnN0IG4gPSBwYXJzZUZsb2F0KG1hdGNoWzFdKTtcbiAgICBjb25zdCB0eXBlID0gKG1hdGNoWzJdIHx8ICdtcycpLnRvTG93ZXJDYXNlKCk7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ3llYXJzJzpcbiAgICAgICAgY2FzZSAneWVhcic6XG4gICAgICAgIGNhc2UgJ3lycyc6XG4gICAgICAgIGNhc2UgJ3lyJzpcbiAgICAgICAgY2FzZSAneSc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIHk7XG4gICAgICAgIGNhc2UgJ3dlZWtzJzpcbiAgICAgICAgY2FzZSAnd2Vlayc6XG4gICAgICAgIGNhc2UgJ3cnOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiB3O1xuICAgICAgICBjYXNlICdkYXlzJzpcbiAgICAgICAgY2FzZSAnZGF5JzpcbiAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIGQ7XG4gICAgICAgIGNhc2UgJ2hvdXJzJzpcbiAgICAgICAgY2FzZSAnaG91cic6XG4gICAgICAgIGNhc2UgJ2hycyc6XG4gICAgICAgIGNhc2UgJ2hyJzpcbiAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIGg7XG4gICAgICAgIGNhc2UgJ21pbnV0ZXMnOlxuICAgICAgICBjYXNlICdtaW51dGUnOlxuICAgICAgICBjYXNlICdtaW5zJzpcbiAgICAgICAgY2FzZSAnbWluJzpcbiAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIG07XG4gICAgICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgICAgICBjYXNlICdzZWNvbmQnOlxuICAgICAgICBjYXNlICdzZWNzJzpcbiAgICAgICAgY2FzZSAnc2VjJzpcbiAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIHM7XG4gICAgICAgIGNhc2UgJ21pbGxpc2Vjb25kcyc6XG4gICAgICAgIGNhc2UgJ21pbGxpc2Vjb25kJzpcbiAgICAgICAgY2FzZSAnbXNlY3MnOlxuICAgICAgICBjYXNlICdtc2VjJzpcbiAgICAgICAgY2FzZSAnbXMnOlxuICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBvY2N1ci5cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHVuaXQgJHt0eXBlfSB3YXMgbWF0Y2hlZCwgYnV0IG5vIG1hdGNoaW5nIGNhc2UgZXhpc3RzLmApO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IG1zO1xuLyoqXG4gKiBTaG9ydCBmb3JtYXQgZm9yIGBtc2AuXG4gKi9cbmZ1bmN0aW9uIGZtdFNob3J0KG1zKSB7XG4gICAgY29uc3QgbXNBYnMgPSBNYXRoLmFicyhtcyk7XG4gICAgaWYgKG1zQWJzID49IGQpIHtcbiAgICAgICAgcmV0dXJuIGAke01hdGgucm91bmQobXMgLyBkKX1kYDtcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IGgpIHtcbiAgICAgICAgcmV0dXJuIGAke01hdGgucm91bmQobXMgLyBoKX1oYDtcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IG0pIHtcbiAgICAgICAgcmV0dXJuIGAke01hdGgucm91bmQobXMgLyBtKX1tYDtcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IHMpIHtcbiAgICAgICAgcmV0dXJuIGAke01hdGgucm91bmQobXMgLyBzKX1zYDtcbiAgICB9XG4gICAgcmV0dXJuIGAke21zfW1zYDtcbn1cbi8qKlxuICogTG9uZyBmb3JtYXQgZm9yIGBtc2AuXG4gKi9cbmZ1bmN0aW9uIGZtdExvbmcobXMpIHtcbiAgICBjb25zdCBtc0FicyA9IE1hdGguYWJzKG1zKTtcbiAgICBpZiAobXNBYnMgPj0gZCkge1xuICAgICAgICByZXR1cm4gcGx1cmFsKG1zLCBtc0FicywgZCwgJ2RheScpO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gaCkge1xuICAgICAgICByZXR1cm4gcGx1cmFsKG1zLCBtc0FicywgaCwgJ2hvdXInKTtcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IG0pIHtcbiAgICAgICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIG0sICdtaW51dGUnKTtcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IHMpIHtcbiAgICAgICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIHMsICdzZWNvbmQnKTtcbiAgICB9XG4gICAgcmV0dXJuIGAke21zfSBtc2A7XG59XG4vKipcbiAqIFBsdXJhbGl6YXRpb24gaGVscGVyLlxuICovXG5mdW5jdGlvbiBwbHVyYWwobXMsIG1zQWJzLCBuLCBuYW1lKSB7XG4gICAgY29uc3QgaXNQbHVyYWwgPSBtc0FicyA+PSBuICogMS41O1xuICAgIHJldHVybiBgJHtNYXRoLnJvdW5kKG1zIC8gbil9ICR7bmFtZX0ke2lzUGx1cmFsID8gJ3MnIDogJyd9YDtcbn1cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciBlcnJvcnMuXG4gKi9cbmZ1bmN0aW9uIGlzRXJyb3IoZXJyb3IpIHtcbiAgICByZXR1cm4gdHlwZW9mIGVycm9yID09PSAnb2JqZWN0JyAmJiBlcnJvciAhPT0gbnVsbCAmJiAnbWVzc2FnZScgaW4gZXJyb3I7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7XG4iLCIvLyBHRU5FUkFURUQgRklMRS4gRE8gTk9UIEVESVQuXG52YXIgTG9uZyA9IChmdW5jdGlvbihleHBvcnRzKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICBcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbiAgfSk7XG4gIGV4cG9ydHMuZGVmYXVsdCA9IHZvaWQgMDtcbiAgXG4gIC8qKlxuICAgKiBAbGljZW5zZVxuICAgKiBDb3B5cmlnaHQgMjAwOSBUaGUgQ2xvc3VyZSBMaWJyYXJ5IEF1dGhvcnNcbiAgICogQ29weXJpZ2h0IDIwMjAgRGFuaWVsIFdpcnR6IC8gVGhlIGxvbmcuanMgQXV0aG9ycy5cbiAgICpcbiAgICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAgICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICAgKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAgICpcbiAgICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICAgKlxuICAgKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gICAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gICAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gICAqXG4gICAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG4gICAqL1xuICAvLyBXZWJBc3NlbWJseSBvcHRpbWl6YXRpb25zIHRvIGRvIG5hdGl2ZSBpNjQgbXVsdGlwbGljYXRpb24gYW5kIGRpdmlkZVxuICB2YXIgd2FzbSA9IG51bGw7XG4gIFxuICB0cnkge1xuICAgIHdhc20gPSBuZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UobmV3IFdlYkFzc2VtYmx5Lk1vZHVsZShuZXcgVWludDhBcnJheShbMCwgOTcsIDExNSwgMTA5LCAxLCAwLCAwLCAwLCAxLCAxMywgMiwgOTYsIDAsIDEsIDEyNywgOTYsIDQsIDEyNywgMTI3LCAxMjcsIDEyNywgMSwgMTI3LCAzLCA3LCA2LCAwLCAxLCAxLCAxLCAxLCAxLCA2LCA2LCAxLCAxMjcsIDEsIDY1LCAwLCAxMSwgNywgNTAsIDYsIDMsIDEwOSwgMTE3LCAxMDgsIDAsIDEsIDUsIDEwMCwgMTA1LCAxMTgsIDk1LCAxMTUsIDAsIDIsIDUsIDEwMCwgMTA1LCAxMTgsIDk1LCAxMTcsIDAsIDMsIDUsIDExNCwgMTAxLCAxMDksIDk1LCAxMTUsIDAsIDQsIDUsIDExNCwgMTAxLCAxMDksIDk1LCAxMTcsIDAsIDUsIDgsIDEwMywgMTAxLCAxMTYsIDk1LCAxMDQsIDEwNSwgMTAzLCAxMDQsIDAsIDAsIDEwLCAxOTEsIDEsIDYsIDQsIDAsIDM1LCAwLCAxMSwgMzYsIDEsIDEsIDEyNiwgMzIsIDAsIDE3MywgMzIsIDEsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMzIsIDIsIDE3MywgMzIsIDMsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMTI2LCAzNCwgNCwgNjYsIDMyLCAxMzUsIDE2NywgMzYsIDAsIDMyLCA0LCAxNjcsIDExLCAzNiwgMSwgMSwgMTI2LCAzMiwgMCwgMTczLCAzMiwgMSwgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAzMiwgMiwgMTczLCAzMiwgMywgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAxMjcsIDM0LCA0LCA2NiwgMzIsIDEzNSwgMTY3LCAzNiwgMCwgMzIsIDQsIDE2NywgMTEsIDM2LCAxLCAxLCAxMjYsIDMyLCAwLCAxNzMsIDMyLCAxLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDMyLCAyLCAxNzMsIDMyLCAzLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDEyOCwgMzQsIDQsIDY2LCAzMiwgMTM1LCAxNjcsIDM2LCAwLCAzMiwgNCwgMTY3LCAxMSwgMzYsIDEsIDEsIDEyNiwgMzIsIDAsIDE3MywgMzIsIDEsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMzIsIDIsIDE3MywgMzIsIDMsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMTI5LCAzNCwgNCwgNjYsIDMyLCAxMzUsIDE2NywgMzYsIDAsIDMyLCA0LCAxNjcsIDExLCAzNiwgMSwgMSwgMTI2LCAzMiwgMCwgMTczLCAzMiwgMSwgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAzMiwgMiwgMTczLCAzMiwgMywgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAxMzAsIDM0LCA0LCA2NiwgMzIsIDEzNSwgMTY3LCAzNiwgMCwgMzIsIDQsIDE2NywgMTFdKSksIHt9KS5leHBvcnRzO1xuICB9IGNhdGNoIChlKSB7Ly8gbm8gd2FzbSBzdXBwb3J0IDooXG4gIH1cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSA2NCBiaXQgdHdvJ3MtY29tcGxlbWVudCBpbnRlZ2VyLCBnaXZlbiBpdHMgbG93IGFuZCBoaWdoIDMyIGJpdCB2YWx1ZXMgYXMgKnNpZ25lZCogaW50ZWdlcnMuXG4gICAqICBTZWUgdGhlIGZyb20qIGZ1bmN0aW9ucyBiZWxvdyBmb3IgbW9yZSBjb252ZW5pZW50IHdheXMgb2YgY29uc3RydWN0aW5nIExvbmdzLlxuICAgKiBAZXhwb3J0cyBMb25nXG4gICAqIEBjbGFzcyBBIExvbmcgY2xhc3MgZm9yIHJlcHJlc2VudGluZyBhIDY0IGJpdCB0d28ncy1jb21wbGVtZW50IGludGVnZXIgdmFsdWUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsb3cgVGhlIGxvdyAoc2lnbmVkKSAzMiBiaXRzIG9mIHRoZSBsb25nXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoaWdoIFRoZSBoaWdoIChzaWduZWQpIDMyIGJpdHMgb2YgdGhlIGxvbmdcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIFxuICBcbiAgZnVuY3Rpb24gTG9uZyhsb3csIGhpZ2gsIHVuc2lnbmVkKSB7XG4gICAgLyoqXG4gICAgICogVGhlIGxvdyAzMiBiaXRzIGFzIGEgc2lnbmVkIHZhbHVlLlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5sb3cgPSBsb3cgfCAwO1xuICAgIC8qKlxuICAgICAqIFRoZSBoaWdoIDMyIGJpdHMgYXMgYSBzaWduZWQgdmFsdWUuXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgXG4gICAgdGhpcy5oaWdoID0gaGlnaCB8IDA7XG4gICAgLyoqXG4gICAgICogV2hldGhlciB1bnNpZ25lZCBvciBub3QuXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gIFxuICAgIHRoaXMudW5zaWduZWQgPSAhIXVuc2lnbmVkO1xuICB9IC8vIFRoZSBpbnRlcm5hbCByZXByZXNlbnRhdGlvbiBvZiBhIGxvbmcgaXMgdGhlIHR3byBnaXZlbiBzaWduZWQsIDMyLWJpdCB2YWx1ZXMuXG4gIC8vIFdlIHVzZSAzMi1iaXQgcGllY2VzIGJlY2F1c2UgdGhlc2UgYXJlIHRoZSBzaXplIG9mIGludGVnZXJzIG9uIHdoaWNoXG4gIC8vIEphdmFzY3JpcHQgcGVyZm9ybXMgYml0LW9wZXJhdGlvbnMuICBGb3Igb3BlcmF0aW9ucyBsaWtlIGFkZGl0aW9uIGFuZFxuICAvLyBtdWx0aXBsaWNhdGlvbiwgd2Ugc3BsaXQgZWFjaCBudW1iZXIgaW50byAxNiBiaXQgcGllY2VzLCB3aGljaCBjYW4gZWFzaWx5IGJlXG4gIC8vIG11bHRpcGxpZWQgd2l0aGluIEphdmFzY3JpcHQncyBmbG9hdGluZy1wb2ludCByZXByZXNlbnRhdGlvbiB3aXRob3V0IG92ZXJmbG93XG4gIC8vIG9yIGNoYW5nZSBpbiBzaWduLlxuICAvL1xuICAvLyBJbiB0aGUgYWxnb3JpdGhtcyBiZWxvdywgd2UgZnJlcXVlbnRseSByZWR1Y2UgdGhlIG5lZ2F0aXZlIGNhc2UgdG8gdGhlXG4gIC8vIHBvc2l0aXZlIGNhc2UgYnkgbmVnYXRpbmcgdGhlIGlucHV0KHMpIGFuZCB0aGVuIHBvc3QtcHJvY2Vzc2luZyB0aGUgcmVzdWx0LlxuICAvLyBOb3RlIHRoYXQgd2UgbXVzdCBBTFdBWVMgY2hlY2sgc3BlY2lhbGx5IHdoZXRoZXIgdGhvc2UgdmFsdWVzIGFyZSBNSU5fVkFMVUVcbiAgLy8gKC0yXjYzKSBiZWNhdXNlIC1NSU5fVkFMVUUgPT0gTUlOX1ZBTFVFIChzaW5jZSAyXjYzIGNhbm5vdCBiZSByZXByZXNlbnRlZCBhc1xuICAvLyBhIHBvc2l0aXZlIG51bWJlciwgaXQgb3ZlcmZsb3dzIGJhY2sgaW50byBhIG5lZ2F0aXZlKS4gIE5vdCBoYW5kbGluZyB0aGlzXG4gIC8vIGNhc2Ugd291bGQgb2Z0ZW4gcmVzdWx0IGluIGluZmluaXRlIHJlY3Vyc2lvbi5cbiAgLy9cbiAgLy8gQ29tbW9uIGNvbnN0YW50IHZhbHVlcyBaRVJPLCBPTkUsIE5FR19PTkUsIGV0Yy4gYXJlIGRlZmluZWQgYmVsb3cgdGhlIGZyb20qXG4gIC8vIG1ldGhvZHMgb24gd2hpY2ggdGhleSBkZXBlbmQuXG4gIFxuICAvKipcbiAgICogQW4gaW5kaWNhdG9yIHVzZWQgdG8gcmVsaWFibHkgZGV0ZXJtaW5lIGlmIGFuIG9iamVjdCBpcyBhIExvbmcgb3Igbm90LlxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGNvbnN0XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBcbiAgXG4gIExvbmcucHJvdG90eXBlLl9faXNMb25nX187XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShMb25nLnByb3RvdHlwZSwgXCJfX2lzTG9uZ19fXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxuICB9KTtcbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyp9IG9iaiBPYmplY3RcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIGZ1bmN0aW9uIGlzTG9uZyhvYmopIHtcbiAgICByZXR1cm4gKG9iaiAmJiBvYmpbXCJfX2lzTG9uZ19fXCJdKSA9PT0gdHJ1ZTtcbiAgfVxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWUgbnVtYmVyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIFxuICBmdW5jdGlvbiBjdHozMih2YWx1ZSkge1xuICAgIHZhciBjID0gTWF0aC5jbHozMih2YWx1ZSAmIC12YWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlID8gMzEgLSBjIDogYztcbiAgfVxuICAvKipcbiAgICogVGVzdHMgaWYgdGhlIHNwZWNpZmllZCBvYmplY3QgaXMgYSBMb25nLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHsqfSBvYmogT2JqZWN0XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmlzTG9uZyA9IGlzTG9uZztcbiAgLyoqXG4gICAqIEEgY2FjaGUgb2YgdGhlIExvbmcgcmVwcmVzZW50YXRpb25zIG9mIHNtYWxsIGludGVnZXIgdmFsdWVzLlxuICAgKiBAdHlwZSB7IU9iamVjdH1cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIElOVF9DQUNIRSA9IHt9O1xuICAvKipcbiAgICogQSBjYWNoZSBvZiB0aGUgTG9uZyByZXByZXNlbnRhdGlvbnMgb2Ygc21hbGwgdW5zaWduZWQgaW50ZWdlciB2YWx1ZXMuXG4gICAqIEB0eXBlIHshT2JqZWN0fVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVUlOVF9DQUNIRSA9IHt9O1xuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgZnVuY3Rpb24gZnJvbUludCh2YWx1ZSwgdW5zaWduZWQpIHtcbiAgICB2YXIgb2JqLCBjYWNoZWRPYmosIGNhY2hlO1xuICBcbiAgICBpZiAodW5zaWduZWQpIHtcbiAgICAgIHZhbHVlID4+Pj0gMDtcbiAgXG4gICAgICBpZiAoY2FjaGUgPSAwIDw9IHZhbHVlICYmIHZhbHVlIDwgMjU2KSB7XG4gICAgICAgIGNhY2hlZE9iaiA9IFVJTlRfQ0FDSEVbdmFsdWVdO1xuICAgICAgICBpZiAoY2FjaGVkT2JqKSByZXR1cm4gY2FjaGVkT2JqO1xuICAgICAgfVxuICBcbiAgICAgIG9iaiA9IGZyb21CaXRzKHZhbHVlLCAwLCB0cnVlKTtcbiAgICAgIGlmIChjYWNoZSkgVUlOVF9DQUNIRVt2YWx1ZV0gPSBvYmo7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSB8PSAwO1xuICBcbiAgICAgIGlmIChjYWNoZSA9IC0xMjggPD0gdmFsdWUgJiYgdmFsdWUgPCAxMjgpIHtcbiAgICAgICAgY2FjaGVkT2JqID0gSU5UX0NBQ0hFW3ZhbHVlXTtcbiAgICAgICAgaWYgKGNhY2hlZE9iaikgcmV0dXJuIGNhY2hlZE9iajtcbiAgICAgIH1cbiAgXG4gICAgICBvYmogPSBmcm9tQml0cyh2YWx1ZSwgdmFsdWUgPCAwID8gLTEgOiAwLCBmYWxzZSk7XG4gICAgICBpZiAoY2FjaGUpIElOVF9DQUNIRVt2YWx1ZV0gPSBvYmo7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogUmV0dXJucyBhIExvbmcgcmVwcmVzZW50aW5nIHRoZSBnaXZlbiAzMiBiaXQgaW50ZWdlciB2YWx1ZS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBUaGUgMzIgYml0IGludGVnZXIgaW4gcXVlc3Rpb25cbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tSW50ID0gZnJvbUludDtcbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIGZ1bmN0aW9uIGZyb21OdW1iZXIodmFsdWUsIHVuc2lnbmVkKSB7XG4gICAgaWYgKGlzTmFOKHZhbHVlKSkgcmV0dXJuIHVuc2lnbmVkID8gVVpFUk8gOiBaRVJPO1xuICBcbiAgICBpZiAodW5zaWduZWQpIHtcbiAgICAgIGlmICh2YWx1ZSA8IDApIHJldHVybiBVWkVSTztcbiAgICAgIGlmICh2YWx1ZSA+PSBUV09fUFdSXzY0X0RCTCkgcmV0dXJuIE1BWF9VTlNJR05FRF9WQUxVRTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHZhbHVlIDw9IC1UV09fUFdSXzYzX0RCTCkgcmV0dXJuIE1JTl9WQUxVRTtcbiAgICAgIGlmICh2YWx1ZSArIDEgPj0gVFdPX1BXUl82M19EQkwpIHJldHVybiBNQVhfVkFMVUU7XG4gICAgfVxuICBcbiAgICBpZiAodmFsdWUgPCAwKSByZXR1cm4gZnJvbU51bWJlcigtdmFsdWUsIHVuc2lnbmVkKS5uZWcoKTtcbiAgICByZXR1cm4gZnJvbUJpdHModmFsdWUgJSBUV09fUFdSXzMyX0RCTCB8IDAsIHZhbHVlIC8gVFdPX1BXUl8zMl9EQkwgfCAwLCB1bnNpZ25lZCk7XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybnMgYSBMb25nIHJlcHJlc2VudGluZyB0aGUgZ2l2ZW4gdmFsdWUsIHByb3ZpZGVkIHRoYXQgaXQgaXMgYSBmaW5pdGUgbnVtYmVyLiBPdGhlcndpc2UsIHplcm8gaXMgcmV0dXJuZWQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgVGhlIG51bWJlciBpbiBxdWVzdGlvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21OdW1iZXIgPSBmcm9tTnVtYmVyO1xuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxvd0JpdHNcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhpZ2hCaXRzXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgZnVuY3Rpb24gZnJvbUJpdHMobG93Qml0cywgaGlnaEJpdHMsIHVuc2lnbmVkKSB7XG4gICAgcmV0dXJuIG5ldyBMb25nKGxvd0JpdHMsIGhpZ2hCaXRzLCB1bnNpZ25lZCk7XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybnMgYSBMb25nIHJlcHJlc2VudGluZyB0aGUgNjQgYml0IGludGVnZXIgdGhhdCBjb21lcyBieSBjb25jYXRlbmF0aW5nIHRoZSBnaXZlbiBsb3cgYW5kIGhpZ2ggYml0cy4gRWFjaCBpc1xuICAgKiAgYXNzdW1lZCB0byB1c2UgMzIgYml0cy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsb3dCaXRzIFRoZSBsb3cgMzIgYml0c1xuICAgKiBAcGFyYW0ge251bWJlcn0gaGlnaEJpdHMgVGhlIGhpZ2ggMzIgYml0c1xuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21CaXRzID0gZnJvbUJpdHM7XG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ9IGJhc2VcbiAgICogQHBhcmFtIHtudW1iZXJ9IGV4cG9uZW50XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBwb3dfZGJsID0gTWF0aC5wb3c7IC8vIFVzZWQgNCB0aW1lcyAoNCo4IHRvIDE1KzQpXG4gIFxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICAgKiBAcGFyYW0geyhib29sZWFufG51bWJlcik9fSB1bnNpZ25lZFxuICAgKiBAcGFyYW0ge251bWJlcj19IHJhZGl4XG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgZnVuY3Rpb24gZnJvbVN0cmluZyhzdHIsIHVuc2lnbmVkLCByYWRpeCkge1xuICAgIGlmIChzdHIubGVuZ3RoID09PSAwKSB0aHJvdyBFcnJvcignZW1wdHkgc3RyaW5nJyk7XG4gIFxuICAgIGlmICh0eXBlb2YgdW5zaWduZWQgPT09ICdudW1iZXInKSB7XG4gICAgICAvLyBGb3IgZ29vZy5tYXRoLmxvbmcgY29tcGF0aWJpbGl0eVxuICAgICAgcmFkaXggPSB1bnNpZ25lZDtcbiAgICAgIHVuc2lnbmVkID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVuc2lnbmVkID0gISF1bnNpZ25lZDtcbiAgICB9XG4gIFxuICAgIGlmIChzdHIgPT09IFwiTmFOXCIgfHwgc3RyID09PSBcIkluZmluaXR5XCIgfHwgc3RyID09PSBcIitJbmZpbml0eVwiIHx8IHN0ciA9PT0gXCItSW5maW5pdHlcIikgcmV0dXJuIHVuc2lnbmVkID8gVVpFUk8gOiBaRVJPO1xuICAgIHJhZGl4ID0gcmFkaXggfHwgMTA7XG4gICAgaWYgKHJhZGl4IDwgMiB8fCAzNiA8IHJhZGl4KSB0aHJvdyBSYW5nZUVycm9yKCdyYWRpeCcpO1xuICAgIHZhciBwO1xuICAgIGlmICgocCA9IHN0ci5pbmRleE9mKCctJykpID4gMCkgdGhyb3cgRXJyb3IoJ2ludGVyaW9yIGh5cGhlbicpO2Vsc2UgaWYgKHAgPT09IDApIHtcbiAgICAgIHJldHVybiBmcm9tU3RyaW5nKHN0ci5zdWJzdHJpbmcoMSksIHVuc2lnbmVkLCByYWRpeCkubmVnKCk7XG4gICAgfSAvLyBEbyBzZXZlcmFsICg4KSBkaWdpdHMgZWFjaCB0aW1lIHRocm91Z2ggdGhlIGxvb3AsIHNvIGFzIHRvXG4gICAgLy8gbWluaW1pemUgdGhlIGNhbGxzIHRvIHRoZSB2ZXJ5IGV4cGVuc2l2ZSBlbXVsYXRlZCBkaXYuXG4gIFxuICAgIHZhciByYWRpeFRvUG93ZXIgPSBmcm9tTnVtYmVyKHBvd19kYmwocmFkaXgsIDgpKTtcbiAgICB2YXIgcmVzdWx0ID0gWkVSTztcbiAgXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpICs9IDgpIHtcbiAgICAgIHZhciBzaXplID0gTWF0aC5taW4oOCwgc3RyLmxlbmd0aCAtIGkpLFxuICAgICAgICAgIHZhbHVlID0gcGFyc2VJbnQoc3RyLnN1YnN0cmluZyhpLCBpICsgc2l6ZSksIHJhZGl4KTtcbiAgXG4gICAgICBpZiAoc2l6ZSA8IDgpIHtcbiAgICAgICAgdmFyIHBvd2VyID0gZnJvbU51bWJlcihwb3dfZGJsKHJhZGl4LCBzaXplKSk7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5tdWwocG93ZXIpLmFkZChmcm9tTnVtYmVyKHZhbHVlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSByZXN1bHQubXVsKHJhZGl4VG9Qb3dlcik7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5hZGQoZnJvbU51bWJlcih2YWx1ZSkpO1xuICAgICAgfVxuICAgIH1cbiAgXG4gICAgcmVzdWx0LnVuc2lnbmVkID0gdW5zaWduZWQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyBhIExvbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIHN0cmluZywgd3JpdHRlbiB1c2luZyB0aGUgc3BlY2lmaWVkIHJhZGl4LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0ciBUaGUgdGV4dHVhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgTG9uZ1xuICAgKiBAcGFyYW0geyhib29sZWFufG51bWJlcik9fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gcmFkaXggVGhlIHJhZGl4IGluIHdoaWNoIHRoZSB0ZXh0IGlzIHdyaXR0ZW4gKDItMzYpLCBkZWZhdWx0cyB0byAxMFxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tU3RyaW5nID0gZnJvbVN0cmluZztcbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd8IXtsb3c6IG51bWJlciwgaGlnaDogbnVtYmVyLCB1bnNpZ25lZDogYm9vbGVhbn19IHZhbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIGZ1bmN0aW9uIGZyb21WYWx1ZSh2YWwsIHVuc2lnbmVkKSB7XG4gICAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSByZXR1cm4gZnJvbU51bWJlcih2YWwsIHVuc2lnbmVkKTtcbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHJldHVybiBmcm9tU3RyaW5nKHZhbCwgdW5zaWduZWQpOyAvLyBUaHJvd3MgZm9yIG5vbi1vYmplY3RzLCBjb252ZXJ0cyBub24taW5zdGFuY2VvZiBMb25nOlxuICBcbiAgICByZXR1cm4gZnJvbUJpdHModmFsLmxvdywgdmFsLmhpZ2gsIHR5cGVvZiB1bnNpZ25lZCA9PT0gJ2Jvb2xlYW4nID8gdW5zaWduZWQgOiB2YWwudW5zaWduZWQpO1xuICB9XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGUgc3BlY2lmaWVkIHZhbHVlIHRvIGEgTG9uZyB1c2luZyB0aGUgYXBwcm9wcmlhdGUgZnJvbSogZnVuY3Rpb24gZm9yIGl0cyB0eXBlLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfCF7bG93OiBudW1iZXIsIGhpZ2g6IG51bWJlciwgdW5zaWduZWQ6IGJvb2xlYW59fSB2YWwgVmFsdWVcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbVZhbHVlID0gZnJvbVZhbHVlOyAvLyBOT1RFOiB0aGUgY29tcGlsZXIgc2hvdWxkIGlubGluZSB0aGVzZSBjb25zdGFudCB2YWx1ZXMgYmVsb3cgYW5kIHRoZW4gcmVtb3ZlIHRoZXNlIHZhcmlhYmxlcywgc28gdGhlcmUgc2hvdWxkIGJlXG4gIC8vIG5vIHJ1bnRpbWUgcGVuYWx0eSBmb3IgdGhlc2UuXG4gIFxuICAvKipcbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGNvbnN0XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBUV09fUFdSXzE2X0RCTCA9IDEgPDwgMTY7XG4gIC8qKlxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAY29uc3RcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFRXT19QV1JfMjRfREJMID0gMSA8PCAyNDtcbiAgLyoqXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBjb25zdFxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVFdPX1BXUl8zMl9EQkwgPSBUV09fUFdSXzE2X0RCTCAqIFRXT19QV1JfMTZfREJMO1xuICAvKipcbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGNvbnN0XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBUV09fUFdSXzY0X0RCTCA9IFRXT19QV1JfMzJfREJMICogVFdPX1BXUl8zMl9EQkw7XG4gIC8qKlxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAY29uc3RcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFRXT19QV1JfNjNfREJMID0gVFdPX1BXUl82NF9EQkwgLyAyO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAY29uc3RcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFRXT19QV1JfMjQgPSBmcm9tSW50KFRXT19QV1JfMjRfREJMKTtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFpFUk8gPSBmcm9tSW50KDApO1xuICAvKipcbiAgICogU2lnbmVkIHplcm8uXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLlpFUk8gPSBaRVJPO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVVpFUk8gPSBmcm9tSW50KDAsIHRydWUpO1xuICAvKipcbiAgICogVW5zaWduZWQgemVyby5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuVVpFUk8gPSBVWkVSTztcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIE9ORSA9IGZyb21JbnQoMSk7XG4gIC8qKlxuICAgKiBTaWduZWQgb25lLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5PTkUgPSBPTkU7XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBVT05FID0gZnJvbUludCgxLCB0cnVlKTtcbiAgLyoqXG4gICAqIFVuc2lnbmVkIG9uZS5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuVU9ORSA9IFVPTkU7XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBORUdfT05FID0gZnJvbUludCgtMSk7XG4gIC8qKlxuICAgKiBTaWduZWQgbmVnYXRpdmUgb25lLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5ORUdfT05FID0gTkVHX09ORTtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIE1BWF9WQUxVRSA9IGZyb21CaXRzKDB4RkZGRkZGRkYgfCAwLCAweDdGRkZGRkZGIHwgMCwgZmFsc2UpO1xuICAvKipcbiAgICogTWF4aW11bSBzaWduZWQgdmFsdWUuXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLk1BWF9WQUxVRSA9IE1BWF9WQUxVRTtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIE1BWF9VTlNJR05FRF9WQUxVRSA9IGZyb21CaXRzKDB4RkZGRkZGRkYgfCAwLCAweEZGRkZGRkZGIHwgMCwgdHJ1ZSk7XG4gIC8qKlxuICAgKiBNYXhpbXVtIHVuc2lnbmVkIHZhbHVlLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5NQVhfVU5TSUdORURfVkFMVUUgPSBNQVhfVU5TSUdORURfVkFMVUU7XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBNSU5fVkFMVUUgPSBmcm9tQml0cygwLCAweDgwMDAwMDAwIHwgMCwgZmFsc2UpO1xuICAvKipcbiAgICogTWluaW11bSBzaWduZWQgdmFsdWUuXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLk1JTl9WQUxVRSA9IE1JTl9WQUxVRTtcbiAgLyoqXG4gICAqIEBhbGlhcyBMb25nLnByb3RvdHlwZVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgTG9uZ1Byb3RvdHlwZSA9IExvbmcucHJvdG90eXBlO1xuICAvKipcbiAgICogQ29udmVydHMgdGhlIExvbmcgdG8gYSAzMiBiaXQgaW50ZWdlciwgYXNzdW1pbmcgaXQgaXMgYSAzMiBiaXQgaW50ZWdlci5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUudG9JbnQgPSBmdW5jdGlvbiB0b0ludCgpIHtcbiAgICByZXR1cm4gdGhpcy51bnNpZ25lZCA/IHRoaXMubG93ID4+PiAwIDogdGhpcy5sb3c7XG4gIH07XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGUgTG9uZyB0byBhIHRoZSBuZWFyZXN0IGZsb2F0aW5nLXBvaW50IHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgdmFsdWUgKGRvdWJsZSwgNTMgYml0IG1hbnRpc3NhKS5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnRvTnVtYmVyID0gZnVuY3Rpb24gdG9OdW1iZXIoKSB7XG4gICAgaWYgKHRoaXMudW5zaWduZWQpIHJldHVybiAodGhpcy5oaWdoID4+PiAwKSAqIFRXT19QV1JfMzJfREJMICsgKHRoaXMubG93ID4+PiAwKTtcbiAgICByZXR1cm4gdGhpcy5oaWdoICogVFdPX1BXUl8zMl9EQkwgKyAodGhpcy5sb3cgPj4+IDApO1xuICB9O1xuICAvKipcbiAgICogQ29udmVydHMgdGhlIExvbmcgdG8gYSBzdHJpbmcgd3JpdHRlbiBpbiB0aGUgc3BlY2lmaWVkIHJhZGl4LlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gcmFkaXggUmFkaXggKDItMzYpLCBkZWZhdWx0cyB0byAxMFxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKiBAb3ZlcnJpZGVcbiAgICogQHRocm93cyB7UmFuZ2VFcnJvcn0gSWYgYHJhZGl4YCBpcyBvdXQgb2YgcmFuZ2VcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKHJhZGl4KSB7XG4gICAgcmFkaXggPSByYWRpeCB8fCAxMDtcbiAgICBpZiAocmFkaXggPCAyIHx8IDM2IDwgcmFkaXgpIHRocm93IFJhbmdlRXJyb3IoJ3JhZGl4Jyk7XG4gICAgaWYgKHRoaXMuaXNaZXJvKCkpIHJldHVybiAnMCc7XG4gIFxuICAgIGlmICh0aGlzLmlzTmVnYXRpdmUoKSkge1xuICAgICAgLy8gVW5zaWduZWQgTG9uZ3MgYXJlIG5ldmVyIG5lZ2F0aXZlXG4gICAgICBpZiAodGhpcy5lcShNSU5fVkFMVUUpKSB7XG4gICAgICAgIC8vIFdlIG5lZWQgdG8gY2hhbmdlIHRoZSBMb25nIHZhbHVlIGJlZm9yZSBpdCBjYW4gYmUgbmVnYXRlZCwgc28gd2UgcmVtb3ZlXG4gICAgICAgIC8vIHRoZSBib3R0b20tbW9zdCBkaWdpdCBpbiB0aGlzIGJhc2UgYW5kIHRoZW4gcmVjdXJzZSB0byBkbyB0aGUgcmVzdC5cbiAgICAgICAgdmFyIHJhZGl4TG9uZyA9IGZyb21OdW1iZXIocmFkaXgpLFxuICAgICAgICAgICAgZGl2ID0gdGhpcy5kaXYocmFkaXhMb25nKSxcbiAgICAgICAgICAgIHJlbTEgPSBkaXYubXVsKHJhZGl4TG9uZykuc3ViKHRoaXMpO1xuICAgICAgICByZXR1cm4gZGl2LnRvU3RyaW5nKHJhZGl4KSArIHJlbTEudG9JbnQoKS50b1N0cmluZyhyYWRpeCk7XG4gICAgICB9IGVsc2UgcmV0dXJuICctJyArIHRoaXMubmVnKCkudG9TdHJpbmcocmFkaXgpO1xuICAgIH0gLy8gRG8gc2V2ZXJhbCAoNikgZGlnaXRzIGVhY2ggdGltZSB0aHJvdWdoIHRoZSBsb29wLCBzbyBhcyB0b1xuICAgIC8vIG1pbmltaXplIHRoZSBjYWxscyB0byB0aGUgdmVyeSBleHBlbnNpdmUgZW11bGF0ZWQgZGl2LlxuICBcbiAgXG4gICAgdmFyIHJhZGl4VG9Qb3dlciA9IGZyb21OdW1iZXIocG93X2RibChyYWRpeCwgNiksIHRoaXMudW5zaWduZWQpLFxuICAgICAgICByZW0gPSB0aGlzO1xuICAgIHZhciByZXN1bHQgPSAnJztcbiAgXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHZhciByZW1EaXYgPSByZW0uZGl2KHJhZGl4VG9Qb3dlciksXG4gICAgICAgICAgaW50dmFsID0gcmVtLnN1YihyZW1EaXYubXVsKHJhZGl4VG9Qb3dlcikpLnRvSW50KCkgPj4+IDAsXG4gICAgICAgICAgZGlnaXRzID0gaW50dmFsLnRvU3RyaW5nKHJhZGl4KTtcbiAgICAgIHJlbSA9IHJlbURpdjtcbiAgICAgIGlmIChyZW0uaXNaZXJvKCkpIHJldHVybiBkaWdpdHMgKyByZXN1bHQ7ZWxzZSB7XG4gICAgICAgIHdoaWxlIChkaWdpdHMubGVuZ3RoIDwgNikgZGlnaXRzID0gJzAnICsgZGlnaXRzO1xuICBcbiAgICAgICAgcmVzdWx0ID0gJycgKyBkaWdpdHMgKyByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICAvKipcbiAgICogR2V0cyB0aGUgaGlnaCAzMiBiaXRzIGFzIGEgc2lnbmVkIGludGVnZXIuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn0gU2lnbmVkIGhpZ2ggYml0c1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmdldEhpZ2hCaXRzID0gZnVuY3Rpb24gZ2V0SGlnaEJpdHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGlnaDtcbiAgfTtcbiAgLyoqXG4gICAqIEdldHMgdGhlIGhpZ2ggMzIgYml0cyBhcyBhbiB1bnNpZ25lZCBpbnRlZ2VyLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFVuc2lnbmVkIGhpZ2ggYml0c1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmdldEhpZ2hCaXRzVW5zaWduZWQgPSBmdW5jdGlvbiBnZXRIaWdoQml0c1Vuc2lnbmVkKCkge1xuICAgIHJldHVybiB0aGlzLmhpZ2ggPj4+IDA7XG4gIH07XG4gIC8qKlxuICAgKiBHZXRzIHRoZSBsb3cgMzIgYml0cyBhcyBhIHNpZ25lZCBpbnRlZ2VyLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFNpZ25lZCBsb3cgYml0c1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmdldExvd0JpdHMgPSBmdW5jdGlvbiBnZXRMb3dCaXRzKCkge1xuICAgIHJldHVybiB0aGlzLmxvdztcbiAgfTtcbiAgLyoqXG4gICAqIEdldHMgdGhlIGxvdyAzMiBiaXRzIGFzIGFuIHVuc2lnbmVkIGludGVnZXIuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn0gVW5zaWduZWQgbG93IGJpdHNcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5nZXRMb3dCaXRzVW5zaWduZWQgPSBmdW5jdGlvbiBnZXRMb3dCaXRzVW5zaWduZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMubG93ID4+PiAwO1xuICB9O1xuICAvKipcbiAgICogR2V0cyB0aGUgbnVtYmVyIG9mIGJpdHMgbmVlZGVkIHRvIHJlcHJlc2VudCB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhpcyBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZ2V0TnVtQml0c0FicyA9IGZ1bmN0aW9uIGdldE51bUJpdHNBYnMoKSB7XG4gICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpKSAvLyBVbnNpZ25lZCBMb25ncyBhcmUgbmV2ZXIgbmVnYXRpdmVcbiAgICAgIHJldHVybiB0aGlzLmVxKE1JTl9WQUxVRSkgPyA2NCA6IHRoaXMubmVnKCkuZ2V0TnVtQml0c0FicygpO1xuICAgIHZhciB2YWwgPSB0aGlzLmhpZ2ggIT0gMCA/IHRoaXMuaGlnaCA6IHRoaXMubG93O1xuICBcbiAgICBmb3IgKHZhciBiaXQgPSAzMTsgYml0ID4gMDsgYml0LS0pIGlmICgodmFsICYgMSA8PCBiaXQpICE9IDApIGJyZWFrO1xuICBcbiAgICByZXR1cm4gdGhpcy5oaWdoICE9IDAgPyBiaXQgKyAzMyA6IGJpdCArIDE7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBlcXVhbHMgemVyby5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5pc1plcm8gPSBmdW5jdGlvbiBpc1plcm8oKSB7XG4gICAgcmV0dXJuIHRoaXMuaGlnaCA9PT0gMCAmJiB0aGlzLmxvdyA9PT0gMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGVxdWFscyB6ZXJvLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2lzWmVyb30uXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmVxeiA9IExvbmdQcm90b3R5cGUuaXNaZXJvO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgbmVnYXRpdmUuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5pc05lZ2F0aXZlID0gZnVuY3Rpb24gaXNOZWdhdGl2ZSgpIHtcbiAgICByZXR1cm4gIXRoaXMudW5zaWduZWQgJiYgdGhpcy5oaWdoIDwgMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIHBvc2l0aXZlIG9yIHplcm8uXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuaXNQb3NpdGl2ZSA9IGZ1bmN0aW9uIGlzUG9zaXRpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMudW5zaWduZWQgfHwgdGhpcy5oaWdoID49IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBvZGQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuaXNPZGQgPSBmdW5jdGlvbiBpc09kZCgpIHtcbiAgICByZXR1cm4gKHRoaXMubG93ICYgMSkgPT09IDE7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBldmVuLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmlzRXZlbiA9IGZ1bmN0aW9uIGlzRXZlbigpIHtcbiAgICByZXR1cm4gKHRoaXMubG93ICYgMSkgPT09IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBlcXVhbHMgdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzKG90aGVyKSB7XG4gICAgaWYgKCFpc0xvbmcob3RoZXIpKSBvdGhlciA9IGZyb21WYWx1ZShvdGhlcik7XG4gICAgaWYgKHRoaXMudW5zaWduZWQgIT09IG90aGVyLnVuc2lnbmVkICYmIHRoaXMuaGlnaCA+Pj4gMzEgPT09IDEgJiYgb3RoZXIuaGlnaCA+Pj4gMzEgPT09IDEpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdGhpcy5oaWdoID09PSBvdGhlci5oaWdoICYmIHRoaXMubG93ID09PSBvdGhlci5sb3c7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBlcXVhbHMgdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2VxdWFsc30uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmVxID0gTG9uZ1Byb3RvdHlwZS5lcXVhbHM7XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBkaWZmZXJzIGZyb20gdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5ub3RFcXVhbHMgPSBmdW5jdGlvbiBub3RFcXVhbHMob3RoZXIpIHtcbiAgICByZXR1cm4gIXRoaXMuZXEoXG4gICAgLyogdmFsaWRhdGVzICovXG4gICAgb3RoZXIpO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZGlmZmVycyBmcm9tIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNub3RFcXVhbHN9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5uZXEgPSBMb25nUHJvdG90eXBlLm5vdEVxdWFscztcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGRpZmZlcnMgZnJvbSB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbm90RXF1YWxzfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5uZSA9IExvbmdQcm90b3R5cGUubm90RXF1YWxzO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgbGVzcyB0aGFuIHRoZSBzcGVjaWZpZWQncy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubGVzc1RoYW4gPSBmdW5jdGlvbiBsZXNzVGhhbihvdGhlcikge1xuICAgIHJldHVybiB0aGlzLmNvbXAoXG4gICAgLyogdmFsaWRhdGVzICovXG4gICAgb3RoZXIpIDwgMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGxlc3MgdGhhbiB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbGVzc1RoYW59LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5sdCA9IExvbmdQcm90b3R5cGUubGVzc1RoYW47XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5sZXNzVGhhbk9yRXF1YWwgPSBmdW5jdGlvbiBsZXNzVGhhbk9yRXF1YWwob3RoZXIpIHtcbiAgICByZXR1cm4gdGhpcy5jb21wKFxuICAgIC8qIHZhbGlkYXRlcyAqL1xuICAgIG90aGVyKSA8PSAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNsZXNzVGhhbk9yRXF1YWx9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5sdGUgPSBMb25nUHJvdG90eXBlLmxlc3NUaGFuT3JFcXVhbDtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbGVzc1RoYW5PckVxdWFsfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5sZSA9IExvbmdQcm90b3R5cGUubGVzc1RoYW5PckVxdWFsO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIHRoZSBzcGVjaWZpZWQncy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuZ3JlYXRlclRoYW4gPSBmdW5jdGlvbiBncmVhdGVyVGhhbihvdGhlcikge1xuICAgIHJldHVybiB0aGlzLmNvbXAoXG4gICAgLyogdmFsaWRhdGVzICovXG4gICAgb3RoZXIpID4gMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjZ3JlYXRlclRoYW59LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5ndCA9IExvbmdQcm90b3R5cGUuZ3JlYXRlclRoYW47XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5ncmVhdGVyVGhhbk9yRXF1YWwgPSBmdW5jdGlvbiBncmVhdGVyVGhhbk9yRXF1YWwob3RoZXIpIHtcbiAgICByZXR1cm4gdGhpcy5jb21wKFxuICAgIC8qIHZhbGlkYXRlcyAqL1xuICAgIG90aGVyKSA+PSAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNncmVhdGVyVGhhbk9yRXF1YWx9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5ndGUgPSBMb25nUHJvdG90eXBlLmdyZWF0ZXJUaGFuT3JFcXVhbDtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjZ3JlYXRlclRoYW5PckVxdWFsfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5nZSA9IExvbmdQcm90b3R5cGUuZ3JlYXRlclRoYW5PckVxdWFsO1xuICAvKipcbiAgICogQ29tcGFyZXMgdGhpcyBMb25nJ3MgdmFsdWUgd2l0aCB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSAwIGlmIHRoZXkgYXJlIHRoZSBzYW1lLCAxIGlmIHRoZSB0aGlzIGlzIGdyZWF0ZXIgYW5kIC0xXG4gICAqICBpZiB0aGUgZ2l2ZW4gb25lIGlzIGdyZWF0ZXJcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlKG90aGVyKSB7XG4gICAgaWYgKCFpc0xvbmcob3RoZXIpKSBvdGhlciA9IGZyb21WYWx1ZShvdGhlcik7XG4gICAgaWYgKHRoaXMuZXEob3RoZXIpKSByZXR1cm4gMDtcbiAgICB2YXIgdGhpc05lZyA9IHRoaXMuaXNOZWdhdGl2ZSgpLFxuICAgICAgICBvdGhlck5lZyA9IG90aGVyLmlzTmVnYXRpdmUoKTtcbiAgICBpZiAodGhpc05lZyAmJiAhb3RoZXJOZWcpIHJldHVybiAtMTtcbiAgICBpZiAoIXRoaXNOZWcgJiYgb3RoZXJOZWcpIHJldHVybiAxOyAvLyBBdCB0aGlzIHBvaW50IHRoZSBzaWduIGJpdHMgYXJlIHRoZSBzYW1lXG4gIFxuICAgIGlmICghdGhpcy51bnNpZ25lZCkgcmV0dXJuIHRoaXMuc3ViKG90aGVyKS5pc05lZ2F0aXZlKCkgPyAtMSA6IDE7IC8vIEJvdGggYXJlIHBvc2l0aXZlIGlmIGF0IGxlYXN0IG9uZSBpcyB1bnNpZ25lZFxuICBcbiAgICByZXR1cm4gb3RoZXIuaGlnaCA+Pj4gMCA+IHRoaXMuaGlnaCA+Pj4gMCB8fCBvdGhlci5oaWdoID09PSB0aGlzLmhpZ2ggJiYgb3RoZXIubG93ID4+PiAwID4gdGhpcy5sb3cgPj4+IDAgPyAtMSA6IDE7XG4gIH07XG4gIC8qKlxuICAgKiBDb21wYXJlcyB0aGlzIExvbmcncyB2YWx1ZSB3aXRoIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNjb21wYXJlfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge251bWJlcn0gMCBpZiB0aGV5IGFyZSB0aGUgc2FtZSwgMSBpZiB0aGUgdGhpcyBpcyBncmVhdGVyIGFuZCAtMVxuICAgKiAgaWYgdGhlIGdpdmVuIG9uZSBpcyBncmVhdGVyXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuY29tcCA9IExvbmdQcm90b3R5cGUuY29tcGFyZTtcbiAgLyoqXG4gICAqIE5lZ2F0ZXMgdGhpcyBMb25nJ3MgdmFsdWUuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFMb25nfSBOZWdhdGVkIExvbmdcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLm5lZ2F0ZSA9IGZ1bmN0aW9uIG5lZ2F0ZSgpIHtcbiAgICBpZiAoIXRoaXMudW5zaWduZWQgJiYgdGhpcy5lcShNSU5fVkFMVUUpKSByZXR1cm4gTUlOX1ZBTFVFO1xuICAgIHJldHVybiB0aGlzLm5vdCgpLmFkZChPTkUpO1xuICB9O1xuICAvKipcbiAgICogTmVnYXRlcyB0aGlzIExvbmcncyB2YWx1ZS4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNuZWdhdGV9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHJldHVybnMgeyFMb25nfSBOZWdhdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5uZWcgPSBMb25nUHJvdG90eXBlLm5lZ2F0ZTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHN1bSBvZiB0aGlzIGFuZCB0aGUgc3BlY2lmaWVkIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBhZGRlbmQgQWRkZW5kXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU3VtXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiBhZGQoYWRkZW5kKSB7XG4gICAgaWYgKCFpc0xvbmcoYWRkZW5kKSkgYWRkZW5kID0gZnJvbVZhbHVlKGFkZGVuZCk7IC8vIERpdmlkZSBlYWNoIG51bWJlciBpbnRvIDQgY2h1bmtzIG9mIDE2IGJpdHMsIGFuZCB0aGVuIHN1bSB0aGUgY2h1bmtzLlxuICBcbiAgICB2YXIgYTQ4ID0gdGhpcy5oaWdoID4+PiAxNjtcbiAgICB2YXIgYTMyID0gdGhpcy5oaWdoICYgMHhGRkZGO1xuICAgIHZhciBhMTYgPSB0aGlzLmxvdyA+Pj4gMTY7XG4gICAgdmFyIGEwMCA9IHRoaXMubG93ICYgMHhGRkZGO1xuICAgIHZhciBiNDggPSBhZGRlbmQuaGlnaCA+Pj4gMTY7XG4gICAgdmFyIGIzMiA9IGFkZGVuZC5oaWdoICYgMHhGRkZGO1xuICAgIHZhciBiMTYgPSBhZGRlbmQubG93ID4+PiAxNjtcbiAgICB2YXIgYjAwID0gYWRkZW5kLmxvdyAmIDB4RkZGRjtcbiAgICB2YXIgYzQ4ID0gMCxcbiAgICAgICAgYzMyID0gMCxcbiAgICAgICAgYzE2ID0gMCxcbiAgICAgICAgYzAwID0gMDtcbiAgICBjMDAgKz0gYTAwICsgYjAwO1xuICAgIGMxNiArPSBjMDAgPj4+IDE2O1xuICAgIGMwMCAmPSAweEZGRkY7XG4gICAgYzE2ICs9IGExNiArIGIxNjtcbiAgICBjMzIgKz0gYzE2ID4+PiAxNjtcbiAgICBjMTYgJj0gMHhGRkZGO1xuICAgIGMzMiArPSBhMzIgKyBiMzI7XG4gICAgYzQ4ICs9IGMzMiA+Pj4gMTY7XG4gICAgYzMyICY9IDB4RkZGRjtcbiAgICBjNDggKz0gYTQ4ICsgYjQ4O1xuICAgIGM0OCAmPSAweEZGRkY7XG4gICAgcmV0dXJuIGZyb21CaXRzKGMxNiA8PCAxNiB8IGMwMCwgYzQ4IDw8IDE2IHwgYzMyLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRpZmZlcmVuY2Ugb2YgdGhpcyBhbmQgdGhlIHNwZWNpZmllZCBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gc3VidHJhaGVuZCBTdWJ0cmFoZW5kXG4gICAqIEByZXR1cm5zIHshTG9uZ30gRGlmZmVyZW5jZVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnN1YnRyYWN0ID0gZnVuY3Rpb24gc3VidHJhY3Qoc3VidHJhaGVuZCkge1xuICAgIGlmICghaXNMb25nKHN1YnRyYWhlbmQpKSBzdWJ0cmFoZW5kID0gZnJvbVZhbHVlKHN1YnRyYWhlbmQpO1xuICAgIHJldHVybiB0aGlzLmFkZChzdWJ0cmFoZW5kLm5lZygpKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRpZmZlcmVuY2Ugb2YgdGhpcyBhbmQgdGhlIHNwZWNpZmllZCBMb25nLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3N1YnRyYWN0fS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gc3VidHJhaGVuZCBTdWJ0cmFoZW5kXG4gICAqIEByZXR1cm5zIHshTG9uZ30gRGlmZmVyZW5jZVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnN1YiA9IExvbmdQcm90b3R5cGUuc3VidHJhY3Q7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwcm9kdWN0IG9mIHRoaXMgYW5kIHRoZSBzcGVjaWZpZWQgTG9uZy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG11bHRpcGxpZXIgTXVsdGlwbGllclxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFByb2R1Y3RcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24gbXVsdGlwbHkobXVsdGlwbGllcikge1xuICAgIGlmICh0aGlzLmlzWmVybygpKSByZXR1cm4gdGhpcztcbiAgICBpZiAoIWlzTG9uZyhtdWx0aXBsaWVyKSkgbXVsdGlwbGllciA9IGZyb21WYWx1ZShtdWx0aXBsaWVyKTsgLy8gdXNlIHdhc20gc3VwcG9ydCBpZiBwcmVzZW50XG4gIFxuICAgIGlmICh3YXNtKSB7XG4gICAgICB2YXIgbG93ID0gd2FzbVtcIm11bFwiXSh0aGlzLmxvdywgdGhpcy5oaWdoLCBtdWx0aXBsaWVyLmxvdywgbXVsdGlwbGllci5oaWdoKTtcbiAgICAgIHJldHVybiBmcm9tQml0cyhsb3csIHdhc21bXCJnZXRfaGlnaFwiXSgpLCB0aGlzLnVuc2lnbmVkKTtcbiAgICB9XG4gIFxuICAgIGlmIChtdWx0aXBsaWVyLmlzWmVybygpKSByZXR1cm4gdGhpcy51bnNpZ25lZCA/IFVaRVJPIDogWkVSTztcbiAgICBpZiAodGhpcy5lcShNSU5fVkFMVUUpKSByZXR1cm4gbXVsdGlwbGllci5pc09kZCgpID8gTUlOX1ZBTFVFIDogWkVSTztcbiAgICBpZiAobXVsdGlwbGllci5lcShNSU5fVkFMVUUpKSByZXR1cm4gdGhpcy5pc09kZCgpID8gTUlOX1ZBTFVFIDogWkVSTztcbiAgXG4gICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpKSB7XG4gICAgICBpZiAobXVsdGlwbGllci5pc05lZ2F0aXZlKCkpIHJldHVybiB0aGlzLm5lZygpLm11bChtdWx0aXBsaWVyLm5lZygpKTtlbHNlIHJldHVybiB0aGlzLm5lZygpLm11bChtdWx0aXBsaWVyKS5uZWcoKTtcbiAgICB9IGVsc2UgaWYgKG11bHRpcGxpZXIuaXNOZWdhdGl2ZSgpKSByZXR1cm4gdGhpcy5tdWwobXVsdGlwbGllci5uZWcoKSkubmVnKCk7IC8vIElmIGJvdGggbG9uZ3MgYXJlIHNtYWxsLCB1c2UgZmxvYXQgbXVsdGlwbGljYXRpb25cbiAgXG4gIFxuICAgIGlmICh0aGlzLmx0KFRXT19QV1JfMjQpICYmIG11bHRpcGxpZXIubHQoVFdPX1BXUl8yNCkpIHJldHVybiBmcm9tTnVtYmVyKHRoaXMudG9OdW1iZXIoKSAqIG11bHRpcGxpZXIudG9OdW1iZXIoKSwgdGhpcy51bnNpZ25lZCk7IC8vIERpdmlkZSBlYWNoIGxvbmcgaW50byA0IGNodW5rcyBvZiAxNiBiaXRzLCBhbmQgdGhlbiBhZGQgdXAgNHg0IHByb2R1Y3RzLlxuICAgIC8vIFdlIGNhbiBza2lwIHByb2R1Y3RzIHRoYXQgd291bGQgb3ZlcmZsb3cuXG4gIFxuICAgIHZhciBhNDggPSB0aGlzLmhpZ2ggPj4+IDE2O1xuICAgIHZhciBhMzIgPSB0aGlzLmhpZ2ggJiAweEZGRkY7XG4gICAgdmFyIGExNiA9IHRoaXMubG93ID4+PiAxNjtcbiAgICB2YXIgYTAwID0gdGhpcy5sb3cgJiAweEZGRkY7XG4gICAgdmFyIGI0OCA9IG11bHRpcGxpZXIuaGlnaCA+Pj4gMTY7XG4gICAgdmFyIGIzMiA9IG11bHRpcGxpZXIuaGlnaCAmIDB4RkZGRjtcbiAgICB2YXIgYjE2ID0gbXVsdGlwbGllci5sb3cgPj4+IDE2O1xuICAgIHZhciBiMDAgPSBtdWx0aXBsaWVyLmxvdyAmIDB4RkZGRjtcbiAgICB2YXIgYzQ4ID0gMCxcbiAgICAgICAgYzMyID0gMCxcbiAgICAgICAgYzE2ID0gMCxcbiAgICAgICAgYzAwID0gMDtcbiAgICBjMDAgKz0gYTAwICogYjAwO1xuICAgIGMxNiArPSBjMDAgPj4+IDE2O1xuICAgIGMwMCAmPSAweEZGRkY7XG4gICAgYzE2ICs9IGExNiAqIGIwMDtcbiAgICBjMzIgKz0gYzE2ID4+PiAxNjtcbiAgICBjMTYgJj0gMHhGRkZGO1xuICAgIGMxNiArPSBhMDAgKiBiMTY7XG4gICAgYzMyICs9IGMxNiA+Pj4gMTY7XG4gICAgYzE2ICY9IDB4RkZGRjtcbiAgICBjMzIgKz0gYTMyICogYjAwO1xuICAgIGM0OCArPSBjMzIgPj4+IDE2O1xuICAgIGMzMiAmPSAweEZGRkY7XG4gICAgYzMyICs9IGExNiAqIGIxNjtcbiAgICBjNDggKz0gYzMyID4+PiAxNjtcbiAgICBjMzIgJj0gMHhGRkZGO1xuICAgIGMzMiArPSBhMDAgKiBiMzI7XG4gICAgYzQ4ICs9IGMzMiA+Pj4gMTY7XG4gICAgYzMyICY9IDB4RkZGRjtcbiAgICBjNDggKz0gYTQ4ICogYjAwICsgYTMyICogYjE2ICsgYTE2ICogYjMyICsgYTAwICogYjQ4O1xuICAgIGM0OCAmPSAweEZGRkY7XG4gICAgcmV0dXJuIGZyb21CaXRzKGMxNiA8PCAxNiB8IGMwMCwgYzQ4IDw8IDE2IHwgYzMyLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHByb2R1Y3Qgb2YgdGhpcyBhbmQgdGhlIHNwZWNpZmllZCBMb25nLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI211bHRpcGx5fS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gbXVsdGlwbGllciBNdWx0aXBsaWVyXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUHJvZHVjdFxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLm11bCA9IExvbmdQcm90b3R5cGUubXVsdGlwbHk7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyBkaXZpZGVkIGJ5IHRoZSBzcGVjaWZpZWQuIFRoZSByZXN1bHQgaXMgc2lnbmVkIGlmIHRoaXMgTG9uZyBpcyBzaWduZWQgb3JcbiAgICogIHVuc2lnbmVkIGlmIHRoaXMgTG9uZyBpcyB1bnNpZ25lZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IGRpdmlzb3IgRGl2aXNvclxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFF1b3RpZW50XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5kaXZpZGUgPSBmdW5jdGlvbiBkaXZpZGUoZGl2aXNvcikge1xuICAgIGlmICghaXNMb25nKGRpdmlzb3IpKSBkaXZpc29yID0gZnJvbVZhbHVlKGRpdmlzb3IpO1xuICAgIGlmIChkaXZpc29yLmlzWmVybygpKSB0aHJvdyBFcnJvcignZGl2aXNpb24gYnkgemVybycpOyAvLyB1c2Ugd2FzbSBzdXBwb3J0IGlmIHByZXNlbnRcbiAgXG4gICAgaWYgKHdhc20pIHtcbiAgICAgIC8vIGd1YXJkIGFnYWluc3Qgc2lnbmVkIGRpdmlzaW9uIG92ZXJmbG93OiB0aGUgbGFyZ2VzdFxuICAgICAgLy8gbmVnYXRpdmUgbnVtYmVyIC8gLTEgd291bGQgYmUgMSBsYXJnZXIgdGhhbiB0aGUgbGFyZ2VzdFxuICAgICAgLy8gcG9zaXRpdmUgbnVtYmVyLCBkdWUgdG8gdHdvJ3MgY29tcGxlbWVudC5cbiAgICAgIGlmICghdGhpcy51bnNpZ25lZCAmJiB0aGlzLmhpZ2ggPT09IC0weDgwMDAwMDAwICYmIGRpdmlzb3IubG93ID09PSAtMSAmJiBkaXZpc29yLmhpZ2ggPT09IC0xKSB7XG4gICAgICAgIC8vIGJlIGNvbnNpc3RlbnQgd2l0aCBub24td2FzbSBjb2RlIHBhdGhcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gIFxuICAgICAgdmFyIGxvdyA9ICh0aGlzLnVuc2lnbmVkID8gd2FzbVtcImRpdl91XCJdIDogd2FzbVtcImRpdl9zXCJdKSh0aGlzLmxvdywgdGhpcy5oaWdoLCBkaXZpc29yLmxvdywgZGl2aXNvci5oaWdoKTtcbiAgICAgIHJldHVybiBmcm9tQml0cyhsb3csIHdhc21bXCJnZXRfaGlnaFwiXSgpLCB0aGlzLnVuc2lnbmVkKTtcbiAgICB9XG4gIFxuICAgIGlmICh0aGlzLmlzWmVybygpKSByZXR1cm4gdGhpcy51bnNpZ25lZCA/IFVaRVJPIDogWkVSTztcbiAgICB2YXIgYXBwcm94LCByZW0sIHJlcztcbiAgXG4gICAgaWYgKCF0aGlzLnVuc2lnbmVkKSB7XG4gICAgICAvLyBUaGlzIHNlY3Rpb24gaXMgb25seSByZWxldmFudCBmb3Igc2lnbmVkIGxvbmdzIGFuZCBpcyBkZXJpdmVkIGZyb20gdGhlXG4gICAgICAvLyBjbG9zdXJlIGxpYnJhcnkgYXMgYSB3aG9sZS5cbiAgICAgIGlmICh0aGlzLmVxKE1JTl9WQUxVRSkpIHtcbiAgICAgICAgaWYgKGRpdmlzb3IuZXEoT05FKSB8fCBkaXZpc29yLmVxKE5FR19PTkUpKSByZXR1cm4gTUlOX1ZBTFVFOyAvLyByZWNhbGwgdGhhdCAtTUlOX1ZBTFVFID09IE1JTl9WQUxVRVxuICAgICAgICBlbHNlIGlmIChkaXZpc29yLmVxKE1JTl9WQUxVRSkpIHJldHVybiBPTkU7ZWxzZSB7XG4gICAgICAgICAgLy8gQXQgdGhpcyBwb2ludCwgd2UgaGF2ZSB8b3RoZXJ8ID49IDIsIHNvIHx0aGlzL290aGVyfCA8IHxNSU5fVkFMVUV8LlxuICAgICAgICAgIHZhciBoYWxmVGhpcyA9IHRoaXMuc2hyKDEpO1xuICAgICAgICAgIGFwcHJveCA9IGhhbGZUaGlzLmRpdihkaXZpc29yKS5zaGwoMSk7XG4gIFxuICAgICAgICAgIGlmIChhcHByb3guZXEoWkVSTykpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXZpc29yLmlzTmVnYXRpdmUoKSA/IE9ORSA6IE5FR19PTkU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlbSA9IHRoaXMuc3ViKGRpdmlzb3IubXVsKGFwcHJveCkpO1xuICAgICAgICAgICAgcmVzID0gYXBwcm94LmFkZChyZW0uZGl2KGRpdmlzb3IpKTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGRpdmlzb3IuZXEoTUlOX1ZBTFVFKSkgcmV0dXJuIHRoaXMudW5zaWduZWQgPyBVWkVSTyA6IFpFUk87XG4gIFxuICAgICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpKSB7XG4gICAgICAgIGlmIChkaXZpc29yLmlzTmVnYXRpdmUoKSkgcmV0dXJuIHRoaXMubmVnKCkuZGl2KGRpdmlzb3IubmVnKCkpO1xuICAgICAgICByZXR1cm4gdGhpcy5uZWcoKS5kaXYoZGl2aXNvcikubmVnKCk7XG4gICAgICB9IGVsc2UgaWYgKGRpdmlzb3IuaXNOZWdhdGl2ZSgpKSByZXR1cm4gdGhpcy5kaXYoZGl2aXNvci5uZWcoKSkubmVnKCk7XG4gIFxuICAgICAgcmVzID0gWkVSTztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGFsZ29yaXRobSBiZWxvdyBoYXMgbm90IGJlZW4gbWFkZSBmb3IgdW5zaWduZWQgbG9uZ3MuIEl0J3MgdGhlcmVmb3JlXG4gICAgICAvLyByZXF1aXJlZCB0byB0YWtlIHNwZWNpYWwgY2FyZSBvZiB0aGUgTVNCIHByaW9yIHRvIHJ1bm5pbmcgaXQuXG4gICAgICBpZiAoIWRpdmlzb3IudW5zaWduZWQpIGRpdmlzb3IgPSBkaXZpc29yLnRvVW5zaWduZWQoKTtcbiAgICAgIGlmIChkaXZpc29yLmd0KHRoaXMpKSByZXR1cm4gVVpFUk87XG4gICAgICBpZiAoZGl2aXNvci5ndCh0aGlzLnNocnUoMSkpKSAvLyAxNSA+Pj4gMSA9IDcgOyB3aXRoIGRpdmlzb3IgPSA4IDsgdHJ1ZVxuICAgICAgICByZXR1cm4gVU9ORTtcbiAgICAgIHJlcyA9IFVaRVJPO1xuICAgIH0gLy8gUmVwZWF0IHRoZSBmb2xsb3dpbmcgdW50aWwgdGhlIHJlbWFpbmRlciBpcyBsZXNzIHRoYW4gb3RoZXI6ICBmaW5kIGFcbiAgICAvLyBmbG9hdGluZy1wb2ludCB0aGF0IGFwcHJveGltYXRlcyByZW1haW5kZXIgLyBvdGhlciAqZnJvbSBiZWxvdyosIGFkZCB0aGlzXG4gICAgLy8gaW50byB0aGUgcmVzdWx0LCBhbmQgc3VidHJhY3QgaXQgZnJvbSB0aGUgcmVtYWluZGVyLiAgSXQgaXMgY3JpdGljYWwgdGhhdFxuICAgIC8vIHRoZSBhcHByb3hpbWF0ZSB2YWx1ZSBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHJlYWwgdmFsdWUgc28gdGhhdCB0aGVcbiAgICAvLyByZW1haW5kZXIgbmV2ZXIgYmVjb21lcyBuZWdhdGl2ZS5cbiAgXG4gIFxuICAgIHJlbSA9IHRoaXM7XG4gIFxuICAgIHdoaWxlIChyZW0uZ3RlKGRpdmlzb3IpKSB7XG4gICAgICAvLyBBcHByb3hpbWF0ZSB0aGUgcmVzdWx0IG9mIGRpdmlzaW9uLiBUaGlzIG1heSBiZSBhIGxpdHRsZSBncmVhdGVyIG9yXG4gICAgICAvLyBzbWFsbGVyIHRoYW4gdGhlIGFjdHVhbCB2YWx1ZS5cbiAgICAgIGFwcHJveCA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3IocmVtLnRvTnVtYmVyKCkgLyBkaXZpc29yLnRvTnVtYmVyKCkpKTsgLy8gV2Ugd2lsbCB0d2VhayB0aGUgYXBwcm94aW1hdGUgcmVzdWx0IGJ5IGNoYW5naW5nIGl0IGluIHRoZSA0OC10aCBkaWdpdCBvclxuICAgICAgLy8gdGhlIHNtYWxsZXN0IG5vbi1mcmFjdGlvbmFsIGRpZ2l0LCB3aGljaGV2ZXIgaXMgbGFyZ2VyLlxuICBcbiAgICAgIHZhciBsb2cyID0gTWF0aC5jZWlsKE1hdGgubG9nKGFwcHJveCkgLyBNYXRoLkxOMiksXG4gICAgICAgICAgZGVsdGEgPSBsb2cyIDw9IDQ4ID8gMSA6IHBvd19kYmwoMiwgbG9nMiAtIDQ4KSxcbiAgICAgICAgICAvLyBEZWNyZWFzZSB0aGUgYXBwcm94aW1hdGlvbiB1bnRpbCBpdCBpcyBzbWFsbGVyIHRoYW4gdGhlIHJlbWFpbmRlci4gIE5vdGVcbiAgICAgIC8vIHRoYXQgaWYgaXQgaXMgdG9vIGxhcmdlLCB0aGUgcHJvZHVjdCBvdmVyZmxvd3MgYW5kIGlzIG5lZ2F0aXZlLlxuICAgICAgYXBwcm94UmVzID0gZnJvbU51bWJlcihhcHByb3gpLFxuICAgICAgICAgIGFwcHJveFJlbSA9IGFwcHJveFJlcy5tdWwoZGl2aXNvcik7XG4gIFxuICAgICAgd2hpbGUgKGFwcHJveFJlbS5pc05lZ2F0aXZlKCkgfHwgYXBwcm94UmVtLmd0KHJlbSkpIHtcbiAgICAgICAgYXBwcm94IC09IGRlbHRhO1xuICAgICAgICBhcHByb3hSZXMgPSBmcm9tTnVtYmVyKGFwcHJveCwgdGhpcy51bnNpZ25lZCk7XG4gICAgICAgIGFwcHJveFJlbSA9IGFwcHJveFJlcy5tdWwoZGl2aXNvcik7XG4gICAgICB9IC8vIFdlIGtub3cgdGhlIGFuc3dlciBjYW4ndCBiZSB6ZXJvLi4uIGFuZCBhY3R1YWxseSwgemVybyB3b3VsZCBjYXVzZVxuICAgICAgLy8gaW5maW5pdGUgcmVjdXJzaW9uIHNpbmNlIHdlIHdvdWxkIG1ha2Ugbm8gcHJvZ3Jlc3MuXG4gIFxuICBcbiAgICAgIGlmIChhcHByb3hSZXMuaXNaZXJvKCkpIGFwcHJveFJlcyA9IE9ORTtcbiAgICAgIHJlcyA9IHJlcy5hZGQoYXBwcm94UmVzKTtcbiAgICAgIHJlbSA9IHJlbS5zdWIoYXBwcm94UmVtKTtcbiAgICB9XG4gIFxuICAgIHJldHVybiByZXM7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyBkaXZpZGVkIGJ5IHRoZSBzcGVjaWZpZWQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjZGl2aWRlfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gZGl2aXNvciBEaXZpc29yXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUXVvdGllbnRcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5kaXYgPSBMb25nUHJvdG90eXBlLmRpdmlkZTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIG1vZHVsbyB0aGUgc3BlY2lmaWVkLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gZGl2aXNvciBEaXZpc29yXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUmVtYWluZGVyXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5tb2R1bG8gPSBmdW5jdGlvbiBtb2R1bG8oZGl2aXNvcikge1xuICAgIGlmICghaXNMb25nKGRpdmlzb3IpKSBkaXZpc29yID0gZnJvbVZhbHVlKGRpdmlzb3IpOyAvLyB1c2Ugd2FzbSBzdXBwb3J0IGlmIHByZXNlbnRcbiAgXG4gICAgaWYgKHdhc20pIHtcbiAgICAgIHZhciBsb3cgPSAodGhpcy51bnNpZ25lZCA/IHdhc21bXCJyZW1fdVwiXSA6IHdhc21bXCJyZW1fc1wiXSkodGhpcy5sb3csIHRoaXMuaGlnaCwgZGl2aXNvci5sb3csIGRpdmlzb3IuaGlnaCk7XG4gICAgICByZXR1cm4gZnJvbUJpdHMobG93LCB3YXNtW1wiZ2V0X2hpZ2hcIl0oKSwgdGhpcy51bnNpZ25lZCk7XG4gICAgfVxuICBcbiAgICByZXR1cm4gdGhpcy5zdWIodGhpcy5kaXYoZGl2aXNvcikubXVsKGRpdmlzb3IpKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIG1vZHVsbyB0aGUgc3BlY2lmaWVkLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI21vZHVsb30uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IGRpdmlzb3IgRGl2aXNvclxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFJlbWFpbmRlclxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLm1vZCA9IExvbmdQcm90b3R5cGUubW9kdWxvO1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgbW9kdWxvIHRoZSBzcGVjaWZpZWQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbW9kdWxvfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gZGl2aXNvciBEaXZpc29yXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUmVtYWluZGVyXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5yZW0gPSBMb25nUHJvdG90eXBlLm1vZHVsbztcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJpdHdpc2UgTk9UIG9mIHRoaXMgTG9uZy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5ub3QgPSBmdW5jdGlvbiBub3QoKSB7XG4gICAgcmV0dXJuIGZyb21CaXRzKH50aGlzLmxvdywgfnRoaXMuaGlnaCwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIGNvdW50IGxlYWRpbmcgemVyb3Mgb2YgdGhpcyBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshbnVtYmVyfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmNvdW50TGVhZGluZ1plcm9zID0gZnVuY3Rpb24gY291bnRMZWFkaW5nWmVyb3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGlnaCA/IE1hdGguY2x6MzIodGhpcy5oaWdoKSA6IE1hdGguY2x6MzIodGhpcy5sb3cpICsgMzI7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIGNvdW50IGxlYWRpbmcgemVyb3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjY291bnRMZWFkaW5nWmVyb3N9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFudW1iZXJ9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuY2x6ID0gTG9uZ1Byb3RvdHlwZS5jb3VudExlYWRpbmdaZXJvcztcbiAgLyoqXG4gICAqIFJldHVybnMgY291bnQgdHJhaWxpbmcgemVyb3Mgb2YgdGhpcyBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshbnVtYmVyfVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuY291bnRUcmFpbGluZ1plcm9zID0gZnVuY3Rpb24gY291bnRUcmFpbGluZ1plcm9zKCkge1xuICAgIHJldHVybiB0aGlzLmxvdyA/IGN0ejMyKHRoaXMubG93KSA6IGN0ejMyKHRoaXMuaGlnaCkgKyAzMjtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgY291bnQgdHJhaWxpbmcgemVyb3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjY291bnRUcmFpbGluZ1plcm9zfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshbnVtYmVyfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmN0eiA9IExvbmdQcm90b3R5cGUuY291bnRUcmFpbGluZ1plcm9zO1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgYml0d2lzZSBBTkQgb2YgdGhpcyBMb25nIGFuZCB0aGUgc3BlY2lmaWVkLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgTG9uZ1xuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5hbmQgPSBmdW5jdGlvbiBhbmQob3RoZXIpIHtcbiAgICBpZiAoIWlzTG9uZyhvdGhlcikpIG90aGVyID0gZnJvbVZhbHVlKG90aGVyKTtcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgJiBvdGhlci5sb3csIHRoaXMuaGlnaCAmIG90aGVyLmhpZ2gsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgYml0d2lzZSBPUiBvZiB0aGlzIExvbmcgYW5kIHRoZSBzcGVjaWZpZWQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciBMb25nXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5vciA9IGZ1bmN0aW9uIG9yKG90aGVyKSB7XG4gICAgaWYgKCFpc0xvbmcob3RoZXIpKSBvdGhlciA9IGZyb21WYWx1ZShvdGhlcik7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93IHwgb3RoZXIubG93LCB0aGlzLmhpZ2ggfCBvdGhlci5oaWdoLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJpdHdpc2UgWE9SIG9mIHRoaXMgTG9uZyBhbmQgdGhlIGdpdmVuIG9uZS5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIExvbmdcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnhvciA9IGZ1bmN0aW9uIHhvcihvdGhlcikge1xuICAgIGlmICghaXNMb25nKG90aGVyKSkgb3RoZXIgPSBmcm9tVmFsdWUob3RoZXIpO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyBeIG90aGVyLmxvdywgdGhpcy5oaWdoIF4gb3RoZXIuaGlnaCwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgc2hpZnRlZCB0byB0aGUgbGVmdCBieSB0aGUgZ2l2ZW4gYW1vdW50LlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuc2hpZnRMZWZ0ID0gZnVuY3Rpb24gc2hpZnRMZWZ0KG51bUJpdHMpIHtcbiAgICBpZiAoaXNMb25nKG51bUJpdHMpKSBudW1CaXRzID0gbnVtQml0cy50b0ludCgpO1xuICAgIGlmICgobnVtQml0cyAmPSA2MykgPT09IDApIHJldHVybiB0aGlzO2Vsc2UgaWYgKG51bUJpdHMgPCAzMikgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93IDw8IG51bUJpdHMsIHRoaXMuaGlnaCA8PCBudW1CaXRzIHwgdGhpcy5sb3cgPj4+IDMyIC0gbnVtQml0cywgdGhpcy51bnNpZ25lZCk7ZWxzZSByZXR1cm4gZnJvbUJpdHMoMCwgdGhpcy5sb3cgPDwgbnVtQml0cyAtIDMyLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBzaGlmdGVkIHRvIHRoZSBsZWZ0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjc2hpZnRMZWZ0fS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuc2hsID0gTG9uZ1Byb3RvdHlwZS5zaGlmdExlZnQ7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgYXJpdGhtZXRpY2FsbHkgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuc2hpZnRSaWdodCA9IGZ1bmN0aW9uIHNoaWZ0UmlnaHQobnVtQml0cykge1xuICAgIGlmIChpc0xvbmcobnVtQml0cykpIG51bUJpdHMgPSBudW1CaXRzLnRvSW50KCk7XG4gICAgaWYgKChudW1CaXRzICY9IDYzKSA9PT0gMCkgcmV0dXJuIHRoaXM7ZWxzZSBpZiAobnVtQml0cyA8IDMyKSByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgPj4+IG51bUJpdHMgfCB0aGlzLmhpZ2ggPDwgMzIgLSBudW1CaXRzLCB0aGlzLmhpZ2ggPj4gbnVtQml0cywgdGhpcy51bnNpZ25lZCk7ZWxzZSByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoID4+IG51bUJpdHMgLSAzMiwgdGhpcy5oaWdoID49IDAgPyAwIDogLTEsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIGFyaXRobWV0aWNhbGx5IHNoaWZ0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjc2hpZnRSaWdodH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnNociA9IExvbmdQcm90b3R5cGUuc2hpZnRSaWdodDtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBsb2dpY2FsbHkgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuc2hpZnRSaWdodFVuc2lnbmVkID0gZnVuY3Rpb24gc2hpZnRSaWdodFVuc2lnbmVkKG51bUJpdHMpIHtcbiAgICBpZiAoaXNMb25nKG51bUJpdHMpKSBudW1CaXRzID0gbnVtQml0cy50b0ludCgpO1xuICAgIGlmICgobnVtQml0cyAmPSA2MykgPT09IDApIHJldHVybiB0aGlzO1xuICAgIGlmIChudW1CaXRzIDwgMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyA+Pj4gbnVtQml0cyB8IHRoaXMuaGlnaCA8PCAzMiAtIG51bUJpdHMsIHRoaXMuaGlnaCA+Pj4gbnVtQml0cywgdGhpcy51bnNpZ25lZCk7XG4gICAgaWYgKG51bUJpdHMgPT09IDMyKSByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoLCAwLCB0aGlzLnVuc2lnbmVkKTtcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoID4+PiBudW1CaXRzIC0gMzIsIDAsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIGxvZ2ljYWxseSBzaGlmdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3NoaWZ0UmlnaHRVbnNpZ25lZH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnNocnUgPSBMb25nUHJvdG90eXBlLnNoaWZ0UmlnaHRVbnNpZ25lZDtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBsb2dpY2FsbHkgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNzaGlmdFJpZ2h0VW5zaWduZWR9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnNocl91ID0gTG9uZ1Byb3RvdHlwZS5zaGlmdFJpZ2h0VW5zaWduZWQ7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgcm90YXRlZCB0byB0aGUgbGVmdCBieSB0aGUgZ2l2ZW4gYW1vdW50LlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUm90YXRlZCBMb25nXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5yb3RhdGVMZWZ0ID0gZnVuY3Rpb24gcm90YXRlTGVmdChudW1CaXRzKSB7XG4gICAgdmFyIGI7XG4gICAgaWYgKGlzTG9uZyhudW1CaXRzKSkgbnVtQml0cyA9IG51bUJpdHMudG9JbnQoKTtcbiAgICBpZiAoKG51bUJpdHMgJj0gNjMpID09PSAwKSByZXR1cm4gdGhpcztcbiAgICBpZiAobnVtQml0cyA9PT0gMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2gsIHRoaXMubG93LCB0aGlzLnVuc2lnbmVkKTtcbiAgXG4gICAgaWYgKG51bUJpdHMgPCAzMikge1xuICAgICAgYiA9IDMyIC0gbnVtQml0cztcbiAgICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyA8PCBudW1CaXRzIHwgdGhpcy5oaWdoID4+PiBiLCB0aGlzLmhpZ2ggPDwgbnVtQml0cyB8IHRoaXMubG93ID4+PiBiLCB0aGlzLnVuc2lnbmVkKTtcbiAgICB9XG4gIFxuICAgIG51bUJpdHMgLT0gMzI7XG4gICAgYiA9IDMyIC0gbnVtQml0cztcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoIDw8IG51bUJpdHMgfCB0aGlzLmxvdyA+Pj4gYiwgdGhpcy5sb3cgPDwgbnVtQml0cyB8IHRoaXMuaGlnaCA+Pj4gYiwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgcm90YXRlZCB0byB0aGUgbGVmdCBieSB0aGUgZ2l2ZW4gYW1vdW50LiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3JvdGF0ZUxlZnR9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBSb3RhdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5yb3RsID0gTG9uZ1Byb3RvdHlwZS5yb3RhdGVMZWZ0O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIHJvdGF0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBSb3RhdGVkIExvbmdcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnJvdGF0ZVJpZ2h0ID0gZnVuY3Rpb24gcm90YXRlUmlnaHQobnVtQml0cykge1xuICAgIHZhciBiO1xuICAgIGlmIChpc0xvbmcobnVtQml0cykpIG51bUJpdHMgPSBudW1CaXRzLnRvSW50KCk7XG4gICAgaWYgKChudW1CaXRzICY9IDYzKSA9PT0gMCkgcmV0dXJuIHRoaXM7XG4gICAgaWYgKG51bUJpdHMgPT09IDMyKSByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoLCB0aGlzLmxvdywgdGhpcy51bnNpZ25lZCk7XG4gIFxuICAgIGlmIChudW1CaXRzIDwgMzIpIHtcbiAgICAgIGIgPSAzMiAtIG51bUJpdHM7XG4gICAgICByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoIDw8IGIgfCB0aGlzLmxvdyA+Pj4gbnVtQml0cywgdGhpcy5sb3cgPDwgYiB8IHRoaXMuaGlnaCA+Pj4gbnVtQml0cywgdGhpcy51bnNpZ25lZCk7XG4gICAgfVxuICBcbiAgICBudW1CaXRzIC09IDMyO1xuICAgIGIgPSAzMiAtIG51bUJpdHM7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93IDw8IGIgfCB0aGlzLmhpZ2ggPj4+IG51bUJpdHMsIHRoaXMuaGlnaCA8PCBiIHwgdGhpcy5sb3cgPj4+IG51bUJpdHMsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIHJvdGF0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjcm90YXRlUmlnaHR9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBSb3RhdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5yb3RyID0gTG9uZ1Byb3RvdHlwZS5yb3RhdGVSaWdodDtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoaXMgTG9uZyB0byBzaWduZWQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFMb25nfSBTaWduZWQgbG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUudG9TaWduZWQgPSBmdW5jdGlvbiB0b1NpZ25lZCgpIHtcbiAgICBpZiAoIXRoaXMudW5zaWduZWQpIHJldHVybiB0aGlzO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdywgdGhpcy5oaWdoLCBmYWxzZSk7XG4gIH07XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGlzIExvbmcgdG8gdW5zaWduZWQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFMb25nfSBVbnNpZ25lZCBsb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUudG9VbnNpZ25lZCA9IGZ1bmN0aW9uIHRvVW5zaWduZWQoKSB7XG4gICAgaWYgKHRoaXMudW5zaWduZWQpIHJldHVybiB0aGlzO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdywgdGhpcy5oaWdoLCB0cnVlKTtcbiAgfTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoaXMgTG9uZyB0byBpdHMgYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICogQHBhcmFtIHtib29sZWFuPX0gbGUgV2hldGhlciBsaXR0bGUgb3IgYmlnIGVuZGlhbiwgZGVmYXVsdHMgdG8gYmlnIGVuZGlhblxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshQXJyYXkuPG51bWJlcj59IEJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS50b0J5dGVzID0gZnVuY3Rpb24gdG9CeXRlcyhsZSkge1xuICAgIHJldHVybiBsZSA/IHRoaXMudG9CeXRlc0xFKCkgOiB0aGlzLnRvQnl0ZXNCRSgpO1xuICB9O1xuICAvKipcbiAgICogQ29udmVydHMgdGhpcyBMb25nIHRvIGl0cyBsaXR0bGUgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb24uXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFBcnJheS48bnVtYmVyPn0gTGl0dGxlIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUudG9CeXRlc0xFID0gZnVuY3Rpb24gdG9CeXRlc0xFKCkge1xuICAgIHZhciBoaSA9IHRoaXMuaGlnaCxcbiAgICAgICAgbG8gPSB0aGlzLmxvdztcbiAgICByZXR1cm4gW2xvICYgMHhmZiwgbG8gPj4+IDggJiAweGZmLCBsbyA+Pj4gMTYgJiAweGZmLCBsbyA+Pj4gMjQsIGhpICYgMHhmZiwgaGkgPj4+IDggJiAweGZmLCBoaSA+Pj4gMTYgJiAweGZmLCBoaSA+Pj4gMjRdO1xuICB9O1xuICAvKipcbiAgICogQ29udmVydHMgdGhpcyBMb25nIHRvIGl0cyBiaWcgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb24uXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFBcnJheS48bnVtYmVyPn0gQmlnIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUudG9CeXRlc0JFID0gZnVuY3Rpb24gdG9CeXRlc0JFKCkge1xuICAgIHZhciBoaSA9IHRoaXMuaGlnaCxcbiAgICAgICAgbG8gPSB0aGlzLmxvdztcbiAgICByZXR1cm4gW2hpID4+PiAyNCwgaGkgPj4+IDE2ICYgMHhmZiwgaGkgPj4+IDggJiAweGZmLCBoaSAmIDB4ZmYsIGxvID4+PiAyNCwgbG8gPj4+IDE2ICYgMHhmZiwgbG8gPj4+IDggJiAweGZmLCBsbyAmIDB4ZmZdO1xuICB9O1xuICAvKipcbiAgICogQ3JlYXRlcyBhIExvbmcgZnJvbSBpdHMgYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICogQHBhcmFtIHshQXJyYXkuPG51bWJlcj59IGJ5dGVzIEJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBsZSBXaGV0aGVyIGxpdHRsZSBvciBiaWcgZW5kaWFuLCBkZWZhdWx0cyB0byBiaWcgZW5kaWFuXG4gICAqIEByZXR1cm5zIHtMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbUJ5dGVzID0gZnVuY3Rpb24gZnJvbUJ5dGVzKGJ5dGVzLCB1bnNpZ25lZCwgbGUpIHtcbiAgICByZXR1cm4gbGUgPyBMb25nLmZyb21CeXRlc0xFKGJ5dGVzLCB1bnNpZ25lZCkgOiBMb25nLmZyb21CeXRlc0JFKGJ5dGVzLCB1bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgTG9uZyBmcm9tIGl0cyBsaXR0bGUgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb24uXG4gICAqIEBwYXJhbSB7IUFycmF5LjxudW1iZXI+fSBieXRlcyBMaXR0bGUgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcmV0dXJucyB7TG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21CeXRlc0xFID0gZnVuY3Rpb24gZnJvbUJ5dGVzTEUoYnl0ZXMsIHVuc2lnbmVkKSB7XG4gICAgcmV0dXJuIG5ldyBMb25nKGJ5dGVzWzBdIHwgYnl0ZXNbMV0gPDwgOCB8IGJ5dGVzWzJdIDw8IDE2IHwgYnl0ZXNbM10gPDwgMjQsIGJ5dGVzWzRdIHwgYnl0ZXNbNV0gPDwgOCB8IGJ5dGVzWzZdIDw8IDE2IHwgYnl0ZXNbN10gPDwgMjQsIHVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBMb25nIGZyb20gaXRzIGJpZyBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICogQHBhcmFtIHshQXJyYXkuPG51bWJlcj59IGJ5dGVzIEJpZyBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEByZXR1cm5zIHtMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbUJ5dGVzQkUgPSBmdW5jdGlvbiBmcm9tQnl0ZXNCRShieXRlcywgdW5zaWduZWQpIHtcbiAgICByZXR1cm4gbmV3IExvbmcoYnl0ZXNbNF0gPDwgMjQgfCBieXRlc1s1XSA8PCAxNiB8IGJ5dGVzWzZdIDw8IDggfCBieXRlc1s3XSwgYnl0ZXNbMF0gPDwgMjQgfCBieXRlc1sxXSA8PCAxNiB8IGJ5dGVzWzJdIDw8IDggfCBieXRlc1szXSwgdW5zaWduZWQpO1xuICB9O1xuICBcbiAgdmFyIF9kZWZhdWx0ID0gTG9uZztcbiAgZXhwb3J0cy5kZWZhdWx0ID0gX2RlZmF1bHQ7XG4gIHJldHVybiBcImRlZmF1bHRcIiBpbiBleHBvcnRzID8gZXhwb3J0cy5kZWZhdWx0IDogZXhwb3J0cztcbn0pKHt9KTtcbmlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShbXSwgZnVuY3Rpb24oKSB7IHJldHVybiBMb25nOyB9KTtcbmVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JykgbW9kdWxlLmV4cG9ydHMgPSBMb25nO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIlxuY29uc3QgYXBpID0gcmVxdWlyZSgnQHRlbXBvcmFsaW8vd29ya2Zsb3cvbGliL3dvcmtlci1pbnRlcmZhY2UuanMnKTtcbmV4cG9ydHMuYXBpID0gYXBpO1xuXG5jb25zdCB7IG92ZXJyaWRlR2xvYmFscyB9ID0gcmVxdWlyZSgnQHRlbXBvcmFsaW8vd29ya2Zsb3cvbGliL2dsb2JhbC1vdmVycmlkZXMuanMnKTtcbm92ZXJyaWRlR2xvYmFscygpO1xuXG5leHBvcnRzLmltcG9ydFdvcmtmbG93cyA9IGZ1bmN0aW9uIGltcG9ydFdvcmtmbG93cygpIHtcbiAgcmV0dXJuIHJlcXVpcmUoLyogd2VicGFja01vZGU6IFwiZWFnZXJcIiAqLyBcIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL3NyYy93b3JrZmxvd3MudHNcIik7XG59XG5cbmV4cG9ydHMuaW1wb3J0SW50ZXJjZXB0b3JzID0gZnVuY3Rpb24gaW1wb3J0SW50ZXJjZXB0b3JzKCkge1xuICByZXR1cm4gW1xuICAgIFxuICBdO1xufVxuIl0sIm5hbWVzIjpbInByb3h5QWN0aXZpdGllcyIsInByb3h5TG9jYWxBY3Rpdml0aWVzIiwiZGVmaW5lU2lnbmFsIiwic2V0SGFuZGxlciIsImNvbmRpdGlvbiIsImxvZyIsInN0YXJ0Q2hpbGQiLCJzbGVlcCIsImdldEV4dGVybmFsV29ya2Zsb3dIYW5kbGUiLCJkZWZpbmVRdWVyeSIsImNvbnRpbnVlQXNOZXciLCJQYXJlbnRDbG9zZVBvbGljeSIsIkFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZSIsIkNhbmNlbGxhdGlvblNjb3BlIiwiaXNDYW5jZWxsYXRpb24iLCJ3b3JrZmxvd0luZm8iLCJST1VORF9XRl9JRCIsIkFQUExFX1BPSU5UUyIsIlNOQUtFX01PVkVTX0JFRk9SRV9DQU4iLCJTTkFLRV9XT1JLRVJfRE9XTl9USU1FIiwiZW1pdCIsInN0YXJ0VG9DbG9zZVRpbWVvdXQiLCJzbmFrZVRyYWNrZXIiLCJoZWFydGJlYXRUaW1lb3V0IiwiY2FuY2VsbGF0aW9uVHlwZSIsIldBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRCIsInJldHJ5IiwiaW5pdGlhbEludGVydmFsIiwiYmFja29mZkNvZWZmaWNpZW50IiwicmFuZG9tRGlyZWN0aW9uIiwiZGlyZWN0aW9ucyIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImxlbmd0aCIsIm9wcG9zaXRlRGlyZWN0aW9uIiwiZGlyZWN0aW9uIiwiZ2FtZVN0YXRlUXVlcnkiLCJyb3VuZFN0YXRlUXVlcnkiLCJnYW1lRmluaXNoU2lnbmFsIiwicm91bmRTdGFydFNpZ25hbCIsInNuYWtlQ2hhbmdlRGlyZWN0aW9uU2lnbmFsIiwic25ha2VNb3ZlU2lnbmFsIiwid29ya2VyU3RvcFNpZ25hbCIsIndvcmtlclN0YXJ0ZWRTaWduYWwiLCJHYW1lV29ya2Zsb3ciLCJjb25maWciLCJpbmZvIiwiZ2FtZSIsInRlYW1zIiwidGVhbU5hbWVzIiwicmVkdWNlIiwiYWNjIiwibmFtZSIsInNjb3JlIiwiZmluaXNoZWQiLCJyb3VuZFNjb3BlIiwiY2FuY2VsIiwibmV3Um91bmQiLCJzbmFrZXMiLCJidWlsZFJvdW5kVGVhbXMiLCJ1bmRlZmluZWQiLCJydW4iLCJyb3VuZFdmIiwiUm91bmRXb3JrZmxvdyIsIndvcmtmbG93SWQiLCJhcmdzIiwicGFyZW50Q2xvc2VQb2xpY3kiLCJQQVJFTlRfQ0xPU0VfUE9MSUNZX1JFUVVFU1RfQ0FOQ0VMIiwicm91bmQiLCJyZXN1bHQiLCJ0ZWFtIiwiT2JqZWN0IiwidmFsdWVzIiwiZXJyIiwiZHVyYXRpb24iLCJyb3VuZER1cmF0aW9uIiwiYXBwbGVzIiwic25ha2UiLCJpZCIsIndvcmtlcklkcyIsInNuYWtlTW92ZXMiLCJ3b3JrZXJzU3RhcnRlZCIsInB1c2giLCJpZGVudGl0eSIsInByb2Nlc3NTaWduYWxzIiwiZXZlbnRzIiwiYXBwbGVzRWF0ZW4iLCJzaWduYWxzIiwibW92ZSIsIm1vdmVTbmFrZSIsInR5cGUiLCJwYXlsb2FkIiwic25ha2VJZCIsInNlZ21lbnRzIiwiYXRlQXBwbGVJZCIsInRlYW1OYW1lIiwiYXBwbGVJZCIsImtpbGxXb3JrZXJzIiwid29ya2VyTWFuYWdlciIsIndvcmtlck1hbmFnZXJzIiwic2lnbmFsIiwid29ya2VySWQiLCJyYW5kb21FbXB0eVBvaW50IiwiUHJvbWlzZSIsImFsbCIsInJhbmRvbWl6ZVJvdW5kIiwiY3JlYXRlV29ya2VySWRzIiwic3RhcnRXb3JrZXJNYW5hZ2VycyIsInJ1bklkIiwic3RhcnRTbmFrZVRyYWNrZXJzIiwic3RhcnRTbmFrZXMiLCJzdGFydGVkQXQiLCJEYXRlIiwibm93IiwicmFjZSIsImN1cnJlbnQiLCJjYW5jZWxSZXF1ZXN0ZWQiLCJ0aGVuIiwiY2F0Y2giLCJmaW5hbGx5Iiwibm9uQ2FuY2VsbGFibGUiLCJTbmFrZVdvcmtlcldvcmtmbG93Iiwicm91bmRJZCIsInNjb3BlIiwidGFza1F1ZXVlIiwic25ha2VXb3JrZXIiLCJlcnJvciIsIlNuYWtlV29ya2Zsb3ciLCJub21zUGVyTW92ZSIsIm5vbUR1cmF0aW9uIiwibmV3RGlyZWN0aW9uIiwic25ha2VOb20iLCJub21zIiwiQXJyYXkiLCJmcm9tIiwibW92ZXMiLCJtYXAiLCJoZWFkU2VnbWVudCIsInRhaWxTZWdtZW50IiwiY3VycmVudERpcmVjdGlvbiIsImN1cnJlbnRIZWFkIiwiaGVhZCIsImFnYWluc3RBbkVkZ2UiLCJ4IiwieSIsInVuc2hpZnQiLCJuZXdIZWFkIiwiaGVpZ2h0Iiwid2lkdGgiLCJzbmFrZUF0IiwiYXBwbGVBdCIsInBvcCIsInBvaW50IiwiYXBwbGUiLCJlbnRyaWVzIiwiY2FsY3VsYXRlUG9zaXRpb24iLCJzZWdtZW50Iiwic3RhcnQiLCJ0IiwiYiIsImwiLCJyIiwicG9zIiwiY2VpbCIsImNvdW50IiwiXyIsImkiLCJpZGVudGl0aWVzIiwiaGFuZGxlcyIsImZyb21FbnRyaWVzIiwiaW5kZXgiLCJjb21tYW5kcyIsIndvcmtmbG93VGFza1RpbWVvdXQiXSwic291cmNlUm9vdCI6IiJ9