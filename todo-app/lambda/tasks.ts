// @ts-ignore
import AWS = require("aws-sdk");
import {data} from "aws-cdk/lib/logging";
import { v4 as uuid} from "uuid"

const tableName = process.env.TABLE_NAME || "";
const dynamo = new AWS.DynamoDB.DocumentClient();

const createResponse = (
    body: string | AWS.DynamoDB.DocumentClient.ItemList,
    statusCode = 200
) => {
    return {
        statusCode,
        body: JSON.stringify(body, null, 2)
    };
};



const getAllTodos = async () => {
    const scanResult = await dynamo
        .scan({
            TableName: tableName
        })
        .promise();

    return scanResult;
};

const addList  = async (data:{todo:string, id:string})=>{
    const {id,todo} = data;

      if (todo && todo !== "") {
        await dynamo
            .put({
              // params object with two properties (TableName is our env variable)
                TableName: tableName,
                Item: {
                    id: id || uuid(),
                    todo
                }
            })
            .promise();
    }
    return todo;



}
const deleteTodoItem = async (data: { id: string }) => {
    const { id } = data;

    if (id && id !== "") {
        await dynamo
            .delete({
                TableName: tableName,
                Key: {
                  // each todo needs a unique id
                    id
                }
            })
            .promise();
    }

    return id;
};

exports.handler = async function (event:any) {

    try {
        const { httpMethod, body: requestBody } = event;
        // GET request
        if (httpMethod === "GET") {
            const response = await getAllTodos();

            return createResponse(response.Items || []);
        }

           const data = JSON.parse(requestBody);
        // if POST add a todo
        if (httpMethod === "POST") {
            const todo = await addList(data);
            return todo
                ? createResponse(`${todo} added to the database`)
                : createResponse("Todo is missing", 500);
        }
        // if DELETE, delete todo (we'll imlement that in the next lesson)
        if (httpMethod === "DELETE") {
            const id = await deleteTodoItem(data);
            return id
                ? createResponse(
                      `Todo item with an id of ${id} deleted from the database`
                  )
                : createResponse("ID is missing", 500);
        }



        return createResponse(
            `We only accept GET requests for now, not ${httpMethod}`,
            500
        );
    } catch (error) {
        console.log(error);
        return createResponse(error, 500);
    }



}