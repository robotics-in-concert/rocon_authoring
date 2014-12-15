var  R = require('ramda'),
  Promise = require('bluebird'),
  glob = Promise.promisify(require('glob')),
  fs = Promise.promisifyAll(require('fs')),
  xml2js = Promise.promisifyAll(require('xml2js'));

var ServiceStore = function(options){
  // options
  // - ros_root
  this.options = options;

};


var _to_colon_sep = function(obj){
  return R.compose(
    R.join("\n"),
    R.map(R.join(": ")),
    R.toPairs
  )(obj);
};

ServiceStore.prototype.allPackageInfos = function(){
  return glob(this.options.ros_root + "/**/package.xml")
    .map(function(xmlpath){
      return fs.readFileAsync(xmlpath).then(function(xml){
        return xml2js.parseStringAsync(xml, {explicitArray: false});
      })
      .then(function(item){
        item.path = xmlpath;
        return item;

      });

    })


};

ServiceStore.prototype.exportToROS = function(package_name, service_meta){
  this.allPackageInfos().then(function(res){ 
    // console.log(res); console.log('done'); 
  });


  console.log(service_meta);

  var name_key = service_meta.name.replace(/\s+/g, "_").toLowerCase();
  console.log(name_key);


  // .parameters
  var params = R.compose(
    R.tap(console.log),
    R.fromPairs,
    R.map(R.props(['key', 'value']))
  )(service_meta.parameters);
  var param_file_content = _to_colon_sep(params);
  console.log('---------------- .parameters --------------------');
  console.log(param_file_content);


  // .service
  var service_kv = R.pickAll("name description author priority launcher_type launcher icon interactions parameters".split(/\s+/), service_meta);
  service_kv.launcher = name_key + ".launcher";
  service_kv.interactions = name_key + ".interactions";
  service_kv.parameters = name_key + ".parameters";
  var service_file_content = _to_colon_sep(service_kv);
  console.log('---------------- .service --------------------');
  console.log(service_file_content);


};


module.exports = ServiceStore;