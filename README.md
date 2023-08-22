# APROPLAN API

## Breaking change V.20

To improve the performance of our API we made some infrastructure improvements requiring a breaking change in the API calls.

Now, for each call to our API for an entity linked to a project, you need to supply a new parameter to the call: **projectid**

`https://app.aproplan.com/rest/notes?projectid={projectid}&t={mytoken}[&requesterid={myrequesterid}&filter={filtervalue}][&pathtoload={pathtoloadvalue}][&sortorder={sortordervalue}][&withdeleted={withdeletedvalue}][&v={apiVersion}]`

So, now you receive data by project.
The cutt-off date for older version is Monday 2019/02/11

## Introduction

You can communicate with APROPLAN by using REST functions provided by the API at the <https://api.aproplan.com/rest> url.
This nodejs module will show us some sample to interact with our API to create, modify or delete data into the platform in a programmatic way.

## Testing

Instead of to make your development with our API directly on the production, you can test first your development by using the following API address: <https://api.aproplan-development.aproplan-prod1.lb4.co/rest> url. When you have validated your development, you can redirect to the production url.

## Documentation

We do not have yet an online documentation but we have an OpenApi document that you can open in the online swagger editor.
Upload the `swagger.yaml` file in <https://editor.swagger.io/>

## Quick start

1. To use APROPLAN, you need to have a requester to identify your application. Please contact the support if you don't have a requester id yet.
1. Clone the repository

The application shows you how to use the api with several samples:

* Login (Services/authService.js)
  * To make a login into APROPLAN
  * To renew the token
* To get entities with filters (index.js)
* Projects (Services/projectService.js)
  * To retrieve the list of projects and then, to select one to work on it
  * To retrieve the folder structure of the selected project
* Points (Services/pointService.js)
  * Retrieve the list of points (max 15) of the selected project
  * Update a point by changing its status6
  * Create a new point by selecting list, due date, subject and the first comment

To work on objects related to a projects (lists, points, forms...), you need first to select a project with the related sample. Then, you need to run the sample "Select a working project by its id".

### Nodejs

* Go to nodejs folder
* Fill parameters with your requester id, the API url and credentials to use in the config.js file
* Run `npm install` to install packages (you need to have nodejs installed)
* Run `node index.js` to run the program to show some sample

## Using the API

When you use APROPLAN API it is better to make first your test on the following url <https://api.aproplan-development.aproplan-prod1.lb4.co/rest> (application url: <https://app.aproplan-development.aproplan-prod1.lb4.co>).
Before to use the API, you need to have a **requesterid** supplied by us. To get one requester, please contact the support. When you have it, you can start to call the APROPLAN API.
For each call of the API, you need to have 3 mandatory parameters:

* **v** specifying the version of the API to use. Actual version = 15 (v=15)
* **requesterid** to specify your requester id. A requesterId is a unique guid assigned to your product. You need to request one from <https://www.aproplan.com/integrations>
* **t** to specify the token your receive while you call the **loginsecure** method to identify the user making the call. This parameter is not always mandatory, some calls doet not require to be authentified.

But there are also some optional parameter:

* **appVersion** this parameter allow you to identify the version of your product making the call to our API. It is optional but when supplied it makes easier the trace of the changes and errors of an application. The value of this parameter will appear in the APROPLAN log and in any record changed by the application
* **transactionguid** This parameter allows you to defined an identification for a transaction when you save several entities using the API then, if while you have updated some data, you didn't receive the answer from the server (network problem...) but some data have been successfully saved, you can retry with the same transaction id and there won't be error (for duplicated data for example).
* **dateformat** This parameter is used when you call the Api to know how the date object will be serialized. There is two kind of format:
  * **microsoft** (default): Dates are written in the Microsoft JSON format, e.g. "\/Date(1198908717056)\/".
  * **iso**: Dates are written in the ISO 8601 format, e.g. "2012-03-21T05:40Z"

For all call on entities linked to a project, it is necessary to add the following mandatory parameter:

* **projectid** specifying the project id linked to the entities for which your are making the request

### Login

To use the api, you need to be authentified. So you need to make login first by using your login and password. In the response, you will receive a token you need to use for all next API call.
This token is valid for little period (10min) then, to continue to use the API, you need to renew the token before the end of this period. For more information, check the swagger file.

### Get methods

You have several kinds of GET calls that you can make into APROPLAN.

General optional parameter:

