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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var axios = require('axios');
var rest_1 = require("@octokit/rest");
var buffer_1 = require("buffer");
var GITHUB_TOKEN = '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';
var owner = 'hinge-health';
var repo = 'mics-bypass-approval';
var baseBranch = 'main';
var octokit = new rest_1.Octokit({
    auth: GITHUB_TOKEN,
});
function getWorkflowIds() {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios.get("https://api.github.com/repos/".concat(owner, "/").concat(repo, "/actions/workflows"), {
                            headers: {
                                Authorization: "Bearer ".concat(GITHUB_TOKEN),
                            },
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.workflows.map(function (workflow) { return workflow.id; })];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error getting workflow IDs:', error_1);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getWorkflowRuns(workflowId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios.get("https://api.github.com/repos/".concat(owner, "/").concat(repo, "/actions/workflows/").concat(workflowId, "/runs"), {
                            headers: {
                                Authorization: "Bearer ".concat(GITHUB_TOKEN),
                            },
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.workflow_runs];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error getting workflow runs:', error_2);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function checkAllWorkflowRuns(pullRequestNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var workflowIds, _i, workflowIds_1, workflowId, workflowRuns, _a, workflowRuns_1, run, allWorkflowRunsCompletedAndPassed, error_3;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, getWorkflowIds()];
                case 1:
                    workflowIds = _b.sent();
                    _i = 0, workflowIds_1 = workflowIds;
                    _b.label = 2;
                case 2:
                    if (!(_i < workflowIds_1.length)) return [3 /*break*/, 5];
                    workflowId = workflowIds_1[_i];
                    return [4 /*yield*/, getWorkflowRuns(workflowId)];
                case 3:
                    workflowRuns = _b.sent();
                    for (_a = 0, workflowRuns_1 = workflowRuns; _a < workflowRuns_1.length; _a++) {
                        run = workflowRuns_1[_a];
                        console.log("Workflow \"".concat(run.workflow.name, "\" - Status: ").concat(run.status, ", Conclusion: ").concat(run.conclusion));
                    }
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    allWorkflowRunsCompletedAndPassed = workflowIds.every(function (workflowId) { return __awaiter(_this, void 0, void 0, function () {
                        var workflowRuns;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, getWorkflowRuns(workflowId)];
                                case 1:
                                    workflowRuns = _a.sent();
                                    return [2 /*return*/, workflowRuns.every(function (run) { return run.status === 'completed' && run.conclusion === 'success'; })];
                            }
                        });
                    }); });
                    return [2 /*return*/, allWorkflowRunsCompletedAndPassed];
                case 6:
                    error_3 = _b.sent();
                    console.error('Error checking workflow runs:', error_3);
                    return [2 /*return*/, false];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function createPullRequest() {
    return __awaiter(this, void 0, void 0, function () {
        var newBranchName, baseBranchInfo, existingFile, currentFileSHA, fileContent, base64Content, pr, maxWaitAttempts, currentAttempt, runsPassed, workflowRunStatus, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 14, , 15]);
                    newBranchName = 'final-poc-submit-2';
                    return [4 /*yield*/, octokit.repos.getBranch({
                            owner: owner,
                            repo: repo,
                            branch: baseBranch,
                        })];
                case 1:
                    baseBranchInfo = _a.sent();
                    return [4 /*yield*/, octokit.git.createRef({
                            owner: owner,
                            repo: repo,
                            ref: "refs/heads/".concat(newBranchName),
                            sha: baseBranchInfo.data.commit.sha,
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, octokit.repos.getContent({
                            owner: owner,
                            repo: repo,
                            path: 'sample2.txt',
                            ref: newBranchName,
                        })];
                case 3:
                    existingFile = _a.sent();
                    currentFileSHA = existingFile.data.sha;
                    fileContent = 'check if workflows are passed.';
                    base64Content = buffer_1.Buffer.from(fileContent).toString('base64');
                    return [4 /*yield*/, octokit.repos.createOrUpdateFileContents({
                            owner: owner,
                            repo: repo,
                            path: 'sample2.txt',
                            message: 'Commit message sample',
                            content: base64Content,
                            branch: newBranchName,
                            sha: currentFileSHA,
                        })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, octokit.pulls.create({
                            owner: owner,
                            repo: repo,
                            title: 'JIRA-137-PR-DEMO-NEW',
                            head: newBranchName,
                            base: baseBranch,
                            body: 'Pull Request and merge using octokit ',
                        })];
                case 5:
                    pr = _a.sent();
                    console.log('Pull Request created:', pr.data.html_url);
                    console.log('Waiting for all workflow runs to complete...');
                    maxWaitAttempts = 10;
                    currentAttempt = 0;
                    runsPassed = false;
                    _a.label = 6;
                case 6:
                    if (!(currentAttempt < maxWaitAttempts)) return [3 /*break*/, 9];
                    return [4 /*yield*/, checkAllWorkflowRuns(pr.data.number)];
                case 7:
                    workflowRunStatus = _a.sent();
                    console.log('Workflow run statuses:', workflowRunStatus);
                    if (workflowRunStatus) {
                        console.log('All workflow runs passed.');
                        runsPassed = true;
                        return [3 /*break*/, 9];
                    }
                    console.log('Workflow runs are not yet completed or did not pass. Waiting...');
                    console.log('Current attempt:', currentAttempt + 1);
                    currentAttempt++;
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 60000); })];
                case 8:
                    _a.sent(); // Wait for 1 minute
                    return [3 /*break*/, 6];
                case 9:
                    if (!runsPassed) return [3 /*break*/, 11];
                    return [4 /*yield*/, octokit.pulls.merge({
                            owner: owner,
                            repo: repo,
                            pull_number: pr.data.number,
                            merge_method: 'merge',
                        })];
                case 10:
                    _a.sent();
                    console.log('Pull Request merged.');
                    return [3 /*break*/, 12];
                case 11:
                    console.log('Workflow runs did not pass. Pull request will not be merged.');
                    _a.label = 12;
                case 12: return [4 /*yield*/, octokit.git.deleteRef({
                        owner: owner,
                        repo: repo,
                        ref: "heads/".concat(newBranchName),
                    })];
                case 13:
                    _a.sent();
                    console.log('Feature branch deleted.');
                    return [3 /*break*/, 15];
                case 14:
                    error_4 = _a.sent();
                    console.error('Error:', error_4);
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    });
}
createPullRequest();
