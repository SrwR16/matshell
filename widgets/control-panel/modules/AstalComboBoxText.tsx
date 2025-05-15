import { astalify, Gtk } from "astal/gtk4";

const AstalComboBoxText = astalify(Gtk.ComboBoxText, {
  getChildren(self) {
    return [];
  },
  setChildren(self, children) {
    // Add new items
    if (Array.isArray(children)) {
      children.forEach((child) => {
        if (child && typeof child === "object" && "text" in child) {
          self.append_text(child.text);
        }
      });
    }
  },
});

export default AstalComboBoxText;