* **withdeleted**: Aproplan never physically deletes an entity. You can retrieve deletde entities by using the withdeleted parameter.  If the withdeletedvalue is "true", then the deleted entities will also be retrieved
* **findfirst**: This parameter is necassary if you want to retrieve only the first data of the request. 

#### Get entities

<https://app.aproplan.com/rest/entityname?t={mytoken}[&requesterid={myrequesterid}&filter={filtervalue}][&pathtoload={pathtoloadvalue}][&sortorder={sortordervalue}][&withdeleted={withdeletedvalue}][&v={apiVersion}]>

You will retrieve all the entities of the "entityname" type

* filtered by filtervalue
* with all the children entities corresponding to the pathtoload
* order according to the sortordervalue

filter, pathtoload and sortorder are explained more below.

Url parts:

* **entityname**: this is the entity you want to retrieve (in plurals, eg: document -> rest/documents).

Some entities can be part of huge lists. To preserve performances, the number of such entities returned in lists are limited to a maximum of  200.

In order to get more entities, you need to follow two steps:

Get the ids of the entities you would like to retrieve (max 10000)
Get the data of the entities you would like to retrieve by blocks of maximum 200 entities.

#### Get ids of entities

<https://app.aproplan.com/rest/entitynameids?t={mytoken}&requesterid={myrequesterid}&filter={filtervalue}][&sortorder={sortordervalue}][&withdeleted={withdeletedvalue}][&v={apiVersion}]>

You will retrieve the ids of all the entities of "entityname" type,

* filtered by the filtervalue
* ordered according to sortordervalue

When you call this url, the servers will return a maximum of  10000 ids.

Url parts:

* **entityname**: this is the entity you want to retrieve (in plurals, eg: document -> rest/documentsids).

#### Get entities from ids

<https://app.aproplan.com/rest/entityname?t={mytoken}&requesterid={myrequesterid}&[&ids={listofids}][&pathtoload={pathtoloadvalue}][&v={apiVersion}]>

you will retrieve all the entities of "entityname" type,

* corresponding to the ids listed in the listofids parameter
* with all the children entities corresponding to the pathtoloadvalue

Url parts:

* **entityname**: this is the entity you want to retrieve (in plurals, eg: document -> rest/documents).

#### Get count

<https://app.aproplan.com/rest/entitynamecount?t={mytoken}&requesterid={myrequesterid}&filter={filtervalue}][&withdeleted={withdeletedvalue}][&v={apiVersion}]>

you will retrieve the count of all the entities of "entityname" type filtered by the filtervalue

#### Parameters

##### Filter

Most of the time, when calling a get method,you will be able to give a filter parameter. This filter will be applied to the entities returned by the method. It will be combined with an internal filter that ensure that you will receive only the entities you have access to.

According to the method, if no filter is passed, either all the entities are returned (for instance the GetLanguages method returns all the languages) or none is returned.

For some entities, when a get method returns more than 200 entities, only the 200 first entities are returned.

Filters are applied from the properties of the entity. You can put a complex path and applied several operators:

* **Filter.Or**: Apply a "Or" to two filters
* **Filter.And**:  Apply a "And" totwo filters
* **Filter.Between**: is a property is between two values
* **Filter.Contains**: does a property contains a string value
* **Filter.Eq**: is a property equal to a value
* **Filter.Ge**: is a property greater or equal to a value
* **Filter.Gt**: is a property greater than a value
* **Filter.In**: is a property equals to a value of a list of values
* **Filter.isFalse**: Filter to use on boolean property. Check if the property equals to false
* **Filter.IsNotNull**: is a property has not null
* **Filter.IsNull**: is a property null
* **Filter.IsTrue**: Filter to use on boolean property. Check if the property equals to true
* **Filter.Le**: is a property less or equal to a value
* **Filter Lt**: return is a property less than a value
* **Filter.Not**: apply a Not to a filter
* **Filter.NotEq**: is a property not equal to a value
* **Filter.StartsWith**:  Does a property starts with a string value
* **Filter.Exists**: Make an exists filter, to get only entities regarding the values of an inner collection

Ex:

* on the Project entity: Filter.Eq(Id, 43c35a53-d225-4578-bc25-d1f8627fa23d).
* advanced filter: Filter.Or(Filter.Eq(Id, 43c35a53-d225-4578-bc25-d1f8627fa23d), Filter.Eq(Id, 87c52a98-d123-7654-ab56-f1f8965fa44e))
* advanced filter: Filter.In(Country.Iso2,'BE','IT')

