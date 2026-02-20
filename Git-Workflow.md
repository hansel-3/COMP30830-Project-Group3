# COMP30830-Group-Project-Workflow
This project involves the development and implementation of a web application for bike sharing in Dublin city, Ireland. 

## Git Workflow (feature branches)
This project will use a **feature branch workflow** to keep the main branch stable. Please follow these steps. Wherever there is a `<branch>`, replace with `feature-<name>`, where \<name> is a descriptive name eg. feature-login, feature-user-profile. **Always use this naming convention for naming feature branches**.

## 1. Ensure you are on main branch


`git checkout main`***(redirects you to main branch)***  

`git pull origin main` ***(always pull before making a new branch and just before pushing to main branch)***

      
## 2. Creating the feature branch

When developing a new feature, begin by creating a feature branch:


`git checkout -b <branch>` ***(replace \<branch> with a descriptive name as described above)***

This will create a branch called "\<branch>" locally on your machine and move you inside this branch.   

Push this branch to GitHub by running:  

`git push origin <branch>` 

## 3. Edit locally  
Once the branch is created and pushed to GitHub, move into it and edit files locally on your machine (eg. in VSCode).  

`git checkout <branch>` ***(move into feature branch)***

## 4. Push to GitHub  

When done editing, commit and push to GitHub:

 `git add .` ***(add all changes to staging area)***  or `git add <filename>` ***(add specific file to staging area)***  

 `git commit -m "insert message here"` ***(commit changes - always insert commit message)***   

`git push origin <branch>` ***(push changes to GitHub - always push commits into your feature branch, not the main branch)***

\* you may also create the feature branch and begin editing files in there before pushing the branch to GitHub.\*

## 5. Merging feature branch to main branch

Once you have fully developed your feature, you can now merge the feature branch with the main code:  
* Click **Compare & pull request** button.  
* Add a title and a short description of the changes you made. Click **Create pull request**.  
* Go to the **Pull requests** tab to see the request. One member from the group should ensure that there are no conflicts with main branch.  
* If none, click **Merge pull request**. 

The feature branch is now merged with the main branch. You can also achieve this in the command prompt:

`git checkout main` ***(move to main branch)***  

`git pull` ***(always pull before making changes to main branch)*** 

`git checkout <branch>` ***(move to feature branch)***  

`git merge main` ***(merge branch locally)***  

`git push origin <branch>` ***(this opens up pull request on GitHub - complete on GitHub as described above)***

## 6. Clean up feature branch

After merging, it is good practice to delete the feature branch:  

`git checkout main` ***(move to main branch)***  

`git branch -d <branch>` ***(local deletion)***  

`git push origin --delete <branch>` ***(remote deletion)***  


Follow these same steps when implementing bug fixes as well. The naming convention for a bug fix branch should be `bugfix-<name-of-bugfix>` (always use descriptive names eg. bugfix-login-error).