# ffmpeg-getinfo-bug


This is an expo dev client project 

To build run: 
eas build --local --profile development

This creates a dev build

Then run 

expo start --dev-client


After I add about 11 Tracks the error occurs, this however does not occur in previous versions 


[Unhandled promise rejection: Error: Session not found.]
at node_modules/react-native/Libraries/BatchedBridge/NativeModules.js:105:59 in promiseMethodWrapper
at node_modules/ffmpeg-kit-react-native/src/index.js:1014:68 in FFmpegKitConfig.getMediaInformationExecute
