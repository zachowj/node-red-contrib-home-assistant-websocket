# Contributing to Node Red Home Assistant

Please take a moment to review this document in order to make the contribution process easy and effective for everyone involved.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

## Using the issue tracker

The issue tracker is the preferred channel for [bug reports](#bug-reports), [features requests](#features-requets) and [submitting pull requests](#pull-requests). Currently [support issues](#support-issues) are acceptable in the issue tracker as well although this may change in the future to cut down on the noise.

## Bug reports

A bug is a _demonstrable problem_ that is caused by the code in the repository. Good bug reports are extremely helpful - thank you!

Guidelines for bug reports:

1. **Use the GitHub issue search** &mdash; check if the issue has already been reported.
2. **Check if the issue has been fixed** &mdash; try to reproduce it using the latest `dev` branch in the repository.
3. **Isolate the problem** &mdash; ideally create a reduced test case, an example flow in node-red that you can add to the issue is preferred.

A good bug report shouldn't leave others needing to chase you up for more information. Please try to be as detailed as possible in your report. What is your environment? What steps will reproduce the issue? What OS experiences the problem? What would you expect to be the outcome? All these details will help people to fix any potential bugs. Fill out all the information you can when presented with the Bug Issue template.

## Feature requests

Feature requests are welcome. But take a moment to find out whether your idea fits with the scope and aims of the project. It's up to _you_ to make a strong case to convince the project's developers of the merits of this feature. Please provide as much detail and context as possible.

## Pull requests

Good pull requests - patches, improvements, new features - are a fantastic help. They should remain focused in scope and avoid containing unrelated commits.

**Please ask first** before embarking on any significant pull request (e.g. implementing features, refactoring code), otherwise you risk spending a lot of time working on something that the project's developers might not want to merge into the project.

### For new Contributors

If you never created a pull request before, welcome :tada: :smile: [Here is a great tutorial](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github) on how to send one :)

1. [Fork](http://help.github.com/fork-a-repo/) the project, clone your fork, and configure the remotes:

   ```bash
   # Clone your fork of the repo into the current directory
   git clone https://github.com/<your-username>/<repo-name>
   # Navigate to the newly cloned directory
   cd <repo-name>
   # Assign the original repo to a remote called "upstream"
   git remote add upstream https://github.com/zachowj/node-red-contrib-home-assistant-websocket
   ```

2. If you cloned a while ago, get the latest changes from upstream:

   ```bash
   git checkout dev
   git pull upstream dev
   ```

3. Create a new topic branch (off the main project development branch) to contain your feature, change, or fix:

   ```bash
   git checkout -b <topic-branch-name>
   ```

4. If you added or changed a feature, make sure to document it accordingly in the `README.md` file.

5. Push your topic branch up to your fork:

   ```bash
   git push origin <topic-branch-name>
   ```

6. [Open a Pull Request](https://help.github.com/articles/using-pull-requests/) with a clear title and description.

## Support Issues

At some point, if the need is apparent, the project may get another venue to foster discussion and help each other with support issues at which point support issues will no longer be accepted in the github issues interface. Until that happens feel free to submit your support issues if they are unique and you are stuck.

Examples of support issues are thing like server communication errors, something that only happens "in your environment" (not directly code related). A lot of support issues have already been logged and solved so make sure to search previous issues (including closed issues) first and also read the README.md file here. If applicable please fully document how the issue was resolved, this will help others in the future.
