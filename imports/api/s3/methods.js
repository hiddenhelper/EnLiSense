import { Meteor } from 'meteor/meteor';
import AWS from 'aws-sdk';
import path from 'path'
import Papa from 'papaparse';

import { Reports, ReportsContent } from '../devices';
import { removeLines } from '../../lib/utils/reportHelpers';

AWS.config.update({
  accessKeyId: process.env.accessKeyId || Meteor.settings.private.accessKeyId,
  secretAccessKey: process.env.secretAccessKey || Meteor.settings.private.secretAccessKey,
  region: process.env.region || Meteor.settings.private.region,
  signatureVersion: 'v4'
});

const s3 = new AWS.S3();

Meteor.methods({
  uploadFileToS3(inputData, filename, header) {
    if (!Meteor.isServer) return;
    if (!this.userId) {
      throw new Meteor.Error('uploadFileToS3',
          'Must be logged in to upload file.');
    }

    // Let other method calls from the same client start running, without
    // waiting for the file uploading to complete.
    this.unblock();

    //const base64Data = new Buffer.from(base64.replace(/^data:text\/\w+;base64,/, ""), 'base64');

    // Getting the file type, ie: jpeg, png or gif
    //const type = base64.split(';')[0].split(':')[1];
    //const newUrl = new URL(url)
    //const filename = path.basename(newUrl.pathname)

    const bucketPath = `protected/${this.userId}/${filename}`;

    const params = {
      Bucket: process.env.bucket || Meteor.settings.private.bucket,
      Key: bucketPath,
      Body: inputData.join('\r\n'),
      Metadata: { userId: this.userId },
      ContentEncoding: 'base64',
      ContentType: 'txt'
    };
    s3.upload(params, function(err, data) {
      if(err) {
        throw new Meteor.Error(err.message);
      }
      console.log(err, data);
    });
  },
  async listUserReports() {
    if (!Meteor.isServer) return;
    if (!this.userId) {
      throw new Meteor.Error('uploadFileToS3',
          'Must be logged in to upload file.');
    }

    userId = this.userId

    // Let other method calls from the same client start running, without
    // waiting for the file uploading to complete.
    this.unblock();

    return new Promise((resolve, reject) => {
      const bucketPath = `private/${this.userId}/`;

      const params = {
        Bucket: process.env.bucket || Meteor.settings.private.bucket,
        Prefix: bucketPath,
      };
      s3.listObjects(params, Meteor.bindEnvironment(function(err, data) {
        if (err) reject(err); // an error occurred
        if (!err) {
          data.Contents.forEach((content) => {
            //console.log(content)
            const params = {
              Bucket: process.env.bucket || Meteor.settings.private.bucket,
              Key: content.Key
            };
            s3.getObject(params, Meteor.bindEnvironment(function(err, fileObject) {
              if (err) console.log(err, err.stack); // an error occurred
              if (!err) {

                const fileContent = fileObject.Body.toString();
                const filename = content.Key.substring(content.Key.lastIndexOf('/') + 1)
                //console.log("filename")
                //console.log(filename)
                const report = Reports.findOne({'filename': filename});
                Meteor.setTimeout(function(){
                  //console.log("report")
                  //console.log(report)
                  if (report) {
                    const reportContentExist = ReportsContent.findOne({ reportId: report._id , row: { $exists: false } }, { fields: { reportId: 1 }});
                    if (reportContentExist) {
                      //console.log("reportContentExist")
                      //console.log(reportContentExist)
                      ReportsContent.remove({ reportId: report._id })
                    }
                    let recordWithOutInfo = removeLines(fileContent, [0]).split('\n');
                    recordWithOutInfo[0] = recordWithOutInfo[0].split(',').map((item, index) => {
                      return index > 2 ? item + ' ' + (index - 2) : item;
                    }).join(',')
                    recordWithOutInfo = Papa.parse(recordWithOutInfo.join('\n'), { header: true })
                    recordWithOutInfo.data.forEach((item) => {
                      for( key in item) {
                        item[key] = Number(item[key])
                      }
                      //console.log(item)
                      // adjust timestamp
                      item['filename'] = filename
                      item['owner'] = userId
                      //item['time'] = item['time'] * 10000
                      item['archive'] = false
                      item['entryTimestamp'] = new Date()

                      //console.log("item")
                      //console.log(item)

                      ReportsContent.insert({ reportId: report._id, ...item });
                    })
                    Reports.update({ _id: report._id }, { $set: { hasOutput: true, filename: ''} })
                  }
                }, 10000)
              }
            }));
          })
          resolve(`Completed ${data.Contents.length} files`);
        }
      }));
    });
  },
});
