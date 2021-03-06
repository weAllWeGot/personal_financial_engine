/*global WildRydes _config AmazonCognitoIdentity AWSCognito*/

var WildRydes = window.WildRydes || {};



(function rideScopeWrapper($) {
    var authToken;
    WildRydes.authToken
        .then(function setAuthToken(token) {
            if (token) {
                authToken = token;
            } else {
                window.location.href = "/signin.html";
            }
        })
        .catch(function handleTokenError(error) {
            // take user back to signin if token is not handled
            alert(error);
            window.location.href = "/signin.html";
        });

    var colnames = [
        "AccountName",
        "Balance",
        "Type",
        "PayoffDay",
        "PayoffSource",
        "CreditLimit"
    ];

    var actions = $("table td:last-child").html();

    // todo: share functions w/ budget
    function requestAccountInfo() {
        $.ajax({
            method: "POST",
            url: _config.api.invokeUrl + "/budget-handling",
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                RetrieveOrPlace: "retrieve",
                Entity: "account"
            }),
            contentType: "application/json",
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error(
                    "Error requesting ride: ",
                    textStatus,
                    ", Details: ",
                    errorThrown
                );
                console.error("Response: ", jqXHR.responseText);
                alert(
                    "An error occured when requesting your money trend:\n" +
                        jqXHR.responseText
                );
            }
        });
    }

    // complete the request by taking the timeseries data returned and using it to populate the timeseries plot
    function completeRequest(result) {
        console.log("Response received from API: ", result);
        for (idx in result) {
            var row = result[idx];
            addNewRow(row);
        }
        $(".sample").remove()
    }


    function placeAccountInfo() {
        $.ajax({
            method: "POST",
            url: _config.api.invokeUrl + "/budget-handling",
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                RetrieveOrPlace: "place",
                Entity: "account",
                AccountData: retrieveTableData()
            }),
            contentType: "application/json",
            success: completePostDataRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error(
                    "Error requesting ride: ",
                    textStatus,
                    ", Details: ",
                    errorThrown
                );
                console.error("Response: ", jqXHR.responseText);
                alert(
                    "An error occured when requesting your money trend:\n" +
                        jqXHR.responseText
                );
            }
        });
    }

    function retrieveTableData(event, colnames){

        //gets table
        var oTable = document.getElementsByClassName('table-bordered')[0];

        //gets rows of table
        var numRows = oTable.rows.length;

        var dictArray = [];

        //loops through rows (minus last ones with the button in it & start at 1 to not include the headers)
        for (i = 1; i < numRows - 2 ; i++){

          //gets cells of current row
           var oCells = oTable.rows.item(i).cells;

           //loops through each cell in current row
           // this should line up with colnames
           var dataObj = {};
           for(var j = 0; j < colnames.length; j++){

                  // get your cell info here

                  var cellVal = oCells.item(j).innerHTML;
                  dataObj[colnames[j]] = cellVal;

               }
            dictArray.push(dataObj);
        }

        return dictArray

    }

    // complete the request by taking the timeseries data returned and using it to populate the timeseries plot
    function completePostDataRequest(result) {
        console.log("Response received from API: ", result);

    }

    function addNewRow(row, colnames) {
        var actions = $("table td:last-child").html();
        var index = $("table tbody tr:last-child").index();
        var rowHTML = "<tr>";
        for (idx in colnames) {
            var colname = colnames[idx];
            rowHTML += `<td>${row[colname]}</td>`;
        }

        rowHTML += `<td>${actions}</td>`;
        rowHTML += "</tr>";

        $("table").append(rowHTML);
        $("table tbody tr")
            .eq(index + 1)
            .find(".add, .edit");
        // $('[data-toggle="tooltip"]').tooltip();
    }


    $(document).ready(function() {
        // $('[data-toggle="tooltip"]').tooltip();
        var actions = $("table td:last-child").html();

        requestAccountInfo();

        $('#submit-bank-info').click(placeAccountInfo);

        // Append table with add row form on add new button click
        $(".add-new").click(function() {
            $(this).attr("disabled", "disabled");
            var index = $("table tbody tr:last-child").index();
            var row_html = "<tr>";
            for (idx in colnames) {
                row_html += `<td><input type="text" class="form-control" name="${
                    colnames[idx]
                }" id="${colnames[idx]}"</td>`;
            }

            row_html += `<td>${actions}</td>`;
            row_html += "</tr>";

            $("table").append(row_html);
            $("table tbody tr")
                .eq(index + 1)
                .find(".add, .edit")
                .toggle();
            //$('[data-toggle="tooltip"]').tooltip();
        });

        // Add row on add button click
        $(document).on("click", ".add", function() {
            var empty = false;
            var input = $(this)
                .parents("tr")
                .find('input[type="text"]');
            input.each(function() {
                if (!$(this).val()) {
                    $(this).addClass("error");
                    empty = true;
                } else {
                    $(this).removeClass("error");
                }
            });
            $(this)
                .parents("tr")
                .find(".error")
                .first()
                .focus();
            if (!empty) {
                input.each(function() {
                    $(this)
                        .parent("td")
                        .html($(this).val());
                });
                $(this)
                    .parents("tr")
                    .find(".add, .edit")
                    .toggle();
                $(".add-new").removeAttr("disabled");
            }
        });

        // Edit row on edit button click
        $(document).on("click", ".edit", function() {
            $(this)
                .parents("tr")
                .find("td:not(:last-child)")
                .each(function() {
                    $(this).html(
                        '<input type="text" class="form-control" value="' +
                            $(this).text() +
                            '">'
                    );
                });
            $(this)
                .parents("tr")
                .find(".add, .edit")
                .toggle();
            $(".add-new").attr("disabled", "disabled");
        });

        // Delete row on delete button click
        $(document).on("click", ".delete", function() {
            $(this)
                .parents("tr")
                .remove();
            $(".add-new").removeAttr("disabled");
        });
    });
})(jQuery);
