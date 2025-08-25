'use client'

import { api } from '@/trpc/react';
import { Card } from '@/components/ui/card';
import { Presentation, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { uploadAudio } from '@/lib/upload';
import { toast } from 'sonner';
import useProject from '@/hooks/use-project';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import axios from "axios"

const MeetingCard = () => {
  const [progress, setProgress] = useState(0);
  const processMeeting=useMutation({mutationFn:async(data:{meetingUrl:string,meetingId:string,projectId:string})=>{
    const {meetingUrl,meetingId,projectId}=data
    const response=await axios.post('api/process-meeting',{meetingUrl,meetingId,projectId})
    return response.data
  }})
  const {project}=useProject()
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(''); 
  const router=useRouter()
  const uploadMeeting=api.project.uploadMeeting.useMutation()
  // ✅ Optional: show uploaded audio
  const onDrop = async (acceptedFiles: File[]) => {
  if (acceptedFiles.length === 0) {
    toast.error("No valid file selected");
    return;
  }

  const file = acceptedFiles[0];
  if (!project) return;

  setIsUploading(true);
  setProgress(0);

  try {
    toast.info("Uploading...");
    const url = await uploadAudio(file, setProgress) as string;
    setUploadedUrl(url);

    const meeting = await uploadMeeting.mutateAsync({
      projectId: project.id,
      meetingUrl: url,
      name: file.name
    });

    // ✅ Now we have meeting.id
    await processMeeting.mutateAsync({
      meetingUrl: url,
      meetingId: meeting.id,
      projectId: project.id
    });

    toast.success("Upload successful!");
    router.push("/meetings");
  } catch (err) {
    console.error("Upload error:", err);
    toast.error("Upload failed");
  } finally {
    setIsUploading(false);
  }
};

  const { getRootProps, getInputProps } = useDropzone({
  accept: { 'audio/*': [] },
  multiple: false,
  maxSize: 56_000_000,
  onDrop,
});


  return (
    <Card className='col-span-2 flex flex-col items-center justify-center p-4'>
      {!isUploading && (
        <>
          <Presentation className='h-10 w-10 animate-bounce mt-2' />
          <h3 className=' text-sm font-semibold text-gray-900'>
            Create new meeting
          </h3>
          <p className=' text-center text-sm text-gray-500'>
            Analyse your meeting with CodeSage
            <br /> Powered by AI
          </p>
          <div className='mt-3 mb-3 w-full flex justify-center'>
            <div {...getRootProps()}>
              <input className='hidden' {...getInputProps()} />
              <Button disabled={isUploading}>
                <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Upload meeting
              </Button>
            </div>
          </div>
        </>
      )}

      {isUploading && (
        <div className="flex flex-col items-center">
          <CircularProgressbar
            value={progress}
            text={`${progress}%`}
            className='size-20'
            styles={buildStyles({
              pathColor: '#2563eb',
              textColor: '#2563eb',
            })}
          />
          <p className='text-sm text-gray-500 text-center mt-2'>
            Uploading your meeting...
          </p>
        </div>
      )}

      {uploadedUrl && !isUploading && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">Uploaded audio:</p>
          <audio controls className="w-full max-w-xs mx-auto">
            <source src={uploadedUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </Card>
  );
};

export default MeetingCard;
