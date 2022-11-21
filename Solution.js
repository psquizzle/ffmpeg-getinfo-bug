import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";
import React from "react";
import * as FileSystem from "expo-file-system";
import {
  FFmpegKit,
  FFmpegKitConfig,
  FFprobeKit,
  ReturnCode,
} from "ffmpeg-kit-react-native";

const sessionsLimit = 999;
const splitToChunks=(array, parts)=> {
  let result = [];
  let limitParts = array.length<parts ?array.length:parts
  for (let i = limitParts; i > 0; i--) {
      result.push(array.splice(0, Math.ceil(array.length / i)));
  }
  return result;
}

const getTracksLength = async ({ arrayOfTracks }) => {
  

      const allTracksWithDuration = await Promise.all(
        arrayOfTracks.map(async (track) => {
          const trackLength = await getTrackLength({
            track:FileSystem.documentDirectory+track ,
          });

          return { name: track, duration: trackLength };
        })
      );


      return allTracksWithDuration;

};
const getTracksLengthSolved = async ({ arrayOfTracks }) => {

console.log('again')
const result = await  splitToChunks(arrayOfTracks,sessionsLimit-10)
  
  let allTracksWithDuration = await Promise.all(


     [ ...result.map( async (splitArray)=>{
        let splitTracksDuration = []
        for (let i = 0; i < splitArray.length; i++) {
          const trackLength = await getTrackLength({
            track: FileSystem.documentDirectory + splitArray[i],
          });
      
          splitTracksDuration.push({
            name: splitArray[i],
            duration: trackLength,
          });
        }
        return splitTracksDuration
      })]

  )



  return allTracksWithDuration;
};


getTrackLength = async ({ track }) => {
  return new Promise(async (resolve, reject) => {
    FFprobeKit.getMediaInformation(track).then(async (session) => {
      const information = await session.getMediaInformation();
      if (information !== undefined) {
        // const state = FFmpegKitConfig.sessionStateToString(
        //   await session.getState()
        //  );
        //    console.log(state)
        const returnCode = await session.getReturnCode();

        const failStackTrace = await session.getFailStackTrace();
        //const duration = await session.getDuration();
        const output = await session.getOutput();
        resolve(JSON.parse(output).format.duration);
      } else {
        const returnCode = await session.getReturnCode();

        resolve(1);
      }
    });
  });
};

export default function App() {
  const [dirContents, setDirContents] = React.useState([]);
  const [downloaded, setDownloaded] = React.useState(false);

  const listDir = async () => {
    const files = await FileSystem.readDirectoryAsync(
      FileSystem.documentDirectory
    );
    console.log(files);
    setDirContents(files);
  };

  React.useEffect(() => {
    listDir();
    FFmpegKitConfig.setSessionHistorySize(sessionsLimit);
  }, [downloaded]);

  const checkTrackLengths = async () => {
    //const fileInfos = await returnArrayOfFileInfo({array:dirContents,path:FileSystem.documentDirectory})
    // console.log(fileInfos)

    const lengthOfTracks = await getTracksLengthSolved({
      arrayOfTracks: dirContents,
    });
    alert(JSON.stringify(lengthOfTracks));
  };

  return (
    <View style={styles.container}>
      <Text>{dirContents.length} Tracks</Text>
      <Button
        title="Download and Add Track"
        onPress={() => {
          const m4aaudio =
            "https://filesamples.com/samples/audio/m4a/sample3.m4a";
          setDownloaded(false);
          FileSystem.downloadAsync(
            m4aaudio,
            FileSystem.documentDirectory +
              "default" +
              (dirContents.length + 1) +
              ".m4a"
          )
            .then(({ uri }) => {
              setDownloaded(true);
              console.log("Finished downloading to ", uri);
            })
            .catch((error) => {
              console.error(error);
            });
        }}
      ></Button>
      <Button title="Check Tracks Lengths" onPress={checkTrackLengths}></Button>
      <Button
        title="Delete"
        onPress={() => {
          setDownloaded(false);
          dirContents.forEach((element) => {
            FileSystem.deleteAsync(FileSystem.documentDirectory + element);
          });
          setDownloaded(true);
        }}
      ></Button>
            <Button
        title="Double number of files"
        onPress={() => {
          setDownloaded(false);
          dirContents.forEach((element,index) => {
            FileSystem.copyAsync({from:FileSystem.documentDirectory + element,to:FileSystem.documentDirectory+index+element});
          });
          setDownloaded(true);
        }}
      ></Button>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
