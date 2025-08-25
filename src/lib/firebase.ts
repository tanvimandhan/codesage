// Import the functions you need from the SDKs you need
import { error } from "console";
import { initializeApp } from "firebase/app";
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAV0yKcZSjxKqFT45PInrjZG2Squa7XRAw",
  authDomain: "my-codesage.firebaseapp.com",
  projectId: "my-codesage",
  storageBucket: "my-codesage.firebasestorage.app",
  messagingSenderId: "75370924274",
  appId: "1:75370924274:web:ef276c4f23530da4c9286b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage=getStorage(app)

export async function uploadFile(file:File,setProgress?:(progress:number)=>void){
    return new Promise((resolve,reject)=>{
        try{
           const storageRef=ref(storage,file.name)
           const uploadTask=uploadBytesResumable(storageRef,file)

           uploadTask.on('state_changed',snapshot=>{
            const progress=Math.round((snapshot.bytesTransferred/snapshot.totalBytes)*100)
            if(setProgress)setProgress(progress)
            switch(snapshot.state){
                case 'paused':
                    console.log('upload is paused');
                    break;
                
                case 'running':
                    console.log('upload is runninf');
                    break;
            }
           },error=>{
              reject(error)
           },()=>{
              getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl=>{
                resolve(downloadUrl)
              })
           }
        )
        }catch(error){
            console.error(error)
            reject(error)
        }
    })
}