import * as cdk from "@aws-cdk/core";
import * as dynamo from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";
import {partition} from "aws-cdk/lib/util";

export  class TodoBackend extends cdk.Construct{
    public readonly handler:lambda.Function;
    constructor(scope: cdk.Construct, id: string,props?:cdk.StackProps) {
        super(scope, id);

const tasks = new dynamo.Table(this,"task",{

     partitionKey: { name: "id", type: dynamo.AttributeType.STRING }

});

     this.handler=    new lambda.Function(this, "TodoHandler", {
    code: lambda.Code.fromAsset("lambda"),
    // the name of the method in your code that lambda will call
    // our file is called `todoHandler.ts` and it `exports.handler`
    handler: "tasks.handler",
    runtime: lambda.Runtime.NODEJS_12_X,
    // we need to pass the name of our table as env variable
    environment: {
        TABLE_NAME: tasks.tableName
    }
});

tasks.grantReadWriteData(this.handler)

    }
}