(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.fdc3 = factory());
}(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    const isInElectron = navigator.userAgent.toLowerCase().includes(" electron/");
    const isInGdContainer = navigator.userAgent.toLowerCase().includes(" tick42-glue-desktop/");
    const isEmptyObject = (obj) => {
        return typeof obj === "object" && !Array.isArray(obj) && Object.keys(obj).length === 0;
    };
    const AsyncListener = (actualUnsub) => {
        return {
            unsubscribe() {
                if (!actualUnsub) {
                    console.error("Failed to unsubscribe!");
                    return;
                }
                if (typeof actualUnsub === "function") {
                    actualUnsub();
                }
                else {
                    actualUnsub.then((unsubFunc) => unsubFunc()).catch(console.error);
                }
            }
        };
    };
    const checkIfInElectron = (globalFdc3) => {
        const hasGlue42electron = typeof window !== "undefined" && "glue42electron" in window;
        if (!hasGlue42electron) {
            return;
        }
        const runningInElectron = typeof process !== "undefined" && "contextIsolated" in process;
        if (runningInElectron) {
            const contextBridge = require("electron").contextBridge;
            contextBridge.exposeInMainWorld("fdc3", globalFdc3);
        }
    };
    const promisePlus = (promise, timeoutMilliseconds, timeoutMessage) => {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                const message = timeoutMessage || `Promise timeout hit: ${timeoutMilliseconds}`;
                reject(message);
            }, timeoutMilliseconds);
            promise()
                .then((result) => {
                clearTimeout(timeout);
                resolve(result);
            })
                .catch((error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    };

    var IntentHandlerResultTypes;
    (function (IntentHandlerResultTypes) {
        IntentHandlerResultTypes["Context"] = "Context";
        IntentHandlerResultTypes["Channel"] = "Channel";
    })(IntentHandlerResultTypes || (IntentHandlerResultTypes = {}));
    const fdc3ChannelNames = ['fdc3.channel.1', 'fdc3.channel.4', 'fdc3.channel.6', 'fdc3.channel.3', 'fdc3.channel.2', 'fdc3.channel.8', 'fdc3.channel.7', 'fdc3.channel.5'];
    const defaultChannelsProps = ["id", "type", "broadcast", "addContextListener", "getCurrentContext"];
    const defaultContextProps = ["type"];
    const defaultGlue42APIs = ["contexts", "channels", "interop", "intents", "appManager", "windows"];

    const Glue42FDC3SystemMethod = "T42.FDC3.Client.Control";
    const PrivateChannelPrefix = "___privateFDC3Channel___";
    var PrivateChannelEventMethods;
    (function (PrivateChannelEventMethods) {
        PrivateChannelEventMethods["OnAddContextListener"] = "onAddContextListener";
        PrivateChannelEventMethods["OnUnsubscribe"] = "onUnsubscribe";
        PrivateChannelEventMethods["OnDisconnect"] = "onDisconnect";
    })(PrivateChannelEventMethods || (PrivateChannelEventMethods = {}));
    var ChannelTypes;
    (function (ChannelTypes) {
        ChannelTypes["User"] = "user";
        ChannelTypes["App"] = "app";
        ChannelTypes["Private"] = "private";
    })(ChannelTypes || (ChannelTypes = {}));

    /**
     * Wraps values in an `Ok` type.
     *
     * Example: `ok(5) // => {ok: true, result: 5}`
     */
    var ok = function (result) { return ({ ok: true, result: result }); };
    /**
     * Typeguard for `Ok`.
     */
    var isOk = function (r) { return r.ok === true; };
    /**
     * Wraps errors in an `Err` type.
     *
     * Example: `err('on fire') // => {ok: false, error: 'on fire'}`
     */
    var err = function (error) { return ({ ok: false, error: error }); };
    /**
     * Typeguard for `Err`.
     */
    var isErr = function (r) { return r.ok === false; };
    /**
     * Create a `Promise` that either resolves with the result of `Ok` or rejects
     * with the error of `Err`.
     */
    var asPromise = function (r) {
        return r.ok === true ? Promise.resolve(r.result) : Promise.reject(r.error);
    };
    /**
     * Unwraps a `Result` and returns either the result of an `Ok`, or
     * `defaultValue`.
     *
     * Example:
     * ```
     * Result.withDefault(5, number().run(json))
     * ```
     *
     * It would be nice if `Decoder` had an instance method that mirrored this
     * function. Such a method would look something like this:
     * ```
     * class Decoder<A> {
     *   runWithDefault = (defaultValue: A, json: any): A =>
     *     Result.withDefault(defaultValue, this.run(json));
     * }
     *
     * number().runWithDefault(5, json)
     * ```
     * Unfortunately, the type of `defaultValue: A` on the method causes issues
     * with type inference on  the `object` decoder in some situations. While these
     * inference issues can be solved by providing the optional type argument for
     * `object`s, the extra trouble and confusion doesn't seem worth it.
     */
    var withDefault = function (defaultValue, r) {
        return r.ok === true ? r.result : defaultValue;
    };
    /**
     * Return the successful result, or throw an error.
     */
    var withException = function (r) {
        if (r.ok === true) {
            return r.result;
        }
        else {
            throw r.error;
        }
    };
    /**
     * Given an array of `Result`s, return the successful values.
     */
    var successes = function (results) {
        return results.reduce(function (acc, r) { return (r.ok === true ? acc.concat(r.result) : acc); }, []);
    };
    /**
     * Apply `f` to the result of an `Ok`, or pass the error through.
     */
    var map = function (f, r) {
        return r.ok === true ? ok(f(r.result)) : r;
    };
    /**
     * Apply `f` to the result of two `Ok`s, or pass an error through. If both
     * `Result`s are errors then the first one is returned.
     */
    var map2 = function (f, ar, br) {
        return ar.ok === false ? ar :
            br.ok === false ? br :
                ok(f(ar.result, br.result));
    };
    /**
     * Apply `f` to the error of an `Err`, or pass the success through.
     */
    var mapError = function (f, r) {
        return r.ok === true ? r : err(f(r.error));
    };
    /**
     * Chain together a sequence of computations that may fail, similar to a
     * `Promise`. If the first computation fails then the error will propagate
     * through. If it succeeds, then `f` will be applied to the value, returning a
     * new `Result`.
     */
    var andThen = function (f, r) {
        return r.ok === true ? f(r.result) : r;
    };


    var result = Object.freeze({
    	ok: ok,
    	isOk: isOk,
    	err: err,
    	isErr: isErr,
    	asPromise: asPromise,
    	withDefault: withDefault,
    	withException: withException,
    	successes: successes,
    	map: map,
    	map2: map2,
    	mapError: mapError,
    	andThen: andThen
    });

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */



    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest$1(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function isEqual(a, b) {
        if (a === b) {
            return true;
        }
        if (a === null && b === null) {
            return true;
        }
        if (typeof (a) !== typeof (b)) {
            return false;
        }
        if (typeof (a) === 'object') {
            // Array
            if (Array.isArray(a)) {
                if (!Array.isArray(b)) {
                    return false;
                }
                if (a.length !== b.length) {
                    return false;
                }
                for (var i = 0; i < a.length; i++) {
                    if (!isEqual(a[i], b[i])) {
                        return false;
                    }
                }
                return true;
            }
            // Hash table
            var keys = Object.keys(a);
            if (keys.length !== Object.keys(b).length) {
                return false;
            }
            for (var i = 0; i < keys.length; i++) {
                if (!b.hasOwnProperty(keys[i])) {
                    return false;
                }
                if (!isEqual(a[keys[i]], b[keys[i]])) {
                    return false;
                }
            }
            return true;
        }
    }
    /*
     * Helpers
     */
    var isJsonArray = function (json) { return Array.isArray(json); };
    var isJsonObject = function (json) {
        return typeof json === 'object' && json !== null && !isJsonArray(json);
    };
    var typeString = function (json) {
        switch (typeof json) {
            case 'string':
                return 'a string';
            case 'number':
                return 'a number';
            case 'boolean':
                return 'a boolean';
            case 'undefined':
                return 'undefined';
            case 'object':
                if (json instanceof Array) {
                    return 'an array';
                }
                else if (json === null) {
                    return 'null';
                }
                else {
                    return 'an object';
                }
            default:
                return JSON.stringify(json);
        }
    };
    var expectedGot = function (expected, got) {
        return "expected " + expected + ", got " + typeString(got);
    };
    var printPath = function (paths) {
        return paths.map(function (path) { return (typeof path === 'string' ? "." + path : "[" + path + "]"); }).join('');
    };
    var prependAt = function (newAt, _a) {
        var at = _a.at, rest = __rest$1(_a, ["at"]);
        return (__assign({ at: newAt + (at || '') }, rest));
    };
    /**
     * Decoders transform json objects with unknown structure into known and
     * verified forms. You can create objects of type `Decoder<A>` with either the
     * primitive decoder functions, such as `boolean()` and `string()`, or by
     * applying higher-order decoders to the primitives, such as `array(boolean())`
     * or `dict(string())`.
     *
     * Each of the decoder functions are available both as a static method on
     * `Decoder` and as a function alias -- for example the string decoder is
     * defined at `Decoder.string()`, but is also aliased to `string()`. Using the
     * function aliases exported with the library is recommended.
     *
     * `Decoder` exposes a number of 'run' methods, which all decode json in the
     * same way, but communicate success and failure in different ways. The `map`
     * and `andThen` methods modify decoders without having to call a 'run' method.
     *
     * Alternatively, the main decoder `run()` method returns an object of type
     * `Result<A, DecoderError>`. This library provides a number of helper
     * functions for dealing with the `Result` type, so you can do all the same
     * things with a `Result` as with the decoder methods.
     */
    var Decoder = /** @class */ (function () {
        /**
         * The Decoder class constructor is kept private to separate the internal
         * `decode` function from the external `run` function. The distinction
         * between the two functions is that `decode` returns a
         * `Partial<DecoderError>` on failure, which contains an unfinished error
         * report. When `run` is called on a decoder, the relevant series of `decode`
         * calls is made, and then on failure the resulting `Partial<DecoderError>`
         * is turned into a `DecoderError` by filling in the missing information.
         *
         * While hiding the constructor may seem restrictive, leveraging the
         * provided decoder combinators and helper functions such as
         * `andThen` and `map` should be enough to build specialized decoders as
         * needed.
         */
        function Decoder(decode) {
            var _this = this;
            this.decode = decode;
            /**
             * Run the decoder and return a `Result` with either the decoded value or a
             * `DecoderError` containing the json input, the location of the error, and
             * the error message.
             *
             * Examples:
             * ```
             * number().run(12)
             * // => {ok: true, result: 12}
             *
             * string().run(9001)
             * // =>
             * // {
             * //   ok: false,
             * //   error: {
             * //     kind: 'DecoderError',
             * //     input: 9001,
             * //     at: 'input',
             * //     message: 'expected a string, got 9001'
             * //   }
             * // }
             * ```
             */
            this.run = function (json) {
                return mapError(function (error) { return ({
                    kind: 'DecoderError',
                    input: json,
                    at: 'input' + (error.at || ''),
                    message: error.message || ''
                }); }, _this.decode(json));
            };
            /**
             * Run the decoder as a `Promise`.
             */
            this.runPromise = function (json) { return asPromise(_this.run(json)); };
            /**
             * Run the decoder and return the value on success, or throw an exception
             * with a formatted error string.
             */
            this.runWithException = function (json) { return withException(_this.run(json)); };
            /**
             * Construct a new decoder that applies a transformation to the decoded
             * result. If the decoder succeeds then `f` will be applied to the value. If
             * it fails the error will propagated through.
             *
             * Example:
             * ```
             * number().map(x => x * 5).run(10)
             * // => {ok: true, result: 50}
             * ```
             */
            this.map = function (f) {
                return new Decoder(function (json) { return map(f, _this.decode(json)); });
            };
            /**
             * Chain together a sequence of decoders. The first decoder will run, and
             * then the function will determine what decoder to run second. If the result
             * of the first decoder succeeds then `f` will be applied to the decoded
             * value. If it fails the error will propagate through.
             *
             * This is a very powerful method -- it can act as both the `map` and `where`
             * methods, can improve error messages for edge cases, and can be used to
             * make a decoder for custom types.
             *
             * Example of adding an error message:
             * ```
             * const versionDecoder = valueAt(['version'], number());
             * const infoDecoder3 = object({a: boolean()});
             *
             * const decoder = versionDecoder.andThen(version => {
             *   switch (version) {
             *     case 3:
             *       return infoDecoder3;
             *     default:
             *       return fail(`Unable to decode info, version ${version} is not supported.`);
             *   }
             * });
             *
             * decoder.run({version: 3, a: true})
             * // => {ok: true, result: {a: true}}
             *
             * decoder.run({version: 5, x: 'abc'})
             * // =>
             * // {
             * //   ok: false,
             * //   error: {... message: 'Unable to decode info, version 5 is not supported.'}
             * // }
             * ```
             *
             * Example of decoding a custom type:
             * ```
             * // nominal type for arrays with a length of at least one
             * type NonEmptyArray<T> = T[] & { __nonEmptyArrayBrand__: void };
             *
             * const nonEmptyArrayDecoder = <T>(values: Decoder<T>): Decoder<NonEmptyArray<T>> =>
             *   array(values).andThen(arr =>
             *     arr.length > 0
             *       ? succeed(createNonEmptyArray(arr))
             *       : fail(`expected a non-empty array, got an empty array`)
             *   );
             * ```
             */
            this.andThen = function (f) {
                return new Decoder(function (json) {
                    return andThen(function (value) { return f(value).decode(json); }, _this.decode(json));
                });
            };
            /**
             * Add constraints to a decoder _without_ changing the resulting type. The
             * `test` argument is a predicate function which returns true for valid
             * inputs. When `test` fails on an input, the decoder fails with the given
             * `errorMessage`.
             *
             * ```
             * const chars = (length: number): Decoder<string> =>
             *   string().where(
             *     (s: string) => s.length === length,
             *     `expected a string of length ${length}`
             *   );
             *
             * chars(5).run('12345')
             * // => {ok: true, result: '12345'}
             *
             * chars(2).run('HELLO')
             * // => {ok: false, error: {... message: 'expected a string of length 2'}}
             *
             * chars(12).run(true)
             * // => {ok: false, error: {... message: 'expected a string, got a boolean'}}
             * ```
             */
            this.where = function (test, errorMessage) {
                return _this.andThen(function (value) { return (test(value) ? Decoder.succeed(value) : Decoder.fail(errorMessage)); });
            };
        }
        /**
         * Decoder primitive that validates strings, and fails on all other input.
         */
        Decoder.string = function () {
            return new Decoder(function (json) {
                return typeof json === 'string'
                    ? ok(json)
                    : err({ message: expectedGot('a string', json) });
            });
        };
        /**
         * Decoder primitive that validates numbers, and fails on all other input.
         */
        Decoder.number = function () {
            return new Decoder(function (json) {
                return typeof json === 'number'
                    ? ok(json)
                    : err({ message: expectedGot('a number', json) });
            });
        };
        /**
         * Decoder primitive that validates booleans, and fails on all other input.
         */
        Decoder.boolean = function () {
            return new Decoder(function (json) {
                return typeof json === 'boolean'
                    ? ok(json)
                    : err({ message: expectedGot('a boolean', json) });
            });
        };
        Decoder.constant = function (value) {
            return new Decoder(function (json) {
                return isEqual(json, value)
                    ? ok(value)
                    : err({ message: "expected " + JSON.stringify(value) + ", got " + JSON.stringify(json) });
            });
        };
        Decoder.object = function (decoders) {
            return new Decoder(function (json) {
                if (isJsonObject(json) && decoders) {
                    var obj = {};
                    for (var key in decoders) {
                        if (decoders.hasOwnProperty(key)) {
                            var r = decoders[key].decode(json[key]);
                            if (r.ok === true) {
                                // tslint:disable-next-line:strict-type-predicates
                                if (r.result !== undefined) {
                                    obj[key] = r.result;
                                }
                            }
                            else if (json[key] === undefined) {
                                return err({ message: "the key '" + key + "' is required but was not present" });
                            }
                            else {
                                return err(prependAt("." + key, r.error));
                            }
                        }
                    }
                    return ok(obj);
                }
                else if (isJsonObject(json)) {
                    return ok(json);
                }
                else {
                    return err({ message: expectedGot('an object', json) });
                }
            });
        };
        Decoder.array = function (decoder) {
            return new Decoder(function (json) {
                if (isJsonArray(json) && decoder) {
                    var decodeValue_1 = function (v, i) {
                        return mapError(function (err$$1) { return prependAt("[" + i + "]", err$$1); }, decoder.decode(v));
                    };
                    return json.reduce(function (acc, v, i) {
                        return map2(function (arr, result) { return arr.concat([result]); }, acc, decodeValue_1(v, i));
                    }, ok([]));
                }
                else if (isJsonArray(json)) {
                    return ok(json);
                }
                else {
                    return err({ message: expectedGot('an array', json) });
                }
            });
        };
        Decoder.tuple = function (decoders) {
            return new Decoder(function (json) {
                if (isJsonArray(json)) {
                    if (json.length !== decoders.length) {
                        return err({
                            message: "expected a tuple of length " + decoders.length + ", got one of length " + json.length
                        });
                    }
                    var result = [];
                    for (var i = 0; i < decoders.length; i++) {
                        var nth = decoders[i].decode(json[i]);
                        if (nth.ok) {
                            result[i] = nth.result;
                        }
                        else {
                            return err(prependAt("[" + i + "]", nth.error));
                        }
                    }
                    return ok(result);
                }
                else {
                    return err({ message: expectedGot("a tuple of length " + decoders.length, json) });
                }
            });
        };
        Decoder.union = function (ad, bd) {
            var decoders = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                decoders[_i - 2] = arguments[_i];
            }
            return Decoder.oneOf.apply(Decoder, [ad, bd].concat(decoders));
        };
        Decoder.intersection = function (ad, bd) {
            var ds = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                ds[_i - 2] = arguments[_i];
            }
            return new Decoder(function (json) {
                return [ad, bd].concat(ds).reduce(function (acc, decoder) { return map2(Object.assign, acc, decoder.decode(json)); }, ok({}));
            });
        };
        /**
         * Escape hatch to bypass validation. Always succeeds and types the result as
         * `any`. Useful for defining decoders incrementally, particularly for
         * complex objects.
         *
         * Example:
         * ```
         * interface User {
         *   name: string;
         *   complexUserData: ComplexType;
         * }
         *
         * const userDecoder: Decoder<User> = object({
         *   name: string(),
         *   complexUserData: anyJson()
         * });
         * ```
         */
        Decoder.anyJson = function () { return new Decoder(function (json) { return ok(json); }); };
        /**
         * Decoder identity function which always succeeds and types the result as
         * `unknown`.
         */
        Decoder.unknownJson = function () {
            return new Decoder(function (json) { return ok(json); });
        };
        /**
         * Decoder for json objects where the keys are unknown strings, but the values
         * should all be of the same type.
         *
         * Example:
         * ```
         * dict(number()).run({chocolate: 12, vanilla: 10, mint: 37});
         * // => {ok: true, result: {chocolate: 12, vanilla: 10, mint: 37}}
         * ```
         */
        Decoder.dict = function (decoder) {
            return new Decoder(function (json) {
                if (isJsonObject(json)) {
                    var obj = {};
                    for (var key in json) {
                        if (json.hasOwnProperty(key)) {
                            var r = decoder.decode(json[key]);
                            if (r.ok === true) {
                                obj[key] = r.result;
                            }
                            else {
                                return err(prependAt("." + key, r.error));
                            }
                        }
                    }
                    return ok(obj);
                }
                else {
                    return err({ message: expectedGot('an object', json) });
                }
            });
        };
        /**
         * Decoder for values that may be `undefined`. This is primarily helpful for
         * decoding interfaces with optional fields.
         *
         * Example:
         * ```
         * interface User {
         *   id: number;
         *   isOwner?: boolean;
         * }
         *
         * const decoder: Decoder<User> = object({
         *   id: number(),
         *   isOwner: optional(boolean())
         * });
         * ```
         */
        Decoder.optional = function (decoder) {
            return new Decoder(function (json) { return (json === undefined || json === null ? ok(undefined) : decoder.decode(json)); });
        };
        /**
         * Decoder that attempts to run each decoder in `decoders` and either succeeds
         * with the first successful decoder, or fails after all decoders have failed.
         *
         * Note that `oneOf` expects the decoders to all have the same return type,
         * while `union` creates a decoder for the union type of all the input
         * decoders.
         *
         * Examples:
         * ```
         * oneOf(string(), number().map(String))
         * oneOf(constant('start'), constant('stop'), succeed('unknown'))
         * ```
         */
        Decoder.oneOf = function () {
            var decoders = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                decoders[_i] = arguments[_i];
            }
            return new Decoder(function (json) {
                var errors = [];
                for (var i = 0; i < decoders.length; i++) {
                    var r = decoders[i].decode(json);
                    if (r.ok === true) {
                        return r;
                    }
                    else {
                        errors[i] = r.error;
                    }
                }
                var errorsList = errors
                    .map(function (error) { return "at error" + (error.at || '') + ": " + error.message; })
                    .join('", "');
                return err({
                    message: "expected a value matching one of the decoders, got the errors [\"" + errorsList + "\"]"
                });
            });
        };
        /**
         * Decoder that always succeeds with either the decoded value, or a fallback
         * default value.
         */
        Decoder.withDefault = function (defaultValue, decoder) {
            return new Decoder(function (json) {
                return ok(withDefault(defaultValue, decoder.decode(json)));
            });
        };
        /**
         * Decoder that pulls a specific field out of a json structure, instead of
         * decoding and returning the full structure. The `paths` array describes the
         * object keys and array indices to traverse, so that values can be pulled out
         * of a nested structure.
         *
         * Example:
         * ```
         * const decoder = valueAt(['a', 'b', 0], string());
         *
         * decoder.run({a: {b: ['surprise!']}})
         * // => {ok: true, result: 'surprise!'}
         *
         * decoder.run({a: {x: 'cats'}})
         * // => {ok: false, error: {... at: 'input.a.b[0]' message: 'path does not exist'}}
         * ```
         *
         * Note that the `decoder` is ran on the value found at the last key in the
         * path, even if the last key is not found. This allows the `optional`
         * decoder to succeed when appropriate.
         * ```
         * const optionalDecoder = valueAt(['a', 'b', 'c'], optional(string()));
         *
         * optionalDecoder.run({a: {b: {c: 'surprise!'}}})
         * // => {ok: true, result: 'surprise!'}
         *
         * optionalDecoder.run({a: {b: 'cats'}})
         * // => {ok: false, error: {... at: 'input.a.b.c' message: 'expected an object, got "cats"'}
         *
         * optionalDecoder.run({a: {b: {z: 1}}})
         * // => {ok: true, result: undefined}
         * ```
         */
        Decoder.valueAt = function (paths, decoder) {
            return new Decoder(function (json) {
                var jsonAtPath = json;
                for (var i = 0; i < paths.length; i++) {
                    if (jsonAtPath === undefined) {
                        return err({
                            at: printPath(paths.slice(0, i + 1)),
                            message: 'path does not exist'
                        });
                    }
                    else if (typeof paths[i] === 'string' && !isJsonObject(jsonAtPath)) {
                        return err({
                            at: printPath(paths.slice(0, i + 1)),
                            message: expectedGot('an object', jsonAtPath)
                        });
                    }
                    else if (typeof paths[i] === 'number' && !isJsonArray(jsonAtPath)) {
                        return err({
                            at: printPath(paths.slice(0, i + 1)),
                            message: expectedGot('an array', jsonAtPath)
                        });
                    }
                    else {
                        jsonAtPath = jsonAtPath[paths[i]];
                    }
                }
                return mapError(function (error) {
                    return jsonAtPath === undefined
                        ? { at: printPath(paths), message: 'path does not exist' }
                        : prependAt(printPath(paths), error);
                }, decoder.decode(jsonAtPath));
            });
        };
        /**
         * Decoder that ignores the input json and always succeeds with `fixedValue`.
         */
        Decoder.succeed = function (fixedValue) {
            return new Decoder(function (json) { return ok(fixedValue); });
        };
        /**
         * Decoder that ignores the input json and always fails with `errorMessage`.
         */
        Decoder.fail = function (errorMessage) {
            return new Decoder(function (json) { return err({ message: errorMessage }); });
        };
        /**
         * Decoder that allows for validating recursive data structures. Unlike with
         * functions, decoders assigned to variables can't reference themselves
         * before they are fully defined. We can avoid prematurely referencing the
         * decoder by wrapping it in a function that won't be called until use, at
         * which point the decoder has been defined.
         *
         * Example:
         * ```
         * interface Comment {
         *   msg: string;
         *   replies: Comment[];
         * }
         *
         * const decoder: Decoder<Comment> = object({
         *   msg: string(),
         *   replies: lazy(() => array(decoder))
         * });
         * ```
         */
        Decoder.lazy = function (mkDecoder) {
            return new Decoder(function (json) { return mkDecoder().decode(json); });
        };
        return Decoder;
    }());

    /* tslint:disable:variable-name */
    /** See `Decoder.string` */
    var string = Decoder.string;
    /** See `Decoder.number` */
    var number = Decoder.number;
    /** See `Decoder.anyJson` */
    var anyJson = Decoder.anyJson;
    /** See `Decoder.constant` */
    var constant = Decoder.constant;
    /** See `Decoder.object` */
    var object = Decoder.object;
    /** See `Decoder.array` */
    var array = Decoder.array;
    /** See `Decoder.optional` */
    var optional = Decoder.optional;
    /** See `Decoder.oneOf` */
    var oneOf = Decoder.oneOf;

    const nonEmptyStringDecoder = string().where((s) => s.length > 0, "Expected a non-empty string");
    const nonNegativeNumberDecoder = number().where((num) => num >= 0, "Expected a non-negative number");
    const iconDecoder = object({
        src: nonEmptyStringDecoder,
        size: optional(string()),
        type: optional(string())
    });
    const imageDecoder = object({
        src: nonEmptyStringDecoder,
        size: optional(string()),
        type: optional(string()),
        label: optional(string())
    });
    const appMetadataDecoder = object({
        appId: nonEmptyStringDecoder,
        instanceId: optional(string()),
        name: optional(string()),
        version: optional(string()),
        title: optional(string()),
        tooltip: optional(string()),
        description: optional(string()),
        icons: optional(array(iconDecoder)),
        images: optional(array(imageDecoder)),
    });
    const appIdentifierDecoder = object({
        appId: nonEmptyStringDecoder,
        instanceId: optional(string())
    });
    const targetAppDecoder = oneOf(nonEmptyStringDecoder, appIdentifierDecoder);
    const contextDecoder = object({
        type: nonEmptyStringDecoder,
        name: optional(nonEmptyStringDecoder),
        id: optional(anyJson()),
    });
    const optionalContextDecoder = optional(contextDecoder);
    const optionalTargetApp = optional(appIdentifierDecoder);
    const optionalAppIdentifier = optional(targetAppDecoder);
    const optionalNonEmptyStringDecoder = optional(nonEmptyStringDecoder);
    const SystemMethodActionDecider = oneOf(constant(PrivateChannelEventMethods.OnAddContextListener), constant(PrivateChannelEventMethods.OnUnsubscribe), constant(PrivateChannelEventMethods.OnDisconnect));
    const SystemMethodEventPayloadDecoder = object({
        channelId: nonEmptyStringDecoder,
        clientId: nonEmptyStringDecoder,
        contextType: optional(string()),
        replayContextTypes: optional(array(string()))
    });
    const SystemMethodInvocationArgumentDecoder = object({
        action: SystemMethodActionDecider,
        payload: SystemMethodEventPayloadDecoder
    });

    class GlueController {
        constructor(channelsParser, fireFdc3ReadyEvent) {
            this.channelsParser = channelsParser;
            this.fireFdc3ReadyEvent = fireFdc3ReadyEvent;
            this.defaultGluePromiseTimeout = 120000;
        }
        get gluePromise() {
            return this.glueInitPromise;
        }
        initialize(glue) {
            this.glue = glue;
            this.resolveGluePromise();
            this.fireFdc3ReadyEvent();
        }
        initializeFailed(reason) {
            this.rejectGluePromise(reason);
        }
        createGluePromise() {
            this.glueInitPromise = promisePlus(() => {
                return new Promise((resolve, reject) => {
                    this.resolveGluePromise = resolve;
                    this.rejectGluePromise = reject;
                });
            }, this.defaultGluePromiseTimeout, `Timeout of ${this.defaultGluePromiseTimeout}ms waiting for Glue to initialize`);
        }
        validateGlue(glue) {
            if (typeof glue !== "object" || Array.isArray(glue)) {
                return { isValid: false, error: { message: `Glue is not a valid object` } };
            }
            const apisToValidate = Object.keys(glue);
            const missingApis = defaultGlue42APIs.filter((api) => !apisToValidate.includes(api));
            if (missingApis.length) {
                return { isValid: false, error: { message: `Fdc3 cannot initialize correctly - Glue is missing the following ${missingApis.length > 1 ? `properties` : `property`}: ${missingApis.join(", ")}` } };
            }
            return { isValid: true };
        }
        interopInstance() {
            return this.glue.interop.instance;
        }
        getApplication(name) {
            return this.glue.appManager.application(name);
        }
        getApplicationInstances(appName) {
            return this.glue.appManager.instances().filter(inst => inst.application.name === appName);
        }
        getInstanceById(id) {
            return this.glue.appManager.instances().find(inst => inst.id === id);
        }
        findIntents(intentFilter) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.intents.find(intentFilter);
            });
        }
        raiseIntent(request) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.intents.raise(request);
            });
        }
        addIntentListener(intent, handler) {
            return this.glue.intents.addIntentListener(intent, handler);
        }
        getAllContexts() {
            return this.glue.contexts.all();
        }
        getContext(contextId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.contexts.get(contextId);
            });
        }
        updateContext(contextId, data) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.contexts.update(contextId, data);
            });
        }
        updateContextWithLatestFdc3Type(contextId, context) {
            return __awaiter(this, void 0, void 0, function* () {
                const prevContextData = yield this.getContext(contextId);
                if (isEmptyObject(prevContextData)) {
                    return this.updateContext(contextId, {
                        data: this.channelsParser.parseFDC3ContextToGlueContexts(context),
                        latest_fdc3_type: this.channelsParser.mapFDC3TypeToChannelsDelimiter(context.type)
                    });
                }
                return this.updateContext(contextId, Object.assign(Object.assign({}, prevContextData), { data: Object.assign(Object.assign({}, prevContextData.data), this.channelsParser.parseFDC3ContextToGlueContexts(context)), latest_fdc3_type: this.channelsParser.mapFDC3TypeToChannelsDelimiter(context.type) }));
            });
        }
        channelsUpdate(channelId, context) {
            return __awaiter(this, void 0, void 0, function* () {
                const parsedData = this.channelsParser.parseFDC3ContextToGlueContexts(context);
                return this.glue.channels.publish(parsedData, channelId);
            });
        }
        contextsSubscribe(id, callback) {
            const didReplay = { replayed: false };
            return this.glue.contexts.subscribe(id, this.contextsChannelsSubscribeCb("contexts", didReplay, callback).bind(this));
        }
        channelSubscribe(callback, id) {
            return __awaiter(this, void 0, void 0, function* () {
                if (id) {
                    const didReplay = { replayed: false };
                    return this.glue.channels.subscribeFor(id, this.contextsChannelsSubscribeCb("channels", didReplay, callback).bind(this));
                }
                const didReplay = { replayed: false };
                return this.glue.channels.subscribe(this.contextsChannelsSubscribeCb("channels", didReplay, callback));
            });
        }
        joinChannel(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.channels.join(channelId);
            });
        }
        leaveChannel() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.channels.leave();
            });
        }
        getCurrentChannel() {
            return this.glue.channels.current();
        }
        setOnChannelChanged(callback) {
            return this.glue.channels.changed(callback);
        }
        getAllChannels() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.channels.all();
            });
        }
        listAllChannels() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.channels.list();
            });
        }
        getChannel(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.channels.get(channelId);
            });
        }
        getContextForMyWindow() {
            return this.glue.windows.my().getContext();
        }
        getMyWindowId() {
            return this.glue.windows.my().id;
        }
        getGlueVersion() {
            var _a;
            return (_a = this.glue) === null || _a === void 0 ? void 0 : _a.version;
        }
        registerOnInstanceStopped(cb) {
            return this.glue.appManager.onInstanceStopped(cb);
        }
        invokeSystemMethod(argumentObj) {
            const args = SystemMethodInvocationArgumentDecoder.runWithException(argumentObj);
            const target = args.payload.clientId;
            return this.glue.interop.invoke(Glue42FDC3SystemMethod, args, { windowId: target });
        }
        registerMethod(name, handler) {
            return this.glue.interop.register(name, handler);
        }
        getInteropMethods(filter) {
            return this.glue.interop.methods(filter);
        }
        contextsChannelsSubscribeCb(api, didReplay, callback) {
            return (data, context, updater, _, extraData) => {
                const dataToCheck = api === "contexts" ? data.data : data;
                if (!dataToCheck || (isEmptyObject(dataToCheck) && !didReplay.replayed)) {
                    didReplay.replayed = true;
                    return;
                }
                const updaterId = api === "contexts"
                    ? extraData ? extraData.updaterId : undefined
                    : updater;
                if (this.glue.interop.instance.peerId === updaterId) {
                    return;
                }
                let contextMetadata;
                const instanceServer = this.glue.interop.servers().find((server) => server.peerId === updaterId);
                if (instanceServer) {
                    contextMetadata = {
                        source: {
                            appId: instanceServer.applicationName,
                            instanceId: instanceServer.instance
                        }
                    };
                }
                const parsedCallbackData = api === "contexts"
                    ? this.channelsParser.parseGlue42DataToInitialFDC3Data(data)
                    : this.channelsParser.parseGlue42DataToInitialFDC3Data({ data: context.data, latest_fdc3_type: context.latest_fdc3_type });
                callback(parsedCallbackData, contextMetadata);
            };
        }
    }

    const GLUE42_EVENT_NAME = "Glue42";
    const START = "start";
    const NOTIFY_STARTED = "notifyStarted";
    const REQUEST_GLUE = "requestGlue";
    const REQUEST_GLUE_RESPONSE = "requestGlueResponse";
    const FDC3_READY = "fdc3Ready";

    class EventDispatcher {
        fireFdc3Ready() {
            const event = new Event(FDC3_READY);
            window.dispatchEvent(event);
        }
        fireNotifyStarted() {
            this.send(NOTIFY_STARTED);
        }
        fireRequestGlue() {
            this.send(REQUEST_GLUE);
        }
        send(eventName, message) {
            const payload = { glue42: { event: eventName, message } };
            const event = new CustomEvent(GLUE42_EVENT_NAME, { detail: payload });
            window.dispatchEvent(event);
        }
    }

    class DesktopAgent {
        constructor(intentsController, applicationController, channelsController) {
            this.intentsController = intentsController;
            this.applicationController = applicationController;
            this.channelsController = channelsController;
        }
        toApi() {
            const api = {
                addContextListener: this.addContextListener.bind(this),
                addIntentListener: this.addIntentListener.bind(this),
                broadcast: this.broadcast.bind(this),
                createPrivateChannel: this.createPrivateChannel.bind(this),
                findInstances: this.findInstances.bind(this),
                findIntent: this.findIntent.bind(this),
                findIntentsByContext: this.findIntentsByContext.bind(this),
                getAppMetadata: this.getAppMetadata.bind(this),
                getCurrentChannel: this.getCurrentChannel.bind(this),
                getInfo: this.getInfo.bind(this),
                getOrCreateChannel: this.getOrCreateChannel.bind(this),
                getSystemChannels: this.getSystemChannels.bind(this),
                getUserChannels: this.getSystemChannels.bind(this),
                joinChannel: this.joinChannel.bind(this),
                joinUserChannel: this.joinUserChannel.bind(this),
                leaveCurrentChannel: this.leaveCurrentChannel.bind(this),
                open: this.open.bind(this),
                raiseIntent: this.raiseIntent.bind(this),
                raiseIntentForContext: this.raiseIntentForContext.bind(this),
            };
            return Object.freeze(api);
        }
        open(target, context) {
            return __awaiter(this, void 0, void 0, function* () {
                targetAppDecoder.runWithException(target);
                optionalContextDecoder.runWithException(context);
                return this.applicationController.open(target, context);
            });
        }
        findInstances(app) {
            return __awaiter(this, void 0, void 0, function* () {
                appIdentifierDecoder.runWithException(app);
                return this.applicationController.findInstances(app);
            });
        }
        getAppMetadata(app) {
            return __awaiter(this, void 0, void 0, function* () {
                appIdentifierDecoder.runWithException(app);
                return this.applicationController.getAppMetadata(app);
            });
        }
        getInfo() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.applicationController.getInfo();
            });
        }
        broadcast(context) {
            return __awaiter(this, void 0, void 0, function* () {
                contextDecoder.runWithException(context);
                return this.channelsController.broadcast(context);
            });
        }
        addContextListener(contextType, handler) {
            return __awaiter(this, arguments, void 0, function* () {
                if (arguments.length === 1) {
                    if (typeof contextType !== "function") {
                        throw new Error("Please provide the handler as a function!");
                    }
                    return this.channelsController.addContextListener(contextType);
                }
                const contextTypeDecoder = optionalNonEmptyStringDecoder.runWithException(contextType);
                if (typeof handler !== "function") {
                    throw new Error("Please provide the handler as a function!");
                }
                return this.channelsController.addContextListener(handler, contextTypeDecoder);
            });
        }
        findIntent(intent, context, resultType) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(intent);
                const contextDecoderResult = optionalContextDecoder.run(context);
                if (!contextDecoderResult.ok) {
                    throw new Error(`Invalid Context: ${contextDecoderResult.error}`);
                }
                optionalNonEmptyStringDecoder.runWithException(resultType);
                return this.intentsController.findIntent(intent, contextDecoderResult.result, resultType);
            });
        }
        findIntentsByContext(context, resultType) {
            return __awaiter(this, void 0, void 0, function* () {
                const contextDecoderResult = contextDecoder.run(context);
                if (!contextDecoderResult.ok) {
                    throw new Error(`Invalid Context: ${contextDecoderResult.error}`);
                }
                optionalNonEmptyStringDecoder.runWithException(resultType);
                return this.intentsController.findIntentsByContext(contextDecoderResult.result, resultType);
            });
        }
        raiseIntent(intent, context, app) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(intent);
                contextDecoder.runWithException(context);
                optionalAppIdentifier.runWithException(app);
                return this.intentsController.raiseIntent(intent, context, app);
            });
        }
        raiseIntentForContext(context, app) {
            return __awaiter(this, void 0, void 0, function* () {
                contextDecoder.runWithException(context);
                optionalTargetApp.runWithException(app);
                return this.intentsController.raiseIntentForContext(context, app);
            });
        }
        addIntentListener(intent, handler) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(intent);
                if (typeof handler !== "function") {
                    throw new Error("Please provide the handler as a function!");
                }
                return this.intentsController.addIntentListener(intent, handler);
            });
        }
        getOrCreateChannel(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(channelId);
                return this.channelsController.getOrCreateChannel(channelId);
            });
        }
        getSystemChannels() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.channelsController.getUserChannels();
            });
        }
        joinChannel(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(channelId);
                return this.channelsController.joinChannel(channelId);
            });
        }
        joinUserChannel(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(channelId);
                return this.channelsController.joinUserChannel(channelId);
            });
        }
        getCurrentChannel() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.channelsController.getCurrentChannel();
            });
        }
        leaveCurrentChannel() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.channelsController.leaveCurrentChannel();
            });
        }
        createPrivateChannel() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.channelsController.createPrivateChannel();
            });
        }
    }

    class AppChannel {
        constructor(channelsController, id) {
            this.channelsController = channelsController;
            this.id = id;
            this.type = ChannelTypes.App;
        }
        toApi() {
            const api = {
                id: this.id,
                type: this.type,
                broadcast: this.broadcast.bind(this),
                getCurrentContext: this.getCurrentContext.bind(this),
                addContextListener: this.addContextListener.bind(this),
            };
            return api;
        }
        broadcast(context) {
            return __awaiter(this, void 0, void 0, function* () {
                contextDecoder.runWithException(context);
                return this.channelsController.broadcast(context, this.id);
            });
        }
        getCurrentContext(contextType) {
            return __awaiter(this, void 0, void 0, function* () {
                optionalNonEmptyStringDecoder.runWithException(contextType);
                return this.channelsController.getContextForChannel(this.id, contextType);
            });
        }
        addContextListener(contextType, handler) {
            return __awaiter(this, arguments, void 0, function* () {
                if (arguments.length === 1) {
                    if (typeof contextType !== "function") {
                        throw new Error("Please provide the handler as a function!");
                    }
                    return this.channelsController.addContextListener(contextType, undefined, this.id);
                }
                const contextTypeDecoder = optionalNonEmptyStringDecoder.runWithException(contextType);
                if (typeof handler !== "function") {
                    throw new Error("Please provide the handler as a function!");
                }
                return this.channelsController.addContextListener(handler, contextTypeDecoder, this.id);
            });
        }
    }

    class ChannelsParser {
        constructor() {
            this.contextPrefix = "___channel___";
            this.fdc3Delimiter = "&";
            this.parseContextsDataToInitialFDC3Data = (context) => {
                const { data, latest_fdc3_type } = context;
                const parsedType = this.mapChannelsDelimiterToFDC3Type(latest_fdc3_type);
                return Object.assign({ type: parsedType }, data[`fdc3_${latest_fdc3_type}`]);
            };
        }
        mapChannelNameToContextName(channelName) {
            return `${this.contextPrefix}${channelName}`;
        }
        parseGlue42DataToInitialFDC3Data(glue42Data) {
            const latestPublishedData = this.parseContextsDataToInitialFDC3Data(glue42Data);
            const initialFDC3DataArr = Object.entries(glue42Data.data).map(([fdc3Type, dataValue]) => {
                const type = this.removeFDC3Prefix(fdc3Type);
                return Object.assign({ type }, dataValue);
            });
            return Object.assign({}, ...initialFDC3DataArr, latestPublishedData);
        }
        parseFDC3ContextToGlueContexts(context) {
            const { type } = context, rest = __rest(context, ["type"]);
            const parsedType = this.mapFDC3TypeToChannelsDelimiter(type);
            return { [`fdc3_${parsedType}`]: rest };
        }
        mapFDC3TypeToChannelsDelimiter(type) {
            return type.split(".").join(this.fdc3Delimiter);
        }
        mapChannelsDelimiterToFDC3Type(type) {
            return type.split(this.fdc3Delimiter).join(".");
        }
        removeFDC3Prefix(type) {
            const typeWithoutPrefix = type.split("_").slice(1).join("");
            return this.mapChannelsDelimiterToFDC3Type(typeWithoutPrefix);
        }
    }

    class UserChannel {
        constructor(channelsController, glueChannel) {
            this.channelsController = channelsController;
            this.type = ChannelTypes.User;
            this.id = glueChannel.meta.fdc3
                ? glueChannel.meta.fdc3.id
                : glueChannel.name;
            this.displayMetadata = {
                name: glueChannel.name,
                color: glueChannel.meta.color
            };
        }
        toApi() {
            const api = {
                id: this.id,
                type: this.type,
                displayMetadata: this.displayMetadata,
                broadcast: this.broadcast.bind(this),
                getCurrentContext: this.getCurrentContext.bind(this),
                addContextListener: this.addContextListener.bind(this),
            };
            return api;
        }
        broadcast(context) {
            return __awaiter(this, void 0, void 0, function* () {
                contextDecoder.runWithException(context);
                return this.channelsController.broadcast(context, this.id);
            });
        }
        getCurrentContext(contextType) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.run(contextType);
                return this.channelsController.getContextForChannel(this.id, contextType);
            });
        }
        addContextListener(contextType, handler) {
            return __awaiter(this, arguments, void 0, function* () {
                if (arguments.length === 1) {
                    if (typeof contextType !== "function") {
                        throw new Error("Please provide the handler as a function!");
                    }
                    return this.channelsController.addContextListener(contextType, undefined, this.id);
                }
                const contextTypeDecoder = optionalNonEmptyStringDecoder.runWithException(contextType);
                if (typeof handler !== "function") {
                    throw new Error("Please provide the handler as a function!");
                }
                return this.channelsController.addContextListener(handler, contextTypeDecoder, this.id);
            });
        }
    }

    /**
     * SPDX-License-Identifier: Apache-2.0
     * Copyright FINOS FDC3 contributors - see NOTICE file
     */

    /** Constants representing the errors that can be encountered when calling the `open` method on the DesktopAgent object (`fdc3`). */
    var OpenError;

    (function (OpenError) {
      /** Returned if the specified application is not found.*/
      OpenError["AppNotFound"] = "AppNotFound";
      /** Returned if the specified application fails to launch correctly.*/

      OpenError["ErrorOnLaunch"] = "ErrorOnLaunch";
      /** Returned if the specified application launches but fails to add a context listener in order to receive the context passed to the `fdc3.open` call.*/

      OpenError["AppTimeout"] = "AppTimeout";
      /** Returned if the FDC3 desktop agent implementation is not currently able to handle the request.*/

      OpenError["ResolverUnavailable"] = "ResolverUnavailable";
    })(OpenError || (OpenError = {}));
    /** Constants representing the errors that can be encountered when calling the `findIntent`, `findIntentsByContext`, `raiseIntent` or `raiseIntentForContext` methods on the DesktopAgent (`fdc3`). */


    var ResolveError;

    (function (ResolveError) {
      /** SHOULD be returned if no apps are available that can resolve the intent and context combination.*/
      ResolveError["NoAppsFound"] = "NoAppsFound";
      /** Returned if the FDC3 desktop agent implementation is not currently able to handle the request.*/

      ResolveError["ResolverUnavailable"] = "ResolverUnavailable";
      /** Returned if the user cancelled the resolution request, for example by closing or cancelling a resolver UI.*/

      ResolveError["UserCancelled"] = "UserCancelledResolution";
      /** SHOULD be returned if a timeout cancels an intent resolution that required user interaction. Please use `ResolverUnavailable` instead for situations where a resolver UI or similar fails.*/

      ResolveError["ResolverTimeout"] = "ResolverTimeout";
      /** Returned if a specified target application is not available or a new instance of it cannot be opened. */

      ResolveError["TargetAppUnavailable"] = "TargetAppUnavailable";
      /** Returned if a specified target application instance is not available, for example because it has been closed. */

      ResolveError["TargetInstanceUnavailable"] = "TargetInstanceUnavailable";
      /** Returned if the intent and context could not be delivered to the selected application or instance, for example because it has not added an intent handler within a timeout.*/

      ResolveError["IntentDeliveryFailed"] = "IntentDeliveryFailed";
    })(ResolveError || (ResolveError = {}));

    var ResultError;

    (function (ResultError) {
      /** Returned if the intent handler exited without returning a Promise or that Promise was not resolved with a Context or Channel object. */
      ResultError["NoResultReturned"] = "NoResultReturned";
      /** Returned if the Intent handler function processing the raised intent throws an error or rejects the Promise it returned. */

      ResultError["IntentHandlerRejected"] = "IntentHandlerRejected";
    })(ResultError || (ResultError = {}));

    var ChannelError;

    (function (ChannelError) {
      /** Returned if the specified channel is not found when attempting to join a channel via the `joinUserChannel` function  of the DesktopAgent (`fdc3`).*/
      ChannelError["NoChannelFound"] = "NoChannelFound";
      /** SHOULD be returned when a request to join a user channel or to a retrieve a Channel object via the `joinUserChannel` or `getOrCreateChannel` methods of the DesktopAgent (`fdc3`) object is denied. */

      ChannelError["AccessDenied"] = "AccessDenied";
      /** SHOULD be returned when a channel cannot be created or retrieved via the `getOrCreateChannel` method of the DesktopAgent (`fdc3`).*/

      ChannelError["CreationFailed"] = "CreationFailed";
    })(ChannelError || (ChannelError = {}));

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var runtime_1 = createCommonjsModule(function (module) {
    /**
     * Copyright (c) 2014-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */

    var runtime = (function (exports) {

      var Op = Object.prototype;
      var hasOwn = Op.hasOwnProperty;
      var undefined$1; // More compressible than void 0.
      var $Symbol = typeof Symbol === "function" ? Symbol : {};
      var iteratorSymbol = $Symbol.iterator || "@@iterator";
      var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
      var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

      function define(obj, key, value) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
        return obj[key];
      }
      try {
        // IE 8 has a broken Object.defineProperty that only works on DOM objects.
        define({}, "");
      } catch (err) {
        define = function(obj, key, value) {
          return obj[key] = value;
        };
      }

      function wrap(innerFn, outerFn, self, tryLocsList) {
        // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
        var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
        var generator = Object.create(protoGenerator.prototype);
        var context = new Context(tryLocsList || []);

        // The ._invoke method unifies the implementations of the .next,
        // .throw, and .return methods.
        generator._invoke = makeInvokeMethod(innerFn, self, context);

        return generator;
      }
      exports.wrap = wrap;

      // Try/catch helper to minimize deoptimizations. Returns a completion
      // record like context.tryEntries[i].completion. This interface could
      // have been (and was previously) designed to take a closure to be
      // invoked without arguments, but in all the cases we care about we
      // already have an existing method we want to call, so there's no need
      // to create a new function object. We can even get away with assuming
      // the method takes exactly one argument, since that happens to be true
      // in every case, so we don't have to touch the arguments object. The
      // only additional allocation required is the completion record, which
      // has a stable shape and so hopefully should be cheap to allocate.
      function tryCatch(fn, obj, arg) {
        try {
          return { type: "normal", arg: fn.call(obj, arg) };
        } catch (err) {
          return { type: "throw", arg: err };
        }
      }

      var GenStateSuspendedStart = "suspendedStart";
      var GenStateSuspendedYield = "suspendedYield";
      var GenStateExecuting = "executing";
      var GenStateCompleted = "completed";

      // Returning this object from the innerFn has the same effect as
      // breaking out of the dispatch switch statement.
      var ContinueSentinel = {};

      // Dummy constructor functions that we use as the .constructor and
      // .constructor.prototype properties for functions that return Generator
      // objects. For full spec compliance, you may wish to configure your
      // minifier not to mangle the names of these two functions.
      function Generator() {}
      function GeneratorFunction() {}
      function GeneratorFunctionPrototype() {}

      // This is a polyfill for %IteratorPrototype% for environments that
      // don't natively support it.
      var IteratorPrototype = {};
      IteratorPrototype[iteratorSymbol] = function () {
        return this;
      };

      var getProto = Object.getPrototypeOf;
      var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
      if (NativeIteratorPrototype &&
          NativeIteratorPrototype !== Op &&
          hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
        // This environment has a native %IteratorPrototype%; use it instead
        // of the polyfill.
        IteratorPrototype = NativeIteratorPrototype;
      }

      var Gp = GeneratorFunctionPrototype.prototype =
        Generator.prototype = Object.create(IteratorPrototype);
      GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
      GeneratorFunctionPrototype.constructor = GeneratorFunction;
      GeneratorFunction.displayName = define(
        GeneratorFunctionPrototype,
        toStringTagSymbol,
        "GeneratorFunction"
      );

      // Helper for defining the .next, .throw, and .return methods of the
      // Iterator interface in terms of a single ._invoke method.
      function defineIteratorMethods(prototype) {
        ["next", "throw", "return"].forEach(function(method) {
          define(prototype, method, function(arg) {
            return this._invoke(method, arg);
          });
        });
      }

      exports.isGeneratorFunction = function(genFun) {
        var ctor = typeof genFun === "function" && genFun.constructor;
        return ctor
          ? ctor === GeneratorFunction ||
            // For the native GeneratorFunction constructor, the best we can
            // do is to check its .name property.
            (ctor.displayName || ctor.name) === "GeneratorFunction"
          : false;
      };

      exports.mark = function(genFun) {
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
        } else {
          genFun.__proto__ = GeneratorFunctionPrototype;
          define(genFun, toStringTagSymbol, "GeneratorFunction");
        }
        genFun.prototype = Object.create(Gp);
        return genFun;
      };

      // Within the body of any async function, `await x` is transformed to
      // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
      // `hasOwn.call(value, "__await")` to determine if the yielded value is
      // meant to be awaited.
      exports.awrap = function(arg) {
        return { __await: arg };
      };

      function AsyncIterator(generator, PromiseImpl) {
        function invoke(method, arg, resolve, reject) {
          var record = tryCatch(generator[method], generator, arg);
          if (record.type === "throw") {
            reject(record.arg);
          } else {
            var result = record.arg;
            var value = result.value;
            if (value &&
                typeof value === "object" &&
                hasOwn.call(value, "__await")) {
              return PromiseImpl.resolve(value.__await).then(function(value) {
                invoke("next", value, resolve, reject);
              }, function(err) {
                invoke("throw", err, resolve, reject);
              });
            }

            return PromiseImpl.resolve(value).then(function(unwrapped) {
              // When a yielded Promise is resolved, its final value becomes
              // the .value of the Promise<{value,done}> result for the
              // current iteration.
              result.value = unwrapped;
              resolve(result);
            }, function(error) {
              // If a rejected Promise was yielded, throw the rejection back
              // into the async generator function so it can be handled there.
              return invoke("throw", error, resolve, reject);
            });
          }
        }

        var previousPromise;

        function enqueue(method, arg) {
          function callInvokeWithMethodAndArg() {
            return new PromiseImpl(function(resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }

          return previousPromise =
            // If enqueue has been called before, then we want to wait until
            // all previous Promises have been resolved before calling invoke,
            // so that results are always delivered in the correct order. If
            // enqueue has not been called before, then it is important to
            // call invoke immediately, without waiting on a callback to fire,
            // so that the async generator function has the opportunity to do
            // any necessary setup in a predictable way. This predictability
            // is why the Promise constructor synchronously invokes its
            // executor callback, and why async functions synchronously
            // execute code before the first await. Since we implement simple
            // async functions in terms of async generators, it is especially
            // important to get this right, even though it requires care.
            previousPromise ? previousPromise.then(
              callInvokeWithMethodAndArg,
              // Avoid propagating failures to Promises returned by later
              // invocations of the iterator.
              callInvokeWithMethodAndArg
            ) : callInvokeWithMethodAndArg();
        }

        // Define the unified helper method that is used to implement .next,
        // .throw, and .return (see defineIteratorMethods).
        this._invoke = enqueue;
      }

      defineIteratorMethods(AsyncIterator.prototype);
      AsyncIterator.prototype[asyncIteratorSymbol] = function () {
        return this;
      };
      exports.AsyncIterator = AsyncIterator;

      // Note that simple async functions are implemented on top of
      // AsyncIterator objects; they just return a Promise for the value of
      // the final result produced by the iterator.
      exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
        if (PromiseImpl === void 0) PromiseImpl = Promise;

        var iter = new AsyncIterator(
          wrap(innerFn, outerFn, self, tryLocsList),
          PromiseImpl
        );

        return exports.isGeneratorFunction(outerFn)
          ? iter // If outerFn is a generator, return the full iterator.
          : iter.next().then(function(result) {
              return result.done ? result.value : iter.next();
            });
      };

      function makeInvokeMethod(innerFn, self, context) {
        var state = GenStateSuspendedStart;

        return function invoke(method, arg) {
          if (state === GenStateExecuting) {
            throw new Error("Generator is already running");
          }

          if (state === GenStateCompleted) {
            if (method === "throw") {
              throw arg;
            }

            // Be forgiving, per 25.3.3.3.3 of the spec:
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
            return doneResult();
          }

          context.method = method;
          context.arg = arg;

          while (true) {
            var delegate = context.delegate;
            if (delegate) {
              var delegateResult = maybeInvokeDelegate(delegate, context);
              if (delegateResult) {
                if (delegateResult === ContinueSentinel) continue;
                return delegateResult;
              }
            }

            if (context.method === "next") {
              // Setting context._sent for legacy support of Babel's
              // function.sent implementation.
              context.sent = context._sent = context.arg;

            } else if (context.method === "throw") {
              if (state === GenStateSuspendedStart) {
                state = GenStateCompleted;
                throw context.arg;
              }

              context.dispatchException(context.arg);

            } else if (context.method === "return") {
              context.abrupt("return", context.arg);
            }

            state = GenStateExecuting;

            var record = tryCatch(innerFn, self, context);
            if (record.type === "normal") {
              // If an exception is thrown from innerFn, we leave state ===
              // GenStateExecuting and loop back for another invocation.
              state = context.done
                ? GenStateCompleted
                : GenStateSuspendedYield;

              if (record.arg === ContinueSentinel) {
                continue;
              }

              return {
                value: record.arg,
                done: context.done
              };

            } else if (record.type === "throw") {
              state = GenStateCompleted;
              // Dispatch the exception by looping back around to the
              // context.dispatchException(context.arg) call above.
              context.method = "throw";
              context.arg = record.arg;
            }
          }
        };
      }

      // Call delegate.iterator[context.method](context.arg) and handle the
      // result, either by returning a { value, done } result from the
      // delegate iterator, or by modifying context.method and context.arg,
      // setting context.delegate to null, and returning the ContinueSentinel.
      function maybeInvokeDelegate(delegate, context) {
        var method = delegate.iterator[context.method];
        if (method === undefined$1) {
          // A .throw or .return when the delegate iterator has no .throw
          // method always terminates the yield* loop.
          context.delegate = null;

          if (context.method === "throw") {
            // Note: ["return"] must be used for ES3 parsing compatibility.
            if (delegate.iterator["return"]) {
              // If the delegate iterator has a return method, give it a
              // chance to clean up.
              context.method = "return";
              context.arg = undefined$1;
              maybeInvokeDelegate(delegate, context);

              if (context.method === "throw") {
                // If maybeInvokeDelegate(context) changed context.method from
                // "return" to "throw", let that override the TypeError below.
                return ContinueSentinel;
              }
            }

            context.method = "throw";
            context.arg = new TypeError(
              "The iterator does not provide a 'throw' method");
          }

          return ContinueSentinel;
        }

        var record = tryCatch(method, delegate.iterator, context.arg);

        if (record.type === "throw") {
          context.method = "throw";
          context.arg = record.arg;
          context.delegate = null;
          return ContinueSentinel;
        }

        var info = record.arg;

        if (! info) {
          context.method = "throw";
          context.arg = new TypeError("iterator result is not an object");
          context.delegate = null;
          return ContinueSentinel;
        }

        if (info.done) {
          // Assign the result of the finished delegate to the temporary
          // variable specified by delegate.resultName (see delegateYield).
          context[delegate.resultName] = info.value;

          // Resume execution at the desired location (see delegateYield).
          context.next = delegate.nextLoc;

          // If context.method was "throw" but the delegate handled the
          // exception, let the outer generator proceed normally. If
          // context.method was "next", forget context.arg since it has been
          // "consumed" by the delegate iterator. If context.method was
          // "return", allow the original .return call to continue in the
          // outer generator.
          if (context.method !== "return") {
            context.method = "next";
            context.arg = undefined$1;
          }

        } else {
          // Re-yield the result returned by the delegate method.
          return info;
        }

        // The delegate iterator is finished, so forget it and continue with
        // the outer generator.
        context.delegate = null;
        return ContinueSentinel;
      }

      // Define Generator.prototype.{next,throw,return} in terms of the
      // unified ._invoke helper method.
      defineIteratorMethods(Gp);

      define(Gp, toStringTagSymbol, "Generator");

      // A Generator should always return itself as the iterator object when the
      // @@iterator function is called on it. Some browsers' implementations of the
      // iterator prototype chain incorrectly implement this, causing the Generator
      // object to not be returned from this call. This ensures that doesn't happen.
      // See https://github.com/facebook/regenerator/issues/274 for more details.
      Gp[iteratorSymbol] = function() {
        return this;
      };

      Gp.toString = function() {
        return "[object Generator]";
      };

      function pushTryEntry(locs) {
        var entry = { tryLoc: locs[0] };

        if (1 in locs) {
          entry.catchLoc = locs[1];
        }

        if (2 in locs) {
          entry.finallyLoc = locs[2];
          entry.afterLoc = locs[3];
        }

        this.tryEntries.push(entry);
      }

      function resetTryEntry(entry) {
        var record = entry.completion || {};
        record.type = "normal";
        delete record.arg;
        entry.completion = record;
      }

      function Context(tryLocsList) {
        // The root entry object (effectively a try statement without a catch
        // or a finally block) gives us a place to store values thrown from
        // locations where there is no enclosing try statement.
        this.tryEntries = [{ tryLoc: "root" }];
        tryLocsList.forEach(pushTryEntry, this);
        this.reset(true);
      }

      exports.keys = function(object) {
        var keys = [];
        for (var key in object) {
          keys.push(key);
        }
        keys.reverse();

        // Rather than returning an object with a next method, we keep
        // things simple and return the next function itself.
        return function next() {
          while (keys.length) {
            var key = keys.pop();
            if (key in object) {
              next.value = key;
              next.done = false;
              return next;
            }
          }

          // To avoid creating an additional object, we just hang the .value
          // and .done properties off the next function object itself. This
          // also ensures that the minifier will not anonymize the function.
          next.done = true;
          return next;
        };
      };

      function values(iterable) {
        if (iterable) {
          var iteratorMethod = iterable[iteratorSymbol];
          if (iteratorMethod) {
            return iteratorMethod.call(iterable);
          }

          if (typeof iterable.next === "function") {
            return iterable;
          }

          if (!isNaN(iterable.length)) {
            var i = -1, next = function next() {
              while (++i < iterable.length) {
                if (hasOwn.call(iterable, i)) {
                  next.value = iterable[i];
                  next.done = false;
                  return next;
                }
              }

              next.value = undefined$1;
              next.done = true;

              return next;
            };

            return next.next = next;
          }
        }

        // Return an iterator with no values.
        return { next: doneResult };
      }
      exports.values = values;

      function doneResult() {
        return { value: undefined$1, done: true };
      }

      Context.prototype = {
        constructor: Context,

        reset: function(skipTempReset) {
          this.prev = 0;
          this.next = 0;
          // Resetting context._sent for legacy support of Babel's
          // function.sent implementation.
          this.sent = this._sent = undefined$1;
          this.done = false;
          this.delegate = null;

          this.method = "next";
          this.arg = undefined$1;

          this.tryEntries.forEach(resetTryEntry);

          if (!skipTempReset) {
            for (var name in this) {
              // Not sure about the optimal order of these conditions:
              if (name.charAt(0) === "t" &&
                  hasOwn.call(this, name) &&
                  !isNaN(+name.slice(1))) {
                this[name] = undefined$1;
              }
            }
          }
        },

        stop: function() {
          this.done = true;

          var rootEntry = this.tryEntries[0];
          var rootRecord = rootEntry.completion;
          if (rootRecord.type === "throw") {
            throw rootRecord.arg;
          }

          return this.rval;
        },

        dispatchException: function(exception) {
          if (this.done) {
            throw exception;
          }

          var context = this;
          function handle(loc, caught) {
            record.type = "throw";
            record.arg = exception;
            context.next = loc;

            if (caught) {
              // If the dispatched exception was caught by a catch block,
              // then let that catch block handle the exception normally.
              context.method = "next";
              context.arg = undefined$1;
            }

            return !! caught;
          }

          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            var record = entry.completion;

            if (entry.tryLoc === "root") {
              // Exception thrown outside of any try block that could handle
              // it, so set the completion value of the entire function to
              // throw the exception.
              return handle("end");
            }

            if (entry.tryLoc <= this.prev) {
              var hasCatch = hasOwn.call(entry, "catchLoc");
              var hasFinally = hasOwn.call(entry, "finallyLoc");

              if (hasCatch && hasFinally) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                } else if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }

              } else if (hasCatch) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                }

              } else if (hasFinally) {
                if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }

              } else {
                throw new Error("try statement without catch or finally");
              }
            }
          }
        },

        abrupt: function(type, arg) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.tryLoc <= this.prev &&
                hasOwn.call(entry, "finallyLoc") &&
                this.prev < entry.finallyLoc) {
              var finallyEntry = entry;
              break;
            }
          }

          if (finallyEntry &&
              (type === "break" ||
               type === "continue") &&
              finallyEntry.tryLoc <= arg &&
              arg <= finallyEntry.finallyLoc) {
            // Ignore the finally entry if control is not jumping to a
            // location outside the try/catch block.
            finallyEntry = null;
          }

          var record = finallyEntry ? finallyEntry.completion : {};
          record.type = type;
          record.arg = arg;

          if (finallyEntry) {
            this.method = "next";
            this.next = finallyEntry.finallyLoc;
            return ContinueSentinel;
          }

          return this.complete(record);
        },

        complete: function(record, afterLoc) {
          if (record.type === "throw") {
            throw record.arg;
          }

          if (record.type === "break" ||
              record.type === "continue") {
            this.next = record.arg;
          } else if (record.type === "return") {
            this.rval = this.arg = record.arg;
            this.method = "return";
            this.next = "end";
          } else if (record.type === "normal" && afterLoc) {
            this.next = afterLoc;
          }

          return ContinueSentinel;
        },

        finish: function(finallyLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.finallyLoc === finallyLoc) {
              this.complete(entry.completion, entry.afterLoc);
              resetTryEntry(entry);
              return ContinueSentinel;
            }
          }
        },

        "catch": function(tryLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.tryLoc === tryLoc) {
              var record = entry.completion;
              if (record.type === "throw") {
                var thrown = record.arg;
                resetTryEntry(entry);
              }
              return thrown;
            }
          }

          // The context.catch method must only be called with a location
          // argument that corresponds to a known catch block.
          throw new Error("illegal catch attempt");
        },

        delegateYield: function(iterable, resultName, nextLoc) {
          this.delegate = {
            iterator: values(iterable),
            resultName: resultName,
            nextLoc: nextLoc
          };

          if (this.method === "next") {
            // Deliberately forget the last sent value so that we don't
            // accidentally pass it on to the delegate.
            this.arg = undefined$1;
          }

          return ContinueSentinel;
        }
      };

      // Regardless of whether this script is executing as a CommonJS module
      // or not, return the runtime object so that we can declare the variable
      // regeneratorRuntime in the outer scope, which allows this module to be
      // injected easily by `bin/regenerator --include-runtime script.js`.
      return exports;

    }(
      // If this script is executing as a CommonJS module, use module.exports
      // as the regeneratorRuntime namespace. Otherwise create a new empty
      // object. Either way, the resulting object will be used to initialize
      // the regeneratorRuntime variable at the top of this file.
       module.exports 
    ));

    try {
      regeneratorRuntime = runtime;
    } catch (accidentalStrictMode) {
      // This module should not be running in strict mode, so the above
      // assignment should always work unless something is misconfigured. Just
      // in case runtime.js accidentally runs in strict mode, we can escape
      // strict mode using a global Function call. This could conceivably fail
      // if a Content Security Policy forbids using Function, but in that case
      // the proper solution is to fix the accidental strict mode problem. If
      // you've misconfigured your bundler to force strict mode and applied a
      // CSP to forbid Function, and you're not willing to fix either of those
      // problems, please detail your unique predicament in a GitHub issue.
      Function("r", "regeneratorRuntime = r")(runtime);
    }
    });

    var ContextTypes;

    (function (ContextTypes) {
      ContextTypes["Chart"] = "fdc3.chart";
      ContextTypes["ChatInitSettings"] = "fdc3.chat.initSettings";
      ContextTypes["Contact"] = "fdc3.contact";
      ContextTypes["ContactList"] = "fdc3.contactList";
      ContextTypes["Country"] = "fdc3.country";
      ContextTypes["Currency"] = "fdc3.currency";
      ContextTypes["Email"] = "fdc3.email";
      ContextTypes["Instrument"] = "fdc3.instrument";
      ContextTypes["InstrumentList"] = "fdc3.instrumentList";
      ContextTypes["Organization"] = "fdc3.organization";
      ContextTypes["Portfolio"] = "fdc3.portfolio";
      ContextTypes["Position"] = "fdc3.position";
      ContextTypes["Nothing"] = "fdc3.nothing";
      ContextTypes["TimeRange"] = "fdc3.timerange";
      ContextTypes["Valuation"] = "fdc3.valuation";
    })(ContextTypes || (ContextTypes = {}));

    // To parse this data:
    //
    //   import { Convert, Context, Chart, ChatInitSettings, Contact, ContactList, Country, Currency, Email, Instrument, InstrumentList, Nothing, Organization, Portfolio, Position, TimeRange, Valuation } from "./file";
    //
    //   const context = Convert.toContext(json);
    //   const chart = Convert.toChart(json);
    //   const chatInitSettings = Convert.toChatInitSettings(json);
    //   const contact = Convert.toContact(json);
    //   const contactList = Convert.toContactList(json);
    //   const country = Convert.toCountry(json);
    //   const currency = Convert.toCurrency(json);
    //   const email = Convert.toEmail(json);
    //   const instrument = Convert.toInstrument(json);
    //   const instrumentList = Convert.toInstrumentList(json);
    //   const nothing = Convert.toNothing(json);
    //   const organization = Convert.toOrganization(json);
    //   const portfolio = Convert.toPortfolio(json);
    //   const position = Convert.toPosition(json);
    //   const timeRange = Convert.toTimeRange(json);
    //   const valuation = Convert.toValuation(json);
    //
    // These functions will throw an error if the JSON doesn't
    // match the expected interface, even if the JSON is valid.
    var Style;

    (function (Style) {
      Style["Bar"] = "bar";
      Style["Candle"] = "candle";
      Style["Custom"] = "custom";
      Style["Heatmap"] = "heatmap";
      Style["Histogram"] = "histogram";
      Style["Line"] = "line";
      Style["Mountain"] = "mountain";
      Style["Pie"] = "pie";
      Style["Scatter"] = "scatter";
      Style["StackedBar"] = "stacked-bar";
    })(Style || (Style = {})); // Converts JSON strings to/from your types

    var Intents;

    (function (Intents) {
      Intents["StartCall"] = "StartCall";
      Intents["StartChat"] = "StartChat";
      Intents["StartEmail"] = "StartEmail";
      Intents["ViewAnalysis"] = "ViewAnalysis";
      Intents["ViewChart"] = "ViewChart";
      Intents["ViewContact"] = "ViewContact";
      Intents["ViewHoldings"] = "ViewHoldings";
      Intents["ViewInstrument"] = "ViewInstrument";
      Intents["ViewInteractions"] = "ViewInteractions";
      Intents["ViewNews"] = "ViewNews";
      Intents["ViewOrders"] = "ViewOrders";
      Intents["ViewProfile"] = "ViewProfile";
      Intents["ViewQuote"] = "ViewQuote";
      Intents["ViewResearch"] = "ViewResearch";
    })(Intents || (Intents = {}));

    const isChannel = (data) => {
        return defaultChannelsProps.every(prop => Object.keys(data).includes(prop));
    };
    const isContext = (data) => {
        return defaultContextProps.every(prop => Object.keys(data).includes(prop));
    };
    const isChannelMetadata = (data) => {
        return typeof data === "object" && data.isChannel;
    };
    const extractChannelMetadata = (channel) => {
        return {
            id: channel.id,
            type: channel.type,
            displayMetadata: channel.displayMetadata,
            isChannel: true
        };
    };
    const parseContextHandler = (handler, contextType) => {
        const subHandler = (data, metadata) => {
            if (contextType) {
                if (data.type === contextType) {
                    handler(data, metadata);
                }
                return;
            }
            handler(data, metadata);
        };
        return subHandler;
    };

    class IntentsController {
        constructor(glueController, channelsController, channelsFactory) {
            this.glueController = glueController;
            this.channelsController = channelsController;
            this.channelsFactory = channelsFactory;
            this.convertGlue42IntentToFDC3AppIntent = (glueIntent) => {
                const { name, handlers } = glueIntent;
                const appIntents = handlers.filter((handler) => handler.type === "app");
                const dynamicInstanceIntents = handlers.filter((handler) => handler.type === "instance" && !appIntents.some((appIntent) => appIntent.applicationName === handler.applicationName));
                const handlersToUse = [...appIntents, ...dynamicInstanceIntents];
                const appIntent = {
                    intent: { name, displayName: handlers[0].displayName || "" },
                    apps: handlersToUse.map((handler) => {
                        const appName = handler.applicationName;
                        const app = this.glueController.getApplication(appName);
                        return {
                            appId: appName,
                            instanceId: handler.instanceId,
                            name: appName,
                            title: handler.applicationTitle || handler.instanceTitle || appName,
                            tooltip: (app === null || app === void 0 ? void 0 : app.userProperties.tooltip) || `${appName} (${handler.type})`,
                            description: handler.applicationDescription,
                            icons: handler.applicationIcon ? [handler.applicationIcon, ...((app === null || app === void 0 ? void 0 : app.userProperties.icons) || [])] : app === null || app === void 0 ? void 0 : app.userProperties.icons,
                            images: app === null || app === void 0 ? void 0 : app.userProperties.images
                        };
                    })
                };
                return appIntent;
            };
        }
        findIntent(intent, context, resultType) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                const glueIntents = yield this.glueController.findIntents({ name: intent, contextType: context === null || context === void 0 ? void 0 : context.type, resultType });
                if (glueIntents && glueIntents.length === 0) {
                    throw new Error(ResolveError.NoAppsFound);
                }
                return this.convertGlue42IntentToFDC3AppIntent(glueIntents[0]);
            });
        }
        findIntentsByContext(context, resultType) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                const glueIntents = yield this.glueController.findIntents({ contextType: context.type, resultType });
                if (typeof glueIntents !== "undefined" && glueIntents.length === 0) {
                    throw new Error(ResolveError.NoAppsFound);
                }
                return glueIntents.map((glueIntent) => this.convertGlue42IntentToFDC3AppIntent(glueIntent));
            });
        }
        raiseIntent(intent, context, target) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                let glueTarget = "reuse";
                if (typeof target !== "undefined") {
                    const name = typeof target === "object" ? target.appId : target;
                    const app = this.glueController.getApplication(name);
                    if (!app) {
                        throw new Error(OpenError.AppNotFound);
                    }
                    const appInstances = app.instances;
                    if (appInstances.length === 0) {
                        glueTarget = { app: name };
                    }
                    else {
                        glueTarget = { instance: appInstances[0].id };
                    }
                }
                const glue42Context = {
                    type: context.type,
                    data: Object.assign({}, context)
                };
                const intentRequest = {
                    intent,
                    context: glue42Context,
                    target: glueTarget
                };
                const glueIntentResult = yield this.glueController.raiseIntent(intentRequest);
                return {
                    source: {
                        appId: glueIntentResult.handler.applicationName,
                        instanceId: glueIntentResult.handler.instanceId
                    },
                    intent,
                    getResult: (() => this.getResult(glueIntentResult)).bind(this)
                };
            });
        }
        raiseIntentForContext(context, target) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                const appIntents = yield this.findIntentsByContext(context);
                if (!appIntents || appIntents.length === 0) {
                    throw new Error(ResolveError.NoAppsFound);
                }
                return this.raiseIntent(appIntents[0].intent.name, context, target);
            });
        }
        addIntentListener(intent, handler) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                const wrappedHandler = this.getWrappedIntentHandler(handler);
                return this.glueController.addIntentListener(intent, wrappedHandler);
            });
        }
        getResult(glueIntentResult) {
            return __awaiter(this, void 0, void 0, function* () {
                const { result } = glueIntentResult;
                const isResultChannelMetadata = isChannelMetadata(result);
                if (!isResultChannelMetadata) {
                    return result;
                }
                const { clientId, creatorId } = yield this.glueController.getContext(result.id);
                if (clientId) {
                    throw new Error(`${ResultError.NoResultReturned} - There are already two parties on this private channel`);
                }
                const channel = this.channelsFactory.buildModel(result);
                const myWinId = this.glueController.getMyWindowId();
                if (myWinId && myWinId !== creatorId) {
                    yield this.channelsController.addClientToPrivateChannel(channel.id, myWinId);
                }
                return channel;
            });
        }
        getResultType(data) {
            if (isChannel(data)) {
                return IntentHandlerResultTypes.Channel;
            }
            if (isContext(data)) {
                return IntentHandlerResultTypes.Context;
            }
            throw new Error("Async handler function should return a promise that resolves to a Context or Channel");
        }
        getWrappedIntentHandler(handler) {
            const wrappedHandler = (glue42Context) => __awaiter(this, void 0, void 0, function* () {
                const handlerResult = yield handler(Object.assign(Object.assign({}, glue42Context.data), { type: glue42Context.type || "" }));
                if (!handlerResult) {
                    return;
                }
                const handlerResultType = this.getResultType(handlerResult);
                return handlerResultType === IntentHandlerResultTypes.Channel
                    ? extractChannelMetadata(handlerResult)
                    : handlerResult;
            });
            return wrappedHandler;
        }
    }

    var version = "3.0.0";

    class ApplicationsController {
        constructor(glueController) {
            this.glueController = glueController;
        }
        open(target, context) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                const name = typeof target === "object"
                    ? target.appId
                    : target;
                const app = this.glueController.getApplication(name);
                if (!app) {
                    throw new Error(OpenError.AppNotFound);
                }
                try {
                    const glueInst = yield app.start(context);
                    return this.parseGlueInstToAppIdentifier(glueInst);
                }
                catch (error) {
                    throw new Error(`${OpenError.ErrorOnLaunch} - Error: ${error}`);
                }
            });
        }
        findInstances(appIdentifier) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                const { appId } = appIdentifier;
                const app = this.glueController.getApplication(appId);
                if (!app) {
                    throw new Error(ResolveError.NoAppsFound);
                }
                const glueInstances = this.glueController.getApplicationInstances(appId);
                return glueInstances.map(glueInst => this.parseGlueInstToAppIdentifier(glueInst));
            });
        }
        getAppMetadata(appIdentifier) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                const { appId, instanceId } = appIdentifier;
                const app = this.glueController.getApplication(appId);
                if (!app) {
                    throw new Error(OpenError.AppNotFound);
                }
                if (instanceId) {
                    const instance = this.glueController.getInstanceById(instanceId);
                    return this.parseGlueAppToAppMetadata(app, instance);
                }
                return this.parseGlueAppToAppMetadata(app);
            });
        }
        getInfo() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                const appMetadata = yield this.getCurrentAppMetadata();
                return {
                    provider: "Glue42",
                    providerVersion: this.glueController.getGlueVersion(),
                    fdc3Version: version,
                    optionalFeatures: {
                        OriginatingAppMetadata: true,
                        UserChannelMembershipAPIs: true
                    },
                    appMetadata
                };
            });
        }
        getCurrentAppMetadata() {
            const myInstance = this.glueController.interopInstance();
            return Promise.resolve({
                appId: myInstance.applicationName,
                instanceId: myInstance.instance
            });
        }
        parseGlueInstToAppIdentifier(glueInst) {
            return {
                appId: glueInst.application.name,
                instanceId: glueInst.id
            };
        }
        parseGlueAppToAppMetadata(app, instance) {
            return __awaiter(this, void 0, void 0, function* () {
                const appMetadata = this.getBaseGlueAppToAppMetadata(app);
                if (!instance) {
                    return appMetadata;
                }
                return this.addInstanceMetadataToAppMetadata(appMetadata, instance);
            });
        }
        getBaseGlueAppToAppMetadata(app) {
            return {
                appId: app.name,
                name: app.name,
                version: app.version,
                title: app.title,
                icons: app.icon ? [{ src: app.icon }] : [],
            };
        }
        addInstanceMetadataToAppMetadata(appMetadata, instance) {
            return __awaiter(this, void 0, void 0, function* () {
                return Object.assign(Object.assign({}, appMetadata), { instanceId: instance.id, instanceMetadata: instance.agm });
            });
        }
    }

    class ChannelsController {
        constructor(glueController, channelsStateStore, channelsParser, channelsFactory, channelsCallbackRegistry) {
            this.glueController = glueController;
            this.channelsStateStore = channelsStateStore;
            this.channelsParser = channelsParser;
            this.channelsFactory = channelsFactory;
            this.channelsCallbackRegistry = channelsCallbackRegistry;
            this.initDonePromise = this.initialize();
        }
        addContextListener(handler, contextType, channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initDonePromise;
                if ((!channelId && !this.channelsStateStore.currentChannel) || (!channelId && this.channelsStateStore.currentChannel.type === ChannelTypes.App)) {
                    throw new Error(`${ChannelError.AccessDenied} - Cannot add a context listener when not on a channel`);
                }
                const channelIdToSubscribeTo = channelId || this.channelsStateStore.currentChannel.id;
                return this.addContextListenerByChannelId(channelIdToSubscribeTo, handler, contextType);
            });
        }
        broadcast(context, channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initDonePromise;
                if (!channelId && !this.channelsStateStore.currentChannel) {
                    console.error("You need to join a user channel in order to broadcast.");
                    return;
                }
                if (!channelId && this.channelsStateStore.currentChannel.type === ChannelTypes.App) {
                    console.error("You can't broadcast to an app channel directly - use channel's broadcast method instead.");
                    return;
                }
                const channelIdToBroadcastTo = channelId || this.channelsStateStore.currentChannel.id;
                return this.broadcastByChannelId(channelIdToBroadcastTo, context);
            });
        }
        getUserChannels() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                return Object.values(this.channelsStateStore.userChannels);
            });
        }
        getOrCreateChannel(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                const isPrivateChannel = this.isPrivateChannel(channelId);
                if (isPrivateChannel) {
                    throw new Error(`${ChannelError.AccessDenied} - Cannot retrieve a private channel`);
                }
                const isUserChannel = this.isUserChannel(channelId);
                if (isUserChannel) {
                    return this.channelsStateStore.getUserChannelById(channelId);
                }
                return this.getOrCreateAppChannel(channelId);
            });
        }
        ;
        joinChannel(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initDonePromise;
                const channel = this.channelsStateStore.getUserChannelById(channelId) || (yield this.tryGetAppChannel(channelId));
                if (!channel) {
                    throw new Error(ChannelError.NoChannelFound);
                }
                const isUserChannel = this.isUserChannel(channel.id);
                if (isUserChannel) {
                    const glueChannelName = this.channelsStateStore.getGlueChannelNameByFdc3ChannelId(channelId);
                    return this.glueController.joinChannel(glueChannelName);
                }
                this.channelsStateStore.currentChannel = channel;
            });
        }
        joinUserChannel(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initDonePromise;
                const channel = this.channelsStateStore.userChannels[channelId];
                if (!channel) {
                    throw new Error(ChannelError.NoChannelFound);
                }
                const glueChannelName = this.channelsStateStore.getGlueChannelNameByFdc3ChannelId(channelId);
                return this.glueController.joinChannel(glueChannelName);
            });
        }
        getCurrentChannel() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initDonePromise;
                return this.channelsStateStore.currentChannel;
            });
        }
        leaveCurrentChannel() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initDonePromise;
                if (!this.channelsStateStore.currentChannel) {
                    return;
                }
                const isUserChannel = this.isUserChannel(this.channelsStateStore.currentChannel.id);
                if (isUserChannel) {
                    yield this.glueController.leaveChannel();
                }
                this.channelsStateStore.currentChannel = null;
            });
        }
        getContextForChannel(channelId, contextType) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initDonePromise;
                const isUserChannel = this.isUserChannel(channelId);
                if (!contextType) {
                    let context;
                    if (isUserChannel) {
                        const glueChannelName = this.channelsStateStore.getGlueChannelNameByFdc3ChannelId(channelId);
                        const glueChannelWithPrefix = this.channelsParser.mapChannelNameToContextName(glueChannelName);
                        context = yield this.glueController.getContext(glueChannelWithPrefix);
                    }
                    else {
                        context = yield this.glueController.getContext(channelId);
                    }
                    return context.latest_fdc3_type
                        ? this.channelsParser.parseContextsDataToInitialFDC3Data(context)
                        : null;
                }
                const parsedType = this.channelsParser.mapFDC3TypeToChannelsDelimiter(contextType);
                const { data } = isUserChannel
                    ? yield this.glueController.getChannel(this.channelsStateStore.getGlueChannelNameByFdc3ChannelId(channelId))
                    : yield this.glueController.getContext(channelId);
                return data && data[`fdc3_${parsedType}`]
                    ? this.channelsParser.parseContextsDataToInitialFDC3Data({ data, latest_fdc3_type: parsedType })
                    : null;
            });
        }
        createPrivateChannel() {
            return __awaiter(this, void 0, void 0, function* () {
                const creatorId = this.glueController.getMyWindowId();
                const channel = this.buildChannel(ChannelTypes.Private);
                yield this.glueController.updateContext(channel.id, { creatorId });
                return channel;
            });
        }
        announceDisconnect(channelId, instanceId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.updateContext(channelId, { disconnected: true });
                const closedInstanceId = instanceId || this.glueController.getMyWindowId();
                const targetInstance = yield this.getOtherInstanceIdFromClosedOne(channelId, closedInstanceId);
                const replayContextTypes = yield this.getContextTypesForPrivateChannel(channelId);
                this.invokeSystemMethod(targetInstance, PrivateChannelEventMethods.OnDisconnect, { clientId: targetInstance, channelId, replayContextTypes });
            });
        }
        addClientToPrivateChannel(channelId, clientId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.updateContext(channelId, { clientId });
            });
        }
        isPrivateChannelDisconnected(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                const context = yield this.glueController.getContext(channelId);
                return !!context.disconnected;
            });
        }
        registerOnInstanceStopped(channelId) {
            const handler = (instance) => __awaiter(this, void 0, void 0, function* () {
                const { clientId, creatorId } = yield this.glueController.getContext(channelId);
                if (instance.id !== clientId && instance.id !== creatorId) {
                    return;
                }
                yield this.announceDisconnect(channelId, instance.id);
            });
            return this.glueController.registerOnInstanceStopped(handler.bind(this));
        }
        addPrivateChannelEvent(action, channelId, callback) {
            return __awaiter(this, void 0, void 0, function* () {
                let replayArgs;
                const targetInstanceId = yield this.getTargetedInstanceId(channelId);
                if (action === PrivateChannelEventMethods.OnAddContextListener && targetInstanceId) {
                    replayArgs = yield this.getContextTypesForPrivateChannel(channelId);
                }
                return this.channelsCallbackRegistry.add(action, channelId, callback, replayArgs);
            });
        }
        initialize() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                const current = this.glueController.getCurrentChannel();
                if (current) {
                    this.handleSwitchChannelUI(current);
                }
                this.glueController.setOnChannelChanged((channelId) => {
                    this.handleSwitchChannelUI(channelId);
                });
                const setChannelsPromise = this.glueController.listAllChannels()
                    .then((channelContexts) => {
                    const glueChannelsWithFdc3Meta = channelContexts.filter((glueChannel) => glueChannel.meta.fdc3);
                    glueChannelsWithFdc3Meta.map((glueChannel) => {
                        const userChannel = this.buildChannel(ChannelTypes.User, { displayMetadata: { glueChannel } });
                        this.channelsStateStore.addFdc3IdToGlueChannelName(userChannel.id, glueChannel.name);
                        this.channelsStateStore.addUserChannel(userChannel);
                    });
                });
                return setChannelsPromise;
            });
        }
        handleSwitchChannelUI(channelId) {
            if (channelId) {
                const isFdc3ChannelName = fdc3ChannelNames.includes(channelId);
                this.channelsStateStore.currentChannel = this.channelsStateStore.getUserChannelById(isFdc3ChannelName
                    ? channelId
                    : this.channelsStateStore.getFdc3ChannelIdByGlueChannelName(channelId));
            }
        }
        getOrCreateAppChannel(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                const exists = this.doesAppChannelExist(channelId);
                if (!exists) {
                    yield this.glueController.updateContext(channelId, {});
                }
                return this.buildChannel(ChannelTypes.App, { id: channelId });
            });
        }
        doesAppChannelExist(name) {
            return !name.includes(PrivateChannelPrefix) && this.glueController.getAllContexts().some((ctxName) => ctxName === name);
        }
        isUserChannel(channelId) {
            if (!channelId) {
                return false;
            }
            return !!this.channelsStateStore.userChannels[channelId];
        }
        isPrivateChannel(channelId) {
            return channelId.includes(PrivateChannelPrefix) && this.glueController.getAllContexts().some((ctxName) => ctxName === channelId);
        }
        tryGetAppChannel(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initDonePromise;
                const exists = this.doesAppChannelExist(channelId);
                if (!exists) {
                    throw new Error(ChannelError.NoChannelFound);
                }
                const appChannel = this.buildChannel(ChannelTypes.App, { id: channelId });
                return appChannel;
            });
        }
        buildChannel(type, data) {
            return this.channelsFactory.buildModel(Object.assign({ type }, data));
        }
        broadcastByChannelId(channelId, context) {
            return __awaiter(this, void 0, void 0, function* () {
                const isUserChannel = this.isUserChannel(channelId);
                if (!isUserChannel) {
                    return this.glueController.updateContextWithLatestFdc3Type(channelId, context);
                }
                const glueChannelName = this.channelsStateStore.getGlueChannelNameByFdc3ChannelId(channelId);
                return this.glueController.channelsUpdate(glueChannelName, context);
            });
        }
        addContextListenerByChannelId(channelId, handler, contextType) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const channelType = this.getChannelTypeById(channelId);
                const subHandler = parseContextHandler(handler, contextType);
                if (channelType === ChannelTypes.User) {
                    const invokedOnDesktopAgent = channelId === ((_a = this.channelsStateStore.currentChannel) === null || _a === void 0 ? void 0 : _a.id);
                    const unsubscribe = invokedOnDesktopAgent
                        ? yield this.glueController.channelSubscribe(subHandler)
                        : yield this.glueController.channelSubscribe(subHandler, this.channelsStateStore.getGlueChannelNameByFdc3ChannelId(channelId));
                    return { unsubscribe };
                }
                if (channelType === ChannelTypes.App) {
                    const unsubscribe = yield this.glueController.contextsSubscribe(channelId, subHandler);
                    return { unsubscribe };
                }
                if (channelType === ChannelTypes.Private) {
                    const contextsUnsubscribe = yield this.glueController.contextsSubscribe(channelId, subHandler);
                    yield this.addContextTypeInPrivateChannelContext(channelId, contextType);
                    const targetInstance = yield this.getTargetedInstanceId(channelId);
                    const unsubscribe = () => {
                        contextsUnsubscribe();
                        this.invokeSystemMethod(targetInstance, PrivateChannelEventMethods.OnUnsubscribe, { channelId, clientId: targetInstance, contextType });
                    };
                    this.invokeSystemMethod(targetInstance, PrivateChannelEventMethods.OnAddContextListener, { channelId, clientId: targetInstance, contextType });
                    return { unsubscribe };
                }
                throw new Error(`${ChannelError.AccessDenied} - Cannot add a context listener on an invalid channel`);
            });
        }
        getChannelTypeById(channelId) {
            const isUser = this.isUserChannel(channelId);
            if (isUser) {
                return ChannelTypes.User;
            }
            const isPrivate = this.isPrivateChannel(channelId);
            if (isPrivate) {
                return ChannelTypes.Private;
            }
            const isApp = this.doesAppChannelExist(channelId);
            if (isApp) {
                return ChannelTypes.App;
            }
            throw new Error(`Channel with id: ${channelId} does not exist`);
        }
        getTargetedInstanceId(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                const { clientId, creatorId } = yield this.glueController.getContext(channelId);
                const myWinId = this.glueController.getMyWindowId();
                if (!clientId || creatorId === myWinId) {
                    return;
                }
                return clientId === myWinId ? creatorId : clientId;
            });
        }
        getOtherInstanceIdFromClosedOne(channelId, closedInstanceId) {
            return __awaiter(this, void 0, void 0, function* () {
                const { clientId, creatorId } = yield this.glueController.getContext(channelId);
                return closedInstanceId === clientId
                    ? creatorId
                    : clientId;
            });
        }
        invokeSystemMethod(clientId, action, payload) {
            if (clientId) {
                this.glueController.invokeSystemMethod({ action, payload });
            }
        }
        addContextTypeInPrivateChannelContext(channelId, contextType) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentContext = yield this.glueController.getContext(channelId);
                const updatedTypes = currentContext.contextListenerTypes ? [...currentContext.contextListenerTypes, contextType] : [contextType];
                return this.glueController.updateContext(channelId, Object.assign(Object.assign({}, currentContext), { contextListenerTypes: updatedTypes }));
            });
        }
        getContextTypesForPrivateChannel(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                const ctx = yield this.glueController.getContext(channelId);
                return ctx.contextListenerTypes;
            });
        }
    }

    class EventReceiver {
        constructor(glueController, eventDispatcher, eventsController) {
            this.glueController = glueController;
            this.eventDispatcher = eventDispatcher;
            this.eventsController = eventsController;
            this.glueResponseReceived = false;
            this.glueInitialized = false;
            this.events = {
                "start": { name: START, handle: this.handleStart.bind(this) },
                "requestGlueResponse": { name: REQUEST_GLUE_RESPONSE, handle: this.handleRequestGlueResponse.bind(this) }
            };
        }
        start() {
            this.wireCustomEventListener();
            this.eventDispatcher.fireNotifyStarted();
        }
        wireCustomEventListener() {
            window.addEventListener(GLUE42_EVENT_NAME, (event) => {
                const data = event.detail;
                if (!data || !data.glue42) {
                    return;
                }
                const glue42Event = data.glue42.event;
                const foundHandler = this.events[glue42Event];
                if (!foundHandler) {
                    return;
                }
                foundHandler.handle(data.glue42.message);
            });
        }
        handleStart() {
            this.eventDispatcher.fireRequestGlue();
        }
        handleRequestGlueResponse(data) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.glueResponseReceived && this.glueInitialized) {
                    return;
                }
                this.glueResponseReceived = true;
                const { glue } = data;
                const glueValidator = this.glueController.validateGlue(glue);
                if (!glueValidator.isValid) {
                    return this.glueController.initializeFailed(glueValidator.error);
                }
                this.glueController.initialize(glue);
                yield this.eventsController.initialize();
                this.glueInitialized = true;
            });
        }
    }

    class ChannelsStateStore {
        constructor() {
            this._currentChannel = null;
            this._userChannels = {};
            this._fdc3ChannelIdsToGlueChannelNames = {};
        }
        get currentChannel() {
            return this._currentChannel;
        }
        get userChannels() {
            return this._userChannels;
        }
        set currentChannel(newChannelValue) {
            this._currentChannel = newChannelValue;
        }
        addUserChannel(channel) {
            this._userChannels[channel.id] = channel;
        }
        getUserChannelById(channelId) {
            return this._userChannels[channelId];
        }
        addFdc3IdToGlueChannelName(fdc3Id, glueChannelName) {
            this._fdc3ChannelIdsToGlueChannelNames[fdc3Id] = glueChannelName;
        }
        getGlueChannelNameByFdc3ChannelId(fdc3Id) {
            return this._fdc3ChannelIdsToGlueChannelNames[fdc3Id];
        }
        getFdc3ChannelIdByGlueChannelName(glueChannelName) {
            const [key] = Object.entries(this._fdc3ChannelIdsToGlueChannelNames).find(([_, value]) => value === glueChannelName);
            return key;
        }
    }

    let nanoid = (size = 21) =>
      crypto.getRandomValues(new Uint8Array(size)).reduce((id, byte) => {
        byte &= 63;
        if (byte < 36) {
          id += byte.toString(36);
        } else if (byte < 62) {
          id += (byte - 26).toString(36).toUpperCase();
        } else if (byte > 62) {
          id += '-';
        } else {
          id += '_';
        }
        return id
      }, '');

    class PrivateChannel {
        constructor(channelsController, channelId) {
            this.channelsController = channelsController;
            this.type = ChannelTypes.Private;
            this.id = channelId || `${PrivateChannelPrefix}${nanoid()}`;
            this.unsubFromInstanceStopped = this.channelsController.registerOnInstanceStopped(this.id);
        }
        toApi() {
            const api = {
                id: this.id,
                type: this.type,
                displayMetadata: this.displayMetadata,
                broadcast: this.broadcast.bind(this),
                getCurrentContext: this.getCurrentContext.bind(this),
                addContextListener: this.addContextListener.bind(this),
                onAddContextListener: this.onAddContextListener.bind(this),
                onUnsubscribe: this.onUnsubscribe.bind(this),
                onDisconnect: this.onDisconnect.bind(this),
                disconnect: this.disconnect.bind(this),
            };
            return api;
        }
        broadcast(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const isDisconnected = yield this.channelsController.isPrivateChannelDisconnected(this.id);
                if (isDisconnected) {
                    throw new Error(`${ChannelError.AccessDenied} - Channel has disconnected - broadcast is no longer available`);
                }
                contextDecoder.runWithException(context);
                return this.channelsController.broadcast(context, this.id);
            });
        }
        getCurrentContext(contextType) {
            return __awaiter(this, void 0, void 0, function* () {
                optionalNonEmptyStringDecoder.runWithException(contextType);
                return this.channelsController.getContextForChannel(this.id, contextType);
            });
        }
        addContextListener(contextType, handler) {
            return __awaiter(this, arguments, void 0, function* () {
                if (arguments.length === 1) {
                    if (typeof contextType !== "function") {
                        throw new Error(`${ChannelError.AccessDenied} - Expected function as an argument, got ${typeof contextType}`);
                    }
                    return this.channelsController.addContextListener(contextType, undefined, this.id);
                }
                const contextTypeDecoder = optionalNonEmptyStringDecoder.runWithException(contextType);
                if (typeof handler !== "function") {
                    throw new Error(`${ChannelError.AccessDenied} - Expected function as an argument, got ${typeof contextType}`);
                }
                return this.channelsController.addContextListener(handler, contextTypeDecoder, this.id);
            });
        }
        onAddContextListener(handler) {
            if (typeof handler !== "function") {
                throw new Error(`${ChannelError.AccessDenied} - Expected function as an argument, got ${typeof handler}`);
            }
            const unsub = this.channelsController.addPrivateChannelEvent(PrivateChannelEventMethods.OnAddContextListener, this.id, handler);
            return AsyncListener(unsub);
        }
        onUnsubscribe(handler) {
            if (typeof handler !== "function") {
                throw new Error(`${ChannelError.AccessDenied} - Expected function as an argument, got ${typeof handler}`);
            }
            const unsub = this.channelsController.addPrivateChannelEvent(PrivateChannelEventMethods.OnUnsubscribe, this.id, handler);
            return AsyncListener(unsub);
        }
        onDisconnect(handler) {
            if (typeof handler !== "function") {
                throw new Error(`${ChannelError.AccessDenied} - Expected function as an argument, got ${typeof handler}`);
            }
            const unsub = this.channelsController.addPrivateChannelEvent(PrivateChannelEventMethods.OnDisconnect, this.id, handler);
            return AsyncListener(unsub);
        }
        disconnect() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.channelsController.announceDisconnect(this.id);
                this.unsubFromInstanceStopped();
            });
        }
    }

    class ChannelsFactory {
        constructor(createUserChannelFn, createAppChannel, createPrivateChannel) {
            this.createUserChannelFn = createUserChannelFn;
            this.createAppChannel = createAppChannel;
            this.createPrivateChannel = createPrivateChannel;
        }
        buildModel(data) {
            const { type } = data;
            if (type === ChannelTypes.User) {
                return this.buildUserChannel(data.displayMetadata.glueChannel);
            }
            else if (type === ChannelTypes.App) {
                return this.buildAppChannel(data.id);
            }
            else if (type === ChannelTypes.Private) {
                return this.buildPrivateChannel(data.id);
            }
            else {
                throw new Error("Pass one of the supported channel types: user, app, private");
            }
        }
        buildUserChannel(data) {
            return this.createUserChannelFn(data);
        }
        buildAppChannel(channelId) {
            return this.createAppChannel(channelId);
        }
        buildPrivateChannel(channelId) {
            return this.createPrivateChannel(channelId);
        }
    }

    function createRegistry(options) {
        if (options && options.errorHandling
            && typeof options.errorHandling !== "function"
            && options.errorHandling !== "log"
            && options.errorHandling !== "silent"
            && options.errorHandling !== "throw") {
            throw new Error("Invalid options passed to createRegistry. Prop errorHandling should be [\"log\" | \"silent\" | \"throw\" | (err) => void], but " + typeof options.errorHandling + " was passed");
        }
        var _userErrorHandler = options && typeof options.errorHandling === "function" && options.errorHandling;
        var callbacks = {};
        function add(key, callback, replayArgumentsArr) {
            var callbacksForKey = callbacks[key];
            if (!callbacksForKey) {
                callbacksForKey = [];
                callbacks[key] = callbacksForKey;
            }
            callbacksForKey.push(callback);
            if (replayArgumentsArr) {
                setTimeout(function () {
                    replayArgumentsArr.forEach(function (replayArgument) {
                        var _a;
                        if ((_a = callbacks[key]) === null || _a === void 0 ? void 0 : _a.includes(callback)) {
                            try {
                                if (Array.isArray(replayArgument)) {
                                    callback.apply(undefined, replayArgument);
                                }
                                else {
                                    callback.apply(undefined, [replayArgument]);
                                }
                            }
                            catch (err) {
                                _handleError(err, key);
                            }
                        }
                    });
                }, 0);
            }
            return function () {
                var allForKey = callbacks[key];
                if (!allForKey) {
                    return;
                }
                allForKey = allForKey.reduce(function (acc, element, index) {
                    if (!(element === callback && acc.length === index)) {
                        acc.push(element);
                    }
                    return acc;
                }, []);
                if (allForKey.length === 0) {
                    delete callbacks[key];
                }
                else {
                    callbacks[key] = allForKey;
                }
            };
        }
        function execute(key) {
            var argumentsArr = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                argumentsArr[_i - 1] = arguments[_i];
            }
            var callbacksForKey = callbacks[key];
            if (!callbacksForKey || callbacksForKey.length === 0) {
                return [];
            }
            var results = [];
            callbacksForKey.forEach(function (callback) {
                try {
                    var result = callback.apply(undefined, argumentsArr);
                    results.push(result);
                }
                catch (err) {
                    results.push(undefined);
                    _handleError(err, key);
                }
            });
            return results;
        }
        function _handleError(exceptionArtifact, key) {
            var errParam = exceptionArtifact instanceof Error ? exceptionArtifact : new Error(exceptionArtifact);
            if (_userErrorHandler) {
                _userErrorHandler(errParam);
                return;
            }
            var msg = "[ERROR] callback-registry: User callback for key \"" + key + "\" failed: " + errParam.stack;
            if (options) {
                switch (options.errorHandling) {
                    case "log":
                        return console.error(msg);
                    case "silent":
                        return;
                    case "throw":
                        throw new Error(msg);
                }
            }
            console.error(msg);
        }
        function clear() {
            callbacks = {};
        }
        function clearKey(key) {
            var callbacksForKey = callbacks[key];
            if (!callbacksForKey) {
                return;
            }
            delete callbacks[key];
        }
        return {
            add: add,
            execute: execute,
            clear: clear,
            clearKey: clearKey
        };
    }
    createRegistry.default = createRegistry;
    var lib = createRegistry;

    class ChannelsCallbackRegistry {
        constructor() {
            this.registry = lib();
        }
        add(action, channelId, callback, replayArgs) {
            return this.registry.add(`${action}-${channelId}`, callback, replayArgs);
        }
        invoke(action, argumentObj) {
            const { channelId, contextType } = argumentObj;
            this.registry.execute(`${action}-${channelId}`, contextType);
        }
    }

    class GlueEventsController {
        constructor(glueController, channelsCallbackRegistry) {
            this.glueController = glueController;
            this.channelsCallbackRegistry = channelsCallbackRegistry;
        }
        initialize() {
            return __awaiter(this, void 0, void 0, function* () {
                const isMethodRegisteredByThisApp = this.isSysMethodRegisteredByCurrentApp();
                if (isMethodRegisteredByThisApp) {
                    return;
                }
                yield this.glueController.registerMethod(Glue42FDC3SystemMethod, this.handleSystemMethodInvocation.bind(this));
            });
        }
        isSysMethodRegisteredByCurrentApp() {
            const methods = this.glueController.getInteropMethods(Glue42FDC3SystemMethod);
            const myId = this.glueController.getMyWindowId();
            const methodsByThisInstance = methods.filter(method => {
                const methodRegisteredByThisApp = method.getServers().find(server => server.instance === myId);
                return methodRegisteredByThisApp ? method : undefined;
            });
            return !!methodsByThisInstance.length;
        }
        handleSystemMethodInvocation(argumentObj) {
            const argsDecodeResult = SystemMethodInvocationArgumentDecoder.run(argumentObj);
            if (!argsDecodeResult.ok) {
                throw new Error(`Interop Method ${Glue42FDC3SystemMethod} invoked with invalid argument object - ${argsDecodeResult.error}.\n Expected ${JSON.stringify({ action: string, payload: { channelId: string, clientId: string } })}`);
            }
            const { action, payload } = argsDecodeResult.result;
            if (action === PrivateChannelEventMethods.OnDisconnect) {
                return this.handleOnDisconnect(payload);
            }
            if (action === PrivateChannelEventMethods.OnAddContextListener || action === PrivateChannelEventMethods.OnUnsubscribe) {
                return this.channelsCallbackRegistry.invoke(action, payload);
            }
        }
        handleOnDisconnect(payload) {
            if (payload.replayContextTypes) {
                this.invokeOnUnsubscribeHandlerMultipleTimes(payload);
            }
            this.channelsCallbackRegistry.invoke(PrivateChannelEventMethods.OnDisconnect, payload);
        }
        invokeOnUnsubscribeHandlerMultipleTimes(payload) {
            payload.replayContextTypes.forEach(contextType => {
                this.channelsCallbackRegistry.invoke(PrivateChannelEventMethods.OnUnsubscribe, { channelId: payload.channelId, clientId: payload.clientId, contextType });
            });
        }
    }

    class IoC {
        get ioc() {
            return this;
        }
        get eventDispatcher() {
            if (!this._eventDispatcher) {
                this._eventDispatcher = new EventDispatcher();
            }
            return this._eventDispatcher;
        }
        get eventReceiver() {
            if (!this._eventReceiver) {
                this._eventReceiver = new EventReceiver(this.glueController, this.eventDispatcher, this.eventsController);
            }
            return this._eventReceiver;
        }
        get glueController() {
            if (!this._glueController) {
                this._glueController = new GlueController(this.channelsParser, this.eventDispatcher.fireFdc3Ready.bind(this));
            }
            return this._glueController;
        }
        get fdc3() {
            if (!this._fdc3) {
                this._fdc3 = this.desktopAgent.toApi();
            }
            return this._fdc3;
        }
        get channelsFactory() {
            if (!this._channelsFactory) {
                this._channelsFactory = new ChannelsFactory(this.createUserChannel.bind(this), this.createAppChannel.bind(this), this.createPrivateChannel.bind(this));
            }
            return this._channelsFactory;
        }
        createUserChannel(glueChannel) {
            return new UserChannel(this.channelsController, glueChannel).toApi();
        }
        createAppChannel(id) {
            return new AppChannel(this.channelsController, id).toApi();
        }
        createPrivateChannel(channelId) {
            return new PrivateChannel(this.channelsController, channelId).toApi();
        }
        get desktopAgent() {
            if (!this._desktopAgent) {
                this._desktopAgent = new DesktopAgent(this.intentsController, this.applicationController, this.channelsController);
            }
            return this._desktopAgent;
        }
        get channelsParser() {
            if (!this._channelsParser) {
                this._channelsParser = new ChannelsParser();
            }
            return this._channelsParser;
        }
        get intentsController() {
            if (!this._intentsController) {
                this._intentsController = new IntentsController(this.glueController, this.channelsController, this.channelsFactory);
            }
            return this._intentsController;
        }
        get applicationController() {
            if (!this._applicationController) {
                this._applicationController = new ApplicationsController(this.glueController);
            }
            return this._applicationController;
        }
        get channelsController() {
            if (!this._channelsController) {
                this._channelsController = new ChannelsController(this.glueController, this.channelsStateStore, this.channelsParser, this.channelsFactory, this.channelsCallbackRegistry);
            }
            return this._channelsController;
        }
        get channelsStateStore() {
            if (!this._channelsStateStore) {
                this._channelsStateStore = new ChannelsStateStore();
            }
            return this._channelsStateStore;
        }
        get channelsCallbackRegistry() {
            if (!this._channelsCallbackRegistry) {
                this._channelsCallbackRegistry = new ChannelsCallbackRegistry();
            }
            return this._channelsCallbackRegistry;
        }
        get eventsController() {
            if (!this._eventsController) {
                this._eventsController = new GlueEventsController(this.glueController, this.channelsCallbackRegistry);
            }
            return this._eventsController;
        }
    }

    const fdc3Factory = () => {
        const ioc = new IoC();
        ioc.glueController.createGluePromise();
        ioc.eventReceiver.start();
        return ioc.fdc3;
    };

    let globalFdc3 = window.fdc3;
    if (typeof globalFdc3 === "undefined") {
        globalFdc3 = fdc3Factory();
        checkIfInElectron(globalFdc3);
        window.fdc3 = globalFdc3;
    }
    else {
        console.warn("Defaulting to using the auto-injected fdc3.");
    }
    var globalFdc3$1 = globalFdc3;

    return globalFdc3$1;

})));
//# sourceMappingURL=fdc3.umd.js.map
