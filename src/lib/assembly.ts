import {AssemblyAI} from "assemblyai"
import { endOfDay } from "date-fns"

const client=new AssemblyAI({apiKey:process.env.ASEEMBLY_API_KEY!})

function mstoTime(ms:number){
    const seconds=ms/1000
    const minues=Math.floor(seconds/60)

    
    const remainingSeconds=Math.floor(seconds%60)
    return `${minues.toString().padStart(2,'0')}:${remainingSeconds.toString().padStart(2,'0')}`

}

export const processingMeeting=async(meetingUrl:string)=>{
    const transcript=await client.transcripts.transcribe({
        audio:meetingUrl,
        auto_chapters:true,

    })

    const summaries=transcript.chapters?.map(chapter=>({
        start:mstoTime(chapter.start),
        end:mstoTime(chapter.end),
        gist:chapter.gist,
        headline:chapter.headline,
        summary:chapter.summary

    })) || []

    if(!transcript.text)throw new Error("No transcript found")

        return {
            summaries
        }
}

// const FILE_URL='https://assembly.ai/alert_siron.mp3';

// const response=await processingMeeting(FILE_URL)

// console.log(response)