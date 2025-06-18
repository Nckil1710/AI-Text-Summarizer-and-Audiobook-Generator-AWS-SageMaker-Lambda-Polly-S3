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

    huggingface-pytorch-inference-2025-06-18-12-45-01-123
  ![image](https://github.com/user-attachments/assets/1a237702-9024-41af-9f19-522bb9351f06)

- This endpoint is used in your summarizer Lambda function to send raw input text and receive a summarized version. The summarized result is then passed to Amazon Polly for speech synthesis and stored as an audiobook in S3.
  
  






