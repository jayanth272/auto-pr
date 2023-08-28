import { Octokit } from '@octokit/rest';
import { Buffer } from 'buffer';
import { graphql } from "@octokit/graphql";
//  GitHub personal access token
const GITHUB_TOKEN = 'ACCESS TOKEN';

// repository details
const owner = 'hinge-health';
const repo = 'mics-bypass-approval';
const baseBranch = 'main'; //  base branch name

// Initialize Octokit with your personal access token
const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});
const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `Bearer ${GITHUB_TOKEN}`,
  },
});

const convertToDraftQuery = `
  mutation ConvertPullRequestToDraft($input: ConvertPullRequestToDraftInput!) {
    convertPullRequestToDraft(input: $input) {
      clientMutationId
    }
  }
`;

async function checkCiStatus(pullRequestNumber: number) {
  try {
    const { data: checkRuns } = await octokit.checks.listForRef({ //octokit function for CI check.
      owner,
      repo,
      ref: `pull/${pullRequestNumber}/merge`,
    });
    
    const allChecksPassed = checkRuns.check_runs.every((run) => run.status === 'completed' && run.conclusion === 'success');
    

    return allChecksPassed;
  } catch (error) {
    console.error('Error checking CI status:', error);
    return false;
  }
}

async function createPullRequest(this: any) {
  try {
    // Create a new branch
    const newBranchName = 'final-poc-submit-1'; // desired branch name
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

    // Modify or create a file in the new branch
    // Fetch the current SHA of the file, convert sha to string.
    const existingFile = await octokit.repos.getContent({
      owner,
      repo,
      path: 'sample2.txt',
      ref: newBranchName, // Use the same branch where you're making changes
    });
    const currentFileSHA = (existingFile.data as any).sha;

    // Commit the changes to the new branch

    const fileContent = 'DEMO VIDEO for PR bypass branch protection: JIRA 137';
    const base64Content = Buffer.from(fileContent).toString('base64');

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'sample2.txt', // Path of file to change
      message: 'Commit message sample',
      content: base64Content, // content 
      branch: newBranchName,
      sha: currentFileSHA,
    });
    
    // Create a pull request
    const pr = await octokit.pulls.create({
      owner,
      repo,
      title: 'JIRA-137-PR-DEMO-VIDEO',
      head: newBranchName,
      base: baseBranch,
      body: 'Pull Request and merge using octokit ',
    });

    console.log('Pull Request created:', pr.data.number);
    await octokit.issues.addLabels({
      owner,
      repo,
      issue_number: pr.data.number,
      labels: ['needs-manual-fix']
    });
    const convertToDraftVariables = {
      input: {
        pullRequestId: pr.data.number, // Replace with the actual pull request ID
      },
    };

    const convertToDraftResponse = await graphqlWithAuth(convertToDraftQuery, convertToDraftVariables);

    console.log('Pull request converted to draft:', convertToDraftResponse);
    octokit.issues.addAssignees({
      owner,
      repo,
      issue_number: pr.data.number,
      assignees: ['jayanth272']
    });
    // Wait for CI checks to complete
    console.log('Waiting for CI checks to complete...');
    const maxWaitAttempts = 10;
    let currentAttempt = 0;
    let checksPassed = false;

    while (currentAttempt < maxWaitAttempts) {
      checksPassed = await checkCiStatus(pr.data.number);

      if (checksPassed) {
        console.log('All CI checks passed.');
        break;
      }

      console.log('CI checks are not yet completed or did not pass. Waiting...');
      currentAttempt++;
      await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait for 1 minute
    }

    /*if (checksPassed) {
      // Merge the pull request
      await octokit.pulls.merge({
        owner,
        repo,
        pull_number: pr.data.number,
        merge_method: 'merge', // Change this to 'rebase' or 'squash' as needed
      });
      console.log('Pull Request merged.');
      
    } else {
      console.log('CI checks did not pass. Pull request will not be merged.');
    }
    //Delete Branch 
    await octokit.git.deleteRef({
      owner,
      repo,
      ref: `heads/${newBranchName}`,
    });
    console.log('Feature branch deleted.');*/
  } 
  catch (error) {
    console.error('Error:', error);
  }
}

createPullRequest();
