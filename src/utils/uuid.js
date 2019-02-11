function UUIDjs () {

}
UUIDjs.create = function (pre) {
  return (pre ? pre + '-' : '') + (Math.random() + '').substr(2, 8) + '-' + ((new Date()).getTime() + '').substr(-4, 4)
}
export default UUIDjs