_**Note**: All the filters are always allowed. This is general rule but it can will be limited according to the context._

##### PathToLoad

When you get entities, only properties of simple type will be loaded. To load properties of entity type or collection of entities, you need to specify which of them you want to load by using this parameter.

By default, if the PathToLoad parameter is missing, no child entity will be loaded.

It is important to pay attention to the fact that, if a property of an entity is a collection of child entities, only the 200 first items of this collection will be returned.

Example of PathToLoad value for the Project entity: "Country,Cells.SubCells,Folders.Children.Children"

Be careful, using too deep PathToLoad values can imply that a lot of data is return especially if the PathToLoad value contains children that are collections.

_**Note**: Note all the PathToLoad are always allowed. This is general rule but it can will be limited according to the context._

###### Onlypathtoloaddata

When requesting a list of entities, you can specify to load related object but if you want to load only some specific property of the linked entity, you need to put the parameter "onlypathtoloaddata" to true. In that case, it means that the pathToLoad must contains only full path of standard properties (no properties of entity type).

If this parameter = true then, PathToLoad cannot be something like "Note.From, Note.Comments" but need to be something like "Note.From.Id,Note.Comments.Comment"

##### SortOrder

When requesting a list of entities, a default sort order is applied. Nevertheless, it is sometimes possible to choose between several predefined sort orders by passing the name of the sort order as parameter.

For instance, when retrieving a list of notes (points), you can choose between the following predefined sort orders: "date", "duedate", "meetingduedate", "issuetype", "meetingissuetype", "cell", "meetingcell", "status", "meetingstatus", "codenum"

##### isloadfkidproperty

This parameter is necessary to get all Foreign Key id of data not loaded. For example, there is the entity with "Note" with linked entity "Project" (Note.Project). If you want to get the entity Note and Project is not specified in the pathtoload then, it is necessary at least to fill the property Id then, to have Note.Project.Id with the good value. In the case of Project was loaded then, it will be necessary to fill all FK of the related entity of the project.

#### Get Sync method

To work with the API in disconnected mode, we need to have the possibility to get data with differential GET. To make this kind of GET on a specific entity, you need to call the api with the following url "/rest/[entityName]sync". The kind of method exists for the following entities

EntityName | Url | Remarks | Related entities automatically loaded
- |- |- |- 
AccessRight | /rest/accessrightsync | returns MeetingAccessRight and ProjectAccessRight entities | |
Chapter | /rest/chaptersync |  |
CompanyUser | /rest/companyusersync |  |
ContactDetails | /rest/contactdetailssync |  |
Document | /rest/attachmentdocumentsync | returns the Document visible through points and meeting attachments. | Page, Version
Document | /rest/folderdocumentsync | returns the Document visible through the folders in the Documents module. | Page, Version
Folder | /rest/foldersync |  | FolderVisibility
IssueType | /rest/issuetypesync |  | IssueTypeNoteSubject
License | /rest/licensesync |  | LicensePackage
Module | /rest/modulesync |  |
Note | /rest/notesync |  | NoteComment, NoteDocument, Drawing, NoteInCharge, ProcessStatusHistory
Form | /rest/formsync |  | FormSection, FormItem, NoteComment, NoteDocument, Drawing, NoteInCharge, ProcessStatusHistory
NoteProjectStatus | /rest/noteprojectstatussync |  |
Package | /rest/packagesync |  | PackageModule
ParentCell | /rest/parentcellsync |  |
Project | /rest/projectsync |  | ProjectVisibility
ReportColumnDefBase | /rest/reportcolumndefbasesync | returns ReportColumnDefNote and ReportColumnDefParticipant entities. |
ReportConfigBase | /rest/reportconfigbasesync | returns ProjectReportTemplate and MeetingReportTemplate entities. | ReportNoteColumn, ReportLogo, ReportGroupAndSort, ReportParticipantColumn
ReportRequest | /rest/reportrequestsync |  |
SubCell | /rest/subcellsync |  |
User | /rest/usersync |  |

Additional possible parameters on the query string are:

* **timestamp**: the timestamp returned by a prior request to get the newer data (new / modified)
* **requestedBlockSize**: allows to specify the nbr of records returned in 1 call (10 - 200), defaults to 20 or 100 depending of rest entity.

