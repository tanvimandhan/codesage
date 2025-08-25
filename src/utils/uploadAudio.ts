// export async function uploadAudio(file: File, setProgress?: (progress: number) => void): Promise<string> {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const formData = new FormData();
//       formData.append("file", file);

//       const xhr = new XMLHttpRequest();
//       xhr.open("POST", "/api/upload-audio", true);

//       xhr.upload.onprogress = (e) => {
//         if (e.lengthComputable && setProgress) {
//           const progress = Math.round((e.loaded / e.total) * 100);
//           setProgress(progress);
//         }
//       };

//       xhr.onload = function () {
//         if (xhr.status === 200) {
//           const response = JSON.parse(xhr.responseText);
//           resolve(response.url);
//         } else {
//           reject("Upload failed");
//         }
//       };

//       xhr.onerror = function () {
//         reject("Request failed");
//       };

//       xhr.send(formData);
//     } catch (error) {
//       reject(error);
//     }
//   });
//}

// utils/uploadAudio.ts
// import axios from 'axios';

// export async function uploadAudio(
//   file: File,
//   onProgress?: (progress: number) => void
// ): Promise<string> {
//   const formData = new FormData();
//   console.log(1)
// //   console.log("Cloud name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
// // console.log("Upload preset:", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
//   console.log(2)
//   formData.append('file', file);
//   formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

//   const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
//   console.log(cloudName)

//   const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`;

//   const res = await axios.post(url, formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//     onUploadProgress: (e) => {
//       if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
//     },
//   });

//   return res.data.secure_url;
// }
