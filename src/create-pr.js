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
var rest_1 = require("@octokit/rest");
var buffer_1 = require("buffer");
var graphql_1 = require("@octokit/graphql");
//  GitHub personal access token
var GITHUB_TOKEN = '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';
// repository details
var owner = 'hinge-health';
var repo = 'mics-bypass-approval';
var baseBranch = 'main'; //  base branch name
// Initialize Octokit with your personal access token
var octokit = new rest_1.Octokit({
    auth: GITHUB_TOKEN,
});
var graphqlWithAuth = graphql_1.graphql.defaults({
    headers: {
        authorization: "Bearer ".concat(GITHUB_TOKEN),
    },
});
var convertToDraftQuery = "\n  mutation ConvertPullRequestToDraft($input: ConvertPullRequestToDraftInput!) {\n    convertPullRequestToDraft(input: $input) {\n      clientMutationId\n    }\n  }\n";
function checkCiStatus(pullRequestNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var checkRuns, allChecksPassed, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, octokit.checks.listForRef({
                            owner: owner,
                            repo: repo,
                            ref: "pull/".concat(pullRequestNumber, "/merge"),
                        })];
                case 1:
                    checkRuns = (_a.sent()).data;
                    allChecksPassed = checkRuns.check_runs.every(function (run) { return run.status === 'completed' && run.conclusion === 'success'; });
                    return [2 /*return*/, allChecksPassed];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error checking CI status:', error_1);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function createPullRequest() {
    return __awaiter(this, void 0, void 0, function () {
        var newBranchName, baseBranchInfo, existingFile, currentFileSHA, fileContent, base64Content, pr, convertToDraftVariables, convertToDraftResponse, maxWaitAttempts, currentAttempt, checksPassed, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 12, , 13]);
                    newBranchName = 'final-poc-submit-1';
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
                            ref: newBranchName, // Use the same branch where you're making changes
                        })];
                case 3:
                    existingFile = _a.sent();
                    currentFileSHA = existingFile.data.sha;
                    fileContent = 'DEMO VIDEO for PR bypass branch protection: JIRA 137';
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
                            title: 'JIRA-137-PR-DEMO-VIDEO',
                            head: newBranchName,
                            base: baseBranch,
                            body: 'Pull Request and merge using octokit ',
                        })];
                case 5:
                    pr = _a.sent();
                    console.log('Pull Request created:', pr.data.number);
                    return [4 /*yield*/, octokit.issues.addLabels({
                            owner: owner,
                            repo: repo,
                            issue_number: pr.data.number,
                            labels: ['needs-manual-fix']
                        })];
                case 6:
                    _a.sent();
                    convertToDraftVariables = {
                        input: {
                            pullRequestId: pr.data.number, // Replace with the actual pull request ID
                        },
                    };
                    return [4 /*yield*/, graphqlWithAuth(convertToDraftQuery, convertToDraftVariables)];
                case 7:
                    convertToDraftResponse = _a.sent();
                    console.log('Pull request converted to draft:', convertToDraftResponse);
                    octokit.issues.addAssignees({
                        owner: owner,
                        repo: repo,
                        issue_number: pr.data.number,
                        assignees: ['jayanth272']
                    });
                    // Wait for CI checks to complete
                    console.log('Waiting for CI checks to complete...');
                    maxWaitAttempts = 10;
                    currentAttempt = 0;
                    checksPassed = false;
                    _a.label = 8;
                case 8:
                    if (!(currentAttempt < maxWaitAttempts)) return [3 /*break*/, 11];
                    return [4 /*yield*/, checkCiStatus(pr.data.number)];
                case 9:
                    checksPassed = _a.sent();
                    if (checksPassed) {
                        console.log('All CI checks passed.');
                        return [3 /*break*/, 11];
                    }
                    console.log('CI checks are not yet completed or did not pass. Waiting...');
                    currentAttempt++;
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 60000); })];
                case 10:
                    _a.sent(); // Wait for 1 minute
                    return [3 /*break*/, 8];
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_2 = _a.sent();
                    console.error('Error:', error_2);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
createPullRequest();
