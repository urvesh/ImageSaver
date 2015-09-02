/**
 * Created by Urvesh on 8/19/15.
 */

var multer = require('multer');
var fs = require('fs');
var gm = require('gm');
var async = require('async');


exports.index = function(req, res, next) {
    res.render('upload');
};

exports.storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log('uploading...', file.originalname);
        cb(null, './uploads/tmp/');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

exports.postUpload = function(req, res, next) {
    if (req.body.albumName) {
        var path = './uploads/' + req.body.albumName + '/';
        fs.mkdir(path, function(err) {
            if (err) {
                if (err.code === 'EEXIST') {
                    var length = err.path.split('/').length;
                    var name = err.path.split('/')[length - 2];   //-2 because albumn name is the 3rd element
                    console.log('WARNING:', 'album already exists:', name);
                } else {
                    console.log(err);
                }
            }
        });

        async.eachLimit(req.files, 10, function(image, callback) {
            var oldPath = image.destination + image.originalname,
                newPath = path + image.originalname;

            var imageSize = {};
            gm(oldPath)
                .size(function (err, size) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(newPath, '-> Size:', size);
                        imageSize = size;
                    }
                })
                .resize(imageSize.width * 0.5, imageSize.height * 0.5)
                .write(newPath, function (err) {
                    if (err) {
                        console.log(err)
                    } else {
                        fs.unlink(oldPath); //removes old file from tmp folder
                        console.log('resized image...');
                        callback()
                    }
                })
        });
    }
    res.redirect('/search');
};

exports.search = function(req, res, next) {
    res.render('search');
};

exports.searchAlbum = function(req, res, next) {
    if (req.query.album) {
        fs.readdir('./uploads/' + req.query.album, function(err, files) {

            if (err) {
                console.log(err);
                res.send('This album doesn\'t exists');
            } else {
                res.render('images', {
                    album: req.query.album,
                    images: files
                })
            }
        });
    } else {
        res.send("This parameter doesn't exist");
    }
};
