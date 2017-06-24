library(jsonlite)

nfa_url <- ("https://satis.ncdr.nat.gov.tw/kml/getEMIC.ashx?Dday=7")

nfa_data <- fromJSON(nfa_url) 

write.csv(nfa_data, file = "nfa_data.csv", row.names = FALSE)
