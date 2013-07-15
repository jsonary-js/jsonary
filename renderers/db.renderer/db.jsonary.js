/**
 * (c) 2013 OGI-IT.
 * License: MIT
 * based on plain.jsonary.js
 * User: ogi
 * Date: 15.07.13
 * Time: 11:20
 */

var JsonaryTableCacheController = {
    'cache': {}, //this is a Class var!!

    'cleanup': function () {
        for (i in this.cache) {
            Jsonary.render.deregister(this.cache[i]);
            delete this.cache[i];
            //console.log("JsonaryTableCacheController deregistered "+i);
        }
        ;
    },
    //
    'conditionalAdd': function (key, columns, titles) {
        if (this.cache[key] == undefined) {
            var config = {
                addClass: "json-detail-table-add",
                removeClass: "json-detail-table-remove",
                tableClass: "json-detail-table",
                addHtml: "+", // Text for adding, we use a png
                removeHtml: "x", //Text for removing, we use a png
                sort: {}
            };
            var tRenderer = new Jsonary.plugins.FancyTableRenderer(config);
//            var tRenderer = new Jsonary.TableRenderer();
            for (k in columns) {
                var c = columns[k];
                var t = titles[k];
                //tRenderer.addColumn(c, t, true); // property , title, if header sortable
                tRenderer.addColumn("/" + c, t); // property , title, renderHtml function  !!!!!DIFFERENT FUNLTIONALITYB!!!
                tRenderer.config.sort["/" + c] = true;
            }
            ;
            var registeredTRenderer = tRenderer.register(function (data, schemas) {
                return schemas.containsUrl(key);
            });

            //var registeredTRenderer = Jsonary.render.register(tRenderer);
            this.cache[key] = registeredTRenderer; //Important do do this here, since the renderer is "enriched" with info !!!
            //console.log("JsonaryTableCacheController registered "+key);
        }
    }

};
var createJsonaryTableCacheController = function () {
    return Object.create(JsonaryTableCacheController); //better than new
    //here we could add instance vars
};

//var TheJsonaryTableCacheController = createJsonaryTableCacheController();
this.TheJsonaryTableCacheController = createJsonaryTableCacheController(); //make it global !!!


// Display-asTable extension
Jsonary.extendSchema({
    displayAsTable: function () {
        return this.data.propertyValue("displayAsTable");
    }
});
Jsonary.extendSchemaList({
    displayAsTable: function () {
        var displayAsTable = false;
        this.each(function (index, schema) {
            var value = schema.displayAsTable();
            if (value != null && value) {
                displayAsTable = value;
            }
        });
        return displayAsTable;
    }
});

Jsonary.extendSchemaList({
    referenceUrls: function () {
        var refUrls = [];
        this.each(function (index, schema) {
            var refUrl = schema.referenceUrl();
            if (refUrl) {
                refUrls.push(refUrl);
            }
        });
        return refUrls.length ? refUrls.join(" ; ") : null
    }
});


//Changed by ogi to display titel or key
//check if when this is commented out, the new build in title function does the same...
// the new one is sligthly different in that case that if there is no title "" is returned instead of null
// and even when this is executed the build in is used!!
//Jsonary.extendSchemaList({
//    title: function () {
//        var titles = [];
//        this.each(function (index, schema) {
//            var title = schema.title();
//            if (title) {
//                titles.push(title);
//            }
//        });
//        return titles.length ? titles.join(", ") : null
//    }
//});

// now independent of branch...
// Display-order extension
Jsonary.extendSchema({
    displayOrder: function () {
        return this.data.propertyValue("displayOrder");
    }
});
Jsonary.extendSchemaList({
    displayOrder: function () {
        var displayOrder = null;
        this.each(function (index, schema) {
            var value = schema.displayOrder();
            if (value != null && (displayOrder == null || value < displayOrder)) {
                displayOrder = value;
            }
        });
        return displayOrder;
    }
});

//=================
//change ADD_REMOVE renderer to emmit different class name for "object" and "array"
//so that icon's can be different
//TODO: always check for changes with new plain.jsonary.js renderer...

