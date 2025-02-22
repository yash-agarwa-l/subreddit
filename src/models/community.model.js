import mongoose from "mongoose";

const communitySchema=new mongoose.Schema({
    
    name:{ 
        type: String,
        required: true,
        unique: true
    },
    description:{
        type: String
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    posts:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ]
        
},{
    timestamps:true
})

export const Community=mongoose.model("community",communitySchema)