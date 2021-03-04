// 基础样式
const styles = `
 .root-group{
    border-bottom:solid 1px rgba(0,0,0,0.1);
    padding:10px;
  }

 .root-group .root-item.active::after{
    content:' ';
    height:4px;
    width:25px;
    border-radius:4px;
    background:#0079FE;
    display:block;
    margin:auto;
    margin-top:4px;
 }

 .root-item{
   cursor:pointer;
   padding:5px 10px;
   margin: 0 10px;
   font-size: 18px;
   font-weight: bold;
 }

 .data-group{
    display:flex;
    align-items:center;
    margin:5px;
    border-bottom:solid 1px rgba(0,0,0,0.1);
    padding:10px;
 }
 
 .data-group .data-group-title{
  min-width:80px;
  letter-spacing:1em;
  font-weight:bold;
  color:#AFAFAF;
  font-size:14px;
 }

 .data-group .data-group-title::after{
    content:':'
 }

 .data-group .data-group-container{
    display:flex;
 }

 .data-group .data-group-item{
    cursor:pointer;
    padding: 5px 10px;
    margin: 0 10px;
    font-size: 14px;
    font-weight: bold;
    min-width:50px;
    text-align:center;
 }

 .data-group .data-group-item.active{
    background:#0079FE;
    color:#fff;
    border-radius:40px;
 }

 .current-group{
    display:flex;
    align-items:center;
    margin:5px;
    border-bottom:solid 1px rgba(0,0,0,0.1);
    padding:10px;
 }
 
 .current-group .group-title{
  min-width:80px;
  font-weight:bold;
  color:#AFAFAF;
  font-size:14px;
 }

 .current-group .group-title::after{
    content:':';
    padding-left:1em;
 }

 .current-group .group-container{
    display:flex;
 }

 .current-group .current-group-item{
    padding: 5px 10px;
    padding-right:15px;
    margin: 0 10px;
    font-size: 14px;
    font-weight: bold;
    min-width:60px;
    text-align:center;
    border-radius:50px;
    border:solid 1px #0079FE;
    color:#0079FE;
    position:relative;
 }

 .current-group .current-group-item .current-group-close{
    cursor:pointer;
    position:absolute;
    right:4px;
    top:-1px;
    padding:5px;
  }
`;

function SelectArea(data, onChange) {
  this.$data = data;
  this.$value = [];
  this.$level = 0;
  this.$onChange = function () {
    onChange && onChange(this.$value);
    this.updateCurrentGroup();
  };
  this.$groupContainer = $(`<div class="group-container"></div>`);
}

// 初始化
SelectArea.prototype.render = function () {
  this.$element = [];

  const roots = this.$data.filter((x) => !x.parent);
  const rootGroup = this.generateRootGroup();
  const currentGroup = this.generateCurrentGroup();

  this.$element.push(rootGroup);
  this.$element.push(this.$groupContainer);
  this.$element.push(currentGroup);

  const root = roots[0];
  this.generate(root, 0);

  setTimeout(() => {
    this.updateCurrentGroup();
  });

  return this.$element;
};

SelectArea.prototype.generateCurrentGroup = function () {
  const group = $('<div class="current-group"></div>');
  const groupTitle = $("<div class='group-title'></div>");
  const groupContainer = $("<div class='group-container'></div>");

  groupTitle.text("已选位置");

  group.append(groupTitle, groupContainer);
  return group;
};

SelectArea.prototype.updateCurrentGroup = function () {
  const groupContainer = $(".current-group .group-container");
  groupContainer.empty();
  const groups = this.$value.map((item, index) => {
    const node = $(`<div class="current-group-item"></div>`);
    const text = $(`<div class="current-group-text" ></div>`);
    const close = $(`<div class="current-group-close"></div>`);

    close.click(() => {
      const level = index;
      const prev = $(`.data-group-level-${level} .data-group-item.active`);
      const node = $(
        `.data-group-level-${level} .data-group-item.all-selection`
      );
      prev.removeClass("active");
      node.addClass("active");

      this.generate(null, level);
      this.$value = this.$value.slice(0, level);
      this.$onChange();
    });

    node.append(text);
    if (index !== 0) node.append(close);

    text.text(item.title);
    close.text("x");
    return node;
  });

  groupContainer.append(groups);
};

