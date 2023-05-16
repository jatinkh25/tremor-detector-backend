# !pip install pandas
import pandas
import pickle
import csv
import sklearn
import os


'''Open text file'''
f = open("/home/justone/Desktop/tremor-detector/backend/src/test.txt", "r")

'''Open csv database'''
filename = open("Data_test.csv", "w")

fields = ['aX', 'aY', 'aZ', 'gX', 'gY', 'gZ', 'mX', 'mY', 'mZ']

'''Saving text data into csv database'''
with filename as csvfile:
    csvwriter = csv.writer(csvfile)
    csvwriter.writerow(fields)
    for line in f:
        l = line
        vals = l.split(',')
        for i in range(len(vals)):
            vals[i] = float(vals[i])
        csvwriter.writerow(vals)

f.close()
filename.close()

file = open("Data_test.csv", "r")
with file as f:
    reader = csv.reader(f)
    next(reader)
    data = []
    for row in reader:
        if len(row) > 0:
            data.append({"val": [float(cell) for cell in row]})


val = [row["val"] for row in data]
'''Loading pre-trained model'''
with open('/home/justone/Desktop/tremor-detector/backend/src/RandomForestClassifier()model.pickle', 'rb') as f:
    model = pickle.load(f)
'''Testing only last 20 values'''
test_data = [i for i in val[len(data)-20:]]

'''Predicting Result'''
result = model.predict(test_data)
count = sum(result)

if count >= 11:
    print("shaking")
else:
    print("stable")
