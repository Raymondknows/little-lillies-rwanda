"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsPage;
var react_1 = require("react");
var backend_url_1 = require("@/lib/backend-url");
var settings_client_1 = require("./settings-client");
var skeleton_1 = require("@/components/ui/skeleton");
var subscription_modal_1 = require("@/components/subscription-modal");
function SettingsPage() {
    var _a = (0, react_1.useState)(null), school = _a[0], setSchool = _a[1];
    var _b = (0, react_1.useState)([]), staff = _b[0], setStaff = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)(null), subscriptionBlocked = _e[0], setSubscriptionBlocked = _e[1];
    (0, react_1.useEffect)(function () {
        function loadSettings() {
            return __awaiter(this, void 0, void 0, function () {
                var backendUrl, response, errorBody, data, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, 6, 7]);
                            backendUrl = (0, backend_url_1.getBackendUrl)();
                            return [4 /*yield*/, fetch("".concat(backendUrl, "/api/admin/settings/data"), {
                                    credentials: "include",
                                    headers: { "Content-Type": "application/json" },
                                })];
                        case 1:
                            response = _a.sent();
                            errorBody = null;
                            if (!!response.ok) return [3 /*break*/, 3];
                            return [4 /*yield*/, response.json().catch(function () { return null; })];
                        case 2:
                            errorBody = _a.sent();
                            _a.label = 3;
                        case 3:
                            if (response.status === 403) {
                                if ((errorBody === null || errorBody === void 0 ? void 0 : errorBody.code) === 'SUBSCRIPTION_INACTIVE') {
                                    setSubscriptionBlocked({ reason: errorBody.reason || 'Your school subscription is not active' });
                                    setLoading(false);
                                    return [2 /*return*/];
                                }
                            }
                            if (response.status === 401 || response.status === 400) {
                                if (typeof window !== 'undefined') {
                                    window.location.href = '/login?next=/admin/settings';
                                }
                                setLoading(false);
                                return [2 /*return*/];
                            }
                            if (!response.ok) {
                                throw new Error((errorBody === null || errorBody === void 0 ? void 0 : errorBody.message) || 'Failed to load settings');
                            }
                            return [4 /*yield*/, response.json()];
                        case 4:
                            data = _a.sent();
                            setSchool(data.config);
                            setStaff(data.staff || []);
                            return [3 /*break*/, 7];
                        case 5:
                            err_1 = _a.sent();
                            setError(err_1 instanceof Error ? err_1.message : "Failed to load settings");
                            console.error("Error loading settings:", err_1);
                            return [3 /*break*/, 7];
                        case 6:
                            setLoading(false);
                            return [7 /*endfinally*/];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        }
        loadSettings();
    }, []);
    if (loading) {
        return (<div className="min-h-screen bg-background">
        <skeleton_1.default />
      </div>);
    }
    if (subscriptionBlocked) {
        return <subscription_modal_1.default reason={subscriptionBlocked.reason}/>;
    }
    if (error || !school) {
        return (<div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error || "Failed to load school settings"}
        </div>
      </div>);
    }
    return (<settings_client_1.default school={school} staff={staff} paystackConfigured={school.hasPaystackPublic && school.hasPaystackSecret} whatsappConfigured={false}/>);
}
