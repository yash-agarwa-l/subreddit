import mongoose,{Schema} from "mongoose";

const postSchema=new mongoose.Schema({

    title:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    image:{
        type: String
    }, 
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    community:{
        type: Schema.Types.ObjectId,
        ref: "Community",
        required: true
    },
    upvotedBy:[
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    downvotedBy:[
        { 
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    comments:[
        {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
},{
    timestamps:true
})

export const Post=mongoose.model("post",postSchema)