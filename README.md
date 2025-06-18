# AI-Text-Summarizer-and-Audiobook-Generator-AWS-SageMaker-Lambda-Polly-S3

A dynamic, cloud-native web application that allows users to input raw text or upload .txt files, and choose between summarization, text-to-speech, or both. Built using AWS Lambda, SageMaker (with a Hugging Face distilbart-cnn-12-6 model), and Amazon Polly, the system runs two serverless pipelines—one for generating concise summaries and another for producing audiobooks. REST APIs manage the communication between frontend and backend, and the entire app is deployed on AWS Amplify for scalability and robustness.
## Prerequisites

Before starting, ensure that you have:
- An active AWS account.
- Basic knowledge of AWS services (S3, Lambda, API Gateway, IAM).
- Access to the AWS Management Console.

## 🛠️ Technologies Used

- AWS Lambda – serverless backend for summarization and text-to-speech
- Amazon SageMaker – hosts the HuggingFace summarization model (distilbart-cnn-12-6)
- Amazon Polly – generates natural-sounding audio
- Amazon S3 – stores generated MP3 files
- Amazon API Gateway – provides REST API endpoints for frontend interaction
- AWS Amplify – deploys and hosts the HTML frontend

 ## Step 1: Set Up AWS S3 Bucket for Storing Audiobooks

