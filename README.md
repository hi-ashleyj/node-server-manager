# Node Server Manager  
  
A manager for other node services, built using node.  
This project was build with the intent of being deployed on a Raspberry Pi, to make deployment a little easier.  
Built on the foundations of `hi-ashleyj/rpi-ws-manager`, so some functionality is missing or programmed strangely.  
  
## Licencing  
For use in commerical environments, please contact me first. May be used freely for home/personal usage (i use it to manage a couple of discord bots that are only in a couple of servers of close friends).  
You may modify it to your own personal taste or create derivative works from scratch. Please do not distribute modified versions of the original tool. If you've made changes you'd like the world to see, submit a pull request, or get in touch.
  
## Installation  
1. Create a main directory for node-server-manager (from now referred to as root or /)  
2. Create subdirectories:  
    - node  
    - git  
    - app  
    - store  
3. Save this application in /app  
4. Copy a portable version of git to /git  
5. Copy a portable version of node to /node  
6. Run /app/install-packages.cmd (or npm ci in /app) - this should install all required packages for app to run  

### First Time Setup  
1. Login with the default username:password of admin:administrator  
2. Click on the user icon in the bottom left  
3. Use the prompts to create new users and assign them admin permissions  
4. Sign out and sign in again with a different admin account  
5. Remove the default admin account  

#### PERMISSION LEVELS  
These are ordered by elevation, where permissions higher in the list also have permissions from those lower in the list  
In addition, any methods that require authentication in this guide are marked before their numbered steps.  
ADMIN - Admin Permissions allow the user to create users, edit users, and delete users, as well as reset passwords to default values.  
CONFIGURE - Configure Permissions allow the user to create new servers, edit existing servers, and run "script" jobs such as installing packages and git pull/clone.  
MANAGE - Manage Permissions allow the user to start and stop all servers.  
UNAUTHENTICATED - Unauthenticated users can view servers, their ports, whether they are running, server logs, and NSM logs.  
   
## MIGRATING / UPDATING SERVERS  
Note: this requires being signed in with "Configure" permissions  
1. Select either the test or production environments for the server  
2. If the environment is running, stop it in order to view the list of commands  
  
 - LOADING SOURCE CODE (FIRST TIME)  
   3. Choose `git clone` to pull the source code down from the configured repository  
   4. Choose `npm ci --production --no-optional` to install packages and dependencies  

 - UPDATING SOURCE CODE (SUBSEQUENT TIMES)  
   3. Choose `git pull` to pull changes down from the repository. Note: after cloning, changing the repository on the web console does not update the repository remote  
   4. If packages have changed, run `npm ci --production --no-optional` to reinstall packages and dependencies  
