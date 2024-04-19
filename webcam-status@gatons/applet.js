
const Applet = imports.ui.applet;
const Util = imports.misc.util;
const UUID = "webcam-status@gatons";
const Settings = imports.ui.settings;  // Needed for settings API
const Gio = imports.gi.Gio;
var currentState; //1 - enabled; 0 - disabled

function MyApplet(orientation,metadata, panelHeight, instance_id) {
    this._init(orientation,metadata, panelHeight, instance_id);
}

MyApplet.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(orientation,metadata, panelHeight, instance_id) {
        Applet.IconApplet.prototype._init.call(this, orientation, panelHeight,  instance_id);

        this.instance_id=instance_id;
        this.appletPath=metadata.path;

        try {
            this.settings = new Settings.AppletSettings(this, metadata.uuid, this.instance_id)

            //default webcam state
            this.settings.bindProperty(Settings.BindingDirection.IN,
                "webcam-disabled",
                "webcamDisabled",
                null,
                null);
            
            //default theme
            this.settings.bindProperty(Settings.BindingDirection.IN,
                "status-theme",
                "theme",
                null,
                null);

            //set theme
            if(this.theme == 1) {
                this.onIcon = "dark-on";
                this.offIcon = "dark-off";
            }
            else {
                this.onIcon = "on";
                this.offIcon = "off";
            }


            //set webcam state
            if(this.webcamDisabled == true) {
                Util.spawnCommandLine('sudo modprobe -r uvcvideo');
                this.set_applet_icon_name(this.offIcon);
                this.currentState = 0;
            }
            else {
                Util.spawnCommandLine('sudo modprobe uvcvideo');
                this.set_applet_icon_name(this.onIcon);
                this.currentState = 1;
            }
        }
        catch (e) {
            global.logError(e);
        }
        
        this.set_applet_tooltip(_("Click here block/unblock webcamera devices"));
    },

    notify_send: function(notification) {
        Util.spawnCommandLine('notify-send --hint=int:transient:1 "' + notification + '" -i camera-web');
    },

    on_settings_changed: function() {
        if(this.currentState == 1) {
            Util.spawnCommandLine('sudo modprobe -r uvcvideo');
            this.set_applet_icon_name(this.offIcon);
            this.currentState = 0;
            this.notify_send(_("Webcam disabled."));
        }
        else {
            Util.spawnCommandLine('sudo modprobe uvcvideo');
            this.set_applet_icon_name(this.onIcon);
            this.currentState = 1;
            this.notify_send(_("Webcam enabled."));
        }
     },

    on_applet_clicked: function(event) {
        this.on_settings_changed();
    }

};

function main(metadata,orientation, panelHeight,  instance_id) {
    let myApplet = new MyApplet(orientation,metadata, panelHeight, instance_id);
    return myApplet;
}