### 1. Create an S3 Bucket:
- Go to the **S3** service in the AWS Console.
- Click on **Create Bucket**.
- Name the bucket `summarized-text-audio` (or your preferred name).
 ![Screenshot 2025-06-17 212338](https://github.com/user-attachments/assets/44e73125-050d-4d2a-aa63-00337a995734)
- Disable **Block all public access** for the bucket to enable access for downloading audiobooks.
![Screenshot 2025-06-17 212351](https://github.com/user-attachments/assets/7cba85db-682d-47a3-8412-b133781faf31)
## Step 2: Set Up IAM Policies for Polly and S3 Access

### 1. Create the S3 Access Policy:
- Go to the **IAM** service in the AWS Console.
- Create a new policy for **S3** access.
- Under **Specify ARNs**, choose **S3 bucket** and specify the ARN for your bucket, for example:  
  `arn:aws:s3:::summarized-text-audio/*`
- Add the necessary actions: `PutObject`, `PutObjectAcl`, `GetObject`, and `GetObjectAcl` to allow the policy to modify and access objects in this specific bucket.
 ![Screenshot 2024-11-19 114921](https://github.com/user-attachments/assets/5620081f-5534-4cae-bec3-8da1e44d99aa)
 ![Screenshot 2024-11-19 115053](https://github.com/user-attachments/assets/d52941e8-17e7-4ebe-a1d0-e3331e765454)
 ![Screenshot 2024-11-19 115103](https://github.com/user-attachments/assets/d16dbc2a-e1cb-43d9-ae10-9f36d32e2632)
![Screenshot 2025-06-17 212730](https://github.com/user-attachments/assets/a8244d8b-f4f6-4919-9274-237d5b680130)
![Screenshot 2025-06-17 212755](https://github.com/user-attachments/assets/34ee04aa-3ff4-4e92-9237-0725def83191)

 
### 2. Create the Polly Access Policy:
- In IAM, create another policy for **Polly** access.
- Add the `synthesize-speech` action.
 ![Screenshot 2024-11-19 115621](https://github.com/user-attachments/assets/18f1598a-b2f7-4879-824e-021e007439b6)
 ![Screenshot 2024-11-19 115703](https://github.com/user-attachments/assets/8bbc4a2d-5c8d-4a4f-a353-e518f79161b9)
Now we can see the created poilices:
![Screenshot 2024-11-19 115726](https://github.com/user-attachments/assets/381ec9ce-d2a3-4c70-afe2-9a758bfca60a)

## Step 3: Create the IAM Role for Lambda Execution

### 1. Create the IAM Role:
- Go to IAM > Roles and create a new role.
- Attach the **AWS Lambda execution role**, **S3 access policy**, **AmazonSageMakerFullAccess** and **Polly access policy** to the role.
- Name the role `polly-s3-lambda-role`.
 ![Screenshot 2024-11-19 115849](https://github.com/user-attachments/assets/e5e58859-043d-47ac-b168-e3c9e9cb1918)
  ![Screenshot 2024-11-19 120110](https://github.com/user-attachments/assets/832a8be4-da3a-4f66-a4f1-9c8e1fe77639)
  ![Screenshot 2025-06-17 213408](https://github.com/user-attachments/assets/7aa592a6-f6e7-4425-beda-ce9142089e41)
  ![image](https://github.com/user-attachments/assets/6fa96665-b4d6-4810-a851-bebcb4acc726)
## Step 4: Set Up SageMaker AI for Text Summarization
We’ll use Amazon SageMaker to deploy a Hugging Face transformer model that summarizes user input before converting it to audio using Amazon Polly.

### 1. Create a SageMaker Domain
- Go to Amazon SageMaker → Domains
  ![Screenshot 2025-06-17 214740](https://github.com/user-attachments/assets/e88503eb-e33d-488c-af95-29c805808955)
- Click Create domain

- Launch as SageMaker Studio
  ![Screenshot 2025-06-17 221534](https://github.com/user-attachments/assets/b6628923-e27b-4f8c-8f47-dde49ae6ca6d)
- Choose ModelBuilder - JupyterLab as the IDE
- Select Model space for development and deployment
- ![Screenshot 2025-06-17 221643](https://github.com/user-attachments/assets/d80c9f3d-6728-4e84-a284-5b7041557faa)

### 2. Configure the Instance
- In the Launch app screen of the user profile, configure the instance:
- Instance type: ml.t3.xlarge
- Storage size: 5 GB (you can increase this based on your usage)
This setup provides sufficient resources for running lightweight transformer models.

### 3. Choose and Use a Pretrained Hugging Face Model
- Go to https://huggingface.co
- Search for: sshleifer/distilbart-cnn-12-6
- This is a lightweight version of BART fine-tuned on CNN/DailyMail for text summarization.
- Click Deploy Through SageMaker
- ![image](https://github.com/user-attachments/assets/be7b5c58-613d-4d71-ac5b-710410a38c8b)
- This will generate the Python deployment code.
![image](https://github.com/user-attachments/assets/cdf40b98-3ac5-47d0-9b51-263e0af6f2e2)

### 4. Deploy the Model via SageMaker JupyterLab
- In SageMaker → open Model Space > JupyterLab
- Paste the generated code into a new notebook cell

- Run the code to:
    Deploy it to an endpoint

- Return the Endpoint Name that will be used by Lambda


- Result Once deployed, SageMaker will provide an Endpoint Name, something like:
 ![image](https://github.com/user-attachments/assets/1a237702-9024-41af-9f19-522bb9351f06)
    **huggingface-pytorch-inference-2025-06-18-12-45-01-123**
 

- This endpoint is used in your summarizer Lambda function to send raw input text and receive a summarized version. The summarized result is then passed to Amazon Polly for speech synthesis and stored as an audiobook in S3.
  
## Step 5: Set Up AWS Lambda Functions 
### We need 2 Lambda Functions one for "Text to Speech" and another one for "Text summarization"
### 1. Create a New Lambda Function for Text to Speech:
- Go to the **Lambda** service and create a new function.
- Name it (e.g., `text-to-speech`).
- Choose **Python 3.13** as the runtime.
- Set the execution role to `polly-s3-lambda-role`.
  <img width="936" alt="{7DE25479-60F5-46B3-AA97-93F4FA7061E1}" src="https://github.com/user-attachments/assets/c35fbd08-232a-48de-a749-9fdf0f363b9d" />

  ![Screenshot 2024-11-19 120417](https://github.com/user-attachments/assets/37dfadb2-9911-4abc-8493-33fd1135f707)
  
### 2. Configure Lambda Function Trigger:
- Add a new **API Gateway** trigger to the Lambda function.
- Select **REST API** and configure the API for your function.
- Add binary media types: `*/*`, `audio/mpeg`, `text/plain`.
- MAKE SURE U ADD ALL THE BINARY MEDIA TYPES
    ![Screenshot 2024-11-19 120547](https://github.com/user-attachments/assets/38adb414-2456-4fe4-8f3b-e210b41121ef)
   ![Screenshot 2024-11-19 120555](https://github.com/user-attachments/assets/35a0ade0-970d-4488-8112-fe6ef83dac91)
- Click Create Trigger and then click on API to redirect to REST API
<img width="1280" alt="{23B85294-B936-447B-A387-4FC72286E1CD}" src="https://github.com/user-attachments/assets/76764fb6-5a4b-42f3-ab3a-20286beffd27" />
- Go to Resources and in text-to-speech enable **CORS** for cross-origin requests.
  <img width="1253" alt="{58D414F7-7464-4018-BFF9-9C8AE474FF50}" src="https://github.com/user-attachments/assets/5a5be7bb-b0e8-4535-b565-098addc4c991" />

### 3. Deploy the API:

- Go to Integration Request in Resources and click on edit to change the Integration timeout to 80000 ms .

  <img width="1106" alt="{C2D90994-91AD-4221-A6E8-1AC586FA5D7A}" src="https://github.com/user-attachments/assets/8cf31b99-7fb7-48d5-8a4f-788ea27defd0" />
![image](https://github.com/user-attachments/assets/068d0c8e-43fa-45cb-be65-9b7c13b19072)
 ### `Note`
- By default Integration timeout limit is set to 29000 ms we need to increase the integration timeout limit by using Service Quotas
- Go to API Gateway Section
![image](https://github.com/user-attachments/assets/e17ef3bf-a5dc-4f86-bc2c-485f2c149b0f)
- Search for Timeout and select `Maximum integration timeout in milliseconds` and then click request increase at account level
- change the limit to 90000 ms
  ![image](https://github.com/user-attachments/assets/937a07bd-5ebe-4d07-854c-f5cf8a2065f5)
  ![image](https://github.com/user-attachments/assets/53c2937e-2b14-44a9-8050-f6ea9f51ea6c)
- After configuring the API Gateway, deploy it.

  ![Screenshot 2024-11-19 121035](https://github.com/user-attachments/assets/c02aec22-7d35-40dd-9066-6e9077af9b52)
- Copy the **Invoke URL** for later use in Lambda.
![Screenshot 2024-11-19 121104](https://github.com/user-attachments/assets/b43f0e31-9097-4640-afd9-1940291c1474)

## 4. Create a New Lambda Function for Text Summarization
- Similar to Steps 1 - 3 we do the same to create `text-summarizer` lambda function
  ![image](https://github.com/user-attachments/assets/13c8fb25-775e-4efe-969c-58eada719ab7)
- Now create a Trigger
![Screenshot 2024-11-19 120547](https://github.com/user-attachments/assets/38adb414-2456-4fe4-8f3b-e210b41121ef)
![image](https://github.com/user-attachments/assets/a68dded4-7fe6-4676-a142-bef4f40a7e76)
- Now go to resources and enable **Cors**
<img width="1074" alt="{1FC88D1C-DD17-4B91-9326-8BF41EB4F987}" src="https://github.com/user-attachments/assets/2b07edf1-9f24-4662-8607-369158e215c3" />
<img width="1119" alt="{7E609E6E-1887-4BDF-BAEE-48B4007CF3EF}" src="https://github.com/user-attachments/assets/689e4943-8a86-45be-875f-348ef5197ac2" />
- also For the ANY Method change the Integration Timeout to 80000 ms

![image](https://github.com/user-attachments/assets/29fd297e-76d9-4f98-9184-532e28a464d5)
- Now Deploy the API
![WhatsApp Image 2025-06-18 at 19 25 58_45bc3010](https://github.com/user-attachments/assets/fb1e1dc1-47ab-49f4-a192-3efc86fa5086)
![WhatsApp Image 2025-06-18 at 19 26 27_937dc701](https://github.com/user-attachments/assets/21f4eab7-1237-4635-8225-826be904611f)

## Step 6: Modify Lambda Code and Set Environment Variables
### 1. Modify Lambda Code:
- Open the Lambda function in the AWS Console.
- Modify the script.js to include the Invoke URL for the API Gateway .
- Ensure that your Lambda function is sending the request to the correct API endpoint for text-to-speech conversion.
  ![image](https://github.com/user-attachments/assets/86eef567-4614-4761-8ad8-ee713656bff6)
### 2. Set Environment Variables:
In the Lambda configuration for text-to-speech, add an environment variable:
- Key: BUCKET_NAME
- Value: summarized-text-audio
- ![image](https://github.com/user-attachments/assets/dfd12b45-eba1-4758-b03b-6b76a330cc2b)
 In the Lambda configuration for summarizer, edit the endpoint name with the sagemaker model.
![image](https://github.com/user-attachments/assets/a72d601d-82c1-4a4d-b6d5-eb74bf04f502)
## Step 7: Upload HTML for the Frontend (UI)
### 1. Create the HTML Interface:
- Create an index.html file for the UI, allowing users to upload text files for conversion to audio and text summarization.
- Include an upload button and text display for showing conversion progress.
- Set up a function to handle file uploads and send requests to the Lambda function via API Gateway.
![image](https://github.com/user-attachments/assets/f3c9937c-237a-4784-9fc4-b1f97f666ce3)

### 2. Deploy Interface on AWS Amplify:
- Set up AWS Amplify to deploy your HTML frontend.
- Connect the project to Amplify and deploy it.
- Ensure that the frontend is linked to the backend Lambda API for seamless text-to-speech conversion.
![image](https://github.com/user-attachments/assets/61a6d8e3-0a19-48ca-93ad-26ecafb96421)

## Step 8: Testing and Verifying the Solution
### 1. Upload Text File and Convert:
- Test the full workflow by uploading a text file (e.g., a book) through the UI.
- Check if the text-to-speech conversion works, and the resulting MP3 file is stored in the S3 bucket.
 ![image](https://github.com/user-attachments/assets/e20de7c8-27bb-4b15-a3d5-d10f4514ee9a)


## Conclusion

This project showcases a fully serverless text summarization and text-to-speech pipeline using AWS services including SageMaker, Lambda, Polly, S3, and API Gateway. By integrating a Hugging Face summarization model in SageMaker with Lambda and Polly, the system efficiently transforms large text inputs into concise audio summaries. This setup not only automates the summarization process but also enables scalable audiobook generation, making it ideal for content accessibility and productivity applications.

## Contributors

This project was developed and maintained by:

- [R Bharath](https://github.com/bharathr31/)
- [E NIKHILESWAR REDDY](https://github.com/Nckil1710)

Both contributed equally to the development and implementation of the project.








