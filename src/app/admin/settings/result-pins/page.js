"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ResultPinsPage;
var link_1 = require("next/link");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var backend_url_1 = require("@/lib/backend-url");
var pin_print_1 = require("@/lib/pin-print");
var asset_urls_1 = require("@/lib/asset-urls");
var error_modal_1 = require("@/components/ui/error-modal");
var isToday = function (value) {
    if (!value)
        return false;
    var date = new Date(value);
    var now = new Date();
    return (date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate());
};
function PinModal(_a) {
    var _b, _c, _d, _e;
    var pin = _a.pin, schoolMeta = _a.schoolMeta, onClose = _a.onClose, onPrint = _a.onPrint, onCopy = _a.onCopy;
    return (<error_modal_1.ErrorModal isOpen={true} onClose={onClose} type="success" title="PIN preview" message="" confirmLabel="Close">
      <div className="mt-2 space-y-4 text-sm text-muted">
        <div className="text-center">
          <div className="mb-3 text-xs text-muted">PIN</div>
          <div className="inline-block rounded-lg border border-border bg-background px-6 py-4 text-2xl font-mono tracking-[0.3em] text-foreground">{pin.pinValue || '—'}</div>
        </div>

        <div className="space-y-2">
          <div><span className="font-medium text-foreground">Student:</span> {pin.student ? "".concat(pin.student.firstName || '', " ").concat(pin.student.lastName || '').trim() : '—'}</div>
          <div><span className="font-medium text-foreground">School code:</span> {(schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.slug) || (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.initials) || '—'}</div>
          <div><span className="font-medium text-foreground">Admission number:</span> {((_b = pin.student) === null || _b === void 0 ? void 0 : _b.admissionNo) || '—'}</div>
          <div><span className="font-medium text-foreground">Session:</span> {((_d = (_c = pin.term) === null || _c === void 0 ? void 0 : _c.academicYear) === null || _d === void 0 ? void 0 : _d.name) || '—'}</div>
          <div><span className="font-medium text-foreground">Term:</span> {((_e = pin.term) === null || _e === void 0 ? void 0 : _e.name) || '—'}</div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={function () { onCopy(); }} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90">
            <lucide_react_1.Copy className="h-4 w-4"/> Copy PIN
          </button>
          <button type="button" onClick={function () { onPrint(pin); }} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/30">
            <lucide_react_1.Printer className="h-4 w-4"/> Print sheet
          </button>
        </div>
      </div>
    </error_modal_1.ErrorModal>);
}
function GeneratedPinModal(_a) {
    var _b;
    var data = _a.data, schoolMeta = _a.schoolMeta, onClose = _a.onClose, onPrint = _a.onPrint, onCopy = _a.onCopy;
    return (<error_modal_1.ErrorModal isOpen={true} onClose={onClose} type="success" title="Generated PIN" message={data.pin || ''} confirmLabel="Close">
      <div className="mt-2 space-y-4 text-sm text-muted">
        <div className="text-center">
          <div className="mb-3 text-xs text-muted">PIN</div>
          <div className="inline-block rounded-lg border border-border bg-background px-6 py-4 text-2xl font-mono tracking-[0.3em] text-foreground">{data.pin}</div>
        </div>

        <div className="space-y-2">
          <div><span className="font-medium text-foreground">Student:</span> {data.student ? "".concat(data.student.firstName || '', " ").concat(data.student.lastName || '').trim() : '—'}</div>
          <div><span className="font-medium text-foreground">School code:</span> {data.schoolCode || (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.slug) || (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.initials) || '—'}</div>
          <div><span className="font-medium text-foreground">Admission number:</span> {((_b = data.student) === null || _b === void 0 ? void 0 : _b.admissionNo) || '—'}</div>
          <div><span className="font-medium text-foreground">Session:</span> {data.sessionName || '—'}</div>
          <div><span className="font-medium text-foreground">Term:</span> {data.termName || '—'}</div>
          <div><span className="font-medium text-foreground">Assessment:</span> {data.assessmentName || '—'}</div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={onCopy} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90">
            <lucide_react_1.Copy className="h-4 w-4"/> Copy PIN
          </button>
          <button type="button" onClick={onPrint} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/30">
            <lucide_react_1.Printer className="h-4 w-4"/> Print sheet
          </button>
        </div>
      </div>
    </error_modal_1.ErrorModal>);
}
function ResultPinsPage() {
    var _this = this;
    var _a, _b, _c;
    var _d = (0, react_1.useState)(null), status = _d[0], setStatus = _d[1];
    var _e = (0, react_1.useState)(true), loadingStatus = _e[0], setLoadingStatus = _e[1];
    var _f = (0, react_1.useState)(""), studentId = _f[0], setStudentId = _f[1];
    var _g = (0, react_1.useState)(""), selectedTermId = _g[0], setSelectedTermId = _g[1];
    var _h = (0, react_1.useState)(""), selectedAssessmentId = _h[0], setSelectedAssessmentId = _h[1];
    var _j = (0, react_1.useState)([]), terms = _j[0], setTerms = _j[1];
    var _k = (0, react_1.useState)([]), sessions = _k[0], setSessions = _k[1];
    var _l = (0, react_1.useState)([]), assessments = _l[0], setAssessments = _l[1];
    var _m = (0, react_1.useState)([]), classes = _m[0], setClasses = _m[1];
    var _o = (0, react_1.useState)([]), students = _o[0], setStudents = _o[1];
    var _p = (0, react_1.useState)(""), selectedClassId = _p[0], setSelectedClassId = _p[1];
    var _q = (0, react_1.useState)(false), submittingClass = _q[0], setSubmittingClass = _q[1];
    var _r = (0, react_1.useState)(null), classPinError = _r[0], setClassPinError = _r[1];
    var _s = (0, react_1.useState)(null), classPinSummary = _s[0], setClassPinSummary = _s[1];
    var _t = (0, react_1.useState)(10), quantity = _t[0], setQuantity = _t[1];
    var _u = (0, react_1.useState)(""), batchName = _u[0], setBatchName = _u[1];
    var _v = (0, react_1.useState)("XXXX-XXXX"), pinFormat = _v[0], setPinFormat = _v[1];
    var _w = (0, react_1.useState)(8), pinLength = _w[0], setPinLength = _w[1];
    var _x = (0, react_1.useState)(null), generatedStudent = _x[0], setGeneratedStudent = _x[1];
    var _y = (0, react_1.useState)(null), generatedBatch = _y[0], setGeneratedBatch = _y[1];
    var _z = (0, react_1.useState)(false), submittingStudent = _z[0], setSubmittingStudent = _z[1];
    var _0 = (0, react_1.useState)(false), submittingBatch = _0[0], setSubmittingBatch = _0[1];
    var _1 = (0, react_1.useState)(""), pinSearch = _1[0], setPinSearch = _1[1];
    var _2 = (0, react_1.useState)("all"), pinFilterStatus = _2[0], setPinFilterStatus = _2[1];
    var _3 = (0, react_1.useState)("all"), pinFilterType = _3[0], setPinFilterType = _3[1];
    var _4 = (0, react_1.useState)("all"), pinFilterSession = _4[0], setPinFilterSession = _4[1];
    var _5 = (0, react_1.useState)("all"), pinFilterTerm = _5[0], setPinFilterTerm = _5[1];
    var _6 = (0, react_1.useState)("all"), pinFilterClass = _6[0], setPinFilterClass = _6[1];
    var _7 = (0, react_1.useState)("all"), pinFilterGeneratedBy = _7[0], setPinFilterGeneratedBy = _7[1];
    var _8 = (0, react_1.useState)("all"), pinFilterBatch = _8[0], setPinFilterBatch = _8[1];
    var _9 = (0, react_1.useState)([]), pins = _9[0], setPins = _9[1];
    var _10 = (0, react_1.useState)([]), selectedPinIds = _10[0], setSelectedPinIds = _10[1];
    var _11 = (0, react_1.useState)({ open: false, type: "success", message: "" }), statusModal = _11[0], setStatusModal = _11[1];
    var _12 = (0, react_1.useState)(false), loadingPins = _12[0], setLoadingPins = _12[1];
    var _13 = (0, react_1.useState)(null), error = _13[0], setError = _13[1];
    var _14 = (0, react_1.useState)(null), selectedPin = _14[0], setSelectedPin = _14[1];
    var _15 = (0, react_1.useState)(false), isPinModalOpen = _15[0], setIsPinModalOpen = _15[1];
    var _16 = (0, react_1.useState)(null), schoolMeta = _16[0], setSchoolMeta = _16[1];
    var _17 = (0, react_1.useState)(1), currentPage = _17[0], setCurrentPage = _17[1];
    var pageSize = 10;
    var backendUrl = (0, backend_url_1.getBackendUrl)();
    var loadSchoolMeta = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, schoolResponse, settingsResponse, schoolData, settingsData, _b, configuredLogoUrl, resolvedLogoUrl, err_1;
        var _c, _d, _e, _f, _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _j.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, Promise.all([
                            fetch("/api/admin/school", { credentials: "include" }),
                            fetch("/api/admin/settings/data", { credentials: "include" }),
                        ])];
                case 1:
                    _a = _j.sent(), schoolResponse = _a[0], settingsResponse = _a[1];
                    if (!schoolResponse.ok)
                        return [2 /*return*/];
                    return [4 /*yield*/, schoolResponse.json()];
                case 2:
                    schoolData = _j.sent();
                    if (!settingsResponse.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, settingsResponse.json()];
                case 3:
                    _b = _j.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _b = null;
                    _j.label = 5;
                case 5:
                    settingsData = _b;
                    configuredLogoUrl = ((_c = settingsData === null || settingsData === void 0 ? void 0 : settingsData.config) === null || _c === void 0 ? void 0 : _c.logoUrl) || (schoolData === null || schoolData === void 0 ? void 0 : schoolData.logoUrl) || ((_d = schoolData === null || schoolData === void 0 ? void 0 : schoolData.school) === null || _d === void 0 ? void 0 : _d.logoUrl) || null;
                    resolvedLogoUrl = configuredLogoUrl ? (0, asset_urls_1.resolveSchoolAssetUrl)(configuredLogoUrl) : null;
                    setSchoolMeta({
                        id: (schoolData === null || schoolData === void 0 ? void 0 : schoolData.id) || ((_e = schoolData === null || schoolData === void 0 ? void 0 : schoolData.school) === null || _e === void 0 ? void 0 : _e.id),
                        name: (schoolData === null || schoolData === void 0 ? void 0 : schoolData.name) || ((_f = schoolData === null || schoolData === void 0 ? void 0 : schoolData.school) === null || _f === void 0 ? void 0 : _f.name),
                        slug: (schoolData === null || schoolData === void 0 ? void 0 : schoolData.slug) || ((_g = schoolData === null || schoolData === void 0 ? void 0 : schoolData.school) === null || _g === void 0 ? void 0 : _g.slug),
                        initials: (schoolData === null || schoolData === void 0 ? void 0 : schoolData.initials) || ((_h = schoolData === null || schoolData === void 0 ? void 0 : schoolData.school) === null || _h === void 0 ? void 0 : _h.initials),
                        logoUrl: resolvedLogoUrl,
                    });
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _j.sent();
                    console.error("Unable to load school metadata", err_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var loadStatus = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoadingStatus(true);
                    return [4 /*yield*/, fetch("".concat(backendUrl, "/api/result-pins/status"), {
                            credentials: "include",
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error("Failed to load PIN settings");
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setStatus(data);
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    setError(err_2 instanceof Error ? err_2.message : "Unable to load PIN settings");
                    return [3 /*break*/, 5];
                case 4:
                    setLoadingStatus(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var loadMetadataOptions = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, academicYearsResponse, assessmentsResponse, studentsResponse, academicYearsData, academicYearItems, normalizedSessions, flattenedTerms, fallbackTermsResponse, fallbackTermsData, assessmentsData, assessmentItems, studentsData, classItems, studentItems, err_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 11, , 12]);
                    return [4 /*yield*/, Promise.all([
                            fetch("".concat(backendUrl, "/api/admin/academic-years"), { credentials: "include" }),
                            fetch("".concat(backendUrl, "/api/admin/results/data"), { credentials: "include" }),
                            fetch("".concat(backendUrl, "/api/admin/students/data"), { credentials: "include" }),
                        ])];
                case 1:
                    _a = _b.sent(), academicYearsResponse = _a[0], assessmentsResponse = _a[1], studentsResponse = _a[2];
                    if (!academicYearsResponse.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, academicYearsResponse.json()];
                case 2:
                    academicYearsData = _b.sent();
                    academicYearItems = Array.isArray(academicYearsData === null || academicYearsData === void 0 ? void 0 : academicYearsData.academicYears) ? academicYearsData.academicYears : [];
                    normalizedSessions = academicYearItems.map(function (year) { return ({
                        id: year.id,
                        name: year.name,
                        isCurrent: Boolean(year.isCurrent),
                        terms: Array.isArray(year.terms)
                            ? year.terms.map(function (term) { return ({
                                id: term.id,
                                name: term.name,
                                isCurrent: Boolean(term.isCurrent),
                                academicYearId: term.academicYearId || year.id,
                                academicYearName: year.name,
                            }); })
                            : [],
                    }); });
                    setSessions(normalizedSessions);
                    flattenedTerms = normalizedSessions.flatMap(function (session) {
                        return session.terms.map(function (term) { return (__assign(__assign({}, term), { academicYearName: session.name })); });
                    });
                    setTerms(flattenedTerms);
                    return [3 /*break*/, 6];
                case 3: return [4 /*yield*/, fetch("".concat(backendUrl, "/api/admin/terms"), { credentials: "include" })];
                case 4:
                    fallbackTermsResponse = _b.sent();
                    if (!fallbackTermsResponse.ok) return [3 /*break*/, 6];
                    return [4 /*yield*/, fallbackTermsResponse.json()];
                case 5:
                    fallbackTermsData = _b.sent();
                    setTerms((fallbackTermsData.terms || []));
                    setSessions([]);
                    _b.label = 6;
                case 6:
                    if (!assessmentsResponse.ok) return [3 /*break*/, 8];
                    return [4 /*yield*/, assessmentsResponse.json()];
                case 7:
                    assessmentsData = _b.sent();
                    assessmentItems = Array.isArray(assessmentsData === null || assessmentsData === void 0 ? void 0 : assessmentsData.assessments) ? assessmentsData.assessments : [];
                    setAssessments(assessmentItems);
                    _b.label = 8;
                case 8:
                    if (!studentsResponse.ok) return [3 /*break*/, 10];
                    return [4 /*yield*/, studentsResponse.json()];
                case 9:
                    studentsData = _b.sent();
                    classItems = Array.isArray(studentsData === null || studentsData === void 0 ? void 0 : studentsData.classes) ? studentsData.classes : [];
                    studentItems = Array.isArray(studentsData === null || studentsData === void 0 ? void 0 : studentsData.pupils) ? studentsData.pupils : [];
                    setClasses(classItems);
                    setStudents(studentItems);
                    _b.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    err_3 = _b.sent();
                    console.error("Failed to load metadata options", err_3);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        void loadSchoolMeta();
        void loadStatus();
        void loadPins();
        void loadMetadataOptions();
    }, []);
    var loadPins = function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (searchValue) {
            var response, data, err_4;
            if (searchValue === void 0) { searchValue = pinSearch; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, 4, 5]);
                        setLoadingPins(true);
                        setCurrentPage(1);
                        return [4 /*yield*/, fetch("".concat(backendUrl, "/api/result-pins/pins?search=").concat(encodeURIComponent(searchValue), "&limit=100"), {
                                credentials: "include",
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to load PIN records");
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        setPins(data.pins || []);
                        return [3 /*break*/, 5];
                    case 3:
                        err_4 = _a.sent();
                        setError(err_4 instanceof Error ? err_4.message : "Unable to load PIN records");
                        return [3 /*break*/, 5];
                    case 4:
                        setLoadingPins(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    var filteredStudents = (0, react_1.useMemo)(function () {
        if (!selectedClassId)
            return students;
        return students.filter(function (student) { var _a; return ((_a = student.class) === null || _a === void 0 ? void 0 : _a.id) === selectedClassId; });
    }, [selectedClassId, students]);
    var selectedClassStudentCount = (0, react_1.useMemo)(function () {
        if (!selectedClassId)
            return 0;
        return students.filter(function (student) { var _a; return ((_a = student.class) === null || _a === void 0 ? void 0 : _a.id) === selectedClassId; }).length;
    }, [selectedClassId, students]);
    var selectedClassPhase = (0, react_1.useMemo)(function () {
        var _a;
        if (!selectedClassId)
            return null;
        return ((_a = classes.find(function (classItem) { return classItem.id === selectedClassId; })) === null || _a === void 0 ? void 0 : _a.phase) || null;
    }, [classes, selectedClassId]);
    var filteredAssessments = (0, react_1.useMemo)(function () {
        var termFiltered = selectedTermId
            ? assessments.filter(function (assessment) { var _a; return ((_a = assessment.term) === null || _a === void 0 ? void 0 : _a.id) === selectedTermId; })
            : assessments;
        if (!selectedClassId)
            return termFiltered;
        return termFiltered.filter(function (assessment) {
            if (assessment.classId) {
                return assessment.classId === selectedClassId;
            }
            if (selectedClassPhase) {
                return assessment.phase === selectedClassPhase;
            }
            return true;
        });
    }, [assessments, selectedClassId, selectedClassPhase, selectedTermId]);
    (0, react_1.useEffect)(function () {
        if (selectedAssessmentId && !filteredAssessments.some(function (assessment) { return assessment.id === selectedAssessmentId; })) {
            setSelectedAssessmentId("");
        }
    }, [filteredAssessments, selectedAssessmentId]);
    var summaryCards = (0, react_1.useMemo)(function () {
        var totals = pins.reduce(function (accumulator, pin) {
            accumulator.total += 1;
            if (pin.status === "ACTIVE")
                accumulator.active += 1;
            if (pin.status === "USED" || pin.lastValidatedAt)
                accumulator.used += 1;
            if (pin.status === "EXPIRED")
                accumulator.expired += 1;
            if (pin.status === "REVOKED")
                accumulator.revoked += 1;
            if (pin.studentId)
                accumulator.assigned += 1;
            else
                accumulator.unassigned += 1;
            if (pin.lastValidatedAt && isToday(pin.lastValidatedAt))
                accumulator.today += 1;
            if (pin.lastValidatedAt) {
                var identifier = pin.studentId || pin.pinValue || pin.id;
                accumulator.loggedIn.add(identifier);
            }
            return accumulator;
        }, {
            total: 0,
            active: 0,
            used: 0,
            assigned: 0,
            unassigned: 0,
            expired: 0,
            revoked: 0,
            today: 0,
            loggedIn: new Set(),
        });
        var unused = Math.max(0, totals.active - totals.used);
        return [
            { label: "Active PINs", value: totals.active, sub: "Ready for use", icon: lucide_react_1.CheckCircle2, iconClass: "bg-emerald-100 text-emerald-700" },
            { label: "Used PINs", value: totals.used, sub: "Validated at least once", icon: lucide_react_1.Users, iconClass: "bg-sky-100 text-sky-700" },
            { label: "Unused PINs", value: unused, sub: "Available and not validated", icon: lucide_react_1.Sparkles, iconClass: "bg-violet-100 text-violet-700" },
            { label: "Today's accesses", value: totals.today, sub: "PINs validated today", icon: lucide_react_1.Clock3, iconClass: "bg-orange-100 text-orange-700" },
        ];
    }, [pins]);
    var summary = (0, react_1.useMemo)(function () {
        var totals = pins.reduce(function (accumulator, pin) {
            accumulator.total += 1;
            if (pin.status === "ACTIVE")
                accumulator.active += 1;
            if (pin.status === "EXPIRED")
                accumulator.expired += 1;
            if (pin.status === "REVOKED")
                accumulator.revoked += 1;
            if (pin.studentId)
                accumulator.assigned += 1;
            else
                accumulator.unassigned += 1;
            return accumulator;
        }, {
            total: 0,
            active: 0,
            assigned: 0,
            unassigned: 0,
            expired: 0,
            revoked: 0,
        });
        return totals;
    }, [pins]);
    var filteredPins = (0, react_1.useMemo)(function () {
        return pins.filter(function (pin) {
            var _a, _b, _c, _d, _e, _f;
            if (pinFilterStatus !== "all" && (pin.status || "ACTIVE").toUpperCase() !== pinFilterStatus.toUpperCase()) {
                return false;
            }
            if (pinFilterType !== "all" && (pin.type || "GENERIC").toUpperCase() !== pinFilterType.toUpperCase()) {
                return false;
            }
            if (pinFilterSession !== "all" && (((_b = (_a = pin.term) === null || _a === void 0 ? void 0 : _a.academicYear) === null || _b === void 0 ? void 0 : _b.name) || "") !== pinFilterSession) {
                return false;
            }
            if (pinFilterTerm !== "all" && (((_c = pin.term) === null || _c === void 0 ? void 0 : _c.name) || "") !== pinFilterTerm) {
                return false;
            }
            if (pinFilterClass !== "all" && (((_e = (_d = pin.student) === null || _d === void 0 ? void 0 : _d.class) === null || _e === void 0 ? void 0 : _e.name) || "") !== pinFilterClass) {
                return false;
            }
            if (pinFilterGeneratedBy !== "all" && (pin.generatedBy || "system") !== pinFilterGeneratedBy) {
                return false;
            }
            if (pinFilterBatch !== "all" && (((_f = pin.batch) === null || _f === void 0 ? void 0 : _f.batchName) || "") !== pinFilterBatch) {
                return false;
            }
            return true;
        });
    }, [pins, pinFilterStatus, pinFilterType, pinFilterSession, pinFilterTerm, pinFilterClass, pinFilterGeneratedBy, pinFilterBatch]);
    var filteredStudentPins = (0, react_1.useMemo)(function () { return filteredPins.filter(function (pin) { return (pin.type || "GENERIC").toUpperCase() !== "GENERIC"; }); }, [filteredPins]);
    var filteredGenericPins = (0, react_1.useMemo)(function () { return filteredPins.filter(function (pin) { return (pin.type || "GENERIC").toUpperCase() === "GENERIC"; }); }, [filteredPins]);
    var totalFilteredRows = filteredStudentPins.length;
    var pageCount = Math.max(1, Math.ceil(totalFilteredRows / pageSize));
    var pagedPins = (0, react_1.useMemo)(function () {
        var startIndex = (currentPage - 1) * pageSize;
        return filteredStudentPins.slice(startIndex, startIndex + pageSize);
    }, [filteredStudentPins, currentPage]);
    var pagePinIds = (0, react_1.useMemo)(function () { return pagedPins.map(function (pin) { return pin.id; }); }, [pagedPins]);
    var pageAllSelected = pagePinIds.length > 0 && pagePinIds.every(function (id) { return selectedPinIds.includes(id); });
    var handleTogglePinSelection = function (pinId) {
        setSelectedPinIds(function (current) {
            return current.includes(pinId) ? current.filter(function (id) { return id !== pinId; }) : __spreadArray(__spreadArray([], current, true), [pinId], false);
        });
    };
    var handleToggleSelectAll = function () {
        setSelectedPinIds(function (current) { return (pageAllSelected ? [] : pagePinIds); });
    };
    var handleExportSelected = function () {
        var selectedPins = pins.filter(function (pin) { return selectedPinIds.includes(pin.id); });
        if (!selectedPins.length)
            return;
        var lines = selectedPins.map(function (pin) { return "".concat(pin.pinValue || "—", "\t").concat(pin.student ? "".concat(pin.student.firstName || "", " ").concat(pin.student.lastName || "").trim() : "Unassigned"); }).join("\n");
        var blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "result-pins-selected.txt";
        anchor.click();
        URL.revokeObjectURL(url);
    };
    var handlePrintSelected = function () { return __awaiter(_this, void 0, void 0, function () {
        var selectedPins, cards, printWindow, html;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    selectedPins = pins.filter(function (pin) { return selectedPinIds.includes(pin.id); });
                    if (!selectedPins.length)
                        return [2 /*return*/];
                    cards = selectedPins.map(function (pin) {
                        var _a, _b, _c, _d;
                        return ({
                            schoolName: (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.name) || undefined,
                            schoolLogoUrl: (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.logoUrl) || ((schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.id) ? "/api/school-logo/".concat(encodeURIComponent(schoolMeta.id)) : undefined),
                            schoolId: schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.id,
                            schoolCode: (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.slug) || (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.initials) || "school-code",
                            studentName: pin.student ? "".concat(pin.student.firstName || "", " ").concat(pin.student.lastName || "").trim() : "Student",
                            admissionNo: ((_a = pin.student) === null || _a === void 0 ? void 0 : _a.admissionNo) || "N/A",
                            session: ((_c = (_b = pin.term) === null || _b === void 0 ? void 0 : _b.academicYear) === null || _c === void 0 ? void 0 : _c.name) || "—",
                            term: ((_d = pin.term) === null || _d === void 0 ? void 0 : _d.name) || "—",
                            pin: pin.pinValue || "—",
                            printedAt: new Date().toLocaleString(),
                        });
                    });
                    printWindow = window.open("", "_blank", "width=1200,height=900");
                    if (!printWindow)
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, pin_print_1.buildPinSheetHtml)(cards, { title: "Selected PINs" })];
                case 1:
                    html = _a.sent();
                    printWindow.document.write(html);
                    printWindow.document.close();
                    setTimeout(function () {
                        try {
                            printWindow.focus();
                            printWindow.print();
                        }
                        catch (printError) {
                            console.error("Unable to print selected PIN sheet", printError);
                        }
                        setTimeout(function () {
                            try {
                                printWindow.close();
                            }
                            catch (closeError) {
                                console.error("Unable to close PIN sheet popup", closeError);
                            }
                        }, 900);
                    }, 900);
                    return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        setCurrentPage(1);
    }, [pinFilterStatus, pinFilterType, pinFilterSession, pinFilterTerm, pinFilterClass, pinFilterGeneratedBy, pinFilterBatch, pinSearch]);
    (0, react_1.useEffect)(function () {
        if (currentPage > pageCount) {
            setCurrentPage(pageCount);
        }
    }, [currentPage, pageCount]);
    var handleGenerateStudentPin = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, selectedStudent, err_5;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    event.preventDefault();
                    setError(null);
                    setSubmittingStudent(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, fetch("".concat(backendUrl, "/api/result-pins/generate/student"), {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                pupilId: studentId.trim(),
                                termId: selectedTermId || undefined,
                                assessmentId: selectedAssessmentId || undefined,
                                generatedBy: "admin-ui",
                                pinFormat: pinFormat,
                                pinLength: pinLength,
                            }),
                        })];
                case 2:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _b.sent();
                    if (!response.ok)
                        throw new Error((data === null || data === void 0 ? void 0 : data.error) || "Failed to generate student PIN");
                    selectedStudent = students.find(function (entry) { return entry.id === studentId; });
                    setGeneratedStudent(__assign(__assign({}, data), { student: __assign(__assign({}, (data.student || {})), { admissionNo: (selectedStudent === null || selectedStudent === void 0 ? void 0 : selectedStudent.admissionNo) || ((_a = data.student) === null || _a === void 0 ? void 0 : _a.admissionNo) || null }), schoolCode: (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.slug) || (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.initials) || null, schoolName: (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.name) || null }));
                    setStudentId("");
                    return [4 /*yield*/, loadPins()];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 5:
                    err_5 = _b.sent();
                    setError(err_5 instanceof Error ? err_5.message : "Failed to generate student PIN");
                    return [3 /*break*/, 7];
                case 6:
                    setSubmittingStudent(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handlePrintSheet = function () { return __awaiter(_this, void 0, void 0, function () {
        var studentName, schoolCode, admissionNo, printWindow, schoolLogoUrl, html;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(generatedStudent === null || generatedStudent === void 0 ? void 0 : generatedStudent.pin))
                        return [2 /*return*/];
                    studentName = generatedStudent.student ? "".concat(generatedStudent.student.firstName || "", " ").concat(generatedStudent.student.lastName || "").trim() : "Student";
                    schoolCode = generatedStudent.schoolCode || (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.slug) || (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.initials) || "school-code";
                    admissionNo = ((_a = generatedStudent.student) === null || _a === void 0 ? void 0 : _a.admissionNo) || "N/A";
                    printWindow = window.open("", "_blank", "width=900,height=700");
                    if (!printWindow)
                        return [2 /*return*/];
                    schoolLogoUrl = (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.logoUrl) || ((schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.id) ? "/api/school-logo/".concat(encodeURIComponent(schoolMeta.id)) : undefined);
                    return [4 /*yield*/, (0, pin_print_1.buildPinCardHtml)({
                            schoolName: generatedStudent.schoolName || (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.name) || undefined,
                            schoolLogoUrl: schoolLogoUrl,
                            schoolId: schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.id,
                            schoolCode: schoolCode,
                            studentName: studentName,
                            admissionNo: admissionNo,
                            session: generatedStudent.sessionName || "—",
                            term: generatedStudent.termName || "—",
                            pin: generatedStudent.pin,
                            printedAt: new Date().toLocaleString(),
                        })];
                case 1:
                    html = _b.sent();
                    printWindow.document.write(html);
                    printWindow.document.close();
                    setTimeout(function () {
                        try {
                            printWindow.focus();
                            printWindow.print();
                        }
                        catch (printError) {
                            console.error("Unable to print PIN card", printError);
                        }
                        setTimeout(function () {
                            try {
                                printWindow.close();
                            }
                            catch (closeError) {
                                console.error("Unable to close PIN card popup", closeError);
                            }
                        }, 900);
                    }, 900);
                    return [2 /*return*/];
            }
        });
    }); };
    var handleGenerateClassPins = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var response, data_1, cards, printWindow_1, className, html, err_6;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    event.preventDefault();
                    setError(null);
                    setClassPinError(null);
                    setClassPinSummary(null);
                    setSubmittingClass(true);
                    if (!selectedClassId) {
                        setClassPinError("Please select a class to generate PINs for.");
                        setSubmittingClass(false);
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch("".concat(backendUrl, "/api/result-pins/generate/class"), {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                classId: selectedClassId,
                                termId: selectedTermId || undefined,
                                assessmentId: selectedAssessmentId || undefined,
                                generatedBy: "admin-ui",
                                pinFormat: pinFormat,
                                pinLength: pinLength,
                            }),
                        })];
                case 2:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data_1 = _b.sent();
                    if (!response.ok)
                        throw new Error((data_1 === null || data_1 === void 0 ? void 0 : data_1.error) || "Failed to generate PINs for the selected class");
                    cards = (data_1.cards || []).map(function (entry) {
                        var _a, _b, _c, _d, _e, _f, _g;
                        return ({
                            schoolName: ((_a = data_1.school) === null || _a === void 0 ? void 0 : _a.name) || (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.name) || undefined,
                            schoolLogoUrl: (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.logoUrl) || ((schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.id) ? "/api/school-logo/".concat(encodeURIComponent(schoolMeta.id)) : undefined),
                            schoolId: ((_b = data_1.school) === null || _b === void 0 ? void 0 : _b.id) || (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.id),
                            schoolCode: ((_c = data_1.school) === null || _c === void 0 ? void 0 : _c.slug) || ((_d = data_1.school) === null || _d === void 0 ? void 0 : _d.initials) || (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.slug) || (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.initials) || "school-code",
                            studentName: "".concat(((_e = entry.student) === null || _e === void 0 ? void 0 : _e.firstName) || "", " ").concat(((_f = entry.student) === null || _f === void 0 ? void 0 : _f.lastName) || "").trim(),
                            admissionNo: ((_g = entry.student) === null || _g === void 0 ? void 0 : _g.admissionNo) || "N/A",
                            session: entry.sessionName || data_1.sessionName || "—",
                            term: entry.termName || data_1.termName || "—",
                            pin: entry.pin,
                            printedAt: new Date().toLocaleString(),
                        });
                    });
                    if (!cards.length) {
                        throw new Error("No active students were found for the selected class.");
                    }
                    printWindow_1 = window.open("", "_blank", "width=1200,height=900");
                    if (!printWindow_1) {
                        throw new Error("Your browser blocked the print window. Please allow pop-ups and try again.");
                    }
                    className = ((_a = classes.find(function (entry) { return entry.id === selectedClassId; })) === null || _a === void 0 ? void 0 : _a.name) || "Selected class";
                    return [4 /*yield*/, (0, pin_print_1.buildPinSheetHtml)(cards, {
                            title: "".concat(className, " PIN Sheet"),
                        })];
                case 4:
                    html = _b.sent();
                    printWindow_1.document.write(html);
                    printWindow_1.document.close();
                    setTimeout(function () {
                        try {
                            printWindow_1.focus();
                            printWindow_1.print();
                        }
                        catch (printError) {
                            console.error("Unable to print class PIN sheet", printError);
                        }
                        setTimeout(function () {
                            try {
                                printWindow_1.close();
                            }
                            catch (closeError) {
                                console.error("Unable to close class PIN sheet popup", closeError);
                            }
                        }, 900);
                    }, 800);
                    setClassPinSummary("Generated ".concat(cards.length, " PIN").concat(cards.length === 1 ? "" : "s", " for ").concat(className, "."));
                    return [4 /*yield*/, loadPins()];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 8];
                case 6:
                    err_6 = _b.sent();
                    setClassPinError(err_6 instanceof Error ? err_6.message : "Failed to generate class PINs");
                    return [3 /*break*/, 8];
                case 7:
                    setSubmittingClass(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var handleGenerateBatch = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    setError(null);
                    setSubmittingBatch(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, fetch("".concat(backendUrl, "/api/result-pins/generate/batch"), {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                quantity: quantity,
                                batchName: batchName.trim() || undefined,
                                generatedBy: "admin-ui",
                                pinFormat: pinFormat,
                                pinLength: pinLength,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (!response.ok)
                        throw new Error((data === null || data === void 0 ? void 0 : data.error) || "Failed to generate PIN batch");
                    setGeneratedBatch(data);
                    setQuantity(10);
                    setBatchName("");
                    return [4 /*yield*/, loadPins()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5:
                    err_7 = _a.sent();
                    setError(err_7 instanceof Error ? err_7.message : "Failed to generate PIN batch");
                    return [3 /*break*/, 7];
                case 6:
                    setSubmittingBatch(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleCopyPin = function () { return __awaiter(_this, void 0, void 0, function () {
        var clipboardError_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(generatedStudent === null || generatedStudent === void 0 ? void 0 : generatedStudent.pin))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, navigator.clipboard.writeText(generatedStudent.pin)];
                case 2:
                    _a.sent();
                    setError(null);
                    return [3 /*break*/, 4];
                case 3:
                    clipboardError_1 = _a.sent();
                    console.error("Unable to copy PIN", clipboardError_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleExportBatch = function () {
        var _a, _b;
        if (!((_a = generatedBatch === null || generatedBatch === void 0 ? void 0 : generatedBatch.pins) === null || _a === void 0 ? void 0 : _a.length))
            return;
        var lines = generatedBatch.pins.map(function (entry) { return entry.pin; }).join("\n");
        var blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "result-pins-".concat(((_b = generatedBatch.batch) === null || _b === void 0 ? void 0 : _b.id) || "batch", ".txt");
        anchor.click();
        URL.revokeObjectURL(url);
    };
    var handleCopyPinValue = function (pinValue) { return __awaiter(_this, void 0, void 0, function () {
        var clipboardError_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!pinValue)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, navigator.clipboard.writeText(pinValue)];
                case 2:
                    _a.sent();
                    setError(null);
                    return [3 /*break*/, 4];
                case 3:
                    clipboardError_2 = _a.sent();
                    console.error("Unable to copy PIN", clipboardError_2);
                    setError("Unable to copy PIN to clipboard.");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleExportPin = function (pinValue) {
        if (!pinValue)
            return;
        var blob = new Blob([pinValue], { type: "text/plain;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "result-pin-".concat(pinValue, ".txt");
        anchor.click();
        URL.revokeObjectURL(url);
    };
    var handleViewPin = function (pin) {
        setSelectedPin(pin);
        setIsPinModalOpen(true);
    };
    var handlePrintPin = function (pin) { return __awaiter(_this, void 0, void 0, function () {
        var schoolCode, admissionNo, studentName, printWindow, schoolLogoUrl, html;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    schoolCode = (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.slug) || (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.initials) || "school-code";
                    admissionNo = ((_a = pin.student) === null || _a === void 0 ? void 0 : _a.admissionNo) || "N/A";
                    studentName = pin.student ? "".concat(pin.student.firstName || "", " ").concat(pin.student.lastName || "").trim() : "Unassigned";
                    printWindow = window.open("", "_blank", "width=900,height=700");
                    if (!printWindow)
                        return [2 /*return*/];
                    schoolLogoUrl = (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.logoUrl) || ((schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.id) ? "/api/school-logo/".concat(encodeURIComponent(schoolMeta.id)) : undefined);
                    return [4 /*yield*/, (0, pin_print_1.buildPinCardHtml)({
                            schoolName: (schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.name) || undefined,
                            schoolLogoUrl: schoolLogoUrl,
                            schoolId: schoolMeta === null || schoolMeta === void 0 ? void 0 : schoolMeta.id,
                            schoolCode: schoolCode,
                            studentName: studentName,
                            admissionNo: admissionNo,
                            session: ((_c = (_b = pin.term) === null || _b === void 0 ? void 0 : _b.academicYear) === null || _c === void 0 ? void 0 : _c.name) || "—",
                            term: ((_d = pin.term) === null || _d === void 0 ? void 0 : _d.name) || "—",
                            pin: pin.pinValue || "—",
                            printedAt: new Date().toLocaleString(),
                        })];
                case 1:
                    html = _e.sent();
                    printWindow.document.write(html);
                    printWindow.document.close();
                    setTimeout(function () {
                        try {
                            printWindow.focus();
                            printWindow.print();
                        }
                        catch (printError) {
                            console.error("Unable to print PIN card", printError);
                        }
                        setTimeout(function () {
                            try {
                                printWindow.close();
                            }
                            catch (closeError) {
                                console.error("Unable to close PIN card popup", closeError);
                            }
                        }, 900);
                    }, 900);
                    return [2 /*return*/];
            }
        });
    }); };
    var handleStudentPrintClick = function () { return __awaiter(_this, void 0, void 0, function () {
        var existingPin;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(generatedStudent === null || generatedStudent === void 0 ? void 0 : generatedStudent.pin)) return [3 /*break*/, 2];
                    return [4 /*yield*/, handlePrintSheet()];
                case 1:
                    _a.sent();
                    setGeneratedStudent(null);
                    return [2 /*return*/];
                case 2:
                    existingPin = pins.find(function (p) { var _a; return ((_a = p.student) === null || _a === void 0 ? void 0 : _a.id) === studentId; });
                    if (!existingPin) return [3 /*break*/, 4];
                    return [4 /*yield*/, handlePrintPin(existingPin)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
                case 4:
                    setStatusModal({ open: true, type: "error", title: "No PIN to print", message: "No generated or existing PIN found for the selected student." });
                    return [2 /*return*/];
            }
        });
    }); };
    var getTypeBadgeClass = function (type) {
        var normalized = (type || "GENERIC").toUpperCase();
        if (normalized === "STUDENT") {
            return "border-violet-200 bg-violet-100 text-violet-700";
        }
        if (normalized === "GENERIC") {
            return "border-sky-200 bg-sky-100 text-sky-700";
        }
        return "border-slate-200 bg-slate-100 text-slate-700";
    };
    var getStatusBadgeClass = function (status) {
        var normalized = (status || "ACTIVE").toUpperCase();
        if (normalized === "ACTIVE") {
            return "border-emerald-200 bg-emerald-100 text-emerald-700";
        }
        if (normalized === "USED") {
            return "border-sky-200 bg-sky-100 text-sky-700";
        }
        if (normalized === "EXPIRED") {
            return "border-amber-200 bg-amber-100 text-amber-700";
        }
        if (normalized === "REVOKED") {
            return "border-rose-200 bg-rose-100 text-rose-700";
        }
        return "border-slate-200 bg-slate-100 text-slate-700";
    };
    return (<div className="space-y-6">
      <error_modal_1.ErrorModal isOpen={statusModal.open} onClose={function () { return setStatusModal(function (prev) { return (__assign(__assign({}, prev), { open: false })); }); }} title={statusModal.title} message={statusModal.message} type={statusModal.type} confirmLabel={statusModal.type === "success" ? "Okay" : "Try again"}/>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <link_1.default href="/admin/settings" className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand/80">
            <lucide_react_1.ArrowLeft className="h-4 w-4"/>
            Back to settings
          </link_1.default>
          <h1 className="mt-3 text-3xl font-bold text-foreground">Result PIN Centre</h1>
          <p className="mt-2 text-sm text-muted">A polished workspace for generating, printing, and tracking result access PINs.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button type="button" onClick={function () { var _a; return (_a = document.getElementById('student-pin-form')) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="inline-flex items-center gap-2 rounded-lg border border-[#0A66C2] bg-[#0A66C2] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0858a8]">
            <lucide_react_1.UserRoundPlus className="h-4 w-4"/>
            Student PIN
          </button>
          <button type="button" onClick={function () { var _a; return (_a = document.getElementById('class-pin-form')) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="inline-flex items-center gap-2 rounded-lg border border-[#0A66C2] bg-[#0A66C2] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0858a8]">
            <lucide_react_1.Users className="h-4 w-4"/>
            Class PINs
          </button>
          <button type="button" onClick={function () { var _a; return (_a = document.getElementById('batch-pin-form')) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="inline-flex items-center gap-2 rounded-lg border border-[#0A66C2] bg-[#0A66C2] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0858a8]">
            <lucide_react_1.Sparkles className="h-4 w-4"/>
            Scratch Cards
          </button>
          <button type="button" onClick={function () { var _a; return (_a = document.getElementById('pin-registry')) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="inline-flex items-center gap-2 rounded-lg border border-[#0A66C2] bg-[#0A66C2] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0858a8]">
            <lucide_react_1.Printer className="h-4 w-4"/>
            Print Sheet
          </button>
          <button type="button" onClick={function () { return void loadStatus(); }} disabled={loadingStatus} className="inline-flex items-center gap-2 rounded-lg border border-[#0A66C2] bg-[#0A66C2] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0858a8] disabled:cursor-not-allowed disabled:opacity-70">
            <lucide_react_1.RefreshCw className={"h-4 w-4 ".concat(loadingStatus ? "animate-spin" : "")}/>
            {loadingStatus ? "Syncing..." : "Sync status"}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-foreground">
            <lucide_react_1.KeyRound className="h-4 w-4 text-brand"/>
            {loadingStatus ? "Loading status..." : (status === null || status === void 0 ? void 0 : status.enabled) ? "PIN access enabled" : "PIN access disabled"}
          </div>
          {status ? (<>
              <span className="text-sm text-muted">Mode: {status.mode}</span>
              <span className="text-sm text-muted">PIN type: {status.pinType}</span>
              <span className="text-sm text-muted">Validity: {status.pinValidity}</span>
            </>) : null}
        </div>
      </div>

      {error ? (<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>) : null}

      {!(status === null || status === void 0 ? void 0 : status.enabled) ? (<div className="rounded-lg border border-dashed border-border bg-background p-5 text-sm text-muted">
          The feature is currently disabled for this school. Enable it from the Result Access PIN section in settings before generating PINs.
        </div>) : null}

      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(function (card) {
            var Icon = card.icon;
            return (<div key={card.label} className="group rounded-2xl border border-border bg-background p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className={"flex h-11 w-11 items-center justify-center rounded-2xl ".concat(card.iconClass)}>
                    <Icon className="h-5 w-5"/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{card.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-foreground">{card.value}</p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted">{card.sub}</p>
              </div>);
        })}
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Result PIN Registry</h2>
            <p className="text-sm text-muted">Search by PIN, student name, admission number, or batch.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <lucide_react_1.Search className="h-4 w-4 text-muted"/>
              <input value={pinSearch} onChange={function (event) {
            var nextValue = event.target.value;
            setPinSearch(nextValue);
            void loadPins(nextValue);
        }} placeholder="Search PINs" className="w-44 bg-transparent text-sm text-foreground outline-none"/>
            </div>
            <button type="button" onClick={function () {
            setPinSearch("");
            setPinFilterStatus("all");
            setPinFilterType("all");
            setPinFilterSession("all");
            setPinFilterTerm("all");
            setPinFilterClass("all");
            setPinFilterGeneratedBy("all");
            setPinFilterBatch("all");
            void loadPins("");
        }} className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/30">
              Reset filters
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <select value={pinFilterStatus} onChange={function (event) { return setPinFilterStatus(event.target.value); }} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
            <option value="all">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="REVOKED">Revoked</option>
          </select>
          <select value={pinFilterType} onChange={function (event) { return setPinFilterType(event.target.value); }} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
            <option value="all">All PIN types</option>
            <option value="STUDENT">Student</option>
            <option value="GENERIC">Generic</option>
          </select>
          <select value={pinFilterSession} onChange={function (event) { return setPinFilterSession(event.target.value); }} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
            <option value="all">All sessions</option>
            {Array.from(new Set(pins.map(function (pin) { var _a, _b; return (_b = (_a = pin.term) === null || _a === void 0 ? void 0 : _a.academicYear) === null || _b === void 0 ? void 0 : _b.name; }).filter(Boolean))).map(function (session) { return (<option key={session} value={session}>{session}</option>); })}
          </select>
          <select value={pinFilterTerm} onChange={function (event) { return setPinFilterTerm(event.target.value); }} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
            <option value="all">All terms</option>
            {Array.from(new Set(pins.map(function (pin) { var _a; return (_a = pin.term) === null || _a === void 0 ? void 0 : _a.name; }).filter(Boolean))).map(function (term) { return (<option key={term} value={term}>{term}</option>); })}
          </select>
          <select value={pinFilterClass} onChange={function (event) { return setPinFilterClass(event.target.value); }} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
            <option value="all">All classes</option>
            {classes.map(function (classItem) { return (<option key={classItem.id} value={classItem.name}>{classItem.name}</option>); })}
          </select>
          <select value={pinFilterGeneratedBy} onChange={function (event) { return setPinFilterGeneratedBy(event.target.value); }} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
            <option value="all">All generators</option>
            {Array.from(new Set(pins.map(function (pin) { return pin.generatedBy; }).filter(Boolean))).map(function (generatedBy) { return (<option key={generatedBy} value={generatedBy}>{generatedBy}</option>); })}
          </select>
          <select value={pinFilterBatch} onChange={function (event) { return setPinFilterBatch(event.target.value); }} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
            <option value="all">All batches</option>
            {Array.from(new Set(pins.map(function (pin) { var _a; return (_a = pin.batch) === null || _a === void 0 ? void 0 : _a.batchName; }).filter(Boolean))).map(function (batchName) { return (<option key={batchName} value={batchName}>{batchName}</option>); })}
          </select>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-border" id="pin-registry">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/60 px-3 py-3 text-sm text-muted">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground">
                <input type="checkbox" checked={pageAllSelected} onChange={handleToggleSelectAll} className="h-4 w-4 rounded border border-border text-brand focus:ring-brand"/>
                {selectedPinIds.length ? "".concat(selectedPinIds.length, " selected") : "Select rows"}
              </div>
              <div className="hidden sm:inline">Use the table to choose rows for print or export.</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={!selectedPinIds.length} onClick={handlePrintSelected} className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-50">
                Print Selected
              </button>
              <button type="button" disabled={!selectedPinIds.length} onClick={handleExportSelected} className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-50">
                Export Selected
              </button>
              <button type="button" disabled className="rounded-lg border border-border bg-background/80 px-3 py-2 text-xs font-semibold text-foreground opacity-50">
                Deactivate Selected
              </button>
              <button type="button" disabled className="rounded-lg border border-border bg-background/80 px-3 py-2 text-xs font-semibold text-foreground opacity-50">
                Delete Selected
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface/60 px-3 py-3 text-sm text-muted">
            <div>
              <span className="text-xs font-semibold text-foreground">Showing {totalFilteredRows} record{totalFilteredRows === 1 ? "" : "s"}</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={function () { return setCurrentPage(function (page) { return Math.max(1, page - 1); }); }} disabled={currentPage === 1 || totalFilteredRows === 0} className="rounded border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground transition hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-50">
                Previous
              </button>
              <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground">
                Page {currentPage} of {pageCount}
              </span>
              <button type="button" onClick={function () { return setCurrentPage(function (page) { return Math.min(pageCount, page + 1); }); }} disabled={currentPage === pageCount || totalFilteredRows === 0} className="rounded border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground transition hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
          {loadingPins ? (<div className="p-4 text-sm text-muted">Loading records...</div>) : totalFilteredRows === 0 ? (<div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="rounded-full border border-border bg-background p-3">
                <lucide_react_1.ShieldOff className="h-5 w-5 text-muted"/>
              </div>
              <div>
                  <p className="text-base font-semibold text-foreground">No student-linked Result PINs have been generated yet.</p>
                  <p className="mt-1 text-sm text-muted">Generate a student PIN or class PIN to see records here.</p>
                </div>
              </div>) : (<div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead className="bg-background/60 text-left text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-3 py-3 font-medium">
                        <label className="inline-flex items-center gap-2">
                          <input type="checkbox" checked={pageAllSelected} onChange={handleToggleSelectAll} className="h-4 w-4 rounded border border-border text-brand focus:ring-0"/>
                          <span className="sr-only">Select all</span>
                        </label>
                      </th>
                      <th className="px-3 py-3 font-medium">PIN</th>
                      <th className="px-3 py-3 font-medium">Student</th>
                      <th className="px-3 py-3 font-medium">Admission No.</th>
                      <th className="px-3 py-3 font-medium">Type</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-3 py-3 font-medium">Session</th>
                      <th className="px-3 py-3 font-medium">Term</th>
                      <th className="px-3 py-3 font-medium">Expiry</th>
                      <th className="px-3 py-3 font-medium">Generated</th>
                      <th className="px-3 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface/60">
                    {pagedPins.map(function (pin) {
                var _a, _b, _c, _d, _e, _f, _g;
                return (<tr key={pin.id} className="align-top">
                        <td className="px-3 py-3">
                          <input type="checkbox" checked={selectedPinIds.includes(pin.id)} onChange={function () { return handleTogglePinSelection(pin.id); }} className="h-4 w-4 rounded border border-border text-brand"/>
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-semibold tracking-[0.2em] text-foreground">{pin.pinValue || '—'}</div>
                          <div className="mt-1 text-xs text-muted">{((_a = pin.batch) === null || _a === void 0 ? void 0 : _a.batchName) || 'Generated individually'}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-medium text-foreground">{pin.student ? "".concat(pin.student.firstName || '', " ").concat(pin.student.lastName || '').trim() : 'Unassigned'}</div>
                          <div className="text-xs text-muted">{((_c = (_b = pin.student) === null || _b === void 0 ? void 0 : _b.class) === null || _c === void 0 ? void 0 : _c.name) || '—'}</div>
                        </td>
                        <td className="px-3 py-3 text-foreground">{((_d = pin.student) === null || _d === void 0 ? void 0 : _d.admissionNo) || '—'}</td>
                        <td className="px-3 py-3">
                          <span className={"rounded-full border px-2.5 py-1 text-xs font-semibold ".concat(getTypeBadgeClass(pin.type || 'GENERIC'))}>
                            {pin.type || 'GENERIC'}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={"rounded-full border px-2.5 py-1 text-xs font-semibold ".concat(getStatusBadgeClass(pin.status || 'ACTIVE'))}>
                            {pin.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-foreground">{((_f = (_e = pin.term) === null || _e === void 0 ? void 0 : _e.academicYear) === null || _f === void 0 ? void 0 : _f.name) || '—'}</td>
                        <td className="px-3 py-3 text-foreground">{((_g = pin.term) === null || _g === void 0 ? void 0 : _g.name) || '—'}</td>
                        <td className="px-3 py-3 text-foreground">{pin.expiresAt ? new Date(pin.expiresAt).toLocaleDateString() : '—'}</td>
                        <td className="px-3 py-3 text-foreground">{pin.generatedAt ? new Date(pin.generatedAt).toLocaleDateString() : '—'}</td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={function () { return handleViewPin(pin); }} className="inline-flex items-center gap-1 rounded border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-100">
                              <lucide_react_1.Eye className="h-3.5 w-3.5"/> View
                            </button>
                            <button type="button" onClick={function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, handleCopyPinValue(pin.pinValue)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }} className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                              <lucide_react_1.Copy className="h-3.5 w-3.5"/> Copy
                            </button>
                            <button type="button" onClick={function () { return handleExportPin(pin.pinValue); }} className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">
                              <lucide_react_1.Download className="h-3.5 w-3.5"/> Export
                            </button>
                          </div>
                        </td>
                      </tr>);
            })}
                  </tbody>
                </table>
              </div>)}
          </div>
        </div>

        <div id="generic-pin-registry" className="mt-4 rounded-lg border border-border bg-surface p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Scratch Card Registry</h2>
              <p className="text-sm text-muted">Generic scratch cards are shown separately and remain unassigned until redeemed.</p>
            </div>
            <div className="text-xs text-muted">Showing {filteredGenericPins.length} scratch card{filteredGenericPins.length === 1 ? "" : "s"}</div>
          </div>

          {filteredGenericPins.length === 0 ? (<div className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted">
              No generic scratch cards match the current filters.
            </div>) : (<div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-background/60 text-left text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-3 font-medium">PIN</th>
                    <th className="px-3 py-3 font-medium">Batch</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Session</th>
                    <th className="px-3 py-3 font-medium">Term</th>
                    <th className="px-3 py-3 font-medium">Generated</th>
                    <th className="px-3 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface/60">
                  {filteredGenericPins.map(function (pin) {
                var _a, _b, _c, _d;
                return (<tr key={pin.id} className="align-top">
                      <td className="px-3 py-3">
                        <div className="font-semibold tracking-[0.2em] text-foreground">{pin.pinValue || '—'}</div>
                      </td>
                      <td className="px-3 py-3 text-foreground">{((_a = pin.batch) === null || _a === void 0 ? void 0 : _a.batchName) || '—'}</td>
                      <td className="px-3 py-3">
                        <span className={"rounded-full border px-2.5 py-1 text-xs font-semibold ".concat(getStatusBadgeClass(pin.status || 'ACTIVE'))}>
                          {pin.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-foreground">{((_c = (_b = pin.term) === null || _b === void 0 ? void 0 : _b.academicYear) === null || _c === void 0 ? void 0 : _c.name) || '—'}</td>
                      <td className="px-3 py-3 text-foreground">{((_d = pin.term) === null || _d === void 0 ? void 0 : _d.name) || '—'}</td>
                      <td className="px-3 py-3 text-foreground">{pin.generatedAt ? new Date(pin.generatedAt).toLocaleDateString() : '—'}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={function () { return handleViewPin(pin); }} className="inline-flex items-center gap-1 rounded border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-100">
                            <lucide_react_1.Eye className="h-3.5 w-3.5"/> View
                          </button>
                          <button type="button" onClick={function () { return handlePrintPin(pin); }} className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100">
                            <lucide_react_1.Printer className="h-3.5 w-3.5"/> Print
                          </button>
                          <button type="button" onClick={function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, handleCopyPinValue(pin.pinValue)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                }); }); }} className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                            <lucide_react_1.Copy className="h-3.5 w-3.5"/> Copy
                          </button>
                        </div>
                      </td>
                    </tr>);
            })}
                </tbody>
              </table>
            </div>)}
        </div>

        <div id="student-pin-form" className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <lucide_react_1.Sparkles className="h-5 w-5 text-brand"/>
            <h2 className="text-lg font-semibold text-foreground">Generate Student PIN</h2>
          </div>
          <form onSubmit={handleGenerateStudentPin} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Student</label>
                <select value={studentId} onChange={function (event) { return setStudentId(event.target.value); }} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50" required>
                  <option value="">Select a student</option>
                  {filteredStudents.map(function (student) { return (<option key={student.id} value={student.id}>
                      {"".concat(student.firstName || "", " ").concat(student.lastName || "").trim() || student.admissionNo || student.id}
                    </option>); })}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Session / Term</label>
                <select value={selectedTermId} onChange={function (event) {
            setSelectedTermId(event.target.value);
            setSelectedAssessmentId("");
        }} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50">
                  <option value="">Optional term</option>
                  {sessions.length > 0 ? (sessions.map(function (session) { return (<optgroup key={session.id} label={session.name}>
                        {session.terms.map(function (term) { return (<option key={term.id} value={term.id}>
                            {term.name}
                          </option>); })}
                      </optgroup>); })) : (terms.map(function (term) { return (<option key={term.id} value={term.id}>
                        {term.academicYearName ? "".concat(term.academicYearName, " \u2022 ").concat(term.name) : term.name}
                      </option>); }))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Assessment</label>
              <select value={selectedAssessmentId} onChange={function (event) {
            var _a;
            var nextAssessmentId = event.target.value;
            setSelectedAssessmentId(nextAssessmentId);
            if (!nextAssessmentId) {
                setSelectedTermId("");
                return;
            }
            var assessment = assessments.find(function (item) { return item.id === nextAssessmentId; });
            if ((_a = assessment === null || assessment === void 0 ? void 0 : assessment.term) === null || _a === void 0 ? void 0 : _a.id) {
                setSelectedTermId(assessment.term.id);
            }
        }} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50">
                <option value="">Optional assessment</option>
                {filteredAssessments.map(function (assessment) { return (<option key={assessment.id} value={assessment.id}>
                    {assessment.name}
                  </option>); })}
              </select>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={submittingStudent || !(status === null || status === void 0 ? void 0 : status.enabled)} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60">
                <lucide_react_1.Sparkles className="h-4 w-4"/>
                {submittingStudent ? "Generating..." : "Generate student PIN"}
              </button>
              <button type="button" onClick={handleStudentPrintClick} disabled={!(generatedStudent === null || generatedStudent === void 0 ? void 0 : generatedStudent.pin) && !studentId} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-60">
                <lucide_react_1.Printer className="h-4 w-4"/>
                Print sheet
              </button>
            </div>
          </form>

          {classPinError ? (<div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {classPinError}
            </div>) : null}

          {classPinSummary ? (<div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {classPinSummary}
            </div>) : null}
        </div>

        <div id="class-pin-form" className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <lucide_react_1.Printer className="h-5 w-5 text-brand"/>
            <h2 className="text-lg font-semibold text-foreground">Generate Class PINs</h2>
          </div>
          <form onSubmit={handleGenerateClassPins} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Class</label>
                <select value={selectedClassId} onChange={function (event) {
            setSelectedClassId(event.target.value);
        }} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50" required>
                  <option value="">Select a class</option>
                  {classes.map(function (classItem) { return (<option key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </option>); })}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Session / Term</label>
                <select value={selectedTermId} onChange={function (event) {
            setSelectedTermId(event.target.value);
            setSelectedAssessmentId("");
        }} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50">
                  <option value="">Optional term</option>
                  {sessions.length > 0 ? (sessions.map(function (session) { return (<optgroup key={session.id} label={session.name}>
                        {session.terms.map(function (term) { return (<option key={term.id} value={term.id}>
                            {term.name}
                          </option>); })}
                      </optgroup>); })) : (terms.map(function (term) { return (<option key={term.id} value={term.id}>
                        {term.academicYearName ? "".concat(term.academicYearName, " \u2022 ").concat(term.name) : term.name}
                      </option>); }))}
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted">
              {selectedClassId ? (<>
                  {selectedClassStudentCount} active student{selectedClassStudentCount === 1 ? "" : "s"} will receive PINs for this class.
                </>) : ("Select a class to preview the student count.")}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Assessment</label>
              <select value={selectedAssessmentId} onChange={function (event) {
            var _a;
            var nextAssessmentId = event.target.value;
            setSelectedAssessmentId(nextAssessmentId);
            if (!nextAssessmentId) {
                setSelectedTermId("");
                return;
            }
            var assessment = assessments.find(function (item) { return item.id === nextAssessmentId; });
            if ((_a = assessment === null || assessment === void 0 ? void 0 : assessment.term) === null || _a === void 0 ? void 0 : _a.id) {
                setSelectedTermId(assessment.term.id);
            }
        }} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50">
                <option value="">Optional assessment</option>
                {filteredAssessments.map(function (assessment) { return (<option key={assessment.id} value={assessment.id}>
                    {assessment.name}
                  </option>); })}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Format</label>
                <select value={pinFormat} onChange={function (event) { return setPinFormat(event.target.value); }} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50">
                  <option value="XXXX-XXXX">XXXX-XXXX</option>
                  <option value="XXXX-XXXX-XXXX">XXXX-XXXX-XXXX</option>
                  <option value="ALPHA-NUMERIC">Alpha-numeric</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Length</label>
                <input type="number" min={4} max={12} value={pinLength} onChange={function (event) { return setPinLength(Number(event.target.value)); }} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"/>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={submittingClass || !(status === null || status === void 0 ? void 0 : status.enabled)} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60">
                <lucide_react_1.Printer className="h-4 w-4"/>
                {submittingClass ? "Generating..." : "Generate & Print Class PINs"}
              </button>
            </div>
          </form>
        </div>

          {/** Generated student modal moved to end to avoid JSX adjacency issues */}
        <div id="batch-pin-form" className="rounded-lg border border-border bg-surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <lucide_react_1.Sparkles className="h-5 w-5 text-brand"/>
            <h2 className="text-lg font-semibold text-foreground">Generate Scratch Cards</h2>
          </div>
          <form onSubmit={handleGenerateBatch} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Quantity</label>
                <input type="number" min={1} max={250} value={quantity} onChange={function (event) { return setQuantity(Number(event.target.value)); }} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50" required/>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Batch name</label>
                <input value={batchName} onChange={function (event) { return setBatchName(event.target.value); }} placeholder="Optional batch label" className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"/>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Format</label>
                <select value={pinFormat} onChange={function (event) { return setPinFormat(event.target.value); }} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50">
                  <option value="XXXX-XXXX">XXXX-XXXX</option>
                  <option value="XXXX-XXXX-XXXX">XXXX-XXXX-XXXX</option>
                  <option value="ALPHA-NUMERIC">Alpha-numeric</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Length</label>
                <input type="number" min={4} max={12} value={pinLength} onChange={function (event) { return setPinLength(Number(event.target.value)); }} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"/>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={submittingBatch || !(status === null || status === void 0 ? void 0 : status.enabled)} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60">
                <lucide_react_1.Sparkles className="h-4 w-4"/>
                {submittingBatch ? "Generating..." : "Generate batch"}
              </button>
              <button type="button" onClick={handleExportBatch} disabled={!((_a = generatedBatch === null || generatedBatch === void 0 ? void 0 : generatedBatch.pins) === null || _a === void 0 ? void 0 : _a.length)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-60">
                <lucide_react_1.Download className="h-4 w-4"/>
                Export TXT
              </button>
            </div>
          </form>

          {generatedBatch ? (<div className="mt-4 rounded-lg border border-border bg-background p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-foreground">Generated {((_b = generatedBatch.batch) === null || _b === void 0 ? void 0 : _b.quantity) || 0} PINs</p>
                <button type="button" onClick={handleExportBatch} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/30">
                  <lucide_react_1.Download className="h-4 w-4"/>
                  Export TXT
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {(_c = generatedBatch.pins) === null || _c === void 0 ? void 0 : _c.slice(0, 10).map(function (entry) { return (<div key={entry.recordId} className="rounded border border-border bg-background/70 px-3 py-2 font-mono text-sm text-foreground">
                    {entry.pin}
                  </div>); })}
              </div>
            </div>) : null}

          {generatedStudent ? (<GeneratedPinModal data={generatedStudent} schoolMeta={schoolMeta} onClose={function () { return setGeneratedStudent(null); }} onPrint={function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, handlePrintSheet()];
                        case 1:
                            _a.sent();
                            setGeneratedStudent(null);
                            return [2 /*return*/];
                    }
                });
            }); }} onCopy={function () { return __awaiter(_this, void 0, void 0, function () {
                var err_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(generatedStudent === null || generatedStudent === void 0 ? void 0 : generatedStudent.pin))
                                return [2 /*return*/];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, navigator.clipboard.writeText(generatedStudent.pin)];
                        case 2:
                            _a.sent();
                            setStatusModal({ open: true, type: "success", title: "PIN copied", message: "Copied ".concat(generatedStudent.pin, " to clipboard.") });
                            return [3 /*break*/, 4];
                        case 3:
                            err_8 = _a.sent();
                            console.error('Copy failed', err_8);
                            setError('Unable to copy PIN to clipboard.');
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); }}/>) : null}
      </div>
    </div>);
}
