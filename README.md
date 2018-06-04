# alexa-experiment    https://serverless.com/blog/how-to-manage-your-alexa-skills-with-serverless/

First time setup:
``
npm install -g serverless
sls plugin install -n serverless-alexa-skills
``

# Alexa Skill Info

- Set up "Login with Amazon" in developer console (developer.amazon.com > Apps & Services > Login with Amazon):
https://developer.amazon.com/lwa/sp/overview.html

- Save Client ID, Client Secret, and Vendor ID (https://developer.amazon.com/mycid.html) to alexa-config.yml in config dir
(sample file format is in config dir)

Run this command one time to give access (token lasts one hour)
``
sls alexa auth
``

Run this command one time to create a skill
``
sls alexa create --name $YOUR_SKILL_NAME --locale $YOUR_SKILL_LOCALE --type $YOUR_SKILL_TYPE
``

For this app, I used 
``
 sls alexa create --name 'Meltzer Notes' --locale en-US --type custom
``

Manifest information can be accessed using:
``
sls alexa manifests
``

To update manifest for Alexa skill:
``
sls alexa update
``

To build and subsequently check model
``
sls alexa build
sls alexa models
``