let widget = new ListWidget();
let stack = widget.addStack();
stack.addText(Script.name()).centerAlignText();
//stack.addText(Script.name)
if (config.runsInAccessoryWidget) Script.setWidget(widget);
else widget.presentSmall();
