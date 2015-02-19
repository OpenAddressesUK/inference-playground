#inference-playground

##How does it work?
Why would you need a README.md for something this simple? ;-) Download the CSV edition of Open Addresses dataset and look for the Shetlands (ZE) and the town of Lerwick. Take the street named Fogralea, in Sound: on the outskirts to the south-west of the town. The last time I checked it looked like this:

![Doesn't this say it all?](docs/doesnt-this-say-it-all.png)

The script infers, starting from the two known house numbers 5 and 30, all the presumably existing house numbers between them, shown in the two orange stripes. Easy, isn't it? (I'm making it easy for comic effect, I know it's more complicated than that. How to tell where the red 'X' is for example? Which of the houses was given a name rather than a number?).

To say it all, the script does the same for all postcode areas. The algorithm being used is OA's upcoming first, relatively conservative address inference algorithm. The objective is to check the volume of addresses that can be generated before proceeding to proper implementation and integration in the live solution.

See the sample output [here](sample-output.txt). It shows the postcode sector file I start from, the no. of known addresses, the no. of inferred addresses and the increase %.

If you want to understand what we mean by inferring addresses, read [@giacecco](https://twitter.com/giacecco)'s blog post [here](https://openaddressesuk.org/blog/2015/02/12/inference). Alternatively, bite straight into the pseudocode algorithm [here](https://github.com/theodi/shared/issues/504#issuecomment-72818881).

Open Addresses UK is not just about the team working at OA HQ: [we're looking for partners](https://openaddressesuk.org/blog/2015/01/22/crowdsourcing-challenge) and [contributors](https://openaddressesuk.org/about/addingdata), [our source code is open](https://github.com/openaddressesuk), [our planning is in the open](https://huboard.com/OpenAddressesUK/roadmap/). Perhaps you could write the next inference algorithm, or develop a surveying tool that volunteers can use to tell us if those inferred addresses actually exist or not. Follow us on Twitter at [@OpenAddressesUK](https://twitter.com/openaddressesuk) and keep in touch!

##Licence
This code is open source under the MIT license. See the [LICENSE](LICENCE) file for full details.