Jsonary.render.register({
    component: Jsonary.render.Components.ADD_REMOVE,
    renderHtml: function (data, context) {
        if (!data.defined()) {
            context.uiState.undefined = true;
            var title = "add";
            var parent = data.parent();
            if (parent && parent.basicType() == 'array') {
                var schemas = parent.schemas().indexSchemas(data.parentKey());
                schemas.getFull(function (s) {
                    schemas = s;
                });
                title = schemas.title() || title;
            } else if (parent && parent.basicType() == 'object') {
                var schemas = parent.schemas().propertySchemas(data.parentKey());
                schemas.getFull(function (s) {
                    schemas = s;
                });
                title = schemas.title() || data.parentKey() || title;
            }
            return context.actionHtml('<span class="json-undefined-create">+ ' + Jsonary.escapeHtml(title) + '</span>', "create");
        }
        delete context.uiState.undefined;
        var showDelete = false;
        if (data.parent() != null) {
            var parent = data.parent();
            if (parent.basicType() == "object") {
                var required = parent.schemas().requiredProperties();
                var minProperties = parent.schemas().minProperties();
                showDelete = required.indexOf(data.parentKey()) == -1 && parent.keys().length > minProperties;
            } else if (parent.basicType() == "array") {
                var tupleTypingLength = parent.schemas().tupleTypingLength();
                var minItems = parent.schemas().minItems();
                var index = parseInt(data.parentKey());
                if ((index >= tupleTypingLength || index == parent.length() - 1)
                    && parent.length() > minItems) {
                    showDelete = true;
                }
            }
        }
        var result = "";
        if (showDelete) {
            result += "<div class='json-object-delete-container'>";
//            result += context.actionHtml("<span class='json-object-delete'>X</span>", "remove") + " "; //only this line is changed
            result += context.actionHtml("<span class='" + "json-object-delete-" + parent.basicType() + "'>X</span>", "remove") + " "; //changed by ogi! parent.basicType() resolves to either "object" or "array"
            result += context.renderHtml(data, 'data');
            result += '<div style="clear: both"></div></div>';
        } else {
            result += context.renderHtml(data, 'data');
        }
        return result;
    },
    action: function (context, actionName) {
        if (actionName == "create") {
            var data = context.data;
            var parent = data.parent();
            var finalComponent = data.parentKey();
            if (parent != undefined) {
                var parentSchemas = parent.schemas();
                if (parent.basicType() == "array") {
                    parentSchemas.createValueForIndex(finalComponent, function (newValue) {
                        parent.index(finalComponent).setValue(newValue);
                    });
                } else {
                    if (parent.basicType() != "object") {
                        parent.setValue({});
                    }
                    parentSchemas.createValueForProperty(finalComponent, function (newValue) {
                        parent.property(finalComponent).setValue(newValue);
                    });
                }
            } else {
                data.schemas().createValue(function (newValue) {
                    data.setValue(newValue);
                });
            }
        } else if (actionName == "remove") {
            context.data.remove();
        } else {
            alert("Unkown action: " + actionName);
        }
    },
    update: function (element, data, context, operation) {
        return context.uiState.undefined;
    },
    filter: function (data) {
        return !data.readOnly();
    },
    saveState: function (uiState, subStates) {
        return subStates.data;
    },
    loadState: function (savedState) {
        return [
            {},
            {data: savedState}
        ];
    }
});


//========= pure ogi functionality

function addControllerforDisplayAsTable(subSchemas) {
// here starts the Part to display array's as Table
    if (subSchemas.displayAsTable()) {
        //console.log("key:" + key + " subData ref Url:" + subData.schemas().referenceUrls() + " subSchemas ref Url:" + subSchemas.referenceUrls());
        var keyURI = subSchemas.referenceUrls();
        var columns = subSchemas.indexSchemas().knownProperties();
        var titles = [];
        for (var k in columns) {
            var c = columns[k];
            var t = subSchemas.indexSchemas().propertySchemas(c).title();
            // titles[k] = t == null ? c : t; this is for my titles extension
            titles[k] = t == "" ? c : t; //this is for the default provided one...
        }
        TheJsonaryTableCacheController.conditionalAdd(keyURI, columns, titles);
    }
    ;
//here ends the display as Table part
}

