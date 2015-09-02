/**
 * Created by Urvesh on 8/19/15.
 */

var multer = require('multer');
var fs = require('fs');

exports.index = function(req, res, next) {
    res.render('upload');
};

exports.storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log('uploading...', file.originalname);
        cb(null, './uploads/tmp/');
    },
    filename: function(req, file, cb) {
        //console.log(file);
        cb(null, file.originalname);
    }
});

exports.postUpload = function(req, res, next) {
    //console.log(req.files);
    //console.log(req.body);

    var filePathArray = [];
    if (req.body.albumName) {
        console.log('there is a name');
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

        req.files.forEach(function(image) {
            var oldPath = image.destination + image.originalname,
                newPath = path + image.originalname;

            fs.rename(oldPath, newPath);
            filePathArray.push(req.body.albumName + '/' + image.originalname);
            console.log('moved', oldPath, 'to', newPath);
        })
    }

    res.redirect('/search');
};

exports.search = function(req, res, next) {
    res.render('search');
};

exports.searchAlbum = function(req, res, next) {
    console.log(req.query);
    if (req.query.album) {
        fs.readdir('./uploads/' + req.query.album, function(err, files) {

            if (err) {
                console.log(err);
                res.send('This album doesn\'t exists');
            } else {
                console.log(files);

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
