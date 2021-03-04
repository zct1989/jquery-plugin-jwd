function DisplayArea(data, options) {
  this.$data = data;
  this.$options = options;
  this.$groupContainer = $(`<div class="group-container"></div>`);
}

DisplayArea.prototype.render = function () {
  this.$element = [];
  this.$value = [];

  this.$emit = function (type) {
    if (this.$options.event) {
      this.$options.event(type, this.$value);
    }
  };

  const tool = this.generateAction();
  this.$element.push(tool);

  const action = (data) => {
    let node;

    if (!data.leaf) {
      node = this.generateGroup(data);
    } else {
      node = this.generateGroupItem(data);
    }

    if (data.children) {
      const children = data.children.map((x) => action(x));
      const container = node.children(".display-group-container");
      container.append(children);

      if (data.children.some((x) => x.leaf)) {
        container.addClass("leaf-container");
      }
    }

    return node;
  };

  this.$data.forEach((x) => {
    let node = action(x);
    this.$element.push(node);
  });

  return this.$element;
};

DisplayArea.prototype.generateAction = function () {
  const container = $(`<div class="display-group-action"></div>`);

  const checkbox = $(
    `<input type="checkbox" id="display-all-selection" class="all-selection-checkbox" />`
  );

  const label = $(
    '<label for="display-all-selection" style="margin-right:20px;user-select:none;">全选</label>'
  );

  const updateAction = $(
    `<div class="update-action action-button">修改墓位</div>`
  );

  const deleteAction = $(`<div class="delete-action action-button">删除</div>`);
  const lockAction = $(`<div class="update-action action-button">锁定</div>`);
  const unlockAction = $(`<div class="update-action action-button">解锁</div>`);

  container.append(checkbox, label);
  container.append(updateAction);
  container.append(deleteAction);
  container.append(lockAction);
  container.append(unlockAction);

  checkbox.change((e) => {
    const checked = e.target.checked;

    if (checked) {
      const items = $(".display-group-container .display-group-item").not(
        ".active"
      );

      items.each((index) => {
        const node = $(items[index]);
        const data = node.data();
        this.$value.push(data);

        node.addClass("active");
      });
    } else {
      const items = $(".display-group-container .display-group-item.active");

      items.each((index) => {
        const node = $(items[index]);
        const data = node.data();
        const targetIndex = this.$value.findIndex((x) => x === data);
        this.$value.splice(targetIndex, 1);

        node.removeClass("active");
      });
    }
  });

  updateAction.click(() => {
    this.$emit("UPDATE");
  });

  deleteAction.click(() => {
    this.$emit("DELETE");
  });

  lockAction.click(() => {
    const items = $(".display-group-container .display-group-item.active");
    items.each((index) => {
      const node = $(items[index]);
      const data = node.data();
      data.lock = true;

      const lock = node.children(".lock-icon");
      lock.css({ display: "block" });
    });

    this.$emit("LOCK");
  });

  unlockAction.click(() => {
    const items = $(".display-group-container .display-group-item.active");
    items.each((index) => {
      const node = $(items[index]);
      const data = node.data();
      data.lock = false;

      const lock = node.children(".lock-icon");
      lock.css({ display: "none" });
    });

    this.$emit("UNLOCK");
  });

  return container;
};

DisplayArea.prototype.generateGroup = function (data) {
  const group = $('<div class="display-group"></div>');
  const groupTitle = $('<div class="display-group-title"></div>');
  const groupContainer = $('<div class="display-group-container"></div>');

  groupTitle.text(data.title);

  group.append(groupTitle, groupContainer);

  return group;
};

DisplayArea.prototype.generateGroupItem = function (data) {
  const item = $('<div class="display-group-item"></div>');

  const iconImage = this.$options.images[data.state];
  const lockImage = this.$options.images["LOCK"];
  const image = $(`<img class="state-icon" src="${iconImage}"/>`);
  const lock = $(`<img class="lock-icon" src="${lockImage}"/>`);
  const title = $(`<div class="title"></div>`);
  const price = $(`<div class="price"></div>`);

  title.text(data.title);
  price.text(`￥${data.price}`);

  item.data("value", data);

  item.append(image, title, price);
  item.append(lock);

  if (!data.lock) {
    lock.css({ display: "none" });
  }

  item.click(() => {
    const isActive = item.hasClass("active");

    if (isActive) {
      item.removeClass("active");
      const index = this.$value.findIndex((x) => x === data);
      this.$value.splice(index, 1);
    } else {
      item.addClass("active");
      this.$value.push(data);
    }
  });

  return item;
};

(function ($) {
  // 基础样式
  const styles = `
    .display-group .display-group-container{
      margin-left:1.5em;
    }

    .display-group .display-group-container.leaf-container{
      display:flex;
      flex-direction:row;
      flex-wrap:wrap;
      padding:15px 5px;
    }


    .display-group .display-group-title{
     border-bottom:solid 1px rgba(0,0,0,0.1);
     padding:10px;
     font-size:14px;
     color:rgba(0,0,0,0.75);
    }

    .display-group .display-group-container .display-group-item{
      background-color:#F7F7F7;
      text-align:center;
      width:100px;
      height:100px;
      border-radius:10px;
      margin:10px;
      position:relative;
      display:flex;
      flex-direction:column;
      justify-content:center;
      align-items:center;
      cursor:pointer;
    }

    .display-group .display-group-container .display-group-item.active{
      background-color:#00AAEE;
      }

    .display-group .display-group-container .display-group-item .state-icon{
      width:32px;
      height:32px;
      padding:5px;
    }

    .display-group .display-group-container .display-group-item .lock-icon{
      position:absolute;
      width:20px;
      height:20px;
      right:5px;
      top:5px;
    }

    .display-group .display-group-container .display-group-item .title{
      margin-top:2px;
      font-size:16px;
      font-weight:bold;
    }
    
    .display-group .display-group-container .display-group-item .price{
      font-size:14px;
      font-weight:bold;
      color:rgba(0,0,0,0.9);
    }

    .display-group-action{
      border-bottom:solid 1px rgba(0,0,0,0.1);
      padding:10px;
    }

    .display-group-action .action-button{
      padding:5px 20px;
      background-color:#0079FE;
      color:#fff;
      display:inline-block;
      text-align:center;
      min-width:60px;
      border-radius:20px;
      cursor:pointer;
      font-size:14px;
      margin-right:20px;
    }

    .display-group-action .action-button:hover{
      background-color:#0099FE;
    }

    .display-group-action .action-button:active{
      background-color:#00A9FE;
    }

  `;
  // 选择区域生成插件
  // params:
  //    container- 生成容器
  //    data: 显示数据
  //    onChange : 数据修改回调
  $.fn.generateDisplayArea = function (data, options) {
    const displayArea = new DisplayArea(data, options);
    this.html(displayArea.render());
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
})(jQuery);
