const db = require("./db");
const {
    GetItemCommand,
    PutItemCommand,
    DeleteItemCommand,
    ScanCommand,
    UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const getJobPost = async (event) => {
    const response = { statusCode: 200 };

    try {
        const params = {
            TableName: process.env.JOB_POSTS_TABLE_NAME,
            Key: marshall({ jobPostId: event.pathParameters.jobPostId }),
        };
        const { Item } = await db.send(new GetItemCommand(params));

        console.log({ Item });
        response.body = JSON.stringify({
            message: "Successfully retrieved job post.",
            data: (Item) ? unmarshall(Item) : {},
            rawData: Item,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to get job post.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

const createJobPost = async (event) => {
    const response = { statusCode: 200 };

    try {
        const body = JSON.parse(event.body);
        const params = {
            TableName: process.env.JOB_POSTS_TABLE_NAME,
            Item: marshall(body || {}),
        };
        const createResult = await db.send(new PutItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully created job post.",
            createResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to create job post.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

const updateJobPost = async (event) => {
    const response = { statusCode: 200 };

    try {
        const body = JSON.parse(event.body);
        const objKeys = Object.keys(body);
        const params = {
            TableName: process.env.JOB_POSTS_TABLE_NAME,
            Key: marshall({ jobPostId: event.pathParameters.jobPostId }),
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: body[key],
            }), {})),
        };
        const updateResult = await db.send(new UpdateItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully updated job post.",
            updateResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to update job post.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

const deleteJobPost = async (event) => {
    const response = { statusCode: 200 };

    try {
        const params = {
            TableName: process.env.JOB_POSTS_TABLE_NAME,
            Key: marshall({ jobPostId: event.pathParameters.jobPostId }),
        };
        const deleteResult = await db.send(new DeleteItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully deleted job post.",
            deleteResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to delete job post.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

const getAllJobPosts = async () => {
    const response = { statusCode: 200 };

    try {
        const { Items } = await db.send(new ScanCommand({ TableName: process.env.JOB_POSTS_TABLE_NAME }));

        response.body = JSON.stringify({
            message: "Successfully retrieved all posts.",
            data: Items.map((item) => unmarshall(item)),
            Items,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to retrieve posts.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

module.exports = {
    getJobPost,
    createJobPost,
    updateJobPost,
    deleteJobPost,
    getAllJobPosts,
};