    $(function() {　
        $(window).load(function() {　　
            $(window).bind('scroll resize', function() {　　
                var $this = $(this);　　
                var $this_Top = $this.scrollTop();　　
                //當高度小於100時，關閉區塊
                　　
                if ($this_Top < 80) {　　　
                    $('#top-bar').stop().animate({
                        top: "0px"
                    });　　　
                }　　　　
                if ($this_Top > 80) {　　　　
                    $('#top-bar').stop().animate({
                        top: "0px"
                    });　　　
                }　　
            }).scroll();　
        });
    });

    $(function() {
        $("#gotop").click(function() {
            jQuery("html,body").animate({
                scrollTop: 0
            }, 1000);
        });
        $(window).scroll(function() {
            if ($(this).scrollTop() > 300) {
                $('#gotop').fadeIn("fast");
            } else {
                $('#gotop').stop().fadeOut("fast");
            }
        });
    });
    $(document).ready(function() {
        draw()
    });

    function draw() {

        var csv = d3.dsv(",", "text/csv;charset=big5");
        csv("nfa_data.csv", function(data) {

            var timeAllparse = d3.time.format("%Y-%m-%dT%H:%M:%S").parse,
                dateformat = d3.time.format("%Y/%m/%d"),
                timeformat = d3.time.format("%H:%M");


            data.forEach(function(d) {
                d.parseTime = timeAllparse(d.CaseDT);
                d.date = dateformat(d.parseTime);
                d.tt = timeformat(d.parseTime);
                d.geo1 = d.WGS84_lat + "," + d.WGS84_lon;
                if (d.DisasterMainType == "廣告招牌災情" || d.DisasterMainType == "建物毀損" || d.DisasterMainType == "車輛及交通事故" || d.DisasterMainType == "環境污染" || d.DisasterMainType == "火災") {
                    d.DisasterMainType = "其他災情";
                }

                var distype = d["DisasterMainType"];
                var debris = 0,
                    flood = 0,
                    tree = 0,
                    ad = 0;
                var caracci = 0,
                    environment = 0,
                    fire = 0;
                var building = 0,
                    hydraulic = 0,
                    other = 0;
                var road = 0,
                    bridge = 0,
                    train_hsr_mrt = 0,
                    infrastructure = 0;
                if (distype.indexOf("土石災情") > -1) {
                    debris = debris + 1;
                }
                if (distype.indexOf("積淹水災情") > -1) {
                    flood = flood + 1;
                }
                if (distype.indexOf("路樹災情") > -1) {
                    tree = tree + 1;
                }
                if (distype.indexOf("廣告招牌災情") > -1) {
                    other = other + 1;
                    //ad = ad + 1;
                }
                if (distype.indexOf("其他災情") > -1) {
                    other = other + 1;
                }
                if (distype.indexOf("道路、隧道災情") > -1) {
                    road = road + 1;
                }
                if (distype.indexOf("橋梁災情") > -1) {
                    bridge = bridge + 1;
                }
                if (distype.indexOf("鐵路、高鐵及捷運災情") > -1) {
                    train_hsr_mrt = train_hsr_mrt + 1;
                }
                if (distype.indexOf("建物毀損") > -1) {
                    other = other + 1;
                    //building = building + 1;
                }
                if (distype.indexOf("水利設施災害") > -1) {
                    hydraulic = hydraulic + 1;
                }
                if (distype.indexOf("車輛及交通事故") > -1) {
                    other = other + 1;
                    //caracci = caracci + 1;
                }
                if (distype.indexOf("環境污染") > -1) {
                    other = other + 1;
                    //environment = environment + 1;
                }
                if (distype.indexOf("火災") > -1) {
                    other = other + 1;
                    //fire = fire + 1;
                }
                if (distype.indexOf("民生、基礎設施災情") > -1) {
                    infrastructure = infrastructure + 1;
                }
                d.debris1 = debris;
                d.flood1 = flood;
                d.tree1 = tree;
                d.ad1 = ad;
                d.other1 = other;

                d.caracci1 = caracci;
                d.environment1 = environment;
                d.fire1 = fire;
                d.building1 = building;
                d.hydraulic1 = hydraulic;

                d.road1 = road;
                d.bridge1 = bridge;
                d.train_hsr_mrt1 = train_hsr_mrt;
                d.infrastructure1 = infrastructure;
                d.newDisType = d.debris1 + d.flood1 + d.tree1 + d.other1 + d.hydraulic1 + d.road1 + d.bridge1 + d.train_hsr_mrt1 + d.infrastructure1;

            });

            var ndx = crossfilter(data);
            var ndxGroupAll = ndx.groupAll();

            var geo1Dim = ndx.dimension(function(d) {
                return d["geo1"];
            });

            var geo1Group = geo1Dim.group().reduceCount();

            var markerGroup = geo1Dim.group().reduce(
                function(p, v) { // add
                    p.CaseDescription = v.CaseDescription;
                    ++p.count;
                    return p;
                },
                function(p, v) { // remove
                    --p.count;
                    return p;
                },
                function() { // init
                    return { count: 0 };
                }

            );

            var countyDim = ndx.dimension(function(d) {
                return d["CityName"];
            });
            var townDim = ndx.dimension(function(d) {
                return d["TownName"];
            });
            var townDisastersGroup = townDim.group().reduceCount(function(d) {
                return d["DisasterMainType"];
            });
            var countyDisastersGroup = countyDim.group().reduceCount(function(d) {
                return d["DisasterMainType"];
            });
            var townIdDim = ndx.dimension(function(d) {
                return d["DisasterMainType"];
            });

            var timedim = ndx.dimension(function(d) {
                return d.parseTime;
            });
            var hourdim = ndx.dimension(function(d) {
                return d3.time.hour(d.parseTime);
            });
            var minTime = timedim.bottom(1)[0].parseTime;
            var maxTime = timedim.top(1)[0].parseTime;

            var disastertype = ndx.dimension(function(d) {
                return d["DisasterMainType"];
            });
            var disastertypesGroup = disastertype.group().reduceCount();
            var debrisGroup = hourdim.group().reduceSum(function(d) {
                return d.debris1;
            });
            var floodGroup = hourdim.group().reduceSum(function(d) {
                return d.flood1;
            });
            var treeGroup = hourdim.group().reduceSum(function(d) {
                return d.tree1;
            });
            var adGroup = hourdim.group().reduceSum(function(d) {
                return d.ad1;
            });
            var otherGroup = hourdim.group().reduceSum(function(d) {
                return d.other1;
            });

            var caracciGroup = hourdim.group().reduceSum(function(d) {
                return d.caracci1;
            });
            var environmentGroup = hourdim.group().reduceSum(function(d) {
                return d.environment1;
            });
            var fireGroup = hourdim.group().reduceSum(function(d) {
                return d.fire1;
            });
            var buildingGroup = hourdim.group().reduceSum(function(d) {
                return d.building1;
            });
            var hydraulicGroup = hourdim.group().reduceSum(function(d) {
                return d.hydraulic1;
            });

            var roadGroup = hourdim.group().reduceSum(function(d) {
                return d.road1;
            });
            var bridgeGroup = hourdim.group().reduceSum(function(d) {
                return d.bridge1;
            });
            var train_hsr_mrtGroup = hourdim.group().reduceSum(function(d) {
                return d.train_hsr_mrt1;
            });
            var infrastructureGroup = hourdim.group().reduceSum(function(d) {
                return d.infrastructure1;
            });

            var colorScale = d3.scale.ordinal()
                .domain(["土石災情", "其他災情", "積淹水災情", "路樹災情", "道路、隧道災情", "橋梁災情", "鐵路、高鐵及捷運災情", "水利設施災害", "民生、基礎設施災情"])
                .range(["#cbbeb5", "#4b86b4", "#fe5757", "#ffbe4f", "#0ea7b5", "#85bdde", "#9e9e9e", "#63ace5", "#6bd2db"]);

            // var countycolor = d3.scale.ordinal().range(["#08589e", "#2b8cbe", "#4eb3d3", "#7bccc4", "#a8ddb5", "#ccebc5"]);
            var countycolor = d3.scale.ordinal().range(["#4eb3d3"]);

            //cluster map - leaflet
            var MKmarker = dc_leaflet.markerChart("#map")
                .dimension(geo1Dim)
                .group(markerGroup)
                .width(370)
                .height(435)
                .center([23.5, 121])
                .zoom(7)
                .cluster(true)
                .valueAccessor(function(kv) {
                    return kv.value.count;
                })
                .locationAccessor(function(kv) {
                    return kv.key;
                })
                .popup(function(kv) {
                    return kv.value.CaseDescription;
                })
                .filterByArea(true);

            //disaster type pie chart
            var pie = dc.pieChart("#dis_pie")
                .dimension(disastertype)
                .group(disastertypesGroup)
                .colors(function(DisasterMainType) {
                    return colorScale(DisasterMainType);
                })
                .width(200)
                .height(200)
                .renderLabel(true)
                .renderTitle(true)
                .cap(7)
                .ordering(function(d) {
                    return disastertypesGroup;
                });

            //county row chart
            var countyRowChart = dc.rowChart("#chart-row-county")
                .width(380)
                .height(220)
                .margins({
                    top: 20,
                    left: 65,
                    right: 0,
                    bottom: 20
                })
                .dimension(countyDim)
                .group(countyDisastersGroup, "Disasters")
                .labelOffsetX(-45)
                .colors(function(countyDim) {
                    return countycolor(countyDim);
                })
                .elasticX(true)
                .controlsUseVisibility(true)
                .ordering(function(d) {
                    return -d.value;
                })
                .title(function(d) {
                    return d.value;
                })
                .rowsCap(5);

            //filter and total count number
            var filterCount = dc.dataCount('.filter-count')
                .dimension(ndx)
                .group(ndxGroupAll)
                .html({
                    some: '%filter-count'
                });

            var totalCount = dc.dataCount('.total-count')
                .dimension(ndx)
                .group(ndxGroupAll)
                .html({
                    some: '/%total-count'
                });


            var timechart = dc.barChart("#dis_time")
                .width(770)
                .height(250)
                .transitionDuration(500)
                .margins({ top: 17, right: 0, bottom: 47, left: 55 })
                .dimension(hourdim)
                .group(otherGroup, "其他災情")
                .stack(debrisGroup, "土石災情")
                .stack(floodGroup, "積淹水災情")
                .stack(treeGroup, "路樹災情")
                //.stack(adGroup, "廣告招牌災情")
                .stack(roadGroup, "道路、隧道災情")
                .stack(bridgeGroup, "橋梁災情")
                .stack(train_hsr_mrtGroup, "鐵路、高鐵及捷運災情")
                //.stack(buildingGroup, "建物毀損")
                .stack(hydraulicGroup, "水利設施災害")
                .stack(infrastructureGroup, "民生、基礎設施災情")
                //.stack(caracciGroup, "車輛及交通事故")
                //.stack(environmentGroup, "環境污染")
                //.stack(fireGroup, "火災")
                .colors(function(DisasterMainType) {
                    return colorScale(DisasterMainType);
                })
                .elasticY(true)
                .renderHorizontalGridLines(true)
                .mouseZoomable(false)
                .x(d3.time.scale().domain([minTime, maxTime]))
                .xAxisLabel("Date")
                .centerBar(true)
                .xUnits(function(d) {
                    return 100
                })
                .brushOn(true)
                .xAxis().tickFormat(d3.time.format('%m/%d %H:%M'));

            // data table
            // var dataTable = dc.dataTable('#dc-table-graph')
            //     .width(680)
            //     .dimension(townIdDim)  
            //     .group(function(d) {
            //         return d.date; })
            //     .size(Infinity)
            //     .columns([
            //         function(d) {
            //             return d.CityName; },
            //         function(d) {
            //             return d.TownName; },
            //         function(d) {
            //             return d.date; },
            //         function(d) {
            //             return d.tt; },
            //         function(d) {
            //             return d.DisasterMainType; },
            //         function(d) {
            //             return d.DisasterSubType; },
            //         function(d) {
            //             return d.CaseDescription; },
            //     ])
            //     .sortBy(function(d) {
            //         return d.parseTime;
            //     })
            //     .order(d3.ascending);

            var datatable = $("#dc-table-graph").DataTable({
                data: data,
                "retrieve": true,
                "bPaginate": true,
                "bSort": true,
                "deferRender": true,
                "scrollY": 300,
                "scrollCollapse": true,
                "scroller": true,
                "columnDefs": [{
                        targets: 0,
                        data: function(d) {
                            return d.CityName;
                        },
                    }, {
                        targets: 1,
                        data: function(d) {
                            return d.TownName;
                        },
                    }, {
                        targets: 2,
                        data: function(d) {
                            return d.date;
                        },
                        type: 'date',
                    }, {
                        targets: 3,
                        data: function(d) {

                            return d.tt;
                        },
                    }, {
                        targets: 4,
                        data: function(d) {
                            return d.DisasterMainType;
                        },
                    }, {
                        targets: 5,
                        data: function(d) {

                            return d.DisasterSubType;
                        },
                    }, {
                        targets: 6,
                        data: function(d) {
                            return d.CaseDescription;
                        },
                    }

                ]
            });

            function RefreshTable() {
                dc.events.trigger(function() {
                    alldata = townDim.top(Infinity);
                    datatable.clear();
                    datatable.rows.add(alldata);
                    datatable.draw();
                });
            }

            for (var i = 0; i < dc.chartRegistry.list().length; i++) {
                var chartI = dc.chartRegistry.list()[i];
                chartI.on("filtered", RefreshTable);
            }
            RefreshTable();
            dc.renderAll();
        });
    }
