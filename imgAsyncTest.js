if (Meteor.isServer) {
  Clients = new Mongo.Collection('clients');
  if(Meteor.isServer) {
    var fs = Npm.require('fs');
    var Future = Npm.require('fibers/future'); //hier sind futures cooler :D
    Meteor.methods({
      saveImage: function(doc){
        var extension = doc.image.match(/\.(jpg|png|gif)\b/)[0];
        Clients.insert({image: doc.image}, function(error,_id){
          doc = Clients.findOne({"_id":_id});
          var url = doc.image;
          var future = new Future();
          var get = HTTP.get(doc.image,{"responseType": "buffer"},function(error, result){
            if (error){
              return future.error(error);
            }
            var imagePath = +'img/company/' + doc._id + extension;
            fs.writeFile(process.env.PWD + '/public/' + imagePath, result.content, Meteor.bindEnvironment(function(err) {
              if(err) {
                return future.error(error);
              } else {
                Clients.update({_id: doc._id}, {$set: {"imagePath": imagePath}});
                future.return(null);
              }
            }));
            return future.wait();
          });
        });
      }
    });
  }
}
