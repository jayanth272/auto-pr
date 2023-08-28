const axios = require('axios');
import { Octokit } from '@octokit/rest';
import { Buffer } from 'buffer';

const GITHUB_TOKEN = 'ACCESS TOKEN';
const owner = 'hinge-health';
const repo = 'mics-bypass-approval';
const baseBranch = 'main';
const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

async function getWorkflowIds() {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/actions/workflows`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });
    return response.data.workflows.map((workflow: any) => workflow.id);
  } catch (error) {
    console.error('Error getting workflow IDs:', error);
    return [];
  }
}

async function getWorkflowRuns(workflowId: number) {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });
    return response.data.workflow_runs;
  } catch (error) {
    console.error('Error getting workflow runs:', error);
    return [];
  }
}

async function checkAllWorkflowRuns(pullRequestNumber: number) {
  try {
    const workflowIds = await getWorkflowIds();

    for (const workflowId of workflowIds) {
      const workflowRuns = await getWorkflowRuns(workflowId);

      for (const run of workflowRuns) {
        console.log(`Workflow "${run.workflow.name}" - Status: ${run.status}, Conclusion: ${run.conclusion}`);
      }
    }

    const allWorkflowRunsCompletedAndPassed = workflowIds.every(async (workflowId: number) => {
      const workflowRuns = await getWorkflowRuns(workflowId);
      return workflowRuns.every((run: any) => run.status === 'completed' && run.conclusion === 'success');
    });

    return allWorkflowRunsCompletedAndPassed;
  } catch (error) {
    console.error('Error checking workflow runs:', error);
    return false;
  }
}

async function createPullRequest() {
  try {
    const newBranchName = 'final-poc-submit-2';
    const baseBranchInfo = await octokit.repos.getBranch({
      owner,
      repo,
      branch: baseBranch,
    });

    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${newBranchName}`,
      sha: baseBranchInfo.data.commit.sha,
    });

    const existingFile = await octokit.repos.getContent({
      owner,
      repo,
      path: 'sample2.txt',
      ref: newBranchName,
    });
    const currentFileSHA = (existingFile.data as any).sha;

    const fileContent = 'check if workflows are passed.';
    const base64Content = Buffer.from(fileContent).toString('base64');

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'sample2.txt',
      message: 'Commit message sample',
      content: base64Content,
      branch: newBranchName,
      sha: currentFileSHA,
    });

    const pr = await octokit.pulls.create({
      owner,
      repo,
      title: 'JIRA-137-PR-DEMO-NEW',
      head: newBranchName,
      base: baseBranch,
      body: 'Pull Request and merge using octokit ',
    });

    console.log('Pull Request created:', pr.data.html_url);

    console.log('Waiting for all workflow runs to complete...');
    const maxWaitAttempts = 10;
    let currentAttempt = 0;
    let runsPassed = false;

    while (currentAttempt < maxWaitAttempts) {
      const workflowRunStatus = await checkAllWorkflowRuns(pr.data.number);

      console.log('Workflow run statuses:', workflowRunStatus);

      if (workflowRunStatus) {
        console.log('All workflow runs passed.');
        runsPassed = true;
        break;
      }

      console.log('Workflow runs are not yet completed or did not pass. Waiting...');
      console.log('Current attempt:', currentAttempt + 1);

      currentAttempt++;
      await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait for 1 minute
    }

    if (runsPassed) {
      await octokit.pulls.merge({
        owner,
        repo,
        pull_number: pr.data.number,
        merge_method: 'merge',
      });
      console.log('Pull Request merged.');
    } else {
      console.log('Workflow runs did not pass. Pull request will not be merged.');
    }

    await octokit.git.deleteRef({
      owner,
      repo,
      ref: `heads/${newBranchName}`,
    });
    console.log('Feature branch deleted.');
  } catch (error) {
    console.error('Error:', error);
  }
}

createPullRequest();