SelectArea.prototype.generate = function (data, _level) {
  this.$level = _level;
  let currentLevel = _level;

  while ($(`.data-group-level-${currentLevel + 1}`).length) {
    const target = $(`.data-group-level-${currentLevel + 1}`);
    target.remove();
    currentLevel += 1;
  }

  if (!data) {
    return;
  }
  const action = (data, level) => {
    const children = this.$data.filter((x) => x.parent === data.id);
    if (children && children.length) {
      this.$level = level + 1;
      const group = this.generateGroup(children, level);
      this.$groupContainer.append(group);
      action(children[0], this.$level);
    }
  };

  action(data, this.$level + 1);
};
/**
 * 生成根选项组
 */
SelectArea.prototype.generateRootGroup = function () {
  // 获取根节点
  const roots = this.$data.filter((x) => !x.parent);
  // 生成根容器
  const rootGroup = $("<div class='root-group'></div>");
  // 根容器样式
  const rootGroupStyle = {
    display: "flex",
    padding: "10px",
  };

  const rootItems = roots.map((root, index) =>
    this.generateRoot(root, index === 0)
  );

  rootGroup.append(rootItems);
  rootGroup.css(rootGroupStyle);

  return rootGroup;
};

// 生成根组件
SelectArea.prototype.generateRoot = function (item, active) {
  const root = $("<div class='root-item'></div>");
  const rootStyle = {};

  // 设置文本
  root.text(item.title);
  root.css(rootStyle);

  root.click(() => {
    $(".root-item.active").removeClass("active");
    root.addClass("active");

    this.$value = [item];
    this.generate(item, 0);
    this.$onChange();
  });

  if (active) {
    root.addClass("active");
    this.$value[0] = item;
  }

  return root;
};

// 生成数据组
SelectArea.prototype.generateGroup = function (list, level) {
  const group = $(`<div class='data-group data-group-level-${level}'></div>`);
  const groupTitle = $("<div class='data-group-title'></div>");
  const groupContainer = $("<div class='data-group-container'></div>");

  const items = list.map((item, index) =>
    this.generateGroupItem(item, index === 0, level)
  );

  item = this.generateAllSelectGroupItem(level);

  group.append(groupTitle, groupContainer);

  groupTitle.text(list[0].group);
  groupContainer.append(item, items);

  return group;
};

SelectArea.prototype.generateAllSelectGroupItem = function (level) {
  const node = $("<div class='data-group-item all-selection'></div>");

  // 设置文本
  node.text("全选");

  node.click(() => {
    const prev = $(`.data-group-level-${level} .data-group-item.active`);
    prev.removeClass("active");
    node.addClass("active");

    this.generate(null, level);
    this.$value = this.$value.slice(0, level);
    this.$onChange();
  });

  return node;
};

SelectArea.prototype.generateGroupItem = function (item, active, level) {
  const node = $("<div class='data-group-item'></div>");

  // 设置文本
  node.text(item.title);

  node.click(() => {
    const prev = $(`.data-group-level-${level} .data-group-item.active`);

    prev.removeClass("active");
    node.addClass("active");

    this.$value = this.$value.slice(0, level);
    this.$value[level] = item;
    this.generate(item, level);
    this.$onChange();
  });

  if (active) {
    node.addClass("active");
    this.$value[level] = item;
  }

  return node;
};

// 选择区域生成插件
// params:
//    container- 生成容器
//    data: 显示数据
//    onChange : 数据修改回调
$.fn.generateSelectArea = function (data, onChange) {
  var selectArea = new SelectArea(data, onChange);
  this.html(selectArea.render());
};

// 安装组件样式
function installComponetStyle() {
  var textNode = document.createTextNode(styles);
  var style = document.createElement("style");
  style.type = "text/css";
  style.appendChild(textNode);
  document.head.appendChild(style);
}

installComponetStyle();