The HTTP headers of the response contains a header "SyncTimestamp" with the timestamp for returned batch (ex "2015-03-20T09:20:27.810Z")

The "sync" requests always return the main entity and child entities (no need to give a path to load)

### Post & Put

Those methods are used to create or update entities. To make those kind of operations, you just need to use this pattern of url

<https://app.aproplan.com/rest/entityname?t={mytoken}&v={apiVersion}>

* **entityname**: this is the entity you want to create/update (in plurals, eg: document -> rest/documentsids).
* **pathtoload**: The PathToLoad parameter can be used the same way as for the GET methods. If it is used, the entities saved will be reloaded as well as the sub-entities of the PathToLoad before to be returned.

#### Post

Used to create entities. The body needs to contain json array of the entities to create. You can create at the same time nested entities.

_If the Id of the entity to create is not supplied, it will be generated by the system._

The method will return the list of entities created.

#### Put

Used to update entities. The body needs to contain json array of the entities to update. 
Mandatory properties:

* **Id**: to know which entity to update
* **EntityVersion**: the value of the EntityVersion you have of the entity to update. Then, the system will make a check to know if the entity in the system is at the same version of yours. If not, an error will be thrown.

##### Children update

When you update a list of entities and their children, the API do it in a way that does not delete and recreated moved children.

This can be demonstrated using Chapter entities (parent entities) and IssueType entities (children).

For instance, here is an example of update that does not imply the move of the children:

> You call the method passing Chapter C that contains IssueTypes IT1, IT2 and IT3. On the database, Chapter C contains IssueTypes IT2, IT3 and IT4. After you have called the method, IT1 will have been added to Chapter C, the value of IT2 and IT3 will have been updated and IT4 will have been deleted.

In the same way, here is an example that implies the move of some children:
> You call the method passing Chapter C1 that contains IT1 and Chapter C2 that contains IT2 and that on the database Chapter C1 that contains IT2 and Chapter C2 that contains IT1. After you have called the method, IT1 will have been moved to Chapter C1 and IT2 will have been moved to Chapter C2. IT1 and IT2 do not have been deleted and recreated. They have been moved from one chapter to the other.

### Delete method

The standard way to delete entieties is to generate a delete request at the following url:

https://app.aproplan.com/entityname?t={mytoken}&requesterid={myrequestervalue}&v={apiVersion}

The content of the request must contain the list of the ids of the entities to delete.

* **entityname**: this is the entity you want to delete (in plurals, eg: document -> rest/documentsids).

### Downloading tiles

You can download document tiles and thumbnails (smallthumb and bigthumb) in batch using the /rest/tiles method.

The /rest/tiles method is available using GET and POST http verbs

The method can be used in 2 modes:

Download a list of tiles and thumbnails belonging to a specific document (specific page of a specific version of a document) using the tilesPath and tiles parameters where:
tilesPath is the TilesPath property of the document.
tiles is a comma-separated list of short names of tiles (tiles short names having a syntax of "\<zoomLevel\>-\<columnIndex\>-\<rowIndex\>"; like "0-0-0", "0-1-0", ...) or thumbnails (as "smallthumb" or "bigthumb") without the ".jpg" extension.

Download a list of tiles and thumbnails of various documents by providing their full paths using the fullTilesPath parameter:
fullTilesPath is a comma-separated list of full paths to tiles and/or thumbnails, where the full path to a file is composed of the TilesPath of the document + the name of the tile/thumbnail with the ".jpg" extension.

**Response**

The method returns a ZIP archive containing the requested tiles/thumbnails as the content of the response to the http request.
Inside the ZIP archive the paths of the zipped files matches the paths to the requested tiles/thumbnails (therefore matching the storage structure at server-side as defined by the TilesPath of the documents).
If some of the requested files are not available (due to a missing file at server-side, or an invalid parameter in the call to the method) the returned ZIP will contain only the available files.

#### GET

With GET you pass the parameters on the url. This means the number of tiles or thumbnails you can request in 1 call will be limited by the max url length of the client platform (in iOS max url length seems to be 2 KB) or the server (in IIS max url length is 4KB). 

#### POST

With POST the parameters are passed inside the body of the request using the same syntax as the /rest/posttoget method (JSON message with 2 properties EntityAction and Params, EntityAction being equal to "tiles" and Params to the parameters string as it passed on the url using the GET with the usual alias, pass, requesterId and v parameters, and the other parameters specific to this method).

