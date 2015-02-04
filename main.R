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
    data <- data[!is.na(data$house.number), ]    
    # I search for streets for which I have more than one address within the 
    # same postcode and some gap between the smallest and largest house numbers.
    # If all house numbers are odd or even, I can infer the missing odd and even
    # numbers, respectively. If a few house numbers are odd and a few are even, 
    # I can infer all missing house numbers.
    s <- data %>% group_by(postcode.name, street.name) %>% summarise (all_even = sum(house.number %% 2) == 0, all_odd = sum(house.number %% 2) == length(house.number), min_house.number = min(house.number), max_house.number = max(house.number), no.of.inferable = length(setdiff(seq(min(house.number), max(house.number), by = ifelse((sum(house.number %% 2) == 0) || (sum(house.number %% 2) == length(house.number)), 2, 1)), house.number)), gap = max(house.number) - min(house.number) - 1) %>% filter(gap > 1)
    cat(paste0(sum(s$no.of.inferable), " new addresses can be inferred.\n"))
    return(s)
}

# to run this script, unzip the data only, split by postcode sector version
# of Open Addresses UK's data in the 'data' folder
postcode.sectors <- list.files(path = "data/", pattern = ".csv$", full.names = TRUE, ignore.case = TRUE)
sum(sapply(postcode.sectors, function (x) { return(sum(how.many.inferable(x)$no.of.inferable)) }))