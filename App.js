import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,Button } from 'react-native';
import React from 'react';
import * as FileSystem from 'expo-file-system';
import {
  FFmpegKit,
  FFmpegKitConfig,
  FFprobeKit,
  ReturnCode,
} from "ffmpeg-kit-react-native";

const getTracksLength = async ({ arrayOfTracks }) => {
  console.log(arrayOfTracks.length)

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

async function returnArrayOfFileInfo({ array, path }) {
  const mappedReturn = array.map(async (item) => {
    let fileInfo = await FileSystem.getInfoAsync(path + encodeURI(item));

    fileInfo.path = path;
    fileInfo.entityName = item;
    return fileInfo;
  });
  return await Promise.all(mappedReturn);
}
const getTrackLength = async ({ track }) => {
  return new Promise((resolve, reject) => {


      console.log('here: '+track)

      FFprobeKit.getMediaInformation(track).then(async (session) => {

        const information = await session.getMediaInformation();
        if (information !== undefined) {
          const state = FFmpegKitConfig.sessionStateToString(
            await session.getState()
          );
          const returnCode = await session.getReturnCode();
          console.log(returnCode)
          const failStackTrace = await session.getFailStackTrace();
          //const duration = await session.getDuration();
          const output = await session.getOutput();
          resolve(JSON.parse(output).format.duration);
        } else {
          const returnCode = await session.getReturnCode();
          console.log(returnCode)
          resolve(1);
        }
  
      });


  });
};

export default function App() {

  const [dirContents, setDirContents] = React.useState([])
  const [downloaded, setDownloaded] = React.useState(false)

  const listDir  =   async ()=>{
    const files =  await FileSystem.readDirectoryAsync(FileSystem.documentDirectory)
    console.log(files)
    setDirContents(files)
  }

  React.useEffect(()=>{
    listDir()

  },[downloaded])

  const checkTrackLengths = async ()=>{

   //const fileInfos = await returnArrayOfFileInfo({array:dirContents,path:FileSystem.documentDirectory})
  // console.log(fileInfos)

    const lengthOfTracks  = await getTracksLength({
      arrayOfTracks: dirContents,
    });
    alert(JSON.stringify(lengthOfTracks))

  }

  return (
    <View style={styles.container}>
      <Text>{dirContents.length} Tracks</Text>
      <Button   title="Download and Add Track"  onPress={()=>{
        const m4aaudio = 'https://filesamples.com/samples/audio/m4a/sample3.m4a'
        setDownloaded(false)
        FileSystem.downloadAsync(
          m4aaudio,
          FileSystem.documentDirectory + 'default'+ (dirContents.length+1 )+ '.m4a'
        )
          .then(({ uri }) => {
            setDownloaded(true)
            console.log('Finished downloading to ', uri);
          })
          .catch(error => {
            console.error(error);
          });
      }}>
    
    </Button>
    <Button title="Check Tracks Lengths" onPress={checkTrackLengths}></Button>
    <Button title='Delete' onPress={()=>{
      setDownloaded(false)
      dirContents.forEach(element => {
        FileSystem.deleteAsync(FileSystem.documentDirectory+element)

      });
      setDownloaded(true)
    }}></Button>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
