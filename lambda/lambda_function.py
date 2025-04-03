import json
import boto3
import base64
import random

s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Cars')

def get_cars():
    cars = s3_client.get_object(Bucket='car-game-data', Key='s3-keys.json')
    car_data = cars['Body'].read().decode("utf-8")
    list_data = json.loads(car_data)
    return list_data

def convert_decimals(car):
    car['Cylinders'] = int(car['Cylinders'])
    car['Engine-displacement'] = float(car['Engine-displacement'])
    car['Year'] = int(car['Year'])
    return car

def get_todays_car(user_date):
    response = table.query(
        IndexName='Date-index',
        KeyConditionExpression=boto3.dynamodb.conditions.Key('Date').eq(user_date)
    )
    todays_car = response['Items'][0]
    return todays_car

def lambda_handler(event, context):
    headers = { "Content-Type: image/jpeg" }
    bucket = 'car-game-data'
    user_date = event['queryStringParameters']['date']
    try:
        car_data = get_cars()
        car_list = [car['S3-Key'].replace('-', ' ') for car in car_data]
        todays_car = convert_decimals(get_todays_car(user_date))
        car_key = todays_car['S3-Key']
        s3_key = car_key + '/image.jpg'
        response = s3_client.get_object(Bucket=bucket, Key=s3_key)
        image_file = response['Body'].read()
        encode_file = base64.b64encode(image_file).decode('utf-8')
        data = {
            "image": encode_file,
            "carlist": car_list,
            "cardata": todays_car
        }
        json_data = json.dumps(data)
        # encode_data = base64.b64encode(json_data.encode('utf-8')).decode('utf-8')
        headers = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET"
        }
        return {
            "headers": headers,
            "statusCode": 200,
            "body": json_data,
            "isBase64Encoded": False
        }
    except Exception as e:
        print('Failed to retrieve image:', e)
        return {
            "statusCode": 500,
            "headers": { "Content-type": "text/html" },
            "body": "<h1>Error retrieving image</h1>"
        }