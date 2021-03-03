function DisplayArea(container, data) {
  this.container = container;
  this.data = data;
}

DisplayArea.prototype.init = function () {};

// 选择区域生成插件
// params:
//    container- 生成容器
//    data: 显示数据
//    onChange : 数据修改回调
$.fn.generateDisplayArea = function (container, data, onChange) {
  new DisplayArea(container, data);
};