//var displayOrderSortingFunction = function (a, b) {
//    if (a.displayOrder == null) {
//        if (b.displayOrder == null) {
//            return 0;
//        }
//        return 1;
//    } else if (b.displayOrder == null) {
//        return -1;
//    }
//    return a.displayOrder - b.displayOrder;
//};
//
//
//
////========= here starts rewrite of the new edit object
//// we added displayOrder sorting; removed the fieldset; added class vor readOnly for better css; and the TableRenderer NOT YET !!!!!!!!!
//
//// Display/edit objects
//Jsonary.render.register({
//    renderHtml: function (data, context) {
//        var uiState = context.uiState;
//        var result = "";
////        result += '<fieldset class="json-object-outer">'; //ogi: no fieldset
//        var title = data.schemas().title();
////        if (title) { //ogi: no fieldset
////            result += '<legend class="json-object-title">' + Jsonary.escapeHtml(title) + '</legend>';
////        }
//        result += '<table class="json-object'+(data.readOnly()?'-readOnly':'')+'"><tbody>'; // ogi changed for better readOnly css
//        var drawProperty = function (key, subData) {
//            result += '<tr class="json-object-pair">';
//            if (subData.defined()) {
//                var title = subData.schemas().title();
//            } else {
//                var title = subData.parent().schemas().propertySchemas(subData.parentKey()).title();
//            }
//            if (title == "") {
//                result +=	'<td class="json-object-key"><div class="json-object-key-title">' + escapeHtml(key) + '</div></td>';
//            } else {
//                result +=	'<td class="json-object-key"><div class="json-object-key-title">' + escapeHtml(key) + '</div><div class="json-object-key-text">' + escapeHtml(title) + '</div></td>';
//            }
//            result += '<td class="json-object-value">' + context.renderHtml(subData) + '</td>';
//            result += '</tr>';
//        }
//        if (!data.readOnly()) {
//            var schemas = data.schemas();
//            var definedProperties = schemas.definedProperties();
//            var maxProperties = schemas.maxProperties();
//            var canAdd = (maxProperties == null || maxProperties > schemas.keys().length);
//            // ogi start displayOrder sorting; definedProperties are the key's
//            definedProperties.sort(displayOrderSortingFunction );
//            // sort order is maintained for definedProperties and not for other ones (for now we define all keys...) see #73
//            //ogi end
//            data.properties(definedProperties, function (key, subData) {
//                if (canAdd || subData.defined()) {
//                    drawProperty(key, subData);
//                }
//            }, drawProperty);
//
//            if (canAdd && schemas.allowedAdditionalProperties()) {
//                result += '<tr class="json-object-pair"><td class="json-object-key"><div class="json-object-key-text">';
//                result += context.actionHtml('+ new', "add-new");
//                result += '</div></td><td></td></tr>';
//            }
//        } else {
//            // ogi start displayOrder sorting
//            var keys = data.keys(); // easier than iterating over them with data.properties
//            keys.sort(displayOrderSortingFunction );
//            //ogi end
//            data.properties(keys, drawProperty); //using different form of data.properties; the one where the keys are provided in an order see #73
//        }
//        result += '</table>';
////        result += '</fieldset>'; //ogi: no fieldset
//        return result;
//    },
//    action: function (context, actionName, arg1) {
//        var data = context.data;
//        if (actionName == "add-named") {
//            var key = arg1;
//            data.schemas().createValueForProperty(key, function (newValue) {
//                data.property(key).setValue(newValue);
//            });
//        } else if (actionName == "add-new") {
//            var key = window.prompt("New key:", "key");
//            if (key != null && !data.property(key).defined()) {
//                data.schemas().createValueForProperty(key, function (newValue) {
//                    data.property(key).setValue(newValue);
//                });
//            }
//        }
//    },
//    filter: function (data) {
//        return data.basicType() == "object";
//    }
//});


