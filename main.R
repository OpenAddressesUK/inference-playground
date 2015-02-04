# This script calculates how many addresses can be inferred from Open Addresses
# UK's dataset by using simple, house number-based inference.
#
# The algorithm we plan to use for inference generates all possible house
# numbers for knowns streets, based on the following assumptions:
# a) If two addresses belong to the same street and postcode, all other
#    house numbers betweeen those addresses' house numbers belong to the same
#    street and postcode, too.
# b) If all known house numbers in the same street and postcode are even, it is
#    likely that most of the missing even numbers between the min and max of the
#    known house numbers exist, too.
# c) As for (b) but for odd numbers.
# d) If both odd and even numbers can be found within the known house numbers in
#    the same street and postcode, it is likely that most of the missing numbers
#    between the the min and max of the known house numbers exist, too.
#
# To run this script, unzip the data only, split by postcode sector version
# of Open Addresses UK's data in the 'data' folder.

library(dplyr)

how.many.inferable <- function (sector.file) {
    data <- read.csv(sector.file, stringsAsFactors=FALSE)
    cat(paste0("Sector ", sector.file, " has ", nrow(data), " addresses. "))
    # I drop the addresses where neither of the Primary Addressable Objects
    # (PAO) and Secondary Addressable Objects (SAO) can be interpreted as
    # numbers
    data$pao <- as.integer(data$pao)
    data$sao <- as.integer(data$sao)
    data$house.number <- ifelse(!is.na(data$pao), data$pao, ifelse(!is.na(data$sao), data$sao, NA))
    data <- data[!is.na(data$house.number), c('postcode.name', 'street.name', 'house.number')]
    # the row below is ugly but works; note that:
    # - all(as.logical(house.number %% 2)) is TRUE if all house numbers are odd
    # - !any(as.logical(house.number %% 2)) is TRUE if all are even
    s <- data %>% group_by(postcode.name, street.name) %>% summarise (min_house.number = min(house.number), max_house.number = max(house.number), no.of.inferable = length(setdiff(seq(min(house.number), max(house.number), by = ifelse(!any(as.logical(house.number %% 2)) || all(as.logical(house.number %% 2)), 2, 1)), house.number)), gap = max(house.number) - min(house.number) - 1) %>% filter(gap > 1)
    cat(paste0(sum(s$no.of.inferable), " new addresses can be inferred.\n"))
    return(s)
}

postcode.sectors <- list.files(path = "data/", pattern = ".csv$", full.names = TRUE, ignore.case = TRUE)
cat(paste0("The total number of inferred addresses is ", sum(sapply(postcode.sectors, function (x) { return(sum(how.many.inferable(x)$no.of.inferable)) })), "\n"))
