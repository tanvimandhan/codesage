import { useQueryClient } from '@tanstack/react-query'


function Userefetch() {
  
    const queryClient=useQueryClient()
    return async()=>{
        await queryClient.refetchQueries({
            type:'active'
        })
    }
  
}

export default Userefetch