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
    imageUrl:[
        {
            type:String,
        }
    ],
    isAnonymous:{
        type:Boolean,
        default:false,
    },
    postType: {
        type: String,
        required: true,
        enum: ["generic", "community"],
        message: "Post type must be either 'generic' or 'community'"
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
        required: function () {
            return this.postType === "community"; 
        }
    },
    
    
},{
    timestamps:true
})

export const Post=mongoose.model("post",postSchema)