//*************************************** old version start ************************************************************
//TODO: always check for changes with new plain.jsonary.js renderer...
// Display/edit objects
Jsonary.render.register({
    renderHtml: function (data, context) {
        var uiState = context.uiState;
        var result = '<table class="json-object"><tbody>';

        //ogi start
        if (data.readOnly())result = '<table class="json-object-readOnly"><tbody>';
        //ogi end

        var orderKeys = [];
        data.properties(function (key, subData) {
            orderKeys.push({
                key: key,
                displayOrder: subData.schemas().displayOrder()
            });
        });
        orderKeys.sort(function (a, b) {
            if (a.displayOrder == null) {
                if (b.displayOrder == null) {
                    return 0;
                }
                return 1;
            } else if (b.displayOrder == null) {
                return -1;
            }
            return a.displayOrder - b.displayOrder;
        });
        for (var i = 0; i < orderKeys.length; i++) {
            var key = orderKeys[i].key;
            var subData = data.property(key);
            result += '<tr class="json-object-pair">';

            //ogi start
            // here we get the schema independent of having data
            // we need this both for displaying a title instead of the key and for displaying as a Table
            var subSchemas = data.schemas().propertySchemas(key);
            subSchemas.getFull(function (fullSchemaList) {
                subSchemas = fullSchemaList;
            }); //this returns immediate only if in cache !!!
            var keyTitle = subSchemas.title();
            var keyTitleIfRef = data.schemas().propertySchemas(key).title();
            keyTitle = keyTitleIfRef || keyTitle; //if there is a keyTitleRef use this one
            keyTitle = keyTitle || key; // uses "key" if "keyTitle" is null

            addControllerforDisplayAsTable(subSchemas); // ogi part


            result += '<td class="json-object-key"><div class="json-object-key-text">' + escapeHtml(keyTitle) + '</div></td>';

            //ogi end !!
            result += '<td class="json-object-value">' + context.renderHtml(subData) + '</td>';
            result += '</tr>';
        }
        result += '</tbody></table>';
        if (!data.readOnly()) {
            var schemas = data.schemas();
            var maxProperties = schemas.maxProperties();
            if (maxProperties == null || maxProperties > data.keys().length) {
                var addLinkHtml = "";
                var definedProperties = schemas.definedProperties();
                var keyFunction = function (index, key) {
                    //ogi start
                    var subData = data.property(key);
                    var subSchemas = data.schemas().propertySchemas(key);
                    subSchemas.getFull(function (fullSchemaList) {
                        subSchemas = fullSchemaList;
                    }); //this returns immediate only if in cache !!!
                    var keyTitle = subSchemas.title();
                    var keyTitleIfRef = data.schemas().propertySchemas(key).title();
                    keyTitle = keyTitleIfRef || keyTitle; //if there is a keyTitleRef use this one

                    keyTitle = keyTitle || key; // uses "key" if "keyTitle" is null
                    var addHtml = '<span class="json-object-add-key">' + escapeHtml(keyTitle) + '</span>';
                    //ogi end !!
                    addLinkHtml += context.actionHtml(addHtml, "add-named", key);
                };
                for (var i = 0; i < definedProperties.length; i++) {
                    if (!data.property(definedProperties[i]).defined()) {
                        keyFunction(i, definedProperties[i]);
                    }
                }
                if (schemas.allowedAdditionalProperties()) {
                    var newHtml = '<span class="json-object-add-key-new">+ new</span>';
                    addLinkHtml += context.actionHtml(newHtml, "add-new");
                }
                if (addLinkHtml != "") {
                    result += '<span class="json-object-add">add: ' + addLinkHtml + '</span>';
                }
            }
        }
        return result;
    },
    action: function (context, actionName, arg1) {
        var data = context.data;
        if (actionName == "add-named") {
            var key = arg1;
            data.schemas().createValueForProperty(key, function (newValue) {
                data.property(key).setValue(newValue);
            });
        } else if (actionName == "add-new") {
            var key = window.prompt("New key:", "key");
            if (key != null && !data.property(key).defined()) {
                data.schemas().createValueForProperty(key, function (newValue) {
                    data.property(key).setValue(newValue);
                });
            }
        }
    },
    filter: function (data) {
        return data.basicType() == "object";
    }
});
//*************************************** old version end  *************************************************************


//===========

//Cool example !!!
Jsonary.render.Components.add('VALIDATION');

Jsonary.render.register({
    component: Jsonary.render.Components.VALIDATION,
    renderHtml: function (data, context) {
        var result = "";
        var rootData = data.document.root;
        if (!!rootData.validation) {
            if (data.pointerPath() != "") {
                for (i in rootData.validation.errors) {
                    if (rootData.validation.errors[i].dataPath == data.pointerPath()) {
                        //result += "<span class='validationError'>(validation message: " + rootData.validation.errors[i].message+" code: "+rootData.validation.errors[i].code+" schemaKey: "+rootData.validation.errors[i].schemaKey+")</span>";
                        result += "<span class='validationError'>" + rootData.validation.errors[i].message + "</span>";
                        //remove i entry in errors
                        rootData.validation.errors.splice(i, 1);
                    }
                    ;
                }
                ;
            }
            //else {
            // result += "<span class='validationError'>(validation info: " + JSON.stringify(rootData.validation.errors, undefined, 2) + ")</span>";
            // it is not a good idea to display something here since we do not know which errors can be displayed by subsequent nodes
            // therefore the remaining errors are displayed after renderTo
            //}
            ;
        }
        ;
        return context.renderHtml(data) + result;
    }
});
